import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Logo from '../components/Logo';

const Dashboard = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    setUser(currentUser);

    const fetchBatches = async () => {
      try {
        const data = await api.getAllBatches();
        setBatches(data);
      } catch {
        setError('Failed to load batches. Please refresh to try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const handleLogout = () => {
    api.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-primary px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/')} className="text-white mr-4">
           <Logo size="sm" variant="white" />
          </button>
         
          <div className="flex items-center space-x-4">
             {/* Show user name if available, or just skeleton/blank if simple */}
            <span className="text-sm text-white/80 hidden sm:block">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-500">Loading dashboard...</p>
             </div>
        ) : error ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-5 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Total Batches</h3>
                <p className="text-3xl font-bold text-gray-900">{batches.length}</p>
             </div>
             <div className="bg-white p-5 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Active Risks</h3>
                <p className="text-3xl font-bold text-red-600">
                    {batches.filter(b => b.status === 'Risk').length}
                </p>
             </div>
             <div className="bg-white p-5 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Secure Batches</h3>
                <p className="text-3xl font-bold text-green-600">
                    {batches.filter(b => b.status === 'Safe').length}
                </p>
             </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Assigned Batches
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {batches.length === 0 && (
                <li className="px-4 py-10 text-center text-gray-500 text-sm">
                  No batches assigned yet.
                </li>
              )}
              {batches.map((batch) => (
                <li key={batch.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition cursor-pointer" onClick={() => navigate(`/verify/${batch.id}`)}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary truncate">
                        {batch.produceType}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <StatusBadge status={batch.status} />
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 mr-6">
                          Batch: {batch.id}
                        </p>
                        <p className="flex items-center text-sm text-gray-500">
                           {batch.location}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Updated {new Date(batch.lastUpdate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
