import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    setUser(currentUser);

    const fetchBatches = async () => {
      try {
        const data = await api.getAllBatches();
        setBatches(data);
      } catch (err) {
        console.error("Failed to fetch batches");
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

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">AgriTrace Dashboard</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4 hidden sm:block">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
      </main>
    </div>
  );
};

export default Dashboard;
