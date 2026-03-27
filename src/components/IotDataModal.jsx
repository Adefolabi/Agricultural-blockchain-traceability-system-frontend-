import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IotDataModal = ({ batchId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    temp: '',
    humidity: '',
    location: '',
    gps: '',
    timestamp: new Date().toISOString().slice(0, 16),
  });
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
      await api.recordSensorData({
        batchId,
        temp: Number(form.temp),
        humidity: Number(form.humidity),
        location: form.location,
        gps: form.gps || undefined,
        timestamp: new Date(form.timestamp).toISOString(),
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
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
          <h2 className="text-base font-bold text-gray-900">Submit IoT Reading</h2>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="iot-temp" className="block text-sm font-medium text-gray-700 mb-1">
                Temp (°C) <span className="text-red-500">*</span>
              </label>
              <input
                id="iot-temp"
                type="number"
                step="0.1"
                required
                value={form.temp}
                onChange={set('temp')}
                placeholder="e.g. 4.2"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="iot-humidity" className="block text-sm font-medium text-gray-700 mb-1">
                Humidity (%) <span className="text-red-500">*</span>
              </label>
              <input
                id="iot-humidity"
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={form.humidity}
                onChange={set('humidity')}
                placeholder="e.g. 82.5"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="iot-location" className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="iot-location"
              type="text"
              required
              value={form.location}
              onChange={set('location')}
              placeholder="e.g. Lagos Cold Storage Facility"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="iot-gps" className="block text-sm font-medium text-gray-700 mb-1">
              GPS Coordinates
            </label>
            <input
              id="iot-gps"
              type="text"
              value={form.gps}
              onChange={set('gps')}
              placeholder="e.g. 6.5244,3.3792"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="iot-timestamp" className="block text-sm font-medium text-gray-700 mb-1">
              Timestamp <span className="text-red-500">*</span>
            </label>
            <input
              id="iot-timestamp"
              type="datetime-local"
              required
              value={form.timestamp}
              onChange={set('timestamp')}
              className={inputClass}
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
              {submitting ? 'Submitting...' : 'Submit Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IotDataModal;
