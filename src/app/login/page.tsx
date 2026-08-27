'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
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
} from 'lucide-react';

export default function LoginPage() {
  const { login, demoOrgs } = useAuth();
  const [email, setEmail] = useState('alice.ece@nsu.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
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

            {forgotSent && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Password reset instructions dispatched to your email address.</span>
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
                  onClick={() => setForgotSent(true)}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                >
                  Forgot password?
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

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] pr-1">
              {/* Organization 1 */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-brand-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-1">
                  <span className="flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1" /> North South University (nsu)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('alice.ece@nsu.edu')}
                    className="text-left p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600 transition"
                  >
                    <div className="text-xs font-bold text-white">Alice Johnson</div>
                    <div className="text-[10px] text-slate-300">Faculty ECE (Author)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('chair.ece@nsu.edu')}
                    className="text-left p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600 transition"
                  >
                    <div className="text-xs font-bold text-white">Dr. Shazzad Hossein</div>
                    <div className="text-[10px] text-slate-300">Chair ECE (Reviewer/Delegate)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('finance@nsu.edu')}
                    className="text-left p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600 transition"
                  >
                    <div className="text-xs font-bold text-white">Mr. Tanvir Ahmed</div>
                    <div className="text-[10px] text-slate-300">Director of Finance</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('dean.seps@nsu.edu')}
                    className="text-left p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600 transition"
                  >
                    <div className="text-xs font-bold text-white">Prof. Dr. Rajesh Palit</div>
                    <div className="text-[10px] text-slate-300">Dean of SEPS</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('vc@nsu.edu')}
                    className="text-left p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600 transition"
                  >
                    <div className="text-xs font-bold text-white">Prof. Atiqul Islam</div>
                    <div className="text-[10px] text-slate-300">Vice Chancellor (Final Approver)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@nsu.edu')}
                    className="text-left p-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/50 transition"
                  >
                    <div className="text-xs font-bold text-purple-200">Dr. M. Admin</div>
                    <div className="text-[10px] text-purple-300">Org Admin & IT Director</div>
                  </button>
                </div>
              </div>

              {/* Organization 2 */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-1">
                  <span className="flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1" /> Apex Global Tech (Tenant 2 Isolation)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('john.doe@apex.io')}
                    className="text-left p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600 transition"
                  >
                    <div className="text-xs font-bold text-white">John Doe</div>
                    <div className="text-[10px] text-slate-300">Staff Dev (Author)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@apex.io')}
                    className="text-left p-2.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-500/50 transition"
                  >
                    <div className="text-xs font-bold text-emerald-200">Sarah Connor</div>
                    <div className="text-[10px] text-emerald-300">Apex Org Admin</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
