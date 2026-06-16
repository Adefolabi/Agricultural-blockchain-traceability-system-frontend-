// Real API service — connects to the Node.js/Express backend.
// In development the Vite proxy forwards /api/* to localhost:3000, so BASE is empty.
// In production (Vercel) set VITE_API_BASE_URL to the backend's public URL so that
// fetch calls resolve to the correct host instead of the Vercel domain.
// All authenticated requests attach the JWT stored in localStorage.
// Data returned by the backend is normalised here into the shape used by UI
// components so that any future backend shape changes only need to be fixed once.

// Empty string in dev → relative paths handled by Vite proxy.
// Full URL in prod  → e.g. "https://agritrace-api.onrender.com"
const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// SECURITY NOTE: Storing JWTs in localStorage is convenient for a prototype
// but is susceptible to XSS attacks — any injected script can read them.
// For production, prefer HttpOnly cookies (set by the server) which are
// inaccessible to JavaScript entirely. Mitigate XSS risk here by keeping
// a strict Content-Security-Policy on the server response headers.
const TOKEN_KEY = 'agri_token';
const USER_KEY  = 'agri_user';

// ---------------------------------------------------------------------------
// Data normalisers
// ---------------------------------------------------------------------------

/**
 * Normalise a provenance object returned by GET /api/verify/:batchId.
 * Backend shape: { batchId, product, farm, location, compliant, lastUpdated, journey[] }
 */
function normaliseProvenance(p) {
  return {
    id:          p.batchId,
    batchId:     p.batchId,
    produceType: p.product,
    origin:      p.farm,
    location:    p.location,
    status:      p.compliant ? 'compliant' : 'risk',
    lastUpdate:  p.lastUpdated || null,
    journey:     Array.isArray(p.journey) ? p.journey : [],
  };
}

/**
 * Normalise a dashboard batch item returned by GET /api/batches.
 * Backend shape: { id, variety, farmId, quantity, status, stage, location,
 *                  owner, updatedAt, availableActions[] }
 */
function normaliseBatchSummary(b) {
  return {
    id:               b.id,
    batchId:          b.id,
    produceType:      b.variety,
    origin:           b.farmId,
    location:         b.location,
    status:           b.status,
    stage:            b.stage,
    quantity:         b.quantity,
    owner:            b.owner,
    lastUpdate:       b.updatedAt || null,
    availableActions: Array.isArray(b.availableActions) ? b.availableActions : [],
  };
}

// ---------------------------------------------------------------------------
// Error sanitiser
// ---------------------------------------------------------------------------

// Translate raw backend/infrastructure errors into user-friendly messages.
// Raw Node.js / Fabric errors should never reach end users.
function sanitiseError(message) {
  if (!message) return 'An unexpected error occurred. Please try again.';

  // Hyperledger Fabric peer / TLS not reachable or misconfigured
  if (
    message.includes('ENOENT') ||
    message.includes('.crt') ||
    message.includes('.pem') ||
    message.includes('ca.crt') ||
    message.includes('tls/') ||
    message.includes('peers/')
  ) {
    return 'Blockchain network is currently unavailable. Please ensure the Fabric network is running and try again.';
  }

  // gRPC / network-level failures
  if (
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND') ||
    message.includes('ETIMEDOUT') ||
    message.includes('connect EHOSTUNREACH') ||
    message.includes('connect ECONNRESET')
  ) {
    return 'Unable to reach the blockchain network. Please check your connection and try again.';
  }

  return message;
}

// ---------------------------------------------------------------------------
// Low-level fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Make an authenticated (or public) HTTP request through the Vite /api proxy.
 * Throws a descriptive Error on non-2xx responses.
 * Automatically clears the stored session and redirects to /login on 401.
 */
async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    // Bypass the ngrok browser-warning interstitial when the backend is
    // exposed via an ngrok tunnel (ignored by all other hosts).
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Parse the response body even on error so we can surface the server message.
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (res.status === 401) {
    // Token expired or invalid — clear local session and bounce to login.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const raw =
      data?.details?.[0]?.message ||
      data?.error ||
      data?.message ||
      `Request failed (HTTP ${res.status})`;
    throw new Error(sanitiseError(raw));
  }

  return data;
}

