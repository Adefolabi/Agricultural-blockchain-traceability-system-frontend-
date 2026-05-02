import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import Logo from '../components/Logo';

/**
 * Scan — consumer-facing QR code scanner.
 *
 * Decodes the QR text, extracts the batch ID, and navigates directly to the
 * Verify page.  The Verify page owns the API call so we avoid a double fetch.
 *
 * Supported QR formats:
 *   1. Full URL:   https://example.com/verify/BATCH-001  → extract path segment
 *   2. Bare ID:    BATCH-001                             → use as-is
 */
const Scan = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [key,   setKey]   = useState(0);

  const handleScan = (decodedText) => {
    let batchId = decodedText.trim();

    // Extract ID from a full verification URL
    if (batchId.includes('/verify/')) {
      batchId = batchId.split('/verify/').pop().split('?')[0];
    }

    // Reject obviously invalid strings before navigating
    if (!batchId || !/^[\w-]{1,100}$/.test(batchId)) {
      setError(`Invalid QR code content: "${decodedText}". Expected a batch ID.`);
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

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {!error ? (
            <QRScanner key={key} onScan={handleScan} />
          ) : (
            <div className="bg-white rounded-xl shadow-lg border-2 border-red-100 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce">
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
      </div>
    </div>
  );
};

export default Scan;
