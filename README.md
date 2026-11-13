# Kaizen JAC

Company website and admin panel in a single Next.js 16 app, written in TypeScript.

| URL | What |
| --- | --- |
| `/` | Public website: Kaizen JAC group, Kaizen Design & Development and Kaizen Training Center |
| `/enterprise` | Kaizen Enterprise page: trade lines, product catalog (food imports incl. infant nutrition), contact form |
| `/admin` | Admin panel: edit content, upload media, read contact-form inquiries (password protected) |

```
src/app/                 Routes — website at /, admin under /admin, APIs under /api
src/components/site/     Website sections
src/components/admin/    Admin UI (content editor, media library, inquiries)
src/lib/                 Content types, storage, uploads, inquiries, admin auth
src/proxy.ts             Requires an admin session for /admin and /api/admin
seed-uploads/            Original photos, served as a fallback for /uploads/<name>
_legacy-vite/            The previous Vite site, kept for reference — safe to delete
```

## Local development

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm run dev                  # http://localhost:3000 and http://localhost:3000/admin
npm run typecheck            # strict TypeScript check (also runs during `npm run build`)
```

## How content is stored

Everything the admin changes lives in one storage folder (`KAIZEN_STORAGE_DIR`, default `./storage`, git-ignored):

- `content.json` — site text, contacts, businesses, projects and the Enterprise product catalog (admin → Enterprise tab → Product catalog). Until it exists the defaults in `src/lib/defaults.ts` are used (shape defined in `src/lib/types.ts`).
- `uploads/` — images and PDFs uploaded in the admin (max 10 MB each), served at `/uploads/<file>`.
- `inquiries/` — one JSON file per contact-form submission. The form has a hidden honeypot field and a per-IP limit of 5 submissions per 10 minutes.

## Deploying to Hostinger (Business or Cloud web hosting)

1. In hPanel go to **Websites → Add website → Node.js Apps**, connect GitHub and pick this repo, branch `main`.
2. Framework preset **Next.js**, Node.js **22**, package manager **npm**, build command `npm run build`.
3. Add environment variables:
   - `ADMIN_PASSWORD` — the admin login password
   - `ADMIN_SESSION_SECRET` — a long random string (e.g. output of `openssl rand -hex 32`)
   - `KAIZEN_STORAGE_DIR` — an absolute path **outside** the app's build folder, e.g. `/home/<hostinger-user>/kaizen-storage`.
     Hostinger replaces the build folder on every deploy, so storage inside it would be lost.
4. Deploy, then open `https://<domain>/admin` and sign in.
5. Check that storage survives a deploy: upload an image in the admin, redeploy, and confirm it still shows.

To update the site, push to `main` and redeploy from hPanel.
