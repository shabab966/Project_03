'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  ShieldCheck,
  Search,
  Clock,
  Filter,
  Calendar,
  AlertCircle,
  FileText,
  User,
} from 'lucide-react';
import { formatDate, formatTimeAgo } from '../../../lib/utils';

export default function AdminAuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [query, setQuery] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'ALL') params.append('action', actionFilter);
      if (query.trim()) params.append('q', query.trim());

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setLogs(d.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadLogs();
  }, [user, actionFilter]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">
          Only Organization Administrators can view organizational security and workflow audit logs.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl font-black text-slate-900">Immutable System Audit Trail</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Comprehensive, non-repudiable log of all logins, submissions, approvals, rejections, and workflow transitions
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
            placeholder="Search audit details, users, actions..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
        >
          <option value="ALL">All Event Types</option>
          <option value="USER_LOGIN">User Logins</option>
          <option value="MEMO_CREATED">Memo Created</option>
          <option value="MEMO_SUBMITTED">Memo Submitted</option>
          <option value="WORKFLOW_APPROVED">Workflow Approved</option>
          <option value="WORKFLOW_REJECTED">Workflow Rejected</option>
          <option value="WORKFLOW_CHANGES_REQUESTED">Changes Requested</option>
          <option value="MEMO_RESUBMITTED">Memo Resubmitted</option>
          <option value="ATTACHMENT_UPLOADED">Attachment Uploaded</option>
          <option value="DELEGATION_CREATED">Delegation Created</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No Audit Records Found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action Type</th>
                  <th className="px-6 py-3.5">Acting User</th>
                  <th className="px-6 py-3.5">Entity / Scope</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(log.createdAt, 'MMM d, h:mm:ss a')}
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 font-sans font-semibold text-slate-900 whitespace-nowrap">
                      {log.user ? `${log.user.name} (${log.user.role})` : 'System'}
                    </td>

                    <td className="px-6 py-3.5 text-slate-500">
                      {log.entityType} {log.entityId ? `#${log.entityId.slice(-6)}` : ''}
                    </td>

                    <td className="px-6 py-3.5 font-sans text-slate-600 max-w-sm truncate">
                      {log.detailsJson || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
