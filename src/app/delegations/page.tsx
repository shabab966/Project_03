'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  Shield,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function DelegationsPage() {
  const { user } = useAuth();
  const [delegations, setDelegations] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [delegateId, setDelegateId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [delRes, usrRes] = await Promise.all([
        fetch('/api/delegations'),
        fetch('/api/users'),
      ]);

      if (delRes.ok) {
        const d = await delRes.json();
        setDelegations(d.delegations || []);
      }
      if (usrRes.ok) {
        const u = await usrRes.json();
        setUsersList((u.users || []).filter((usr: any) => usr.id !== user?.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleCreateDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateId) {
      setError('Please choose a recipient delegate.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/delegations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegateId,
          startDate,
          endDate,
          reason,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create delegation');
      }

      setShowModal(false);
      setReason('');
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/delegations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-black text-slate-900">Workflow Authority Delegation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Designate authorized colleagues to review, comment, and approve memos on your behalf during travel or leave
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Delegation Rule</span>
        </button>
      </div>

      {/* Delegations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-slate-400">Loading delegations...</div>
        ) : delegations.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-16 text-center border border-slate-200">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No Active Delegations</h3>
            <p className="text-xs text-slate-500 mt-1">
              You can grant temporary workflow approval powers to another authorized colleague.
            </p>
          </div>
        ) : (
          delegations.map((del) => {
            const isDelegatorMe = del.delegator.id === user?.id;
            const isDelegateMe = del.delegate.id === user?.id;

            return (
              <div
                key={del.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      del.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {del.isActive ? 'Active Rule' : 'Inactive / Revoked'}
                    </span>

                    {isDelegatorMe && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Created by You
                      </span>
                    )}
                    {isDelegateMe && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Granted to You
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Delegating User</span>
                      <p className="font-bold text-slate-900">{del.delegator.name} <span className="text-slate-500 font-normal">({del.delegator.designation})</span></p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Authorized Delegate</span>
                      <p className="font-bold text-brand-600">{del.delegate.name} <span className="text-slate-500 font-normal">({del.delegate.designation})</span></p>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Validity Period</span>
                      <p className="text-slate-700 flex items-center font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {formatDate(del.startDate, 'MMM d, yyyy')} &mdash; {formatDate(del.endDate, 'MMM d, yyyy')}
                      </p>
                    </div>

                    {del.reason && (
                      <div className="pt-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Reason / Context</span>
                        <p className="text-slate-600 italic">&ldquo;{del.reason}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </div>

                {(isDelegatorMe || user?.role === 'ADMIN') && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleToggleActive(del.id, del.isActive)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-xl transition ${
                        del.isActive
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {del.isActive ? 'Revoke Authority' : 'Reactivate Authority'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Delegation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Setup New Delegation Rule</h2>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateDelegation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Delegate Colleague *</label>
                <select
                  value={delegateId}
                  onChange={(e) => setDelegateId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                >
                  <option value="">-- Choose User --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.designation} &bull; {u.department?.name || 'Admin'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Delegation</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Attending academic conference abroad..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
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
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Grant Delegation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
