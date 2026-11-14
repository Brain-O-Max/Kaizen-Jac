// The three Kaizen websites share this codebase. Each deployment sets SITE to choose which one it serves:
//   SITE=enterprise  -> Kaizen Enterprise (main domain)
//   SITE=design      -> Kaizen Design & Development (subdomain)
//   SITE=training    -> Kaizen Training Center (subdomain)

export type SiteId = 'enterprise' | 'design' | 'training';
export type ThemeId = 'teal' | 'blue' | 'amber';

export interface SiteConfig {
  id: SiteId;
  // Id of this site's business in the content data.
  businessId: string;
  name: string;
  initials: string;
  theme: ThemeId;
  // Environment variable holding this site's public URL, and the URL used when it is not set (local development).
  urlEnv: string;
  defaultUrl: string;
  keywords: string;
  // schema.org type used in the page's structured data for search engines.
  schemaType: 'Organization' | 'RealEstateAgent' | 'EducationalOrganization';
}

export const SITES: Record<SiteId, SiteConfig> = {
  enterprise: {
    id: 'enterprise',
    businessId: 'enterprise',
    name: 'Kaizen Enterprise',
    initials: 'KE',
    schemaType: 'Organization',
    theme: 'teal',
    urlEnv: 'SITE_URL_ENTERPRISE',
    defaultUrl: 'http://localhost:3000',
    keywords: 'Kaizen Enterprise, Import Export Bangladesh, Food Import, Multi-Commodity Trade, Infant Formula Import, Kaizen JAC',
  },
  design: {
    id: 'design',
    businessId: 'design-dev',
    name: 'Kaizen Design & Development',
    initials: 'KD',
    schemaType: 'RealEstateAgent',
    theme: 'blue',
    urlEnv: 'SITE_URL_DESIGN',
    defaultUrl: 'http://localhost:3001',
    keywords: 'Kaizen Design and Development, Real Estate Dhaka, Joint Venture Dhaka, Apartment Construction Dhaka, BNBC, Kaizen JAC',
  },
  training: {
    id: 'training',
    businessId: 'training-center',
    name: 'Kaizen Training Center',
    initials: 'KT',
    schemaType: 'EducationalOrganization',
    theme: 'amber',
    urlEnv: 'SITE_URL_TRAINING',
    defaultUrl: 'http://localhost:3002',
    keywords: 'Kaizen Training Center, TVET Training Dhaka, Vocational Training Bangladesh, Caregiver Training, Electrical Training, Kaizen JAC',
  },
};

export const SITE_IDS = Object.keys(SITES) as SiteId[];

// Which site this deployment serves. Defaults to Kaizen Enterprise when SITE is not set (handy for local development),
// but a wrong value is an error so a typo can't make a subdomain show the wrong company.
export function currentSiteId(): SiteId {
  const value = process.env.SITE?.trim();
  if (!value) return 'enterprise';
  if (value in SITES) return value as SiteId;
  throw new Error(`Invalid SITE "${value}". Use one of: ${SITE_IDS.join(', ')}`);
}

// True on hosts whose filesystem can't keep files (Vercel sets VERCEL), or when DEMO_READ_ONLY=1. There the
// public site works with its default content, but the admin panel and contact form are switched off because
// nothing they save would be kept.
export function isReadOnlyDeployment(): boolean {
  return Boolean(process.env.VERCEL) || process.env.DEMO_READ_ONLY === '1';
}

export function siteUrl(id: SiteId): string {
  const config = SITES[id];
  return (process.env[config.urlEnv]?.trim() || config.defaultUrl).replace(/\/+$/, '');
}

export interface SiteLink {
  id: SiteId;
  name: string;
  url: string;
}

// Links to all three sites, for the "Kaizen JAC group" list in each footer.
export function siteLinks(): SiteLink[] {
  return SITE_IDS.map((id) => ({ id, name: SITES[id].name, url: siteUrl(id) }));
}
