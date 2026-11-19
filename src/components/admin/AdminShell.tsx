'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';
import type { Inquiry } from '@/lib/types';
import AdminNav, { type AdminSection } from './AdminNav';

interface AdminContextValue {
  // Re-counts new inquiries for the badge in the nav.
  refreshNewCount: () => void;
}

const AdminContext = createContext<AdminContextValue>({ refreshNewCount: () => {} });
export const useAdmin = () => useContext(AdminContext);

// Wraps every signed-in admin page: the pages are static HTML, so the sign-in check happens here in the browser
// (the PHP endpoints check the session again on every request).
export default function AdminShell({ siteName, active, children }: { siteName: string; active: AdminSection; children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [error, setError] = useState('');

  const refreshNewCount = useCallback(() => {
    apiFetch<Inquiry[]>(API.inquiries)
      .then((list) => setNewCount(list.filter((q) => q.status === 'new').length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    apiFetch<{ authenticated: boolean }>(API.session)
      .then(({ authenticated }) => {
        if (!authenticated) {
          window.location.replace(`/admin/login/?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        setReady(true);
        refreshNewCount();
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [refreshNewCount]);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-sm text-slate-400">
        {error ? (
          <p className="card max-w-md text-red-400">The admin backend did not respond: {error}</p>
        ) : (
          <Loader2 className="w-6 h-6 animate-spin" aria-label="Loading" />
        )}
      </main>
    );
  }

  return (
    <AdminContext.Provider value={{ refreshNewCount }}>
      <AdminNav siteName={siteName} active={active} newCount={newCount} />
      {children}
    </AdminContext.Provider>
  );
}

// Loads data for an admin page once, with loading and error states.
export function useAdminData<T>(load: () => Promise<T>): { data: T | null; error: string } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    load()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data, error };
}

export function AdminLoading({ error }: { error: string }) {
  return error ? (
    <p className="text-sm text-red-400">{error}</p>
  ) : (
    <Loader2 className="w-5 h-5 animate-spin text-slate-400" aria-label="Loading" />
  );
}
