import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="w-full h-screen overflow-hidden bg-surface flex">
      <Sidebar />
      
      {/* TOP APP BAR */}
      <header className="fixed top-0 right-0 h-toolbar-height flex justify-between items-center px-margin-page bg-surface border-b border-outline-variant ml-[240px] w-[calc(100%-240px)] z-40 pt-[10px] no-drag">
        <div className="flex items-center gap-6">
        </div>
        <div className="flex items-center gap-4">
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-[240px] mt-[48px] h-[calc(100vh-48px)] overflow-y-auto no-drag">
        {children}
      </div>
    </div>
  );
};

export default Layout;
