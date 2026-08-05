import { BrowserRouter, Routes, Route, useLocation, Navigate, Link, useParams } from 'react-router-dom';
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
import ContactMessages      from './pages/dashboards/ContactMessages';
import VLManagerDashboard   from './pages/dashboards/VLManagerDashboard';
import VLCoordinatorDashboard from './pages/dashboards/VLCoordinatorDashboard';
import InstitutionsManagement from './pages/dashboards/InstitutionsManagement';
import WorkshopsManagement    from './pages/dashboards/WorkshopsManagement';
import WorkshopEditor         from './pages/dashboards/WorkshopEditor';
import SurveysDashboard       from './pages/dashboards/SurveysDashboard';

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

function LegacyRedirect({ prefix }) {
  const params = useParams();
  const id = params.id || params.subjectId || params.labId || params.expId || '';
  return <Navigate to={`${prefix}/${id}`} replace />;
}

/**
 * Redirects unauthenticated users to /login.
 * Redirects authenticated users to their dashboard if they try to access another role's dashboard.
 */
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (allowedRole) {
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!roles.includes(user.role)) {
      // Redirect to their correct dashboard
      const dashMap = {
        admin:         '/dashboard/admin',
        vl_manager:    '/dashboard/vl-manager',
        vl_coordinator:'/dashboard/vl-coordinator',
        content_admin: '/dashboard/content',
        sim_admin:     '/dashboard/content',
        nodal_centre:  '/dashboard/nodal',
        teacher:       '/dashboard/teacher',
        student:       '/student',
      };
      return <Navigate to={dashMap[user.role] || '/login'} replace />;
    }
  }

  return children;
}

// ── Public layout (with header + footer) ─────────────────────

const DASHBOARD_PATHS = ['/dashboard', '/student', '/labs', '/subject', '/lab', '/experiment'];

function getDashboardLabel(path) {
  if (path.includes('/labs')) return 'Back to Lab Management';
  if (path.includes('/pages')) return 'Back to Manage Pages';
  if (path.includes('/users')) return 'Back to User Management';
  if (path.includes('/institutions')) return 'Back to Institutions';
  if (path.includes('/workshops')) return 'Back to Workshops';
  if (path.includes('/messages')) return 'Back to Contact Messages';
  if (path.includes('/analytics')) return 'Back to Usage Analytics';
  if (path.includes('/teachers')) return 'Back to Teachers';
  if (path.includes('/students')) return 'Back to Students';
  if (path.includes('/reports')) return 'Back to Academic Reports';
  if (path.includes('/assignments')) return 'Back to Assignments';
  if (path.includes('/profile')) return 'Back to Profile Settings';
  if (path.startsWith('/student')) return 'Back to Learning Workspace';
  return 'Back to Management Workspace';
}

