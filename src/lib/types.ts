// Shape of the editable site content (storage/content.json, defaults in ./defaults.ts).

export interface SiteMeta {
  title: string;
  description: string;
  keywords: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface Office {
  title: string;
  address: string;
  // Id of the business this office belongs to; used to pick each site's default offices.
  business?: string;
}

export interface Umbrella {
  name: string;
  tagline: string;
  philosophy: string;
  intro: string;
  stats: Stat[];
  offices: Office[];
}

export interface Contacts {
  primaryEmail: string;
  phones: string[];
  workingHours: string;
}

export interface Service {
  name: string;
  desc: string;
}

// A portfolio item (real estate project, trade line or training course). Divisions use different
// optional fields, and the admin can edit any string field, so extra keys are allowed.
export interface Project {
  id: string;
  name: string;
  category?: string;
  status?: string;
  location?: string;
  highlights?: string;
  description?: string;
  area?: string;
  floors?: string;
  completion?: string;
  volume?: string;
  certifications?: string;
  duration?: string;
  targetMarket?: string;
  [key: string]: string | undefined;
}

// One product in a catalog category (e.g. a type of infant formula).
export interface ProductItem {
  name: string;
  description: string;
  image?: string;
}

// A group of related products shown on the Kaizen Enterprise page.
export interface ProductCategory {
  id: string;
  title: string;
  // Small label above the title, e.g. "Food Imports · Infant Nutrition".
  tag: string;
  summary: string;
  items: ProductItem[];
}

// The Kaizen Enterprise business has its own page (/enterprise); the other divisions share the home page.
export const ENTERPRISE_ID = 'enterprise';

export interface Business {
  id: string;
  name: string;
  shortTitle: string;
  tagline: string;
  image: string;
  accentColor: string;
  badge: string;
  summary: string;
  overview: string;
  keyCapabilities: string[];
  targetAudience: string;
  whyUs: string[];
  services: Service[];
  projects: Project[];
  ports?: string[];
  trainingModel?: string;
  productCategories?: ProductCategory[];
}

export interface SiteContent {
  meta: SiteMeta;
  umbrella: Umbrella;
  contacts: Contacts;
  businesses: Business[];
}

export const INQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessInterest: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface MediaFile {
  name: string;
  url: string;
  size: number;
  modifiedAt: string;
  seeded: boolean;
}
