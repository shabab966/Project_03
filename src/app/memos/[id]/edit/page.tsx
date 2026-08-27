'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import {
  Edit,
  Save,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  History,
  Send,
} from 'lucide-react';

export default function EditMemoPage() {
  const params = useParams();
  const memoId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [memo, setMemo] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMemo() {
      try {
        const res = await fetch(`/api/memos/${memoId}`);
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Failed to load memo');
        }
        const data = await res.json();
        setMemo(data.memo);
        setTitle(data.memo.title);
        setBody(data.memo.body);
        setPriority(data.memo.priority);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (user && memoId) {
      loadMemo();
    }
  }, [user, memoId]);

  const handleSaveDraft = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/memos/${memoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          priority,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save draft');
      }
      router.push(`/memos/${memoId}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleResubmitRevision = async () => {
    if (!changeSummary.trim()) {
      setError('Please describe the modifications made in this revision before resubmitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/memos/${memoId}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          changeSummary: changeSummary.trim(),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to resubmit revision');
      }

      router.push(`/memos/${memoId}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading memo...</div>;
  }

  const isChangesRequested = memo?.status === 'CHANGES_REQUESTED';
  const isDraft = memo?.status === 'DRAFT';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          {isChangesRequested ? (
            <RotateCcw className="w-6 h-6 text-amber-600" />
          ) : (
            <Edit className="w-6 h-6 text-brand-600" />
          )}
          <h1 className="text-xl font-black text-slate-900">
            {isChangesRequested ? 'Revise & Resubmit Memo' : 'Edit Draft Memo'}
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {isChangesRequested
            ? `Update content to address reviewer requests & generate Version ${(memo.versions?.length || 1) + 1}`
            : 'Modify draft memo contents before final workflow submission'}
        </p>
      </div>

      {isChangesRequested && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center">
            <AlertTriangle className="w-4 h-4 text-amber-600 mr-1.5" />
            Changes were requested by the reviewer
          </div>
          <p className="text-[11px] text-amber-800">
            Review previous discussion comments, revise the body below, and summarize your changes to advance the workflow.
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Subject / Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-semibold p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            required
          />
        </div>

        {isChangesRequested && (
          <div>
            <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">
              Summary of Changes in this Revision * (Mandatory)
            </label>
            <input
              type="text"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="e.g. Attached 3 updated quotes and modified budget table as requested"
              className="w-full text-xs font-medium p-3.5 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-amber-50/40"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Memo Content Body
          </label>
          <textarea
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full text-xs p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 bg-white font-sans leading-relaxed"
            required
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>

          {isDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={submitting}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Draft Changes'}</span>
            </button>
          )}

          {isChangesRequested && (
            <button
              type="button"
              onClick={handleResubmitRevision}
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{submitting ? 'Submitting Revision...' : `Submit Version ${(memo?.versions?.length || 1) + 1}`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