function FloatingDashboardButton() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  
  if (!user || user.role === 'student') return null;
  
  // Hide on dashboard pages and student learning pages (immersive view)
  const hidePaths = ['/dashboard', '/labs', '/subject', '/lab', '/experiment', '/student'];
  if (hidePaths.some(p => pathname.startsWith(p))) return null;
  
  const defaultMap = {
    admin:        '/dashboard/admin',
    vl_manager:   '/dashboard/vl-manager',
    vl_coordinator:'/dashboard/vl-coordinator',
    content_admin: '/dashboard/content',
    sim_admin:     '/dashboard/content',
    nodal_centre:  '/dashboard/nodal',
    teacher:       '/dashboard/teacher',
    student:       '/dashboard/student',
  };
  
  const savedPath = sessionStorage.getItem('lastDashboardPath');
  const link = (savedPath && savedPath.startsWith('/dashboard')) ? savedPath : (defaultMap[user.role] || '/login');
  const label = getDashboardLabel(link);
  
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
  const { pathname, search } = useLocation();
  const isDashboard  = DASHBOARD_PATHS.some((p) => pathname.startsWith(p));
  const hideShell    = isDashboard || pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password';

  useEffect(() => {
    if (isDashboard) {
      sessionStorage.setItem('lastDashboardPath', pathname + search);
    }
  }, [pathname, search, isDashboard]);

  if (hideShell) {
    return (
      <>
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
        <Route path="/dashboard/admin/messages" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout title="Contact Messages"><ContactMessages /></DashboardLayout>
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
        <Route path="/dashboard/admin/surveys" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout title="Surveys"><SurveysDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/workshops/:id" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout title="Workshop Editor"><WorkshopEditor /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* VL Manager */}
        <Route path="/dashboard/vl-manager" element={
          <ProtectedRoute allowedRole="vl_manager"><VLManagerDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/users" element={
          <ProtectedRoute allowedRole="vl_manager"><VLManagerDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/messages" element={
          <ProtectedRoute allowedRole="vl_manager">
            <DashboardLayout title="Contact Messages"><ContactMessages /></DashboardLayout>
          </ProtectedRoute>
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
        <Route path="/dashboard/vl-manager/surveys" element={
          <ProtectedRoute allowedRole="vl_manager">
            <DashboardLayout title="Surveys"><SurveysDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/workshops/:id" element={
          <ProtectedRoute allowedRole="vl_manager">
            <DashboardLayout title="Workshop Editor"><WorkshopEditor /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/labs" element={
          <ProtectedRoute allowedRole="vl_manager">
            <DashboardLayout title="Lab Management"><LabManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/pages" element={
          <ProtectedRoute allowedRole="vl_manager">
            <DashboardLayout title="Manage Pages"><ManagePages /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-manager/analytics" element={
          <ProtectedRoute allowedRole="vl_manager">
            <DashboardLayout title="Usage Analytics"><AnalyticsDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* VL Co-ordinator */}
        <Route path="/dashboard/vl-coordinator" element={
          <ProtectedRoute allowedRole="vl_coordinator"><VLCoordinatorDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/vl-coordinator/users" element={
          <ProtectedRoute allowedRole="vl_coordinator"><VLCoordinatorDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/vl-coordinator/institutions" element={
          <ProtectedRoute allowedRole="vl_coordinator">
            <DashboardLayout title="Institutions"><InstitutionsManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-coordinator/workshops" element={
          <ProtectedRoute allowedRole="vl_coordinator">
            <DashboardLayout title="Workshops"><WorkshopsManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-coordinator/surveys" element={
          <ProtectedRoute allowedRole="vl_coordinator">
            <DashboardLayout title="Surveys"><SurveysDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-coordinator/workshops/:id" element={
          <ProtectedRoute allowedRole="vl_coordinator">
            <DashboardLayout title="Workshop Editor"><WorkshopEditor /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-coordinator/labs" element={
          <ProtectedRoute allowedRole="vl_coordinator">
            <DashboardLayout title="Lab Management"><LabManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vl-coordinator/analytics" element={
          <ProtectedRoute allowedRole="vl_coordinator">
            <DashboardLayout title="Usage Analytics"><AnalyticsDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Content Admin */}
        <Route path="/dashboard/content" element={
          <ProtectedRoute allowedRole="content_admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/content/labs" element={
          <ProtectedRoute allowedRole="content_admin">
            <DashboardLayout title="Lab Management"><LabManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/content/analytics" element={
          <ProtectedRoute allowedRole="content_admin">
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

        {/* Public Virtual Labs Exploration */}
        <Route path="/labs" element={<StudentHome />} />
        <Route path="/subject/:subjectId" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
        <Route path="/lab/:labId" element={<ProtectedRoute><LabPage /></ProtectedRoute>} />
        <Route path="/experiment/:expId" element={<ProtectedRoute><ExperimentPage /></ProtectedRoute>} />

        {/* Legacy redirects from /student/... or /simulations/... to clean public routes */}
        <Route path="/dashboard/student" element={<Navigate to="/labs" replace />} />
        <Route path="/student" element={<Navigate to="/labs" replace />} />
        <Route path="/student/subject/:subjectId" element={<LegacyRedirect prefix="/subject" />} />
        <Route path="/student/lab/:labId" element={<LegacyRedirect prefix="/lab" />} />
        <Route path="/student/experiment/:expId" element={<LegacyRedirect prefix="/experiment" />} />
        <Route path="/student/experiments/:expId" element={<LegacyRedirect prefix="/experiment" />} />
        <Route path="/simulations/:id" element={<LegacyRedirect prefix="/experiment" />} />

        {/* Protected Student Account & Assignment Routes */}
        <Route path="/student/account" element={
          <ProtectedRoute><StudentAccount /></ProtectedRoute>
        } />
        <Route path="/student/assignments" element={
          <ProtectedRoute><StudentAssignments /></ProtectedRoute>
        } />
        <Route path="/student/assignments/take/:id" element={
          <ProtectedRoute><DoAssignment /></ProtectedRoute>
        } />
      </Routes>
      <FloatingDashboardButton />
    </>
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
          <Route path="/nodal-centres/apply" element={<Navigate to="/nodal-centres?tab=apply" replace />} />
          <Route path="/nodal-centres/list"  element={<NodalCentres />} />
          <Route path="/news"                element={<News />} />
          <Route path="/publications"        element={<Publications />} />
          <Route path="/survey"              element={<Navigate to="/survey/student" replace />} />
          <Route path="/survey/faculty"      element={<Survey slug="faculty-survey" />} />
          <Route path="/survey/student"      element={<Survey slug="student-survey" />} />
          <Route path="/contact"             element={<Contact />} />
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
