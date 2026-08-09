import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/api';

export const NotificationPopup = ({ user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [loading, setLoading] = useState(false);

  const popoverRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Auto-poll real DB notifications every 15s
    return () => clearInterval(interval);
  }, [user]);

  // Handle outside clicks to close popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let res;
      const userId = user?.id || user?.userId;
      if (userId) {
        res = await notificationService.getUserNotifications(userId);
      } else {
        res = await notificationService.getAll();
      }

      const rawList = res.data?.notifications || res.data?.data || [];
      if (Array.isArray(rawList)) {
        setNotifications(rawList);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching system notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      await notificationService.markRead(id);
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.allSettled(unread.map((n) => notificationService.markRead(n.id)));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await notificationService.delete(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (item) => {
    handleMarkAsRead(item.id);
    setIsOpen(false);

    if (item.project_id) {
      navigate(`/projects/${item.project_id}`);
    } else {
      const text = (item.title + ' ' + (item.body || '')).toLowerCase();
      if (text.includes('doc') || text.includes('noc') || text.includes('upload')) {
        navigate('/documents');
      } else if (text.includes('pay') || text.includes('fee') || text.includes('amount')) {
        navigate('/payments');
      } else if (text.includes('action') || text.includes('correct') || text.includes('transfer')) {
        navigate('/action-required');
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Just now';
    
    const diffMins = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (item) => {
    const text = ((item.title || '') + ' ' + (item.body || '')).toLowerCase();

    if (text.includes('pay') || text.includes('fee') || text.includes('amount') || text.includes('cleared')) {
      return (
        <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
    if (text.includes('action') || text.includes('correct') || text.includes('transfer') || text.includes('reject') || text.includes('require')) {
      return (
        <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.78-1.34-.25-2.864 1.018-3.836 1.306-1.016 2.888-.918 4.071-.345" />
          </svg>
        </div>
      );
    }
    if (text.includes('doc') || text.includes('noc') || text.includes('verify') || text.includes('upload') || text.includes('file')) {
      return (
        <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
    );
  };

  return (
    <div ref={popoverRef} className="relative">
      {/* Bell Icon Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition focus:outline-none"
        title="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-rose-600 text-white font-bold rounded-full text-[10px] ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden space-y-0">
          {/* Header */}
          <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900 text-sm">System Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 bg-white border-b border-gray-100 flex items-center space-x-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${filter === 'all' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${filter === 'unread' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <p className="text-xs font-semibold text-gray-400 animate-pulse">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <svg className="h-10 w-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-xs font-semibold text-gray-500">No notifications found</p>
                <p className="text-[11px] text-gray-400 mt-0.5">You are all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex items-start space-x-3 transition cursor-pointer hover:bg-gray-50 relative ${!item.is_read ? 'bg-emerald-50/30' : ''
                    }`}
                >
                  {/* Category Icon */}
                  {getIcon(item)}

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-xs font-semibold text-gray-900 truncate ${!item.is_read ? 'font-bold' : ''}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono ml-2 shrink-0">
                        {formatTime(item.created_at)}
                      </span>
                    </div>

                    {item.body && (
                      <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.body}
                      </p>
                    )}

                    {item.project_id && (
                      <span className="inline-block mt-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        PROJ-{item.project_id}
                      </span>
                    )}
                  </div>

                  {/* Unread indicator dot & dismiss button */}
                  <div className="flex flex-col items-end space-y-1">
                    {!item.is_read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                    )}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="text-gray-300 hover:text-rose-600 text-xs transition font-bold"
                      title="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
            <button
              onClick={() => { setIsOpen(false); navigate('/projects'); }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
            >
              View All Pipeline Activity →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopup;
