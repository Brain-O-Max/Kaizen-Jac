'use client';

import { useState, type ChangeEvent } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { uploadFiles } from '@/lib/upload';

// Shows the current image, lets the admin paste a URL or upload a replacement.
interface ImageFieldProps {
  label: string;
  value: string | undefined;
  onChange: (url: string) => void;
}

export default function ImageField({ label, value, onChange }: ImageFieldProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const [saved] = await uploadFiles([file]);
      onChange(saved.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex gap-3 items-start">
        <div className="w-32 h-20 shrink-0 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
          {value && <img src={value} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 space-y-2">
          <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="field-input" placeholder="/uploads/..." />
          <label className="btn-secondary cursor-pointer">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {busy ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={handleFile} className="hidden" disabled={busy} />
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
