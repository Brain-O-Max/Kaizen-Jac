import type { Business } from '@/lib/types';
import { ArrowRight, Package } from 'lucide-react';

// Product categories managed in the admin panel (Kaizen Enterprise tab → Product catalog).
export default function ProductCatalog({ business }: { business: Business }) {
  const categories = business.productCategories?.filter((c) => c.items.length > 0) ?? [];
  if (categories.length === 0) return null;

  return (
    <section id="products" className="py-20 md:py-28 bg-slate-950 text-white border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-400">
            <Package className="w-4 h-4" />
            <span>Product Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Products We Supply
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Selected product lines from {business.name}. Contact us for availability, specifications and pricing.
          </p>
        </div>

        {categories.map((category) => (
          <div key={category.id} className="space-y-6">
            <div className="space-y-2">
              {category.tag && (
                <div className="inline-block px-2.5 py-1 rounded-md bg-teal-950/70 border border-teal-800/60 text-teal-400 text-[10px] font-bold uppercase tracking-wider">
                  {category.tag}
                </div>
              )}
              <h3 className="text-2xl font-extrabold text-white">{category.title}</h3>
              {category.summary && <p className="text-sm text-slate-400 max-w-3xl">{category.summary}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item, idx) => (
                <article
                  key={`${item.name}-${idx}`}
                  className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-700/60 transition-colors overflow-hidden flex flex-col"
                >
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-44 object-cover" />
                  )}
                  <div className="p-5 space-y-2">
                    <h4 className="text-base font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-md transition-all"
          >
            <span>Inquire About Our Products</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
