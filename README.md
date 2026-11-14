# Kaizen JAC

Three company websites, each with its own admin panel, built from one Next.js 16 codebase (TypeScript).

| Site | `SITE` value | Where it runs | Local port |
| --- | --- | --- | --- |
| Kaizen Enterprise | `enterprise` | main domain, e.g. `kaizenenterprise.com` | 3000 |
| Kaizen Design & Development | `design` | subdomain, e.g. `design.kaizenenterprise.com` | 3001 |
| Kaizen Training Center | `training` | subdomain, e.g. `training.kaizenenterprise.com` | 3002 |

The same code is deployed three times. The `SITE` environment variable decides which website a deployment serves:
its home page (`/`), its admin panel (`/admin`), its colours, SEO text and default content.
Each deployment has its own admin password, saved content, uploads and inquiries.

```
src/app/                 Routes: the site at /, admin under /admin, APIs under /api
src/components/site/     Website sections (hero, product catalog, services, contact, footer)
src/components/admin/    Admin UI (content editor, media library, inquiries)
src/lib/site.ts          The three sites (names, colours, URLs) and the SITE setting
src/lib/defaults.ts      Starting content for all companies; each site only uses its own
src/lib/                 Content types, storage, uploads, inquiries, admin auth
src/proxy.ts             Requires an admin session for /admin and /api/admin
seed-uploads/            Original photos, served as a fallback for /uploads/<name>
```

## Local development

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm run dev:all              # all three sites at once (ports 3000, 3001, 3002)
npm run dev:enterprise       # or just one: dev:enterprise / dev:design / dev:training
npm run typecheck            # strict TypeScript check (also runs during `npm run build`)
```

`npm run dev` runs a single site (Enterprise unless `SITE` is set). Locally each site stores its data in `./storage/<site>`.

## Environment variables

| Variable | Required | Meaning |
| --- | --- | --- |
| `SITE` | yes (production) | `enterprise`, `design` or `training`. A wrong value is an error, so a typo can't show the wrong company. |
| `ADMIN_PASSWORD` | yes | Password for `/admin` of this deployment |
| `ADMIN_SESSION_SECRET` | yes | Long random string (16+ characters) that signs the admin session cookie |
| `KAIZEN_STORAGE_DIR` | production | Absolute path **outside** the deployed app folder for this site's `content.json`, `uploads/`, `inquiries/` |
| `SITE_URL_ENTERPRISE`, `SITE_URL_DESIGN`, `SITE_URL_TRAINING` | production | Public address of each site, e.g. `https://kaizenenterprise.com`. Used for footer links to the other companies and for SEO. Set all three on every deployment. |

## How content is stored

Everything the admin changes lives in that site's storage folder:

- `content.json` — site text, contacts, offices, services, projects and (Enterprise) the product catalog. Until it exists the defaults from `src/lib/defaults.ts` are used.
- `uploads/` — images and PDFs uploaded in the admin (max 10 MB each), served at `/uploads/<file>`.
- `inquiries/` — one JSON file per contact-form submission. The form has a hidden honeypot field and a per-IP limit of 5 submissions per 10 minutes.

## Deploying to Hostinger (Business or Cloud web hosting)

Create **three** Node.js apps from this same GitHub repo (branch `main`), one per site, then repeat these steps for each:

1. hPanel → **Websites → Add website → Node.js Apps**, connect GitHub, pick this repo.
2. Attach the domain: the main domain for Enterprise, a subdomain for the other two.
3. Framework preset **Next.js**, Node.js **22**, package manager **npm**, build command `npm run build`.
4. Environment variables:
   - `SITE` = `enterprise`, `design` or `training`
   - `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` (use a different password for each site)
   - `KAIZEN_STORAGE_DIR` = a folder **outside** the build folder, different for each site, e.g. `/home/<hostinger-user>/kaizen-storage-design`.
     Hostinger replaces the build folder on every deploy, so storage inside it would be lost.
   - `SITE_URL_ENTERPRISE`, `SITE_URL_DESIGN`, `SITE_URL_TRAINING` (same values on all three apps)
5. Deploy, then open `https://<domain>/admin` and sign in.
6. Check that storage survives a deploy: upload an image in the admin, redeploy, and confirm it still shows.

Pushing to `main` updates all three sites (redeploy each app from hPanel unless auto-deploy is on).

## Free preview on Vercel (read-only)

For showing the sites to the client before the real hosting is ready. Vercel's free plan has no permanent file storage, so
a Vercel deployment runs in **read-only mode** (detected automatically through the `VERCEL` variable, or force it anywhere
with `DEMO_READ_ONLY=1`):

- Works: all public pages with the default content, images, SEO text.
- Switched off: the admin panel (`/admin` shows a notice), uploads, and the contact form (visitors see a message to call or email instead).

The free (Hobby) plan is for non-commercial use, so use it for previews only; the live sites belong on Hostinger.

Create **three** Vercel projects from this repo (Vercel dashboard → Add New → Project → import `Kaizen-Jac`), one per site:

1. Framework is detected as Next.js; leave build settings as they are.
2. Add the environment variable `SITE` = `enterprise`, `design` or `training` (a different one per project).
3. Deploy. Each project gets an address like `https://<project-name>.vercel.app`.
4. Once all three exist, add `SITE_URL_ENTERPRISE`, `SITE_URL_DESIGN` and `SITE_URL_TRAINING` (the three addresses, same values in every project) and redeploy,
   so the footer links point to the other two sites. No admin password or storage settings are needed.
