import React, { useState, useEffect } from 'react';
import { notificationService, projectService } from '../../services/api';

const colorMap = {
  'solarise-green': 'bg-emerald-50 text-emerald-600',
  'solarise-blue': 'bg-blue-50 text-blue-600',
  'solarise-yellow': 'bg-amber-50 text-amber-600',
};

const RecentActivity = () => {
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
        setActivities(notifList.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.body || 'System activity record',
          time: new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          icon: 'notification',
          color: 'solarise-blue',
        })));
      } else {
        // Fallback to latest projects list as real activity feed if no notifications exist yet
        const projRes = await projectService.getAll();
        const projList = Array.isArray(projRes.data?.data) ? projRes.data.data : (Array.isArray(projRes.data) ? projRes.data : []);
        if (projList.length > 0) {
          setActivities(projList.slice(0, 5).map((p) => ({
            id: p.id,
            title: `Project Status: ${(p.current_status || '').replace(/_/g, ' ')}`,
            description: `Registration #${p.registration_no || `PROJ-${p.id}`} for Consumer #${p.consumer_id}`,
            time: new Date(p.created_at || Date.now()).toLocaleDateString(),
            icon: 'project',
            color: 'solarise-green',
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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Recent Activity</span>
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          <svg className="h-10 w-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          No recent system activity recorded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start space-x-4">
                <div className={`flex h-10 w-10 items-center justify-center ${colorMap[activity.color] || 'bg-gray-100 text-gray-600'} rounded-xl shrink-0`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d={activity.icon === 'project' ? 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' :
                         'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'}/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{activity.title}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">{activity.description}</p>
                  <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;