import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowRight, FlaskConical, Loader2, History, Play, 
  TrendingUp, Clock, Award, CheckCircle, Sparkles, BookOpen, ClipboardList
} from 'lucide-react';
import StudentNav from '../../components/student/StudentNav';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

// ── Stat Card Component (Used inside the sidebar) ─────────────
function PerformanceCard({ icon: Icon, iconColor, label, value, subText, badgeText }) {
  return (
    <div className="relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden group">
      {/* Background soft glow decoration */}
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        {badgeText && (
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {badgeText}
          </span>
        )}
      </div>

      <div className="mt-4 relative z-10">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        <div className="text-xs font-semibold text-slate-500 mt-1">{label}</div>
        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{subText}</p>
      </div>
    </div>
  );
}

export default function StudentHome() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  // 1. Fetch Subjects list
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['student-subjects'],
    queryFn: () => api.get('/subjects').then(r => r.json()),
  });

  // 2. Fetch student performance/activities (only if student)
  const { data: perfData, isLoading: perfLoading } = useQuery({
    queryKey: ['student-performance'],
    queryFn: () => api.get('/analytics/my-performance').then(r => r.json()),
    enabled: isStudent,
  });

  // 3. Fetch upcoming assignments (only if student)
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: () => api.get('/assignments/my-assignments').then(r => r.json()),
    enabled: isStudent,
  });

  const upcomingExams = Array.isArray(assignments)
    ? assignments.filter(a => a.status === 'active' || a.status === 'yet_to_start').slice(0, 3)
    : [];

  const totalLabs = subjects.reduce((sum, s) => sum + (s._count?.labs || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <StudentNav />

      {/* Main Container — Full page layout */}
      <main className="pt-14 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 w-full max-w-[1600px] mx-auto">
        
        {/* Hero Section (Only for Students) */}
        {isStudent && (
          <div className="bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden mt-6 mb-8 border border-slate-800">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 max-w-2xl">
                <div className="w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl flex-shrink-0 animate-pulse">
                  🔬
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 backdrop-blur border border-indigo-400/30 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Virtual Learning Workspace
                  </div>
                  <h1 className="text-white text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
                    Welcome back, {user?.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    Your personalized dashboard tracking active labs, completion records, and simulation analytics. Get started or continue your saved experiments.
                  </p>
                </div>
              </div>

              {/* Quick stats board in hero */}
              <div className="flex flex-wrap md:flex-nowrap gap-4 flex-shrink-0">
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 text-center min-w-[120px] flex-1 md:flex-initial">
                  <div className="text-white text-3xl font-extrabold">{subjects.length}</div>
                  <div className="text-slate-400 text-xs mt-1">Subjects</div>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 text-center min-w-[120px] flex-1 md:flex-initial">
                  <div className="text-white text-3xl font-extrabold">{totalLabs}</div>
                  <div className="text-slate-400 text-xs mt-1">Labs</div>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 text-center min-w-[120px] flex-1 md:flex-initial">
                  <div className="text-emerald-400 text-3xl font-extrabold">{perfData?.analytics?.completionRate || 0}%</div>
                  <div className="text-slate-400 text-xs mt-1">Completion</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8 items-start">
          
          {/* LEFT 3-COLUMNS AREA (Active Workspace, Resume and Subjects) */}
          <div className={isStudent ? "lg:col-span-3 space-y-8" : "lg:col-span-4 space-y-8"}>
            
            {/* Resume Experiments List (Only for Students) */}
            {isStudent && !perfLoading && perfData?.resumeExperiments?.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-600" />
                      Resume Experiments
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">Pick up exactly where you left off on your latest simulations</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    {perfData.resumeExperiments.length} Pending
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {perfData.resumeExperiments.map((exp) => (
                    <div 
                      key={exp.id}
                      className="group flex flex-col justify-between p-5 bg-slate-50/50 border border-slate-100 hover:border-indigo-200 hover:bg-white rounded-2xl hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0 font-bold shadow-sm">
                          🔬
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-slate-900 font-bold text-sm leading-snug group-hover:text-indigo-600 transition-colors truncate">
                            {exp.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-semibold text-slate-400">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{exp.duration}</span>
                            <span>•</span>
                            <span className="bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{exp.difficulty}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Last visited recently</span>
                        <Link
                          to={`/student/experiment/${exp.id}`}
                          className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          Resume <Play className="w-3.5 h-3.5 fill-current" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Exploration Cards */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Explore Subjects
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">Select a discipline below to browse virtual laboratory categories</p>
              </div>

              {subjectsLoading ? (
                <div className="flex justify-center py-20 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-2xl p-8">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-slate-900 font-bold text-lg mb-1">No subjects available</h3>
                  <p className="text-slate-500 text-sm">Please check back later or contact your administrator.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {subjects.map((subject) => {
                    const labCount = subject._count?.labs || 0;
                    return (
                      <Link
                        key={subject.id}
                        to={`/student/subject/${subject.id}`}
                        className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full"
                      >
                        {/* Colorful top gradient line */}
                        <div className={`h-1.5 bg-gradient-to-r ${subject.gradient}`} />

                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`w-12 h-12 bg-gradient-to-br ${subject.gradient} rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>
                                {subject.icon}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-slate-900 font-extrabold text-sm leading-tight group-hover:text-indigo-600 transition-colors truncate">{subject.title}</h3>
                                <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                  {labCount} Labs
                                </span>
                              </div>
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-6">
                              {subject.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Core Discipline</span>
                            <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:gap-2 transition-all">
                              View Labs <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 1-COLUMN AREA (Analytics Panel - Only for students) */}
          {isStudent && (
            <div className="space-y-6">
              
              {/* Upcoming Exams Card */}
              {!assignmentsLoading && upcomingExams.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <div className="mb-4 pb-4 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-slate-900 font-extrabold text-sm flex items-center gap-2">
                      <ClipboardList className="w-4.5 h-4.5 text-indigo-600" />
                      Upcoming Exams
                    </h2>
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{upcomingExams.length}</span>
                  </div>
                  <div className="space-y-3">
                    {upcomingExams.map((exam) => (
                      <Link 
                        key={exam.id}
                        to={`/student/assignments/take/${exam.id}`}
                        className="block bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all"
                      >
                        <h3 className="text-slate-900 font-bold text-sm mb-1">{exam.title}</h3>
                        <p className="text-slate-500 text-xs mb-3 line-clamp-1">{exam.questionPaper?.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-indigo-600 text-[10px] font-bold uppercase">
                            {new Date(exam.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full">
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}


              {/* Activity Logs (Recent 4) */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="mb-5 pb-5 border-b border-slate-50">
                  <h2 className="text-slate-900 font-extrabold text-sm flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-indigo-600" />
                    Activity Log
                  </h2>
                </div>
                {perfLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-slate-400 animate-spin" /></div>
                ) : perfData?.recentVisits?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">No recent activity</div>
                ) : (
                  <div className="space-y-4">
                    {perfData?.recentVisits?.slice(0, 4).map((visit, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5" />
                          {i !== 3 && <div className="w-0.5 h-full bg-slate-100 mt-2" />}
                        </div>
                        <div className="pb-4">
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">{visit.experiment?.title}</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {new Date(visit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>


            </div>
          )}

        </div>

      </main>
    </div>
  );
}
