import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FlaskConical, LayoutDashboard, Users, GraduationCap, BookOpen,
  LogOut, Menu, X, ChevronRight, Bell, TrendingUp, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  admin: [
    { icon: LayoutDashboard, label: 'Overview',        path: '/dashboard/admin' },
    { icon: Users,           label: 'User Management', path: '/dashboard/admin/users' },
    { icon: FlaskConical,    label: 'Lab Management',  path: '/dashboard/admin/labs' },
    { icon: TrendingUp,      label: 'Usage Analytics',  path: '/dashboard/admin/analytics' },
  ],
  nodal_centre: [
    { icon: LayoutDashboard, label: 'Overview',  path: '/dashboard/nodal' },
    { icon: GraduationCap,   label: 'Teachers',  path: '/dashboard/nodal/teachers' },
    { icon: BookOpen,        label: 'Students',  path: '/dashboard/nodal/students' },
    { icon: FlaskConical,    label: 'Lab Management',  path: '/dashboard/nodal/labs' },
    { icon: TrendingUp,      label: 'Usage Analytics',  path: '/dashboard/nodal/analytics' },
    { icon: FileText,        label: 'Academic Reports', path: '/dashboard/nodal/reports' },
  ],
  teacher: [
    { icon: LayoutDashboard, label: 'Overview',    path: '/dashboard/teacher' },
    { icon: BookOpen,        label: 'My Students', path: '/dashboard/teacher/students' },
    { icon: FlaskConical,    label: 'Lab Management',  path: '/dashboard/teacher/labs' },
    { icon: TrendingUp,      label: 'Usage Analytics',  path: '/dashboard/teacher/analytics' },
    { icon: FileText,        label: 'Academic Reports', path: '/dashboard/teacher/reports' },
  ],
  student: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/student' },
  ],
};

const ROLE_CONFIG = {
  admin:        { label: 'Administrator', gradient: 'from-red-500 to-rose-600',     badge: 'bg-red-500/20 text-red-300 border-red-500/30' },
  nodal_centre: { label: 'Nodal Centre',  gradient: 'from-orange-500 to-amber-500', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  teacher:      { label: 'Teacher',       gradient: 'from-blue-500 to-indigo-600',  badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  student:      { label: 'Student',       gradient: 'from-emerald-500 to-green-600',badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cfg     = ROLE_CONFIG[user?.role] || ROLE_CONFIG.student;
  const navItems = NAV[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${cfg.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Virtual Labs</div>
            <div className="text-slate-400 text-xs">Management Portal</div>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 m-4 bg-white/5 rounded-2xl border border-white/10">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border mb-2 ${cfg.badge}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {cfg.label}
        </div>
        <div className="text-white font-semibold text-sm truncate">{user?.name}</div>
        <div className="text-slate-400 text-xs truncate">{user?.email}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? `bg-gradient-to-r ${cfg.gradient} text-white shadow-lg`
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-white/10 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-slate-900 border-r border-white/10 h-full z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-16 bg-slate-900/80 backdrop-blur border-b border-white/10 flex items-center gap-4 px-6">
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-white font-semibold text-lg flex-1">{title}</h1>
          <button className="relative text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className={`w-8 h-8 bg-gradient-to-br ${cfg.gradient} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
