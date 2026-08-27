'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { formatDate, formatTimeAgo } from '@/lib/utils';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifs();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-black text-slate-900">Notifications Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workflow alerts, turn assignments, and approval updates
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No Notifications</h3>
            <p className="text-xs text-slate-500 mt-1">You are completely up to date.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex items-start justify-between gap-4 transition ${
                !notif.isRead ? 'bg-blue-50/40' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5">
                  {notif.type === 'ACTION_REQUIRED' ? (
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  ) : notif.type === 'COMPLETED' || notif.type === 'APPROVED' ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900">{notif.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                    <span>&bull;</span>
                    <span>{formatDate(notif.createdAt, 'PPpp')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {notif.memoId && (
                  <Link
                    href={`/memos/${notif.memoId}`}
                    onClick={() => markSingleAsRead(notif.id)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition"
                  >
                    <span>View Memo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {!notif.isRead && (
                  <button
                    onClick={() => markSingleAsRead(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
