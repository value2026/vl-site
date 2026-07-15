import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, BookOpen, Plus, RefreshCw, Building2 } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import UserTable       from '../../components/dashboard/UserTable';
import AddUserModal    from '../../components/dashboard/AddUserModal';
import UpcomingCallsCard from '../../components/communication/UpcomingCallsCard';
import { useAuth }     from '../../context/AuthContext';

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-6 overflow-hidden flex flex-col justify-between min-h-40 shadow-lg shadow-black/10`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
      <div className="relative z-10">
        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-white/70 text-sm font-medium mb-1">{label}</div>
        <div className="text-white text-4xl font-bold">{value ?? '—'}</div>
      </div>
    </div>
  );
}

export default function NodalCentreDashboard() {
  const { token, API_URL, user } = useAuth();
  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [defaultRole, setDefaultRole] = useState('teacher');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/users/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/users`,       { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [statsData, usersData] = await Promise.all([statsRes.json(), usersRes.json()]);
      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Nodal fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openModal = (role) => { setDefaultRole(role); setShowModal(true); };

  const teachers = users.filter((u) => u.role === 'teacher');
  const students = users.filter((u) => u.role === 'student');

  return (
    <DashboardLayout title="Nodal Centre Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">{user?.name}</h2>
          <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Nodal Centre Portal
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={GraduationCap} label="Teachers"  value={stats?.totalTeachers} gradient="from-blue-600 to-indigo-700" />
        <StatCard icon={BookOpen}      label="Students"  value={stats?.totalStudents}  gradient="from-emerald-500 to-green-600" />
        <div className="col-span-1">
          <UpcomingCallsCard />
        </div>
      </div>

      {/* Teachers section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" /> Teachers
            <span className="text-slate-500 text-sm font-normal">({teachers.length})</span>
          </h3>
          <button
            onClick={() => openModal('teacher')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Teacher
          </button>
        </div>
        <UserTable users={teachers} loading={loading} onRefresh={fetchAll} />
      </div>

      {/* Students section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" /> Students
            <span className="text-slate-500 text-sm font-normal">({students.length})</span>
          </h3>
          <button
            onClick={() => openModal('student')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
        <UserTable users={students} loading={loading} onRefresh={fetchAll} />
      </div>

      <AddUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchAll}
        defaultRole={defaultRole}
      />
    </DashboardLayout>
  );
}
