import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { news, categoryColors } from '../data/news';

export default function NewsSection() {
  return (
    <section className="py-24 bg-gray-50" aria-labelledby="news-heading">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="tag">Latest Updates</span>
            <h2 id="news-heading" className="section-title mt-4 mb-0">
              News & Events
            </h2>
          </div>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-primary-800 font-semibold hover:underline text-sm whitespace-nowrap"
          >
            View All News
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured news — first item larger */}
          <div className="lg:col-span-2">
            <Link
              to={news[0].href}
              className="card group block h-full p-8 bg-gradient-to-br from-primary-50 to-white border border-primary-100 hover:border-transparent"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[news[0].category]}`}>
                  {news[0].category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {news[0].date}
                </span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-800 transition-colors leading-snug">
                {news[0].title}
              </h3>
              <p className="text-gray-500 leading-relaxed mb-6">{news[0].excerpt}</p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800">
                Read More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Remaining news — stacked */}
          <div className="flex flex-col gap-4">
            {news.slice(1, 4).map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="card group flex gap-4 p-5 border border-gray-100 hover:border-transparent"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[item.category]}`}>
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
