import { useState, useEffect } from 'react';
import { Download, Loader2, Award, BookOpen, Clock, FileText, Search } from 'lucide-react';
import { api } from '../../utils/api';

export default function StudentAcademicReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/reports/academic');
      if (res.ok) setReports(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleExportCSV = () => {
    if (reports.length === 0) return;
    const headers = ['Name', 'Email', 'Unique Labs Visited', 'Minutes Spent', 'Quiz Attempts Count', 'Quiz Pass Rate (%)', 'Average Score (%)'];
    const rows = reports.map((r) => [
      r.name,
      r.email,
      r.uniqueLabsVisited,
      r.totalTimeSpentMinutes,
      r.quizAttemptsCount,
      `${r.quizPassRate}%`,
      `${r.averageQuizScore}%`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `academic_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = reports.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-white font-bold text-lg">Student Academic Reports</h3>
          <p className="text-slate-400 text-xs mt-0.5">Track learning progress, lab visits, and quiz pass rates</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={reports.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter students by name or email..."
          className="w-full bg-slate-900/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 text-slate-500" />
          <p className="text-sm font-medium">No academic report details available.</p>
        </div>
      ) : (
        <div className="bg-slate-900/25 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">Labs Visited</th>
                  <th className="px-6 py-4 text-center">Time Invested</th>
                  <th className="px-6 py-4 text-center">Quiz Attempts</th>
                  <th className="px-6 py-4 text-center">Quiz Pass Rate</th>
                  <th className="px-6 py-4 text-center">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{r.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        <BookOpen className="w-3 h-3" /> {r.uniqueLabsVisited}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400">
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {r.totalTimeSpentMinutes}m
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">{r.quizAttemptsCount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${r.quizPassRate >= 70 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : r.quizPassRate >= 40 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                        {r.quizPassRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Award className="w-4 h-4 text-slate-500" />
                        <span className="font-bold text-white">{r.averageQuizScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
