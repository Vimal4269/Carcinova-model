import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CaseDetails from './pages/CaseDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/case/:id" element={<CaseDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
