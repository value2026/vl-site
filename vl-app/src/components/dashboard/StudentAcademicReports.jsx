import { useState, useEffect } from 'react';
import {
  Download, Loader2, Award, BookOpen, Clock, FileText, Search, Star,
  Tv, Smartphone, Laptop, Calendar, Printer, BarChart2, MessageSquare, ListTodo
} from 'lucide-react';
import { api } from '../../utils/api';

// ── Custom SVG Sparkline for registration trends ───────────────
function Sparkline({ data = [] }) {
  if (data.length < 2) return <div className="text-slate-500 text-xs py-8 text-center">Awaiting data...</div>;
  const values = data.map((d) => d.count);
  const max = Math.max(...values, 10);
  const min = Math.min(...values, 0);
  const range = max - min;
  const width = 500;
  const height = 150;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.count - min) / range) * (height - 30) - 15;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={`M0,${height} L${points} L${width},${height} Z`} fill="url(#chartGrad)" />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((d.count - min) / range) * (height - 30) - 15;
          return (
            <circle key={i} cx={x} cy={y} r="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" className="hover:r-5 cursor-pointer" />
          );
        })}
      </svg>
      <div className="flex justify-between text-[9px] text-slate-500 mt-2 px-1 font-semibold uppercase tracking-wider">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

// ── Custom SVG Bar chart for Peak Hours ─────────────────────────
function BarChart({ data = [] }) {
  if (data.length === 0) return <div className="text-slate-500 text-xs py-8 text-center">No active usage...</div>;
  const values = data.map((d) => d.count);
  const max = Math.max(...values, 5);
  const height = 120;

  return (
    <div className="flex items-end justify-between h-36 gap-1.5 pt-4 bg-slate-950/20 border border-white/5 p-4 rounded-xl">
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
            <div className="w-full relative flex flex-col justify-end h-24">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-[9px] font-bold text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {d.count} hits
              </span>
              <div
                style={{ height: `${pct || 4}%` }}
                className={`w-full rounded-t transition-all duration-300 ${d.count > 0 ? 'bg-gradient-to-t from-blue-600 to-cyan-400 group-hover:brightness-125' : 'bg-white/5'}`}
              />
            </div>
            <span className="text-[8px] text-slate-500 font-bold mt-1">{d.hour.split(':')[0]}h</span>
          </div>
        );
      })}
    </div>
  );
}

