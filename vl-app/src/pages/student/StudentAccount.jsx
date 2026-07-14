import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, BookOpen, Award, User, Mail, Calendar, Home, Loader2 } from 'lucide-react';
import StudentNav from '../../components/student/StudentNav';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

export default function StudentAccount() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ subjects: 0, labs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [subRes, labsRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/labs'),
        ]);
        if (subRes.ok && labsRes.ok) {
          const subjects = await subRes.json();
          const labs = await labsRes.json();
          setStats({
            subjects: subjects.length,
            labs: labs.length,
          });
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav breadcrumb={[{ label: 'My Account' }]} />

      <main className="pt-14 max-w-3xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">{user?.name}</h1>
              <p className="text-white/70 text-sm">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mt-2 border border-white/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Active Student
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {loading ? (
            <div className="col-span-3 flex justify-center py-6 bg-white border border-gray-200 rounded-2xl">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            [
              { icon: FlaskConical, label: 'Subjects',    value: stats.subjects, color: 'text-blue-500' },
              { icon: BookOpen,     label: 'Labs',        value: stats.labs,     color: 'text-purple-500' },
              { icon: Award,        label: 'Completed',   value: 0,               color: 'text-amber-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <div className="text-gray-900 text-2xl font-bold">{value}</div>
                <div className="text-gray-400 text-xs mt-0.5">{label}</div>
              </div>
            ))
          )}
        </div>

        {/* Profile Details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-gray-900 font-bold text-base mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" /> Profile Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name',     value: user?.name,   icon: User },
              { label: 'Email Address', value: user?.email,  icon: Mail },
              { label: 'Role',          value: 'Student',    icon: Award },
              { label: 'Status',        value: 'Active',     icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </div>
                <div className="text-gray-900 font-medium text-sm">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to learning */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-blue-900 font-semibold text-sm">Ready to learn?</div>
            <div className="text-blue-600 text-xs mt-0.5">Go back to the subject library</div>
          </div>
          <Link
            to="/student"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-blue-200"
          >
            <Home className="w-4 h-4" /> My Labs
          </Link>
        </div>
      </main>
    </div>
  );
}
