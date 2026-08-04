import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ChevronRight, Play, Loader2 } from 'lucide-react';
import StudentNav from '../../components/student/StudentNav';
import { api, getSlug } from '../../utils/api';

const DIFFICULTY_STYLE = {
  Beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced:     'bg-rose-50 text-rose-700 border-rose-200',
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-gray-900 font-bold text-xl mb-2">Lab Not Found</h2>
          <Link to="/labs" className="text-blue-600 hover:underline text-sm">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const subject = lab.subject;

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav
        breadcrumb={[
          { label: subject?.title || 'Subject', to: `/subject/${lab.subjectId || subject?.id}` },
          { label: lab.title },
        ]}
      />

      <main className="pt-14">
        {/* Lab header */}
        <div className="bg-white border-b border-gray-200 px-6 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                {lab.icon}
              </div>
              <div>
                <h1 className="text-gray-900 text-2xl font-bold">{lab.title}</h1>
                <p className="text-gray-500 text-sm mt-1 max-w-xl">{lab.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-50 text-blue-600 border-blue-100`}>
                    {subject?.title}
                  </span>
                  <span className="text-xs text-gray-400">{experiments.length} Experiments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Experiments list */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-gray-900 font-bold text-lg mb-5">Experiments</h2>

          {experiments.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl p-8">
              <div className="text-5xl mb-4">⚗️</div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">No experiments available</h3>
              <p className="text-gray-500 text-sm">Experiments for this lab will appear here once added.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {experiments.map((exp, index) => (
                <Link
                  key={exp.id}
                  to={`/experiment/${exp.id}`}
                  className="group flex flex-col bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Top: Number and Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold bg-gradient-to-br ${subject?.gradient || 'from-blue-600 to-indigo-700'} text-white shadow-sm`}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${DIFFICULTY_STYLE[exp.difficulty] || 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                      {exp.difficulty}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 mb-5">
                    <h3 className="text-gray-900 font-bold text-[15px] mb-2 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                      {exp.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                      {exp.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> {exp.duration}
                    </span>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300">
                        Start <Play className="w-3 h-3 fill-current" />
                      </span>
                      <div className="w-6 h-6 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
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
