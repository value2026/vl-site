import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  X, Save, Plus, Trash2, ChevronDown, ChevronUp,
  Bold, Italic, List, Heading2, Link2, Undo, Redo, Image as ImageIcon,
  Search, FlaskConical, Check, Loader2, CheckCircle2, FileJson, Maximize, Minimize,
  Download, UploadCloud
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import CloudinaryUploader from './CloudinaryUploader';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

// ── Tiptap toolbar ────────────────────────────────────────────
function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function TiptapEditor({ content, onChange, placeholder = 'Start writing…' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  const addLink = () => {
    const url = prompt('Enter URL');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-white/5 border-b border-white/10">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Link">
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-invert prose-sm max-w-none p-4 min-h-[120px] text-slate-200 focus:outline-none [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}

// ── Repeatable rows ───────────────────────────────────────────
function RepeatableList({ label, items = [], onChange, fields, onConfirmRequest, onAutoSave }) {
  // Ensure items have stable IDs for React keys
  const stableItems = items.map(item => {
    if (!item._id) return { ...item, _id: Math.random().toString(36).substring(2, 9) };
    return item;
  });

  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const add = () => {
    const blank = { _id: Math.random().toString(36).substring(2, 9) };
    fields.forEach(f => {
      blank[f.key] = '';
      if (f.key === 'date') {
        const today = new Date();
        blank[f.key] = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    });
    onChange([blank, ...stableItems]);
  };

  const handleBulkImport = () => {
    if (!bulkJson.trim()) return;
    try {
      let newItems = [];
      const text = bulkJson.trim();
      
      if (text.startsWith('[')) {
        // Parse as JSON
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error("JSON must be an array of objects");
        newItems = parsed.map(item => ({ ...item, _id: Math.random().toString(36).substring(2, 9) }));
      } else {
        // Parse as TSV or CSV
        const lines = text.split('\n');
        if (lines.length < 2) throw new Error("Need at least a header row and one data row for CSV/TSV");
        const delimiter = lines[0].includes('\t') ? '\t' : ',';
        
        const parseLine = (line) => {
          if (delimiter === '\t') return line.split('\t').map(v => v.trim());
          let result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && line[i+1] === '"') {
               current += '"'; i++;
            } else if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              result.push(current); current = '';
            } else {
              current += char;
            }
          }
          result.push(current);
          return result.map(v => v.trim());
        };

        const headers = parseLine(lines[0]);
        const fieldKeys = fields.map(f => f.key);
        
        newItems = lines.slice(1).map(line => {
          if (!line.trim()) return null;
          const values = parseLine(line);
          const obj = { _id: Math.random().toString(36).substring(2, 9) };
          headers.forEach((header, idx) => {
            if (fieldKeys.includes(header)) {
              obj[header] = values[idx] || '';
            }
          });
          fieldKeys.forEach(fk => {
             if (obj[fk] === undefined) obj[fk] = '';
          });
          return obj;
        }).filter(Boolean);
      }
      
      onChange([...newItems, ...stableItems]);
      setShowBulkImport(false);
      setBulkJson('');
    } catch (err) {
      alert("Invalid format: " + err.message);
    }
  };

  const loadExampleJson = () => {
    const exampleItem = {};
    fields.forEach(f => {
      exampleItem[f.key] = f.placeholder || `value`;
    });
    setBulkJson(JSON.stringify([exampleItem], null, 2));
  };

  const loadExampleCsv = () => {
    const headers = fields.map(f => f.key).join(',');
    const values = fields.map(f => `"${f.placeholder || 'value'}"`).join(',');
    
    const csvContent = `${headers}\n${values}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'bulk_import_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      setBulkJson(text);
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  const remove = (i) => {
    const action = () => {
      const next = stableItems.filter((_, idx) => idx !== i);
      onChange(next);
      if (onAutoSave) onAutoSave(next);
    };
    if (onConfirmRequest) {
      onConfirmRequest({ title: 'Remove Item', message: 'Are you sure you want to remove this item?', onConfirm: action });
    } else if (window.confirm('Are you sure you want to remove this item?')) {
      action();
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(stableItems.map(i => i._id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const toggleSelection = (id, checked) => {
    const next = new Set(selectedItems);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedItems(next);
  };

  const removeSelected = () => {
    if (selectedItems.size === 0) return;
    const msg = `Are you sure you want to delete ${selectedItems.size} selected items?`;
    const action = () => {
      const next = stableItems.filter(item => !selectedItems.has(item._id));
      onChange(next);
      if (onAutoSave) onAutoSave(next);
      setSelectedItems(new Set());
      setIsSelectionMode(false);
    };
    if (onConfirmRequest) {
      onConfirmRequest({ title: 'Delete Selected', message: msg, onConfirm: action });
    } else if (window.confirm(msg)) {
      action();
    }
  };

  const removeAll = () => {
    const action = () => {
      onChange([]);
      if (onAutoSave) onAutoSave([]);
      setSelectedItems(new Set());
      setIsSelectionMode(false);
    };
    if (onConfirmRequest) {
      onConfirmRequest({ title: 'Delete All Items', message: `Are you sure you want to delete all ${label}? This cannot be undone.`, onConfirm: action });
    } else if (window.confirm(`Are you sure you want to delete all ${label}? This cannot be undone.`)) {
      action();
    }
  };

  const update = (i, key, val) => {
    const next = stableItems.map((item, idx) => idx === i ? { ...item, [key]: val } : item);
    onChange(next);
  };
  const move = (i, dir) => {
    const next = [...stableItems];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const containerClasses = isFullScreen 
    ? "fixed inset-0 z-[100] bg-slate-950 p-6 sm:p-10 overflow-y-auto animate-in zoom-in-95 duration-200"
    : "";

  return (
    <div className={containerClasses}>
      {isFullScreen && (
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <button onClick={() => setIsFullScreen(false)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">Editing: {label}</h2>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {!isFullScreen && <label className="text-sm font-medium text-slate-300">{label}</label>}
          
          {items.length > 0 && !isSelectionMode && (
            <button
              type="button"
              onClick={() => setIsSelectionMode(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              Select / Delete Items
            </button>
          )}

          {items.length > 0 && isSelectionMode && (
            <div className="flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={selectedItems.size === stableItems.length && stableItems.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500/20 bg-slate-900 cursor-pointer"
                />
                <span className="font-medium text-xs">Select All</span>
              </label>
              
              {selectedItems.size > 0 && (
                <>
                  <div className="w-px h-4 bg-white/20" />
                  <button
                    type="button"
                    onClick={removeSelected}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete ({selectedItems.size})
                  </button>
                </>
              )}
              {selectedItems.size === 0 && (
                <>
                  <div className="w-px h-4 bg-white/20" />
                  <button
                    type="button"
                    onClick={removeAll}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete All
                  </button>
                </>
              )}
              
              <div className="w-px h-4 bg-white/20" />
              <button
                type="button"
                onClick={() => { setIsSelectionMode(false); setSelectedItems(new Set()); }}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isFullScreen && (
            <button
              type="button"
              onClick={() => setIsFullScreen(true)}
              title="Full Screen Editor"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              <Maximize className="w-3.5 h-3.5" /> Full Screen
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5" /> Bulk Import
          </button>
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>
      </div>
      
      {showBulkImport && (
        <div className="mb-4 p-5 rounded-xl bg-blue-500/5 border border-blue-500/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
            <div>
              <h4 className="text-sm font-bold text-blue-300">Bulk Import (JSON / CSV / TSV)</h4>
              <p className="text-xs text-blue-200/70 mt-0.5">
                Upload a CSV file, paste from Excel, or paste JSON array.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <label className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" /> Upload CSV
                <input type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
              <button
                type="button"
                onClick={loadExampleCsv}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Template
              </button>
            </div>
          </div>
          
          <textarea
            value={bulkJson}
            onChange={e => setBulkJson(e.target.value)}
            rows={6}
            className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-4 py-3 text-sm text-slate-300 placeholder-slate-600 font-mono resize-y focus:outline-none focus:border-blue-500"
            placeholder="[{&quot;title&quot;: &quot;Example&quot;}, ...]"
          />
          <div className="flex justify-end mt-3 gap-3">
            <button
              type="button"
              onClick={() => setShowBulkImport(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkImport}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-colors"
            >
              Parse & Add
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {stableItems.map((item, i) => (
          <div key={item._id} className={`p-3 rounded-xl border space-y-2 animate-in fade-in slide-in-from-top-4 duration-300 transition-colors ${
            selectedItems.has(item._id) ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-1">
              {isSelectionMode ? (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 font-mono hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item._id)}
                    onChange={(e) => toggleSelection(item._id, e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500/20 bg-slate-900 cursor-pointer"
                  />
                  #{i + 1}
                </label>
              ) : (
                <span className="text-xs text-slate-500 font-mono">#{i + 1}</span>
              )}
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} className="p-1 text-slate-500 hover:text-white rounded" disabled={i === 0}>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => move(i, 1)} className="p-1 text-slate-500 hover:text-white rounded" disabled={i === stableItems.length - 1}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => remove(i)} className="p-1 text-red-400 hover:text-red-300 rounded ml-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {fields.map(f => (
              <div key={f.key}>
                <label className="text-xs text-slate-500 mb-1 block">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={item[f.key] || ''}
                    onChange={e => update(i, f.key, e.target.value)}
                    rows={2}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-red-500/50"
                    placeholder={f.placeholder || ''}
                  />
                ) : f.type === 'image' ? (
                  <CloudinaryUploader
                    value={item[f.key] || ''}
                    onChange={url => update(i, f.key, url)}
                    label=""
                  />
                ) : (
                  <input
                    type="text"
                    value={item[f.key] || ''}
                    onChange={e => update(i, f.key, e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
                    placeholder={f.placeholder || ''}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-4">No items yet. Click "Add Item" to start.</p>
        )}
      </div>
    </div>
  );
}

