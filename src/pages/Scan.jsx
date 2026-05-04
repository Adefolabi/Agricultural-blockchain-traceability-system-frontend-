import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import Logo from '../components/Logo';

const Scan = () => {
  const navigate = useNavigate();
  const [error,        setError]        = useState(null);
  const [key,          setKey]          = useState(0);
  const [manualId,     setManualId]     = useState('');
  const [manualError,  setManualError]  = useState('');

  const resolveBatchId = (raw) => {
    let id = raw.trim();
    if (id.includes('/verify/')) {
      id = id.split('/verify/').pop().split('?')[0];
    }
    // URL-decode in case the QR encodes %XX sequences
    try { id = decodeURIComponent(id); } catch { /* leave as-is */ }
    return id;
  };

  const handleScan = (decodedText) => {
    const batchId = resolveBatchId(decodedText);
    if (!batchId || !/^[\w-]{1,100}$/.test(batchId)) {
      setError(`Invalid QR code: "${decodedText}". Expected a batch ID.`);
      return;
    }
    navigate(`/verify/${encodeURIComponent(batchId)}`);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const batchId = resolveBatchId(manualId);
    if (!batchId || !/^[\w-]{1,100}$/.test(batchId)) {
      setManualError('Enter a valid batch ID (letters, numbers, hyphens, underscores).');
      return;
    }
    navigate(`/verify/${encodeURIComponent(batchId)}`);
  };

  const handleRetry = () => {
    setError(null);
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-primary shadow-md p-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-white mr-3 hover:bg-white/10 p-2 rounded-full transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <Logo size="sm" showText={true} variant="white" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* ── Camera scanner ─────────────────────────────────── */}
        <div className="w-full max-w-md">
          {!error ? (
            <QRScanner key={key} onScan={handleScan} />
          ) : (
            <div className="bg-white rounded-xl shadow-lg border-2 border-red-100 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Invalid QR Code</h3>
              <p className="text-gray-600 mb-6 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="w-full bg-primary hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Scan Again
              </button>
            </div>
          )}
        </div>

        {/* ── Manual entry fallback ───────────────────────────── */}
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Or enter a Batch ID manually
          </p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualId}
              onChange={(e) => { setManualId(e.target.value); setManualError(''); }}
              placeholder="e.g. TOMATO_1 or paste full URL"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-primary focus:border-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-green-800 transition"
            >
              Verify
            </button>
          </form>
          {manualError && (
            <p className="mt-2 text-xs text-red-600">{manualError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scan;
