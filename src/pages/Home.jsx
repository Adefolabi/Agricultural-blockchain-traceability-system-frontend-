import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-10">
          <img src="/icon.svg" alt="AgriTrace" className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AgriTrace</h1>
          <p className="text-gray-600 max-w-xs mx-auto">
            Verify the origin and safety of your agricultural produce with a simple scan.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => navigate('/scan')}
            className="w-full bg-primary hover:bg-green-800 text-white font-semibold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center transition-transform transform active:scale-95"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan Product QR
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white text-primary border-2 border-primary font-semibold py-3 px-6 rounded-lg hover:bg-green-50 transition-colors"
          >
            Stakeholder Login
          </button>
        </div>
      </div>
      
      <footer className="text-center text-sm text-gray-400 py-6">
        &copy; 2024 AgriTrace System
      </footer>
    </div>
  );
};

export default Home;
