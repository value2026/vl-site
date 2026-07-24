import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ClipboardList, Calendar, Clock, Award, Loader2, 
  AlertCircle, ChevronRight, GraduationCap, RefreshCw 
} from 'lucide-react';
import StudentNav from '../../components/student/StudentNav';
import { api } from '../../utils/api';

export default function StudentAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const fetchMyAssignments = useCallback(async () => {
    try {
      const res = await api.get('/assignments/my-assignments');
      if (res.ok) {
        setAssignments(await res.json());
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to load assignments.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while fetching your assignments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyAssignments();
  }, [fetchMyAssignments]);

  const getStatusDetails = (status) => {
    switch (status) {
      case 'yet_to_start':
        return { label: 'Yet to Start', badge: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'session_over':
        return { label: 'Session Over', badge: 'bg-gray-100 text-gray-500 border-gray-200' };
      case 'completed':
        return { label: 'Completed', badge: 'bg-emerald-100 text-emerald-700 border-emerald-250' };
      case 'active':
      default:
        return { label: 'Active / In Progress', badge: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <StudentNav breadcrumb={[{ label: 'Assignments' }]} />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-md">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-gray-900 font-extrabold text-xl tracking-tight">My Assignments</h1>
              <p className="text-gray-500 text-xs">Exams and multiple choice quizzes scheduled by your instructors.</p>
            </div>
          </div>

          <button
            onClick={() => { setLoading(true); fetchMyAssignments(); }}
            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm text-gray-500 hover:text-gray-700 transition-all"
            title="Refresh assignments list"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <span className="text-sm">Retrieving assignments list...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200/60 rounded-3xl p-6 text-gray-500 flex flex-col items-center justify-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mb-3" />
            <h4 className="text-gray-800 font-bold text-base mb-1">No scheduled exams</h4>
            <p className="text-xs text-gray-450 max-w-sm">You do not have any assignments scheduled at the moment. Keep checking your notification panel!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map(item => {
              const details = getStatusDetails(item.status);
              const hasScore = item.score !== null;

              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wider ${details.badge}`}>
                        {details.label}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" /> Instructor: {item.teacherName}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-gray-900 font-extrabold text-base tracking-tight">{item.title}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">MCQ Paper: {item.paperTitle} • {item.questionCount} Questions</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-450" />
                        <span>Start: {new Date(item.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-450" />
                        <span>End: {new Date(item.endTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Score block */}
                  <div className="flex items-center gap-6 justify-between md:justify-end md:w-80 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 flex-shrink-0">
                    {/* Score achievement display */}
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Score Obtained</span>
                      {hasScore ? (
                        <div className="text-gray-900 font-extrabold text-lg flex items-center justify-end gap-1">
                          <Award className="w-5 h-5 text-amber-500" />
                          <span>{item.score} <span className="text-xs text-gray-400 font-normal">/ {item.maxScore}</span></span>
                        </div>
                      ) : item.attemptsCount > 0 ? (
                        <span className="text-xs text-gray-400 italic">Pending Release</span>
                      ) : (
                        <span className="text-xs text-gray-300 font-medium">No attempts yet</span>
                      )}
                      <span className="text-[9.5px] text-gray-400 block mt-0.5">
                        Attempts used: {item.attemptsCount} / {item.maxAttempts}
                      </span>
                    </div>

                    {/* Action button */}
                    {item.status === 'active' ? (
                      <button
                        onClick={() => navigate(`/student/assignments/take/${item.id}`)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1 group"
                      >
                        Start Exam <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-5 py-2.5 bg-gray-100 border border-gray-200 text-gray-450 rounded-xl text-xs font-bold transition-all cursor-not-allowed uppercase tracking-wider"
                      >
                        {item.status === 'yet_to_start' ? 'Not Open' : item.status === 'completed' ? 'Finished' : 'Closed'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
