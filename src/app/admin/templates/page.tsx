'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  GitBranch,
  Plus,
  Trash2,
  AlertCircle,
  Users,
  CheckCircle,
} from 'lucide-react';

export default function AdminTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<Array<{ stepOrder: number; title: string; stepType: string; defaultRole: string }>>([
    { stepOrder: 0, title: 'Department Chairperson', stepType: 'APPROVAL', defaultRole: 'CHAIR' },
    { stepOrder: 1, title: 'Director of Finance', stepType: 'APPROVAL', defaultRole: 'FINANCE' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const d = await res.json();
        setTemplates(d.templates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadTemplates();
  }, [user]);

  const addStep = () => {
    const nextIdx = steps.length;
    setSteps([
      ...steps,
      { stepOrder: nextIdx, title: `Approver Level ${nextIdx + 1}`, stepType: 'APPROVAL', defaultRole: 'GENERAL' },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, stepOrder: idx })));
  };

  const updateStep = (index: number, key: string, val: string) => {
    const updated = [...steps];
    (updated[index] as any)[key] = val;
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || steps.length === 0) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          steps,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create template');
      }

      setShowModal(false);
      setName('');
      setDescription('');
      loadTemplates();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitBranch className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-black text-slate-900">Workflow Templates Library</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predefined sequential approval pipelines for procurement, travel, leaves, and curricula
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workflow Template</span>
          </button>
        )}
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-slate-400">Loading templates...</div>
        ) : (
          templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">{tmpl.name}</h3>
                  <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-200">
                    {tmpl.steps?.length || 0} Steps
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{tmpl.description}</p>

                {/* Stepper Preview */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Sequential Progression
                  </span>
                  {tmpl.steps?.map((st: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{st.title}</span>
                      <span className="text-[10px] text-slate-400">({st.stepType})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-sm font-bold text-slate-900">Define Reusable Workflow Template</h2>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Procurement & Capex Requisition"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="When to use this approval template..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Sequential Steps Pipeline ({steps.length})
                  </label>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700"
                  >
                    + Add Step
                  </button>
                </div>

                <div className="space-y-2">
                  {steps.map((st, idx) => (
                    <div key={idx} className="flex items-center space-x-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-6 h-6 rounded-lg bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => updateStep(idx, 'title', e.target.value)}
                        placeholder="Step Role / Title"
                        className="flex-1 p-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        required
                      />
                      <select
                        value={st.stepType}
                        onChange={(e) => updateStep(idx, 'stepType', e.target.value)}
                        className="p-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="APPROVAL">Approval</option>
                        <option value="REVIEW">Review</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
