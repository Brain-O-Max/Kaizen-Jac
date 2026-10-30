import Link from 'next/link';
import { ExternalLink, FileText, Image as ImageIcon, Inbox, LogOut } from 'lucide-react';
import { listInquiries } from '@/lib/content';

export type AdminSection = 'content' | 'media' | 'inquiries';

export default async function AdminNav({ active }: { active: AdminSection }) {
  const newCount = (await listInquiries()).filter((q) => q.status === 'new').length;
  const linkClass = (key: AdminSection) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
      active === key ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-tight">KAIZEN JAC <span className="text-amber-400">Admin</span></span>
          <nav className="flex items-center gap-1">
            <Link href="/admin" className={linkClass('content')}>
              <FileText className="w-4 h-4" /> Content
            </Link>
            <Link href="/admin/media" className={linkClass('media')}>
              <ImageIcon className="w-4 h-4" /> Media
            </Link>
            <Link href="/admin/inquiries" className={linkClass('inquiries')}>
              <Inbox className="w-4 h-4" /> Inquiries
              {newCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold flex items-center justify-center">
                  {newCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="btn-secondary">
            <ExternalLink className="w-3.5 h-3.5" /> View site
          </a>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="btn-secondary">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