export default function StudentAcademicReports() {
  const [activeTab, setActiveTab] = useState('academic');
  const [search, setSearch] = useState('');
  
  // Data caches for tabs
  const [academicData, setAcademicData] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [pagewiseData, setPagewiseData] = useState([]);
  const [statsData, setStatsData] = useState(null);

  const [loading, setLoading] = useState(true);

  // Load active tab data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'academic') {
          const res = await api.get('/analytics/reports/academic');
          if (res.ok) setAcademicData(await res.json());
        } else if (activeTab === 'quizzes') {
          const res = await api.get('/analytics/reports/quizzes');
          if (res.ok) setQuizData(await res.json());
        } else if (activeTab === 'feedback') {
          const res = await api.get('/analytics/reports/feedback');
          if (res.ok) setFeedbackData(await res.json());
        } else if (activeTab === 'pagewise') {
          const res = await api.get('/analytics/reports/pagewise');
          if (res.ok) setPagewiseData(await res.json());
        } else if (activeTab === 'stats') {
          const res = await api.get('/analytics/dashboard');
          if (res.ok) setStatsData(await res.json());
        }
      } catch (err) {
        console.error('Error loading report tab:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab]);

  // Export current tab data to CSV
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (activeTab === 'academic') {
      headers = ['Student Name', 'Email', 'Unique Labs Visited', 'Minutes Spent', 'Quiz Attempts Count', 'Quiz Pass Rate (%)', 'Average Score (%)'];
      rows = academicData.map((r) => [r.name, r.email, r.uniqueLabsVisited, r.totalTimeSpentMinutes, r.quizAttemptsCount, r.quizPassRate, r.averageQuizScore]);
      filename = 'academic_performance_report';
    } else if (activeTab === 'quizzes') {
      headers = ['Student Name', 'Email', 'Experiment', 'Quiz Type', 'Score', 'Max Score', 'Passed', 'Date'];
      rows = quizData.map((q) => [q.user?.name, q.user?.email, q.experiment?.title, q.quizType, q.score, q.maxScore, q.passed ? 'Yes' : 'No', new Date(q.createdAt).toLocaleDateString()]);
      filename = 'quiz_attempts_report';
    } else if (activeTab === 'feedback') {
      headers = ['Student Name', 'Email', 'Experiment', 'Lab Title', 'Rating', 'Comment', 'Date'];
      rows = feedbackData.map((f) => [f.user?.name, f.user?.email, f.experiment?.title, f.experiment?.lab?.title, f.rating, f.comment || '', new Date(f.createdAt).toLocaleDateString()]);
      filename = 'student_feedback_report';
    } else if (activeTab === 'pagewise') {
      headers = ['Experiment Title', 'Lab Title', 'Total Visits', 'Avg Duration (Mins)', 'Desktop Visits', 'Mobile Visits', 'Tablet Visits'];
      rows = pagewiseData.map((p) => [p.title, p.labTitle, p.totalVisits, p.avgDurationMinutes, p.devices.desktop, p.devices.mobile, p.devices.tablet]);
      filename = 'page_visits_report';
    } else {
      return;
    }

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Search filtering
  const filteredAcademic = academicData.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()));
  const filteredQuiz = quizData.filter(q => q.user?.name?.toLowerCase().includes(search.toLowerCase()) || q.user?.email?.toLowerCase().includes(search.toLowerCase()) || q.experiment?.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredFeedback = feedbackData.filter(f => f.user?.name?.toLowerCase().includes(search.toLowerCase()) || f.experiment?.title?.toLowerCase().includes(search.toLowerCase()) || f.comment?.toLowerCase().includes(search.toLowerCase()));
  const filteredPagewise = pagewiseData.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.labTitle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 print-container">
      {/* Dynamic CSS for beautiful print margins */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; color: black !important; }
          aside, header, nav, .no-print, button, input { display: none !important; }
          .print-area { width: 100% !important; margin: 0 !important; padding: 0 !important; background: transparent !important; }
          .print-title { display: block !important; margin-bottom: 20px; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
          table { color: black !important; border-color: #ddd !important; }
          th { background-color: #f1f5f9 !important; color: black !important; border-bottom: 2px solid #ccc !important; }
          td { border-bottom: 1px solid #eee !important; color: #333 !important; }
        }
        .print-title { display: none; }
      `}} />

      {/* Header controls (no-print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 no-print">
        <div>
          <h3 className="text-white font-bold text-xl">Institution Reports & Analytics</h3>
          <p className="text-slate-400 text-xs mt-0.5">Access quiz performance, student feedback, and portal usage details</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintPDF}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Printer className="w-4 h-4" /> Print PDF Report
          </button>
          {activeTab !== 'stats' && (
            <button
              onClick={handleExportCSV}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-40"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Tab selection menu (no-print) */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit no-print">
        {[
          { id: 'academic', label: 'Academic progress', icon: BookOpen },
          { id: 'quizzes',  label: 'Quiz Scores', icon: ListTodo },
          { id: 'feedback', label: 'Reviews & Feedback', icon: MessageSquare },
          { id: 'pagewise', label: 'Page access stats', icon: Clock },
          { id: 'stats',    label: 'Usage Statistics', icon: BarChart2 }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === t.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtering input bar (no-print) */}
      {activeTab !== 'stats' && (
        <div className="relative max-w-sm no-print">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'pagewise'
                ? "Filter by experiment or lab..."
                : "Filter by student name or email..."
            }
            className="w-full bg-slate-900/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      )}

      {/* Print-specific header (hidden in browser) */}
      <div className="print-title">
        <h1 style={{fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0'}}>Virtual Labs Reports</h1>
        <p style={{fontSize: '12px', color: '#666', margin: '0'}}>
          Report type: <span style={{textTransform: 'capitalize'}}>{activeTab}</span> | Date: {new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})}
        </p>
      </div>

      {/* Data display container */}
      <div className="print-area">
        {loading ? (
          <div className="flex justify-center py-20 text-slate-400 no-print">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* ── TAB 1: ACADEMIC PROGRESS REPORT ── */}
            {activeTab === 'academic' && (
              filteredAcademic.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                  <p className="text-sm font-medium">No performance records found.</p>
                </div>
              ) : (
                <div className="bg-slate-900/25 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs uppercase font-bold tracking-wider">
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4 text-center">Labs Visited</th>
                          <th className="px-6 py-4 text-center">Time Spent</th>
                          <th className="px-6 py-4 text-center">Quiz Attempts</th>
                          <th className="px-6 py-4 text-center">Pass Rate</th>
                          <th className="px-6 py-4 text-center font-bold">Avg Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                        {filteredAcademic.map((r, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white print:text-black">{r.name}</div>
                              <div className="text-slate-500 text-xs mt-0.5 print:text-slate-600">{r.email}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {r.uniqueLabsVisited}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-400 print:text-black">{r.totalTimeSpentMinutes}m</td>
                            <td className="px-6 py-4 text-center">{r.quizAttemptsCount}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${r.quizPassRate >= 70 ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-rose-500/10 border-rose-500/25 text-rose-400'}`}>
                                {r.quizPassRate}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-white print:text-black">{r.averageQuizScore}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

            {/* ── TAB 2: QUIZ PERFORMANCE REPORT ── */}
            {activeTab === 'quizzes' && (
              filteredQuiz.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-400">
                  <ListTodo className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                  <p className="text-sm font-medium">No quiz attempts found.</p>
                </div>
              ) : (
                <div className="bg-slate-900/25 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs uppercase font-bold tracking-wider">
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Experiment</th>
                          <th className="px-6 py-4 text-center">Type</th>
                          <th className="px-6 py-4 text-center">Score</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                        {filteredQuiz.map((q, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white print:text-black">{q.user?.name}</div>
                              <div className="text-slate-500 text-xs mt-0.5 print:text-slate-650">{q.user?.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white font-medium print:text-black">{q.experiment?.title}</div>
                              <div className="text-slate-500 text-xs mt-0.5 print:text-slate-650">{q.experiment?.lab?.title}</div>
                            </td>
                            <td className="px-6 py-4 text-center capitalize text-slate-400 print:text-black">{q.quizType}</td>
                            <td className="px-6 py-4 text-center font-bold">{q.score}/{q.maxScore}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${q.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                {q.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-slate-500 text-xs print:text-black">
                              {new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

            {/* ── TAB 3: FEEDBACK REPORT ── */}
            {activeTab === 'feedback' && (
              filteredFeedback.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                  <p className="text-sm font-medium">No reviews submitted yet.</p>
                </div>
              ) : (
                <div className="bg-slate-900/25 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs uppercase font-bold tracking-wider">
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Experiment</th>
                          <th className="px-6 py-4 text-center">Rating</th>
                          <th className="px-6 py-4">Comment</th>
                          <th className="px-6 py-4 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                        {filteredFeedback.map((f, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white print:text-black">{f.user?.name}</div>
                              <div className="text-slate-500 text-xs mt-0.5 print:text-slate-650">{f.user?.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white font-medium print:text-black">{f.experiment?.title}</div>
                              <div className="text-slate-500 text-xs mt-0.5 print:text-slate-650">{f.experiment?.lab?.title}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                {[1,2,3,4,5].map(n => (
                                  <Star key={n} className={`w-3.5 h-3.5 ${n <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 italic text-slate-300 print:text-black">
                              {f.comment ? `"${f.comment}"` : '—'}
                            </td>
                            <td className="px-6 py-4 text-right text-slate-500 text-xs print:text-black">
                              {new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

            {/* ── TAB 4: PAGE-WISE ACCESS REPORT ── */}
            {activeTab === 'pagewise' && (
              filteredPagewise.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-400">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                  <p className="text-sm font-medium">No page visits recorded.</p>
                </div>
              ) : (
                <div className="bg-slate-900/25 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs uppercase font-bold tracking-wider">
                          <th className="px-6 py-4">Experiment Page</th>
                          <th className="px-6 py-4 text-center">Total Visits</th>
                          <th className="px-6 py-4 text-center">Avg Duration</th>
                          <th className="px-6 py-4 text-center">Devices breakdown (Desktop/Mobile/Tablet)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                        {filteredPagewise.map((p, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white print:text-black">{p.title}</div>
                              <div className="text-slate-500 text-xs mt-0.5 print:text-slate-650">{p.labTitle}</div>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-white print:text-black">
                              {p.totalVisits}
                            </td>
                            <td className="px-6 py-4 text-center text-slate-400 print:text-black">
                              {p.avgDurationMinutes} mins
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-6">
                                <span className="inline-flex items-center gap-1 text-slate-400 text-xs"><Laptop className="w-3.5 h-3.5 text-blue-400" /> {p.devices.desktop}</span>
                                <span className="inline-flex items-center gap-1 text-slate-400 text-xs"><Smartphone className="w-3.5 h-3.5 text-emerald-400" /> {p.devices.mobile}</span>
                                <span className="inline-flex items-center gap-1 text-slate-400 text-xs"><Tv className="w-3.5 h-3.5 text-amber-400" /> {p.devices.tablet}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

            {/* ── TAB 5: STATS & GRAPHS REPORT ── */}
            {activeTab === 'stats' && statsData && (
              <div className="space-y-6">
                {/* Highlights row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
                  {[
                    { label: 'Active Today (DAU)', val: statsData.activeUsers.dau },
                    { label: 'Active This Week (WAU)', val: statsData.activeUsers.wau },
                    { label: 'Active This Month (MAU)', val: statsData.activeUsers.mau },
                    { label: 'Total Visits logged', val: statsData.counts.totalVisits },
                  ].map((s, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 text-center">
                      <div className="text-white font-extrabold text-2xl">{s.val}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Registration and peak hours */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5">
                    <h4 className="text-white font-bold text-xs mb-4 uppercase tracking-wider text-slate-400">Daily Registrations Trend</h4>
                    <Sparkline data={statsData.registrationTrends} />
                  </div>
                  <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5">
                    <h4 className="text-white font-bold text-xs mb-4 uppercase tracking-wider text-slate-400">Peak Usage Hours</h4>
                    <BarChart data={statsData.peakDistribution} />
                  </div>
                </div>

                {/* Popular experiments & device splits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Popular exps list */}
                  <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5 md:col-span-2">
                    <h4 className="text-white font-bold text-xs mb-4 uppercase tracking-wider text-slate-400">Most Visited Experiments</h4>
                    {statsData.popularExperiments.length === 0 ? (
                      <p className="text-slate-500 text-xs italic py-10 text-center">Awaiting platform usage data...</p>
                    ) : (
                      <div className="space-y-2">
                        {statsData.popularExperiments.map((exp, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/20 border border-white/5 rounded-xl">
                            <span className="text-white font-bold text-xs">{idx + 1}. {exp.name}</span>
                            <span className="text-xs text-slate-400 font-semibold">{exp.visits} visits</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Device bars */}
                  <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5">
                    <h4 className="text-white font-bold text-xs mb-4 uppercase tracking-wider text-slate-400 font-bold">Device Distribution</h4>
                    <div className="space-y-4 pt-2">
                      {[
                        { label: 'Desktop', val: statsData.devices.desktop, icon: Laptop, color: 'bg-blue-500' },
                        { label: 'Mobile',  val: statsData.devices.mobile,  icon: Smartphone, color: 'bg-emerald-500' },
                        { label: 'Tablet',  val: statsData.devices.tablet,  icon: Tv, color: 'bg-amber-500' },
                      ].map((dev, idx) => {
                        const total = (statsData.devices.desktop || 0) + (statsData.devices.mobile || 0) + (statsData.devices.tablet || 0) || 1;
                        const pct = Math.round((dev.val / total) * 100);
                        return (
                          <div key={idx}>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-slate-400 flex items-center gap-1.5"><dev.icon className="w-3.5 h-3.5" />{dev.label}</span>
                              <span className="text-white font-bold">{pct}% ({dev.val || 0})</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                              <div style={{ width: `${pct}%` }} className={`h-full ${dev.color}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
