import React from 'react';

// Human-readable labels for chaincode event actions
const ACTION_LABELS = {
  CREATED:          'Batch Created',
  CUSTODY_TRANSFER: 'Custody Transfer',
  SENSOR_READING:   'Sensor Reading',
};

// Icon per action type
function ActionIcon({ action }) {
  if (action === 'CREATED') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    );
  }
  if (action === 'CUSTODY_TRANSFER') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    );
  }
  // SENSOR_READING
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

/**
 * Renders the full blockchain event history for a batch.
 *
 * Accepts journey events in the format returned by GET /api/verify/:batchId:
 *   { action, actor, stage, location, timestamp, details }
 *
 * details varies by action:
 *   CREATED          → { variety, quantity }
 *   CUSTODY_TRANSFER → { previousOwner, newOwner }
 *   SENSOR_READING   → { temp, humidity, gps?, compliant, sensorDataHash }
 */
const TraceabilityTimeline = ({ journey }) => {
  if (!journey || journey.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-4 text-center">
        No journey events recorded yet.
      </p>
    );
  }

  return (
    <div className="py-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Product Journey</h3>

      <div className="relative border-l-2 border-gray-200 ml-4 space-y-6">
        {journey.map((event, index) => {
          const isRisk =
            event.action === 'SENSOR_READING' &&
            event.details?.compliant === false;

          const label = ACTION_LABELS[event.action] || event.stage || event.action;
          const formattedTime = event.timestamp
            ? new Date(event.timestamp).toLocaleString()
            : '';

          return (
            <div key={index} className="relative pl-8">
              {/* Timeline dot */}
              <div
                className={`
                  absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white
                  flex items-center justify-center
                  ${isRisk ? 'bg-red-500' : 'bg-green-500'}
                `}
              />

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                {/* Header row */}
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1 rounded-full ${isRisk ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                    >
                      <ActionIcon action={event.action} />
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{label}</h4>
                  </div>
                  <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
                    {formattedTime}
                  </span>
                </div>

                {/* Location */}
                {event.location && (
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </p>
                )}

                {/* Actor */}
                {event.actor && (
                  <p className="text-xs text-gray-400 mb-2">
                    By: <span className="font-medium text-gray-600">{event.actor}</span>
                  </p>
                )}

                {/* CREATED details */}
                {event.action === 'CREATED' && event.details && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 space-y-0.5">
                    {event.details.variety   && <p>Variety: <strong>{event.details.variety}</strong></p>}
                    {event.details.quantity  && <p>Quantity: <strong>{event.details.quantity}</strong></p>}
                  </div>
                )}

                {/* CUSTODY_TRANSFER details */}
                {event.action === 'CUSTODY_TRANSFER' && event.details && (
                  <div className="text-xs text-gray-500 bg-blue-50 rounded p-2 flex items-center gap-2">
                    <span className="font-medium text-gray-700">{event.details.previousOwner}</span>
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="font-medium text-gray-700">{event.details.newOwner}</span>
                  </div>
                )}

                {/* SENSOR_READING details */}
                {event.action === 'SENSOR_READING' && event.details && (
                  <div className="text-xs bg-gray-50 rounded p-2 space-y-0.5">
                    {event.details.temp      !== undefined && (
                      <p className="text-gray-600">
                        Temperature:{' '}
                        <strong className={event.details.temp < 0 || event.details.temp > 10 ? 'text-red-600' : 'text-green-700'}>
                          {event.details.temp}°C
                        </strong>
                      </p>
                    )}
                    {event.details.humidity  !== undefined && (
                      <p className="text-gray-600">
                        Humidity:{' '}
                        <strong className={event.details.humidity < 0 || event.details.humidity > 90 ? 'text-red-600' : 'text-green-700'}>
                          {event.details.humidity}%
                        </strong>
                      </p>
                    )}
                    {event.details.gps && (
                      <p className="text-gray-500">GPS: {event.details.gps}</p>
                    )}
                    {event.details.sensorDataHash && (
                      <p className="text-gray-400 font-mono truncate" title={event.details.sensorDataHash}>
                        Hash: {event.details.sensorDataHash.slice(0, 20)}…
                      </p>
                    )}
                  </div>
                )}

                {/* Compliance pill — only meaningful for sensor readings */}
                {event.action === 'SENSOR_READING' && (
                  <div className="mt-2">
                    <span
                      className={`
                        text-xs font-semibold px-2 py-0.5 rounded
                        ${isRisk
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'}
                      `}
                    >
                      {isRisk ? 'Threshold Breached' : 'Compliant'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TraceabilityTimeline;
