import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined, formatStr: string = 'PPpp'): string {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, formatStr);
  } catch {
    return 'Invalid Date';
  }
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return 'N/A';
  }
}

export function generateReferenceNumber(orgSlug: string = 'MEMO'): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${orgSlug.toUpperCase()}-${year}-${randomDigits}`;
}

export function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    case 'CHANGES_REQUESTED':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    case 'PENDING_APPROVAL':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    case 'PENDING_REVIEW':
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    case 'SUBMITTED':
      return 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800';
    case 'DRAFT':
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    case 'CANCELLED':
      return 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

export function getPriorityBadgeClasses(priority: string): string {
  switch (priority) {
    case 'URGENT':
      return 'bg-rose-600 text-white font-bold animate-pulse';
    case 'HIGH':
      return 'bg-amber-500 text-white font-semibold';
    case 'NORMAL':
    default:
      return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
  }
}

export function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
