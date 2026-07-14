import { useState, useEffect } from 'react';
import {
  X, Loader2, Calendar, Mail, BookOpen, Clock,
  Award, Star, AlertCircle, Laptop, Smartphone, Tv
} from 'lucide-react';
import { api } from '../../utils/api';

const DEVICE_ICONS = { desktop: Laptop, mobile: Smartphone, tablet: Tv };

export default function StudentAnalyticsModal({ userId, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');

  useEffect(() => {
    const fetchStudentAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/student/${userId}`);
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Retrieving student profile details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center text-slate-400">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <p className="text-sm font-medium">Failed to retrieve analytics data.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 text-xs">Close</button>
        </div>
      </div>
    );
  }

  const { student, visits = [], quizzes = [], feedbacks = [] } = data;

  const totalTime = visits.reduce((sum, v) => sum + v.duration, 0);
  const minutesSpent = Math.round(totalTime / 60);
  const passedQuizzes = quizzes.filter(q => q.passed).length;
  const passRate = quizzes.length > 0 ? Math.round((passedQuizzes / quizzes.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white text-base font-bold">
              {student.name[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">{student.name}</h3>
              <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /> {student.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Unique Visits', val: new Set(visits.map(v => v.experimentId)).size, icon: BookOpen, color: 'text-blue-400 bg-blue-500/10' },
              { label: 'Time Invested', val: `${minutesSpent} min`, icon: Clock, color: 'text-purple-400 bg-purple-500/10' },
              { label: 'Quiz Pass Rate', val: `${passRate}%`, icon: Award, color: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Feedbacks Sent', val: feedbacks.length, icon: Star, color: 'text-amber-400 bg-amber-500/10' },
            ].map((m, i) => (
              <div key={i} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}>
                  <m.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{m.label}</div>
                  <div className="text-white font-extrabold text-sm. mt-0.5">{m.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sub-tab selection */}
          <div className="flex gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl w-fit">
            {[
              { id: 'activity', label: 'Activity Logs' },
              { id: 'quizzes',  label: 'Quiz Scores' },
              { id: 'feedback', label: 'Reviews submitted' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Render Active Tab Lists */}
          <div className="bg-slate-950/20 border border-white/5 rounded-xl p-4 min-h-64">
            {activeTab === 'activity' && (
              <div className="space-y-2">
                {visits.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-12 text-center">No experiments visited yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-500 font-bold border-b border-white/5 pb-2 uppercase tracking-wider">
                          <th className="pb-2">Experiment</th>
                          <th className="pb-2 text-center">Duration</th>
                          <th className="pb-2 text-center">Device</th>
                          <th className="pb-2 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {visits.map(v => {
                          const DeviceIcon = DEVICE_ICONS[v.device] || Laptop;
                          return (
                            <tr key={v.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-2.5 font-semibold text-white">{v.experiment?.title}</td>
                              <td className="py-2.5 text-center text-slate-400">{Math.round(v.duration / 60)}m {v.duration % 60}s</td>
                              <td className="py-2.5 text-center">
                                <span className="inline-flex items-center gap-1 text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                                  <DeviceIcon className="w-3.5 h-3.5" />
                                  <span className="capitalize">{v.device}</span>
                                </span>
                              </td>
                              <td className="py-2.5 text-right text-slate-500">
                                {new Date(v.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="space-y-2">
                {quizzes.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-12 text-center">No quizzes attempted yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-500 font-bold border-b border-white/5 pb-2 uppercase tracking-wider">
                          <th className="pb-2">Experiment</th>
                          <th className="pb-2 text-center">Quiz Type</th>
                          <th className="pb-2 text-center">Score</th>
                          <th className="pb-2 text-center">Status</th>
                          <th className="pb-2 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {quizzes.map(q => (
                          <tr key={q.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 font-semibold text-white">{q.experiment?.title}</td>
                            <td className="py-2.5 text-center capitalize text-slate-400">{q.quizType}</td>
                            <td className="py-2.5 text-center font-bold text-white">{q.score}/{q.maxScore}</td>
                            <td className="py-2.5 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${q.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                {q.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </td>
                            <td className="py-2.5 text-right text-slate-500">
                              {new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-3">
                {feedbacks.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-12 text-center">No feedbacks reviews sent yet.</p>
                ) : (
                  feedbacks.map(f => (
                    <div key={f.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-lg flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-xs text-white truncate max-w-xs">{f.experiment?.title}</div>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} className={`w-3.5 h-3.5 ${n <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                      </div>
                      {f.comment && <p className="text-slate-300 text-xs italic">"{f.comment}"</p>}
                      <div className="text-[9px] text-slate-500 text-right mt-1">
                        {new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-slate-950/40 text-[10px] text-slate-500 flex justify-between items-center">
          <span>Joined: {new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span>VL ID: {student.id.substring(0, 8)}...</span>
        </div>
      </div>
    </div>
  );
}
