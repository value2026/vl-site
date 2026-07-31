import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Eye, EyeOff, Pencil, ExternalLink,
  RefreshCw, Globe, AlertCircle, Loader2, CheckCircle2, ChevronDown, DownloadCloud,
  Home, Microscope, Megaphone, Landmark, FlaskConical, Newspaper, Clapperboard, FileText,
  BookOpen, Clock, Target, Gift, Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SectionEditorModal from '../../components/dashboard/SectionEditorModal';
import SurveyResponsesView from '../../components/dashboard/SurveyResponsesView';

// ── API helpers ───────────────────────────────────────────────

function usePageSections(slug, token, API_URL) {
  return useQuery({
    queryKey: ['admin-page-sections', slug],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/pages/${slug}/sections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load sections');
      return res.json();
    },
  });
}

// ── Section card (draggable) ──────────────────────────────────

const SECTION_ICONS = {
  hero:                <Home className="w-5 h-5 text-blue-400" />,
  featured_simulation: <Microscope className="w-5 h-5 text-indigo-400" />,
  cta:                 <Megaphone className="w-5 h-5 text-amber-400" />,
  sponsors:            <Landmark className="w-5 h-5 text-emerald-400" />,
  lab_categories:      <FlaskConical className="w-5 h-5 text-purple-400" />,
  news:                <Newspaper className="w-5 h-5 text-orange-400" />,
  media:               <Clapperboard className="w-5 h-5 text-pink-400" />,
  publications_list:   <BookOpen className="w-5 h-5 text-cyan-400" />,
  project_timeline:    <Clock className="w-5 h-5 text-rose-400" />,
  project_objectives:  <Target className="w-5 h-5 text-red-400" />,
  nc_benefits:         <Gift className="w-5 h-5 text-teal-400" />,
  nc_list:             <Building2 className="w-5 h-5 text-blue-400" />,
  survey_header:       <FileText className="w-5 h-5 text-blue-400" />
};

