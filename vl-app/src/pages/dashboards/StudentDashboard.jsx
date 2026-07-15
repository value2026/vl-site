import { FlaskConical, BookOpen, Award, Clock, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth }     from '../../context/AuthContext';
import UpcomingCallsCard from '../../components/communication/UpcomingCallsCard';

export default function StudentDashboard() {
  const { user } = useAuth();

  const labs = [
    { title: 'Physics Lab',   icon: '⚛️',  desc: 'Mechanics, thermodynamics & more', color: 'from-blue-600 to-indigo-700' },
    { title: 'Chemistry Lab', icon: '🧪',  desc: 'Reactions, titrations & analysis', color: 'from-purple-600 to-violet-700' },
    { title: 'Biology Lab',   icon: '🔬',  desc: 'Cell biology & genetics',           color: 'from-emerald-600 to-green-700' },
    { title: 'Math Lab',      icon: '📐',  desc: 'Calculus, algebra & statistics',    color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <DashboardLayout title="Student Dashboard">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute right-16 -bottom-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">
            🎓
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold">Hello, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-white/70 text-sm mt-0.5">Welcome to your Virtual Labs portal</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Active Student
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { icon: FlaskConical, label: 'Labs Available', value: '4',  color: 'text-blue-400' },
          { icon: BookOpen,     label: 'Labs Completed', value: '0',  color: 'text-emerald-400' },
          { icon: Award,        label: 'Certificates',   value: '0',  color: 'text-amber-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-slate-900 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className="text-white text-2xl font-bold">{value}</div>
              <div className="text-slate-400 text-xs">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile info & Video consultations row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> My Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Full Name', value: user?.name },
              { label: 'Email',    value: user?.email },
              { label: 'Role',     value: 'Student' },
              { label: 'Status',   value: 'Active' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/3 rounded-xl p-4">
                <div className="text-slate-500 text-xs mb-1">{label}</div>
                <div className="text-white font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1">
          <UpcomingCallsCard />
        </div>
      </div>

      {/* Virtual Labs */}
      <h3 className="text-white font-semibold text-lg mb-4">Available Labs</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {labs.map(({ title, icon, desc, color }) => (
          <div
            key={title}
            className="group bg-slate-900 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:bg-white/3"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm">{title}</div>
              <div className="text-slate-400 text-xs mt-0.5">{desc}</div>
            </div>
            <div className="text-slate-600 group-hover:text-slate-300 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
