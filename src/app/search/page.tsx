'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Filter,
  Tag,
  Building2,
  Calendar,
  ArrowRight,
  FileText,
  User,
  RotateCcw,
} from 'lucide-react';
import { formatDate, formatTimeAgo, getPriorityBadgeClasses, getStatusBadgeClasses } from '@/lib/utils';

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [categoryId, setCategoryId] = useState('ALL');
  const [departmentId, setDepartmentId] = useState('ALL');

  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [memos, setMemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [catRes, deptRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/departments'),
        ]);
        if (catRes.ok) setCategories((await catRes.json()).categories || []);
        if (deptRes.ok) setDepartments((await deptRes.json()).departments || []);
      } catch (e) {
        console.error(e);
      }
    }
    if (user) loadFilters();
  }, [user]);

  const performSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      params.append('view', 'all');
      if (query.trim()) params.append('q', query.trim());
      if (status !== 'ALL') params.append('status', status);
      if (priority !== 'ALL') params.append('priority', priority);
      if (categoryId !== 'ALL') params.append('categoryId', categoryId);
      if (departmentId !== 'ALL') params.append('departmentId', departmentId);

      const res = await fetch(`/api/memos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMemos(data.memos || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) performSearch();
  }, [user]);

  const resetFilters = () => {
    setQuery('');
    setStatus('ALL');
    setPriority('ALL');
    setCategoryId('ALL');
    setDepartmentId('ALL');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Search className="w-6 h-6 text-brand-600" />
          <h1 className="text-xl font-black text-slate-900">Advanced Memo Search & Discovery</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Full-text search across all organizational memos, references, subjects, and text
        </p>
      </div>

      {/* Search & Filter Form */}
      <form onSubmit={performSearch} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, reference numbers (e.g. NSU-2026-0001), memo body text, or author name..."
            className="w-full text-xs pl-11 pr-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 bg-white shadow-inner font-medium"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved / Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Apply Search'}</span>
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Results ({memos.length} Found)
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Searching records...</div>
        ) : memos.length === 0 ? (
          <div className="p-16 text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No Memos Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your keywords or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {memos.map((memo) => (
              <Link
                key={memo.id}
                href={`/memos/${memo.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-brand-50/20 transition group block"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      {memo.referenceNumber}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${getPriorityBadgeClasses(memo.priority)}`}>
                      {memo.priority}
                    </span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClasses(memo.status)}`}>
                      {memo.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition mt-1 truncate">
                    {memo.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{memo.body}</p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-2">
                    <span>Author: <strong>{memo.author.name}</strong></span>
                    <span>&bull;</span>
                    <span>{memo.department?.name || 'General'}</span>
                    <span>&bull;</span>
                    <span>{formatTimeAgo(memo.updatedAt)}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center text-xs font-bold text-brand-600 group-hover:translate-x-1 transition">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
