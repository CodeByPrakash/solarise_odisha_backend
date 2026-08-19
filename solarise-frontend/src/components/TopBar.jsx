import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationPopup from './NotificationPopup';
import { useTheme } from '../context/ThemeContext';

const TopBar = ({ onLogout, user, onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userName =
    (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null) ||
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.firstName ||
    user?.username ||
    (user?.email ? user.email.split('@')[0] : 'Authorized User');

  const userRole = (user?.role || 'operator').toUpperCase();
  const userEmail = user?.email || 'user@solarise.gov.in';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="font-extrabold text-slate-900 text-sm sm:text-lg tracking-tight truncate max-w-[140px] sm:max-w-none">
            Solarise Operations
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            PM-SURYA GHAR
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search Bar */}
        <div className="relative hidden lg:block w-56 xl:w-64">
          <input
            type="text"
            placeholder="Search projects, consumers..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.636 12.364m0 0A7.5 7.5 0 1112.364 5.636z" />
            </svg>
          </div>
        </div>

        {/* Real-Time Interactive Notification Popup */}
        <NotificationPopup user={user} />

        {/* Dark & Light Theme Switch Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
          className="p-2 sm:px-3 sm:py-2 rounded-full border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-amber-400 dark:hover:bg-slate-700 shadow-2xs transition flex items-center space-x-1.5 focus:outline-none ring-2 ring-transparent focus:ring-emerald-500/20"
        >
          {isDark ? (
            <>
              {/* Sun Icon */}
              <svg className="w-4 h-4 text-amber-400 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="hidden sm:inline-block text-xs font-bold font-mono text-amber-400">Light</span>
            </>
          ) : (
            <>
              {/* Moon Icon */}
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="hidden sm:inline-block text-xs font-bold font-mono text-slate-600">Dark</span>
            </>
          )}
        </button>

        {/* Interactive User Profile Dropdown Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 sm:space-x-3 bg-slate-50 hover:bg-slate-100 p-1.5 pr-2.5 sm:pr-3 rounded-full border border-slate-200/80 shadow-2xs transition focus:outline-none ring-2 ring-transparent focus:ring-emerald-500/20"
          >
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-2xs shrink-0">
              <div className="h-full w-full bg-white rounded-full flex items-center justify-center font-extrabold text-emerald-700 text-xs uppercase font-mono">
                {userName.charAt(0)}
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-extrabold text-slate-900 leading-tight truncate max-w-[120px]">{userName}</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider leading-none mt-0.5">{userRole}</p>
            </div>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-[24px] border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm uppercase font-mono shrink-0 shadow-sm">
                    {userName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{userName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                      {userRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center space-x-2.5 transition"
                >
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>My Profile & Settings</span>
                </button>

                {['admin', 'doc_team'].includes(user?.role?.toLowerCase()) && (
                  <button
                    onClick={() => handleNavigate('/users')}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center space-x-2.5 transition"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>System User Governance</span>
                  </button>
                )}

                <button
                  onClick={() => handleNavigate('/area-blocks')}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center space-x-2.5 transition"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>Coverage Area Blocks</span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center space-x-2.5 transition"
                >
                  {isDark ? (
                    <>
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Switch to Light Theme</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span>Switch to Dark Theme</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sign Out Footer */}
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2.5 transition"
                >
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;