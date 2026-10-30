'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import AboutSection from './AboutSection';
import BusinessesSection from './BusinessesSection';
import KaizenPhilosophy from './KaizenPhilosophy';
import ContactSection from './ContactSection';
import Footer from './Footer';

export default function SiteShell({ siteData }) {
  const [selectedBusinessId, setSelectedBusinessId] = useState('design-dev');
  const [preselectedInquiryBusiness, setPreselectedInquiryBusiness] = useState('');

  const handleSelectBusinessFromHero = (businessId) => {
    setSelectedBusinessId(businessId);
    const element = document.getElementById('businesses');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInquireFromBusiness = (businessName) => {
    setPreselectedInquiryBusiness(businessName);
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white antialiased">

      {/* Navigation Bar */}
      <Navbar siteData={siteData} />

      {/* Main Content Sections */}
      <main>
        <Hero
          siteData={siteData}
          onSelectBusiness={handleSelectBusinessFromHero}
        />

        <AboutSection
          siteData={siteData}
        />

        <BusinessesSection
          siteData={siteData}
          selectedBusinessId={selectedBusinessId}
          onInquire={handleInquireFromBusiness}
        />

        <KaizenPhilosophy
          siteData={siteData}
        />

        <ContactSection
          siteData={siteData}
          preselectedBusiness={preselectedInquiryBusiness}
        />
      </main>

      {/* Footer */}
      <Footer
        siteData={siteData}
      />

    </div>
  );
}
