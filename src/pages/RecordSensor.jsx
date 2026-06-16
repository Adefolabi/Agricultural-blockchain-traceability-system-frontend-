import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Logo from '../components/Logo';

/**
 * RecordSensor — accessible only by the Transporter role.
 * Submits POST /api/iot → chaincode RecordSensorData.
 *
 * The backend computes a SHA-256 hash of the full payload before writing to
 * the ledger, enabling independent hash verification later.
 *
 * Fields:
 *   batchId   — pre-filled from URL param
 *   temp      — temperature in °C  (compliance: 0–10°C)
 *   humidity  — relative humidity % (compliance: 0–90%)
 *   gps       — optional "lat,lng" string
 *   location  — human-readable location
 *   timestamp — ISO-8601 with timezone (required for deterministic hashing)
 */

// Produce current ISO-8601 timestamp with local offset
function nowIso() {
  const d   = new Date();
  const pad = n => String(n).padStart(2, '0');
  const tz  = -d.getTimezoneOffset();
  const sign = tz >= 0 ? '+' : '-';
  const ah   = pad(Math.floor(Math.abs(tz) / 60));
  const am   = pad(Math.abs(tz) % 60);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${ah}:${am}`
  );
}

const RecordSensor = () => {
  const { batchId: paramBatchId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    batchId:   paramBatchId || '',
    temp:      '',
    humidity:  '',
    gps:       '',
    location:  '',
    timestamp: nowIso(),
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [result,  setResult]  = useState(null);   // { sensorDataHash, compliance }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        batchId:   form.batchId.trim(),
        temp:      parseFloat(form.temp),
        humidity:  parseFloat(form.humidity),
        location:  form.location.trim(),
        timestamp: form.timestamp.trim(),
      };
      if (form.gps.trim()) payload.gps = form.gps.trim();

      const data = await api.recordSensor(payload);
      const compliant = data.batch?.status === 'compliant';
      setResult({
        hash:       data.sensorDataHash,
        compliant,
        batchStatus: data.batch?.status,
      });
    } catch (err) {
      setError(err.message || 'Failed to record sensor data.');
    } finally {
      setLoading(false);
    }
  };

  // Compliance hint colour based on temp input
  const tempValue = parseFloat(form.temp);
  const tempOk    = !isNaN(tempValue) && tempValue >= 0 && tempValue <= 10;
  const humValue  = parseFloat(form.humidity);
  const humOk     = !isNaN(humValue) && humValue >= 0 && humValue <= 90;

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
          <h1 className="text-2xl font-bold text-gray-900">Record Sensor Data</h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit IoT environmental readings for a batch in transit. A SHA-256 hash
            of this payload is anchored on the Fabric ledger for tamper-proof verification.
          </p>
        </div>

        {/* Compliance thresholds reminder */}
        <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex gap-4">
          <div>
            <span className="font-semibold">Temperature:</span> 0 – 10°C
          </div>
          <div>
            <span className="font-semibold">Humidity:</span> 0 – 90%
          </div>
          <div className="text-blue-500 italic">
            Breaches set batch to risk permanently.
          </div>
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

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="temp"
                value={form.temp}
                onChange={handleChange}
                required
                step="0.1"
                placeholder="e.g. 4.5"
                className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary
                  ${form.temp === '' ? 'border-gray-300' : tempOk ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}
              />
              {form.temp !== '' && (
                <p className={`mt-1 text-xs ${tempOk ? 'text-green-600' : 'text-red-600'}`}>
                  {tempOk ? '✓ Within cold-chain threshold (0–10°C)' : '⚠ Outside threshold — batch will be flagged as risk'}
                </p>
              )}
            </div>

            {/* Humidity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relative Humidity (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="humidity"
                value={form.humidity}
                onChange={handleChange}
                required
                step="0.1"
                min="0"
                max="100"
                placeholder="e.g. 65"
                className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary
                  ${form.humidity === '' ? 'border-gray-300' : humOk ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}
              />
              {form.humidity !== '' && (
                <p className={`mt-1 text-xs ${humOk ? 'text-green-600' : 'text-red-600'}`}>
                  {humOk ? '✓ Within threshold (0–90%)' : '⚠ Outside threshold — batch will be flagged as risk'}
                </p>
              )}
            </div>

            {/* GPS (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPS Coordinates <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="gps"
                value={form.gps}
                onChange={handleChange}
                placeholder="e.g. 6.5244,3.3792"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-mono focus:outline-none focus:ring-primary focus:border-primary"
              />
              <p className="mt-1 text-xs text-gray-400">Format: latitude,longitude</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="e.g. Ibadan Cold Storage Depot"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Timestamp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timestamp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="timestamp"
                value={form.timestamp}
                onChange={handleChange}
                required
                placeholder="2026-04-17T10:00:00+01:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-mono focus:outline-none focus:ring-primary focus:border-primary"
              />
              <p className="mt-1 text-xs text-gray-400">
                ISO-8601 with explicit timezone offset required for deterministic hash.
              </p>
            </div>

            {/* Error / success */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
                {error}
              </div>
            )}

            {result && (
              <div className={`border rounded-md p-4 text-sm ${result.compliant ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <p className="font-semibold mb-2">
                  {result.compliant ? '✓ Sensor data recorded — Batch COMPLIANT' : '⚠ Sensor data recorded — Batch flagged as RISK'}
                </p>
                <p className="text-xs font-mono break-all">
                  <span className="font-semibold not-italic">SHA-256 Hash:</span>
                  <br />{result.hash}
                </p>
                <p className="mt-2 text-xs opacity-75">
                  This hash is anchored on-chain. Any party can recompute it from the original
                  sensor values to verify data integrity.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Hashing and submitting…' : 'Submit Sensor Reading'}
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
      </div>
    </div>
  );
};

export default RecordSensor;
