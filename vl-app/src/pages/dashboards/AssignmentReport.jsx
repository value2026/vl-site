import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, CheckCircle, RefreshCw, Loader2, 
  AlertCircle, ShieldAlert, Award, Calendar, Clock, Eye, CheckCircle2, X
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { api } from '../../utils/api';

export default function AssignmentReport() {
  const { id } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [actionId, setActionId]     = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      const res = await api.get(`/assignments/report/${id}`);
      if (res.ok) {
        setAssignment(await res.json());
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to retrieve assignment report.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePublishResults = async () => {
    try {
      const res = await api.put(`/assignments/publish/${id}`);
      if (res.ok) {
        alert('Student scores published successfully!');
        fetchReport();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetAttempt = async (attemptId) => {
    if (!window.confirm('Are you sure you want to reset/delete this student attempt? This log will be permanently deleted and they will be allowed to re-take the exam.')) return;
    setActionId(attemptId);
    try {
      const res = await api.delete(`/assignments/attempts/${attemptId}`);
      if (res.ok) {
        fetchReport();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Academic Report">
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          <span>Loading report data...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !assignment) {
    return (
      <DashboardLayout title="Academic Report">
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error || 'Assignment report not found'}</span>
        </div>
        <Link to="/dashboard/teacher/assignments" className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </Link>
      </DashboardLayout>
    );
  }

  // Calculate statistics
  const targetCount = assignment.students.length;
  const attemptedStudentsList = [...new Set(assignment.attempts.map(a => a.studentId))];
  const attemptedCount = attemptedStudentsList.length;
  
  let averageScore = 0;
  if (assignment.attempts.length > 0) {
    const total = assignment.attempts.reduce((sum, a) => sum + a.score, 0);
    averageScore = (total / assignment.attempts.length).toFixed(1);
  }

  const maxPossible = Array.isArray(assignment.questionPaper?.questions) 
    ? assignment.questionPaper.questions.length 
    : 0;

  return (
    <DashboardLayout title="Exam Report">
      {/* Navigation */}
      <div className="mb-6">
        <Link to="/dashboard/teacher/assignments" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </Link>
      </div>

      {/* Overview Block */}
      <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest block">Scheduled Slot Details</span>
              {assignment.resultDisplay === 'manual' && (
                assignment.resultsPublished ? (
                  <span className="bg-emerald-500/10 text-emerald-405 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    Published
                  </span>
                ) : (
                  <button
                    onClick={handlePublishResults}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider transition-all"
                  >
                    Publish Results
                  </button>
                )
              )}
            </div>
            <h3 className="text-white text-xl font-bold tracking-tight mt-1.5">{assignment.title}</h3>
            <p className="text-slate-450 text-xs mt-1">Associated Question Paper: {assignment.questionPaper.title}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 bg-white/3 border border-white/5 rounded-2xl p-4 md:px-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Start: {new Date(assignment.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Deadline: {new Date(assignment.endTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-4 bg-white/2 border border-white/5 rounded-2xl p-5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white text-2xl font-bold">{targetCount}</div>
              <div className="text-slate-400 text-xs mt-0.5">Students Assigned</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/2 border border-white/5 rounded-2xl p-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white text-2xl font-bold">{attemptedCount} / {targetCount}</div>
              <div className="text-slate-400 text-xs mt-0.5">Attempted Exams</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/2 border border-white/5 rounded-2xl p-5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white text-2xl font-bold">{averageScore} <span className="text-xs text-slate-500">/ {maxPossible}</span></div>
              <div className="text-slate-400 text-xs mt-0.5">Average Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion List Table */}
      <div className="bg-slate-900/40 border border-white/10 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-slate-900/20">
          <h4 className="text-white font-bold text-sm">Student Completion Statuses</h4>
        </div>

        {assignment.students.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs italic">No students assigned to this slot.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-350">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase font-semibold text-[10px] tracking-wider bg-white/2">
                  <th className="px-6 py-3.5">Student Information</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Attempts</th>
                  <th className="px-6 py-3.5">Score Achieved</th>
                  <th className="px-6 py-3.5">Completion Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assignment.students.map(studRel => {
                  const student   = studRel.student;
                  const attempts  = assignment.attempts.filter(a => a.studentId === student.id);
                  const attemptCount = attempts.length;
                  const isCompleted = attemptCount > 0;
                  const latestAttempt = attempts[0];

                  return (
                    <tr key={studRel.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-200 text-xs">{student.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{student.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-500/10 text-slate-500 border border-slate-500/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            Not Started
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-300">
                        {attemptCount} / {assignment.maxAttempts}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-200">
                        {isCompleted ? (
                          <span>{latestAttempt.score} <span className="text-slate-600 font-normal">/ {latestAttempt.maxScore}</span></span>
                        ) : (
                          <span className="text-slate-600 font-normal">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-450">
                        {isCompleted ? (
                          new Date(latestAttempt.completedAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {isCompleted ? (
                          <>
                            <button
                              onClick={() => setSelectedAttempt(latestAttempt)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" /> Answers
                            </button>
                            <button
                              onClick={() => handleResetAttempt(latestAttempt.id)}
                              disabled={actionId === latestAttempt.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                              {actionId === latestAttempt.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                              Reset
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-600 text-[10px] italic">No active log</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Answers Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedAttempt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white rounded-lg p-1 hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white text-lg font-bold flex items-center gap-2 mb-2 border-b border-white/5 pb-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400" /> Answers Breakdown
            </h3>
            
            <div className="mb-6 p-4 bg-white/2 rounded-2xl border border-white/5 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block">Student</span>
                <span className="text-white font-bold">{selectedAttempt.student.name}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Score Achieved</span>
                <span className="text-white font-extrabold text-base">
                  {selectedAttempt.score} <span className="text-xs text-slate-500 font-normal">/ {selectedAttempt.maxScore}</span>
                </span>
              </div>
            </div>

            <div className="space-y-6 max-h-[380px] overflow-y-auto pr-1">
              {Array.isArray(assignment.questionPaper?.questions) && 
                assignment.questionPaper.questions.map((q, idx) => {
                  const studentAnswerIdx = selectedAttempt.answers[idx.toString()];
                  const correctOptionIdx = q.correctOptionIndex;

                  return (
                    <div key={idx} className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-400">Question #{idx + 1}</span>
                        {studentAnswerIdx === correctOptionIdx ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">Correct</span>
                        ) : (
                          <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/15 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">Incorrect</span>
                        )}
                      </div>
                      
                      <p className="text-white text-xs font-semibold leading-relaxed">{q.questionText}</p>

                      <div className="space-y-2 text-xs">
                        {q.options.map((opt, oIdx) => {
                          const isSelectedByStudent = studentAnswerIdx === oIdx;
                          const isCorrect = correctOptionIdx === oIdx;

                          let optionStyle = 'bg-white/2 border-white/5 text-slate-400';
                          if (isCorrect) {
                            optionStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold';
                          } else if (isSelectedByStudent && !isCorrect) {
                            optionStyle = 'bg-rose-500/10 border-rose-500/30 text-rose-455 font-bold';
                          }

                          return (
                            <div key={oIdx} className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between ${optionStyle}`}>
                              <div>
                                <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                                {opt}
                              </div>
                              
                              {isCorrect ? (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Correct Answer</span>
                              ) : isSelectedByStudent ? (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400">Student Selection</span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end border-t border-white/5 pt-4 mt-6">
              <button
                onClick={() => setSelectedAttempt(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-350 rounded-xl text-xs font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
