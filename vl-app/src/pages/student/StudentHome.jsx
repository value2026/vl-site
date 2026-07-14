import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical, Loader2 } from 'lucide-react';
import StudentNav from '../../components/student/StudentNav';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

export default function StudentHome() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/subjects');
        if (res.ok) {
          setSubjects(await res.json());
        }
      } catch (err) {
        console.error('Failed to load subjects', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalLabs = subjects.reduce((sum, s) => sum + (s._count?.labs || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav />

      <main className="pt-14">
        {/* Hero / Welcome */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-12 relative overflow-hidden">
          {/* Orbs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
                🎓
              </div>
              <div>
                <h1 className="text-white text-3xl font-bold mb-1">
                  Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-slate-400 text-base">
                  Your virtual laboratory is ready. Choose a subject to start exploring.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Student
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur text-slate-300 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                    <FlaskConical className="w-3.5 h-3.5" /> {subjects.length} Subjects · {totalLabs} Labs Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject grid */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-gray-900 font-bold text-xl mb-1">Choose a Subject Area</h2>
          <p className="text-gray-500 text-sm mb-7">Select a broad area to explore labs and experiments</p>

          {loading ? (
            <div className="flex justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl p-8">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">No subjects available</h3>
              <p className="text-gray-500 text-sm">Please check back later or contact your administrator.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((subject) => {
                const labCount = subject._count?.labs || 0;
                return (
                  <Link
                    key={subject.id}
                    to={`/student/subject/${subject.id}`}
                    className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Gradient header strip */}
                    <div className={`h-2 bg-gradient-to-r ${subject.gradient}`} />

                    <div className="p-6 flex-1 flex flex-col">
                      {/* Icon + title */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${subject.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                          {subject.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-gray-900 font-bold text-base leading-tight truncate">{subject.title}</h3>
                          <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            {labCount} Labs
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3">{subject.description}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400">{labCount} labs available</span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                          Explore <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick tip */}
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">💡</div>
            <div>
              <div className="text-blue-900 font-semibold text-sm">Getting Started</div>
              <div className="text-blue-700 text-sm mt-0.5">
                Each experiment has 9 sections: Aim, Theory, Pretest, Procedure, Simulation, Posttest, References, Contributors and Feedback. Complete them in order for the best learning experience.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