// ---------------------------------------------------------------------------
// Public API surface
// ---------------------------------------------------------------------------

export const api = {
  // ── Authentication ─────────────────────────────────────────────────────────

  /**
   * Authenticate against POST /api/login.
   * Stores the JWT and user object in localStorage on success.
   */
  login: async (email, password) => {
    const data = await request('/api/login', {
      method: 'POST',
      body:   JSON.stringify({ email, password }),
    });

    // Guard against backends that use a different key name for the token
    const token = data.token ?? data.accessToken ?? data.jwt ?? data.access_token;
    if (!token || typeof token !== 'string') {
      throw new Error('Login succeeded but no token was returned. Check the backend response.');
    }
    if (!data.user || typeof data.user !== 'object') {
      throw new Error('Login succeeded but no user object was returned. Check the backend response.');
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY,  JSON.stringify(data.user));
    return data.user;
  },

  /** Clear local session. */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /** Return the currently stored user object, or null if not logged in. */
  getCurrentUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  /** Return the stored JWT string, or null. */
  getToken: () => {
    const t = localStorage.getItem(TOKEN_KEY);
    // Treat the literal strings "undefined"/"null" as missing (can be stored by JS coercion)
    return (t && t !== 'undefined' && t !== 'null') ? t : null;
  },

  // ── Public verification (no auth required) ─────────────────────────────────

  /**
   * Fetch provenance for a single batch — calls the public
   * GET /api/verify/:batchId endpoint.
   */
  getBatch: async (batchId) => {
    const data = await request(`/api/verify/${encodeURIComponent(batchId)}`);
    if (data?.error) throw new Error(sanitiseError(data.error));
    return normaliseProvenance(data);
  },

  // ── Stakeholder endpoints (JWT required) ───────────────────────────────────

  /**
   * Fetch all batches owned by the authenticated user's organisation.
   * GET /api/batches
   */
  getAllBatches: async () => {
    const data = await request('/api/batches');

    // Unwrap common envelope shapes: bare array, { batches }, { data }
    const arr = Array.isArray(data)          ? data
              : Array.isArray(data?.batches) ? data.batches
              : Array.isArray(data?.data)    ? data.data
              : [];

    // Surface a soft-error returned with HTTP 200 (e.g. { error: "..." })
    if (arr.length === 0 && data?.error) {
      throw new Error(sanitiseError(data.error));
    }

    return arr.map(normaliseBatchSummary);
  },

  /**
   * Create a new produce batch on the ledger (farmer only).
   * POST /api/batches  { batchId, farmId, variety, quantity }
   */
  createBatch: async ({ batchId, farmId, variety, quantity }) => {
    const data = await request('/api/batches', {
      method: 'POST',
      body:   JSON.stringify({ batchId, farmId, variety, quantity }),
    });
    return data;
  },

  /**
   * Transfer custody of a batch to a new organisation.
   * POST /api/transfer  { batchId, newOwnerOrg, location, stage }
   */
  transferCustody: async ({ batchId, newOwnerOrg, location, stage }) => {
    const data = await request('/api/transfer', {
      method: 'POST',
      body:   JSON.stringify({ batchId, newOwnerOrg, location, stage }),
    });
    return data;
  },

  /**
   * Record IoT sensor data for a batch in transit (transporter only).
   * POST /api/iot  { batchId, temp, humidity, gps?, location, timestamp }
   * timestamp must be ISO-8601 with explicit timezone for deterministic hashing.
   */
  recordSensor: async ({ batchId, temp, humidity, gps, location, timestamp }) => {
    const payload = { batchId, temp, humidity, location, timestamp };
    if (gps) payload.gps = gps;
    const data = await request('/api/iot', {
      method: 'POST',
      body:   JSON.stringify(payload),
    });
    return data; // { sensorDataHash, batch }
  },
};
