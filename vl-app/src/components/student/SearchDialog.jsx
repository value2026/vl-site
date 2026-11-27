import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronRight, FlaskConical, Loader2, PlayCircle, Search, X } from 'lucide-react';
import { api } from '../../utils/api';

const MAX_RESULTS_PER_GROUP = 6;

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

/**
 * Filter and rank catalog entries so title matches appear before description/parent matches.
 */
function searchCatalogItems(items, rawQuery, buildEntry) {
  const cleanQuery = rawQuery.trim().toLowerCase();
  if (!cleanQuery) return [];
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  return items
    .map((item) => {
      const entry = buildEntry(item);
      const titleLower = normalizeText(entry.title);
      const haystack = entry.searchFields.map(normalizeText).join(' ');
      if (!tokens.every((token) => haystack.includes(token))) return null;

      let score = 0;
      if (titleLower === cleanQuery) score += 100;
      else if (titleLower.startsWith(cleanQuery)) score += 50;
      else if (titleLower.includes(cleanQuery)) score += 25;
      else if (tokens.every((t) => titleLower.includes(t))) score += 10;

      return { ...entry, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

async function fetchSearchCatalog() {
  const [subRes, labRes, expRes] = await Promise.all([
    api.get('/subjects'),
    api.get('/labs'),
    api.get('/experiments'),
  ]);
  if (!subRes.ok || !labRes.ok || !expRes.ok) {
    throw new Error('Could not load labs catalogue. Please try again.');
  }
  const [subjects, labs, experiments] = await Promise.all([
    subRes.json(),
    labRes.json(),
    expRes.json(),
  ]);

  const subjectList = Array.isArray(subjects) ? subjects : [];
  const activeSubjectIds = new Set(subjectList.map((s) => s.id));

  const labList = (Array.isArray(labs) ? labs : []).filter(
    (l) => !l.subjectId || activeSubjectIds.has(l.subjectId)
  );
  const activeLabIds = new Set(labList.map((l) => l.id));

  const experimentList = (Array.isArray(experiments) ? experiments : []).filter(
    (e) => !e.labId || activeLabIds.has(e.labId)
  );

  return { subjects: subjectList, labs: labList, experiments: experimentList };
}

/**
 * Accessible native modal search dialog for Subjects, Labs, and Experiments.
 */
const SearchDialog = forwardRef(function SearchDialog(_props, ref) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const headingId = useId();
  const inputId = useId();

  const [hasOpened, setHasOpened] = useState(false);
  const [query, setQuery] = useState('');
  const [announcedQuery, setAnnouncedQuery] = useState('');

  const { data: catalog, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['nav-search-catalog'],
    queryFn: fetchSearchCatalog,
    enabled: hasOpened,
    staleTime: 60_000,
  });

  useImperativeHandle(ref, () => ({
    openModal() {
      const dialog = dialogRef.current;
      if (!dialog) return;
      setHasOpened(true);
      setQuery('');
      setAnnouncedQuery('');
      if (!dialog.open) {
        dialog.showModal();
      }
      inputRef.current?.focus();
    },
    closeModal() {
      dialogRef.current?.close();
    },
  }), []);

  // Reset search text after dialog finishes closing (Esc, light dismiss, or close button)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      if (dialog.open) return;
      setQuery('');
      setAnnouncedQuery('');
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

  // Light-dismiss pointer-position fallback for browsers lacking <dialog closedby="any"> (e.g. Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return undefined;

    const isOutside = (e) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onPointerDown = (e) => { pressedOutside = isOutside(e); };
    const onPointerUp = (e) => {
      if (pressedOutside && isOutside(e)) dialog.close();
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  // Debounce live-region result announcements so rapid typing does not flood screen readers
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setAnnouncedQuery('');
      return undefined;
    }
    const timer = setTimeout(() => setAnnouncedQuery(trimmed), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const resultGroups = useMemo(() => {
    if (!catalog) return [];
    const groups = [
      {
        key: 'subjects',
        label: 'Subjects',
        Icon: BookOpen,
        badgeClass: 'bg-indigo-50 text-indigo-700',
        allItems: searchCatalogItems(catalog.subjects, query, (s) => ({
          id: s.id,
          title: s.title,
          subtitle: `${s._count?.labs ?? 0} ${s._count?.labs === 1 ? 'Lab' : 'Labs'}`,
          to: `/subject/${s.id}`,
          searchFields: [s.title, s.description],
        })),
      },
      {
        key: 'labs',
        label: 'Labs',
        Icon: FlaskConical,
        badgeClass: 'bg-blue-50 text-blue-700',
        allItems: searchCatalogItems(catalog.labs, query, (l) => ({
          id: l.id,
          title: l.title,
          subtitle: l.subject?.title || 'Virtual Lab',
          to: `/lab/${l.id}`,
          searchFields: [l.title, l.subject?.title, l.description],
        })),
      },
      {
        key: 'experiments',
        label: 'Experiments',
        Icon: PlayCircle,
        badgeClass: 'bg-emerald-50 text-emerald-700',
        allItems: searchCatalogItems(catalog.experiments, query, (e) => ({
          id: e.id,
          title: e.title,
          subtitle: [e.lab?.subject?.title, e.lab?.title].filter(Boolean).join(' · '),
          meta: e.difficulty || '',
          to: `/experiment/${e.id}`,
          searchFields: [e.title, e.lab?.title, e.lab?.subject?.title, e.difficulty, e.description],
        })),
      },
    ];

    return groups
      .filter((g) => g.allItems.length > 0)
      .map((g) => ({
        ...g,
        totalCount: g.allItems.length,
        items: g.allItems.slice(0, MAX_RESULTS_PER_GROUP),
      }));
  }, [catalog, query]);

  const totalMatches = useMemo(
    () => resultGroups.reduce((sum, g) => sum + g.totalCount, 0),
    [resultGroups]
  );

  const trimmedQuery = query.trim();
  const firstMatch = resultGroups[0]?.items[0] || null;

  const requestClose = () => {
    dialogRef.current?.close();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstMatch) return;
    requestClose();
    navigate(firstMatch.to);
  };

  const statusText = useMemo(() => {
    if (!hasOpened || isLoading || isError || !announcedQuery) return '';
    return totalMatches === 0
      ? `No results found for ${announcedQuery}.`
      : `${totalMatches} ${totalMatches === 1 ? 'result' : 'results'} found for ${announcedQuery}.`;
  }, [hasOpened, isLoading, isError, announcedQuery, totalMatches]);

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby={headingId}
      className="vl-search-dialog mx-auto mt-16 sm:mt-20 mb-auto w-[calc(100%-2rem)] max-w-xl p-0 bg-transparent border-0 outline-none"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <h2 id={headingId} className="sr-only">Search Virtual Labs</h2>

        <form onSubmit={handleSubmit} className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
          <label htmlFor={inputId} className="sr-only">
            Search subjects, labs, and experiments
          </label>
          <input
            ref={inputRef}
            id={inputId}
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, labs, experiments…"
            className="flex-1 min-w-0 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close search"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto">
          {!trimmedQuery ? (
            <div className="p-4">
              <p className="text-xs text-gray-500 text-center">
                Start typing to search across all subjects, labs, and experiments
              </p>
              {catalog?.subjects?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
                    Browse Subjects
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {catalog.subjects.slice(0, 6).map((sub) => (
                      <li key={sub.id}>
                        <Link
                          to={`/subject/${sub.id}`}
                          onClick={requestClose}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors"
                        >
                          <span>{sub.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" aria-hidden="true" />
              <span>Loading labs catalogue…</span>
            </div>
          ) : isError ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-red-600 mb-2">
                {error?.message || 'Unable to load search results.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : totalMatches === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">
                No matches found for &ldquo;{trimmedQuery}&rdquo;
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching by subject, lab title, experiment name, or difficulty.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {resultGroups.map(({ key, label, Icon, badgeClass, items, totalCount }) => (
                <section key={key} aria-label={label} className="py-2">
                  <div className="px-4 py-1 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {label}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400">
                      {totalCount}
                    </span>
                  </div>
                  <ul>
                    {items.map((item) => (
                      <li key={`${key}-${item.id}`}>
                        <Link
                          to={item.to}
                          onClick={requestClose}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                        >
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${badgeClass}`}>
                            <Icon className="w-4 h-4" aria-hidden="true" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-gray-900 group-hover:text-indigo-600 truncate">
                              {item.title}
                            </span>
                            {item.subtitle && (
                              <span className="block text-xs text-gray-500 truncate">
                                {item.subtitle}
                              </span>
                            )}
                          </span>
                          {item.meta && (
                            <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex-shrink-0">
                              {item.meta}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 flex-shrink-0" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {statusText}
        </p>
      </div>
    </dialog>
  );
});

export default SearchDialog;
