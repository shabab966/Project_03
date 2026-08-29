'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Key,
} from 'lucide-react';

export default function LoginPage() {
  const { login, demoOrgs } = useAuth();
  const [email, setEmail] = useState('alice.ece@nsu.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotResult, setForgotResult] = useState<{
    email: string;
    emailDelivered?: boolean;
    resetUrl?: string | null;
    warning?: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotResult(null);
    setLoading(true);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter your email address in the field above to reset your password.');
      return;
    }

    setError(null);
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      setForgotResult({
        email: email.trim(),
        emailDelivered: data.emailDelivered,
        resetUrl: data.resetUrl,
        warning: data.emailWarning,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
    setForgotResult(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white shadow-xl mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Inter-Office Memo
        </h2>
        <p className="mt-1 text-xs text-slate-400 font-medium tracking-wide uppercase">
          Multi-Tenant Sequential Workflow Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl z-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Login Box */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-1">Sign In to Your Workspace</h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter your organizational credentials to access your memo inbox.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Forgot Password Status Banner */}
            {forgotResult && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-slate-800 text-xs rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-brand-600 shrink-0" />
                    <p className="font-bold text-slate-900">Password Reset Requested</p>
                  </div>
                  <button
                    onClick={() => setForgotResult(null)}
                    className="text-[11px] text-slate-400 hover:text-slate-700"
                  >
                    Dismiss
                  </button>
                </div>

                {forgotResult.emailDelivered ? (
                  <p className="text-emerald-700 font-medium">
                    ✅ Password reset email dispatched to <strong>{forgotResult.email}</strong>! Please check your inbox or spam folder.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-600 text-[11px]">
                      {forgotResult.warning || 'Email delivery limited by provider sandbox. Direct reset link generated:'}
                    </p>
                    {forgotResult.resetUrl && (
                      <div className="flex items-center space-x-2 pt-1">
                        <a
                          href={forgotResult.resetUrl}
                          className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Reset Password Now &rarr;</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(forgotResult.resetUrl!)}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                          title="Copy reset link"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@nsu.edu"
                    className="block w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending Reset Email...' : 'Forgot password?'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Demo Accounts Quick Picker */}
          <div className="lg:col-span-6 bg-slate-800/90 backdrop-blur p-6 sm:p-7 rounded-3xl border border-slate-700 text-white flex flex-col">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Evaluation Demo Accounts
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Click any account below to instantly pre-fill credentials (Password: <code className="text-amber-300 font-mono">password123</code>):
            </p>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[380px] pr-1">
              {demoOrgs.map((org) => (
                <div key={org.id}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-brand-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-1">
                    <span className="flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1" /> {org.name} ({org.slug})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {org.users.map((u) => {
                      const isAdmin = u.role === 'ADMIN';
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickLogin(u.email)}
                          className={`text-left p-2.5 rounded-xl border transition ${
                            isAdmin
                              ? 'bg-purple-900/40 hover:bg-purple-900/60 border-purple-500/50'
                              : 'bg-slate-700/60 hover:bg-slate-700 border-slate-600'
                          }`}
                        >
                          <div className={`text-xs font-bold ${isAdmin ? 'text-purple-200' : 'text-white'}`}>
                            {u.name}
                          </div>
                          <div className={`text-[10px] truncate ${isAdmin ? 'text-purple-300' : 'text-slate-300'}`}>
                            {u.designation}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
