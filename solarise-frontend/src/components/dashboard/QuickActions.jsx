import React from 'react';

const colorMap = {
  'solarise-green': 'bg-emerald-50 text-emerald-600',
  'solarise-blue': 'bg-blue-50 text-blue-600',
  'solarise-yellow': 'bg-amber-50 text-amber-600',
};

const QuickActions = () => {
  const actions = [
    {
      id: 1,
      title: 'New Project',
      description: 'Register a new solar project',
      icon: 'plus',
      color: 'solarise-green',
      path: '/projects',
    },
    {
      id: 2,
      title: 'Add Consumer',
      description: 'Add a new consumer to the system',
      icon: 'user-plus',
      color: 'solarise-blue',
      path: '/consumers',
    },
    {
      id: 3,
      title: 'Upload Document',
      description: 'Upload and verify documents',
      icon: 'upload',
      color: 'solarise-yellow',
      path: '/documents',
    },
    {
      id: 4,
      title: 'Record Payment',
      description: 'Record a payment transaction',
      icon: 'credit-card',
      color: 'solarise-green',
      path: '/payments',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
        <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <span>Quick Actions</span>
      </h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <div key={action.id} className="flex items-center space-x-4 p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className={`flex h-10 w-10 items-center justify-center ${colorMap[action.color] || 'bg-gray-100 text-gray-600'} rounded-xl shrink-0`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d={action.icon === 'plus' ? 'M12 4v16m8-8H4' :
                     action.icon === 'user-plus' ? 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' :
                     action.icon === 'upload' ? 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' :
                     'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'} />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
            <div className="text-xs">
              <a href={action.path} className="font-semibold text-emerald-600 hover:text-emerald-700">
                Go →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;