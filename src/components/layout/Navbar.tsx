'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
} from 'lucide-react';
import { formatTimeAgo, getInitials } from '../../lib/utils';

export default function Navbar() {
  const { user, logout, demoOrgs, switchDemoUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setShowDemoMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markNotificationRead = async (id: string, memoId?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      fetchNotifications();
      if (memoId) {
        setShowNotifMenu(false);
        router.push(`/memos/${memoId}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm no-print">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Left: Organization Badge & Active Delegation */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-sm">
            <Building2 className="w-4 h-4 text-brand-400 mr-2 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm tracking-wide">{user.organization.name}</span>
            <span className="ml-2 text-[10px] uppercase font-bold bg-brand-500/30 text-brand-300 px-1.5 py-0.5 rounded">
              {user.organization.slug}
            </span>
          </div>

          {user.activeDelegationReceived && (
            <div className="hidden md:flex items-center bg-amber-50 border border-amber-200 text-amber-900 text-xs px-2.5 py-1 rounded-md">
              <Shield className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
              <span>
                Acting as Delegate for: <strong>{user.activeDelegationReceived.delegatorName}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Right: Demo Persona Quick-Switcher, Notifications & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Quick Demo Switcher Button */}
          <div className="relative" ref={demoRef}>
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-sm"
              title="Switch user account for evaluation"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch Persona (Demo)</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-[80vh] overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Evaluation Demo Personas</p>
                  <p className="text-[11px] text-slate-500">Instant 1-click switch between accounts & organizations</p>
                </div>

                {demoOrgs.map((org) => (
                  <div key={org.id} className="py-2">
                    <div className="px-4 py-1 flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-100/70">
                      <span>{org.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{org.slug}</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {org.users.map((u) => {
                        const isCurrent = user.id === u.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              setShowDemoMenu(false);
                              switchDemoUser(u.id);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition flex items-center justify-between ${
                              isCurrent ? 'bg-indigo-50/80 font-medium' : ''
                            }`}
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-slate-900">{u.name}</span>
                                {u.role === 'ADMIN' && (
                                  <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1 py-0.5 rounded">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">{u.designation} &bull; {u.department}</div>
                            </div>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id, n.memoId)}
                        className={`p-3 text-left hover:bg-slate-50 transition cursor-pointer flex items-start space-x-3 ${
                          !n.isRead ? 'bg-blue-50/50 font-medium' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {n.type === 'ACTION_REQUIRED' ? (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          ) : n.type === 'COMPLETED' || n.type === 'APPROVED' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-900 leading-tight">{n.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 px-4 py-1.5 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifMenu(false)}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    View all notifications &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {getInitials(user.name)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-none">{user.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{user.designation}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <div className="mt-1 flex items-center space-x-1.5">
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {user.role}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      {user.department?.name || 'Administration'}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
                    My Profile & Password
                  </Link>
                  <Link
                    href="/delegations"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Shield className="w-4 h-4 mr-2 text-slate-400" />
                    Workflow Delegations
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
