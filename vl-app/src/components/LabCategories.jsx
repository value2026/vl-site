import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const THEMES = [
  { icon: '🧬', color: 'from-green-500 to-emerald-700', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { icon: '⚗️', color: 'from-blue-500 to-cyan-700', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' },
  { icon: '⚛️', color: 'from-purple-500 to-violet-700', bgColor: 'bg-violet-50', textColor: 'text-violet-700', borderColor: 'border-violet-200' },
  { icon: '💻', color: 'from-orange-500 to-red-600', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
  { icon: '⚙️', color: 'from-gray-500 to-slate-700', bgColor: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-200' },
  { icon: '⚡', color: 'from-yellow-500 to-amber-600', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
];

export default function LabCategories({ sectionTitle, sectionSubtitle, content = {} }) {
  const heading  = sectionTitle || 'Explore Virtual Lab Categories';
  const subtitle = sectionSubtitle || 'From biotechnology to mechanical engineering — we cover every core STEM discipline.';
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
    <section className="py-24 bg-white" aria-labelledby="labs-heading">
      <div className="container-custom">
        <div className="text-center mb-16">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => {
              const theme = THEMES[index % THEMES.length];
              return (
                <Link
                  key={subject.id}
                  to={`/student/subject/${subject.id}`}
                  className="card group p-7 flex flex-col border border-gray-100 hover:border-transparent"
                >
                  {/* Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 ${theme.bgColor} ${theme.borderColor} border rounded-2xl flex items-center justify-center text-3xl`}>
                      {theme.icon}
                    </div>
                    <span className={`text-xs font-semibold ${theme.textColor} ${theme.bgColor} px-2.5 py-1 rounded-full`}>
                      {subject._count?.labs || 0} labs
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-lg font-bold text-gray-900 mb-3 leading-snug group-hover:text-primary-800 transition-colors">
                    {subject.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-6">
                    {subject.description || 'Explore interactive virtual experiments in this discipline.'}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary-800 group-hover:gap-3 transition-all">
                    Explore Labs
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Bottom gradient bar */}
                  <div className={`mt-5 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${theme.color} rounded-full transition-all duration-500`} />
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
