import { Calendar, ArrowRight, Loader2, X } from 'lucide-react';
import { news as defaultNews, categoryColors } from '../data/news';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

async function fetchHomeSections() {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pages/home/sections`);
  if (!res.ok) throw new Error('Failed to fetch home sections');
  return res.json();
}

export default function News() {
  const { data: sections, isLoading } = useQuery({
    queryKey: ['home-sections'],
    queryFn: fetchHomeSections,
    staleTime: 60_000,
    retry: 1,
  });

  const [selectedNews, setSelectedNews] = useState(null);

  let newsItems = defaultNews;
  let pageTitle = "News & Events";
  let pageSubtitle = "Stay updated with the latest announcements, workshops, and milestones from the Virtual Labs initiative.";

  if (sections) {
    const newsSection = sections.find(s => s.sectionKey === 'news');
    if (newsSection) {
      if (newsSection.title) pageTitle = newsSection.title;
      if (newsSection.subtitle) pageSubtitle = newsSection.subtitle;
      if (newsSection.content?.items?.length) {
        newsItems = [...newsSection.content.items].reverse();
      }
    }
  }

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-gradient py-20">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
            Updates
          </span>
          <h1 className="font-heading text-5xl font-extrabold text-white mb-6">
            {pageTitle}
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {pageSubtitle}
          </p>
        </div>
      </section>

      {/* News List */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-4xl">
          {isLoading ? (
             <div className="flex justify-center items-center py-20">
               <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
             </div>
          ) : (
            <div className="space-y-6">
              {newsItems.map((item, index) => (
                <div key={item.id || index} className="card p-6 md:p-8 border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow">
                  {item.imageUrl && (
                    <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          categoryColors[item.category] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {item.date}
                      </span>
                    </div>
                    
                    <h3 className="font-heading text-2xl font-bold text-gray-900 mb-3 leading-snug">
                      <button
                        onClick={() => setSelectedNews(item)}
                        className="hover:text-primary-600 transition-colors text-left"
                      >
                        {item.title}
                      </button>
                    </h3>
                    
                    <p className="text-gray-600 mb-5 leading-relaxed">
                      {item.excerpt}
                    </p>
                    
                    <button
                      onClick={() => setSelectedNews(item)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      Read more <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News Detail Modal */}
      {selectedNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelectedNews(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
            
            <div className="relative">
              {selectedNews.imageUrl ? (
                <div className="h-64 w-full">
                  <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 w-full bg-gradient-to-r from-primary-600 to-primary-900" />
              )}
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColors[selectedNews.category] || 'bg-gray-100 text-gray-700'}`}>
                  {selectedNews.category}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {selectedNews.date}
                </span>
              </div>
              
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6 leading-tight">
                {selectedNews.title}
              </h2>
              
              <p className="text-gray-700 text-lg leading-relaxed">
                {selectedNews.excerpt}
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
