import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: 'home' },
    { name: 'Case History', path: '/case-history', icon: 'history' },
    { name: 'Reports', path: '/reports', icon: 'description' }
  ];

  const getLinkClasses = (path) => {
    const isActive = location.pathname.startsWith(path);
    if (isActive) {
      return "flex items-center gap-stack-default bg-surface-container-highest text-primary border-l-4 border-primary px-6 min-h-[48px] transition-transform active:scale-95 no-drag";
    }
    return "flex items-center gap-stack-default text-outline-variant hover:text-on-surface hover:bg-surface-container-high px-6 min-h-[48px] transition-colors duration-200 no-drag active:bg-surface-container-highest";
  };

  const getIconClasses = () => "material-symbols-outlined";

  const getSpanClasses = (path) => {
    const isActive = location.pathname.startsWith(path);
    return isActive ? "font-body-base text-body-base font-semibold" : "font-body-base text-body-base";
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Navigation Drawer */}
      <nav
        className={`fixed left-0 top-0 h-full w-[280px] md:w-[240px] flex flex-col py-margin-page gap-stack-default bg-inverse-surface border-r border-outline dark:border-outline-variant z-50 pt-[40px] transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-6 mb-8 no-drag flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-inverse-on-surface">Carcinova</h1>
            <p className="font-body-base text-body-base text-outline-variant opacity-70">Histopathology AI</p>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-outline-variant hover:text-white p-2 rounded-lg active:bg-white/10"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex flex-col flex-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={getLinkClasses(item.path)}
            >
              <span className={getIconClasses()} data-icon={item.icon}>{item.icon}</span>
              <span className={getSpanClasses(item.path)}>{item.name}</span>
            </Link>
          ))}

          <div className="mt-auto">
            <Link
              to="/settings"
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={getLinkClasses('/settings')}
            >
              <span className={getIconClasses()} data-icon="settings">settings</span>
              <span className={getSpanClasses('/settings')}>Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