// ── Field configs per section type (with image fields) ────────
const REPEATABLE_CONFIGS = {
  hero: {
    stats: {
      label: 'Stats Counter Badges',
      fields: [
        { key: 'n',     label: 'Number (e.g. 700+)', placeholder: '700+' },
        { key: 'label', label: 'Label',               placeholder: 'Virtual Labs' },
      ],
    },
  },
  cta: {
    cards: {
      label: 'CTA Cards',
      fields: [
        { key: 'imageUrl',    label: '🖼 Card Image / Icon',  type: 'image' },
        { key: 'title',       label: 'Card Title',             placeholder: 'Download Brochure' },
        { key: 'description', label: 'Description',            placeholder: 'Description…', type: 'textarea' },
        { key: 'action',      label: 'Button Label',           placeholder: 'Download PDF' },
        { key: 'href',        label: 'Link URL',               placeholder: '/page-or-url' },
        { key: 'gradient',    label: 'Gradient (Tailwind)',    placeholder: 'from-primary-800 to-primary-900' },
      ],
    },
  },
  sponsors: {
    sponsors: {
      label: 'Sponsor / Partner Cards',
      fields: [
        { key: 'logoUrl',     label: '🖼 Logo Image',        type: 'image' },
        { key: 'name',        label: 'Full Name',             placeholder: 'IIT Bombay' },
        { key: 'acronym',     label: 'Acronym / Short Name', placeholder: 'IITB' },
        { key: 'description', label: 'Subtitle',             placeholder: 'Lead Institute' },
        { key: 'color',       label: 'Fallback Gradient',    placeholder: 'from-blue-600 to-blue-800' },
      ],
    },
  },
  news: {
    items: {
      label: 'News Items',
      fields: [
        { key: 'imageUrl',  label: '🖼 Thumbnail Image',  type: 'image' },
        { key: 'title',     label: 'Headline',             placeholder: 'Article title…' },
        { key: 'excerpt',   label: 'Excerpt',              placeholder: 'Short summary…', type: 'textarea' },
        { key: 'category',  label: 'Category',             placeholder: 'Milestone' },
        { key: 'date',      label: 'Date',                 placeholder: 'June 28, 2025' },
        { key: 'href',      label: 'Link URL',             placeholder: '/news/article-slug' },
      ],
    },
  },
  media: {
    videos: {
      label: 'Videos List',
      fields: [
        { key: 'thumbnailUrl', label: '🖼 Video Thumbnail Image', type: 'image' },
        { key: 'title',        label: 'Video Title',             placeholder: 'Amrita VALUE Virtual Labs Introduction' },
        { key: 'duration',     label: 'Duration / Subtitle',     placeholder: '3:05 · Official Overview' },
        { key: 'videoUrl',     label: 'YouTube Video URL',       placeholder: 'https://www.youtube.com/watch?v=...' },
      ],
    },
  },
  publications_list: {
    items: {
      label: 'Publication Items',
      fields: [
        { key: 'year',     label: 'Year',    placeholder: 'e.g., 2024' },
        { key: 'title',    label: 'Title',   placeholder: 'Paper Title', type: 'textarea' },
        { key: 'authors',  label: 'Authors', placeholder: 'Sharma, R., Verma, A.' },
        { key: 'journal',  label: 'Journal', placeholder: 'Journal of Engineering Education...' },
        { key: 'doi',      label: 'DOI/URL', placeholder: 'https://doi.org/...' },
      ],
    },
  },
  project_timeline: {
    items: {
      label: 'Timeline Items',
      fields: [
        { key: 'year',  label: 'Year',  placeholder: '2024' },
        { key: 'title', label: 'Title', placeholder: 'Major Milestone' },
        { key: 'desc',  label: 'Description', placeholder: 'Description of the milestone', type: 'textarea' },
      ],
    },
  },
  project_objectives: {
    items: {
      label: 'Objective Items',
      fields: [
        { key: 'text', label: 'Objective', placeholder: 'Provide remote access to labs...', type: 'textarea' },
      ],
    },
  },
  workshop_list: {
    items: {
      label: 'Workshops',
      fields: [
        { key: 'title',       label: 'Title',       placeholder: 'Faculty Development...' },
        { key: 'date',        label: 'Date',        placeholder: 'August 12–13, 2025' },
        { key: 'location',    label: 'Location',    placeholder: 'IIT Bombay, Mumbai' },
        { key: 'mode',        label: 'Mode',        placeholder: 'Hybrid, In-person, Online' },
        { key: 'seats',       label: 'Seats',       placeholder: '60' },
        { key: 'description', label: 'Description', placeholder: 'Short description...', type: 'textarea' },
        { key: 'color',       label: 'Color Theme', placeholder: 'from-blue-600 to-blue-800' },
      ],
    },
  },
  nc_benefits: {
    items: {
      label: 'Benefits',
      fields: [
        { key: 'text', label: 'Benefit', placeholder: 'Free access to all 700+ virtual labs...', type: 'textarea' },
      ],
    },
  },
  nc_list: {
    items: {
      label: 'Centres',
      fields: [
        { key: 'name',     label: 'Name',     placeholder: 'BITS Pilani' },
        { key: 'location', label: 'Location', placeholder: 'Pilani, Rajasthan' },
        { key: 'category', label: 'Category', placeholder: 'Engineering / Science' },
        { key: 'active',   label: 'Active (true/false)', placeholder: 'true' },
      ],
    },
  },
  nc_inaugurations: {
    items: {
      label: 'Inauguration Events',
      fields: [
        { key: 'year',        label: 'Year',        placeholder: '2024' },
        { key: 'title',       label: 'Title',       placeholder: 'Nodal Centre Inauguration...' },
        { key: 'location',    label: 'Location',    placeholder: 'Coimbatore, Tamil Nadu' },
        { key: 'description', label: 'Description', placeholder: 'Launch of...', type: 'textarea' },
        { key: 'attendees',   label: 'Attendees',   placeholder: '200+' },
        { key: 'status',      label: 'Status',      placeholder: 'Completed / Upcoming' },
      ],
    },
  },
  nc_unique_id: {
    features: {
      label: 'Features List',
      fields: [
        { key: 'icon',  label: 'Icon (e.g. KeyRound, Users, Award)', placeholder: 'KeyRound' },
        { key: 'title', label: 'Feature Title',        placeholder: 'Institutional Login' },
        { key: 'desc',  label: 'Description',          placeholder: 'A dedicated login ID...', type: 'textarea' },
      ],
    },
  },
};

