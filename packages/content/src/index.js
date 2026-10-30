import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { defaultContent } from './defaults.js';

export { defaultContent };

// Both apps run with cwd = apps/<name>, so the shared storage folder sits two levels up.
// Override with KAIZEN_STORAGE_DIR in production (e.g. a mounted volume).
const storageDir = () => process.env.KAIZEN_STORAGE_DIR || path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../../storage');
const contentFile = () => path.join(storageDir(), 'content.json');
const uploadsDir = () => path.join(storageDir(), 'uploads');
const seedUploadsDir = () =>
  process.env.KAIZEN_SEED_UPLOADS_DIR || path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../../packages/content/seed-uploads');

export const UPLOAD_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'application/pdf': '.pdf',
};
const EXT_TO_MIME = Object.fromEntries(Object.entries(UPLOAD_MIME_TYPES).map(([mime, ext]) => [ext, mime]));
EXT_TO_MIME['.jpeg'] = 'image/jpeg';
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function getContent() {
  try {
    return JSON.parse(await fs.readFile(contentFile(), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return structuredClone(defaultContent);
    throw err;
  }
}

export async function saveContent(content) {
  validateContent(content);
  await fs.mkdir(storageDir(), { recursive: true });
  // Write to a temp file then rename so readers never see a half-written file.
  const tmp = `${contentFile()}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(content, null, 2), 'utf8');
  await fs.rename(tmp, contentFile());
}

export function validateContent(content) {
  const problems = [];
  if (!content || typeof content !== 'object') problems.push('content must be an object');
  else {
    if (!content.meta) problems.push('meta is required');
    if (!content.umbrella) problems.push('umbrella is required');
    if (!content.contacts || !Array.isArray(content.contacts.phones)) problems.push('contacts.phones must be an array');
    if (!Array.isArray(content.businesses)) problems.push('businesses must be an array');
  }
  if (problems.length) throw new Error(`Invalid content: ${problems.join('; ')}`);
}

// Saves an uploaded File (from request.formData()) and returns its public URL.
export async function saveUpload(file) {
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

// Returns { body, type } for a stored upload (falling back to bundled seed images), or null.
export async function readUpload(name) {
  const safe = path.basename(name);
  const type = EXT_TO_MIME[path.extname(safe).toLowerCase()];
  if (!type || safe !== name) return null;
  for (const dir of [uploadsDir(), seedUploadsDir()]) {
    try {
      return { body: await fs.readFile(path.join(dir, safe)), type };
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
  return null;
}

export async function listUploads() {
  const entries = [];
  for (const [dir, seeded] of [[uploadsDir(), false], [seedUploadsDir(), true]]) {
    let names = [];
    try {
      names = await fs.readdir(/*turbopackIgnore: true*/ dir);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
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

export async function deleteUpload(name) {
  const safe = path.basename(name);
  if (safe !== name) throw new Error('Invalid file name');
  await fs.unlink(path.join(uploadsDir(), safe));
}

// Shared GET handler for the /uploads/[name] route in both apps.
export async function serveUpload(name) {
  const file = await readUpload(name);
  if (!file) return new Response('Not found', { status: 404 });
  return new Response(file.body, {
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
const inquiryFile = (id) => {
  if (!/^[a-z0-9-]+$/.test(id || '')) throw new Error('Invalid inquiry id');
  return path.join(inquiriesDir(), `${id}.json`);
};

const INQUIRY_LIMITS = { name: 120, email: 200, phone: 40, businessInterest: 120, message: 5000 };

// Validates and stores a public contact-form submission. Throws with a user-facing message on bad input.
export async function saveInquiry(input) {
  const clean = {};
  for (const [key, max] of Object.entries(INQUIRY_LIMITS)) {
    const value = typeof input?.[key] === 'string' ? input[key].trim() : '';
    if (value.length > max) throw new Error(`${key} is too long`);
    clean[key] = value;
  }
  if (!clean.name || !clean.message) throw new Error('Name and message are required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) throw new Error('A valid email address is required');

  const inquiry = {
    id: `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    ...clean,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  await fs.mkdir(inquiriesDir(), { recursive: true });
  await fs.writeFile(inquiryFile(inquiry.id), JSON.stringify(inquiry, null, 2), 'utf8');
  return inquiry;
}

export async function listInquiries() {
  let names = [];
  try {
    names = await fs.readdir(/*turbopackIgnore: true*/ inquiriesDir());
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  const items = await Promise.all(
    names.filter((n) => n.endsWith('.json')).map(async (n) => JSON.parse(await fs.readFile(path.join(/*turbopackIgnore: true*/ inquiriesDir(), n), 'utf8')))
  );
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const INQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'];

export async function setInquiryStatus(id, status) {
  if (!INQUIRY_STATUSES.includes(status)) throw new Error('Invalid status');
  const file = inquiryFile(id);
  const inquiry = JSON.parse(await fs.readFile(file, 'utf8'));
  inquiry.status = status;
  inquiry.updatedAt = new Date().toISOString();
  await fs.writeFile(file, JSON.stringify(inquiry, null, 2), 'utf8');
  return inquiry;
}

export async function deleteInquiry(id) {
  await fs.unlink(inquiryFile(id));
}
