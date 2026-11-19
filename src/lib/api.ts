import type { SiteContent } from './types';

// Browser helpers for the PHP backend in /api (source: php/api). Locally the Next.js dev server forwards these
// URLs to `npm run php`; on shared hosting the web server runs the PHP files directly.
export const API = {
  content: '/api/content.php',
  session: '/api/session.php',
  uploads: '/api/uploads.php',
  inquiries: '/api/inquiries.php',
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// JSON request to the backend. Throws ApiError with the server's message on failure. The X-Kaizen-Admin header
// is required by the PHP on admin writes (a cross-site form can't send it).
export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('X-Kaizen-Admin', '1');
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json');
  let res: Response;
  try {
    res = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...init, headers });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || data === null) {
    const message = data && typeof data.error === 'string' ? data.error : `The server could not handle the request (${res.status}).`;
    throw new ApiError(message, res.status);
  }
  return data as T;
}

// Latest content saved in the admin, or null when nothing is saved yet. Throws if the backend can't be reached.
export async function fetchSavedContent(): Promise<SiteContent | null> {
  const { content } = await apiFetch<{ content: SiteContent | null }>(API.content);
  return content && Array.isArray(content.businesses) && content.meta && content.contacts ? content : null;
}

// Same, for the public pages: any failure (e.g. no PHP on a preview host) just means "keep the built-in content".
export const loadSavedContent = () => fetchSavedContent().catch(() => null);
