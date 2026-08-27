'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function AdminDepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const d = await res.json();
        setDepartments(d.departments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDepartments();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setDescription('');
    setIsActive(true);
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description || '');
    setIsActive(dept.isActive);
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const url = editingDept ? `/api/departments/${editingDept.id}` : '/api/departments';
      const method = editingDept ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim(),
          description: description.trim(),
          isActive,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save department');
      }

      setShowModal(false);
      loadDepartments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">
          Only Organization Administrators have permission to manage organizational departments.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-black text-slate-900">Department Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create, rename, and manage academic / corporate departments within {user.organization.name}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Department</span>
        </button>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading departments...</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Department Name & Code</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Members</th>
                <th className="px-6 py-3.5">Memos</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs">{dept.name}</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {dept.code}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                    {dept.description || 'N/A'}
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{dept._count?.users || 0}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{dept._count?.memos || 0}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      dept.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Department"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              {editingDept ? 'Edit Department' : 'Create Department'}
            </h2>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electrical & Computer Engineering"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ECE"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional brief department scope..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              {editingDept && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <label htmlFor="isActive" className="font-bold text-slate-700">
                    Active Department
                  </label>
                </div>
              )}

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
                  {submitting ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
