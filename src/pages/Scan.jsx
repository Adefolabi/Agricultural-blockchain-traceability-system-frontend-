import React from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';

const Scan = () => {
  const navigate = useNavigate();

  const handleScan = (decodedText) => {
    // Expecting decodedText to be the Batch ID directly or a URL containing it.
    // For simplicity, we assume the QR code contains the Batch ID string (e.g., "BATCH-001")
    console.log("Scanned:", decodedText);
    navigate(`/verify/${encodeURIComponent(decodedText)}`);
  };

  const handleError = (error) => {
    // console.warn(error); 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-600 mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">Scan QR Code</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <QRScanner onScan={handleScan} onError={handleError} />
      </div>
    </div>
  );
};

export default Scan;
