import React from 'react';
import StatsGrid from '../../components/dashboard/StatsGrid';
import RecentActivity from '../../components/dashboard/RecentActivity';
import QuickActions from '../../components/dashboard/QuickActions';

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <svg className="h-5 w-5 text-solarise-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a4 4 0 110-8 4 4 0 010 8z"/>
          </svg>
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your solar projects and operations
        </p>
      </header>

      <StatsGrid />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;