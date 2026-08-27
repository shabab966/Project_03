'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Tag,
  Users,
  FileText,
} from 'lucide-react';

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          const d = await res.json();
          setStats(d);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadStats();
  }, [user]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading organizational analytics...</div>;
  }

  const { summary, statusCounts, departmentStats, categoryStats } = stats || {};

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-brand-600" />
          <h1 className="text-xl font-black text-slate-900">Institutional Analytics & Velocity Reports</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Turnaround metrics, department throughput, status distributions, and workflow bottlenecks for {user?.organization.name}
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Workflows</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary?.totalMemos || 0}</p>
          <span className="text-[10px] text-slate-500">Memos Generated</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Turnaround Time</span>
          <p className="text-2xl font-black text-brand-600 mt-1">
            {summary?.avgTurnaroundHours ? `${summary.avgTurnaroundHours} Hours` : 'N/A'}
          </p>
          <span className="text-[10px] text-slate-500">From Submit to Final Approval</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approval Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {summary?.totalMemos ? Math.round(((summary.completedWorkflows || 0) / summary.totalMemos) * 100) : 0}%
          </p>
          <span className="text-[10px] text-emerald-600">{summary?.completedWorkflows || 0} Fully Approved</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Urgent In-Flight</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{summary?.urgentMemos || 0}</p>
          <span className="text-[10px] text-rose-500">High-Priority Directives</span>
        </div>
      </div>

      {/* Grid: Status Distribution & Department Volumes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-brand-600" />
            Memos by Workflow Status
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Pending Approval / Review', count: (statusCounts?.PENDING_APPROVAL || 0) + (statusCounts?.PENDING_REVIEW || 0), color: 'bg-blue-500' },
              { label: 'Changes Requested', count: statusCounts?.CHANGES_REQUESTED || 0, color: 'bg-amber-500' },
              { label: 'Approved / Completed', count: statusCounts?.APPROVED || 0, color: 'bg-emerald-500' },
              { label: 'Rejected', count: statusCounts?.REJECTED || 0, color: 'bg-rose-500' },
              { label: 'Drafts', count: statusCounts?.DRAFT || 0, color: 'bg-slate-400' },
            ].map((st, idx) => {
              const pct = summary?.totalMemos ? Math.round((st.count / summary.totalMemos) * 100) : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{st.label}</span>
                    <span className="text-slate-900">{st.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${st.color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Throughput */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
            <Building2 className="w-4 h-4 mr-1.5 text-indigo-600" />
            Memos by Department
          </h3>

          <div className="space-y-3 pt-2">
            {departmentStats?.map((dept: any, idx: number) => {
              const pct = summary?.totalMemos ? Math.round((dept.count / summary.totalMemos) * 100) : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{dept.name} ({dept.code})</span>
                    <span className="text-slate-900">{dept.count} memos</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
          <Tag className="w-4 h-4 mr-1.5 text-emerald-600" />
          Memos by Classification & Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {categoryStats?.map((cat: any, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block truncate">{cat.name}</span>
              <p className="text-xl font-bold text-brand-600 mt-1">{cat.count}</p>
              <span className="text-[10px] text-slate-400">Institutional Memos</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
