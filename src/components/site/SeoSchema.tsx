import type { Business, SiteContent } from '@/lib/types';
import type { SiteConfig } from '@/lib/site';

interface SeoSchemaProps {
  siteData: SiteContent;
  business: Business;
  site: SiteConfig;
  siteUrl: string;
}

// Renders JSON-LD structured data on the server so crawlers see it without running JS.
export default function SeoSchema({ siteData, business, site, siteUrl }: SeoSchemaProps) {
  const office = siteData.umbrella.offices[0];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": site.schemaType,
    "@id": `${siteUrl}/#organization`,
    "name": business.name,
    "url": siteUrl,
    "email": siteData.contacts.primaryEmail,
    "telephone": siteData.contacts.phones[0],
    "description": business.summary,
    "image": business.image ? new URL(business.image, siteUrl).toString() : undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": office?.address,
      "addressLocality": "Dhaka",
      "addressCountry": "BD"
    },
    "parentOrganization": {
      "@type": "Organization",
      "name": siteData.umbrella.name
    }
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so content strings can't close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData).replace(/</g, '\\u003c') }}
    />
  );
}
