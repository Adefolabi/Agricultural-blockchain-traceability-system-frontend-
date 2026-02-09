import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScan, onError }) => {
  useEffect(() => {
    // Config for the scanner
    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true
    };
    
    const scanner = new Html5QrcodeScanner(
      "reader", 
      config, 
      /* verbose= */ false
    );
    
    scanner.render(
      (decodedText) => {
        // Stop scanning after success to prevent multiple triggers
        scanner.clear();
        onScan(decodedText);
      }, 
      (error) => {
        // Errors are common while scanning (e.g. no QR code found in frame), 
        // so we can often ignore them or log them quietly unless critical.
        if (onError) onError(error);
      }
    );

    // Cleanup on unmount
    return () => {
      scanner.clear().catch(err => console.warn("Failed to clear scanner", err));
    };
  }, [onScan, onError]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="reader" className="overflow-hidden rounded-xl shadow-lg border-2 border-primary bg-black"></div>
      <p className="text-center text-gray-500 mt-4 text-sm">Position QR code within the frame</p>
    </div>
  );
};

export default QRScanner;
