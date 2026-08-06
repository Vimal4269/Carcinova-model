import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: 'home' },
    { name: 'Case History', path: '/case-history', icon: 'history' },
    { name: 'Reports', path: '/reports', icon: 'description' } // Opens searchable list of reports
  ];

  const getLinkClasses = (path) => {
    const isActive = location.pathname.startsWith(path);
    if (isActive) {
      return "flex items-center gap-stack-default bg-surface-container-highest text-primary border-l-4 border-primary p-3 px-6 transition-transform scale-95 active:scale-90 no-drag";
    }
    return "flex items-center gap-stack-default text-outline-variant hover:text-on-surface hover:bg-surface-container-high p-3 px-6 transition-colors duration-200 no-drag";
  };

  const getIconClasses = (path) => {
    const isActive = location.pathname.startsWith(path);
    if (isActive) {
      return "material-symbols-outlined";
    }
    return "material-symbols-outlined";
  };

  const getSpanClasses = (path) => {
    const isActive = location.pathname.startsWith(path);
    if (isActive) {
      return "font-body-base text-body-base font-semibold";
    }
    return "font-body-base text-body-base";
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-[240px] flex flex-col py-margin-page gap-stack-default bg-inverse-surface border-r border-outline dark:border-outline-variant z-50 pt-[40px]">
      <div className="px-6 mb-8 no-drag">
        <h1 className="font-headline-md text-headline-md font-bold text-inverse-on-surface">Carcinova</h1>
        <p className="font-body-base text-body-base text-outline-variant opacity-70">Histopathology AI</p>
      </div>
      <div className="flex flex-col flex-1">
        {navItems.map(item => (
          <Link key={item.path} to={item.path} className={getLinkClasses(item.path)}>
            <span className={getIconClasses(item.path)} data-icon={item.icon}>{item.icon}</span>
            <span className={getSpanClasses(item.path)}>{item.name}</span>
          </Link>
        ))}
        
        <div className="mt-auto">
          <Link to="/settings" className={getLinkClasses('/settings')}>
            <span className={getIconClasses('/settings')} data-icon="settings">settings</span>
            <span className={getSpanClasses('/settings')}>Settings</span>
          </Link>

          {/* User Info & Logout */}
          {user && (
            <div className="px-4 py-3 mx-2 mt-2 mb-2 rounded-xl no-drag" style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff' }}>
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-inverse-on-surface" style={{ margin: 0, lineHeight: 1.2 }}>{user.username}</p>
                  <p className="text-xs text-outline-variant" style={{ margin: 0, opacity: 0.6 }}>Pathologist</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 no-drag"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
