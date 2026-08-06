import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden bg-surface flex relative">
      {/* SIDEBAR (Desktop fixed, Mobile drawer) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* TOP APP BAR */}
      <header className="fixed top-0 right-0 h-[48px] flex justify-between items-center px-4 md:px-margin-page bg-surface border-b border-outline-variant md:ml-[240px] w-full md:w-[calc(100%-240px)] z-40 no-drag">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Menu Icon */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-on-surface p-1.5 rounded-lg hover:bg-surface-container-high focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <span className="md:hidden font-bold text-on-surface text-lg">Carcinova</span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#a78bfa' }}>person</span>
              <span className="text-sm font-medium" style={{ color: '#c4b5fd' }}>
                {user.username}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-[240px] mt-[48px] h-[calc(100vh-48px)] overflow-y-auto no-drag">
        {children}
      </div>
    </div>
  );
};

export default Layout;
