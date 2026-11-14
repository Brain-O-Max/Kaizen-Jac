import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { defaultContent } from './defaults';
import { SITES, currentSiteId, type SiteId } from './site';
import {
  INQUIRY_STATUSES,
  type Inquiry,
  type InquiryStatus,
  type MediaFile,
  type SiteContent,
  type UploadedFile,
} from './types';

export { defaultContent, INQUIRY_STATUSES };

// Saved content, uploads and inquiries. In production set KAIZEN_STORAGE_DIR to an absolute path
// OUTSIDE the deployed app folder (hosts like Hostinger replace that folder on every deploy).
// Every site keeps its own storage; locally that is ./storage/<site>.
const storageDir = () =>
  process.env.KAIZEN_STORAGE_DIR || path.resolve(/*turbopackIgnore: true*/ process.cwd(), 'storage', currentSiteId());
const contentFile = () => path.join(storageDir(), 'content.json');
const uploadsDir = () => path.join(storageDir(), 'uploads');
// The original photos ship with the code and are served when no upload of that name exists.
const seedUploadsDir = () => path.resolve(/*turbopackIgnore: true*/ process.cwd(), 'seed-uploads');

// True when a filesystem error means "file or folder does not exist".
export function isNotFound(err: unknown): boolean {
  return (err as NodeJS.ErrnoException | null)?.code === 'ENOENT';
}

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

export const UPLOAD_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'application/pdf': '.pdf',
};
const EXT_TO_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(UPLOAD_MIME_TYPES).map(([mime, ext]) => [ext, mime])
);
EXT_TO_MIME['.jpeg'] = 'image/jpeg';
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Starting content for one site: only its own business and offices, with SEO text derived from the business.
export function defaultContentFor(site: SiteId): SiteContent {
  const config = SITES[site];
  const content = structuredClone(defaultContent);
  content.businesses = content.businesses.filter((b) => b.id === config.businessId);
  content.umbrella.offices = content.umbrella.offices.filter((o) => o.business === config.businessId);
  const business = content.businesses[0];
  if (business) {
    content.meta = {
      ...content.meta,
      title: `${business.name} — ${business.shortTitle} | ${content.umbrella.name}`,
      description: business.summary,
      keywords: config.keywords,
    };
  }
  return content;
}

// Content of the site this deployment serves: what the admin saved, or the defaults until then.
export async function getContent(): Promise<SiteContent> {
  try {
    return JSON.parse(await fs.readFile(contentFile(), 'utf8')) as SiteContent;
  } catch (err) {
    if (isNotFound(err)) return defaultContentFor(currentSiteId());
    throw err;
  }
}

