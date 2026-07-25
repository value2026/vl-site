import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api, getSlug } from '../utils/api';

const THEMES = [
  { icon: '💻', color: 'from-blue-500 to-indigo-600', cardBg: 'bg-[#F7FAFF]', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-600', badgeBorder: 'border-indigo-100', textColor: 'text-indigo-600' },
  { icon: '⚗️', color: 'from-cyan-400 to-blue-600', cardBg: 'bg-[#F7FCFF]', badgeBg: 'bg-cyan-50', badgeText: 'text-cyan-600', badgeBorder: 'border-cyan-100', textColor: 'text-cyan-600' },
  { icon: '⚛️', color: 'from-emerald-400 to-teal-600', cardBg: 'bg-[#F8FFF9]', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-600', badgeBorder: 'border-emerald-100', textColor: 'text-emerald-600' },
  { icon: '🧬', color: 'from-orange-400 to-amber-600', cardBg: 'bg-[#FFFDF7]', badgeBg: 'bg-orange-50', badgeText: 'text-orange-600', badgeBorder: 'border-orange-100', textColor: 'text-orange-600' },
  { icon: '⚙️', color: 'from-rose-400 to-red-600', cardBg: 'bg-[#FFF5F5]', badgeBg: 'bg-rose-50', badgeText: 'text-rose-600', badgeBorder: 'border-rose-100', textColor: 'text-rose-600' },
  { icon: '⚡', color: 'from-purple-500 to-fuchsia-600', cardBg: 'bg-[#F9F5FF]', badgeBg: 'bg-purple-50', badgeText: 'text-purple-600', badgeBorder: 'border-purple-100', textColor: 'text-purple-600' },
];

export default function LabCategories({ sectionTitle, sectionSubtitle, content = {} }) {
  const heading  = sectionTitle || 'Explore Virtual Labs by Discipline';
  const subtitle = sectionSubtitle || 'Discover immersive virtual laboratories across engineering, science, and technology disciplines.';
  const tag      = content.sectionTag || 'Disciplines';

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <section className="py-[72px]" style={{ background: 'radial-gradient(circle at top, #eef4ff 0, #ffffff 60%)' }} aria-labelledby="labs-heading">
      <div className="container-custom">
        <div className="text-center">
          <span className="tag">{tag}</span>
          <h2 id="labs-heading" className="section-title mt-4">
            {heading}
          </h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-[50px]">
            {subjects.map((subject, index) => {
              const theme = THEMES[index % THEMES.length];
              const labCount = subject.categories?.length || 0;
              const badgeLabel = labCount > 0 ? `${labCount} Labs` : 'Available Soon';

              return (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.id}`}
                  className={`border border-slate-200 transition-all duration-300 shadow-[0_12px_40px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] hover:-translate-y-2 rounded-[20px] group p-7 flex flex-col h-[340px] ${theme.cardBg}`}
                >
                  {/* Icon row */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.color} shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                      <span className="text-2xl text-white drop-shadow-sm">{theme.icon}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                      {badgeLabel}
                    </div>
                  </div>

                  {/* Title & Meta */}
                  <div className="mb-4">
                    <h3 className="font-heading text-[22px] font-bold text-[#0F172A] mb-1.5 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                      {subject.title}
                    </h3>
                    <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase line-clamp-1">
                      {subject.tags?.join(' • ') || 'Interactive • Simulations'}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[#475569] text-[13.5px] leading-relaxed flex-1 mb-6 line-clamp-3">
                    {subject.description || 'Learn through interactive simulations, virtual experiments, and guided activities.'}
                  </p>

                  {/* CTA */}
                  <div className={`flex items-center gap-2 text-[14px] font-bold ${theme.textColor} group-hover:gap-3 transition-all`}>
                    View Laboratories
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Labs button hidden until /labs is ready
        <div className="mt-12 text-center">
          <Link to="/labs" className="btn-outline-primary">
            <FlaskConical className="w-4 h-4" />
            View All Labs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        */}
      </div>
    </section>
  );
}
