'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircle,
  Search,
  Calendar,
  FileText,
  Tag,
  ArrowRight,
  Download,
  Building2,
} from 'lucide-react';
import { formatDate, formatTimeAgo, getPriorityBadgeClasses, getStatusBadgeClasses } from '@/lib/utils';

export default function CompletedMemosPage() {
  const { user } = useAuth();
  const [memos, setMemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCompletedMemos() {
      try {
        const res = await fetch('/api/memos?view=completed');
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
      loadCompletedMemos();
    }
  }, [user]);

  const filteredMemos = memos.filter((memo) => {
    return (
      !search ||
      memo.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      memo.title.toLowerCase().includes(search.toLowerCase()) ||
      memo.author.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
          <h1 className="text-xl font-black text-slate-900">Completed Workflows Archive</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Finalized, fully approved, or resolved office memos with official approval stamps
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search completed memos by Ref #, Subject, or Author..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 bg-white"
          />
        </div>
      </div>

      {/* Memos Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading completed archive...
          </div>
        ) : filteredMemos.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No Completed Memos Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Finalized office memos will appear here once all sequential approvals finish.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Memo Ref & Subject</th>
                  <th className="px-6 py-3.5">Author & Department</th>
                  <th className="px-6 py-3.5">Final Status</th>
                  <th className="px-6 py-3.5">Completed Date</th>
                  <th className="px-6 py-3.5 text-right">View Official Memo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMemos.map((memo) => (
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
                      <div className="font-semibold text-slate-900">{memo.author.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {memo.department?.name || 'General'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClasses(memo.status)}`}>
                        {memo.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[11px] text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{memo.completedAt ? formatDate(memo.completedAt, 'MMM d, yyyy') : 'Completed'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/memos/${memo.id}`}
                        className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl shadow-sm transition"
                      >
                        <span>View & Export PDF</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