export async function saveContent(content: unknown): Promise<void> {
  validateContent(content);
  await fs.mkdir(storageDir(), { recursive: true });
  // Write to a temp file then rename so readers never see a half-written file.
  const tmp = `${contentFile()}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(content, null, 2), 'utf8');
  await fs.rename(tmp, contentFile());
}

// Structural check of admin-submitted JSON before it replaces the live content.
export function validateContent(content: unknown): asserts content is SiteContent {
  const problems: string[] = [];
  const c = content as Partial<SiteContent> | null;
  if (!c || typeof c !== 'object') problems.push('content must be an object');
  else {
    if (!c.meta) problems.push('meta is required');
    if (!c.umbrella) problems.push('umbrella is required');
    if (!c.contacts || !Array.isArray(c.contacts.phones)) problems.push('contacts.phones must be an array');
    if (!Array.isArray(c.businesses)) problems.push('businesses must be an array');
  }
  if (problems.length) throw new Error(`Invalid content: ${problems.join('; ')}`);
}

// Saves an uploaded File (from request.formData()) and returns its public URL.
export async function saveUpload(file: File): Promise<UploadedFile> {
  const ext = UPLOAD_MIME_TYPES[file.type];
  if (!ext) throw new Error(`Unsupported file type: ${file.type || 'unknown'}`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('File is larger than 10 MB');

  const base = path
    .parse(file.name || 'upload')
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'upload';
  const name = `${base}-${crypto.randomBytes(4).toString('hex')}${ext}`;

  await fs.mkdir(uploadsDir(), { recursive: true });
  await fs.writeFile(path.join(uploadsDir(), name), Buffer.from(await file.arrayBuffer()));
  return { name, url: `/uploads/${name}`, size: file.size, type: file.type };
}

// Returns the bytes and MIME type of a stored upload (falling back to bundled seed images), or null.
export async function readUpload(name: string): Promise<{ body: Buffer; type: string } | null> {
  const safe = path.basename(name);
  const type = EXT_TO_MIME[path.extname(safe).toLowerCase()];
  if (!type || safe !== name) return null;
  for (const dir of [uploadsDir(), seedUploadsDir()]) {
    try {
      return { body: await fs.readFile(path.join(dir, safe)), type };
    } catch (err) {
      if (!isNotFound(err)) throw err;
    }
  }
  return null;
}

export async function listUploads(): Promise<MediaFile[]> {
  const entries: MediaFile[] = [];
  const sources: [string, boolean][] = [[uploadsDir(), false], [seedUploadsDir(), true]];
  for (const [dir, seeded] of sources) {
    let names: string[] = [];
    try {
      names = await fs.readdir(/*turbopackIgnore: true*/ dir);
    } catch (err) {
      if (!isNotFound(err)) throw err;
    }
    for (const name of names) {
      if (!EXT_TO_MIME[path.extname(name).toLowerCase()]) continue;
      if (entries.some((e) => e.name === name)) continue;
      const stat = await fs.stat(path.join(/*turbopackIgnore: true*/ dir, name));
      entries.push({ name, url: `/uploads/${name}`, size: stat.size, modifiedAt: stat.mtime.toISOString(), seeded });
    }
  }
  return entries.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

export async function deleteUpload(name: string): Promise<void> {
  const safe = path.basename(name);
  if (safe !== name) throw new Error('Invalid file name');
  await fs.unlink(path.join(uploadsDir(), safe));
}

// GET handler body for the /uploads/[name] route.
export async function serveUpload(name: string): Promise<Response> {
  const file = await readUpload(name);
  if (!file) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(file.body), {
    headers: {
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

// ---- Contact form inquiries ----
// One JSON file per inquiry, so the website (creating) and admin (updating) never overwrite each other.
const inquiriesDir = () => path.join(storageDir(), 'inquiries');
const inquiryFile = (id: unknown) => {
  if (typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id)) throw new Error('Invalid inquiry id');
  return path.join(inquiriesDir(), `${id}.json`);
};

const INQUIRY_LIMITS = { name: 120, email: 200, phone: 40, businessInterest: 120, message: 5000 };
type InquiryFields = Record<keyof typeof INQUIRY_LIMITS, string>;

// Validates and stores a public contact-form submission. Throws with a user-facing message on bad input.
export async function saveInquiry(input: unknown): Promise<Inquiry> {
  const raw = (input ?? {}) as Record<string, unknown>;
  const clean = {} as InquiryFields;
  for (const [key, max] of Object.entries(INQUIRY_LIMITS) as [keyof InquiryFields, number][]) {
    const value = typeof raw[key] === 'string' ? (raw[key] as string).trim() : '';
    if (value.length > max) throw new Error(`${key} is too long`);
    clean[key] = value;
  }
  if (!clean.name || !clean.message) throw new Error('Name and message are required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) throw new Error('A valid email address is required');

  const inquiry: Inquiry = {
    id: `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    ...clean,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  await fs.mkdir(inquiriesDir(), { recursive: true });
  await fs.writeFile(inquiryFile(inquiry.id), JSON.stringify(inquiry, null, 2), 'utf8');
  return inquiry;
}

export async function listInquiries(): Promise<Inquiry[]> {
  let names: string[] = [];
  try {
    names = await fs.readdir(/*turbopackIgnore: true*/ inquiriesDir());
  } catch (err) {
    if (!isNotFound(err)) throw err;
  }
  const items = await Promise.all(
    names
      .filter((n) => n.endsWith('.json'))
      .map(async (n) => JSON.parse(await fs.readFile(path.join(/*turbopackIgnore: true*/ inquiriesDir(), n), 'utf8')) as Inquiry)
  );
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

const isInquiryStatus = (value: unknown): value is InquiryStatus =>
  (INQUIRY_STATUSES as readonly unknown[]).includes(value);

export async function setInquiryStatus(id: unknown, status: unknown): Promise<Inquiry> {
  if (!isInquiryStatus(status)) throw new Error('Invalid status');
  const file = inquiryFile(id);
  const inquiry = JSON.parse(await fs.readFile(file, 'utf8')) as Inquiry;
  inquiry.status = status;
  inquiry.updatedAt = new Date().toISOString();
  await fs.writeFile(file, JSON.stringify(inquiry, null, 2), 'utf8');
  return inquiry;
}

export async function deleteInquiry(id: unknown): Promise<void> {
  await fs.unlink(inquiryFile(id));
}
