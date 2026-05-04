import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Logo from '../components/Logo';

/**
 * TransferCustody — available to Farmer, Processor, Transporter roles.
 * Submits POST /api/transfer → chaincode TransferCustody.
 *
 * batchId is pre-populated from the URL parameter set by Dashboard action buttons.
 *
 * Fields:
 *   batchId     — pre-filled, editable
 *   newOwnerOrg — Fabric MSP ID of the receiving organisation
 *   location    — handoff location
 *   stage       — next supply chain stage
 */

// Fabric MSP IDs available in the prototype network
const ORG_OPTIONS = [
  { value: 'Org1MSP', label: 'Org1MSP  (Farmer / Retailer accounts)' },
  { value: 'Org2MSP', label: 'Org2MSP  (Processor / Transporter accounts)' },
];

// Supply chain stages aligned with Section 3.7 process model.
// "Farm" is the initial stage set at batch creation and is not a transfer target.
const STAGE_OPTIONS = [
  { value: 'Processing',   label: 'Processing   — batch handed to processor' },
  { value: 'Distribution', label: 'Distribution — batch entering distribution network' },
  { value: 'Transport',    label: 'Transport    — batch in transit to next actor' },
  { value: 'Retail',       label: 'Retail       — batch received by retailer' },
];

const TransferCustody = () => {
  const { batchId: paramBatchId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    batchId:     paramBatchId || '',
    newOwnerOrg: '',
    location:    '',
    stage:       '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.transferCustody({
        batchId:     form.batchId.trim(),
        newOwnerOrg: form.newOwnerOrg,
        location:    form.location.trim(),
        stage:       form.stage,
      });

      setSuccess(`Custody of batch "${form.batchId}" transferred to ${form.newOwnerOrg} at ${form.location}.`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ───────────────────────────────────────────────── */}
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
          <h1 className="text-2xl font-bold text-gray-900">Transfer Custody</h1>
          <p className="text-sm text-gray-500 mt-1">
            Hand over a batch to the next supply chain organisation. The transfer is
            recorded as an immutable event on the Fabric ledger.
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-mono focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Receiving organisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transfer To (Organisation) <span className="text-red-500">*</span>
              </label>
              <select
                name="newOwnerOrg"
                value={form.newOwnerOrg}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary bg-white"
              >
                <option value="">— Select receiving organisation —</option>
                {ORG_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                The MSP ID must match an organisation enrolled in the Fabric network.
              </p>
            </div>

            {/* Handoff location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Handoff Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="e.g. Lagos Processing Hub"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Supply Chain Stage <span className="text-red-500">*</span>
              </label>
              <select
                name="stage"
                value={form.stage}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary bg-white"
              >
                <option value="">— Select stage —</option>
                {STAGE_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Error / success */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-md p-3">
                <p className="font-semibold mb-1">✓ Custody transferred successfully</p>
                <p>{success}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting to ledger…' : 'Transfer Custody'}
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

        {/* Info box */}
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4 text-xs text-amber-700">
          <p className="font-semibold mb-1">Important</p>
          <ul className="list-disc list-inside space-y-1 text-amber-600">
            <li>Only the <strong>current owner</strong> of a batch may transfer it.</li>
            <li>Ownership is verified inside the chaincode — not just at the API level.</li>
            <li>After transfer, this batch will no longer appear in your dashboard.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TransferCustody;
