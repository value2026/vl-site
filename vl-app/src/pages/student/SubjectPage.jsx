import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, FlaskConical, Loader2 } from 'lucide-react';
import StudentNav from '../../components/student/StudentNav';
import { api, getSlug } from '../../utils/api';

export default function SubjectPage() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [subRes, labsRes] = await Promise.all([
          api.get('/subjects'),
          api.get(`/labs?subjectId=${subjectId}`),
        ]);
        if (subRes.ok && labsRes.ok) {
          const subjects = await subRes.json();
          const currentSub = subjects.find((s) => s.id === subjectId);
          setSubject(currentSub);
          setLabs(await labsRes.json());
        }
      } catch (err) {
        console.error('Failed to load subject page data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-gray-900 font-bold text-xl mb-2">Subject Not Found</h2>
          <Link to="/student" className="text-blue-600 hover:underline text-sm">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const totalExperiments = labs.reduce((sum, l) => sum + (l._count?.experiments || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav breadcrumb={[{ label: subject.title }]} />

      <main className="pt-14">
        {/* Subject hero */}
        <div className={`bg-gradient-to-br ${subject.gradient} px-6 py-12 relative overflow-hidden`}>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-black/10 rounded-full pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10">
            <Link to="/student" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-5 transition-colors">
              ← Back to Subjects
            </Link>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl shadow-xl">
                {subject.icon}
              </div>
              <div>
                <h1 className="text-white text-3xl font-bold">{subject.title}</h1>
                <p className="text-white/80 text-base mt-1 max-w-xl">{subject.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30">
                    <FlaskConical className="w-3.5 h-3.5" /> {labs.length} Labs
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30">
                    {totalExperiments} Experiments
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Labs grid */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-gray-900 font-bold text-xl mb-1">Available Labs</h2>
          <p className="text-gray-500 text-sm mb-7">Select a lab to see the experiments</p>

          {labs.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl p-8">
              <div className="text-5xl mb-4">🔬</div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">No labs available</h3>
              <p className="text-gray-500 text-sm">Labs for this subject will appear here once added.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {labs.map((lab) => (
                <Link
                  key={lab.id}
                  to={`/lab/${lab.id}`}
                  className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                    {lab.icon}
                  </div>
                  <h3 className="text-gray-900 font-bold text-base mb-2 truncate">{lab.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3">{lab.description}</p>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{lab._count?.experiments || 0} experiments</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
