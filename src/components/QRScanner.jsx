import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScan, onError }) => {
  const [scanning,       setScanning]       = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const scannerRef = useRef(null);
  const onScanRef  = useRef(onScan);

  // Keep the ref current on every render so the effect closure is never stale.
  onScanRef.current = onScan;

  useEffect(() => {
    const READER_ID = 'qr-reader';

    const cleanup = async () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (e) {
          console.warn('QR cleanup error', e);
        }
        scannerRef.current = null;
      }
      const node = document.getElementById(READER_ID);
      if (node) node.innerHTML = '';
    };

    const start = async () => {
      await cleanup();

      const scanner = new Html5Qrcode(READER_ID);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          async (decodedText) => {
            // Stop the scanner before handing off to the caller.
            if (!scannerRef.current) return;
            try {
              await scannerRef.current.stop();
              scannerRef.current.clear();
            } catch (e) {
              console.warn('Stop after scan failed', e);
            }
            scannerRef.current = null;
            setScanning(false);
            // Use the ref so we always call the latest onScan, not a stale closure.
            onScanRef.current(decodedText);
          },
          () => { /* per-frame decode errors — ignore */ }
        );
        setScanning(true);
        setPermissionError(false);
      } catch (err) {
        console.warn('Camera start failed', err);
        setScanning(false);
        setPermissionError(true);
        if (onError) onError(err);
      }
    };

    start();
    return () => { cleanup(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="relative overflow-hidden rounded-xl shadow-lg border-2 border-primary bg-black h-[300px] sm:h-[400px]">
        <div id="qr-reader" className="w-full h-full" />

        {scanning && (
          <div className="scanner-overlay pointer-events-none absolute inset-0 flex items-center justify-center z-50">
            <div className="relative w-[250px] h-[250px]">
              <div className="scanner-line" />
              <div className="scanner-border" />
            </div>
            <p className="absolute bottom-4 text-white text-xs bg-black/50 px-2 py-1 rounded">
              Align QR Code within the frame
            </p>
          </div>
        )}

        {permissionError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 text-white p-6 text-center z-50">
            <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold mb-2">Camera Access Needed</h3>
            <p className="text-sm text-gray-300 mb-6">Allow camera access to scan QR codes.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition"
            >
              Grant Permission / Retry
            </button>
          </div>
        )}
      </div>

      {!permissionError && !scanning && (
        <p className="text-center text-gray-500 mt-4 text-sm animate-pulse">
          Initialising camera…
        </p>
      )}
    </div>
  );
};

export default QRScanner;
