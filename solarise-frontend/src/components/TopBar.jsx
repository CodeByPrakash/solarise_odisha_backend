import React from 'react';
import NotificationPopup from './NotificationPopup';

const TopBar = ({ onLogout, user }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          id="mobile-menu-button"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 hidden md:block">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search placeholder */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search projects, consumers, documents..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-solarise-green focus:border-solarise-green transition"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.636 12.364m0 0A7.5 7.5 0 1112.364 5.636z"/>
            </svg>
          </div>
        </div>

        {/* Real-Time Interactive Notification Popup */}
        <NotificationPopup user={user} />

        {/* User profile */}
        <div className="flex items-center space-x-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
            alt="User avatar"
            className="h-8 w-8 rounded-full border-2 border-solarise-green"
          />
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{user?.firstName || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.role || ''}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-solarise-green text-white rounded-lg hover:bg-solarise-green/90 transition"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopBar;