import { useState, useEffect } from 'react';
import {
  TrendingUp, Users, Eye, FileText, CheckCircle2,
  Tv, Smartphone, Laptop, Loader2, Award, Clock, Star,
  AlertCircle
} from 'lucide-react';
import { api } from '../../utils/api';

// ── Custom SVG Sparkline for registration trends ───────────────
function Sparkline({ data = [] }) {
  if (data.length < 2) return <div className="text-slate-500 text-xs">Awaiting data...</div>;
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
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Area */}
        <path
          d={`M0,${height} L${points} L${width},${height} Z`}
          fill="url(#chartGrad)"
        />
        {/* Line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]"
        />
        {/* Dots */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((d.count - min) / range) * (height - 30) - 15;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="#1e293b"
              stroke="#60a5fa"
              strokeWidth="2.5"
              className="hover:r-6 cursor-pointer transition-all"
            />
          );
        })}
      </svg>
      {/* Date labels */}
      <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-1 font-semibold uppercase tracking-wider">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

// ── Custom SVG Bar chart for Peak Hours ─────────────────────────
function BarChart({ data = [] }) {
  if (data.length === 0) return <div className="text-slate-500 text-xs">No active usage...</div>;
  const values = data.map((d) => d.count);
  const max = Math.max(...values, 5);
  const height = 140;

  return (
    <div className="flex items-end justify-between h-40 gap-1.5 pt-4 bg-slate-950/20 border border-white/5 p-4 rounded-2xl">
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
            <div className="w-full relative flex flex-col justify-end h-28">
              {/* Tooltip */}
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-[9px] font-bold text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {d.count} hits
              </span>
              {/* Bar */}
              <div
                style={{ height: `${pct || 4}%` }}
                className={`w-full rounded-t-md transition-all duration-500 ${d.count > 0 ? 'bg-gradient-to-t from-blue-600 to-cyan-400 group-hover:brightness-125' : 'bg-white/5'}`}
              />
            </div>
            <span className="text-[8px] text-slate-500 font-bold mt-1.5">{d.hour.split(':')[0]}h</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' | 'google-analytics'
  const [gaStats, setGaStats] = useState(null);
  const [gaLoading, setGaLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'google-analytics' && !gaStats && !gaLoading) {
      const fetchGAStats = async () => {
        setGaLoading(true);
        try {
          const res = await api.get('/analytics/google-analytics');
          if (res.ok) setGaStats(await res.json());
        } catch (err) {
          console.error(err);
        } finally {
          setGaLoading(false);
        }
      };
      fetchGAStats();
    }
  }, [activeTab, gaStats, gaLoading]);

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16 text-slate-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Unable to retrieve analytics dashboard. Try again later.</p>
      </div>
    );
  }

  const { counts, activeUsers, registrationTrends, popularExperiments, popularLabs = [], topStudents = [], recentActivity = [], quizzes, devices, peakDistribution } = stats;

  const totalDev = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0) || 1;
  const devStats = [
    { label: 'Desktop', val: devices.desktop, icon: Laptop, color: 'bg-blue-500', pct: Math.round(((devices.desktop || 0) / totalDev) * 100) },
    { label: 'Mobile',  val: devices.mobile,  icon: Smartphone, color: 'bg-emerald-500', pct: Math.round(((devices.mobile || 0) / totalDev) * 100) },
    { label: 'Tablet',  val: devices.tablet,  icon: Tv, color: 'bg-amber-500', pct: Math.round(((devices.tablet || 0) / totalDev) * 100) },
  ];

  return (
    <div className="space-y-6">
      {/* Sleek Tab Switcher */}
      <div className="flex border-b border-white/10 pb-px gap-4 mb-2">
        <button
          onClick={() => setActiveTab('academic')}
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-all duration-150 flex items-center gap-2 ${
            activeTab === 'academic'
              ? 'border-blue-500 text-blue-400 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Award className="w-4.5 h-4.5 text-blue-400" />
          Academic & Lab Reports
        </button>
        <button
          onClick={() => setActiveTab('google-analytics')}
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-all duration-150 flex items-center gap-2 ${
            activeTab === 'google-analytics'
              ? 'border-blue-500 text-blue-400 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
          Google Analytics Traffic
        </button>
      </div>

      {activeTab === 'academic' ? (
        <div className="space-y-6">
          {/* Overview stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Registered Students', val: counts.totalUsers, icon: Users, color: 'from-blue-600 to-indigo-700' },
              { label: 'Active Learners (MAU)', val: activeUsers.mau, icon: TrendingUp, color: 'from-emerald-500 to-green-600' },
              { label: 'Total Lab Visits', val: counts.totalVisits, icon: Eye, color: 'from-purple-600 to-violet-700' },
              { label: 'Average Quiz Score', val: `${quizzes.averageScore}%`, icon: Award, color: 'from-amber-500 to-orange-600' },
            ].map((c, i) => (
              <div key={i} className={`relative bg-gradient-to-br ${c.color} rounded-2xl p-5 overflow-hidden shadow-lg shadow-black/10`}>
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                    <c.icon className="w-4 h-4 text-white" />
                  </div>
                  <h5 className="text-white/75 text-xs font-semibold uppercase tracking-wider">{c.label}</h5>
                  <div className="text-white text-3xl font-extrabold mt-1">{c.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Active metrics table */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'DAU (Daily Active)', val: activeUsers.dau, sub: 'Users today' },
              { label: 'WAU (Weekly Active)', val: activeUsers.wau, sub: 'Last 7 days' },
              { label: 'MAU (Monthly Active)', val: activeUsers.mau, sub: 'Last 30 days' },
            ].map((act, i) => (
              <div key={i} className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-white font-extrabold text-2xl">{act.val}</div>
                <div className="text-slate-400 text-xs mt-0.5">{act.label}</div>
                <div className="text-slate-500 text-[10px] mt-1 italic">{act.sub}</div>
              </div>
            ))}
          </div>

          {/* Primary Graphs Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sparkline for registration Trends */}
            <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300">Daily Registrations Trend</h4>
              <Sparkline data={registrationTrends} />
            </div>

            {/* Peak Hours distribution */}
            <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300">Peak Usage Hours (Hourly Distribution)</h4>
              <BarChart data={peakDistribution} />
            </div>
          </div>

          {/* Detailed statistics breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Popular Experiments */}
            <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5 md:col-span-2">
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300">Most Visited Experiments</h4>
              {popularExperiments.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-10 text-center">Awaiting platform usage data...</p>
              ) : (
                <div className="space-y-2.5">
                  {popularExperiments.map((exp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-950/20 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 w-6 h-6 flex items-center justify-center rounded-lg border border-blue-500/20">{idx + 1}</span>
                        <span className="text-white font-bold text-sm">{exp.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">{exp.visits} visits</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Browser / Device breakdown */}
            <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5">
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300">Device Breakdown</h4>
              <div className="space-y-4 pt-2">
                {devStats.map((dev, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-400 flex items-center gap-2">
                        <dev.icon className="w-4 h-4 text-slate-400" />
                        {dev.label}
                      </span>
                      <span className="text-white font-bold">{dev.pct}% ({dev.val || 0})</span>
                    </div>
                    <div className="w-full bg-slate-950/50 rounded-full h-2 overflow-hidden border border-white/5">
                      <div style={{ width: `${dev.pct || 0}%` }} className={`h-full rounded-full ${dev.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom analytical lists block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Popular Labs */}
            <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5">
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300">Most Popular Labs</h4>
              {popularLabs.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-6 text-center">No lab visit history...</p>
              ) : (
                <div className="space-y-2">
                  {popularLabs.map((l, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/20 border border-white/5 rounded-xl text-xs">
                      <span className="text-slate-300 font-bold truncate max-w-[170px]">{l.name}</span>
                      <span className="text-blue-400 font-semibold">{l.visits} visits</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Performing Students */}
            <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5">
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300">Top Performers (Avg Score)</h4>
              {topStudents.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-6 text-center">No quiz attempts recorded...</p>
              ) : (
                <div className="space-y-2">
                  {topStudents.map((stud, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/20 border border-white/5 rounded-xl text-xs">
                      <div>
                        <div className="text-white font-bold">{stud.name}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[130px]">{stud.email}</div>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">{stud.avgScore}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5">
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300">Recent Platform Activity</h4>
              {recentActivity.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-6 text-center">No student activity logged...</p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="p-2 bg-slate-950/20 border border-white/5 rounded-xl text-[10px] leading-relaxed">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-white font-semibold">{act.userName}</span>
                        <span>{new Date(act.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Visited <span className="text-blue-400 font-medium">{act.expTitle}</span> via {act.device}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {gaLoading || !gaStats ? (
            <div className="flex justify-center py-24 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Configuration alert */}
              {gaStats.isDemo && (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-amber-400 font-bold text-sm">Showing Simulated Google Analytics Data</h5>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      The server is running in sandbox mode because the GA4 Data API credentials are not configured. To connect your live property data, add the following environment variables to your backend <code className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono">.env</code> file:
                    </p>
                    <div className="mt-3 text-[10px] font-mono text-slate-300 space-y-1 bg-black/35 p-3 rounded-lg border border-white/5 select-all">
                      <div>GA_PROPERTY_ID=your_ga4_property_id</div>
                      <div>GA_CLIENT_EMAIL=your_service_account_client_email</div>
                      <div>GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."</div>
                    </div>
                  </div>
                </div>
              )}

              {/* GA Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[

                  { label: 'Active Users (Live)', val: gaStats.overview.activeUsers.toLocaleString(), icon: Users, color: 'from-blue-600 to-indigo-700' },
                  { label: 'Total Sessions (30d)', val: gaStats.overview.sessions.toLocaleString(), icon: TrendingUp, color: 'from-emerald-500 to-green-600' },
                  { label: 'Avg Engagement Time', val: gaStats.overview.avgEngagementTime, icon: Clock, color: 'from-purple-600 to-violet-700' },
                  { label: 'Total Page Views', val: gaStats.overview.pageViews.toLocaleString(), icon: Eye, color: 'from-amber-500 to-orange-600' },
                ].map((c, i) => (
                  <div key={i} className={`relative bg-gradient-to-br ${c.color} rounded-2xl p-5 overflow-hidden shadow-lg shadow-black/10`}>
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                        <c.icon className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="text-white/75 text-xs font-semibold uppercase tracking-wider">{c.label}</h5>
                      <div className="text-white text-3xl font-extrabold mt-1">{c.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* GA Detailed Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traffic Channels */}
                <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5">
                  <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Acquisition Channels
                  </h4>
                  <div className="space-y-4 pt-2">
                    {gaStats.channels.map((ch, idx) => {
                      const totalCh = gaStats.channels.reduce((sum, c) => sum + c.value, 0) || 1;
                      const pct = Math.round((ch.value / totalCh) * 100);
                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-slate-300 font-medium">{ch.name}</span>
                            <span className="text-white font-bold">{pct}% ({ch.value})</span>
                          </div>
                          <div className="w-full bg-slate-950/50 rounded-full h-2 overflow-hidden border border-white/5">
                            <div style={{ width: `${pct}%` }} className="h-full rounded-full bg-blue-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Country breakdown */}
                <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5">
                  <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    Geographic Audience (Top Countries)
                  </h4>
                  <div className="space-y-4 pt-2">
                    {gaStats.countries.map((ct, idx) => {
                      const totalCt = gaStats.countries.reduce((sum, c) => sum + c.value, 0) || 1;
                      const pct = Math.round((ct.value / totalCt) * 100);
                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-slate-300 font-medium">{ct.name}</span>
                            <span className="text-white font-bold">{pct}% ({ct.value})</span>
                          </div>
                          <div className="w-full bg-slate-950/50 rounded-full h-2 overflow-hidden border border-white/5">
                            <div style={{ width: `${pct}%` }} className="h-full rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Popular Public Pages */}
              <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5">
                <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300">Most Visited Public Pages</h4>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4 font-semibold">Page Title & Path</th>
                        <th className="pb-3 text-right font-semibold">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {gaStats.pages.map((p, idx) => (
                        <tr key={idx} className="text-xs">
                          <td className="py-3.5 pr-4">
                            <div className="text-white font-bold">{p.title}</div>
                            <div className="text-slate-500 text-[10px] font-mono mt-0.5">{p.path}</div>
                          </td>
                          <td className="py-3.5 text-right font-bold text-blue-400">
                            {p.views.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
