import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Logo from '../components/Logo';

// Role display config
const ROLE_META = {
  farmer:      { label: 'Farmer',      colour: 'bg-green-100 text-green-800' },
  processor:   { label: 'Processor',   colour: 'bg-blue-100  text-blue-800'  },
  transporter: { label: 'Transporter', colour: 'bg-orange-100 text-orange-800' },
  retailer:    { label: 'Retailer',    colour: 'bg-purple-100 text-purple-800' },
};

function buildVerifyUrl(batchId) {
  return `${window.location.origin}/verify/${encodeURIComponent(batchId)}`;
}

function downloadQrSvg(batchId) {
  const svg = document.getElementById(`qr-${batchId}`);
  if (!svg) return;
  const serialised = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([serialised], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `agritrace-${batchId}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── QR modal ────────────────────────────────────────────────────────────────
function QrModal({ batch, onClose }) {
  const verifyUrl = buildVerifyUrl(batch.id);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Produce Label QR Code</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{batch.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 border-2 border-gray-200 rounded-xl inline-block">
            <QRCode
              id={`qr-${batch.id}`}
              value={verifyUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#1B5E20"
              level="M"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2.5 mb-4">
          <p className="text-xs font-mono text-gray-600 break-all">{verifyUrl}</p>
        </div>

        <p className="text-xs text-gray-500 mb-4 text-center">
          Print and attach to produce packaging. Consumers scan to verify provenance.
        </p>

        <button
          onClick={() => downloadQrSvg(batch.id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-primary hover:bg-green-800 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download QR Code (SVG)
        </button>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: role, colour: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.colour}`}>
      {meta.label}
    </span>
  );
}

function BatchActions({ batch }) {
  const navigate = useNavigate();
  const actions  = batch.availableActions || [];
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {actions.includes('transfer') && (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/transfer/${batch.id}`); }}
          className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-semibold transition"
        >
          Transfer Custody
        </button>
      )}
      {actions.includes('recordSensor') && (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/record-sensor/${batch.id}`); }}
          className="text-xs px-3 py-1.5 rounded-md bg-orange-500 text-white hover:bg-orange-600 font-semibold transition"
        >
          Record Sensor Data
        </button>
      )}
    </div>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [batches,    setBatches]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [user,       setUser]       = useState(null);
  const [qrBatch,    setQrBatch]    = useState(null);   // batch whose QR modal is open

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllBatches();
      setBatches(data);
    } catch (err) {
      setError(err.message || 'Failed to load batches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUser(api.getCurrentUser());
    fetchBatches();
  }, [fetchBatches]);

  const handleLogout = () => {
    api.logout();
    navigate('/');
  };

  const riskCount      = batches.filter(b => b.status === 'risk').length;
  const compliantCount = batches.filter(b => b.status === 'compliant').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* QR modal */}
      {qrBatch && <QrModal batch={qrBatch} onClose={() => setQrBatch(null)} />}

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="bg-primary px-4 py-3 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/')} className="text-white">
            <Logo size="sm" variant="white" />
          </button>

          <div className="flex items-center gap-3">
            {user && <RoleBadge role={user.role} />}
            <span className="text-sm text-white/80 hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 px-4">

        {/* ── Page header + primary action ──────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Batches</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Batches currently assigned to your organisation
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchBatches}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            {user?.role === 'farmer' && (
              <button
                onClick={() => navigate('/create-batch')}
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-md bg-primary text-white hover:bg-green-800 font-semibold transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Batch
              </button>
            )}
          </div>
        </div>

        {/* ── Stats strip ──────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Total Batches</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{batches.length}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wide">At Risk</h3>
            <p className="text-3xl font-bold text-red-600 mt-1">{riskCount}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Compliant</h3>
            <p className="text-3xl font-bold text-green-600 mt-1">{compliantCount}</p>
          </div>
        </div>

        {/* ── Content area ─────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="mt-4 text-gray-500">Loading from blockchain…</p>
          </div>

        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchBatches}
              className="mt-4 text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>

        ) : batches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-gray-500 font-medium">No batches found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {user?.role === 'farmer'
                ? 'Create your first batch to get started.'
                : 'Batches transferred to your organisation will appear here.'}
            </p>
            {user?.role === 'farmer' && (
              <button
                onClick={() => navigate('/create-batch')}
                className="mt-4 text-sm px-4 py-2 bg-primary text-white rounded-md hover:bg-green-800 transition"
              >
                Create First Batch
              </button>
            )}
          </div>

        ) : (
          <div className="bg-white shadow-sm overflow-hidden rounded-lg border border-gray-100">
            <div className="px-4 py-4 border-b border-gray-100 sm:px-6">
              <h3 className="text-base font-semibold text-gray-900">Assigned Batches</h3>
            </div>

            <ul className="divide-y divide-gray-100">
              {batches.map((batch) => (
                <li key={batch.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition">
                    {/* Top row: produce name + status + QR button */}
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1 cursor-pointer min-w-0 pr-3"
                        onClick={() => navigate(`/verify/${batch.id}`)}
                      >
                        <p className="text-sm font-semibold text-primary truncate">
                          {batch.produceType}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{batch.id}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* QR code button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setQrBatch(batch); }}
                          title="Show QR code for produce label"
                          className="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-green-50 transition"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </button>

                        <StatusBadge status={batch.status} />
                      </div>
                    </div>

                    {/* Middle row: meta */}
                    <div
                      className="mt-2 sm:flex sm:justify-between text-sm text-gray-500 cursor-pointer"
                      onClick={() => navigate(`/verify/${batch.id}`)}
                    >
                      <div className="flex flex-wrap gap-x-5 gap-y-1">
                        {batch.stage && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {batch.stage}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {batch.location}
                        </span>
                      </div>

                      {batch.lastUpdate && (
                        <p className="text-xs text-gray-400 mt-1 sm:mt-0">
                          Updated {new Date(batch.lastUpdate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Action buttons from availableActions */}
                    <BatchActions batch={batch} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
