import { ENTERPRISE_ID, type Business, type SiteContent } from '@/lib/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Globe2, GraduationCap, ArrowRight, Layers, Users, ExternalLink } from 'lucide-react';
import BusinessDetailModal from './BusinessDetailModal';
import BusinessCapabilities from './BusinessCapabilities';
import ProjectShowcase from './ProjectShowcase';

interface BusinessesSectionProps {
  siteData: SiteContent;
  selectedBusinessId: string;
  onInquire: (businessName: string) => void;
}

export default function BusinessesSection({ siteData, selectedBusinessId, onInquire }: BusinessesSectionProps) {
  const [activeTab, setActiveTab] = useState(selectedBusinessId || 'design-dev');
  const [modalBusiness, setModalBusiness] = useState<Business | null>(null);

  // Follow the division chosen elsewhere on the page (e.g. the hero buttons).
  useEffect(() => {
    if (selectedBusinessId) setActiveTab(selectedBusinessId);
  }, [selectedBusinessId]);

  // Kaizen Enterprise has its own page (/enterprise); this section covers the other divisions.
  const homeBusinesses = siteData.businesses.filter((b) => b.id !== ENTERPRISE_ID);
  const enterprise = siteData.businesses.find((b) => b.id === ENTERPRISE_ID);

  const getIcon = (id: string) => {
    switch (id) {
      case 'design-dev':
        return <Building2 className="w-5 h-5 text-blue-400" />;
      case 'enterprise':
        return <Globe2 className="w-5 h-5 text-teal-400" />;
      case 'training-center':
        return <GraduationCap className="w-5 h-5 text-amber-400" />;
      default:
        return <Building2 className="w-5 h-5 text-blue-400" />;
    }
  };

  const currentBusiness = homeBusinesses.find((b) => b.id === activeTab) || homeBusinesses[0];
  if (!currentBusiness) return null;

  return (
    <section id="businesses" className="py-20 md:py-28 bg-slate-950 text-white relative">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-400">
            <Layers className="w-4 h-4" />
            <span>Real Estate & Vocational Training</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Focused & Detailed Business Divisions
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Explore complete operational capabilities, active projects, and TVET program details for Kaizen Design & Development and Kaizen Training Center.
          </p>
        </div>

        {/* Division Selector Tabs */}
        <div className={`grid grid-cols-1 gap-4 ${homeBusinesses.length > 2 ? 'md:grid-cols-3' : homeBusinesses.length === 2 ? 'md:grid-cols-2' : ''}`}>
          {homeBusinesses.map((b) => {
            const isActive = activeTab === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveTab(b.id)}
                className={`p-5 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 ${
                  isActive
                    ? 'bg-slate-900 border-slate-700 shadow-xl ring-2 ring-blue-500/20'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className={`p-3 rounded-xl ${
                  isActive ? 'bg-slate-800 border border-slate-700' : 'bg-slate-950 border border-slate-800'
                }`}>
                  {getIcon(b.id)}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    {b.badge}
                  </span>
                  <span className="text-base font-bold text-white block">
                    {b.name}
                  </span>
                  <span className="text-xs text-slate-400 block line-clamp-1">
                    {b.shortTitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Business Showcase View */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 md:p-10 shadow-2xl space-y-12">
          
          {/* Top Overview & Media Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Visual Image Showcase */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-lg group">
                <img
                  src={currentBusiness.image}
                  alt={currentBusiness.name}
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="px-3 py-1 rounded-md bg-slate-900/90 border border-slate-800 font-semibold text-white">
                    {currentBusiness.badge}
                  </span>
                  <span className="font-mono text-slate-400">Kaizen JAC</span>
                </div>
              </div>
            </div>

            {/* Division Detail Content */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-block px-3 py-1 rounded-md bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-bold uppercase tracking-wider">
                {currentBusiness.shortTitle}
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentBusiness.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 italic">
                "{currentBusiness.tagline}"
              </p>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {currentBusiness.overview}
              </p>

              {/* Target Audience Pill */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">Who We Serve: </span>
                  <span>{currentBusiness.targetAudience}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setModalBusiness(currentBusiness)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>Inspect Full Division Specs</span>
                </button>

                <button
                  onClick={() => onInquire(currentBusiness.name)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all"
                >
                  <span>Inquire Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          <BusinessCapabilities business={currentBusiness} />

          <ProjectShowcase business={currentBusiness} />

        </div>

        {/* Link to the separate Kaizen Enterprise page */}
        {enterprise && (
          <Link
            href="/enterprise"
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-700/60 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <Globe2 className="w-5 h-5 text-teal-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">{enterprise.badge}</span>
                <span className="text-base font-bold text-white block">{enterprise.name}</span>
                <span className="text-xs text-slate-400 block">{enterprise.tagline}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 group-hover:text-teal-300 shrink-0">
              Visit the Kaizen Enterprise page
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        )}

      </div>

      {/* Expanded Detail Modal for Business */}
      {modalBusiness && (
        <BusinessDetailModal
          business={modalBusiness}
          siteData={siteData}
          onClose={() => setModalBusiness(null)}
          onInquire={onInquire}
        />
      )}

    </section>
  );
}
