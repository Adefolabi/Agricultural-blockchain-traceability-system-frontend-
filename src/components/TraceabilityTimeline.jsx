import React from 'react';

const TraceabilityTimeline = ({ journey }) => {
  if (!journey || journey.length === 0) return null;

  return (
    <div className="py-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">Product Journey</h3>
      <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
        {journey.map((step, index) => {
          const isLast = index === journey.length - 1;
          const isRisk = step.status && step.status.toLowerCase() === 'risk';
          
          return (
            <div key={index} className="relative pl-8">
              {/* Dot Indicator */}
              <div 
                className={`
                  absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white
                  ${isRisk ? 'bg-red-600' : 'bg-green-600'}
                `}
              ></div>

              {/* Content Card */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-gray-900">{step.stage}</h4>
                  <span className="text-xs text-gray-400 font-mono">
                    {step.time}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{step.location}</p>
                
                {/* Status Indicator */}
                <div className="flex items-center">
                  <span 
                    className={`
                      text-xs font-semibold px-2 py-0.5 rounded
                      ${isRisk 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                      }
                    `}
                  >
                    {step.status || 'Completed'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TraceabilityTimeline;
