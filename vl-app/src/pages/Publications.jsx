import { useState, useMemo } from 'react';
import { 
  FileText, Calendar, BookOpen, Users, Search, 
  ExternalLink, Download, ArrowRight, Loader2, Filter, X 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '../utils/api';
import DynamicBlockRenderer from '../components/public/DynamicBlockRenderer';

async function fetchPublicationsSections() {
  const res = await fetch(apiUrl("/pages/publications/sections"));
  if (!res.ok) throw new Error('Failed to fetch publications sections');
  return res.json();
}

export default function Publications() {
  const { data: sections, isLoading } = useQuery({
    queryKey: ['publications-sections'],
    queryFn: fetchPublicationsSections,
    staleTime: 60_000,
    retry: 1,
  });

  let rawItems = [];
  let pageTitle = "Publications";
  let pageSubtitle = "Peer-reviewed research papers and technical reports on virtual laboratory education and the Virtual Labs initiative.";
  let customBlocks = [];
  let customFields = [];

  if (sections && Array.isArray(sections)) {
    const pubSection = sections.find(s => s.sectionKey === 'publications_list');
    if (pubSection) {
      if (pubSection.title) pageTitle = pubSection.title;
      if (pubSection.subtitle) pageSubtitle = pubSection.subtitle;
      if (pubSection.content?.items?.length) {
        rawItems = pubSection.content.items;
      }
      customBlocks = pubSection.content?.customBlocks || [];
      customFields = pubSection.content?.customFields || [];
    }
  }

  // Real publications loaded from database
  const allItems = useMemo(() => {
    if (rawItems && Array.isArray(rawItems) && rawItems.length > 0) {
      return rawItems.map((p, idx) => ({
        id: p._id || p.id || `pub-${idx}`,
        year: p.year ? String(p.year) : '2026',
        type: p.type || (p.journal?.toLowerCase().includes('conference') ? 'Conference Paper' : 'Journal Article'),
        researchArea: p.researchArea || 'Research',
        title: p.title,
        authors: p.authors || '',
        journal: p.journal || '',
        doi: p.doi || '',
        pdfUrl: p.pdfUrl || p.doi || '',
      }));
    }
    return [];
  }, [rawItems]);

  // Distinct Filter Options
  const distinctYears = useMemo(() => {
    const yrs = [...new Set(allItems.map(p => p.year).filter(Boolean))];
    return yrs.sort((a, b) => Number(b) - Number(a));
  }, [allItems]);

  const distinctTypes = useMemo(() => {
    const types = [...new Set(allItems.map(p => p.type).filter(Boolean))];
    return ['All Types', ...types.sort()];
  }, [allItems]);

  // Statistics
  const stats = useMemo(() => {
    const totalPubs = allItems.length;
    const yearCount = distinctYears.length;
    const minYear = distinctYears[distinctYears.length - 1] || '2010';
    const maxYear = distinctYears[0] || '2026';
    const journalCount = allItems.filter(p => (p.type || '').toLowerCase().includes('journal')).length;
    const confCount = allItems.filter(p => (p.type || '').toLowerCase().includes('conference')).length;

    return {
      publications: totalPubs,
      yearSpan: `${yearCount} Years (${minYear} – ${maxYear})`,
      journals: `${journalCount} Journals`,
      conferences: `${confCount} Conferences`,
    };
  }, [allItems, distinctYears]);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026'); // Default active tab is 2026
  const [selectedType, setSelectedType] = useState('All Types');
  const [sortBy, setSortBy] = useState('newest');
  const [showAllYears, setShowAllYears] = useState(false);

  // Filter and Sort publications
  const filteredPublications = useMemo(() => {
    let list = [...allItems];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.title?.toLowerCase().includes(q) ||
        p.authors?.toLowerCase().includes(q) ||
        p.journal?.toLowerCase().includes(q) ||
        p.year?.toString().includes(q)
      );
    }

    // Year Filter (unless Show All is toggled)
    if (!showAllYears && selectedYear !== 'All') {
      list = list.filter(p => p.year?.toString() === selectedYear.toString());
    }

    // Type Filter
    if (selectedType !== 'All Types') {
      list = list.filter(p => p.type === selectedType);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') return Number(b.year) - Number(a.year);
      if (sortBy === 'oldest') return Number(a.year) - Number(b.year);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return list;
  }, [allItems, searchQuery, selectedYear, selectedType, sortBy, showAllYears]);

  const activeDisplayYear = showAllYears ? 'All Years' : selectedYear;
  const countInActiveYear = filteredPublications.length;

  return (
    <main className="bg-[#F8FAFC] min-h-screen pb-24">
      {/* Hero Header */}
      <section className="bg-hero-gradient py-12 text-center">
        <div className="container-custom">
          <span className="inline-block bg-white/10 text-white/90 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-4 border border-white/10">
            Research
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            {pageSubtitle}
          </p>
        </div>
      </section>

      <div className="container-custom max-w-6xl -mt-6">
        
        {/* ── 1. Top Statistics Summary Cards ──────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Publications */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#4F22BD] flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">
                {stats.publications}
              </div>
              <div className="text-xs font-bold text-slate-800">Publications</div>
              <div className="text-[11px] text-slate-400">Across journals & conferences</div>
            </div>
          </div>

          {/* Card 2: Years */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#4F22BD] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">
                {distinctYears.length}
              </div>
              <div className="text-xs font-bold text-slate-800">Years</div>
              <div className="text-[11px] text-slate-400">{distinctYears[distinctYears.length - 1]} – {distinctYears[0]}</div>
            </div>
          </div>

          {/* Card 3: Journals */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#4F22BD] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">
                {stats.journals.split(' ')[0]}
              </div>
              <div className="text-xs font-bold text-slate-800">Journals</div>
              <div className="text-[11px] text-slate-400">International & National</div>
            </div>
          </div>

          {/* Card 4: Conferences */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#4F22BD] flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">
                {stats.conferences.split(' ')[0]}
              </div>
              <div className="text-xs font-bold text-slate-800">Conferences</div>
              <div className="text-[11px] text-slate-400">Papers Presented</div>
            </div>
          </div>
        </div>

        {/* ── 2. Search & Multi-Filter Bar ─────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search publications by title, author, keyword..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4F22BD] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown 1: Year Filter */}
            <div className="sm:w-40">
              <select
                value={selectedYear}
                onChange={e => {
                  setSelectedYear(e.target.value);
                  setShowAllYears(e.target.value === 'All');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#4F22BD] cursor-pointer"
              >
                <option value="All">All Years</option>
                {distinctYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>


            {/* Dropdown 3: Publication Type Filter */}
            <div className="sm:w-40">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#4F22BD] cursor-pointer"
              >
                {distinctTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => {}}
              className="bg-[#4F22BD] hover:bg-[#431CA3] text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Search
            </button>
          </div>
        </div>

        {/* ── 3. Year Navigation Pills & Sort Controls ────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2">
          {/* Year Pills Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {distinctYears.map(yr => {
              const isActive = !showAllYears && selectedYear === yr;
              return (
                <button
                  key={yr}
                  onClick={() => {
                    setSelectedYear(yr);
                    setShowAllYears(false);
                  }}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#4F22BD] text-white shadow-md shadow-purple-500/25 scale-105'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {yr}
                </button>
              );
            })}
            <button
              onClick={() => {
                setShowAllYears(true);
                setSelectedYear('All');
              }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                showAllYears
                  ? 'bg-[#4F22BD] text-white shadow-md shadow-purple-500/25 scale-105'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              All
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <span className="text-xs font-semibold text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#4F22BD] cursor-pointer shadow-sm"
            >
              <option value="newest">Year (Newest)</option>
              <option value="oldest">Year (Oldest)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* ── 4. Year Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeDisplayYear}
            </h2>
            <span className="text-sm font-semibold text-slate-500">
              {countInActiveYear} {countInActiveYear === 1 ? 'Publication' : 'Publications'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAllYears(!showAllYears)}
            className="text-xs font-bold text-[#4F22BD] hover:text-[#3B1599] inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            {showAllYears ? 'Show Year Wise' : 'View all'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── 5. 2-Column Responsive Card Grid ──────────────────────── */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-[#4F22BD] animate-spin" />
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No publications matched your filter</h3>
            <p className="text-sm text-slate-500 mb-4">Try adjusting your search keywords or clearing filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedYear('All');
                setShowAllYears(true);
                setSelectedType('All Types');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4F22BD] hover:bg-[#431CA3] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPublications.map(pub => {
              const isConf = (pub.type || '').toLowerCase().includes('conference');
              return (
                <div
                  key={pub.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Header: Type Badge + Year */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full ${
                          isConf
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-purple-50 text-[#6B21A8] border border-purple-100'
                        }`}
                      >
                        {pub.type || 'Journal Article'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {pub.year}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-bold text-slate-900 text-base md:text-[17px] leading-snug group-hover:text-[#4F22BD] transition-colors mb-3">
                      {pub.title}
                    </h3>

                    {/* Authors */}
                    <div className="text-xs text-slate-500 flex items-start gap-2 mb-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{pub.authors}</span>
                    </div>

                    {/* Journal / Venue */}
                    <div className="text-xs text-slate-600 flex items-start gap-2 mb-6">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{pub.journal}</span>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <a
                      href={pub.doi || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#4F22BD] hover:bg-[#431CA3] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      View Publication <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={pub.pdfUrl || pub.doi || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-purple-200 hover:border-purple-300 text-[#4F22BD] hover:bg-purple-50/50 px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Blocks & Custom Fields configured in dashboard */}
        <DynamicBlockRenderer blocks={customBlocks} fields={customFields} />

      </div>
    </main>
  );
}
