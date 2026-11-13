import type { Business } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

// Key capabilities list and core services grid for one business.
export default function BusinessCapabilities({ business }: { business: Business }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 border-t border-slate-800">

      {/* Key Capabilities */}
      <div className="md:col-span-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Key Operational Capabilities
        </h4>
        <div className="space-y-3">
          {business.keyCapabilities.map((cap, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-300 leading-snug">{cap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="md:col-span-7 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Core Service Offerings
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {business.services.map((srv, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-1.5">
              <div className="text-xs font-bold text-white">
                {srv.name}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                {srv.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
