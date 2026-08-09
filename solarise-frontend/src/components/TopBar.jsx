import React from 'react';
import NotificationPopup from './NotificationPopup';

const TopBar = ({ onLogout, user, onToggleMobileMenu }) => {
  const userName =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.firstName ||
    user?.username ||
    (user?.email ? user.email.split('@')[0] : 'Authorized User');

  const userRole = (user?.role || 'operator').toUpperCase();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition focus:outline-none"
          title="Open menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-slate-900 text-sm sm:text-lg tracking-tight truncate max-w-[140px] sm:max-w-none">
            Solarise Operations
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            PM-SURYA GHAR
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search Bar - hidden on mobile screens to maintain layout integrity */}
        <div className="relative hidden lg:block w-56 xl:w-64">
          <input
            type="text"
            placeholder="Search projects, consumers..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.636 12.364m0 0A7.5 7.5 0 1112.364 5.636z"/>
            </svg>
          </div>
        </div>

        {/* Real-Time Interactive Notification Popup */}
        <NotificationPopup user={user} />

        {/* User profile avatar & name */}
        <div className="flex items-center space-x-2 sm:space-x-3 bg-slate-50 p-1.5 pr-2.5 sm:pr-3 rounded-full border border-slate-200/80 shadow-2xs">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-2xs shrink-0">
            <div className="h-full w-full bg-white rounded-full flex items-center justify-center font-extrabold text-emerald-700 text-xs uppercase font-mono">
              {userName.charAt(0)}
            </div>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-extrabold text-slate-900 leading-tight truncate max-w-[120px]">{userName}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider leading-none mt-0.5">{userRole}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-full border border-slate-200/80 transition"
          title="Sign out of portal"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;