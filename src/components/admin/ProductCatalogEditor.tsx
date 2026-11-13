'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ProductCategory, ProductItem } from '@/lib/types';
import ImageField from './ImageField';
import TextField from './TextField';

interface ProductCatalogEditorProps {
  categories: ProductCategory[] | undefined;
  onChange: (categories: ProductCategory[]) => void;
}

// Edits the product categories (and the products inside them) shown on the /enterprise page.
export default function ProductCatalogEditor({ categories = [], onChange }: ProductCatalogEditorProps) {
  const updateCategory = (ci: number, patch: Partial<ProductCategory>) =>
    onChange(categories.map((c, i) => (i === ci ? { ...c, ...patch } : c)));

  const updateItem = (ci: number, ii: number, patch: Partial<ProductItem>) =>
    updateCategory(ci, { items: categories[ci].items.map((item, i) => (i === ii ? { ...item, ...patch } : item)) });

  const addCategory = () =>
    onChange([
      ...categories,
      { id: `category-${Date.now()}`, title: 'New category', tag: 'Food Imports', summary: '', items: [] },
    ]);

  return (
    <div className="space-y-4">
      {categories.length === 0 && (
        <p className="text-sm text-slate-500">No product categories yet. Add one to show a product catalog on the Enterprise page.</p>
      )}

      {categories.map((category, ci) => (
        <div key={category.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">{category.title || `Category ${ci + 1}`}</span>
            <button
              onClick={() => {
                if (confirm(`Delete the category "${category.title}" and its ${category.items.length} product(s)?`)) {
                  onChange(categories.filter((_, i) => i !== ci));
                }
              }}
              className="btn-secondary hover:text-red-400"
              title="Remove category"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField label="Category title" value={category.title} onChange={(title) => updateCategory(ci, { title })} />
            <TextField label="Label above the title (e.g. Food Imports · Infant Nutrition)" value={category.tag} onChange={(tag) => updateCategory(ci, { tag })} />
          </div>
          <TextField label="Short description" multiline value={category.summary} onChange={(summary) => updateCategory(ci, { summary })} />

          <div className="space-y-3">
            <span className="field-label">Products</span>
            {category.items.map((item, ii) => (
              <div key={ii} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Product #{ii + 1}</span>
                  <button
                    onClick={() => updateCategory(ci, { items: category.items.filter((_, i) => i !== ii) })}
                    className="btn-secondary hover:text-red-400"
                    title="Remove product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <TextField label="Product name" value={item.name} onChange={(name) => updateItem(ci, ii, { name })} />
                <TextField label="Description" multiline value={item.description} onChange={(description) => updateItem(ci, ii, { description })} />
                <ImageField label="Photo (optional)" value={item.image} onChange={(image) => updateItem(ci, ii, { image })} />
              </div>
            ))}
            <button
              onClick={() => updateCategory(ci, { items: [...category.items, { name: '', description: '' }] })}
              className="btn-secondary"
            >
              <Plus className="w-3.5 h-3.5" /> Add product
            </button>
          </div>
        </div>
      ))}

      <button onClick={addCategory} className="btn-secondary">
        <Plus className="w-3.5 h-3.5" /> Add category
      </button>
    </div>
  );
}
