import { useState, useEffect, useMemo } from 'react';
import {
  Download, Loader2, Award, BookOpen, Clock, FileText, Search, Star,
  Tv, Smartphone, Laptop, Calendar, Printer, BarChart2, MessageSquare, ListTodo,
  Building2, Filter, RotateCcw, TrendingUp, Users, CheckCircle2, ChevronDown
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
  const [activeTab, setActiveTab] = useState('nodal'); // 'nodal' | 'academic' | 'quizzes' | 'feedback' | 'pagewise' | 'stats'
  const [search, setSearch] = useState('');
  
  // Filter States
  const [selectedNodalCentre, setSelectedNodalCentre] = useState('all');
  const [dateRangePreset, setDateRangePreset] = useState('all'); // 'all' | 'today' | '7days' | '30days' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [quizStatusFilter, setQuizStatusFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState('all');

  // Metadata dropdown options
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Data caches for tabs
  const [nodalData, setNodalData] = useState([]);
  const [academicData, setAcademicData] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [pagewiseData, setPagewiseData] = useState([]);
  const [statsData, setStatsData] = useState(null);

  const [loading, setLoading] = useState(true);

  // Load institutions list once
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await api.get('/institutions');
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data);
        }
      } catch (err) {
        console.error('Error fetching institutions:', err);
      }
    };
    fetchInstitutions();
  }, []);

  // Handle Preset Date changes
  const handleDatePresetChange = (preset) => {
    setDateRangePreset(preset);
    const now = new Date();
    if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7days') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === '30days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const resetAllFilters = () => {
    setSelectedNodalCentre('all');
    setDateRangePreset('all');
    setStartDate('');
    setEndDate('');
    setSelectedDept('all');
    setQuizStatusFilter('all');
    setFeedbackRatingFilter('all');
    setSearch('');
  };

  // Build query string based on active filters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (selectedNodalCentre && selectedNodalCentre !== 'all') {
      params.set('nodalCentreId', selectedNodalCentre);
    }
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (selectedDept && selectedDept !== 'all') params.set('dept', selectedDept);
    if (quizStatusFilter !== 'all') {
      params.set('passed', quizStatusFilter === 'passed' ? 'true' : 'false');
    }
    if (feedbackRatingFilter !== 'all') {
      params.set('rating', feedbackRatingFilter);
    }
    return params.toString();
  };

  // Load active tab data whenever activeTab or primary filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const query = buildQueryParams();
        const qStr = query ? `?${query}` : '';

        if (activeTab === 'nodal') {
          const res = await api.get(`/analytics/reports/nodal-centres${qStr}`);
          if (res.ok) setNodalData(await res.json());
        } else if (activeTab === 'academic') {
          const res = await api.get(`/analytics/reports/academic${qStr}`);
          if (res.ok) {
            const data = await res.json();
            setAcademicData(data);
            // Derive unique departments for dropdown
            const depts = Array.from(new Set(data.map(d => d.dept).filter(d => d && d !== '—')));
            setDepartments(depts);
          }
        } else if (activeTab === 'quizzes') {
          const res = await api.get(`/analytics/reports/quizzes${qStr}`);
          if (res.ok) setQuizData(await res.json());
        } else if (activeTab === 'feedback') {
          const res = await api.get(`/analytics/reports/feedback${qStr}`);
          if (res.ok) setFeedbackData(await res.json());
        } else if (activeTab === 'pagewise') {
          const res = await api.get(`/analytics/reports/pagewise${qStr}`);
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
  }, [activeTab, selectedNodalCentre, startDate, endDate, selectedDept, quizStatusFilter, feedbackRatingFilter]);

  // Client-side text search filtering
  const filteredNodal = useMemo(() => {
    return nodalData.filter(n =>
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      (n.code && n.code.toLowerCase().includes(search.toLowerCase())) ||
      (n.collegeId && n.collegeId.toLowerCase().includes(search.toLowerCase()))
    );
  }, [nodalData, search]);

  const filteredAcademic = useMemo(() => {
    return academicData.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      (r.nodalCentreName && r.nodalCentreName.toLowerCase().includes(search.toLowerCase())) ||
      (r.dept && r.dept.toLowerCase().includes(search.toLowerCase()))
    );
  }, [academicData, search]);

  const filteredQuiz = useMemo(() => {
    return quizData.filter(q =>
      q.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      q.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      q.experiment?.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [quizData, search]);

  const filteredFeedback = useMemo(() => {
    return feedbackData.filter(f =>
      f.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.experiment?.title?.toLowerCase().includes(search.toLowerCase()) ||
      f.comment?.toLowerCase().includes(search.toLowerCase())
    );
  }, [feedbackData, search]);

  const filteredPagewise = useMemo(() => {
    return pagewiseData.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.labTitle.toLowerCase().includes(search.toLowerCase())
    );
  }, [pagewiseData, search]);

  // Aggregate stats across Nodal Centres for summary cards
  const nodalSummary = useMemo(() => {
    return nodalData.reduce((acc, curr) => ({
      totalStudents: acc.totalStudents + (curr.totalRegisteredStudents || 0),
      totalVisits: acc.totalVisits + (curr.totalVisits || 0),
      totalMinutes: acc.totalMinutes + (curr.totalMinutesSpent || 0),
      totalQuizzes: acc.totalQuizzes + (curr.totalQuizAttempts || 0),
    }), { totalStudents: 0, totalVisits: 0, totalMinutes: 0, totalQuizzes: 0 });
  }, [nodalData]);

  // Export current tab data to CSV
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (activeTab === 'nodal') {
      headers = ['Institution / Nodal Centre', 'Code / ID', 'Students Registered', 'Active Learners', 'Total Simulation Visits', 'Time Spent (Mins)', 'Unique Experiments', 'Quiz Attempts', 'Avg Quiz Score (%)', 'Pass Rate (%)'];
      rows = filteredNodal.map((n) => [
        n.name, n.code || n.collegeId || '—', n.totalRegisteredStudents, n.activeStudents, n.totalVisits, n.totalMinutesSpent, n.uniqueExperimentsRun, n.totalQuizAttempts, n.avgQuizScore, n.quizPassRate
      ]);
      filename = 'nodal_centre_usage_report';
    } else if (activeTab === 'academic') {
      headers = ['Student Name', 'Email', 'Nodal Centre', 'Department', 'Course', 'Unique Labs Visited', 'Minutes Spent', 'Quiz Attempts Count', 'Quiz Pass Rate (%)', 'Average Score (%)'];
      rows = filteredAcademic.map((r) => [r.name, r.email, r.nodalCentreName, r.dept, r.course, r.uniqueLabsVisited, r.totalTimeSpentMinutes, r.quizAttemptsCount, r.quizPassRate, r.averageQuizScore]);
      filename = 'academic_performance_report';
    } else if (activeTab === 'quizzes') {
      headers = ['Student Name', 'Email', 'Institution', 'Experiment', 'Quiz Type', 'Score', 'Max Score', 'Passed', 'Date'];
      rows = filteredQuiz.map((q) => [q.user?.name, q.user?.email, q.user?.nodalCentre?.name || '—', q.experiment?.title, q.quizType, q.score, q.maxScore, q.passed ? 'Yes' : 'No', new Date(q.createdAt).toLocaleDateString()]);
      filename = 'quiz_attempts_report';
    } else if (activeTab === 'feedback') {
      headers = ['Student Name', 'Email', 'Institution', 'Experiment', 'Lab Title', 'Rating', 'Comment', 'Date'];
      rows = filteredFeedback.map((f) => [f.user?.name, f.user?.email, f.user?.nodalCentre?.name || '—', f.experiment?.title, f.experiment?.lab?.title, f.rating, f.comment || '', new Date(f.createdAt).toLocaleDateString()]);
      filename = 'student_feedback_report';
    } else if (activeTab === 'pagewise') {
      headers = ['Experiment Title', 'Lab Title', 'Total Visits', 'Avg Duration (Mins)', 'Desktop Visits', 'Mobile Visits', 'Tablet Visits'];
      rows = filteredPagewise.map((p) => [p.title, p.labTitle, p.totalVisits, p.avgDurationMinutes, p.devices.desktop, p.devices.mobile, p.devices.tablet]);
      filename = 'page_visits_report';
    } else {
      return;
    }

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
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

  const hasActiveFilters = selectedNodalCentre !== 'all' || dateRangePreset !== 'all' || selectedDept !== 'all' || quizStatusFilter !== 'all' || feedbackRatingFilter !== 'all' || search !== '';

  return (
    <div className="space-y-6 print-container">
      {/* Print CSS styling */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; color: black !important; }
          aside, header, nav, .no-print, button, input, select { display: none !important; }
          .print-area { width: 100% !important; margin: 0 !important; padding: 0 !important; background: transparent !important; }
          .print-title { display: block !important; margin-bottom: 20px; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
          table { color: black !important; border-color: #ddd !important; font-size: 11px !important; }
          th { background-color: #f1f5f9 !important; color: black !important; border-bottom: 2px solid #ccc !important; }
          td { border-bottom: 1px solid #eee !important; color: #333 !important; }
        }
        .print-title { display: none; }
      `}} />

      {/* Header Controls (no-print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 no-print">
        <div>
          <h3 className="text-white font-bold text-xl flex items-center gap-2">
            Academic & Institution Reports
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">Filter and analyse nodal centre usage, student lab progress, and evaluation metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print PDF Report
          </button>
          {activeTab !== 'stats' && (
            <button
              onClick={handleExportCSV}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Tab selection menu (no-print) */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit no-print">
        {[
          { id: 'nodal',    label: 'Nodal Centre Usage', icon: Building2 },
          { id: 'academic', label: 'Student Progress',   icon: BookOpen },
          { id: 'quizzes',  label: 'Quiz Scores',        icon: ListTodo },
          { id: 'feedback', label: 'Reviews & Feedback', icon: MessageSquare },
          { id: 'pagewise', label: 'Page Access Stats',  icon: Clock },
          { id: 'stats',    label: 'Usage Statistics',   icon: BarChart2 }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── UNIFIED FILTER CONTROLS BAR (no-print) ── */}
      {activeTab !== 'stats' && (
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 space-y-3 no-print">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-blue-400" /> Filter Criteria
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Search Keywords</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    activeTab === 'nodal' ? "Filter centre name, code..." :
                    activeTab === 'pagewise' ? "Filter simulation title..." :
                    "Filter student name, email..."
                  }
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Nodal Centre Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Institution / Nodal Centre</label>
              <select
                value={selectedNodalCentre}
                onChange={(e) => setSelectedNodalCentre(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="all">All Nodal Centres ({institutions.length})</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} {inst.code ? `(${inst.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Preset */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Timeline</label>
              <select
                value={dateRangePreset}
                onChange={(e) => handleDatePresetChange(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="all">All Time History</option>
                <option value="today">Today Only</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>

            {/* Tab-Specific Filters */}
            {activeTab === 'academic' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Academic Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="all">All Departments</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Assessment Status</label>
                <select
                  value={quizStatusFilter}
                  onChange={(e) => setQuizStatusFilter(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="all">All Results (Passed & Failed)</option>
                  <option value="passed">Passed (≥50%)</option>
                  <option value="failed">Failed (&lt;50%)</option>
                </select>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Review Rating</label>
                <select
                  value={feedbackRatingFilter}
                  onChange={(e) => setFeedbackRatingFilter(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="all">All Ratings (1 to 5 Stars)</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                  <option value="3">⭐⭐⭐ 3 Stars</option>
                  <option value="2">⭐⭐ 2 Stars</option>
                  <option value="1">⭐ 1 Star</option>
                </select>
              </div>
            )}
          </div>

          {/* Custom Date Pickers (if chosen) */}
          {dateRangePreset === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Print-specific header (hidden in browser) */}
      <div className="print-title">
        <h1 style={{fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0'}}>Virtual Labs — Academic & Institution Usage Report</h1>
        <p style={{fontSize: '11px', color: '#666', margin: '0'}}>
          Report section: <strong style={{textTransform: 'capitalize'}}>{activeTab}</strong> | Generated on: {new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})}
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
            {/* ── TAB 0: NODAL CENTRE WISE USAGE REPORT (NEW) ── */}
            {activeTab === 'nodal' && (
              <div className="space-y-5">
                {/* Highlights Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                      <Building2 className="w-4 h-4 text-blue-400" /> Nodal Centres
                    </div>
                    <div className="text-2xl font-extrabold text-white">{filteredNodal.length}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Institutions reporting</div>
                  </div>
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                      <Users className="w-4 h-4 text-emerald-400" /> Registered Students
                    </div>
                    <div className="text-2xl font-extrabold text-white">{nodalSummary.totalStudents}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Enrolled across centres</div>
                  </div>
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                      <TrendingUp className="w-4 h-4 text-purple-400" /> Lab Runs
                    </div>
                    <div className="text-2xl font-extrabold text-white">{nodalSummary.totalVisits}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Total simulation executions</div>
                  </div>
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                      <Clock className="w-4 h-4 text-amber-400" /> Total Time
                    </div>
                    <div className="text-2xl font-extrabold text-white">{nodalSummary.totalMinutes}m</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Minutes logged on portal</div>
                  </div>
                </div>

                {filteredNodal.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                    <p className="text-sm font-medium">No nodal centre records match your filter criteria.</p>
                  </div>
                ) : (
                  <div className="bg-slate-900/25 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <th className="px-5 py-3.5">#</th>
                            <th className="px-5 py-3.5">Nodal Centre / Institution</th>
                            <th className="px-5 py-3.5 text-center">Enrolled</th>
                            <th className="px-5 py-3.5 text-center">Active Learners</th>
                            <th className="px-5 py-3.5 text-center">Lab Visits</th>
                            <th className="px-5 py-3.5 text-center">Time Spent</th>
                            <th className="px-5 py-3.5 text-center">Unique Sims</th>
                            <th className="px-5 py-3.5 text-center">Assessments</th>
                            <th className="px-5 py-3.5 text-center">Avg Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
                          {filteredNodal.map((inst, i) => (
                            <tr key={inst.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-5 py-3 text-slate-500 font-bold">{i + 1}</td>
                              <td className="px-5 py-3">
                                <div className="font-bold text-white print:text-black">{inst.name}</div>
                                <div className="text-slate-500 text-[11px] mt-0.5 print:text-slate-600">
                                  {inst.code ? `Code: ${inst.code}` : inst.collegeId ? `College ID: ${inst.collegeId}` : 'Partner Institute'}
                                </div>
                              </td>
                              <td className="px-5 py-3 text-center font-semibold text-white print:text-black">
                                {inst.totalRegisteredStudents}
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] px-2 py-0.5 rounded-full font-bold">
                                  {inst.activeStudents}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center font-bold text-blue-400 print:text-black">
                                {inst.totalVisits}
                              </td>
                              <td className="px-5 py-3 text-center text-slate-400 print:text-black">
                                {inst.totalMinutesSpent}m
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] px-2 py-0.5 rounded-full font-bold">
                                  {inst.uniqueExperimentsRun}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center text-slate-300 print:text-black">
                                {inst.totalQuizAttempts}
                              </td>
                              <td className="px-5 py-3 text-center font-bold">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                  inst.avgQuizScore >= 70
                                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                                    : inst.avgQuizScore > 0
                                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                                    : 'bg-slate-800 border-white/5 text-slate-500'
                                }`}>
                                  {inst.avgQuizScore}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 1: ACADEMIC PROGRESS REPORT ── */}
            {activeTab === 'academic' && (
              filteredAcademic.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                  <p className="text-sm font-medium">No student records match the filter criteria.</p>
                </div>
              ) : (
                <div className="bg-slate-900/25 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs uppercase font-bold tracking-wider">
                          <th className="px-5 py-3.5">Student Details</th>
                          <th className="px-5 py-3.5">Institution / Dept</th>
                          <th className="px-5 py-3.5 text-center">Labs Visited</th>
                          <th className="px-5 py-3.5 text-center">Time Spent</th>
                          <th className="px-5 py-3.5 text-center">Quiz Attempts</th>
                          <th className="px-5 py-3.5 text-center">Pass Rate</th>
                          <th className="px-5 py-3.5 text-center font-bold">Avg Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
                        {filteredAcademic.map((r, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-3">
                              <div className="font-bold text-white print:text-black">{r.name}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5 print:text-slate-600">{r.email}</div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="text-slate-200 font-medium print:text-black truncate max-w-[200px]">{r.nodalCentreName}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5 print:text-slate-600">
                                {r.dept} {r.course !== '—' ? `• ${r.course}` : ''}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {r.uniqueLabsVisited}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center text-slate-400 print:text-black">{r.totalTimeSpentMinutes}m</td>
                            <td className="px-5 py-3 text-center">{r.quizAttemptsCount}</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${r.quizPassRate >= 70 ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-rose-500/10 border-rose-500/25 text-rose-400'}`}>
                                {r.quizPassRate}%
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center font-bold text-white print:text-black">{r.averageQuizScore}%</td>
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
                  <p className="text-sm font-medium">No quiz attempts match the selected criteria.</p>
                </div>
              ) : (
                <div className="bg-slate-900/25 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs uppercase font-bold tracking-wider">
                          <th className="px-5 py-3.5">Student</th>
                          <th className="px-5 py-3.5">Institution</th>
                          <th className="px-5 py-3.5">Experiment</th>
                          <th className="px-5 py-3.5 text-center">Type</th>
                          <th className="px-5 py-3.5 text-center">Score</th>
                          <th className="px-5 py-3.5 text-center">Status</th>
                          <th className="px-5 py-3.5 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
                        {filteredQuiz.map((q, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-3">
                              <div className="font-bold text-white print:text-black">{q.user?.name}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5 print:text-slate-600">{q.user?.email}</div>
                            </td>
                            <td className="px-5 py-3 text-slate-400 text-xs truncate max-w-[170px]">
                              {q.user?.nodalCentre?.name || '—'}
                            </td>
                            <td className="px-5 py-3">
                              <div className="text-white font-medium print:text-black">{q.experiment?.title}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5 print:text-slate-600">{q.experiment?.lab?.title}</div>
                            </td>
                            <td className="px-5 py-3 text-center capitalize text-slate-400 print:text-black">{q.quizType}</td>
                            <td className="px-5 py-3 text-center font-bold">{q.score}/{q.maxScore}</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${q.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                {q.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right text-slate-500 text-xs print:text-black">
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
                  <p className="text-sm font-medium">No student feedback found matching the filters.</p>
                </div>
              ) : (
                <div className="bg-slate-900/25 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs uppercase font-bold tracking-wider">
                          <th className="px-5 py-3.5">Student</th>
                          <th className="px-5 py-3.5">Institution</th>
                          <th className="px-5 py-3.5">Experiment</th>
                          <th className="px-5 py-3.5 text-center">Rating</th>
                          <th className="px-5 py-3.5">Student Comment</th>
                          <th className="px-5 py-3.5 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
                        {filteredFeedback.map((f, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-3">
                              <div className="font-bold text-white print:text-black">{f.user?.name}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5 print:text-slate-600">{f.user?.email}</div>
                            </td>
                            <td className="px-5 py-3 text-slate-400 text-xs truncate max-w-[160px]">
                              {f.user?.nodalCentre?.name || '—'}
                            </td>
                            <td className="px-5 py-3">
                              <div className="text-white font-medium print:text-black">{f.experiment?.title}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5 print:text-slate-600">{f.experiment?.lab?.title}</div>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                {[1,2,3,4,5].map(n => (
                                  <Star key={n} className={`w-3.5 h-3.5 ${n <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3 italic text-slate-300 print:text-black max-w-xs truncate">
                              {f.comment ? `"${f.comment}"` : '—'}
                            </td>
                            <td className="px-5 py-3 text-right text-slate-500 text-xs print:text-black">
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
                          <th className="px-5 py-3.5">Experiment Page</th>
                          <th className="px-5 py-3.5 text-center">Total Visits</th>
                          <th className="px-5 py-3.5 text-center">Avg Duration</th>
                          <th className="px-5 py-3.5 text-center">Device Distribution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
                        {filteredPagewise.map((p, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-3">
                              <div className="font-bold text-white print:text-black">{p.title}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5 print:text-slate-600">{p.labTitle}</div>
                            </td>
                            <td className="px-5 py-3 text-center font-bold text-white print:text-black">
                              {p.totalVisits}
                            </td>
                            <td className="px-5 py-3 text-center text-slate-400 print:text-black">
                              {p.avgDurationMinutes} mins
                            </td>
                            <td className="px-5 py-3">
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
