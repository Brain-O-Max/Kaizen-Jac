'use client';

import { useState } from 'react';
import { Archive, Mail, MailOpen, Phone, Reply, Trash2 } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';
import type { Inquiry, InquiryStatus } from '@/lib/types';
import { useAdmin } from './AdminShell';

const FILTERS: { key: string; label: string; match: (status: InquiryStatus) => boolean }[] = [
  { key: 'inbox', label: 'Inbox', match: (s) => s !== 'archived' },
  { key: 'new', label: 'New', match: (s) => s === 'new' },
  { key: 'replied', label: 'Replied', match: (s) => s === 'replied' },
  { key: 'archived', label: 'Archived', match: (s) => s === 'archived' },
];

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: 'bg-blue-950 text-blue-300 border-blue-800',
  read: 'bg-slate-800 text-slate-300 border-slate-700',
  replied: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  archived: 'bg-slate-900 text-slate-500 border-slate-800',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function InquiryList({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [filter, setFilter] = useState('inbox');
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { refreshNewCount } = useAdmin();
  const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err));

  const setStatus = async (id: string, status: InquiryStatus) => {
    setError('');
    try {
      const updated = await apiFetch<Inquiry>(API.inquiries, { method: 'PATCH', body: JSON.stringify({ id, status }) });
      setInquiries((list) => list.map((q) => (q.id === id ? updated : q)));
      refreshNewCount(); // updates the unread badge in the nav
    } catch (err) {
      setError(errorText(err));
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this inquiry permanently?')) return;
    try {
      await apiFetch(`${API.inquiries}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setInquiries((list) => list.filter((q) => q.id !== id));
      refreshNewCount();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const toggle = (q: Inquiry) => {
    setOpenId(openId === q.id ? null : q.id);
    if (q.status === 'new') setStatus(q.id, 'read');
  };

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const visible = inquiries.filter((q) => active.match(q.status));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold ${filter === f.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {f.label} ({inquiries.filter((q) => f.match(q.status)).length})
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!visible.length && <p className="text-sm text-slate-500 py-8 text-center">No inquiries here.</p>}

      <ul className="space-y-2">
        {visible.map((q) => {
          const open = openId === q.id;
          const replySubject = encodeURIComponent(`Re: Your inquiry to ${q.businessInterest || 'us'}`);
          return (
            <li key={q.id} className={`rounded-xl border bg-slate-900 ${q.status === 'new' ? 'border-blue-800' : 'border-slate-800'}`}>
              <button onClick={() => toggle(q)} className="w-full text-left p-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                {q.status === 'new' ? <Mail className="w-4 h-4 text-blue-400" /> : <MailOpen className="w-4 h-4 text-slate-500" />}
                <span className={`font-semibold ${q.status === 'new' ? 'text-white' : 'text-slate-300'}`}>{q.name}</span>
                <span className="text-xs text-slate-400">{q.businessInterest}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[q.status]}`}>{q.status}</span>
                <span className="ml-auto text-xs text-slate-500">{formatDate(q.createdAt)}</span>
                {!open && <p className="basis-full text-sm text-slate-400 truncate">{q.message}</p>}
              </button>

              {open && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <a href={`mailto:${q.email}`} className="text-blue-400 hover:underline">{q.email}</a>
                    {q.phone && (
                      <a href={`tel:${q.phone}`} className="flex items-center gap-1 text-slate-300 hover:text-white">
                        <Phone className="w-3.5 h-3.5" /> {q.phone}
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap bg-slate-950 border border-slate-800 rounded-lg p-4">{q.message}</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${q.email}?subject=${replySubject}`}
                      onClick={() => setStatus(q.id, 'replied')}
                      className="btn-primary"
                    >
                      <Reply className="w-3.5 h-3.5" /> Reply by email
                    </a>
                    {q.status !== 'new' && q.status !== 'archived' && (
                      <button onClick={() => setStatus(q.id, 'new')} className="btn-secondary">
                        <Mail className="w-3.5 h-3.5" /> Mark unread
                      </button>
                    )}
                    {q.status === 'archived' ? (
                      <button onClick={() => setStatus(q.id, 'read')} className="btn-secondary">
                        <MailOpen className="w-3.5 h-3.5" /> Move to inbox
                      </button>
                    ) : (
                      <button onClick={() => setStatus(q.id, 'archived')} className="btn-secondary">
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </button>
                    )}
                    <button onClick={() => remove(q.id)} className="btn-secondary hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
