'use client';

import React from 'react';
import { Building2, Calendar, FileText, Tag, AlertCircle } from 'lucide-react';
import { formatDate, getPriorityBadgeClasses, getStatusBadgeClasses } from '../../lib/utils';

interface MemoLetterheadProps {
  memo: {
    referenceNumber: string;
    title: string;
    priority: string;
    status: string;
    createdAt: string;
    submittedAt?: string | null;
    completedAt?: string | null;
    organization: {
      name: string;
      slug: string;
      logoUrl?: string | null;
      address?: string | null;
      contactEmail?: string | null;
      contactPhone?: string | null;
    };
    author: {
      name: string;
      designation: string;
      email: string;
    };
    department?: {
      name: string;
      code: string;
    } | null;
    category?: {
      name: string;
    } | null;
    steps?: Array<{
      stepOrder: number;
      assignedUser: {
        name: string;
        designation: string;
      };
    }>;
  };
}

export default function MemoLetterhead({ memo }: MemoLetterheadProps) {
  const { organization, author, department, category, steps } = memo;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* Official Header */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">{organization.name}</h1>
            <p className="text-xs text-slate-300">
              {organization.address || 'Internal Official Communication'}
            </p>
            {(organization.contactEmail || organization.contactPhone) && (
              <p className="text-[11px] text-slate-400">
                {organization.contactEmail} &bull; {organization.contactPhone}
              </p>
            )}
          </div>
        </div>

        {/* Ref and Status Stamp */}
        <div className="flex flex-col md:items-end">
          <div className="text-xs font-mono font-bold text-brand-300 tracking-wider">
            REF: {memo.referenceNumber}
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadgeClasses(memo.status)}`}>
              {memo.status.replace('_', ' ')}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityBadgeClasses(memo.priority)}`}>
              {memo.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Title Bar */}
      <div className="bg-slate-100/70 border-b border-slate-200 px-6 py-2.5 text-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">
          Official Inter-Office Memorandum
        </h2>
      </div>

      {/* Memo Metadata Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-xs border-b border-slate-100">
        <div>
          <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-0.5">
            TO (Workflow Sequence)
          </span>
          <p className="text-slate-900 font-medium">
            {steps && steps.length > 0
              ? steps.map(s => `${s.assignedUser.name} (${s.assignedUser.designation})`).join('  ➔  ')
              : 'Defined Workflow Participants'}
          </p>
        </div>

        <div>
          <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-0.5">
            FROM (Author)
          </span>
          <p className="text-slate-900 font-semibold">
            {author.name} &bull; <span className="text-slate-600 font-normal">{author.designation} ({department?.name || 'General'})</span>
          </p>
        </div>

        <div>
          <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-0.5">
            DATE SUBMITTED
          </span>
          <p className="text-slate-900 font-medium flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {memo.submittedAt ? formatDate(memo.submittedAt, 'MMMM d, yyyy h:mm a') : 'Draft (Not Yet Submitted)'}
          </p>
        </div>

        <div>
          <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-0.5">
            CATEGORY / CLASSIFICATION
          </span>
          <p className="text-slate-900 font-medium flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {category?.name || 'General Memorandum'}
          </p>
        </div>
      </div>

      {/* Subject */}
      <div className="px-6 py-4 bg-slate-50/50">
        <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">
          SUBJECT
        </span>
        <h3 className="text-base font-bold text-slate-900 leading-snug">
          {memo.title}
        </h3>
      </div>
    </div>
  );
}
