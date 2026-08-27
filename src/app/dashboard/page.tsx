'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Inbox,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Shield,
  Activity,
} from 'lucide-react';
import { formatDate, formatTimeAgo, getPriorityBadgeClasses, getStatusBadgeClasses } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [inboxMemos, setInboxMemos] = useState<any[]>([]);
  const [recentMemos, setRecentMemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, inboxRes, recentRes] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/memos?view=inbox'),
          fetch('/api/memos?view=all'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        if (inboxRes.ok) {
          const inboxData = await inboxRes.json();
          setInboxMemos(inboxData.memos || []);
        }
        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecentMemos((recentData.memos || []).slice(0, 5));
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>{user?.organization.name}</span>
              <span>&bull;</span>
              <span>{user?.department?.name || 'Central Administration'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {user?.designation} &bull; Manage your inter-office memos, approval pipelines, and sequential workflows.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/memos/new"
              className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Memo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Urgent Action Alert If Any */}
      {inboxMemos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm animate-bounce">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                Action Required: You have {inboxMemos.length} memo{inboxMemos.length > 1 ? 's' : ''} awaiting your review / approval
              </h3>
              <p className="text-[11px] text-amber-700 mt-0.5">
                The sequential approval pipeline is currently waiting on your decision to advance.
              </p>
            </div>
          </div>
          <Link
            href="/memos/inbox"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-200 px-4 py-2 rounded-xl transition shrink-0"
          >
            <span>Open Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Awaiting Action */}
        <Link
          href="/memos/inbox"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Awaiting Action
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{inboxMemos.length}</span>
            <span className="text-xs text-slate-500">pending turn</span>
          </div>
        </Link>

        {/* Pending Workflows */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              In-Progress
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {stats?.summary?.pendingWorkflows || 0}
            </span>
            <span className="text-xs text-slate-500">active pipelines</span>
          </div>
        </div>

        {/* Completed Workflows */}
        <Link
          href="/memos/completed"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Approved
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {stats?.summary?.completedWorkflows || 0}
            </span>
            <span className="text-xs text-slate-500">finalized memos</span>
          </div>
        </Link>

        {/* Urgent Memos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Urgent Priority
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {stats?.summary?.urgentMemos || 0}
            </span>
            <span className="text-xs text-slate-500">high attention</span>
          </div>
        </div>
      </div>

      {/* Admin Quick Overview Section (If Admin) */}
      {isAdmin && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Organization Administration Metrics
              </h2>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/80 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
              <p className="text-xl font-bold text-white mt-1">{stats?.summary?.totalUsers || 0}</p>
              <p className="text-[10px] text-emerald-400">{stats?.summary?.activeUsers || 0} Active Accounts</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Departments</span>
              <p className="text-xl font-bold text-white mt-1">{stats?.summary?.totalDepartments || 0}</p>
              <p className="text-[10px] text-slate-400">Active Units</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Memos</span>
              <p className="text-xl font-bold text-white mt-1">{stats?.summary?.totalMemos || 0}</p>
              <p className="text-[10px] text-slate-400">Org Life-to-date</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Avg Turnaround</span>
              <p className="text-xl font-bold text-white mt-1">
                {stats?.summary?.avgTurnaroundHours ? `${stats.summary.avgTurnaroundHours}h` : 'N/A'}
              </p>
              <p className="text-[10px] text-slate-400">Workflow Velocity</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Action Required Inbox Preview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pending Action Inbox */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Action Required Inbox
              </h2>
              <p className="text-[11px] text-slate-500">Memos currently waiting for your review, approval, or revision</p>
            </div>
            <Link
              href="/memos/inbox"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
            >
              View all ({inboxMemos.length}) &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {inboxMemos.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <span>All caught up! No pending actions in your inbox.</span>
              </div>
            ) : (
              inboxMemos.slice(0, 5).map((memo) => (
                <Link
                  key={memo.id}
                  href={`/memos/${memo.id}`}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 -mx-2 transition"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {memo.referenceNumber}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadgeClasses(memo.priority)}`}>
                        {memo.priority}
                      </span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClasses(memo.status)}`}>
                        {memo.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 truncate mt-1">
                      {memo.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      By {memo.author.name} &bull; {memo.department?.name || 'General'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">
                      {formatTimeAgo(memo.updatedAt)}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-bold text-brand-600 mt-1">
                      Review &rarr;
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Memos Feed */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recent Organizational Memos
              </h2>
              <p className="text-[11px] text-slate-500">Latest active and completed workflows</p>
            </div>
            <Link
              href="/search"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
            >
              Search &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {recentMemos.map((m) => (
              <Link
                key={m.id}
                href={`/memos/${m.id}`}
                className="block p-3 bg-slate-50/70 hover:bg-slate-100 rounded-2xl border border-slate-100 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {m.referenceNumber}
                  </span>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClasses(m.status)}`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{m.title}</h4>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                  <span>Author: {m.author.name}</span>
                  <span>{formatTimeAgo(m.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
