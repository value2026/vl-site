import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ChevronRight, Play, Loader2, Filter, ChevronDown, FlaskConical, ArrowRight, Monitor } from 'lucide-react';
import StudentNav from '../../components/student/StudentNav';
import { api, getSlug } from '../../utils/api';

const DIFFICULTY_STYLE = {
  Beginner:     'bg-emerald-50 text-emerald-600',
  Intermediate: 'bg-amber-50 text-amber-600',
  Advanced:     'bg-rose-50 text-rose-600',
};

export default function LabPage() {
  const { labId } = useParams();
  const [lab, setLab] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [labsRes, expsRes] = await Promise.all([
          api.get('/labs'),
          api.get(`/experiments?labId=${labId}`),
        ]);
        if (labsRes.ok && expsRes.ok) {
          const labsList = await labsRes.json();
          const currentLab = labsList.find((l) => l.id === labId);
          setLab(currentLab);
          setExperiments(await expsRes.json());
        }
      } catch (err) {
        console.error('Failed to load lab page data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [labId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-gray-900 font-bold text-xl mb-2">Lab Not Found</h2>
          <Link to="/labs" className="text-indigo-600 hover:underline text-sm">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const subject = lab.subject;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-12">
      <StudentNav
        breadcrumb={[
          { label: subject?.title || 'Subject', to: `/subject/${lab.subjectId || subject?.id}` },
          { label: lab.title },
        ]}
      />

      <main className="pt-16 md:pt-20">
        {/* Lab Header Container */}
        <div className="max-w-[1400px] mx-auto px-6 mb-8">
          {/* Header Card with soft gradient */}
          <div className="bg-gradient-to-r from-white via-[#FCFBFF] to-[#F1F0FD] rounded-2xl p-6 lg:p-8 shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#E9E4FC] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative z-10 max-w-3xl w-full">
              <div className="flex items-start gap-5 md:gap-7">
                {/* Lab Icon */}
                <div className={`w-16 h-16 md:w-[76px] md:h-[76px] rounded-2xl flex items-center justify-center text-3xl md:text-[34px] shadow-md flex-shrink-0 bg-gradient-to-br ${subject?.gradient || 'from-[#6A4BFF] to-[#4524ED]'} text-white shadow-indigo-500/20`}>
                  {lab.icon || '⚛️'}
                </div>
                <div className="flex-1 mt-0.5">
                  <h1 className="text-[#0B0914] text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">{lab.title}</h1>
                  <p className="text-[#646A7E] text-sm md:text-[15px] font-medium leading-relaxed mb-4 max-w-[620px]">{lab.description}</p>
                  
                  {/* Badges */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#EEECFC] text-[#5538EE] flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5" />
                      {subject?.title || 'Computer Science'}
                    </span>
                    <span className="text-xs font-bold text-[#646A7E] flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-[#8C93A8]" /> {experiments.length} Experiments
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Right Side Graphic (Dynamic & Subject-Aware) */}
            <div className="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 z-0 w-60 h-60 items-center justify-center pointer-events-none">
              {/* Dynamic Subject Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${subject?.gradient || 'from-[#6A4BFF] to-[#4524ED]'} rounded-full blur-[70px] opacity-20`}></div>
              
              {lab.imageUrl ? (
                <img 
                  src={lab.imageUrl.startsWith('http') ? lab.imageUrl : import.meta.env.BASE_URL + lab.imageUrl.replace(/^\//, '')} 
                  alt="Lab Illustration" 
                  className="w-60 h-60 object-contain relative z-10 drop-shadow-xl" 
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Floating glass rings */}
                  <div className="absolute w-48 h-48 rounded-full border border-white/60 bg-white/30 backdrop-blur-md shadow-[0_12px_40px_rgb(0,0,0,0.08)] flex items-center justify-center">
                    <div className="w-30 h-30 rounded-full border border-white/50 bg-white/40 shadow-inner flex items-center justify-center">
                       <div className="text-5xl drop-shadow-lg opacity-90">
                         {lab.icon || '⚛️'}
                       </div>
                    </div>
                  </div>
                  
                  {/* Decorative Subject Orbs */}
                  <div className={`absolute top-6 right-8 w-6 h-6 rounded-full bg-gradient-to-br ${subject?.gradient || 'from-[#6A4BFF] to-[#4524ED]'} shadow-lg opacity-80 blur-[1px]`}></div>
                  <div className={`absolute bottom-10 left-6 w-3.5 h-3.5 rounded-full bg-gradient-to-br ${subject?.gradient || 'from-[#6A4BFF] to-[#4524ED]'} shadow-md opacity-60`}></div>
                  <div className={`absolute top-1/2 -right-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br ${subject?.gradient || 'from-[#6A4BFF] to-[#4524ED]'} shadow-sm opacity-50`}></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Experiments Section */}
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-slate-900 font-extrabold text-xl flex items-center gap-2.5">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
              Experiments
            </h2>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <Filter className="w-3.5 h-3.5 text-indigo-500" /> Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                Sort by: Order <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grid */}
          {experiments.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="text-4xl mb-3">⚗️</div>
              <h3 className="text-slate-900 font-bold text-lg mb-1">No experiments available</h3>
              <p className="text-slate-500 text-sm">Experiments for this lab will appear here once added.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {experiments.map((exp, index) => (
                <Link
                  key={exp.id}
                  to={`/experiment/${exp.id}`}
                  className="group flex flex-col bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Decorative background squiggle */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-slate-50 to-transparent opacity-50 pointer-events-none rounded-bl-full" />

                  {/* Top Row: Number and Badge */}
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold bg-[#2D1B69] text-white shadow-md">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${DIFFICULTY_STYLE[exp.difficulty] || 'bg-slate-100 text-slate-500'}`}>
                      {exp.difficulty}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-[16px] font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug relative z-10">
                    {exp.title}
                  </h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-3 mb-4 flex-1 relative z-10">
                    {exp.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto relative z-10">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> {exp.duration}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
