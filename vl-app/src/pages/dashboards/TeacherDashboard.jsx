import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, RefreshCw, GraduationCap } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import UserTable       from '../../components/dashboard/UserTable';
import AddUserModal    from '../../components/dashboard/AddUserModal';
import { useAuth }     from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { token, API_URL, user } = useAuth();
  const [stats,    setStats]    = useState(null);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/users/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/users`,       { headers: { Authorization: `Bearer ${token}` } }),
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

      {/* Stat card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 overflow-hidden col-span-1">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-white/70 text-sm font-medium mb-1">My Students</div>
            <div className="text-white text-4xl font-bold">{stats?.totalStudents ?? '—'}</div>
            <div className="text-white/60 text-xs mt-1">enrolled under you</div>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 col-span-1 sm:col-span-1 lg:col-span-2">
          <h4 className="text-white font-semibold mb-3">Quick Info</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Your Email</span>
              <span className="text-slate-200">{user?.email}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Role</span>
              <span className="text-blue-400 font-medium">Teacher</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Can Add</span>
              <span className="text-slate-200">Students only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Students section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" /> My Students
          <span className="text-slate-500 text-sm font-normal">({students.length})</span>
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <UserTable users={students} loading={loading} onRefresh={fetchAll} />

      <AddUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchAll}
        defaultRole="student"
      />
    </DashboardLayout>
  );
}
