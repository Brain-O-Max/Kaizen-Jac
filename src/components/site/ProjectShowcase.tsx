'use client';

import { useState } from 'react';
import type { Business, Project } from '@/lib/types';
import { Building, Clock, MapPin, ChevronRight } from 'lucide-react';

const HEADINGS: Record<string, string> = {
  'design-dev': 'Active Real Estate Projects & Ventures',
  enterprise: 'Multi-Commodity Trade Portfolios & Supply Lines',
  'training-center': 'Vocational Training Programs & Migration Modules',
};

// Project / trade-line / course cards for one business, with a quick-inspect popup.
export default function ProjectShowcase({ business }: { business: Business }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!business.projects || business.projects.length === 0) return null;

  return (
    <div className="pt-8 border-t border-slate-800 space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            <span>{HEADINGS[business.id] ?? `${business.name} Portfolio`}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Click any project card below to inspect full specifications, locations, and floor plans.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {business.projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-600/60 transition-all duration-200 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-800/60 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                  {proj.category}
                </span>
                {proj.status && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {proj.status}
                  </span>
                )}
              </div>

              <h5 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                {proj.name}
              </h5>

              {(proj.location || proj.duration) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {proj.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {proj.location}
                    </span>
                  )}
                  {proj.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {proj.duration}
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {proj.description}
              </p>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-850 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Highlights & Specifications:</div>
                <div>{proj.highlights}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-900 flex items-center justify-end text-xs">
              <button
                onClick={() => setSelectedProject(proj)}
                className="flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>View Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Single Project Quick Inspector Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {selectedProject.category}
              </span>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold text-white">
              {selectedProject.name}
            </h3>

            {selectedProject.location && (
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{selectedProject.location}</span>
              </div>
            )}

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedProject.description}
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400">Key Features & Technical Specs</div>
              <div className="text-xs text-slate-300 leading-relaxed">{selectedProject.highlights}</div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