function SortableSection({ section, onEdit, onToggle, isSaving }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
        isDragging
          ? 'bg-slate-700 border-red-500/40 shadow-2xl shadow-red-500/10 z-50'
          : 'bg-slate-800/60 border-white/10 hover:border-white/20 hover:bg-slate-800'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing transition-colors p-1 touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Icon */}
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
        {SECTION_ICONS[section.sectionKey] || <FileText className="w-5 h-5 text-slate-400" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm truncate">{section.label}</span>
          {isSaving && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
        </div>
        <p className="text-slate-500 text-xs font-mono mt-0.5">{section.sectionKey}</p>
      </div>

      {/* Visibility badge */}
      <div className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        section.isVisible
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-slate-700/50 text-slate-500 border-slate-600/30'
      }`}>
        {section.isVisible ? 'Visible' : 'Hidden'}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => onToggle(section)}
          title={section.isVisible ? 'Hide section' : 'Show section'}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={() => onEdit(section)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function ManagePages() {
  const { token, API_URL } = useAuth();
  const queryClient        = useQueryClient();
  const [pageSlug, setPageSlug] = useState('home');
  const [editingSection, setEditingSection] = useState(null);
  const [activeTab, setActiveTab] = useState('sections');
  const [savingId,       setSavingId]       = useState(null);
  const [savedId,        setSavedId]        = useState(null);

  const { data: sections = [], isLoading, isError, refetch } = usePageSections(pageSlug, token, API_URL);

  // Local ordering state (optimistic UI)
  const [localOrder, setLocalOrder] = useState(null);
  const displaySections = (localOrder || sections).slice().sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Visibility toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async (section) => {
      setSavingId(section.id);
      const res = await fetch(`${API_URL}/pages/${pageSlug}/sections/${section.id}/visibility`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to toggle');
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin-page-sections', pageSlug], (old) =>
        old?.map(s => s.id === updated.id ? updated : s)
      );
      setLocalOrder(prev => prev ? prev.map(s => s.id === updated.id ? { ...s, isVisible: updated.isVisible } : s) : null);
      // Also invalidate the public cache
      queryClient.invalidateQueries([`${pageSlug}-sections`]);
      setSavedId(updated.id);
      setTimeout(() => setSavedId(null), 2000);
    },
    onSettled: () => setSavingId(null),
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (items) => {
      const res = await fetch(`${API_URL}/pages/${pageSlug}/sections/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Reorder failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`${pageSlug}-sections`]);
      queryClient.invalidateQueries(['admin-page-sections', pageSlug]);
    },
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const current = localOrder || sections;
    const sorted  = [...current].sort((a, b) => a.order - b.order);
    const oldIdx  = sorted.findIndex(s => s.id === active.id);
    const newIdx  = sorted.findIndex(s => s.id === over.id);
    const reordered = arrayMove(sorted, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }));

    setLocalOrder(reordered);

    reorderMutation.mutate(
      reordered.map(s => ({ id: s.id, order: s.order }))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading page sections…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-white font-semibold">Failed to load sections</p>
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold flex items-center gap-3">
            <Globe className="w-6 h-6 text-red-400" />
            Manage Pages
          </h2>
          <p className="text-slate-400 text-sm mt-1.5">
            Drag to reorder sections · Toggle visibility · Click Edit to change content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {(() => {
            const getLiveUrl = () => {
              switch(pageSlug) {
                case 'home': return '/';
                case 'student-survey': return '/survey/student';
                case 'faculty-survey': return '/survey/faculty';
                case 'nodal-centres': return '/nodal-centres/list';
                default: return `/${pageSlug}`;
              }
            };
            return (
              <>
                {['student-survey', 'faculty-survey'].includes(pageSlug) && (
                  <button
                    onClick={() => setActiveTab(activeTab === 'responses' ? 'sections' : 'responses')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'responses'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    {activeTab === 'responses' ? 'Edit Form Fields' : 'View Responses'}
                  </button>
                )}
                <a
                  href={getLiveUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Live
                </a>
              </>
            );
          })()}
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => { setPageSlug('home'); setLocalOrder(null); setActiveTab('sections'); }}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            pageSlug === 'home'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Home Page
        </button>
        <button
          onClick={() => { setPageSlug('publications'); setLocalOrder(null); setActiveTab('sections'); }}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            pageSlug === 'publications'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Publications
        </button>
        <button
          onClick={() => { setPageSlug('project'); setLocalOrder(null); setActiveTab('sections'); }}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            pageSlug === 'project'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Project
        </button>
        <button
          onClick={() => { setPageSlug('nodal-centres'); setLocalOrder(null); setActiveTab('sections'); }}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            pageSlug === 'nodal-centres'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Nodal Centres
        </button>
        <div className="relative group">
          <button
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              ['student-survey', 'faculty-survey'].includes(pageSlug)
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Surveys
            <ChevronDown className={`w-4 h-4 transition-transform group-hover:rotate-180 ${['student-survey', 'faculty-survey'].includes(pageSlug) ? 'text-red-400' : 'text-slate-500'}`} />
          </button>
          
          <div className="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden py-1">
              <button
                onClick={() => { setPageSlug('student-survey'); setLocalOrder(null); setActiveTab('sections'); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  pageSlug === 'student-survey' 
                    ? 'bg-blue-500/20 text-blue-300 font-bold border-l-2 border-blue-400' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                }`}
              >
                Student Survey
              </button>
              <button
                onClick={() => { setPageSlug('faculty-survey'); setLocalOrder(null); setActiveTab('sections'); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  pageSlug === 'faculty-survey' 
                    ? 'bg-blue-500/20 text-blue-300 font-bold border-l-2 border-blue-400' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                }`}
              >
                Faculty Survey
              </button>
            </div>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'responses' ? (
        <SurveyResponsesView
          pageSlug={pageSlug}
          token={token}
          API_URL={API_URL}
        />
      ) : (
        <>
          {/* Info banner */}
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-6">
            <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <p className="text-blue-300 text-sm">
              Changes are <strong>live immediately</strong> after saving. Hidden sections are invisible to visitors but stay saved in the database.
            </p>
          </div>

          {/* Section list with DnD */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displaySections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {displaySections.map(section => (
                  <div key={section.id} className="relative">
                    <SortableSection
                      section={section}
                      onEdit={setEditingSection}
                      onToggle={s => toggleMutation.mutate(s)}
                      isSaving={savingId === section.id}
                    />
                    {savedId === section.id && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-emerald-400 text-xs font-medium animate-fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        Saved!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Reorder status */}
          {reorderMutation.isPending && (
            <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving order…
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      {editingSection && (
        <SectionEditorModal
          section={editingSection}
          pageSlug={pageSlug}
          onClose={() => setEditingSection(null)}
          onSaved={() => {
            refetch();
            setLocalOrder(null);
          }}
        />
      )}
    </div>
  );
}
