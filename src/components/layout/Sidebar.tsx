'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Inbox,
  Send,
  CheckCircle,
  FileEdit,
  PlusCircle,
  Search,
  Users,
  Building2,
  Tags,
  GitBranch,
  ShieldCheck,
  BarChart3,
  RotateCcw,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Inbox (Action)', href: '/memos/inbox', icon: Inbox, highlight: true },
    { label: 'Sent Memos', href: '/memos/sent', icon: Send },
    { label: 'Completed', href: '/memos/completed', icon: CheckCircle },
    { label: 'Drafts', href: '/memos/drafts', icon: FileEdit },
    { label: 'Advanced Search', href: '/search', icon: Search },
    { label: 'Delegations', href: '/delegations', icon: UserCheck },
  ];

  const adminItems = [
    { label: 'Departments', href: '/admin/departments', icon: Building2 },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Memo Categories', href: '/admin/categories', icon: Tags },
    { label: 'Workflow Templates', href: '/admin/templates', icon: GitBranch },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: ShieldCheck },
    { label: 'Reports & Stats', href: '/admin/reports', icon: BarChart3 },
  ];

  const handleResetSeed = async () => {
    if (confirm('Reset and re-seed the demonstration database to initial state?')) {
      try {
        const res = await fetch('/api/seed', { method: 'POST' });
        if (res.ok) {
          alert('Database reset and re-seeded successfully!');
          window.location.reload();
        }
      } catch (e) {
        alert('Failed to reset database');
      }
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 no-print">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight">Inter-Office Memo</h1>
            <p className="text-[10px] text-slate-400 font-medium">Management System</p>
          </div>
        </Link>
      </div>

      {/* New Memo Primary Action Button */}
      <div className="p-4">
        <Link
          href="/memos/new"
          className="w-full flex items-center justify-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Office Memo</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Workflows & Memos
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Administration Section */}
        {isAdmin && (
          <>
            <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Tenant Admin</span>
              <span className="text-[9px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                ADMIN
              </span>
            </div>

            {adminItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-purple-700 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer: Demo Reset & Course Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
        <button
          onClick={handleResetSeed}
          className="w-full flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 px-3 rounded-lg transition"
          title="Reset database to initial demo state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>

        <div className="text-center pt-1 text-[10px] text-slate-400">
          CSE226 &bull; North South University
        </div>
      </div>
    </aside>
  );
}
