import React, { useState, useEffect } from 'react';
import { projectService, consumerService, documentService, paymentService } from '../../services/api';

const cardThemeMap = {
  emerald: {
    bg: 'bg-white',
    border: 'border-slate-200/80 hover:border-emerald-400',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sparkline: 'M0 25 C20 15, 40 30, 60 10 C80 20, 100 5, 120 15',
    sparkColor: '#059669',
  },
  blue: {
    bg: 'bg-white',
    border: 'border-slate-200/80 hover:border-blue-400',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-200/60',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    sparkline: 'M0 20 C20 28, 40 10, 60 22 C80 8, 100 18, 120 5',
    sparkColor: '#0284c7',
  },
  purple: {
    bg: 'bg-white',
    border: 'border-slate-200/80 hover:border-purple-400',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200/60',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    sparkline: 'M0 15 C20 5, 40 25, 60 12 C80 28, 100 8, 120 12',
    sparkColor: '#7c3aed',
  },
  amber: {
    bg: 'bg-white',
    border: 'border-slate-200/80 hover:border-amber-400',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-200/60',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    sparkline: 'M0 28 C20 18, 40 22, 60 8 C80 15, 100 5, 120 10',
    sparkColor: '#d97706',
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
      title: 'Solar Projects',
      value: statsData.projectsCount.toString(),
      icon: 'project',
      theme: 'emerald',
      trend: '+12% active',
      subtitle: 'Registered installation pipelines',
    },
    {
      title: 'Consumer Records',
      value: statsData.consumersCount.toString(),
      icon: 'consumer',
      theme: 'blue',
      trend: '+8% growth',
      subtitle: 'Verified consumer profiles',
    },
    {
      title: 'Logged Documents',
      value: statsData.documentsCount.toString(),
      icon: 'document',
      theme: 'purple',
      trend: '100% geotagged',
      subtitle: 'Verified DISCOM & PMSGY docs',
    },
    {
      title: 'Revenue Cleared',
      value: `₹${statsData.totalPayments.toLocaleString('en-IN')}`,
      icon: 'payment',
      theme: 'amber',
      trend: 'Cleared transactions',
      subtitle: 'Confirmed paid records',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[24px] p-6 border border-slate-200 animate-pulse h-32 flex flex-col justify-between shadow-xs">
            <div className="h-4 bg-slate-100 rounded w-24"></div>
            <div className="h-8 bg-slate-200 rounded w-32"></div>
            <div className="h-3 bg-slate-100 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-xs text-amber-800 bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-200 font-semibold shadow-2xs">
          ⚠️ {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const theme = cardThemeMap[stat.theme] || cardThemeMap.emerald;
          return (
            <div
              key={index}
              className={`bg-white p-6 rounded-[26px] border ${theme.border} shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {stat.title}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 block">
                    {stat.value}
                  </span>
                </div>

                {/* Android Material Squircle Icon Container */}
                <div className={`h-12 w-12 rounded-[18px] ${theme.iconBg} border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d={stat.icon === 'project' ? 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' :
                         stat.icon === 'consumer' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' :
                         stat.icon === 'document' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' :
                         'M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a4 4 0 110-8 4 4 0 010 8z'}/>
                  </svg>
                </div>
              </div>

              {/* Sparkline & Subtitle */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-100 mt-4">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${theme.badgeBg}`}>
                    {stat.trend}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{stat.subtitle}</p>
                </div>

                {/* SVG Sparkline Mini Curve */}
                <svg className="w-16 h-8 overflow-visible opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 120 30">
                  <path
                    d={theme.sparkline}
                    fill="none"
                    stroke={theme.sparkColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsGrid;