import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleColorMap = {
  admin: 'bg-rose-50 text-rose-700 border-rose-200',
  agent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  site_manager: 'bg-blue-50 text-blue-700 border-blue-200',
  doc_team: 'bg-purple-50 text-purple-700 border-purple-200',
  accounts: 'bg-amber-50 text-amber-700 border-amber-200',
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'agent';
  const firstName = user?.first_name || (user?.full_name ? user.full_name.split(' ')[0] : '') || user?.firstName || 'User';
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.full_name || user?.firstName || 'Authorized User';
  const firstLetter = (firstName || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const allItems = [
      { name: 'Dashboard', path: '/', roles: ['admin', 'agent', 'site_manager', 'doc_team', 'accounts'], icon: '⚡' },
      { name: 'Projects', path: '/projects', roles: ['admin', 'agent', 'site_manager', 'doc_team', 'accounts'], icon: '📦' },
      { name: 'Consumers', path: '/consumers', roles: ['admin', 'agent', 'doc_team'], icon: '👤' },
      { name: 'Documents Desk', path: '/documents', roles: ['admin', 'doc_team', 'site_manager'], icon: '📄' },
      { name: 'Payments & Subsidies', path: '/payments', roles: ['admin', 'accounts'], icon: '💳' },
      { name: 'Area Blocks', path: '/area-blocks', roles: ['admin', 'agent', 'site_manager', 'doc_team', 'accounts'], icon: '🗺️' },
      { name: 'User Management', path: '/users', roles: ['admin', 'doc_team', 'site_manager', 'accounts', 'agent'], icon: '👥' },
    ];

    if (role === 'admin') return allItems;
    return allItems.filter((item) => item.roles.includes(role));
  };

  const menuItems = getMenuItems();

  const renderContent = () => (
    <div className="flex flex-col justify-between h-full bg-white">
      <div className="p-5 sm:p-6 overflow-y-auto flex-1">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              ☀️
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">SOLARISE ODISHA</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PM Surya Ghar Portal</p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dynamic Role-Based Navigation */}
        <nav className="space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Navigation Menu ({role.replace(/_/g, ' ')})
          </div>
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end
              onClick={() => onClose && onClose()}
              className={({ isActive }) => `
                flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all
                ${isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <span className="text-base">{item.icon}</span>
              <span className="capitalize">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Account / Role Card with First Letter Logo & Logout Icon */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-9 w-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-extrabold text-sm shadow-2xs shrink-0 font-mono">
                {firstLetter}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900 truncate" title={fullName}>
                  {firstName}
                </p>
                <span className={`inline-block px-2 py-0.5 mt-0.5 text-[9px] font-extrabold rounded-full border uppercase tracking-wider ${roleColorMap[role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {role.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 border border-transparent hover:border-rose-100"
              title="Logout from portal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 border-r border-slate-200/80 hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-30">
        {renderContent()}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          ></div>

          {/* Slide-in Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-50 transform transition-transform duration-300">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;