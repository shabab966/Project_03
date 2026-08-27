'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import {
  Inbox,
  Filter,
  ArrowUpDown,
  Search,
  Clock,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Tag,
  CheckCircle2,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { formatDate, formatTimeAgo, getPriorityBadgeClasses, getStatusBadgeClasses } from '../../../lib/utils';

export default function InboxPage() {
  const { user } = useAuth();
  const [memos, setMemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [memoRes, catRes] = await Promise.all([
          fetch('/api/memos?view=inbox'),
          fetch('/api/categories'),
        ]);

        if (memoRes.ok) {
          const data = await memoRes.json();
          setMemos(data.memos || []);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

  const filteredMemos = memos.filter((memo) => {
    const matchesSearch =
      !search ||
      memo.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      memo.title.toLowerCase().includes(search.toLowerCase()) ||
      memo.author.name.toLowerCase().includes(search.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || memo.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || memo.categoryId === categoryFilter;

    return matchesSearch && matchesPriority && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Inbox className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-black text-slate-900">Action Required Inbox</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Memos awaiting your review, approval, or revision based on sequential turn order
          </p>
        </div>

        {user?.activeDelegationReceived && (
          <div className="flex items-center bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs px-3 py-2 rounded-xl">
            <Shield className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
            <span>
              Includes memos assigned to: <strong>{user.activeDelegationReceived.delegatorName}</strong> (Delegate Access)
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Memo Ref #, Title, Author..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white text-slate-700 font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Only</option>
            <option value="HIGH">High Only</option>
            <option value="NORMAL">Normal Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Memos Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading inbox items...
          </div>
        ) : filteredMemos.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Your Inbox is Clear!</h3>
            <p className="text-xs text-slate-500 mt-1">
              No memos currently require your action.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Memo Ref & Subject</th>
                  <th className="px-6 py-3.5">Author & Dept</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Current Status</th>
                  <th className="px-6 py-3.5">Time Pending</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMemos.map((memo) => {
                  const isAuthorRevision = memo.status === 'CHANGES_REQUESTED' && memo.authorId === user?.id;

                  return (
                    <tr
                      key={memo.id}
                      className="hover:bg-brand-50/30 transition group cursor-pointer"
                    >
                      {/* Ref and Title */}
                      <td className="px-6 py-4">
                        <Link href={`/memos/${memo.id}`} className="block">
                          <span className="font-mono text-[10px] font-bold text-slate-400 block">
                            {memo.referenceNumber}
                          </span>
                          <span className="font-bold text-slate-900 group-hover:text-brand-600 transition text-xs line-clamp-1 mt-0.5">
                            {memo.title}
                          </span>
                          {memo.category && (
                            <span className="inline-flex items-center text-[10px] text-slate-500 mt-0.5">
                              <Tag className="w-3 h-3 mr-1 text-slate-400" />
                              {memo.category.name}
                            </span>
                          )}
                        </Link>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{memo.author.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {memo.department?.name || 'Central Administration'}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getPriorityBadgeClasses(memo.priority)}`}>
                          {memo.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${getStatusBadgeClasses(memo.status)}`}>
                          {memo.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Time Pending */}
                      <td className="px-6 py-4 text-[11px] text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatTimeAgo(memo.updatedAt)}</span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/memos/${memo.id}`}
                          className="inline-flex items-center space-x-1 bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl shadow-sm transition"
                        >
                          <span>{isAuthorRevision ? 'Revise & Resubmit' : 'Take Action'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
