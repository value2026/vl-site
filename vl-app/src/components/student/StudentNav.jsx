import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, Search, User, LogOut, LayoutDashboard, ChevronDown, X, Bell, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

export default function StudentNav({ breadcrumb = [] }) {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [dropOpen, setDropOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropRef = useRef(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen]         = useState(false);
  const notifRef                          = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/assignments/notifications');
      if (res.ok) setNotifications(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markNotificationsRead = async () => {
    try {
      const res = await api.put('/assignments/notifications/read-all');
      if (res.ok) fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shadow-sm">
      {/* Logo */}
      <Link to="/student" className="flex items-center gap-2.5 flex-shrink-0 group" aria-label="VALUE @ Amrita Home">
        <div className="flex items-baseline mt-0.5 ml-2">
          <span className="text-[#1e3a8a] text-[1.2rem] font-bold tracking-tight uppercase" style={{ fontFamily: 'Arial, sans-serif' }}>
            VALUE
          </span>
          <span className="text-[#4b5563] text-[1.2rem] italic ml-2" style={{ fontFamily: 'Georgia, serif' }}>
            @ Amrita
          </span>
        </div>
      </Link>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 overflow-hidden">
          <Link to="/student" className="hover:text-blue-600 transition-colors flex-shrink-0">Home</Link>
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              <span className="text-gray-300">/</span>
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-blue-600 transition-colors truncate max-w-[140px]">{crumb.label}</Link>
              ) : (
                <span className="text-gray-900 font-medium truncate max-w-[140px]">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Search */}
      <button
        onClick={() => setSearchOpen(!searchOpen)}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </button>
 
      {/* Notifications Bell */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => {
            setNotifOpen(!notifOpen);
            if (!notifOpen) {
              markNotificationsRead();
            }
          }}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all relative"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Notifications</div>
              {unreadCount > 0 && (
                <button
                  onClick={markNotificationsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 italic">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                      !n.isRead ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-800">{n.title}</div>
                    <div className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{n.message}</div>
                    <div className="text-[9px] text-gray-450 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-gray-50/50 px-4 py-2 border-t border-gray-150 text-center">
              <Link
                to="/student/assignments"
                onClick={() => setNotifOpen(false)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Go to My Assignments
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Account dropdown */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setDropOpen(!dropOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">
            {user?.name?.split(' ')[0]}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900 truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
              <div className="mt-1.5 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Student
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                to="/student/account"
                onClick={() => setDropOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                My Account
              </Link>
              <Link
                to="/student/assignments"
                onClick={() => setDropOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ClipboardList className="w-4 h-4 text-gray-400" />
                My Assignments
              </Link>
              <Link
                to="/student/account"
                onClick={() => setDropOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" />
                Profile
              </Link>
            </div>

            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search subjects, labs, experiments…"
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-3 text-xs text-gray-400 text-center">Start typing to search across all labs</div>
          </div>
        </div>
      )}
    </nav>
  );
}
