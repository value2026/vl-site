import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { LayoutDashboard } from 'lucide-react';

// Layout
import Header from './components/Header';
import Footer from './components/Footer';

// Public pages
import Home          from './pages/Home';
import Project       from './pages/Project';
import Workshop      from './pages/Workshop';
import WorkshopDetails from './pages/WorkshopDetails';
import NodalCentres  from './pages/NodalCentres';
import Publications  from './pages/Publications';
import News          from './pages/News';
import Contact       from './pages/Contact';
import Survey        from './pages/Survey';
import Login         from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';

// Dashboard pages (admin / nodal centre / teacher)
import AdminDashboard       from './pages/dashboards/AdminDashboard';
import NodalCentreDashboard from './pages/dashboards/NodalCentreDashboard';
import TeacherDashboard     from './pages/dashboards/TeacherDashboard';
import ManagePages          from './pages/dashboards/ManagePages';
import VLManagerDashboard   from './pages/dashboards/VLManagerDashboard';
import InstitutionsManagement from './pages/dashboards/InstitutionsManagement';
import WorkshopsManagement    from './pages/dashboards/WorkshopsManagement';

// Student learning platform
import StudentHome    from './pages/student/StudentHome';
import SubjectPage    from './pages/student/SubjectPage';
import LabPage        from './pages/student/LabPage';
import ExperimentPage from './pages/student/ExperimentPage';
import StudentAccount from './pages/student/StudentAccount';
import StudentAssignments from './pages/student/StudentAssignments';
import DoAssignment from './pages/student/DoAssignment';
import TeacherAssignments from './pages/dashboards/TeacherAssignments';
import AssignmentReport from './pages/dashboards/AssignmentReport';

// Dashboard layout and pages
import DashboardLayout from './components/dashboard/DashboardLayout';
import LabManagement    from './pages/dashboards/LabManagement';
import AnalyticsDashboard from './pages/dashboards/AnalyticsDashboard';
import ProfileSettings from './pages/dashboards/ProfileSettings';
import StudentAcademicReports from './components/dashboard/StudentAcademicReports';


// Auth
import { useAuth } from './context/AuthContext';

// ── Helpers ───────────────────────────────────────────────────

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

function GoogleAnalytics() {
  const location = useLocation();
  const { user } = useAuth(); // Required to track user properties (nodal center, role)

  useEffect(() => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId && !ReactGA.isInitialized) {
      ReactGA.initialize([
        {
          trackingId: measurementId,
          gaOptions: { debug_mode: true },
          gtagOptions: { debug_mode: true },
        },
      ]);
    }
  }, []);

  // Sync User Properties to track Nodal Center & User Role
  useEffect(() => {
    if (ReactGA.isInitialized && user) {
      ReactGA.set({ user_id: user.id });
      // Set user_properties for GA4 to allow segmenting data by Nodal Center and Role
      if (window.gtag) {
        window.gtag('set', 'user_properties', {
          nodal_center_id: user.nodalCentreId || 'none',
          user_role: user.role
        });
      }
    }
  }, [user]);

  useEffect(() => {
    if (ReactGA.isInitialized) {
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }
  }, [location]);

  return null;
}

function ComingSoon({ page }) {
  return (
    <main className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="font-heading text-4xl font-bold text-gray-900 mb-3">{page}</h1>
        <p className="text-gray-500 text-lg">This page is coming soon.</p>
      </div>
    </main>
  );
}

/**
 * Redirects unauthenticated users to /login.
 * Redirects authenticated users to their dashboard if they try to access another role's dashboard.
 */
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their correct dashboard
    const dashMap = {
      admin:        '/dashboard/admin',
      vl_manager:   '/dashboard/vl-manager',
      nodal_centre: '/dashboard/nodal',
      teacher:      '/dashboard/teacher',
      student:      '/student',
    };
    return <Navigate to={dashMap[user.role] || '/login'} replace />;
  }

  return children;
}

// ── Public layout (with header + footer) ─────────────────────

const DASHBOARD_PATHS = ['/dashboard', '/student'];

function FloatingDashboardButton() {
  const { user } = useAuth();
  if (!user) return null;
  
  const dashMap = {
    admin:        '/dashboard/admin/pages',
    vl_manager:   '/dashboard/vl-manager',
    nodal_centre: '/dashboard/nodal',
    teacher:      '/dashboard/teacher',
    student:      '/dashboard/student',
  };
  
  const link = dashMap[user.role] || '/login';
  const label = user.role === 'admin' ? 'Back to Manage Pages' : 'Back to Dashboard';
  
  return (
    <Link 
      to={link}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full font-medium shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 hover:-translate-y-1 border border-white/10"
    >
      <LayoutDashboard className="w-5 h-5" />
      {label}
    </Link>
  );
}

