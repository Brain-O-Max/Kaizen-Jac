'use client';

import { useEffect, useState } from 'react';
import { Check, Download, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import ImageField from './ImageField';

// Returns a deep copy of obj with the value at path (array of keys) replaced.
function setIn(obj, path, value) {
  const copy = structuredClone(obj);
  let target = copy;
  for (const key of path.slice(0, -1)) target = target[key];
  target[path.at(-1)] = value;
  return copy;
}

const getIn = (obj, path) => path.reduce((acc, key) => acc?.[key], obj);

const humanize = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

// Project fields that read better as multi-line text.
const LONG_FIELDS = new Set(['description', 'highlights', 'summary', 'overview']);

function TextField({ label, value, onChange, multiline }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {multiline ? (
        <textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="field-input" />
      ) : (
        <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="field-input" />
      )}
    </div>
  );
}

function StringList({ label, items = [], onChange }) {
  return (
    <div className="space-y-2">
      <span className="field-label">{label}</span>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
            className="field-input"
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="btn-secondary hover:text-red-400" title="Remove">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ''])} className="btn-secondary">
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
    </div>
  );
}

// Editable list of objects. `fields` lists the keys to show; when omitted, every string key of each item is shown.
function ObjectList({ label, items = [], fields, newItem, onChange, itemTitle }) {
  const update = (i, key, value) => onChange(items.map((item, j) => (j === i ? { ...item, [key]: value } : item)));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="field-label mb-0">{label}</span>
        <button onClick={() => onChange([...items, newItem()])} className="btn-secondary">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      {items.map((item, i) => {
        const keys = fields || Object.keys(item).filter((k) => k !== 'id' && typeof item[k] === 'string');
        return (
          <div key={item.id || i} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">{itemTitle ? itemTitle(item, i) : `#${i + 1}`}</span>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="btn-secondary hover:text-red-400" title="Remove">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {keys.map((key) => (
                <div key={key} className={LONG_FIELDS.has(key) ? 'md:col-span-2' : ''}>
                  <TextField label={humanize(key)} value={item[key]} multiline={LONG_FIELDS.has(key)} onChange={(v) => update(i, key, v)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="card">
      <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">{title}</h2>
      {children}
    </section>
  );
}

export default function ContentEditor({ initialContent }) {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState('general');
  const [jsonText, setJsonText] = useState('');
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState({ state: 'idle' });

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const field = (path) => ({
    value: getIn(content, path),
    onChange: (value) => {
      setContent((c) => setIn(c, path, value));
      setDirty(true);
    },
  });

  const switchTab = (next) => {
    if (tab === 'json') {
      try {
        setContent(JSON.parse(jsonText));
      } catch (err) {
        setStatus({ state: 'error', message: `Fix the JSON before leaving this tab: ${err.message}` });
        return;
      }
    }
    if (next === 'json') setJsonText(JSON.stringify(content, null, 2));
    setTab(next);
  };

  const handleSave = async () => {
    let toSave = content;
    if (tab === 'json') {
      try {
        toSave = JSON.parse(jsonText);
        setContent(toSave);
      } catch (err) {
        setStatus({ state: 'error', message: `Invalid JSON: ${err.message}` });
        return;
      }
    }
    setStatus({ state: 'saving' });
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSave),
    });
    if (res.ok) {
      setDirty(false);
      setStatus({ state: 'saved' });
      setTimeout(() => setStatus((s) => (s.state === 'saved' ? { state: 'idle' } : s)), 3000);
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus({ state: 'error', message: data.error || `Save failed (${res.status})` });
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kaizenjac_content.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const tabs = [
    { key: 'general', label: 'General & SEO' },
    { key: 'contacts', label: 'Contact & Offices' },
    ...content.businesses.map((b, i) => ({ key: `business-${i}`, label: b.name.replace(/^Kaizen\s+/, '') })),
    { key: 'json', label: 'Raw JSON' },
  ];
  const businessIndex = tab.startsWith('business-') ? Number(tab.split('-')[1]) : -1;
  const bPath = (key) => ['businesses', businessIndex, key];
  const business = content.businesses[businessIndex];

  return (
    <div className="space-y-5">
      {/* Sticky action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Website content</h1>
          <p className="text-sm text-slate-400">Changes go live on the public site as soon as you save.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">
            {status.state === 'saved' && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> Saved</span>}
            {status.state === 'idle' && dirty && <span className="text-amber-400">Unsaved changes</span>}
          </span>
          <button onClick={handleExport} className="btn-secondary"><Download className="w-3.5 h-3.5" /> Export JSON</button>
          <button onClick={handleSave} disabled={status.state === 'saving'} className="btn-primary">
            {status.state === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save changes
          </button>
        </div>
      </div>
      {status.state === 'error' && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg p-3">{status.message}</p>}

      <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold ${tab === t.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="space-y-5">
          <Section title="SEO">
            <TextField label="Page title" {...field(['meta', 'title'])} />
            <TextField label="Meta description" multiline {...field(['meta', 'description'])} />
            <TextField label="Keywords (comma separated)" {...field(['meta', 'keywords'])} />
            <TextField label="Site URL" {...field(['meta', 'siteUrl'])} />
          </Section>
          <Section title="Group identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField label="Name" {...field(['umbrella', 'name'])} />
              <TextField label="Tagline" {...field(['umbrella', 'tagline'])} />
            </div>
            <TextField label="Philosophy" multiline {...field(['umbrella', 'philosophy'])} />
            <TextField label="Introduction" multiline {...field(['umbrella', 'intro'])} />
            <ObjectList
              label="Headline stats"
              fields={['label', 'value']}
              newItem={() => ({ label: '', value: '' })}
              items={content.umbrella.stats}
              onChange={field(['umbrella', 'stats']).onChange}
            />
          </Section>
        </div>
      )}

      {tab === 'contacts' && (
        <div className="space-y-5">
          <Section title="Contact channels">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="Primary email"
                value={content.contacts.primaryEmail}
                onChange={(v) => {
                  setContent((c) => setIn(setIn(c, ['contacts', 'primaryEmail'], v), ['meta', 'contactEmail'], v));
                  setDirty(true);
                }}
              />
              <TextField label="Working hours" {...field(['contacts', 'workingHours'])} />
            </div>
            <StringList
              label="Phone numbers (first one is shown in the header)"
              items={content.contacts.phones}
              onChange={(phones) => {
                setContent((c) => setIn(setIn(c, ['contacts', 'phones'], phones), ['meta', 'contactPhone'], phones[0] || ''));
                setDirty(true);
              }}
            />
          </Section>
          <Section title="Offices">
            <ObjectList
              label="Office addresses"
              fields={['title', 'address']}
              newItem={() => ({ title: '', address: '' })}
              items={content.umbrella.offices}
              itemTitle={(o, i) => o.title || `Office ${i + 1}`}
              onChange={field(['umbrella', 'offices']).onChange}
            />
          </Section>
        </div>
      )}

      {business && (
        <div className="space-y-5">
          <Section title="Overview">
            <ImageField label="Cover image" {...field(bPath('image'))} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField label="Name" {...field(bPath('name'))} />
              <TextField label="Short title" {...field(bPath('shortTitle'))} />
              <TextField label="Badge" {...field(bPath('badge'))} />
              <div>
                <label className="field-label">Accent colour</label>
                <div className="flex gap-2">
                  <input type="color" value={business.accentColor || '#2563EB'} onChange={(e) => field(bPath('accentColor')).onChange(e.target.value)} className="h-9 w-12 rounded bg-slate-950 border border-slate-800" />
                  <input type="text" value={business.accentColor || ''} onChange={(e) => field(bPath('accentColor')).onChange(e.target.value)} className="field-input" />
                </div>
              </div>
            </div>
            <TextField label="Tagline" {...field(bPath('tagline'))} />
            <TextField label="Summary" multiline {...field(bPath('summary'))} />
            <TextField label="Overview" multiline {...field(bPath('overview'))} />
            <TextField label="Target audience" {...field(bPath('targetAudience'))} />
          </Section>
          <Section title="Capabilities & differentiators">
            <StringList label="Key capabilities" items={business.keyCapabilities} onChange={field(bPath('keyCapabilities')).onChange} />
            <StringList label="Why choose us" items={business.whyUs} onChange={field(bPath('whyUs')).onChange} />
            {business.ports && <StringList label="Ports" items={business.ports} onChange={field(bPath('ports')).onChange} />}
          </Section>
          <Section title="Services">
            <ObjectList
              label="Services"
              fields={['name', 'desc']}
              newItem={() => ({ name: '', desc: '' })}
              items={business.services}
              itemTitle={(s, i) => s.name || `Service ${i + 1}`}
              onChange={field(bPath('services')).onChange}
            />
          </Section>
          <Section title="Projects / programs">
            <ObjectList
              label="Portfolio items"
              newItem={() => ({
                id: `item-${Date.now()}`,
                name: 'New item',
                category: '',
                status: '',
                location: '',
                highlights: '',
                description: '',
              })}
              items={business.projects}
              itemTitle={(p, i) => p.name || `Item ${i + 1}`}
              onChange={field(bPath('projects')).onChange}
            />
          </Section>
        </div>
      )}

      {tab === 'json' && (
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setDirty(true);
          }}
          spellCheck={false}
          className="w-full h-[70vh] p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
        />
      )}
    </div>
  );
}
