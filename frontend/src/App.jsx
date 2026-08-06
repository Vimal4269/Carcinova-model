import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CaseHistory from './pages/CaseHistory';
import BatchMonitor from './pages/BatchMonitor';
import ManualComparison from './pages/ManualComparison';
import AnalysisResult from './pages/AnalysisResult';
import ReportPreview from './pages/ReportPreview';
import ReportsList from './pages/ReportsList';
import Settings from './pages/Settings';
import AnnotationWorkspace from './pages/AnnotationWorkspace';
import './App.css'; 

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Protected Application Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/case-history" element={<ProtectedRoute><Layout><CaseHistory /></Layout></ProtectedRoute>} />
      <Route path="/annotate/:slideId" element={<ProtectedRoute><Layout><AnnotationWorkspace /></Layout></ProtectedRoute>} />
      <Route path="/batch" element={<ProtectedRoute><Layout><BatchMonitor /></Layout></ProtectedRoute>} />
      <Route path="/comparison" element={<ProtectedRoute><Layout><ManualComparison /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/case-detail/:id" element={<ProtectedRoute><Layout><AnalysisResult /></Layout></ProtectedRoute>} />
      <Route path="/report-preview/:id" element={<ProtectedRoute><Layout><ReportPreview /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><ReportsList /></Layout></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
