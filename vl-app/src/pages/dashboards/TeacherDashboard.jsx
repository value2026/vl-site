import { useState, useEffect, useCallback } from 'react';
import { BookOpen, RefreshCw, GraduationCap, Users } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import UserTable       from '../../components/dashboard/UserTable';
import { useAuth }     from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { token, API_URL, user } = useAuth();
  const [stats,    setStats]    = useState(null);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const location = useLocation();

  const isStudentsPage = location.pathname.endsWith('/students');
  const isOverviewPage = !isStudentsPage;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/users/stats`,              { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/users`,                    { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [statsData, usersData] = await Promise.all([statsRes.json(), usersRes.json()]);
      setStats(statsData);
      setStudents(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Teacher fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <DashboardLayout title="Teacher Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h2>
          <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Teacher Portal
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat cards (Overview Only) */}
      {isOverviewPage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 overflow-hidden col-span-1 flex flex-col justify-between min-h-48 shadow-lg shadow-black/10">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-white/70 text-sm font-medium mb-1">Institute Students</div>
              <div className="text-white text-4xl font-bold">{students.length}</div>
              <div className="text-white/60 text-xs mt-1">in your institute</div>
            </div>
          </div>

          {/* Info card */}
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 col-span-1 flex flex-col justify-between min-h-48">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2">Teacher Details</h4>
            <div className="space-y-3 text-xs flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-center text-slate-400">
                <span>Email Address</span>
                <span className="text-slate-200 font-semibold">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Portal Level</span>
                <span className="text-blue-400 font-semibold uppercase tracking-wide">Teacher</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Access Level</span>
                <span className="text-slate-200 font-semibold">View-only student roster</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students section (Rendered on both Overview and Students Tab) */}
      {(isOverviewPage || isStudentsPage) && (
        <>
          <div className="flex items-center justify-between mb-4 mt-8">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> {isStudentsPage ? 'All Students' : 'Recent Students'}
              <span className="text-slate-500 text-sm font-normal">({students.length})</span>
            </h3>
            <span className="text-xs text-slate-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              View only — contact Nodal Centre to manage students
            </span>
          </div>

          <UserTable
            users={isStudentsPage ? students : students.slice(0, 5)}
            loading={loading}
            onRefresh={fetchAll}
            viewOnly
          />
        </>
      )}
    </DashboardLayout>
  );
}