function AppLayout() {
  const { pathname } = useLocation();
  const isDashboard  = DASHBOARD_PATHS.some((p) => pathname.startsWith(p));
  const hideShell    = isDashboard || pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password';

  if (hideShell) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Shared Profile Route */}
        <Route path="/dashboard/profile" element={
          <ProtectedRoute>
            <DashboardLayout title="Profile Settings"><ProfileSettings /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/dashboard/admin" element={
          <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/admin/users" element={
          <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/admin/labs" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout title="Lab Management"><LabManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/analytics" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout title="Usage Analytics"><AnalyticsDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/pages" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout title="Manage Pages"><ManagePages /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/institutions" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout title="Institutions"><InstitutionsManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/workshops" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout title="Workshops"><WorkshopsManagement /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* VL Manager */}
        <Route path="/dashboard/vl-manager" element={
          <ProtectedRoute allowedRole="vl_manager"><VLManagerDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/users" element={
          <ProtectedRoute allowedRole="vl_manager"><VLManagerDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/institutions" element={
          <ProtectedRoute allowedRole="vl_manager">
            <DashboardLayout title="Institutions"><InstitutionsManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/workshops" element={
          <ProtectedRoute allowedRole="vl_manager">
            <DashboardLayout title="Workshops"><WorkshopsManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/labs" element={
          <ProtectedRoute allowedRole="vl_manager">
            <DashboardLayout title="Lab Management"><LabManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/analytics" element={
          <ProtectedRoute allowedRole="vl_manager">
            <DashboardLayout title="Usage Analytics"><AnalyticsDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Nodal Centre */}
        <Route path="/dashboard/nodal" element={
          <ProtectedRoute allowedRole="nodal_centre"><NodalCentreDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/nodal/teachers" element={
          <ProtectedRoute allowedRole="nodal_centre"><NodalCentreDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/nodal/students" element={
          <ProtectedRoute allowedRole="nodal_centre"><NodalCentreDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/nodal/labs" element={
          <ProtectedRoute allowedRole="nodal_centre">
            <DashboardLayout title="Lab Management"><LabManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/nodal/analytics" element={
          <ProtectedRoute allowedRole="nodal_centre">
            <DashboardLayout title="Usage Analytics"><AnalyticsDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/nodal/reports" element={
          <ProtectedRoute allowedRole="nodal_centre">
            <DashboardLayout title="Academic Reports"><StudentAcademicReports /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Teacher */}
        <Route path="/dashboard/teacher" element={
          <ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/students" element={
          <ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/labs" element={
          <ProtectedRoute allowedRole="teacher">
            <DashboardLayout title="Lab Management"><LabManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/analytics" element={
          <ProtectedRoute allowedRole="teacher">
            <DashboardLayout title="Usage Analytics"><AnalyticsDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/reports" element={
          <ProtectedRoute allowedRole="teacher">
            <DashboardLayout title="Academic Reports"><StudentAcademicReports /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/assignments" element={
          <ProtectedRoute allowedRole="teacher"><TeacherAssignments /></ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/assignments/report/:id" element={
          <ProtectedRoute allowedRole="teacher"><AssignmentReport /></ProtectedRoute>
        } />

        {/* Student learning platform */}
        <Route path="/dashboard/student" element={
          <ProtectedRoute allowedRole="student"><Navigate to="/student" replace /></ProtectedRoute>
        } />
        <Route path="/student" element={
          <ProtectedRoute allowedRole="student"><StudentHome /></ProtectedRoute>
        } />
        <Route path="/student/subject/:subjectId" element={
          <ProtectedRoute allowedRole="student"><SubjectPage /></ProtectedRoute>
        } />
        <Route path="/student/lab/:labId" element={
          <ProtectedRoute allowedRole="student"><LabPage /></ProtectedRoute>
        } />
        <Route path="/student/experiment/:expId" element={
          <ProtectedRoute allowedRole="student"><ExperimentPage /></ProtectedRoute>
        } />
        <Route path="/student/account" element={
          <ProtectedRoute allowedRole="student"><StudentAccount /></ProtectedRoute>
        } />
        <Route path="/student/assignments" element={
          <ProtectedRoute allowedRole="student"><StudentAssignments /></ProtectedRoute>
        } />
        <Route path="/student/assignments/take/:id" element={
          <ProtectedRoute allowedRole="student"><DoAssignment /></ProtectedRoute>
        } />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/project"             element={<Project />} />
          <Route path="/workshop"            element={<Workshop />} />
          <Route path="/workshop/:id"        element={<WorkshopDetails />} />
          <Route path="/nodal-centres"       element={<NodalCentres />} />
          <Route path="/nodal-centres/apply" element={<ComingSoon page="Apply as Nodal Centre" />} />
          <Route path="/nodal-centres/list"  element={<NodalCentres />} />
          <Route path="/nodal-centres/demo"  element={<ComingSoon page="Request a Demo" />} />
          <Route path="/news"                element={<News />} />
          <Route path="/publications"        element={<Publications />} />
          <Route path="/survey"              element={<Navigate to="/survey/student" replace />} />
          <Route path="/survey/faculty"      element={<Survey slug="faculty-survey" />} />
          <Route path="/survey/student"      element={<Survey slug="student-survey" />} />
          <Route path="/contact"             element={<Contact />} />
          <Route path="/labs/:category"      element={<ComingSoon page="Lab Category" />} />
          <Route path="/simulations/:id"     element={<ComingSoon page="Simulation" />} />
          <Route path="*"                    element={<ComingSoon page="Page Not Found" />} />
        </Routes>
      </div>
      <Footer />
      <FloatingDashboardButton />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GoogleAnalytics />
      <AppLayout />
    </BrowserRouter>
  );
}
