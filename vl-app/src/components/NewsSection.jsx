import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, X } from 'lucide-react';
import { useState } from 'react';

const DEFAULT_ITEMS = [
  {
    id: '1',
    title: 'Virtual Labs Reaches 5 Million Students Milestone',
    excerpt: 'The platform celebrates a major milestone as student registrations surpass 5 million across India, marking significant growth in digital education adoption.',
    date: 'June 28, 2025',
    category: 'Milestone',
    href: '/news/5-million-milestone',
  },
  {
    id: '2',
    title: 'New Physics Lab Collaboration with IIT Madras',
    excerpt: 'A groundbreaking partnership brings 24 new quantum mechanics experiments to the platform.',
    date: 'June 15, 2025',
    category: 'Partnership',
    href: '/news/iit-madras-physics',
  },
  {
    id: '3',
    title: 'Annual Workshop on Virtual Lab Integration',
    excerpt: '300+ educators participate in the annual workshop on integrating virtual labs into curricula.',
    date: 'June 3, 2025',
    category: 'Workshop',
    href: '/news/annual-workshop-2025',
  },
  {
    id: '4',
    title: 'Mobile App Beta Launch for Android',
    excerpt: 'Virtual Labs launches its first mobile application, bringing experiments to smartphones.',
    date: 'May 20, 2025',
    category: 'Technology',
    href: '/news/mobile-app-beta',
  },
];

const CATEGORY_COLORS = {
  Milestone:   'bg-purple-100 text-purple-700',
  Partnership: 'bg-blue-100 text-blue-700',
  Workshop:    'bg-amber-100 text-amber-700',
  Technology:  'bg-green-100 text-green-700',
  Announcement:'bg-red-100 text-red-700',
};

export default function NewsSection({ sectionTitle, sectionSubtitle, content = {} }) {
  const items = content.items?.length ? [...content.items].reverse() : DEFAULT_ITEMS;
  const heading    = sectionTitle || 'News & Events';
  const tag        = content.sectionTag || 'Latest Updates';
  const viewAllHref = content.viewAllHref || '/news';
  
  const [selectedNews, setSelectedNews] = useState(null);

  return (
    <section className="py-24 bg-gray-50 relative" aria-labelledby="news-heading">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="tag">{tag}</span>
            <h2 id="news-heading" className="section-title mt-4 mb-0">
              {heading}
            </h2>
          </div>
          <Link
            to={viewAllHref}
            className="inline-flex items-center gap-2 text-primary-800 font-semibold hover:underline text-sm whitespace-nowrap"
          >
            View All News
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured news — first item larger */}
          {items.length > 0 && (
            <div className="lg:col-span-2">
              <button
                onClick={() => setSelectedNews(items[0])}
                className="w-full text-left card group block h-full overflow-hidden border border-primary-100 hover:border-transparent bg-gradient-to-br from-primary-50 to-white"
              >
                <div className="grid md:grid-cols-5 h-full">
                  {items[0].imageUrl && (
                    <div className="md:col-span-2 relative h-56 md:h-full overflow-hidden">
                      <img 
                        src={items[0].imageUrl} 
                        alt={items[0].title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className={`p-8 flex flex-col justify-center ${items[0].imageUrl ? 'md:col-span-3' : 'md:col-span-5'}`}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[items[0].category] || 'bg-gray-100 text-gray-700'}`}>
                        {items[0].category}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {items[0].date}
                      </span>
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-800 transition-colors leading-snug">
                      {items[0].title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed mb-6">{items[0].excerpt}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800">
                      Read More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Remaining news — stacked */}
          <div className="flex flex-col gap-4">
            {items.slice(1, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="w-full text-left card group flex gap-4 p-5 border border-gray-100 hover:border-transparent overflow-hidden"
              >
                {item.imageUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-700'}`}>
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 group-hover:text-primary-800 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
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

            <div className="p-8 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${CATEGORY_COLORS[selectedNews.category] || 'bg-gray-100 text-gray-700'}`}>
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
              
              <div className="prose prose-primary max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {selectedNews.excerpt}
                </p>
                {/* Additional content could go here if it existed in the DB */}
              </div>
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
    </section>
  );
}
