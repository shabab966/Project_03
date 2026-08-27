'use client';

import React, { useState } from 'react';
import { X, History, FileText, Calendar, User } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export interface VersionItem {
  id: string;
  versionNumber: number;
  title: string;
  body: string;
  richTextHtml?: string | null;
  changeSummary?: string | null;
  createdAt: string;
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: VersionItem[];
  currentVersionNumber: number;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  versions,
  currentVersionNumber,
}: VersionHistoryModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<VersionItem>(versions[0] || null);

  if (!isOpen || !versions || versions.length === 0) return null;

  const currentSelected = selectedVersion || versions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-brand-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Memo Version History & Revisions</h2>
              <p className="text-xs text-slate-500">Compare historical revisions submitted following change requests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Left Sidebar (Versions List) & Right Panel (Content Viewer) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Versions Selector */}
          <div className="w-64 border-r border-slate-200 bg-slate-50/50 p-4 space-y-2 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Revision Snapshots ({versions.length})
            </span>
            {versions.map((ver) => {
              const isSelected = currentSelected.id === ver.id;
              const isLatest = ver.versionNumber === versions[0]?.versionNumber;

              return (
                <button
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-white border-brand-500 shadow-sm ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      Version {ver.versionNumber}
                    </span>
                    {isLatest && (
                      <span className="text-[9px] font-bold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                    &ldquo;{ver.changeSummary || 'No notes'}&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(ver.createdAt, 'MMM d, yyyy h:mm a')}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Content Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Viewing Snapshot: Version {currentSelected.versionNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{currentSelected.title}</h3>
              </div>
              <div className="text-right text-xs text-slate-400">
                Created: {formatDate(currentSelected.createdAt)}
              </div>
            </div>

            {currentSelected.changeSummary && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Revision Modification Summary:</strong> {currentSelected.changeSummary}
              </div>
            )}

            <div className="prose max-w-none text-xs text-slate-800 bg-slate-50 p-5 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
              {currentSelected.body}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
