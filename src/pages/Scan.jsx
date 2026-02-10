import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import Logo from '../components/Logo';
import { api } from '../services/api';

const Scan = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [key, setKey] = useState(0);

  const handleScan = async (decodedText) => {
    let batchId = decodedText;
    if (decodedText.includes('/verify/')) {
        batchId = decodedText.split('/verify/').pop();
    }

    try {
        await api.getBatch(batchId);
        navigate(`/verify/${encodeURIComponent(batchId)}`);
    } catch (err) {
        setError(`Invalid QR Code: ${batchId}. This batch was not found in the system.`);
    }
  };

  const handleError = (error) => {};

  const handleRetry = () => {
      setError(null);
      setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-primary shadow-md p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <Logo size="sm" showText={true} variant="white" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-md">
            {!error ? (
                <QRScanner key={key} onScan={handleScan} onError={handleError} />
            ) : (
                <div className="bg-white rounded-xl shadow-lg border-2 border-red-100 p-8 text-center h-[300px] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Invalid Code</h3>
                    <p className="text-gray-600 mb-6 text-sm">{error}</p>
                    <button 
                        onClick={handleRetry}
                        className="w-full bg-primary hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition transform active:scale-95"
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
