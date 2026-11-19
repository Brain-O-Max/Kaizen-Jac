import { API, apiFetch } from './api';
import type { UploadedFile } from './types';

// Client-side helper: uploads one or more files and returns the saved entries.
export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  const body = new FormData();
  for (const file of files) body.append('file[]', file);
  return apiFetch<UploadedFile[]>(API.uploads, { method: 'POST', body });
}

export const ACCEPTED_UPLOADS = 'image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf';
