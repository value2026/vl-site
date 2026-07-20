import { useState, useEffect, useCallback } from 'react';
import { Users, Building2, GraduationCap, BookOpen, Plus, RefreshCw, Briefcase } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import UserTable       from '../../components/dashboard/UserTable';
import AddUserModal    from '../../components/dashboard/AddUserModal';
import { useAuth }     from '../../context/AuthContext';

function StatCard({ icon: Icon, label, value, gradient, sub }) {
  return (
    <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-6 overflow-hidden`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
      <div className="relative z-10">
        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-white/70 text-sm font-medium mb-1">{label}</div>
        <div className="text-white text-4xl font-bold">{value ?? '—'}</div>
        {sub && <div className="text-white/60 text-xs mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function VLManagerDashboard() {
  const { token, API_URL } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/users/stats`,  { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/users`,        { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [statsData, usersData] = await Promise.all([statsRes.json(), usersRes.json()]);
      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('VL Manager fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <DashboardLayout title="VL Manager Dashboard">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">Overview</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage platform outreach and users</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Briefcase}
          label="VL Managers"
          value={stats?.totalAdmins || 0} // Needs exact stat endpoint updates if desired
          gradient="from-pink-500 to-rose-600"
          sub="Platform Managers"
        />
        <StatCard
          icon={Building2}
          label="Nodal Centres"
          value={stats?.totalNodalCentres}
          gradient="from-orange-500 to-amber-600"
          sub="Partner institutions"
        />
        <StatCard
          icon={GraduationCap}
          label="Teachers"
          value={stats?.totalTeachers}
          gradient="from-blue-600 to-indigo-700"
          sub="Faculty members"
        />
        <StatCard
          icon={BookOpen}
          label="Students"
          value={stats?.totalStudents}
          gradient="from-emerald-500 to-green-600"
          sub="Enrolled learners"
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-400" />
          All Users
        </h3>
        <span className="text-slate-500 text-sm">{users.length} total</span>
      </div>
      <UserTable users={users} loading={loading} onRefresh={fetchAll} />

      <AddUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchAll}
      />
    </DashboardLayout>
  );
}
