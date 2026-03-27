import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CreateBatchModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ produceType: '', origin: '', location: '', notes: '' });
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
      await api.createBatch(form);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to register batch. Please try again.');
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
          <h2 className="text-base font-bold text-gray-900">Register New Batch</h2>
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
            <label htmlFor="cb-produceType" className="block text-sm font-medium text-gray-700 mb-1">
              Produce Type <span className="text-red-500">*</span>
            </label>
            <input
              id="cb-produceType"
              type="text"
              required
              value={form.produceType}
              onChange={set('produceType')}
              placeholder="e.g. Tomatoes, Maize"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cb-origin" className="block text-sm font-medium text-gray-700 mb-1">
              Farm / Origin <span className="text-red-500">*</span>
            </label>
            <input
              id="cb-origin"
              type="text"
              required
              value={form.origin}
              onChange={set('origin')}
              placeholder="e.g. Kaduna Farm, Northern Nigeria"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cb-location" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Location <span className="text-red-500">*</span>
            </label>
            <input
              id="cb-location"
              type="text"
              required
              value={form.location}
              onChange={set('location')}
              placeholder="e.g. Kaduna Storage Facility"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cb-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="cb-notes"
              rows={3}
              value={form.notes}
              onChange={set('notes')}
              placeholder="Optional compliance or handling notes"
              className={`${inputClass} resize-none`}
            />
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
              {submitting ? 'Registering...' : 'Register Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBatchModal;
