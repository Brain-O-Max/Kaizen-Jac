import type { SiteContent } from '@/lib/types';
// Renders JSON-LD structured data on the server so crawlers see it without running JS.
export default function SeoSchema({ siteData }: { siteData: SiteContent }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteData.meta.siteUrl}/#organization`,
        "name": siteData.umbrella.name,
        "url": siteData.meta.siteUrl,
        "email": siteData.contacts.primaryEmail,
        "telephone": siteData.contacts.phones[0],
        "description": siteData.umbrella.intro,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Dhaka",
          "addressCountry": "BD"
        },
        "subOrganization": siteData.businesses.map(b => ({
          "@type": "Organization",
          "name": b.name,
          "description": b.summary
        }))
      },
      {
        "@type": "RealEstateAgent",
        "name": "Kaizen Design & Development",
        "telephone": siteData.contacts.phones[0],
        "email": siteData.contacts.primaryEmail,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "House #101, Road 04, Block #D, Mohanogor Project, Rampura",
          "addressLocality": "Dhaka",
          "addressCountry": "BD"
        }
      },
      {
        "@type": "EducationalOrganization",
        "name": "Kaizen Training Center",
        "description": "Technical and Vocational Education and Training Institute",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Dhaka",
          "addressCountry": "BD"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so content strings can't close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData).replace(/</g, '\\u003c') }}
    />
  );
}