// ── Simple text input ─────────────────────────────────────────
function TextField({ label, value, onChange, placeholder, multiline = false }) {
  const cls = "w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors";
  return (
    <div>
      <label className="text-sm font-medium text-slate-300 block mb-2">{label}</label>
      {multiline ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-none`} />
      ) : (
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────
export default function SectionEditorModal({ section, pageSlug = 'home', onClose, onSaved }) {
  const { token, API_URL } = useAuth();
  const queryClient = useQueryClient();

  const [title,    setTitle]    = useState(section.title    || '');
  const [subtitle, setSubtitle] = useState(section.subtitle || '');
  const [content,  setContent]  = useState(section.content  || {});
  const [experiments, setExperiments] = useState([]);
  const [expSearch,   setExpSearch]   = useState('');
  const [expLoading,  setExpLoading]  = useState(false);
  const [successMsg,  setSuccessMsg]  = useState('');
  const [confirmConfig, setConfirmConfig] = useState(null);

  useEffect(() => {
    if (section.sectionKey === 'featured_simulation') {
      const fetchExps = async () => {
        setExpLoading(true);
        try {
          const res = await api.get('/experiments/all/list');
          if (res.ok) {
            const data = await res.json();
            setExperiments(data);
          }
        } catch (err) {
          console.error('Error fetching experiments:', err);
        } finally {
          setExpLoading(false);
        }
      };
      fetchExps();
    }
  }, [section.sectionKey]);

  const setContentKey = useCallback((key, val) => {
    setContent(prev => ({ ...prev, [key]: val }));
  }, []);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${API_URL}/pages/${pageSlug}/sections/${section.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`${pageSlug}-sections`]);
      queryClient.invalidateQueries(['admin-page-sections', pageSlug]);
      setSuccessMsg('Saved successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onSaved?.();
        onClose();
      }, 1500);
    },
  });

  const handleSave = () => mutation.mutate({ title, subtitle, content });

  const autoSaveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${API_URL}/pages/${pageSlug}/sections/${section.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to auto-save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`${pageSlug}-sections`]);
      queryClient.invalidateQueries(['admin-page-sections', pageSlug]);
    },
  });

  const handleAutoSave = useCallback((key, updatedValue) => {
    autoSaveMutation.mutate({ title, subtitle, content: { ...content, [key]: updatedValue } });
  }, [autoSaveMutation, title, subtitle, content]);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-4xl bg-slate-900 border-l border-white/10 flex flex-col shadow-2xl overflow-hidden animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Edit: {section.label}</h2>
            <p className="text-slate-400 text-xs mt-0.5">Changes go live immediately after saving</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Common section meta ──────────────────────── */}
          {!pageSlug.includes('survey') && section.sectionKey !== 'hero' && (
            <>
              <SectionDivider label="Section Header" />
              <TextField label="Section Title" value={title} onChange={setTitle} placeholder="Section heading…" />
              <TextField label="Section Subtitle" value={subtitle} onChange={setSubtitle} placeholder="Supporting text…" multiline />
            </>
          )}

          {/* ── HERO ─────────────────────────────────────── */}
          {section.sectionKey === 'hero' && (
            <>
              <SectionDivider label={pageSlug.includes('survey') ? "Survey Header Content" : "Hero Content"} />
              {!pageSlug.includes('survey') && (
                <TextField label="Badge Text" value={content.badge} onChange={v => setContentKey('badge', v)} placeholder="Ministry of Education Initiative · NMEICT" />
              )}
              <TextField label="Main Heading (Use *asterisks* for blue gradient)" value={content.heading} onChange={v => setContentKey('heading', v)} placeholder={"Build Your Future with\n*Emerging Technologies*\nand Create Impact."} multiline />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">Content Alignment</label>
                  <select 
                    value={content.contentAlignment || 'left'} 
                    onChange={e => setContentKey('contentAlignment', e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="left">Left Align</option>
                    <option value="center">Center Align</option>
                    <option value="right">Right Align</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">Highlight Gradient</label>
                  <select 
                    value={content.headingGradient || 'cyan-blue'} 
                    onChange={e => setContentKey('headingGradient', e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="cyan-blue">Cyan to Blue</option>
                    <option value="purple-pink">Purple to Pink</option>
                    <option value="orange-red">Orange to Red</option>
                    <option value="emerald-teal">Emerald to Teal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Subheading (rich text — supports bold, links)</label>
                <TiptapEditor
                  content={content.subheading || ''}
                  onChange={v => setContentKey('subheading', v)}
                  placeholder="Access 1,800+ virtual experiments…"
                />
              </div>

              {pageSlug.includes('survey') ? (
                <>
                  <SectionDivider label="Survey Card Content" />
                  <TextField label="Card Heading" value={content.cardHeading} onChange={v => setContentKey('cardHeading', v)} placeholder="Ready to share your feedback?" />
                  <TextField label="Card Description" value={content.cardText} onChange={v => setContentKey('cardText', v)} placeholder="Please fill out the form below..." multiline />
                  <TextField label="Button Label" value={content.cardButtonLabel} onChange={v => setContentKey('cardButtonLabel', v)} placeholder="Open Survey Form" />
                  
                  <SectionDivider label="Custom Survey Form Builder" />
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-400">Build your custom survey form below.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const newQ = { id: Date.now().toString(), type: 'text', label: 'New Question', required: true, options: [] };
                          setContentKey('questions', [...(content.questions || []), newQ]);
                        }}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        + Add Question
                      </button>
                    </div>
                    
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {(content.questions || []).map((q, idx) => (
                        <div key={q.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700 relative group">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmConfig({ title: 'Remove Question', message: 'Are you sure you want to remove this question?', onConfirm: () => {
                                const newQs = [...content.questions];
                                newQs.splice(idx, 1);
                                setContentKey('questions', newQs);
                              } })
                            }}
                            className="absolute top-3 right-3 text-slate-500 hover:text-red-500"
                            title="Remove Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3 pr-8">
                            <div>
                              <label className="text-xs font-medium text-slate-400 block mb-1">Question Type</label>
                              <select
                                value={q.type}
                                onChange={e => {
                                  const newQs = [...content.questions];
                                  newQs[idx].type = e.target.value;
                                  if (e.target.value === 'radio' && !newQs[idx].options?.length) {
                                    newQs[idx].options = ['Option 1', 'Option 2'];
                                  }
                                  setContentKey('questions', newQs);
                                }}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="text">Short Text</option>
                                <option value="textarea">Long Text (Paragraph)</option>
                                <option value="radio">Multiple Choice</option>
                                <option value="rating">1-5 Rating</option>
                              </select>
                            </div>
                            <div className="flex items-end pb-1">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={q.required}
                                  onChange={e => {
                                    const newQs = [...content.questions];
                                    newQs[idx].required = e.target.checked;
                                    setContentKey('questions', newQs);
                                  }}
                                  className="rounded border-slate-600 text-blue-500 bg-slate-900 focus:ring-blue-500/50"
                                />
                                <span className="text-sm text-slate-300">Required Field</span>
                              </label>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <label className="text-xs font-medium text-slate-400 block mb-1">Question Text</label>
                            <input
                              type="text"
                              value={q.label}
                              onChange={e => {
                                const newQs = [...content.questions];
                                newQs[idx].label = e.target.value;
                                setContentKey('questions', newQs);
                              }}
                              placeholder="e.g. How would you rate this lab?"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          
                          {q.type === 'radio' && (
                            <div>
                              <label className="text-xs font-medium text-slate-400 block mb-2">Options (comma separated)</label>
                              <input
                                type="text"
                                value={q.options?.join(', ') || ''}
                                onChange={e => {
                                  const newQs = [...content.questions];
                                  newQs[idx].options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  setContentKey('questions', newQs);
                                }}
                                placeholder="Option 1, Option 2, Option 3"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      {(!content.questions || content.questions.length === 0) && (
                        <div className="text-center py-8 bg-slate-900/50 rounded-xl border border-dashed border-slate-700 text-slate-500 text-sm">
                          No questions added yet. Click "+ Add Question" to start.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <SectionDivider label="Background Image (optional)" />
                  <CloudinaryUploader
                    label="Hero Background Image — replaces the gradient if set"
                    value={content.backgroundImage || ''}
                    onChange={v => setContentKey('backgroundImage', v)}
                  />

                  <SectionDivider label="Call-to-Action Buttons" />
                  <div className="grid grid-cols-2 gap-4">
                    <TextField label="Primary Button Label" value={content.ctaPrimaryLabel} onChange={v => setContentKey('ctaPrimaryLabel', v)} placeholder="Explore Labs" />
                    <TextField label="Primary Button URL" value={content.ctaPrimaryHref} onChange={v => setContentKey('ctaPrimaryHref', v)} placeholder="/labs/biotechnology" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <TextField label="Secondary Button Label" value={content.ctaSecondaryLabel} onChange={v => setContentKey('ctaSecondaryLabel', v)} placeholder="Watch Demo" />
                    <TextField label="Secondary Button URL" value={content.ctaSecondaryHref} onChange={v => setContentKey('ctaSecondaryHref', v)} placeholder="https://youtube.com/…" />
                  </div>

                  <SectionDivider label="Stats Badges" />
                  <RepeatableList
                    label="Stats Counter Badges"
                    items={content.stats || []}
                    onChange={v => setContentKey('stats', v)}
                    onAutoSave={v => handleAutoSave('stats', v)}
                    fields={REPEATABLE_CONFIGS.hero.stats.fields}
                onConfirmRequest={setConfirmConfig}
                  />
                </>
              )}
            </>
          )}

          {/* ── FEATURED SIMULATION ──────────────────────── */}
          {section.sectionKey === 'featured_simulation' && (
            <>
              <SectionDivider label="Select Featured Lab / Experiment" />

              {/* Search box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={expSearch}
                  onChange={e => setExpSearch(e.target.value)}
                  placeholder="Search experiments by name, lab or subject…"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500/40 transition-colors"
                />
              </div>

              {/* Currently selected badge */}
              {content.experimentId && (() => {
                const sel = experiments.find(x => x.id === content.experimentId);
                return sel ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-primary-900/30 border border-primary-700/40 rounded-xl">
                    <Check className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-white text-sm font-semibold truncate">{sel.title}</div>
                      <div className="text-primary-300 text-xs">
                        {sel.lab?.subject?.title} › {sel.lab?.title}
                      </div>
                    </div>
                    <button
                      onClick={() => setContentKey('experimentId', '')}
                      className="ml-auto p-1 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Clear selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null;
              })()}

              {/* Experiment card grid */}
              {expLoading ? (
                <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading experiments…</span>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {experiments
                    .filter(x => {
                      const q = expSearch.toLowerCase();
                      return !q ||
                        x.title?.toLowerCase().includes(q) ||
                        x.lab?.title?.toLowerCase().includes(q) ||
                        x.lab?.subject?.title?.toLowerCase().includes(q);
                    })
                    .map(x => {
                      const isSelected = content.experimentId === x.id;
                      return (
                        <button
                          key={x.id}
                          type="button"
                          onClick={() => {
                            setContent(prev => ({
                              ...prev,
                              experimentId: x.id,
                              tag:          x.lab?.subject?.title || 'Science',
                              category:     x.lab?.title || 'Virtual Lab',
                              title:        x.title,
                              description:  x.description || '',
                              duration:     x.duration || '60 min',
                              difficulty:   x.difficulty || 'Intermediate',
                              institution:  'Amrita Vishwa Vidyapeetham',
                              experiments:  1,
                              href:         `/experiment/${x.id}`,
                              imageUrl:     x.coverPic || x.lab?.coverPic || '',
                            }));
                          }}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-primary-900/40 border-primary-600/60 ring-1 ring-primary-500/40'
                              : 'bg-white/3 border-white/10 hover:bg-white/8 hover:border-white/20'
                          }`}
                        >
                          {/* icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-primary-700' : 'bg-slate-700'
                          }`}>
                            {x.coverPic ? (
                              <img src={x.coverPic} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <FlaskConical className="w-4 h-4 text-white/70" />
                            )}
                          </div>
                          {/* info */}
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${
                              isSelected ? 'text-primary-200' : 'text-white'
                            }`}>{x.title}</div>
                            <div className="text-xs text-slate-500 truncate">
                              {x.lab?.subject?.title && <span className="text-slate-400">{x.lab.subject.title}</span>}
                              {x.lab?.title && <span> › {x.lab.title}</span>}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-primary-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  {experiments.filter(x => {
                    const q = expSearch.toLowerCase();
                    return !q || x.title?.toLowerCase().includes(q) ||
                      x.lab?.title?.toLowerCase().includes(q) ||
                      x.lab?.subject?.title?.toLowerCase().includes(q);
                  }).length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-6">No experiments match your search.</p>
                  )}
                </div>
              )}

              <SectionDivider label="Customize Spotlight Content" />
              <p className="text-slate-500 text-xs -mt-2">Fields below are auto-filled when you pick an experiment above. You can fine-tune them here.</p>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Tag (e.g., Physics)" value={content.tag} onChange={v => setContentKey('tag', v)} placeholder="Physics" />
                <TextField label="Category (e.g., Mechanics)" value={content.category} onChange={v => setContentKey('category', v)} placeholder="Mechanics" />
              </div>
              <TextField label="Simulation Title" value={content.title} onChange={v => setContentKey('title', v)} placeholder="Simple Pendulum Simulation" />
              <TextField label="Description" value={content.description} onChange={v => setContentKey('description', v)} placeholder="Describe the simulation…" multiline />
              <div className="grid grid-cols-3 gap-4">
                <TextField label="Institution" value={content.institution} onChange={v => setContentKey('institution', v)} placeholder="Amrita Vishwa Vidyapeetham" />
                <TextField label="Duration" value={content.duration} onChange={v => setContentKey('duration', v)} placeholder="45 min" />
                <TextField label="Difficulty" value={content.difficulty} onChange={v => setContentKey('difficulty', v)} placeholder="Intermediate" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="No. of Experiments" value={content.experiments} onChange={v => setContentKey('experiments', v)} placeholder="1" />
                <TextField label="Link URL (href)" value={content.href} onChange={v => setContentKey('href', v)} placeholder="/experiment/..." />
              </div>

              <SectionDivider label="Preview Image" />
              <p className="text-slate-500 text-xs -mt-2">Auto-filled from the experiment's cover image. Upload a custom image to override.</p>
              <CloudinaryUploader
                label="Simulation Preview Image — shown on the right panel"
                value={content.imageUrl || ''}
                onChange={v => setContentKey('imageUrl', v)}
              />
            </>
          )}

          {/* ── CTA SECTION ──────────────────────────────── */}
          {section.sectionKey === 'cta' && (
            <>
              <SectionDivider label="CTA Settings" />
              <TextField label="Section Tag Label" value={content.sectionTag} onChange={v => setContentKey('sectionTag', v)} placeholder="Get Involved" />

              <SectionDivider label="CTA Cards (each has an image + text)" />
              <p className="text-slate-500 text-xs -mt-2">
                💡 Upload a card image to replace the default icon. Leave empty to use the default gradient icon.
              </p>
              <RepeatableList
                label="CTA Cards"
                items={content.cards || []}
                onChange={v => setContentKey('cards', v)}
                onAutoSave={v => handleAutoSave('cards', v)}
                fields={REPEATABLE_CONFIGS.cta.cards.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}

          {/* ── SPONSORS ─────────────────────────────────── */}
          {section.sectionKey === 'sponsors' && (
            <>
              <SectionDivider label="Sponsors Settings" />
              <TextField label="Section Tag" value={content.sectionTag} onChange={v => setContentKey('sectionTag', v)} placeholder="Our Partners" />
              <TextField label="Footer Note" value={content.footerNote} onChange={v => setContentKey('footerNote', v)} placeholder="🇮🇳 A Government of India initiative…" />

              <SectionDivider label="Partner Logos & Cards" />
              <p className="text-slate-500 text-xs -mt-2">
                💡 Upload a logo to replace the acronym text. If no logo is uploaded, the gradient badge with acronym is shown instead.
              </p>
              <RepeatableList
                label="Sponsor Cards"
                items={content.sponsors || []}
                onChange={v => setContentKey('sponsors', v)}
                onAutoSave={v => handleAutoSave('sponsors', v)}
                fields={REPEATABLE_CONFIGS.sponsors.sponsors.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}

          {/* ── LAB CATEGORIES ───────────────────────────── */}
          {section.sectionKey === 'lab_categories' && (
            <>
              <SectionDivider label="Lab Categories Settings" />
              <TextField label="Section Tag" value={content.sectionTag} onChange={v => setContentKey('sectionTag', v)} placeholder="Disciplines" />
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-300 text-sm">
                  ℹ️ Lab categories are currently driven by the <strong>Labs data</strong> in the codebase. Title and subtitle above will be used as the section header.
                </p>
              </div>
            </>
          )}

          {/* ── AD BANNER ────────────────────────────────── */}
          {section.sectionKey === 'ad_banner' && (
            <>
              <SectionDivider label="Advertisement Banner Settings" />
              <TextField label="Institution Name" value={content.institution} onChange={v => setContentKey('institution', v)} placeholder="Amrita Vishwa Vidyapeetham" />
              <TextField label="Ad Heading" value={content.heading} onChange={v => setContentKey('heading', v)} placeholder="PhD Admissions 2026" />
              <TextField label="Ad Description" value={content.description} onChange={v => setContentKey('description', v)} placeholder="Enter details about the program, fellowships, etc." multiline />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Button Label" value={content.buttonLabel} onChange={v => setContentKey('buttonLabel', v)} placeholder="Apply Now" />
                <TextField label="Button Href / Target URL" value={content.buttonHref} onChange={v => setContentKey('buttonHref', v)} placeholder="https://amrita.edu/admissions" />
              </div>

              <SectionDivider label="Banner Background Image" />
              <CloudinaryUploader
                label="Custom Banner Image — displayed on the right/side panel of the ad"
                value={content.imageUrl || ''}
                onChange={v => setContentKey('imageUrl', v)}
              />
            </>
          )}

          {/* ── NEWS ─────────────────────────────────────── */}
          {section.sectionKey === 'news' && (
            <>
              <SectionDivider label="News Settings" />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Section Tag" value={content.sectionTag} onChange={v => setContentKey('sectionTag', v)} placeholder="Latest Updates" />
                <TextField label="View All Link URL" value={content.viewAllHref} onChange={v => setContentKey('viewAllHref', v)} placeholder="/news" />
              </div>

              <SectionDivider label="News Articles (each can have a thumbnail)" />
              <p className="text-slate-500 text-xs mt-1 mb-3">
                💡 The first item is displayed as a large featured card. Items 2–4 appear as a side list.
              </p>
              <RepeatableList
                label="News Items"
                items={content.items || []}
                onChange={v => setContentKey('items', v)}
                onAutoSave={v => handleAutoSave('items', v)}
                fields={REPEATABLE_CONFIGS.news.items.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}

          {/* ── MEDIA ────────────────────────────────────── */}
          {section.sectionKey === 'media' && (
            <>
              <SectionDivider label="Media Settings" />
              <TextField label="Section Tag" value={content.sectionTag} onChange={v => setContentKey('sectionTag', v)} placeholder="Media" />

              <SectionDivider label="Videos Grid (Add/Edit Videos)" />
              <p className="text-slate-500 text-xs mt-1 mb-3">
                💡 Add multiple videos to showcase them side-by-side in a responsive grid layout.
              </p>
              <RepeatableList
                label="Videos list shown on Home page"
                items={content.videos || []}
                onChange={v => setContentKey('videos', v)}
                onAutoSave={v => handleAutoSave('videos', v)}
                fields={REPEATABLE_CONFIGS.media.videos.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}

          {/* ── PUBLICATIONS ────────────────────────────────── */}
          {section.sectionKey === 'publications_list' && (
            <>
              <SectionDivider label="Publication Settings" />
              <SectionDivider label="Research Publications (Ordered by Year)" />
              <p className="text-slate-500 text-xs -mt-2">
                💡 Add papers here. The frontend will group them automatically by year.
              </p>
              <RepeatableList
                label="Publications Items"
                items={content.items || []}
                onChange={v => setContentKey('items', v)}
                onAutoSave={v => handleAutoSave('items', v)}
                fields={REPEATABLE_CONFIGS.publications_list.items.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}

          {/* ── PROJECT ─────────────────────────────────────── */}
          {section.sectionKey === 'project_timeline' && (
            <>
              <SectionDivider label="Timeline Entries" />
              <RepeatableList
                label="Timeline Items"
                items={content.items || []}
                onChange={v => setContentKey('items', v)}
                onAutoSave={v => handleAutoSave('items', v)}
                fields={REPEATABLE_CONFIGS.project_timeline.items.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}

          {section.sectionKey === 'project_objectives' && (
            <>
              <SectionDivider label="Mission Objectives" />
              <RepeatableList
                label="Objective Items"
                items={content.items || []}
                onChange={v => setContentKey('items', v)}
                onAutoSave={v => handleAutoSave('items', v)}
                fields={REPEATABLE_CONFIGS.project_objectives.items.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}

          {/* ── NODAL CENTRE INAUGURATIONS ───────────────────────── */}
          {section.sectionKey === 'nc_inaugurations' && (
            <>
              <SectionDivider label="Inauguration Events" />
              <TextField label="Section Tag" value={content.tag} onChange={v => setContentKey('tag', v)} placeholder="Events" />
              <RepeatableList
                label="Inaugurations"
                items={content.items || []}
                onChange={v => setContentKey('items', v)}
                onAutoSave={v => handleAutoSave('items', v)}
                fields={REPEATABLE_CONFIGS.nc_inaugurations.items.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}



          {/* ── NODAL CENTRES ───────────────────────────────── */}
          {section.sectionKey === 'nc_benefits' && (
            <>
              <SectionDivider label="Nodal Centre Benefits" />
              <RepeatableList
                label="Benefits List"
                items={content.items || []}
                onChange={v => setContentKey('items', v)}
                onAutoSave={v => handleAutoSave('items', v)}
                fields={REPEATABLE_CONFIGS.nc_benefits.items.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}

          {section.sectionKey === 'nc_list' && (
            <>
              <SectionDivider label="Registered Nodal Centres" />
              <RepeatableList
                label="Centres List"
                items={content.items || []}
                onChange={v => setContentKey('items', v)}
                onAutoSave={v => handleAutoSave('items', v)}
                fields={REPEATABLE_CONFIGS.nc_list.items.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}

          {section.sectionKey === 'nc_unique_id' && (
            <>
              <SectionDivider label="Template Settings" />
              <TextField label="Section Tag" value={content.tag} onChange={v => setContentKey('tag', v)} placeholder="Access" />
              <TextField label="Instructions" value={content.instructions} onChange={v => setContentKey('instructions', v)} placeholder="Nodal coordinator can submit the list..." multiline />
              <TextField label="Template File URL" value={content.templateLink} onChange={v => setContentKey('templateLink', v)} placeholder="https://vlab.amrita.edu/userfiles/1/file/login_id_template.xlsx" />
              <TextField label="Template Button Label" value={content.templateLabel} onChange={v => setContentKey('templateLabel', v)} placeholder="Click Here To Download Login ID Template" />

              <SectionDivider label="Features" />
              <RepeatableList
                label="Features List"
                items={content.features || []}
                onChange={v => setContentKey('features', v)}
                onAutoSave={v => handleAutoSave('features', v)}
                fields={REPEATABLE_CONFIGS.nc_unique_id.features.fields}
                onConfirmRequest={setConfirmConfig}
              />
            </>
          )}


        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {mutation.isError && (
          <p className="text-red-400 text-xs text-center pb-3">Failed to save. Please try again.</p>
        )}
        
        {successMsg && (
          <div className="flex justify-center pb-3">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          </div>
        )}
      </div>
      <ConfirmModal isOpen={!!confirmConfig} {...(confirmConfig || {})} onClose={() => setConfirmConfig(null)} />
    </div>
  );
}
