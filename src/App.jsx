import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home            from './pages/Home';
import Scan            from './pages/Scan';
import Verify          from './pages/Verify';
import Login           from './pages/Login';
import Dashboard       from './pages/Dashboard';
import CreateBatch     from './pages/CreateBatch';
import TransferCustody from './pages/TransferCustody';
import RecordSensor    from './pages/RecordSensor';
import ProtectedRoute  from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────────────────────── */}
        <Route path="/"                 element={<Home />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/scan"             element={<Scan />} />
        <Route path="/verify/:batchId"  element={<Verify />} />

        {/* ── Protected stakeholder routes ──────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-batch"
          element={
            <ProtectedRoute requiredRole="farmer">
              <CreateBatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer/:batchId?"
          element={
            <ProtectedRoute>
              <TransferCustody />
            </ProtectedRoute>
          }
        />
        <Route
          path="/record-sensor/:batchId?"
          element={
            <ProtectedRoute requiredRole="transporter">
              <RecordSensor />
            </ProtectedRoute>
          }
        />

        {/* ── Fallback ──────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
