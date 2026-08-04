import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowRight, FlaskConical, Loader2, History, Play, 
  TrendingUp, Clock, Award, CheckCircle, Sparkles, BookOpen, ClipboardList, Compass
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
  const [showAllActivities, setShowAllActivities] = useState(false);
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
    <div className="min-h-screen bg-[#F4F7FE]">
      <StudentNav />

      {/* Main Container — Full page layout */}
      <main className="pt-14 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 w-full max-w-[1600px] mx-auto">
        
        {/* Hero Section (Only for Students) */}
        {isStudent && (
          <div className="bg-[#0B0A1A] rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden mt-4 mb-6 border border-white/5">
            {/* Background elements (space-like gradient/glow) */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 opacity-80 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-600/10 to-transparent rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 opacity-50 pointer-events-none" />
            
            {/* Faux orbit rings for design */}
            <div className="absolute top-1/2 right-1/4 w-[300px] h-[80px] border border-white/5 rounded-[100%] -rotate-12 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-[500px] h-[120px] border border-white/5 rounded-[100%] -rotate-12 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5 max-w-2xl">
                <div className="w-14 h-14 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-2xl flex-shrink-0">
                  🔬
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 tracking-wide">
                    <Sparkles className="w-3 h-3" /> Learning Workspace
                  </div>
                  <h1 className="text-white text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
                    Welcome back, {user?.name?.split(' ')[0]}! <span className="inline-block animate-wave">👋</span>
                  </h1>
                  <p className="text-slate-300/80 text-[13px] md:text-sm leading-relaxed font-light">
                    Your personalized dashboard tracking active labs, completion records, and simulation analytics. Get started or continue your saved experiments.
                  </p>
                </div>
              </div>

              {/* Quick stats board in hero */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3 flex-shrink-0">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center min-w-[100px] flex-1 sm:flex-initial transition-all hover:bg-white/10">
                  <div className="w-9 h-9 mx-auto mb-2 flex items-center justify-center bg-white/5 rounded-xl">
                    <FlaskConical className="w-4.5 h-4.5 text-indigo-300" />
                  </div>
                  <div className="text-white text-2xl font-extrabold tracking-tight">{totalLabs}</div>
                  <div className="text-slate-400 text-[10px] font-medium mt-1 uppercase tracking-wider">Labs</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center min-w-[100px] flex-1 sm:flex-initial transition-all hover:bg-white/10">
                  <div className="w-9 h-9 mx-auto mb-2 flex items-center justify-center bg-white/5 rounded-xl">
                    <TrendingUp className="w-4.5 h-4.5 text-purple-300" />
                  </div>
                  <div className="text-white text-2xl font-extrabold tracking-tight">{perfData?.analytics?.uniqueVisitedCount || 0}</div>
                  <div className="text-slate-400 text-[10px] font-medium mt-1 uppercase tracking-wider">Attempted</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8 items-stretch">
          
          {/* LEFT 3-COLUMNS AREA (Active Workspace, Resume and Subjects) */}
          <div className={isStudent ? "lg:col-span-3 space-y-8" : "lg:col-span-4 space-y-8"}>
            
            {/* Subject Exploration Cards */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm">
              <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[#0B0A1A] font-extrabold text-xl tracking-tight">
                      Explore Subjects
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">Select a discipline below to browse virtual laboratory categories</p>
                    {/* Tiny line indicator */}
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-6 h-1 bg-indigo-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-indigo-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-2.5 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-50">
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 text-base">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-indigo-700 font-bold text-xs">Discover. Learn. Experiment.</div>
                    <div className="text-slate-500 text-[10px]">Interactive labs for every learner.</div>
                  </div>
                </div>
              </div>

              {subjectsLoading ?
 (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 items-stretch">
                  {subjects.map((subject) => {
                    const labCount = subject._count?.labs || 0;
                    // Determine text color for badge based on gradient (extract primary color if possible, fallback to indigo)
                    const isRed = subject.gradient.includes('red') || subject.gradient.includes('rose');
                    const isGreen = subject.gradient.includes('emerald') || subject.gradient.includes('teal');
                    const isOrange = subject.gradient.includes('orange') || subject.gradient.includes('amber');
                    const badgeTextColor = isRed ? 'text-red-700' : isGreen ? 'text-emerald-700' : isOrange ? 'text-orange-700' : 'text-indigo-700';

                    return (
                      <Link
                        key={subject.id}
                        to={`/subject/${subject.id}`}
                        className={`group relative bg-gradient-to-br ${subject.gradient} rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full`}
                      >
                        {/* Decorative background overlay */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10 p-5 sm:p-6 flex flex-col h-full">
                          <div className="flex items-start gap-3 sm:gap-4 mb-4">
                            {/* Icon Box */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center text-2xl sm:text-3xl shadow-inner backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                              {subject.icon}
                            </div>
                            
                            {/* Title & Badge */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <h3 className="text-white font-extrabold text-base sm:text-lg leading-tight mb-2 truncate">{subject.title}</h3>
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-xs font-bold ${badgeTextColor} shadow-sm`}>
                                <FlaskConical className="w-3 h-3" />
                                {labCount} {labCount === 1 ? 'Lab' : 'Labs'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <div className="mt-auto pt-2 border-t border-white/10 text-white/90 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-5">
                            {subject.description}
                          </div>

                          {/* Action Footer */}
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-white/70 text-[10px] font-bold tracking-widest uppercase">Core Discipline</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:translate-x-1 transition-transform bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-sm">
                              View Labs <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resume Experiments List (Only for Students) */}
            {isStudent && !perfLoading && perfData?.resumeExperiments?.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
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
                          to={`/experiment/${exp.id}`}
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

          </div>

          {/* RIGHT 1-COLUMN AREA (Analytics Panel - Only for students) */}
          {isStudent && (
            <div className="space-y-6 flex flex-col sticky top-24 self-start max-h-[calc(100vh-6rem)] w-full">
              
              {/* Upcoming Exams Card */}
              {!assignmentsLoading && upcomingExams.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex-shrink-0">
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
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex-1 flex flex-col min-h-0">
                <div className="mb-5 pb-5 border-b border-slate-50 flex-shrink-0 flex items-center justify-between">
                  <h2 className="text-slate-900 font-extrabold text-sm flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-indigo-600" />
                    Activity Log
                  </h2>
                  <button 
                    onClick={() => setShowAllActivities(!showAllActivities)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center gap-1 group"
                  >
                    {showAllActivities ? 'View Less' : 'View All'} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
                {perfLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-slate-400 animate-spin" /></div>
                ) : perfData?.recentVisits?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">No recent activity</div>
                ) : (
                  <div className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {perfData?.recentVisits?.slice(0, showAllActivities ? undefined : 4).map((visit, i, arr) => {
                      const formatDuration = (seconds) => {
                        if (!seconds) return '0s';
                        const m = Math.floor(seconds / 60);
                        const s = seconds % 60;
                        return m > 0 ? `${m}m ${s}s` : `${s}s`;
                      };

                      return (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                            {i !== (arr.length - 1) && <div className="w-px h-full bg-slate-100 mt-2 min-h-[20px]" />}
                          </div>
                          <div className="pb-4 flex-1">
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">{visit.experiment?.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(visit.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              <span className="inline-flex items-center text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                                Time spent: {formatDuration(visit.duration)}
                              </span>
                              {visit.quizScores && visit.quizScores.slice(0, 3).map((qs, qIdx) => (
                                <span key={qIdx} className={`inline-flex items-center text-[9px] font-extrabold border px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap ${
                                  qs.passed 
                                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  Quiz: {qs.score}/{qs.maxScore}
                                </span>
                              ))}
                              {visit.quizScores && visit.quizScores.length > 3 && (
                                <span className="inline-flex items-center text-[9px] font-extrabold bg-slate-50 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded tracking-wider whitespace-nowrap">
                                  +{visit.quizScores.length - 3} MORE
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
