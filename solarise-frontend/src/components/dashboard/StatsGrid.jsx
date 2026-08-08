import React, { useState, useEffect } from 'react';
import { projectService, consumerService, documentService, paymentService } from '../../services/api';

const colorMap = {
  'solarise-green': {
    border: 'border-emerald-500',
    bg: 'bg-emerald-50 text-emerald-600',
    text: 'text-emerald-600',
  },
  'solarise-blue': {
    border: 'border-blue-500',
    bg: 'bg-blue-50 text-blue-600',
    text: 'text-blue-600',
  },
  'solarise-yellow': {
    border: 'border-amber-500',
    bg: 'bg-amber-50 text-amber-600',
    text: 'text-amber-600',
  },
};

const StatsGrid = () => {
  const [statsData, setStatsData] = useState({
    projectsCount: 0,
    consumersCount: 0,
    documentsCount: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projRes, consRes, docRes, payRes] = await Promise.allSettled([
        projectService.getAll(),
        consumerService.getAll(),
        documentService.getAll(),
        paymentService.getAll(),
      ]);

      const projPayload = projRes.status === 'fulfilled' ? projRes.value.data : null;
      const consPayload = consRes.status === 'fulfilled' ? consRes.value.data : null;
      const docPayload = docRes.status === 'fulfilled' ? docRes.value.data : null;
      const payPayload = payRes.status === 'fulfilled' ? payRes.value.data : null;

      const projects = Array.isArray(projPayload?.data) ? projPayload.data : (Array.isArray(projPayload) ? projPayload : []);
      const consumers = Array.isArray(consPayload?.data) ? consPayload.data : (Array.isArray(consPayload) ? consPayload : []);
      const documents = Array.isArray(docPayload?.data) ? docPayload.data : (Array.isArray(docPayload) ? docPayload : []);
      const payments = Array.isArray(payPayload?.data) ? payPayload.data : (Array.isArray(payPayload) ? payPayload : []);

      const projectsCount = typeof projPayload?.count === 'number' ? projPayload.count : (typeof projPayload?.total_projects === 'number' ? projPayload.total_projects : projects.length);
      const consumersCount = typeof consPayload?.count === 'number' ? consPayload.count : consumers.length;
      const documentsCount = typeof docPayload?.count === 'number' ? docPayload.count : documents.length;

      const sumRevenue = payments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      setStatsData({
        projectsCount,
        consumersCount,
        documentsCount,
        totalPayments: sumRevenue,
      });
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Unable to load live backend metrics');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Projects',
      value: statsData.projectsCount.toString(),
      icon: 'project',
      color: 'solarise-green',
      subtitle: 'Registered solar projects',
    },
    {
      title: 'Active Consumers',
      value: statsData.consumersCount.toString(),
      icon: 'consumer',
      color: 'solarise-blue',
      subtitle: 'Consumer records',
    },
    {
      title: 'Documents Logged',
      value: statsData.documentsCount.toString(),
      icon: 'document',
      color: 'solarise-yellow',
      subtitle: 'Geotagged & verified docs',
    },
    {
      title: 'Total Revenue Collected',
      value: `₹${statsData.totalPayments.toLocaleString('en-IN')}`,
      icon: 'payment',
      color: 'solarise-green',
      subtitle: 'Confirmed paid records',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse h-28 border border-gray-100 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const styles = colorMap[stat.color] || colorMap['solarise-green'];
          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4 ${styles.border}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="mt-1 text-xs text-gray-400">{stat.subtitle}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${styles.bg} flex items-center justify-center shrink-0`}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d={stat.icon === 'project' ? 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' :
                         stat.icon === 'consumer' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' :
                         stat.icon === 'document' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' :
                         'M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a4 4 0 110-8 4 4 0 010 8z'}/>
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsGrid;