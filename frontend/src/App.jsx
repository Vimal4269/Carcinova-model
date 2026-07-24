import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CaseHistory from './pages/CaseHistory';
import BatchMonitor from './pages/BatchMonitor';
import ManualComparison from './pages/ManualComparison';
import AnalysisResult from './pages/AnalysisResult';
import ReportPreview from './pages/ReportPreview';
import ReportsList from './pages/ReportsList';
import Settings from './pages/Settings';
import AnnotationWorkspace from './pages/AnnotationWorkspace'; // We will build this next
import './App.css'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Application Routes wrapped with Layout */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/case-history" element={<Layout><CaseHistory /></Layout>} />
        
        {/* New Annotation Workspace Route */}
        <Route path="/annotate/:slideId" element={<Layout><AnnotationWorkspace /></Layout>} />

        <Route path="/batch" element={<Layout><BatchMonitor /></Layout>} />
        <Route path="/comparison" element={<Layout><ManualComparison /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        
        {/* Case Detail views */}
        <Route path="/case-detail/:id" element={<Layout><AnalysisResult /></Layout>} />
        <Route path="/report-preview/:id" element={<Layout><ReportPreview /></Layout>} />
        <Route path="/reports" element={<Layout><ReportsList /></Layout>} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
