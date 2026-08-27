'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Send,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Tag,
  ArrowRight,
  User,
} from 'lucide-react';
import { formatDate, formatTimeAgo, getPriorityBadgeClasses, getStatusBadgeClasses } from '@/lib/utils';

export default function SentMemosPage() {
  const { user } = useAuth();
  const [memos, setMemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadSentMemos() {
      try {
        const res = await fetch('/api/memos?view=sent');
        if (res.ok) {
          const data = await res.json();
          setMemos(data.memos || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadSentMemos();
    }
  }, [user]);

  const filteredMemos = memos.filter((memo) => {
    return (
      !search ||
      memo.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      memo.title.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Send className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-black text-slate-900">Sent / My Memos</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track memos you created and their live sequential approval status across reviewers
          </p>
        </div>

        <Link
          href="/memos/new"
          className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <span>Create New Memo</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sent memos by Ref # or Title..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 bg-white"
          />
        </div>
      </div>

      {/* Memos Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading sent memos...
          </div>
        ) : filteredMemos.length === 0 ? (
          <div className="p-16 text-center">
            <Send className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No Sent Memos</h3>
            <p className="text-xs text-slate-500 mt-1">
              You have not submitted any office memos yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Memo Ref & Subject</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Current Assignee</th>
                  <th className="px-6 py-3.5">Submitted On</th>
                  <th className="px-6 py-3.5">Last Activity</th>
                  <th className="px-6 py-3.5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMemos.map((memo) => {
                  const currentStep = memo.steps?.[memo.currentStepIndex];

                  return (
                    <tr key={memo.id} className="hover:bg-slate-50 transition group">
                      <td className="px-6 py-4">
                        <Link href={`/memos/${memo.id}`} className="block">
                          <span className="font-mono text-[10px] font-bold text-slate-400 block">
                            {memo.referenceNumber}
                          </span>
                          <span className="font-bold text-slate-900 group-hover:text-brand-600 transition text-xs line-clamp-1 mt-0.5">
                            {memo.title}
                          </span>
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityBadgeClasses(memo.priority)}`}>
                          {memo.priority}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${getStatusBadgeClasses(memo.status)}`}>
                          {memo.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {memo.status === 'APPROVED' ? (
                          <span className="text-emerald-700 font-semibold flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approved
                          </span>
                        ) : memo.status === 'REJECTED' ? (
                          <span className="text-rose-700 font-semibold flex items-center">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Rejected
                          </span>
                        ) : memo.status === 'CHANGES_REQUESTED' ? (
                          <span className="text-amber-700 font-semibold flex items-center">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> With Author (You)
                          </span>
                        ) : (
                          <span className="font-medium text-slate-900 flex items-center">
                            <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {currentStep?.assignedUser?.name || 'In Review'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-[11px] text-slate-500">
                        {formatDate(memo.submittedAt, 'MMM d, yyyy')}
                      </td>

                      <td className="px-6 py-4 text-[11px] text-slate-400">
                        {formatTimeAgo(memo.updatedAt)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/memos/${memo.id}`}
                          className="inline-flex items-center text-[11px] font-bold text-brand-600 hover:text-brand-700"
                        >
                          <span>Track</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
