import { ExternalLink, FileText, Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

async function fetchPublicationsSections() {
  const res = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/pages/publications/sections`);
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

  let pubItems = [];
  let pageTitle = "Publications";
  let pageSubtitle = "Peer-reviewed research papers and technical reports on virtual laboratory education and the Virtual Labs initiative.";

  if (sections) {
    const pubSection = sections.find(s => s.sectionKey === 'publications_list');
    if (pubSection) {
      if (pubSection.title) pageTitle = pubSection.title;
      if (pubSection.subtitle) pageSubtitle = pubSection.subtitle;
      if (pubSection.content?.items?.length) {
        pubItems = pubSection.content.items;
      }
    }
  }

  const years = [...new Set(pubItems.map((p) => p.year))].sort((a, b) => b - a);

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-gradient py-20">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
            Research
          </span>
          <h1 className="font-heading text-5xl font-extrabold text-white mb-6">
            {pageTitle}
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {pageSubtitle}
          </p>
        </div>
      </section>

      {/* Publications */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-4xl">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : pubItems.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No publications found</h3>
              <p className="text-gray-500">Publications will appear here once added via the dashboard.</p>
            </div>
          ) : (
            <>
              {years.map((year) => (
                <div key={year} className="mb-12">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-heading text-2xl font-bold text-primary-800">{year}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="space-y-4">
                    {pubItems
                      .filter((p) => p.year === year)
                      .map((pub, i) => (
                        <div key={pub.id || i} className="card p-6 border border-gray-100">
                          <h3 className="font-semibold text-gray-900 mb-2 leading-snug">
                            {pub.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-1">{pub.authors}</p>
                          <p className="text-sm text-primary-700 font-medium mb-4">{pub.journal}</p>
                          <div className="flex gap-3">
                            <a
                              href={pub.doi || '#'}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-primary-300 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View DOI
                            </a>
                            <a
                              href={pub.doi || '#'}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-primary-300 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> PDF
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
