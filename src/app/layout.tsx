import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Inter-Office Memo Management System | CSE226 NSU',
  description: 'Enterprise Multi-Tenant Sequential Memo Approval & Workflow Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
