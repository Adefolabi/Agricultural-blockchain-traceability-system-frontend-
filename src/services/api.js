/**
 * API service — connects to the AgriTrace Express backend.
 *
 * Base URL:
 *   Development  → '' (same origin, forwarded by the Vite dev proxy)
 *   Production   → VITE_API_URL env var (e.g. https://api.agritrace.com)
 *
 * Auth storage:
 *   agri_token  — raw JWT string
 *   agri_user   — JSON-stringified user profile { id, name, email, org, role }
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// ─── Internal helpers ────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem('agri_token');

/**
 * Core fetch wrapper. Attaches Authorization header when a token is stored,
 * sets Content-Type for requests that carry a body, and normalises errors into
 * thrown Error objects so all callers can use a single try/catch pattern.
 */
const request = async (path, options = {}) => {
  const token = getToken();
  const headers = {};

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
  } catch {
    throw new Error('Unable to reach the server. Check your connection.');
  }

  // Parse response — backend always returns JSON
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Unexpected response from server (status ${res.status}).`);
  }

  if (!res.ok) {
    // Token rejected — clear local auth state so ProtectedRoute redirects
    if (res.status === 401) {
      localStorage.removeItem('agri_token');
      localStorage.removeItem('agri_user');
    }
    const err = new Error(data.error || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.details = data.details ?? null;
    throw err;
  }

  return data;
};

// ─── Public API ──────────────────────────────────────────────────────────────

export const api = {
  /**
   * Authenticate with email + password.
   * Stores the returned JWT and user profile in localStorage.
   * Returns the user profile object on success.
   */
  login: async (email, password) => {
    const data = await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('agri_token', data.token);
    localStorage.setItem('agri_user', JSON.stringify(data.user));
    return data.user;
  },

  /** Remove stored credentials. */
  logout: () => {
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
  },

  /**
   * Return the stored user profile, or null if unauthenticated / token expired.
   * Proactively clears storage when the JWT's exp claim has passed so
   * ProtectedRoute immediately redirects without waiting for a 401.
   */
  getCurrentUser: () => {
    try {
      const token = localStorage.getItem('agri_token');
      const user = localStorage.getItem('agri_user');
      if (!token || !user) return null;

      // Decode JWT payload (base64url) to check expiry — no signature verify needed here
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('agri_token');
        localStorage.removeItem('agri_user');
        return null;
      }

      return JSON.parse(user);
    } catch {
      localStorage.removeItem('agri_token');
      localStorage.removeItem('agri_user');
      return null;
    }
  },

  /**
   * Public provenance lookup — no auth required.
   * Maps to GET /api/verify/:batchId (VerifyProvenance chaincode).
   */
  getBatch: async (batchId) => {
    return request(`/api/verify/${encodeURIComponent(batchId)}`);
  },

  /**
   * List all batches owned by the authenticated user's org.
   * Maps to GET /api/batches (QueryBatchesByOwner chaincode).
   */
  getAllBatches: async () => {
    return request('/api/batches');
  },

  /**
   * Register a new produce batch on the ledger.
   * Maps to POST /api/batches (CreateBatch chaincode).
   * NOTE: requires a matching POST /api/batches endpoint on the backend.
   *
   * @param {{ produceType: string, origin: string, location: string, notes?: string }} payload
   */
  createBatch: async (payload) => {
    return request('/api/batches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Record an IoT sensor reading against a batch on the ledger.
   * Maps to POST /api/iot (RecordSensorData chaincode).
   *
   * @param {{ batchId, temp, humidity, location, timestamp, gps? }} payload
   */
  recordSensorData: async (payload) => {
    return request('/api/iot', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Transfer custody of a batch to a new owner org.
   * Maps to POST /api/transfer (TransferCustody chaincode).
   *
   * @param {{ batchId, newOwnerOrg, location, stage }} payload
   */
  transferCustody: async (payload) => {
    return request('/api/transfer', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
