import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService, projectService } from '../../services/api';

const RecentActivity = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll();
      const notifList = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      if (notifList.length > 0) {
        setActivities(notifList.slice(0, 5).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.body || 'System activity record',
          time: new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          projectId: item.project_id,
          type: item.title?.toLowerCase().includes('doc') ? 'document' : item.title?.toLowerCase().includes('pay') ? 'payment' : 'system',
        })));
      } else {
        const projRes = await projectService.getAll();
        const projList = Array.isArray(projRes.data?.data) ? projRes.data.data : (Array.isArray(projRes.data) ? projRes.data : []);
        if (projList.length > 0) {
          setActivities(projList.slice(0, 5).map((p) => ({
            id: p.id,
            title: `Project Status: ${(p.current_status || '').replace(/_/g, ' ')}`,
            description: `Registration #${p.registration_no || `PROJ-${p.id}`} for Consumer #${p.consumer_id}`,
            time: new Date(p.created_at || Date.now()).toLocaleDateString(),
            projectId: p.id,
            type: 'project',
          })));
        } else {
          setActivities([]);
        }
      }
    } catch (err) {
      console.warn('Notification service error, showing clean activity state:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    if (type === 'payment') {
      return (
        <div className="h-9 w-9 rounded-[14px] bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
    if (type === 'document') {
      return (
        <div className="h-9 w-9 rounded-[14px] bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0 shadow-2xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="h-9 w-9 rounded-[14px] bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0 shadow-2xs">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Activity Stream</h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Real-time feed
          </span>
        </div>

        {/* Activity Items List */}
        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100/70 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">No recent activity recorded.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                onClick={() => act.projectId && navigate(`/projects/${act.projectId}`)}
                className="p-3.5 bg-slate-50/80 hover:bg-emerald-50/50 transition-all rounded-[20px] border border-slate-200/60 flex items-center space-x-3.5 cursor-pointer group shadow-2xs"
              >
                {getIcon(act.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                      {act.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                      {act.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="pt-4 border-t border-slate-100 mt-4 text-right">
        <button
          onClick={() => navigate('/projects')}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition flex items-center justify-end space-x-1 ml-auto"
        >
          <span>View All Pipeline Activity</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;