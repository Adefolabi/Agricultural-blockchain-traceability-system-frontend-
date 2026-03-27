import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const STAGE_OPTIONS = [
  { value: 'processing',   label: 'Processing' },
  { value: 'distribution', label: 'Distribution' },
  { value: 'retail',       label: 'Retail' },
  { value: 'export',       label: 'Export' },
];

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TransferCustodyModal = ({ batchId, onClose, onSuccess }) => {
  const [form, setForm] = useState({ newOwnerOrg: '', location: '', stage: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.transferCustody({ batchId, ...form });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Transfer failed. Please try again.');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-xl sm:rounded-xl shadow-xl sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-900">Transfer Custody</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Batch</p>
            <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded text-gray-700">{batchId}</p>
          </div>

          <div>
            <label htmlFor="tc-newOwnerOrg" className="block text-sm font-medium text-gray-700 mb-1">
              New Owner Organisation <span className="text-red-500">*</span>
            </label>
            <input
              id="tc-newOwnerOrg"
              type="text"
              required
              value={form.newOwnerOrg}
              onChange={set('newOwnerOrg')}
              placeholder="e.g. Org2MSP"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-400">Enter the Hyperledger Fabric MSP organisation ID.</p>
          </div>

          <div>
            <label htmlFor="tc-location" className="block text-sm font-medium text-gray-700 mb-1">
              Handover Location <span className="text-red-500">*</span>
            </label>
            <input
              id="tc-location"
              type="text"
              required
              value={form.location}
              onChange={set('location')}
              placeholder="e.g. Lagos Distribution Hub"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="tc-stage" className="block text-sm font-medium text-gray-700 mb-1">
              Supply Chain Stage <span className="text-red-500">*</span>
            </label>
            <select
              id="tc-stage"
              required
              value={form.stage}
              onChange={set('stage')}
              className={`${inputClass} bg-white`}
            >
              <option value="">Select stage</option>
              {STAGE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-green-800 transition ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Transferring...' : 'Confirm Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferCustodyModal;
