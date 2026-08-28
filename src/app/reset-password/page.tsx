'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  const isInvite = searchParams.get('verified') === 'true';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e', '#0e8ceb'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/login?reset=success'), 2500);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <AlertCircle size={48} color="#ef4444" />
        <h2 style={{ marginTop: '16px', color: '#0f172a' }}>Invalid Link</h2>
        <p style={{ color: '#64748b' }}>This link is invalid or has already been used.</p>
        <button onClick={() => router.push('/login')}
          style={{ marginTop: '16px', background: '#0e8ceb', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontSize: '14px' }}>
          Back to Login
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <CheckCircle size={56} color="#22c55e" />
        <h2 style={{ marginTop: '16px', color: '#0f172a', fontSize: '22px', fontWeight: 700 }}>Password Set!</h2>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Redirecting you to the login page…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
        {isInvite ? '🎉 Set Your Password' : '🔐 Reset Your Password'}
      </h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
        {isInvite
          ? 'Your email has been verified! Choose a strong password to complete your account setup.'
          : 'Enter a new password for your account.'}
      </p>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} color="#ef4444" />
          <span style={{ color: '#dc2626', fontSize: '14px' }}>{error}</span>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>New Password</label>
        <div style={{ position: 'relative' }}>
          <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Minimum 8 characters"
            style={{ width: '100%', padding: '12px 40px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {password && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= strength ? strengthColor[strength] : '#e5e7eb', transition: 'all 0.2s' }} />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Confirm Password</label>
        <div style={{ position: 'relative' }}>
          <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type={showPass ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            placeholder="Re-enter your password"
            style={{ width: '100%', padding: '12px 40px', border: `1px solid ${confirm && confirm !== password ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>
        {confirm && confirm !== password && (
          <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>Passwords do not match</p>
        )}
      </div>

      <button type="submit" disabled={loading || password !== confirm}
        style={{ width: '100%', padding: '13px', background: loading ? '#94a3b8' : '#0e8ceb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {loading ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : isInvite ? '✅ Set Password & Login' : '🔐 Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0e8ceb22 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', background: '#0e8ceb', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>📄</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>INTER-OFFICE MEMO SYSTEM</p>
        </div>

        <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}><Loader2 size={32} /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
