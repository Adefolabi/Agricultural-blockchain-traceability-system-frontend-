// Mock API service to simulate backend interactions

const MOCK_BATCHES = [
  {
    id: 'BATCH-001',
    origin: 'Green Valley Farm, CA',
    produceType: 'Organic Tomatoes',
    location: 'Distribution Center, NV',
    status: 'Safe',
    lastUpdate: '2023-10-15T10:30:00Z',
    complianceNotes: 'All safety checks passed.',
    journey: [
      { stage: 'Harvesting', location: 'Green Valley Farm, CA', time: '2023-10-10', status: 'Safe' },
      { stage: 'Processing', location: 'Green Valley Packing, CA', time: '2023-10-12', status: 'Safe' },
      { stage: 'Logistics', location: 'Transit to NV', time: '2023-10-13', status: 'Safe' },
      { stage: 'Distribution', location: 'Distribution Center, NV', time: '2023-10-15', status: 'Safe' }
    ]
  },
  {
    id: 'BATCH-002',
    origin: 'Sunny Side Orchard, WA',
    produceType: 'Gala Apples',
    location: 'Retail Store, OR',
    status: 'Risk',
    lastUpdate: '2023-10-10T14:20:00Z',
    complianceNotes: 'Temperature deviation detected during transit.',
    journey: [
      { stage: 'Harvesting', location: 'Sunny Side Orchard, WA', time: '2023-10-05', status: 'Safe' },
      { stage: 'Processing', location: 'Orchard Packing Unit, WA', time: '2023-10-07', status: 'Safe' },
      { stage: 'Transport', location: 'I-5 Transit Route', time: '2023-10-09', status: 'Risk' },
      { stage: 'Retail Stock', location: 'Retail Store, OR', time: '2023-10-10', status: 'Risk' }
    ]
  },
  {
    id: 'BATCH-003',
    origin: 'Highland Berries, OR',
    produceType: 'Blueberries',
    location: 'Processing Unit, WA',
    status: 'Safe',
    lastUpdate: '2023-10-18T09:15:00Z',
    complianceNotes: 'Quality control verified.',
    journey: [
      { stage: 'Harvesting', location: 'Highland Berries, OR', time: '2023-10-17', status: 'Safe' },
      { stage: 'Processing', location: 'Processing Unit, WA', time: '2023-10-18', status: 'Safe' }
    ]
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
