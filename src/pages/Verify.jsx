import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import TraceabilityTimeline from '../components/TraceabilityTimeline';
import Logo from '../components/Logo';

const Verify = () => {
  const { batchId } = useParams();
  const navigate    = useNavigate();
  const [batch,   setBatch]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        // Decode in case the batchId was URI-encoded by the QR scanner
        const id   = decodeURIComponent(batchId);
        const data = await api.getBatch(id);
        setBatch(data);
      } catch (err) {
        setError(err.message || 'Batch not found. Please scan a valid AgriTrace QR code.');
      } finally {
        setLoading(false);
      }
    };
    fetchBatch();
  }, [batchId]);

  // Summary note derived from live compliance status
  const complianceNote = batch
    ? batch.status === 'compliant'
      ? 'All supply chain records are compliant. No threshold breaches detected.'
      : 'One or more sensor readings breached compliance thresholds. Batch flagged as non-compliant.'
    : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="bg-primary shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-white mr-3 hover:bg-white/10 p-2 rounded-full transition"
            title="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <Logo size="sm" showText={true} variant="white" />
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-white hover:bg-white/10 p-2 rounded-full transition"
          title="Home"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        {/* ── Loading ─────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="mt-4 text-gray-500">Querying blockchain record…</p>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mt-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Verification Failed</h2>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => navigate('/scan')}
              className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Scan Again
            </button>
          </div>
        )}

        {/* ── Batch details ────────────────────────────────────────── */}
        {!loading && batch && (
          <div className="space-y-4 mt-4">
            {/* Status card */}
            <div className="bg-white rounded-xl shadow-md p-6 text-center border-t-4 border-primary">
              <p className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-3">
                Compliance Status
              </p>
              <div className="transform scale-110 mb-3 inline-block">
                <StatusBadge status={batch.status} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Verified on Hyperledger Fabric</p>
            </div>

            {/* Details card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">
                  {batch.produceType || 'Unknown Produce'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Batch ID:{' '}
                  <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-xs">
                    {batch.batchId}
                  </span>
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Origin */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Farm of Origin</h4>
                    <p className="text-gray-600">{batch.origin || '—'}</p>
                  </div>
                </div>

                {/* Current location */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Current Location</h4>
                    <p className="text-gray-600">{batch.location || '—'}</p>
                  </div>
                </div>

                {/* Compliance notes */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Compliance Summary</h4>
                    <p className="text-sm text-gray-600 italic">"{complianceNote}"</p>
                  </div>
                </div>
              </div>

              {/* Journey timeline */}
              <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                <TraceabilityTimeline journey={batch.journey} />
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 text-xs text-gray-400 text-center border-t border-gray-100">
                {batch.lastUpdate
                  ? `Last blockchain update: ${new Date(batch.lastUpdate).toLocaleString()}`
                  : 'Timestamp not available'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
