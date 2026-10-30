'use client';

import { useState } from 'react';
import { Copy, Check, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { ACCEPTED_UPLOADS, uploadFiles } from '@/lib/upload';
import type { MediaFile } from '@/lib/types';

const formatSize = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

export default function MediaLibrary({ initialFiles }: { initialFiles: MediaFile[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const refresh = async () => {
    const res = await fetch('/api/admin/uploads');
    if (res.ok) setFiles(await res.json());
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setBusy(true);
    setError('');
    try {
      await uploadFiles(Array.from(fileList));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete ${name}? Any content still pointing to it will show a broken image.`)) return;
    const res = await fetch(`/api/admin/uploads?name=${encodeURIComponent(name)}`, { method: 'DELETE' });
    if (!res.ok) setError((await res.json()).error || 'Delete failed');
    await refresh();
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleUpload(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900 cursor-pointer text-sm text-slate-400"
      >
        {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
        <span>{busy ? 'Uploading…' : 'Drop files here or click to choose'}</span>
        <input type="file" multiple accept={ACCEPTED_UPLOADS} className="hidden" disabled={busy} onChange={(e) => {
          handleUpload(e.target.files);
          e.target.value = '';
        }} />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <div key={file.name} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="aspect-video bg-slate-950 flex items-center justify-center">
              {file.name.endsWith('.pdf') ? (
                <FileText className="w-10 h-10 text-slate-500" />
              ) : (
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-3 space-y-2">
              <p className="text-xs font-medium truncate" title={file.name}>{file.name}</p>
              <p className="text-[11px] text-slate-500">{formatSize(file.size)}{file.seeded && ' · built-in'}</p>
              <div className="flex gap-2">
                <button onClick={() => handleCopy(file.url)} className="btn-secondary flex-1 justify-center">
                  {copied === file.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === file.url ? 'Copied' : 'Copy URL'}
                </button>
                {!file.seeded && (
                  <button onClick={() => handleDelete(file.name)} className="btn-secondary hover:text-red-400" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!files.length && <p className="text-sm text-slate-500">No files uploaded yet.</p>}
    </div>
  );
}
