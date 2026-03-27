import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Logo from '../components/Logo';
import StatusBadge from '../components/StatusBadge';
import CreateBatchModal from '../components/CreateBatchModal';
import TransferCustodyModal from '../components/TransferCustodyModal';
import IotDataModal from '../components/IotDataModal';

const ROLE_CONFIG = {
  farmer: {
    label: 'Farm Operator',
    badge: 'bg-green-100 text-green-800',
    description: 'Batch registration and origin records',
    listHeading: 'Registered Batches',
  },
  processor: {
    label: 'Processor',
    badge: 'bg-blue-100 text-blue-800',
    description: 'Processing stages and compliance monitoring',
    listHeading: 'Batches for Processing',
  },
  transporter: {
    label: 'Transporter',
    badge: 'bg-amber-100 text-amber-800',
    description: 'Environmental monitoring and logistics',
    listHeading: 'Batches in Transit',
  },
  distributor: {
    label: 'Distributor',
    badge: 'bg-amber-100 text-amber-800',
    description: 'Logistics and custody transfers',
    listHeading: 'Assigned Batches',
  },
  retailer: {
    label: 'Retailer',
    badge: 'bg-purple-100 text-purple-800',
    description: 'Final verification and display readiness',
    listHeading: 'Received Batches',
  },
};

const DEFAULT_RC = {
  label: 'Stakeholder',
  badge: 'bg-gray-100 text-gray-700',
  description: 'Supply chain stakeholder',
  listHeading: 'Assigned Batches',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(() => api.getCurrentUser());
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.getAllBatches()
      .then(data => {
        if (!cancelled) {
          setBatches(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load batches. Please refresh to try again.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleLogout = () => { api.logout(); navigate('/'); };

  const triggerRefresh = () => {
    setLoading(true);
    setError(null);
    setRefreshKey(k => k + 1);
  };

  const handleSuccess = () => { setActiveModal(null); triggerRefresh(); };
  const closeModal = () => setActiveModal(null);

  const role = user?.role;
  const rc = ROLE_CONFIG[role] || DEFAULT_RC;

  const canCreate   = role === 'farmer';
  const canTransfer = ['processor', 'transporter', 'distributor'].includes(role);
  const canIoT      = ['transporter', 'distributor'].includes(role);

  const secureCount = batches.filter(b => b.status?.toLowerCase() === 'safe').length;
  const riskCount   = batches.filter(b => b.status?.toLowerCase() === 'risk').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/')}>
            <Logo size="sm" variant="white" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80 hidden sm:block">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
              aria-label="Logout"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-base">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'S'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h2 className="text-sm font-bold text-gray-900 truncate">{user?.name ?? 'Stakeholder'}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${rc.badge}`}>
                  {rc.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {user?.org} &middot; {rc.description}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 text-sm">Loading batches...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium text-sm">{error}</p>
            <button
              onClick={triggerRefresh}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Batches', value: batches.length,  color: 'text-gray-900'  },
                { label: 'Active Risks',  value: riskCount,       color: 'text-red-600'   },
                { label: 'Compliant',     value: secureCount,     color: 'text-green-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-snug">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-900">{rc.listHeading}</h3>
                {canCreate && (
                  <button
                    onClick={() => setActiveModal('create')}
                    className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-green-800 transition flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Register Batch
                  </button>
                )}
              </div>

              <ul className="divide-y divide-gray-100">
                {batches.length === 0 ? (
                  <li className="px-5 py-12 text-center">
                    <p className="text-gray-500 text-sm">
                      No batches are currently assigned to your organisation.
                    </p>
                    {canCreate && (
                      <button
                        onClick={() => setActiveModal('create')}
                        className="mt-3 text-primary text-sm font-medium hover:underline"
                      >
                        Register your first batch
                      </button>
                    )}
                  </li>
                ) : (
                  batches.map(batch => (
                    <BatchRow
                      key={batch.id}
                      batch={batch}
                      role={role}
                      canTransfer={canTransfer}
                      canIoT={canIoT}
                      onViewJourney={() => navigate(`/verify/${batch.id}`)}
                      onTransfer={() => setActiveModal({ type: 'transfer', batchId: batch.id })}
                      onIoT={() => setActiveModal({ type: 'iot', batchId: batch.id })}
                    />
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </main>

      {activeModal === 'create' && (
        <CreateBatchModal onClose={closeModal} onSuccess={handleSuccess} />
      )}
      {activeModal?.type === 'transfer' && (
        <TransferCustodyModal
          batchId={activeModal.batchId}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
      {activeModal?.type === 'iot' && (
        <IotDataModal
          batchId={activeModal.batchId}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

const BatchRow = ({ batch, role, canTransfer, canIoT, onViewJourney, onTransfer, onIoT }) => {
  const dateStr = batch.lastUpdate
    ? new Date(batch.lastUpdate).toLocaleDateString()
    : 'N/A';

  return (
    <li className="px-5 py-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{batch.produceType}</p>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{batch.id}</p>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={batch.status} />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {batch.location}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {dateStr}
        </span>
        {batch.stage && (
          <span className="capitalize">{batch.stage}</span>
        )}
      </div>

      {role === 'farmer' && batch.origin && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded mb-2">
          Origin: {batch.origin}
        </p>
      )}
      {role === 'processor' && (
        <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded mb-2">
          Compliance status: {batch.status ?? 'Pending review'}
        </p>
      )}
      {(role === 'transporter' || role === 'distributor') && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded mb-2">
          Current custody leg: {batch.location}
        </p>
      )}
      {role === 'retailer' && (
        <p className="text-xs text-purple-700 bg-purple-50 border border-purple-100 px-2 py-1 rounded mb-2">
          Display ready:{' '}
          {batch.status?.toLowerCase() === 'safe'
            ? 'Yes — passed all compliance checks'
            : 'Pending verification'}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={onViewJourney}
          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Journey
        </button>

        {canTransfer && (
          <button
            onClick={onTransfer}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transfer Custody
          </button>
        )}

        {canIoT && (
          <button
            onClick={onIoT}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Submit IoT Data
          </button>
        )}
      </div>
    </li>
  );
};

export default Dashboard;
