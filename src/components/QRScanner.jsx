import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const QRScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const scannerRef = useRef(null);
  const readerId = "reader-custom-id"; // Unique ID to avoid conflicts

  useEffect(() => {
    // Cleanup function to run before effect or on unmount
    const cleanup = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (error) {
                console.warn("Cleanup error", error);
            }
            scannerRef.current = null;
        }
        // Force DOM cleanup
        const node = document.getElementById(readerId);
        if (node) node.innerHTML = "";
    };

    const initScanner = async () => {
        // Ensure clean state
        await cleanup();

        const html5QrCode = new Html5Qrcode(readerId);
        scannerRef.current = html5QrCode;

        try {
            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore frame errors
                }
            );
            setScanning(true);
            setPermissionError(false);
        } catch (err) {
            console.warn("Start failed", err);
            setScanning(false);
            setPermissionError(true);
            if (onError) onError(err);
        }
    };

    initScanner();

    return () => {
        cleanup();
    };
  }, []);

  const handleScanSuccess = (decodedText) => {
    if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
            scannerRef.current.clear();
            setScanning(false);
            onScan(decodedText);
        }).catch(err => {
            console.warn("Stop failed", err);
            onScan(decodedText);
        });
    }
  };

  const handleRetry = () => {
     window.location.reload();
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="relative overflow-hidden rounded-xl shadow-lg border-2 border-primary bg-black h-[300px] sm:h-[400px]">
        {/* Scanner Element */}
        <div id={readerId} className="w-full h-full"></div>

        {/* Custom UI Overlay - Only show if scanning */}
        {scanning && (
          <div className="scanner-overlay pointer-events-none absolute inset-0 flex items-center justify-center z-50">
             <div className="relative w-[250px] h-[250px]">
                {/* Laser Animation */}
                <div className="scanner-line"></div>
                {/* Border Corners */}
                 <div className="scanner-border"></div> 
             </div>
             <p className="absolute bottom-4 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                Align QR Code
             </p>
          </div>
        )}

        {/* Permission / Error State */}
        {permissionError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-95 text-white p-6 text-center z-50">
             <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
             <h3 className="text-lg font-bold mb-2">Camera Access Needed</h3>
             <p className="text-sm text-gray-300 mb-6">
                Please allow camera permissions to scan QR codes.
             </p>
             <button 
                onClick={handleRetry}
                className="bg-primary hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition shadow-lg"
             >
                Grant Permission / Retry
             </button>
          </div>
        )}
      </div>
      
      {!permissionError && !scanning && (
        <p className="text-center text-gray-500 mt-4 text-sm animate-pulse">
          Initializing camera...
        </p>
      )}
    </div>
  );
};

export default QRScanner;
