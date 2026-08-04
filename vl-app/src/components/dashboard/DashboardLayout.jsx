import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FlaskConical, LayoutDashboard, Users, GraduationCap, BookOpen,
  LogOut, Menu, X, ChevronRight, Bell, TrendingUp, FileText, Globe, KeyRound, Building2, Presentation, ClipboardList, Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { assetUrl } from '../../utils/url';

const NAV = {
  admin: [
    { icon: LayoutDashboard, label: 'Overview',        path: '/dashboard/admin' },
    { icon: Users,           label: 'User Management', path: '/dashboard/admin/users' },
    { icon: Building2,       label: 'Institutions',    path: '/dashboard/admin/institutions' },
    { icon: Presentation,    label: 'Workshops',       path: '/dashboard/admin/workshops' },
    { icon: FlaskConical,    label: 'Lab Management',  path: '/dashboard/admin/labs' },
    { icon: FileText,        label: 'Contact Messages', path: '/dashboard/admin/messages' },
    { icon: ClipboardList,   label: 'Surveys',          path: '/dashboard/admin/surveys' },
    { icon: TrendingUp,      label: 'Usage Analytics',  path: '/dashboard/admin/analytics' },
    { icon: Globe,           label: 'Manage Pages',    path: '/dashboard/admin/pages' },
  ],
  vl_manager: [
    { icon: LayoutDashboard, label: 'Overview',        path: '/dashboard/vl-manager' },
    { icon: Users,           label: 'User Management', path: '/dashboard/vl-manager/users' },
    { icon: Building2,       label: 'Institutions',    path: '/dashboard/vl-manager/institutions' },
    { icon: Presentation,    label: 'Workshops',       path: '/dashboard/vl-manager/workshops' },
    { icon: FlaskConical,    label: 'Lab Management',  path: '/dashboard/vl-manager/labs' },
    { icon: FileText,        label: 'Contact Messages', path: '/dashboard/vl-manager/messages' },
    { icon: ClipboardList,   label: 'Surveys',          path: '/dashboard/vl-manager/surveys' },
    { icon: Globe,           label: 'Manage Pages',    path: '/dashboard/vl-manager/pages' },
    { icon: TrendingUp,      label: 'Usage Analytics',  path: '/dashboard/vl-manager/analytics' },
  ],
  vl_coordinator: [
    { icon: LayoutDashboard, label: 'Overview',        path: '/dashboard/vl-coordinator' },
    { icon: Users,           label: 'User Management', path: '/dashboard/vl-coordinator/users' },
    { icon: Building2,       label: 'Institutions',    path: '/dashboard/vl-coordinator/institutions' },
    { icon: Presentation,    label: 'Workshops',       path: '/dashboard/vl-coordinator/workshops' },
    { icon: FlaskConical,    label: 'Lab Management',  path: '/dashboard/vl-coordinator/labs' },
    { icon: ClipboardList,   label: 'Surveys',          path: '/dashboard/vl-coordinator/surveys' },
    { icon: TrendingUp,      label: 'Usage Analytics',  path: '/dashboard/vl-coordinator/analytics' },
  ],
  nodal_centre: [
    { icon: LayoutDashboard, label: 'Overview',  path: '/dashboard/nodal' },
    { icon: GraduationCap,   label: 'Teachers',  path: '/dashboard/nodal/teachers' },
    { icon: BookOpen,        label: 'Students',  path: '/dashboard/nodal/students' },
    { icon: TrendingUp,      label: 'Usage Analytics',  path: '/dashboard/nodal/analytics' },
    { icon: FileText,        label: 'Academic Reports', path: '/dashboard/nodal/reports' },
  ],
  teacher: [
    { icon: LayoutDashboard, label: 'Overview',    path: '/dashboard/teacher' },
    { icon: BookOpen,        label: 'My Students', path: '/dashboard/teacher/students' },
    { icon: ClipboardList,   label: 'Assignments', path: '/dashboard/teacher/assignments' },
    { icon: TrendingUp,      label: 'Usage Analytics',  path: '/dashboard/teacher/analytics' },
    { icon: FileText,        label: 'Academic Reports', path: '/dashboard/teacher/reports' },
  ],
  student: [
    { icon: LayoutDashboard, label: 'Learning Workspace', path: '/dashboard/student' },
  ],
};

const ROLE_CONFIG = {
  admin:        { label: 'Administrator', gradient: 'from-red-500 to-rose-600',     badge: 'bg-red-500/20 text-red-300 border-red-500/30' },
  vl_manager:   { label: 'VL Manager',    gradient: 'from-pink-500 to-rose-500',    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  vl_coordinator:{ label: 'Co-ordinator', gradient: 'from-purple-500 to-indigo-500',badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  nodal_centre: { label: 'Nodal Centre',  gradient: 'from-orange-500 to-amber-500', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  teacher:      { label: 'Teacher',       gradient: 'from-blue-500 to-indigo-600',  badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  student:      { label: 'Student',       gradient: 'from-emerald-500 to-green-600',badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const cfg     = ROLE_CONFIG[user?.role] || ROLE_CONFIG.student;
  const navItems = NAV[user?.role] || [];

  const handleLogout = () => {
    setShowSignOutConfirm(false);
    logout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl shadow-lg flex items-center justify-center">
            <img src={assetUrl('/amrita-icon.jpg')} alt="Amrita Logo" className="w-8 h-8 object-contain rounded" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">VALUE @ Amrita</div>
            <div className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Management Portal</div>
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
        <div className="text-slate-400 text-xs truncate mb-2">{user?.email}</div>
        <Link
          to="/dashboard/profile"
          onClick={() => setSidebarOpen(false)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-all"
        >
          <KeyRound className="w-3 h-3" /> Profile Settings
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
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
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
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
      <div className="p-4 border-t border-white/10 bg-slate-900/50 mt-auto">
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 transition-all duration-200 group shadow-sm shadow-red-500/5"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
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
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-200 mr-3"
            title="Go to Website Home"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Live Home</span>
          </Link>
          <button className="relative text-slate-400 hover:text-white transition-colors mr-3" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </button>

        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      
      {/* Custom Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSignOutConfirm(false)}></div>
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-sm m-4 z-10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Sign Out</h3>
            <p className="text-slate-400 text-sm mb-6">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-medium text-white transition-all shadow-lg shadow-red-500/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
