# Kaizen JAC

npm-workspaces monorepo with two Next.js apps that share one content store.

```
apps/
  web/        Public website            → http://localhost:3000
  admin/      Admin panel (login, content editor, media uploads) → http://localhost:3001
packages/
  content/    Shared content defaults, storage (content.json + uploads), admin auth helpers
storage/      Created at runtime: content.json and uploads/ (git-ignored)
_legacy-vite/ The previous Vite + React site, kept for reference — safe to delete
```

## Getting started

```bash
npm install
cp apps/admin/.env.example apps/admin/.env.local   # then set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm run dev                                         # runs web and admin together
```

`npm run dev:web` / `npm run dev:admin` run one app; `npm run build` builds both.

## How content flows

- Until an admin saves, both apps serve the defaults in `packages/content/src/defaults.js`.
- Saving in the admin writes `storage/content.json`; the website reads it on every request, so changes are live immediately.
- Uploads (JPG, PNG, WebP, GIF, AVIF, PDF; max 10 MB) are saved to `storage/uploads/` and served at `/uploads/<file>` by **both** apps.
  The original photos ship in `packages/content/seed-uploads/` and are used as a fallback.
- Contact-form submissions are saved one file each in `storage/inquiries/` and appear under **Inquiries** in the admin
  (new / read / replied / archived). The form has a hidden honeypot field and a per-IP limit of 5 submissions per 10 minutes.

## Deploying

Both apps need to read the same `storage` folder, so run them on the same server (or point `KAIZEN_STORAGE_DIR` at a shared volume).
For serverless hosting such as Vercel, where the filesystem isn't persistent, swap the functions in `packages/content/src/index.js`
for a database and object storage (e.g. Postgres + S3/R2); the apps only use that module's exports.
