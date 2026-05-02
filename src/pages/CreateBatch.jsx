import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { api } from '../services/api';
import Logo from '../components/Logo';

/**
 * CreateBatch — accessible only by the Farmer role.
 * Submits POST /api/batches → chaincode CreateBatch.
 * On success, displays a scannable QR code encoding the public
 * verification URL so the farmer can print it onto the produce label.
 *
 * Fields:
 *   batchId  — unique identifier (alphanumeric, hyphens, underscores, max 100 chars)
 *   farmId   — farm name / identifier
 *   variety  — produce variety / type
 *   quantity — integer unit count
 */

function buildVerifyUrl(batchId) {
  return `${window.location.origin}/verify/${encodeURIComponent(batchId)}`;
}

function downloadQrSvg(batchId) {
  const svg = document.getElementById('batch-qr-svg');
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

const CreateBatch = () => {
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ batchId: '', farmId: '', variety: '', quantity: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [createdBatchId, setCreatedBatchId] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const qty = parseInt(form.quantity, 10);
    if (!Number.isInteger(qty) || qty < 1) {
      setError('Quantity must be a positive integer.');
      setLoading(false);
      return;
    }

    if (!/^[\w-]{1,100}$/.test(form.batchId)) {
      setError('Batch ID may only contain letters, numbers, hyphens and underscores (max 100 chars).');
      setLoading(false);
      return;
    }

    try {
      await api.createBatch({
        batchId:  form.batchId.trim(),
        farmId:   form.farmId.trim(),
        variety:  form.variety.trim(),
        quantity: qty,
      });
      setCreatedBatchId(form.batchId.trim());
    } catch (err) {
      setError(err.message || 'Failed to create batch.');
    } finally {
      setLoading(false);
    }
  };

  const user = api.getCurrentUser();
  const verifyUrl = createdBatchId ? buildVerifyUrl(createdBatchId) : null;

  // ── Success screen — show QR code for printing ─────────────────────────
  if (createdBatchId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary shadow-md p-4 flex items-center sticky top-0 z-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white mr-3 hover:bg-white/10 p-2 rounded-full transition"
            title="Back to Dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <Logo size="sm" showText={true} variant="white" />
        </header>

        <div className="max-w-lg mx-auto py-8 px-4 space-y-5">
          {/* Success banner */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-800">Batch registered on the blockchain</p>
              <p className="text-sm text-green-700 mt-0.5">
                An immutable record for{' '}
                <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-xs">
                  {createdBatchId}
                </span>{' '}
                has been written to the Hyperledger Fabric ledger.
              </p>
            </div>
          </div>

          {/* QR code card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Produce Label QR Code</h2>
            <p className="text-sm text-gray-500 mb-5">
              Print this QR code and attach it to the produce packaging. Consumers scan it
              to verify the full supply chain provenance on the Hyperledger Fabric ledger.
            </p>

            {/* QR code centred with white padding for scanning contrast */}
            <div className="flex justify-center mb-5">
              <div className="bg-white p-4 border-2 border-gray-200 rounded-xl inline-block">
                <QRCode
                  id="batch-qr-svg"
                  value={verifyUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#1B5E20"
                  level="M"
                />
              </div>
            </div>

            {/* Encoded URL for reference */}
            <div className="bg-gray-50 rounded-lg p-3 mb-5">
              <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Encoded URL</p>
              <p className="text-xs font-mono text-gray-700 break-all">{verifyUrl}</p>
            </div>

            {/* Download button */}
            <button
              onClick={() => downloadQrSvg(createdBatchId)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-primary hover:bg-green-800 transition shadow-sm mb-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR Code (SVG)
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Next-steps hint */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-700">
            <p className="font-semibold mb-1">What happens next?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Print the QR code above and stick it on the produce packaging.</li>
              <li>Use <strong>Transfer Custody</strong> from the dashboard to hand the batch to a processor.</li>
              <li>The transporter will record cold-chain sensor readings during transit.</li>
              <li>Anyone who scans the QR code can view the full verified provenance.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary shadow-md p-4 flex items-center sticky top-0 z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white mr-3 hover:bg-white/10 p-2 rounded-full transition"
          title="Back to Dashboard"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <Logo size="sm" showText={true} variant="white" />
      </header>

      <div className="max-w-lg mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Register New Batch</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create an immutable produce batch record on the Hyperledger Fabric ledger.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Batch ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="batchId"
                value={form.batchId}
                onChange={handleChange}
                required
                placeholder="e.g. TOMATO-20260417-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary font-mono"
              />
              <p className="mt-1 text-xs text-gray-400">
                Unique identifier — letters, numbers, hyphens and underscores only.
              </p>
            </div>

            {/* Farm ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm / Producer ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="farmId"
                value={form.farmId}
                onChange={handleChange}
                required
                placeholder="e.g. Green Valley Farm, Lagos"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Variety */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produce Variety <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="variety"
                value={form.variety}
                onChange={handleChange}
                required
                placeholder="e.g. Roma Tomatoes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (kg / units) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min="1"
                step="1"
                placeholder="e.g. 500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-primary hover:bg-green-800 transition shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Registering on ledger…' : 'Register Batch'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="py-2.5 px-4 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-700">
          <p className="font-semibold mb-1">What happens next?</p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>A new record is written immutably to the Hyperledger Fabric ledger.</li>
            <li>
              Your organisation ({user?.org || 'your org'}) is set as the initial batch owner.
            </li>
            <li>A printable QR code will be generated for the produce label.</li>
            <li>Use <strong>Transfer Custody</strong> from the dashboard to hand the batch to a processor.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateBatch;
