import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Logo from '../components/Logo';

// Demo credentials that match the backend's in-memory user store
const DEMO_ACCOUNTS = [
  { label: 'Farmer',      email: 'farmer@agri.com',      password: 'farmer123' },
  { label: 'Processor',   email: 'processor@agri.com',   password: 'processor123' },
  { label: 'Transporter', email: 'transporter@agri.com', password: 'transporter123' },
  { label: 'Retailer',    email: 'retailer@agri.com',    password: 'retailer123' },
];

const Login = () => {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // One-click fill for demo accounts
  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <Logo size="md" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Stakeholder Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Agricultural Traceability Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Quick-fill demo accounts */}
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Demo accounts (click to fill)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="text-xs py-2 px-3 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary transition text-left"
                >
                  <span className="font-semibold block">{acc.label}</span>
                  <span className="text-gray-400">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
