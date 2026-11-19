'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

// Only go back into the admin area after signing in.
function safeNext(value: string | null): string {
  return value && /^\/admin(\/|$)/.test(value) ? value : '/admin/';
}

export default function LoginForm({ siteName, initials }: { siteName: string; initials: string }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [configured, setConfigured] = useState(true);

  // Already signed in: skip the form.
  useEffect(() => {
    apiFetch<{ authenticated: boolean; configured: boolean }>(API.session)
      .then(({ authenticated, configured }) => {
        if (authenticated) window.location.replace(safeNext(new URLSearchParams(window.location.search).get('next')));
        setConfigured(configured);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiFetch(API.session, { method: 'POST', body: JSON.stringify({ password }) });
      window.location.href = safeNext(new URLSearchParams(window.location.search).get('next'));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-teal-500 to-amber-500 p-[2px]">
            <div className="w-full h-full bg-slate-900 rounded-[6px] flex items-center justify-center font-bold text-white">{initials}</div>
          </div>
          <div>
            <h1 className="text-lg font-bold">{siteName} Admin</h1>
            <p className="text-xs text-slate-400">Sign in to manage website content</p>
          </div>
        </div>

        {!configured && (
          <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-900 rounded-lg p-3">
            No admin password is set. Locally, set ADMIN_PASSWORD in .env.local; on the server, re-run the package
            script with a password and upload api/config.php again.
          </p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}

        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <input
            id="password"
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full justify-center py-2.5">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />} Sign in
        </button>
      </form>
    </main>
  );
}
