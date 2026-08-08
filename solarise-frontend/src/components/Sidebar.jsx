import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleColorMap = {
  admin: 'bg-rose-100 text-rose-800 border-rose-200',
  agent: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  site_manager: 'bg-blue-100 text-blue-800 border-blue-200',
  doc_team: 'bg-purple-100 text-purple-800 border-purple-200',
  accounts: 'bg-amber-100 text-amber-800 border-amber-200',
};

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'agent';

  // Menu item access definitions matching adp_solarise_system_table.sql user roles
  const getMenuItems = () => {
    const allItems = [
      { name: 'Dashboard', path: '/', roles: ['admin', 'agent', 'site_manager', 'doc_team', 'accounts'], icon: 'dashboard' },
      { name: 'Projects', path: '/projects', roles: ['admin', 'agent', 'site_manager', 'doc_team', 'accounts'], icon: 'project' },
      { name: 'Consumers', path: '/consumers', roles: ['admin', 'agent', 'doc_team'], icon: 'consumer' },
      { name: 'Documents Desk', path: '/documents', roles: ['admin', 'doc_team', 'site_manager'], icon: 'document' },
      { name: 'Payments & Subsidies', path: '/payments', roles: ['admin', 'accounts'], icon: 'payment' },
    ];

    if (role === 'admin') return allItems;

    return allItems.filter((item) => item.roles.includes(role));
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between min-h-screen">
      <div className="p-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl shadow-sm border border-emerald-200">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Solarise Odisha</h1>
            <p className="text-[11px] text-gray-500 font-medium">PM Surya Ghar Portal</p>
          </div>
        </div>

        {/* Dynamic Role-Based Navigation */}
        <nav className="space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Navigation Menu ({role.replace(/_/g, ' ')})
          </div>
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end
              className={({ isActive }) => `
                flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition
                ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="capitalize">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Role Card Footer */}
      <div className="p-4 m-4 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
            {(user?.full_name || 'User').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">{user?.full_name || 'Authorized User'}</p>
            <span className={`inline-block px-2 py-0.5 mt-0.5 text-[10px] font-bold rounded-full border capitalize uppercase ${roleColorMap[role] || 'bg-gray-100 text-gray-700'}`}>
              {role.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;