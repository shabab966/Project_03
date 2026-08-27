'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Plus,
  Trash2,
  GitBranch,
  ArrowRight,
  Upload,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
  Users,
} from 'lucide-react';

export default function NewMemoPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  // Sequential Workflow Steps
  const [steps, setSteps] = useState<Array<{ stepOrder: number; stepType: string; assignedUserId: string; title?: string }>>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormMetadata() {
      try {
        const [deptRes, catRes, userRes, tmplRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/categories'),
          fetch('/api/users'),
          fetch('/api/templates'),
        ]);

        if (deptRes.ok) {
          const d = await deptRes.json();
          setDepartments(d.departments || []);
        }
        if (catRes.ok) {
          const c = await catRes.json();
          setCategories(c.categories || []);
          if (c.categories?.length > 0) setCategoryId(c.categories[0].id);
        }
        if (userRes.ok) {
          const u = await userRes.json();
          // Filter out current user from reviewer list (reviewers should be others)
          const others = (u.users || []).filter((usr: any) => usr.id !== user?.id);
          setUsersList(others);
        }
        if (tmplRes.ok) {
          const t = await tmplRes.json();
          setTemplates(t.templates || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (user) {
      loadFormMetadata();
      if (user.department?.id) setDepartmentId(user.department.id);
    }
  }, [user]);

  // Handle Workflow Template Selection
  const applyTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl || !tmpl.steps) return;

    const newSteps = tmpl.steps.map((s: any, idx: number) => {
      // Auto-match user by designation or pick first candidate
      const matchedUser = usersList.find((u) => {
        if (s.defaultRole === 'CHAIR') return u.designation.toLowerCase().includes('chair');
        if (s.defaultRole === 'FINANCE') return u.designation.toLowerCase().includes('finance');
        if (s.defaultRole === 'DEAN') return u.designation.toLowerCase().includes('dean');
        if (s.defaultRole === 'VC') return u.designation.toLowerCase().includes('chancellor');
        return false;
      }) || usersList[idx % usersList.length];

      return {
        stepOrder: idx,
        stepType: s.stepType || 'APPROVAL',
        assignedUserId: matchedUser ? matchedUser.id : '',
        title: s.title || `Step ${idx + 1}`,
      };
    });

    setSteps(newSteps);
  };

  const addCustomStep = () => {
    const nextIdx = steps.length;
    const defaultUser = usersList[0]?.id || '';
    setSteps([
      ...steps,
      {
        stepOrder: nextIdx,
        stepType: 'APPROVAL',
        assignedUserId: defaultUser,
        title: `Workflow Participant ${nextIdx + 1}`,
      },
    ]);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, idx) => idx !== index).map((s, idx) => ({
      ...s,
      stepOrder: idx,
    }));
    setSteps(updated);
  };

  const updateStepUser = (index: number, userId: string) => {
    const updated = [...steps];
    updated[index].assignedUserId = userId;
    setSteps(updated);
  };

  const updateStepType = (index: number, stepType: string) => {
    const updated = [...steps];
    updated[index].stepType = stepType;
    setSteps(updated);
  };

  const handleSubmitMemo = async (isDraft: boolean) => {
    setError(null);
    if (!title.trim()) {
      setError('Please provide a subject / title for the memo.');
      return;
    }
    if (!body.trim()) {
      setError('Please write the memo message body.');
      return;
    }
    if (!isDraft && steps.length === 0) {
      setError('At least one workflow participant is required to submit a memo.');
      return;
    }
    if (!isDraft && steps.some((s) => !s.assignedUserId)) {
      setError('Please ensure all workflow steps have an assigned recipient.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          priority,
          categoryId: categoryId || null,
          departmentId: departmentId || null,
          steps,
          isDraft,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create memo');
      }

      if (isDraft) {
        router.push('/memos/drafts');
      } else {
        router.push(`/memos/${data.memo.id}`);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-brand-600" />
          <h1 className="text-xl font-black text-slate-900">Create Office Memorandum</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Draft an official inter-office memo and define the sequential approval pipeline
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Memo Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Title / Subject */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Subject / Memorandum Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Requisition for AI & Robotics Computing Hardware Lab"
            className="w-full text-sm font-semibold p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 bg-white"
            required
          />
        </div>

        {/* Priority, Category, Department Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-semibold"
            >
              <option value="NORMAL">Normal Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Memo Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Memo Body */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Memorandum Content & Justification *
          </label>
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the official memo details, context, budget breakdown, or request..."
            className="w-full text-xs p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 bg-white font-sans leading-relaxed"
            required
          />
        </div>
      </div>

      {/* Sequential Workflow Definition Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900">Sequential Workflow Sequence</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Define the ordered sequence of officials who must review and approve this memo
            </p>
          </div>

          {/* Quick Apply Workflow Template */}
          {templates.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Template:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) applyTemplate(e.target.value);
                }}
                className="text-xs py-1.5 px-3 border border-slate-300 rounded-xl bg-slate-50 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">-- Select Pre-Built Workflow --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No Workflow Steps Added Yet</p>
              <p className="text-[11px] text-slate-500 mt-1 mb-4">
                Select a pre-built workflow template above or add custom reviewers in sequence.
              </p>
              <button
                type="button"
                onClick={addCustomStep}
                className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Step</span>
              </button>
            </div>
          ) : (
            steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Step {idx + 1} &bull; {step.stepType}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Must complete before Step {idx + 2} is activated
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-1 sm:max-w-md justify-end">
                  {/* Select Recipient */}
                  <select
                    value={step.assignedUserId}
                    onChange={(e) => updateStepUser(idx, e.target.value)}
                    className="text-xs p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none flex-1"
                    required
                  >
                    <option value="">-- Choose User --</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.designation} &bull; {u.department?.name || 'Admin'})
                      </option>
                    ))}
                  </select>

                  {/* Step Type */}
                  <select
                    value={step.stepType}
                    onChange={(e) => updateStepType(idx, e.target.value)}
                    className="text-xs p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="APPROVAL">Approval</option>
                    <option value="REVIEW">Review</option>
                  </select>

                  {/* Remove Step */}
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Remove step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {steps.length > 0 && (
            <button
              type="button"
              onClick={addCustomStep}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Next Sequential Step</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={() => handleSubmitMemo(true)}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl shadow-sm transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Save as Draft</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubmitMemo(false)}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-lg transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Submitting...' : 'Submit to Sequential Workflow'}</span>
        </button>
      </div>
    </div>
  );
}
