# Kaizen JAC

Three company websites, each with its own admin panel, built from one Next.js 16 codebase (TypeScript).
They run on ordinary **shared hosting (cPanel) without Node.js**. The pages are static HTML, and a small PHP
backend saves content, uploads and contact-form inquiries.

| Site | `SITE` value | Where it runs | Local port |
| --- | --- | --- | --- |
| Kaizen Enterprise | `enterprise` | main domain, e.g. `kaizenenterprise.com` | 3000 |
| Kaizen Design & Development | `design` | subdomain, e.g. `design.kaizenenterprise.com` | 3001 |
| Kaizen Training Center | `training` | subdomain, e.g. `training.kaizenenterprise.com` | 3002 |

The same code is built three times. `SITE` decides which website a build contains: its home page (`/`), its admin
panel (`/admin/`), its colours, SEO text and default content. Each site has its own admin password, saved content,
uploads and inquiries.

```
src/app/                 Pages: the site at /, admin under /admin (all static)
src/components/site/     Website sections (hero, product catalog, services, contact, footer)
src/components/admin/    Admin UI (sign-in, content editor, media library, inquiries)
src/lib/site.ts          The three sites (names, colours, URLs) and the SITE setting
src/lib/defaults.ts      Starting content for all companies; each site only uses its own
src/lib/api.ts           Browser calls to the PHP backend
php/api/                 PHP backend: content.php, session.php, uploads.php, inquiries.php
php/dev-router.php       Local PHP server for all three sites (npm run php)
scripts/package.mjs      Builds the upload package for a site (npm run package:<site>)
seed-uploads/            Original photos, shipped in every package's uploads/ folder
```

## How it works

- **Public pages** are built into static HTML with the content available at build time, so search engines see the
  full text. In the browser the page then loads the latest saved content from `/api/content.php`, so edits made in
  the online admin show immediately, without rebuilding.
  The `<title>`, description and structured data in the HTML only change when you rebuild and upload again.
- **Admin** (`/admin/`) pages are static too. Sign-in, saving and uploads go to the PHP scripts, which check the
  session on every request.
- **Contact form** posts to `/api/inquiries.php`. Each inquiry is saved (listed in the admin under Inquiries) and
  emailed with PHP `mail()` to `INQUIRY_EMAIL`, or to the contact email saved in the admin. Spam protection: hidden
  honeypot field and at most 5 submissions per IP per 10 minutes.

On the server, each site's folder looks like this:

```
public_html/            (or the subdomain's folder)
  index.html, admin/, _next/, 404.html ...   static site
  api/                  PHP backend; api/config.php holds the site id, password hash and inquiry email
  uploads/              photos and PDFs (served directly; scripts blocked by uploads/.htaccess)
  _data/                content.json, inquiries/, rate limits (web access blocked by _data/.htaccess)
  .htaccess             HTTPS redirect, 404 page, security headers
```

## Local development

You need Node.js 20.9+ and PHP 7.4+ on your PATH (for example from [windows.php.net](https://windows.php.net/download/):
unzip it and add the folder to PATH).

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD
npm run dev:all              # PHP backend (port 8080) + all three sites (ports 3000, 3001, 3002)
npm run php                  # or start them separately: the PHP backend...
npm run dev:enterprise       # ...and one site: dev:enterprise / dev:design / dev:training
npm run typecheck
```

The Next.js dev server forwards `/api/*` and `/uploads/*` to `npm run php`. Locally each site keeps its data in
`./storage/<site>` (`content.json`, `uploads/`, `inquiries/`). Emails are not sent locally unless PHP has mail
configured.

## Deploying to shared hosting (cPanel)

### 1. Build the upload packages (on your PC)

Create `.env.production.local` (copy `.env.example`) with the live settings:

| Variable | Meaning |
| --- | --- |
| `ADMIN_PASSWORD_ENTERPRISE`, `ADMIN_PASSWORD_DESIGN`, `ADMIN_PASSWORD_TRAINING` | Admin password per site (or one `ADMIN_PASSWORD` for all). Only a salted hash goes into the package. |
| `SITE_URL_ENTERPRISE`, `SITE_URL_DESIGN`, `SITE_URL_TRAINING` | Public address of each site, for the footer links and SEO. |
| `INQUIRY_EMAIL` (or `INQUIRY_EMAIL_<SITE>`) | Optional. Where contact-form inquiries are emailed. Default: the contact email saved in the admin. |

Then run:

```bash
npm run package:all          # or package:enterprise / package:design / package:training
```

This creates `deploy/<site>/` and `deploy/<site>.zip` for each site.

### 2. Upload

For each site, in cPanel:

1. Create the subdomains (`design.`, `training.`) under **Domains**. Note each one's document root folder.
2. Open **File Manager** and go to the site's folder (`public_html` for the main domain). Upload `deploy/<site>.zip`,
   then right-click it, choose **Extract**, and delete the zip. Turn on **Settings → Show Hidden Files** to check that
   the `.htaccess` files are there.
3. Under **Select PHP Version** (or MultiPHP Manager), use PHP 7.4 or newer (8.2+ recommended). Make sure the
   `fileinfo` extension is on.
4. Issue SSL certificates for all domains (**SSL/TLS Status → Run AutoSSL**). The root `.htaccess` redirects
   to HTTPS.
5. Open `https://<domain>/admin/`, sign in, and save once. Upload a test image, then send a test message through the
   contact form and check that the email arrives.

### Updating the code later

Run `npm run package:<site>` again and upload/extract over the old files. Saved content, uploads and inquiries
are kept: the package never contains `_data/content.json`, and uploaded files have unique names. To change an admin
password, set the new one in `.env.production.local`, re-package, and upload `api/config.php` again.

### Notes

- **Upload size:** `api/.user.ini` raises PHP's upload limit to allow 10 MB files. If uploads above 2 MB fail, set
  `upload_max_filesize` and `post_max_size` in cPanel's **MultiPHP INI Editor** instead.
- **Emails going to spam:** create the `noreply@<domain>` mailbox (or check that SPF/DKIM are on under
  **Email Deliverability**). The From address is `noreply@<domain>`, and Reply-To is the visitor.
- **Backups:** everything editable lives in `_data/` and `uploads/`. Include them in your backups.
- A static-only host such as Vercel or Netlify can show the public pages, but the admin and contact form need PHP.
