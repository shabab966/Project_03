'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  UserPlus,
  Edit2,
  Shield,
  Building2,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { formatDate, getInitials } from '../../../lib/utils';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [role, setRole] = useState('USER');
  const [status, setStatus] = useState('ACTIVE');
  const [emailVerified, setEmailVerified] = useState(true);
  const [sendInvite, setSendInvite] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInfo, setCreatedInfo] = useState<{
    email: string;
    activationUrl?: string | null;
    emailDelivered?: boolean;
    warning?: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      const [uRes, dRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/departments'),
      ]);
      if (uRes.ok) setUsersList((await uRes.json()).users || []);
      if (dRes.ok) setDepartments((await dRes.json()).departments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setDesignation('');
    setDepartmentId(departments[0]?.id || '');
    setRole('USER');
    setStatus('ACTIVE');
    setEmailVerified(true);
    setSendInvite(true);
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setDesignation(u.designation);
    setDepartmentId(u.department?.id || '');
    setRole(u.role);
    setStatus(u.status);
    setEmailVerified(u.emailVerified ?? true);
    setError(null);
    setShowModal(true);
  };

  const handleQuickVerify = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailVerified: true }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const payload: any = {
        name: name.trim(),
        designation: designation.trim(),
        departmentId: departmentId || null,
        role,
        status,
      };

      if (!editingUser) {
        payload.email = email.trim();
        payload.sendInvite = sendInvite;
        if (!sendInvite && password) payload.password = password;
      } else {
        payload.emailVerified = emailVerified;
        if (password) payload.password = password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save user');
      }

      const data = await res.json();
      setShowModal(false);

      if (!editingUser && data.inviteSent) {
        setCreatedInfo({
          email: email.trim(),
          activationUrl: data.activationUrl,
          emailDelivered: data.emailDelivered,
          warning: data.emailWarning,
        });
      }

      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">
          Only Organization Administrators have permission to manage organization members.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-black text-slate-900">User Directory & Roles</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage user accounts, departmental affiliations, and access credentials for {user.organization.name}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* User Created with Activation Link Card */}
      {createdInfo && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-emerald-900">
                User created for <span className="underline">{createdInfo.email}</span>
              </p>
            </div>
            <button
              onClick={() => setCreatedInfo(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>

          {createdInfo.emailDelivered ? (
            <p className="text-xs text-emerald-800">
              ✅ Invitation email dispatched to <strong>{createdInfo.email}</strong>.
            </p>
          ) : (
            <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center space-x-2 text-amber-700 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Direct Activation Link Ready (Sandbox Mode)</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                You can copy this secure activation link to set the password directly or send to the user:
              </p>
              {createdInfo.activationUrl && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={createdInfo.activationUrl}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(createdInfo.activationUrl!)}
                    className="inline-flex items-center space-x-1 bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <a
                    href={createdInfo.activationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg border border-brand-200"
                    title="Open activation link in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Designation & Department</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Verification</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => {
                  const isVerified = u.emailVerified ?? true;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{u.designation}</p>
                        <p className="text-[10px] text-slate-500">{u.department?.name || 'Central Administration'}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isVerified ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending</span>
                            </span>
                            <button
                              onClick={() => handleQuickVerify(u.id)}
                              className="text-[10px] text-brand-600 hover:text-brand-800 font-bold underline"
                              title="Instantly mark as verified"
                            >
                              Activate
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Edit / Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-sm font-bold text-slate-900">
              {editingUser ? `Edit Account: ${editingUser.name}` : 'Create New User Account'}
            </h2>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!editingUser}
                    placeholder="jane.doe@nsu.edu"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white disabled:bg-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation / Title *</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Professor of ECE"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="">Central Administration</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="USER">Regular User</option>
                    <option value="ADMIN">Organization Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE / Deactivated</option>
                  </select>
                </div>
              </div>

              {/* For new users: invite toggle or manual password */}
              {!editingUser && (
                <div>
                  <label className="block font-bold text-slate-700 mb-2">Account Access Method</label>
                  <div className="space-y-2">
                    <label
                      className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all"
                      style={{
                        borderColor: sendInvite ? '#0e8ceb' : '#e2e8f0',
                        background: sendInvite ? '#f0f7ff' : 'white',
                      }}
                    >
                      <input
                        type="radio"
                        checked={sendInvite}
                        onChange={() => setSendInvite(true)}
                        className="accent-blue-500"
                      />
                      <div>
                        <p className="font-bold text-slate-800">
                          📧 Send Invite Email / Activation Link <span className="text-blue-600 font-bold">(Recommended)</span>
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Generates secure activation link allowing the user to set their password
                        </p>
                      </div>
                    </label>
                    <label
                      className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all"
                      style={{
                        borderColor: !sendInvite ? '#0e8ceb' : '#e2e8f0',
                        background: !sendInvite ? '#f0f7ff' : 'white',
                      }}
                    >
                      <input
                        type="radio"
                        checked={!sendInvite}
                        onChange={() => setSendInvite(false)}
                        className="accent-blue-500"
                      />
                      <div>
                        <p className="font-bold text-slate-800">🔐 Set Password Manually</p>
                        <p className="text-slate-500 text-[11px]">
                          You choose the initial password and share it directly with the user
                        </p>
                      </div>
                    </label>
                  </div>
                  {!sendInvite && (
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter initial password (minimum 8 characters)"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white mt-2"
                      required={!sendInvite}
                    />
                  )}
                </div>
              )}

              {/* For existing users: email verification toggle & password reset */}
              {editingUser && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-800 block">Email Verification Status</span>
                      <span className="text-[11px] text-slate-500">Allow login without requiring email verification link</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailVerified(!emailVerified)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                        emailVerified
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {emailVerified ? 'Verified' : 'Pending'}
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Reset Password (leave blank to keep current password)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingUser ? 'Update Account' : 'Save & Generate Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
