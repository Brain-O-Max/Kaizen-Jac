import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Lock } from 'lucide-react';
import { SITES, currentSiteId } from '@/lib/site';
import { SESSION_COOKIE, SESSION_MAX_AGE, checkPassword, createSessionToken } from '@/lib/auth';

// Only redirect back into the admin area after login.
function safeNext(value: unknown): string {
  return typeof value === 'string' && /^\/admin(\/|$)/.test(value) ? value : '/admin';
}

async function login(formData: FormData) {
  'use server';
  const next = safeNext(formData.get('next'));
  if (!(await checkPassword(formData.get('password')))) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  redirect(next);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const site = SITES[currentSiteId()];
  const configured = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form action={login} className="w-full max-w-sm card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-teal-500 to-amber-500 p-[2px]">
            <div className="w-full h-full bg-slate-900 rounded-[6px] flex items-center justify-center font-bold text-white">{site.initials}</div>
          </div>
          <div>
            <h1 className="text-lg font-bold">{site.name} Admin</h1>
            <p className="text-xs text-slate-400">Sign in to manage website content</p>
          </div>
        </div>

        {!configured && (
          <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-900 rounded-lg p-3">
            ADMIN_PASSWORD and ADMIN_SESSION_SECRET are not set. Copy .env.example to .env.local (or set them in the hosting panel).
          </p>
        )}
        {error && <p className="text-xs text-red-400">Incorrect password.</p>}

        <input type="hidden" name="next" value={safeNext(next)} />
        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <input id="password" name="password" type="password" required autoFocus className="field-input" />
        </div>
        <button type="submit" className="btn-primary w-full justify-center py-2.5">
          <Lock className="w-3.5 h-3.5" /> Sign in
        </button>
      </form>
    </main>
  );
}
