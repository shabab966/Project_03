'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  X,
  Shield,
} from 'lucide-react';

interface WorkflowActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoId: string;
  memoTitle: string;
  referenceNumber: string;
  actingAsDelegateFor?: string | null;
  onSuccess: () => void;
}

export default function WorkflowActionModal({
  isOpen,
  onClose,
  memoId,
  memoTitle,
  referenceNumber,
  actingAsDelegateFor,
  onSuccess,
}: WorkflowActionModalProps) {
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'>('APPROVE');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if ((actionType === 'REJECT' || actionType === 'REQUEST_CHANGES') && !comments.trim()) {
      setError(`A detailed comment/reason is strictly mandatory when ${actionType === 'REJECT' ? 'rejecting' : 'requesting changes on'} a memo.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/memos/${memoId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          comments: comments.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit workflow action');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Execute Workflow Action</h2>
            <p className="text-xs text-slate-500">{referenceNumber} &bull; {memoTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {actingAsDelegateFor && (
          <div className="mx-6 mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center text-xs text-indigo-900">
            <Shield className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
            <span>
              You are performing this action as an <strong>Authorized Delegate</strong> on behalf of <strong>{actingAsDelegateFor}</strong>.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Decision
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActionType('APPROVE')}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Approve / Forward</span>
              </button>

              <button
                type="button"
                onClick={() => setActionType('REQUEST_CHANGES')}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition ${
                  actionType === 'REQUEST_CHANGES'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Request Changes</span>
              </button>

              <button
                type="button"
                onClick={() => setActionType('REJECT')}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition ${
                  actionType === 'REJECT'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Reject Memo</span>
              </button>
            </div>
          </div>

          {/* Comment / Reason Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {actionType === 'APPROVE'
                ? 'Approval Endorsement / Notes (Optional)'
                : actionType === 'REQUEST_CHANGES'
                ? 'Required Changes & Explanations (Mandatory)'
                : 'Reason for Rejection (Mandatory)'}
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                actionType === 'APPROVE'
                  ? 'e.g. Endorsed for budget allocation...'
                  : actionType === 'REQUEST_CHANGES'
                  ? 'e.g. Please attach updated vendor quotes and clarify delivery timeline...'
                  : 'e.g. Budget ceiling exceeded for this academic quarter...'
              }
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
              required={actionType !== 'APPROVE'}
            />
          </div>

          {/* Action Explanations */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {actionType === 'APPROVE' && (
              <p>The memo will move sequentially to the next participant in the approval chain, or be marked as <strong>Fully Completed</strong> if you are the final approver.</p>
            )}
            {actionType === 'REQUEST_CHANGES' && (
              <p>The memo will be returned to the author (<strong>{memoTitle}</strong>) for modification and resubmission. A new version snapshot will be created.</p>
            )}
            {actionType === 'REJECT' && (
              <p className="text-rose-600">The workflow will be permanently terminated and the memo marked as <strong>Rejected</strong>.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition flex items-center space-x-1.5 ${
                actionType === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : actionType === 'REQUEST_CHANGES'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              } disabled:opacity-50`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Processing...' : `Confirm ${actionType === 'APPROVE' ? 'Approval' : actionType === 'REQUEST_CHANGES' ? 'Changes Request' : 'Rejection'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
