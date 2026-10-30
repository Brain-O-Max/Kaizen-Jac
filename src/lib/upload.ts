import type { UploadedFile } from './types';

// Client-side helper: uploads one or more files and returns the saved entries.
export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  const body = new FormData();
  for (const file of files) body.append('file', file);
  const res = await fetch('/api/admin/uploads', { method: 'POST', body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data as UploadedFile[];
}

export const ACCEPTED_UPLOADS = 'image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf';
