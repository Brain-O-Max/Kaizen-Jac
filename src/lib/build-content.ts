import { promises as fs } from 'node:fs';
import path from 'node:path';
import { defaultContentFor } from './defaults';
import type { SiteId } from './site';
import type { SiteContent } from './types';

// Content baked into the static HTML when the site is built: what was saved locally in ./storage/<site>/content.json
// (by the admin running on your PC), or the defaults. On the live site the pages then load the latest saved content
// from /api/content.php, so edits made in the online admin show without rebuilding.
export async function getBuildContent(site: SiteId): Promise<SiteContent> {
  const file = path.resolve(/*turbopackIgnore: true*/ process.cwd(), 'storage', site, 'content.json');
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as SiteContent;
  } catch (err) {
    if ((err as NodeJS.ErrnoException | null)?.code === 'ENOENT') return defaultContentFor(site);
    throw err;
  }
}
