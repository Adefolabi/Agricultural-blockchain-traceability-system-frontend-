// Mock API service to simulate backend interactions

const MOCK_BATCHES = [
  {
    id: 'BATCH-001',
    origin: 'Green Valley Farm, CA',
    produceType: 'Organic Tomatoes',
    location: 'Distribution Center, NV',
    status: 'Safe',
    lastUpdate: '2023-10-15T10:30:00Z',
    complianceNotes: 'All safety checks passed.'
  },
  {
    id: 'BATCH-002',
    origin: 'Sunny Side Orchard, WA',
    produceType: 'Gala Apples',
    location: 'Retail Store, OR',
    status: 'Risk',
    lastUpdate: '2023-10-10T14:20:00Z',
    complianceNotes: 'Temperature deviation detected during transit.'
  },
  {
    id: 'BATCH-003',
    origin: 'Highland Berries, OR',
    produceType: 'Blueberries',
    location: 'Processing Unit, WA',
    status: 'Safe',
    lastUpdate: '2023-10-18T09:15:00Z',
    complianceNotes: 'Quality control verified.'
  }
];

export const api = {
  /**
   * Simulate user login
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} User object
   */
  login: async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email === 'stakeholder@example.com' && password === 'admin123') {
      const user = { email, role: 'stakeholder', name: 'Authorized Stakeholder' };
      localStorage.setItem('agri_user', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid credentials');
  },

  /**
   * Log out the current user
   */
  logout: () => {
    localStorage.removeItem('agri_user');
  },

  /**
   * Get current authenticated user
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('agri_user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Verify a batch by ID
   * @param {string} batchId 
   * @returns {Promise<Object>} Batch details
   */
  getBatch: async (batchId) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const batch = MOCK_BATCHES.find(b => b.id === batchId);
    if (!batch) throw new Error('Batch not found');
    return batch;
  },

  /**
   * Get all batches (Stakeholder only)
   * @returns {Promise<Array>} List of batches
   */
  getAllBatches: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_BATCHES];
  }
};
