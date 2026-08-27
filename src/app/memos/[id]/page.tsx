'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Paperclip,
  Upload,
  History,
  Download,
  Shield,
  Edit,
  RotateCcw,
  Send,
  Building2,
  Calendar,
  Tag,
  User as UserIcon,
} from 'lucide-react';
import MemoLetterhead from '../../../components/memo/MemoLetterhead';
import WorkflowStepper from '../../../components/workflow/WorkflowStepper';
import WorkflowActionModal from '../../../components/workflow/WorkflowActionModal';
import MemoTimeline from '../../../components/memo/MemoTimeline';
import VersionHistoryModal from '../../../components/memo/VersionHistoryModal';
import PdfExportButton from '../../../components/memo/PdfExportButton';
import { formatDate, formatTimeAgo, getPriorityBadgeClasses, getStatusBadgeClasses } from '../../../lib/utils';
import Link from 'next/link';

export default function MemoDetailPage() {
  const params = useParams();
  const memoId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [memo, setMemo] = useState<any>(null);
  const [permissions, setPermissions] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showActionModal, setShowActionModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchMemo = useCallback(async () => {
    try {
      const res = await fetch(`/api/memos/${memoId}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to fetch memo');
      }
      const data = await res.json();
      setMemo(data.memo);
      setPermissions(data.permissions || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [memoId]);

  useEffect(() => {
    if (user && memoId) {
      fetchMemo();
    }
  }, [user, memoId, fetchMemo]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/memos/${memoId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Upload failed');
      }

      fetchMemo();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl"></div>
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  if (error || !memo) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Unable to Load Memo</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'Memo not found or access denied.'}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700"
        >
          &larr; Return to Dashboard
        </Link>
      </div>
    );
  }

  const isAuthor = permissions.isAuthor;
  const canAct = permissions.canAct;
  const isDraft = memo.status === 'DRAFT';
  const isChangesRequested = memo.status === 'CHANGES_REQUESTED';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Toolbar (No Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard"
            className="text-xs text-slate-500 hover:text-slate-900 font-medium"
          >
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-mono font-bold text-slate-700">{memo.referenceNumber}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Version History Button */}
          {memo.versions && memo.versions.length > 1 && (
            <button
              onClick={() => setShowVersionModal(true)}
              className="inline-flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold px-3 py-2 rounded-xl border border-amber-200 transition"
            >
              <History className="w-3.5 h-3.5 text-amber-600" />
              <span>Revisions (v{memo.versions.length})</span>
            </button>
          )}

          {/* Edit Draft / Revise Button */}
          {isDraft && (
            <Link
              href={`/memos/${memo.id}/edit`}
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Draft</span>
            </Link>
          )}

          {/* Resubmit Revision (Author when changes requested) */}
          {isAuthor && isChangesRequested && (
            <Link
              href={`/memos/${memo.id}/edit`}
              className="inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revise & Resubmit Memo</span>
            </Link>
          )}

          {/* Primary Take Action Button for Reviewer / Approver / Delegate */}
          {canAct && !isChangesRequested && (
            <button
              onClick={() => setShowActionModal(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Take Workflow Action</span>
            </button>
          )}

          {/* PDF Export / Print */}
          <PdfExportButton
            elementId="printable-memo-document"
            filename={`Memo_${memo.referenceNumber}`}
          />
        </div>
      </div>

      {/* Printable / Core Memo Container */}
      <div id="printable-memo-document" className="space-y-6">
        {/* Official Memo Letterhead */}
        <MemoLetterhead memo={memo} />

        {/* Sequential Stepper */}
        {memo.steps && memo.steps.length > 0 && (
          <WorkflowStepper
            steps={memo.steps}
            currentStepIndex={memo.currentStepIndex}
            memoStatus={memo.status}
          />
        )}

        {/* Memo Body Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Memorandum Text & Details
            </span>
            {memo.versions && memo.versions.length > 1 && (
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                Version {memo.versions.length}
              </span>
            )}
          </div>

          <div className="prose max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {memo.body}
          </div>

          {/* Author Signature Line for Official Printing */}
          <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <p className="text-xs font-bold text-slate-900">{memo.author.name}</p>
              <p className="text-[11px] text-slate-500">{memo.author.designation}</p>
              <p className="text-[10px] text-slate-400">{memo.department?.name || memo.organization.name}</p>
            </div>

            {memo.completedAt && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full inline-block">
                  Verified & Ratified {formatDate(memo.completedAt, 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Attachments Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Supporting Attachments ({memo.attachments?.length || 0})
              </h3>
            </div>

            {/* Upload attachment */}
            <label className="cursor-pointer inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition no-print">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingFile ? 'Uploading...' : 'Upload File'}</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
            </label>
          </div>

          {memo.attachments?.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No attachments uploaded for this memo.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {memo.attachments.map((att: any) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{att.originalFilename}</p>
                    <p className="text-[10px] text-slate-500">
                      {Math.round(att.sizeBytes / 1024)} KB &bull; Uploaded by {att.uploadedBy?.name}
                    </p>
                  </div>
                  <a
                    href={`/api/memos/${memo.id}/attachments/${att.id}`}
                    download={att.originalFilename}
                    className="p-2 text-brand-600 hover:bg-brand-100 rounded-xl transition shrink-0"
                    title="Download attachment"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline & Discussion Thread (No Print) */}
      <div className="no-print">
        <MemoTimeline
          memoId={memo.id}
          comments={memo.comments || []}
          canComment={true}
          onCommentAdded={fetchMemo}
        />
      </div>

      {/* Workflow Action Modal Dialog */}
      <WorkflowActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        memoId={memo.id}
        memoTitle={memo.title}
        referenceNumber={memo.referenceNumber}
        actingAsDelegateFor={permissions.actingAsDelegateFor}
        onSuccess={fetchMemo}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        versions={memo.versions || []}
        currentVersionNumber={memo.versions?.length || 1}
      />
    </div>
  );
}
