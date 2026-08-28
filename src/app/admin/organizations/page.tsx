'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  Plus,
  Users,
  Layers,
  FileText,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';

export default function AdminOrganizationsPage() {
  const { user, switchDemoUser } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('password123');
  const [adminDesignation, setAdminDesignation] = useState('Chief Operating Officer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations?all=true');
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadOrganizations();
  }, [user]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, '')) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(autoSlug);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          contactEmail: contactEmail.trim() || undefined,
          contactPhone: contactPhone.trim() || undefined,
          address: address.trim() || undefined,
          adminName: adminName.trim(),
          adminEmail: adminEmail.trim().toLowerCase(),
          adminPassword,
          adminDesignation: adminDesignation.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create organization');
      }

      setSuccessMsg(`🎉 Organization "${name}" created successfully with Admin account (${adminEmail})!`);
      setShowModal(false);

      // Reset form
      setName('');
      setSlug('');
      setContactEmail('');
      setContactPhone('');
      setAddress('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('password123');

      loadOrganizations();
      setTimeout(() => setSuccessMsg(null), 8000);
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
          Only Organization Administrators can access the Platform Multi-Tenant Hub.
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
            <Building2 className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-black text-slate-900">Platform Multi-Tenant Hub</h1>
            <span className="text-[10px] font-bold uppercase bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-mono">
              Owner Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create, manage, and oversee all independent organizations operating on this platform
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setShowModal(true);
          }}
          className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Organization (Tenant)</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Tenants</p>
            <p className="text-2xl font-black text-slate-900">{organizations.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Users Across Tenants</p>
            <p className="text-2xl font-black text-slate-900">
              {organizations.reduce((acc, o) => acc + (o._count?.users || 0), 0)}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Memos Processed</p>
            <p className="text-2xl font-black text-slate-900">
              {organizations.reduce((acc, o) => acc + (o._count?.memos || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Organizations (Tenants)</h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            Loading tenant directory...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {organizations.map((org) => {
              const isCurrent = user.organization.id === org.id;
              const adminUser = org.users?.[0];

              return (
                <div
                  key={org.id}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-sm ${
                    isCurrent ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Name + Slug */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{org.name}</h3>
                        <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1 inline-block">
                          {org.slug}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          Active Tenant
                        </span>
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Users</p>
                        <p className="font-black text-slate-800 text-sm mt-0.5">{org._count?.users || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Depts</p>
                        <p className="font-black text-slate-800 text-sm mt-0.5">{org._count?.departments || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Memos</p>
                        <p className="font-black text-brand-600 text-sm mt-0.5">{org._count?.memos || 0}</p>
                      </div>
                    </div>

                    {/* Admin Profile Preview */}
                    {adminUser && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-0.5">
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Admin: {adminUser.name}</span>
                        </p>
                        <p className="text-slate-500 font-mono text-[10px] truncate">{adminUser.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    {adminUser && !isCurrent ? (
                      <button
                        onClick={() => switchDemoUser(adminUser.id)}
                        className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Switch to this Tenant</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    ) : isCurrent ? (
                      <span className="text-xs text-slate-500 font-medium py-1">
                        Currently viewing this tenant
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 py-1">No admin account</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Tenant Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                <span>Create New Organization (Tenant)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Instantly provisions an isolated organization, departments, default categories, and an administrator account.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Dhaka General Hospital"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slug / Identifier *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. dgh"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@dgh.org"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+880-2-9876543"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Gulshan-2, Dhaka, Bangladesh"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              {/* Initial Admin Details */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Initial Organization Administrator Account</span>
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admin Full Name *</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Dr. Robert Admin"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admin Email *</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@dgh.org"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Designation / Title</label>
                    <input
                      type="text"
                      value={adminDesignation}
                      onChange={(e) => setAdminDesignation(e.target.value)}
                      placeholder="Medical Director"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Initial Password *</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="password123"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Provisioning Notice */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Automatic Provisioning Includes:</span>
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  <li>3 Standard Departments (Administration, Finance, Operations)</li>
                  <li>4 Pre-configured Memo Categories & Default Approval Template</li>
                  <li>Isolated storage and immediate appearance in Demo Persona Switcher</li>
                </ul>
              </div>

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
                  {submitting ? 'Provisioning Tenant...' : 'Create & Launch Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
