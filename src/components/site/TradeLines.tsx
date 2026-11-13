import type { Business } from '@/lib/types';
import { Layers, ShieldCheck } from 'lucide-react';
import BusinessCapabilities from './BusinessCapabilities';
import ProjectShowcase from './ProjectShowcase';

// Import/export service lines, capabilities, and the trade portfolio.
export default function TradeLines({ business }: { business: Business }) {
  return (
    <section id="trade" className="py-20 md:py-28 bg-slate-950 text-white border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-400">
            <Layers className="w-4 h-4" />
            <span>Import, Export & Distribution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Trade Lines & Capabilities
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{business.summary}</p>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 md:p-10 shadow-2xl space-y-12">
          <BusinessCapabilities business={business} />
          <ProjectShowcase business={business} />

          {business.whyUs.length > 0 && (
            <div className="pt-8 border-t border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Why Choose Kaizen Enterprise</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {business.whyUs.map((reason, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300 leading-snug">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
