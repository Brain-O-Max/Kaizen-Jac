import type { Business } from '@/lib/types';
import { ArrowRight, Anchor, Users } from 'lucide-react';

// Top of the Kaizen Enterprise page.
export default function EnterpriseHero({ business }: { business: Business }) {
  return (
    <section id="home" className="relative pt-32 pb-16 md:pt-44 md:pb-24 bg-slate-950 text-white overflow-hidden">
      {/* Subtle Background Accent Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[300px] bg-teal-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block px-3 py-1 rounded-md bg-teal-950/60 border border-teal-800/60 text-teal-400 text-xs font-bold uppercase tracking-wider">
              {business.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              {business.name}
            </h1>

            <p className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">
              {business.shortTitle}
            </p>

            <p className="text-sm sm:text-base text-slate-300 italic">&quot;{business.tagline}&quot;</p>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">{business.overview}</p>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 max-w-2xl">
              <Users className="w-4 h-4 text-teal-400 shrink-0" />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white">Who We Serve: </span>
                <span>{business.targetAudience}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-600/25 transition-all duration-200"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all duration-200"
              >
                <span>Inquire Now</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <img src={business.image} alt={business.name} className="w-full h-72 sm:h-96 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <span className="px-3 py-1 rounded-md bg-slate-900/90 border border-slate-800 font-semibold text-white">
                  {business.badge}
                </span>
                <span className="font-mono text-slate-400">Kaizen JAC</span>
              </div>
            </div>
          </div>

        </div>

        {business.ports && business.ports.length > 0 && (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 shrink-0">
              <Anchor className="w-4 h-4 text-teal-400" />
              <span>Primary Ports of Trade</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {business.ports.map((port) => (
                <span key={port} className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  {port}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
