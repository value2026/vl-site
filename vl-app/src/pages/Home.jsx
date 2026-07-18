import { useQuery } from '@tanstack/react-query';
import SectionRenderer from '../components/SectionRenderer';
import Hero               from '../components/Hero';
import FeaturedSimulation  from '../components/FeaturedSimulation';
import CTASection          from '../components/CTASection';
import SponsorsSection     from '../components/SponsorsSection';
import LabCategories       from '../components/LabCategories';
import NewsSection         from '../components/NewsSection';
import MediaSection        from '../components/MediaSection';

// Fallback static order if API is unavailable
const STATIC_FALLBACK = [
  { id: 'hero',    sectionKey: 'hero',                isVisible: true, order: 0, title: null, subtitle: null, content: {} },
  { id: 'fs',      sectionKey: 'featured_simulation', isVisible: true, order: 1, title: null, subtitle: null, content: {} },
  { id: 'cta',     sectionKey: 'cta',                 isVisible: true, order: 2, title: null, subtitle: null, content: {} },
  { id: 'sp',      sectionKey: 'sponsors',            isVisible: true, order: 3, title: null, subtitle: null, content: {} },
  { id: 'ad',      sectionKey: 'ad_banner',           isVisible: true, order: 4, title: null, subtitle: null, content: {} },
  { id: 'lc',      sectionKey: 'lab_categories',      isVisible: true, order: 5, title: null, subtitle: null, content: {} },
  { id: 'news',    sectionKey: 'news',                isVisible: true, order: 6, title: null, subtitle: null, content: {} },
  { id: 'media',   sectionKey: 'media',               isVisible: true, order: 7, title: null, subtitle: null, content: {} },
];

async function fetchHomeSections() {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pages/home/sections`);
  if (!res.ok) throw new Error('Failed to fetch home sections');
  return res.json();
}

function SectionSkeleton() {
  return (
    <div className="py-24 bg-gray-50 animate-pulse">
      <div className="container-custom">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
        <div className="h-4 bg-gray-200 rounded w-2/5 mx-auto" />
      </div>
    </div>
  );
}

export default function Home() {
  const { data: sections, isLoading, isError } = useQuery({
    queryKey: ['home-sections'],
    queryFn: fetchHomeSections,
    staleTime: 60_000,       // 1 min cache
    retry: 1,
  });

  // Show skeletons while loading (only on first load)
  if (isLoading) {
    return (
      <main>
        {/* Hero always shows immediately with defaults while loading */}
        <Hero />
        <SectionSkeleton />
        <SectionSkeleton />
      </main>
    );
  }

  // If API fails, fall back to all static sections with defaults
  const pageSections = (isError || !sections) ? STATIC_FALLBACK : sections;

  return (
    <main>
      {pageSections
        .filter(s => s.isVisible)
        .sort((a, b) => a.order - b.order)
        .map(section => (
          <SectionRenderer key={section.id} section={section} />
        ))
      }
    </main>
  );
}
