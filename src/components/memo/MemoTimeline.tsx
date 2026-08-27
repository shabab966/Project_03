'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Clock,
  User,
  Shield,
  FileCheck,
} from 'lucide-react';
import { formatDate, formatTimeAgo, getInitials } from '@/lib/utils';

export interface CommentItem {
  id: string;
  type: 'GENERAL' | 'APPROVAL' | 'REJECTION' | 'CHANGES_REQUESTED' | 'SYSTEM';
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    designation: string;
    role: string;
  };
}

interface MemoTimelineProps {
  memoId: string;
  comments: CommentItem[];
  canComment: boolean;
  onCommentAdded: () => void;
}

export default function MemoTimeline({
  memoId,
  comments,
  canComment,
  onCommentAdded,
}: MemoTimelineProps) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/memos/${memoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      setNewComment('');
      onCommentAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getCommentBadge = (type: string) => {
    switch (type) {
      case 'APPROVAL':
        return (
          <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> Approval Record
          </span>
        );
      case 'REJECTION':
        return (
          <span className="flex items-center text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 mr-1 text-rose-600" /> Rejection Record
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="flex items-center text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3 mr-1 text-amber-600" /> Changes Requested
          </span>
        );
      case 'SYSTEM':
        return (
          <span className="flex items-center text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
            <FileCheck className="w-3 h-3 mr-1 text-blue-600" /> Revision Update
          </span>
        );
      default:
        return (
          <span className="flex items-center text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
            <MessageSquare className="w-3 h-3 mr-1 text-slate-500" /> Discussion Note
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-brand-600" />
            Activity Timeline & Discussion Thread ({comments.length})
          </h3>
          <p className="text-[11px] text-slate-500">Immutable chronological history of all workflow events & feedback</p>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 before:z-0">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 italic pl-8">No activity or comments recorded yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="relative flex items-start space-x-3 z-10">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm shrink-0">
                {getInitials(comment.author.name)}
              </div>

              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{comment.author.name}</span>
                    <span className="text-[11px] text-slate-500">&bull; {comment.author.designation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getCommentBadge(comment.type)}
                    <span className="text-[10px] text-slate-400" title={formatDate(comment.createdAt)}>
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Box */}
      {canComment && (
        <form onSubmit={handleSubmit} className="mt-8 pt-6 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Add Discussion Comment / Inquiry
          </label>
          {error && <p className="text-xs text-rose-600 mb-2">{error}</p>}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your discussion note or question here..."
              className="flex-1 text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 bg-white"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
