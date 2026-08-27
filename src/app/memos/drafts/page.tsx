'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  FileEdit,
  Trash2,
  Send,
  PlusCircle,
  Clock,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { formatDate, formatTimeAgo, getPriorityBadgeClasses } from '@/lib/utils';

export default function DraftsPage() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDrafts = async () => {
    try {
      const res = await fetch('/api/memos?view=drafts');
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.memos || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDrafts();
  }, [user]);

  const handleDeleteDraft = async (id: string, refNum: string) => {
    if (confirm(`Are you sure you want to delete draft memo ${refNum}?`)) {
      try {
        const res = await fetch(`/api/memos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          loadDrafts();
        } else {
          const d = await res.json();
          alert(d.error || 'Failed to delete draft');
        }
      } catch (e) {
        alert('Error deleting draft');
      }
    }
  };

  const handleSubmitDraft = async (id: string) => {
    try {
      const res = await fetch(`/api/memos/${id}/submit`, { method: 'POST' });
      if (res.ok) {
        alert('Draft memo successfully submitted to active approval workflow!');
        window.location.href = `/memos/${id}`;
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to submit memo. Ensure workflow participants are assigned.');
      }
    } catch (e) {
      alert('Error submitting draft');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileEdit className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-black text-slate-900">Draft Memos</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Memos currently in draft stage &bull; Editable and private until submitted to the workflow
          </p>
        </div>

        <Link
          href="/memos/new"
          className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Memo Draft</span>
        </Link>
      </div>

      {/* Drafts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading drafts...
          </div>
        ) : drafts.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-16 text-center border border-slate-200">
            <FileEdit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No Drafts Saved</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              All your created memos have either been submitted or you haven't drafted any yet.
            </p>
            <Link
              href="/memos/new"
              className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create First Draft</span>
            </Link>
          </div>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    {draft.referenceNumber}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityBadgeClasses(draft.priority)}`}>
                    {draft.priority}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{draft.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {draft.body}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Saved {formatTimeAgo(draft.updatedAt)}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDeleteDraft(draft.id, draft.referenceNumber)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/memos/${draft.id}/edit`}
                    className="px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleSubmitDraft(draft.id)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] rounded-xl shadow-sm transition"
                  >
                    <Send className="w-3 h-3" />
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
