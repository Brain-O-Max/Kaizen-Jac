// Uploads a packaged site (deploy/<site>/, built by `npm run package:<site>`) to the hosting account over FTP:
//
//   npm run deploy:enterprise        package + upload one site
//   npm run deploy:all               package + upload all three
//   node scripts/deploy-ftp.mjs all --dry-run    only show where each site would go
//
// Settings come from .env.production.local:
//   FTP_HOST, FTP_USER, FTP_PASSWORD      the hosting account's FTP login
//   FTP_PORT                              optional, default 21
//   FTP_SECURE                            optional: true (default, FTPS), false (plain FTP)
//   FTP_DIR_ENTERPRISE / _DESIGN / _TRAINING
//                                         optional folder of each site, relative to the FTP login's home.
//                                         Default: domains/<domain>/public_html (DirectAdmin) or public_html
//                                         (cPanel) for the main site, and <that>/<subdomain> for the others.
//
// Files are only added or replaced, never deleted, so content saved online (_data/content.json, inquiries)
// and photos uploaded in the admin stay as they are.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Client } from 'basic-ftp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(root, false);

const SITES = ['enterprise', 'design', 'training'];
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const arg = args.find((a) => !a.startsWith('--'));
const targets = arg === 'all' ? SITES : [arg];
if (!targets.every((s) => SITES.includes(s))) {
  console.error(`Usage: node scripts/deploy-ftp.mjs <${SITES.join('|')}|all> [--dry-run]`);
  process.exit(1);
}

const env = (name) => (process.env[name] || '').trim();
const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

async function exists(client, dir) {
  try {
    await client.list(dir);
    return true;
  } catch {
    return false;
  }
}

// Where the main domain's files live for this FTP login.
async function mainDir(client) {
  if (env('FTP_DIR_ENTERPRISE')) return env('FTP_DIR_ENTERPRISE');
  const domain = hostOf(env('SITE_URL_ENTERPRISE'));
  const candidates = [domain && `domains/${domain}/public_html`, 'public_html'].filter(Boolean);
  for (const dir of candidates) if (await exists(client, dir)) return dir;
  throw new Error(`Could not find the website folder (tried ${candidates.join(', ')}). Set FTP_DIR_ENTERPRISE.`);
}

async function siteDir(client, site) {
  const explicit = env(`FTP_DIR_${site.toUpperCase()}`);
  if (explicit) return explicit;
  const base = await mainDir(client);
  if (site === 'enterprise') return base;
  const mainHost = hostOf(env('SITE_URL_ENTERPRISE'));
  const host = hostOf(env(`SITE_URL_${site.toUpperCase()}`));
  const label = mainHost && host.endsWith(`.${mainHost}`) ? host.slice(0, -mainHost.length - 1) : site;
  return `${base}/${label}`;
}

function countFiles(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1;
  return n;
}

async function main() {
  const missing = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD'].filter((k) => !env(k));
  if (missing.length) throw new Error(`Set ${missing.join(', ')} in .env.production.local first.`);

  const client = new Client(60_000);
  const secure = env('FTP_SECURE').toLowerCase() !== 'false';
  console.log(`Connecting to ${env('FTP_HOST')} as ${env('FTP_USER')} (${secure ? 'FTPS' : 'plain FTP'})...`);
  await client.access({
    host: env('FTP_HOST'),
    port: Number(env('FTP_PORT') || 21),
    user: env('FTP_USER'),
    password: env('FTP_PASSWORD'),
    secure,
    // Shared hosts often present a certificate for the server's own name, not your domain.
    secureOptions: { rejectUnauthorized: env('FTP_TLS_STRICT').toLowerCase() === 'true' },
  });
  const home = await client.pwd();

  try {
    for (const site of targets) {
      const local = path.join(root, 'deploy', site);
      if (!fs.existsSync(path.join(local, 'index.html'))) {
        throw new Error(`deploy/${site}/ is missing. Run npm run package:${site} first.`);
      }
      const remote = await siteDir(client, site);
      console.log(`\n=== ${site}: deploy/${site}/ (${countFiles(local)} files) -> ${remote}/`);
      if (dryRun) continue;

      let done = 0;
      let last = '';
      const total = countFiles(local);
      client.trackProgress((info) => {
        if (info.type !== 'upload' || info.name === last) return;
        last = info.name;
        process.stdout.write(`\r  ${++done}/${total} ${info.name.slice(0, 60).padEnd(60)}`);
      });
      await client.cd(home);
      await client.ensureDir(remote);
      await client.uploadFromDir(local);
      client.trackProgress();
      await client.cd(home);
      console.log(`\n✓ ${site} uploaded`);
    }
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
