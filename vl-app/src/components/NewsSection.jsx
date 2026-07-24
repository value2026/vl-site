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
  Milestone:   'bg-purple-50 text-purple-700 border-purple-100',
  Partnership: 'bg-blue-50 text-blue-700 border-blue-100',
  Workshop:    'bg-amber-50 text-amber-700 border-amber-100',
  Technology:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  Announcement:'bg-rose-50 text-rose-700 border-rose-100',
};

export default function NewsSection({ sectionTitle, sectionSubtitle, content = {} }) {
  const items = content.items?.length ? [...content.items].reverse() : DEFAULT_ITEMS;
  const heading    = sectionTitle || 'News & Events';
  const tag        = content.sectionTag || 'Latest Updates';
  const viewAllHref = content.viewAllHref || '/news';
  
  const [selectedNews, setSelectedNews] = useState(null);

  return (
    <section className="py-[100px] bg-[#F8FAFC] relative" aria-labelledby="news-heading">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-900 text-[0.75rem] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.15em] mb-3 shadow-sm border border-orange-100">
              📰 {tag}
            </span>
            <h2 id="news-heading" className="text-4xl sm:text-[48px] font-heading font-extrabold text-[#0F172A] mb-3 tracking-tight">
              {heading}
            </h2>
            <p className="text-lg text-[#64748B]">Stay updated with the latest Virtual Labs news.</p>
          </div>
          <Link
            to={viewAllHref}
            className="group flex items-center gap-2 text-[#7A1632] font-semibold text-sm whitespace-nowrap pb-1 relative"
          >
            <span className="relative">
              View All News
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#7A1632] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>        <div className="premium-card rounded-3xl mt-[48px] flex flex-col lg:flex-row overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          {/* Left: Featured News */}
          {items.length > 0 && (
            <div className="lg:w-[65%] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
              <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-slate-100">
                <img 
                  src={items[0].imageUrl || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop'} 
                  alt={items[0].title} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="p-8 sm:p-12 flex flex-col items-start flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[items[0].category] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {items[0].category}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                    <Calendar className="w-4 h-4" />
                    {items[0].date}
                  </span>
                </div>
                <h3 className="font-heading text-2xl sm:text-[28px] font-bold text-[#0F172A] mb-4 leading-snug">
                  {items[0].title}
                </h3>
                <p className="text-[#64748B] text-base leading-relaxed mb-8 max-w-2xl">
                  {items[0].excerpt}
                </p>
                <button
                  onClick={() => setSelectedNews(items[0])}
                  className="mt-auto inline-flex items-center gap-2 border-2 border-[#7A1632] text-[#7A1632] hover:bg-[#7A1632] hover:text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 group"
                >
                  Read Article
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* Right: Latest News Feed */}
          <div className="lg:w-[35%] flex flex-col bg-white">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-heading font-bold text-lg text-[#0F172A]">Latest News</h3>
            </div>
            <div className="flex flex-col h-full">
              {items.slice(1, 5).map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className={`flex-1 text-left p-6 group flex flex-col justify-center transition-all duration-300 hover:bg-slate-50 hover:pl-8 ${idx !== items.slice(1, 5).length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-[#0F172A] text-base leading-snug mb-2 group-hover:text-[#7A1632] transition-colors">
                    {item.title}
                  </h4>
                  <span className="flex items-center gap-1 text-[13px] text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div> </div>
      

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
