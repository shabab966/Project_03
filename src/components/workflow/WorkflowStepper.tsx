'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { formatDate, getInitials } from '../../lib/utils';

export interface StepItem {
  id: string;
  stepOrder: number;
  stepType: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'SKIPPED';
  actionTaken?: string | null;
  actionTimestamp?: string | null;
  comments?: string | null;
  assignedUser: {
    id: string;
    name: string;
    designation: string;
    avatarUrl?: string | null;
  };
  actedByUser?: {
    id: string;
    name: string;
    designation?: string;
  } | null;
}

interface WorkflowStepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  memoStatus: string;
}

export default function WorkflowStepper({ steps, currentStepIndex, memoStatus }: WorkflowStepperProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        No workflow steps defined.
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Sequential Workflow Pipeline ({steps.length} Steps)
        </h3>
        <span className="text-[11px] text-slate-500">
          Sequential Order &bull; Turn-based progression
        </span>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const isCompleted = step.status === 'APPROVED';
            const isRejected = step.status === 'REJECTED';
            const isChangesRequested = step.status === 'CHANGES_REQUESTED';
            const isActive = step.status === 'IN_PROGRESS' && (memoStatus === 'PENDING_APPROVAL' || memoStatus === 'PENDING_REVIEW');
            const isPending = step.status === 'PENDING' && !isActive;

            const isDelegated = !!step.actedByUser && step.actedByUser.id !== step.assignedUser.id;

            return (
              <div
                key={step.id || index}
                className={`relative flex flex-col p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-brand-500 bg-brand-50/50 shadow-md ring-2 ring-brand-500/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/40'
                    : isChangesRequested
                    ? 'border-amber-200 bg-amber-50/40'
                    : 'border-slate-200 bg-slate-50/50 opacity-80'
                }`}
              >
                {/* Step Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step {step.stepOrder + 1} &bull; {step.stepType}
                  </span>

                  {/* Status Indicator Icon */}
                  {isCompleted && (
                    <span className="flex items-center text-emerald-600 font-semibold text-[11px] bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approved
                    </span>
                  )}
                  {isRejected && (
                    <span className="flex items-center text-rose-600 font-semibold text-[11px] bg-rose-100 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Rejected
                    </span>
                  )}
                  {isChangesRequested && (
                    <span className="flex items-center text-amber-700 font-semibold text-[11px] bg-amber-100 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Changes Req.
                    </span>
                  )}
                  {isActive && (
                    <span className="flex items-center text-brand-700 font-bold text-[11px] bg-brand-100 px-2 py-0.5 rounded-full animate-pulse">
                      <Clock className="w-3.5 h-3.5 mr-1" /> Current Turn
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Participant Info */}
                <div className="flex items-center space-x-2.5 my-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isRejected
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {getInitials(step.assignedUser.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {step.assignedUser.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {step.assignedUser.designation}
                    </p>
                  </div>
                </div>

                {/* Delegation Indicator */}
                {isDelegated && (
                  <div className="mt-2 flex items-center text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded">
                    <Shield className="w-3 h-3 mr-1 shrink-0" />
                    <span className="truncate">
                      Acted by delegate: <strong>{step.actedByUser?.name}</strong>
                    </span>
                  </div>
                )}

                {/* Action Notes / Comments */}
                {step.comments && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic bg-white/60 p-1.5 rounded">
                    &ldquo;{step.comments}&rdquo;
                  </div>
                )}

                {/* Timestamp */}
                {step.actionTimestamp && (
                  <div className="mt-auto pt-2 text-[10px] text-slate-400">
                    {formatDate(step.actionTimestamp, 'MMM d, yyyy h:mm a')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
