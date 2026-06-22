import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Existing routes
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetails from './pages/CourseDetails';
import MyLearning from './pages/MyLearning';
import Lesson from './pages/Lesson';

// Course section components
import CourseLayout from './components/CourseLayout';
import AttestatsiyaLesson from './pages/AttestatsiyaLesson';
import AttestatsiyaTests from './pages/AttestatsiyaTests';
import AttestatsiyaMockExams from './pages/AttestatsiyaMockExams';
import AttestatsiyaExam from './pages/AttestatsiyaExam';
import AttestatsiyaExamResult from './pages/AttestatsiyaExamResult';
import DevStatus from './pages/DevStatus';
import Diagnostic from './pages/Diagnostic';
import AttestatsiyaOnboarding from './pages/AttestatsiyaOnboarding';
import Certificates from './pages/Certificates';
import ErrorNotebook from './pages/ErrorNotebook';
import Konspektlar from './pages/Konspektlar';
import Pricing from './pages/Pricing';
import AdminPanel from './pages/AdminPanel';
import AttestatsiyaResults from './pages/AttestatsiyaResults';

// Generic legacy redirect: /attestatsiya/<rest> → /kurs/attestatsiya/<rest>,
// preserving the subpath + query so old links and bookmarks keep working.
function LegacyAttestatsiyaRedirect() {
  const { pathname, search } = useLocation();
  const target = pathname.replace(/^\/attestatsiya/, '/kurs/attestatsiya') + search;
  return <Navigate to={target} replace />;
}

// Data router (createBrowserRouter) is required for useBlocker — used to guard
// against losing in-progress test answers on navigation.
//
// Two distinct shells:
//  - <Layout>: PUBLIC chrome (topbar with Kirish / Roʻyxatdan oʻtish + footer).
//    Wraps public pages and focus-mode exam screens.
//  - <CourseLayout>: INTERNAL AppShell (sidebar + app topbar). Slug-driven —
//    works for ANY course under /kurs/:slug, including /obuna.
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* ───────── PUBLIC + focus-mode (public Layout) ───────── */}
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="courses" element={<CourseCatalog />} />
        <Route path="courses/:id" element={<CourseDetails />} />
        <Route path="dev-status" element={<DevStatus />} />
        <Route path="project-status" element={<DevStatus />} />

        {/* Public subscription page (kept separate from internal /kurs/:slug/obuna) */}
        <Route path="pricing" element={<Pricing />} />

        {/* Student dashboard: real platform cabinet ("Mening kurslarim") */}
        <Route path="dashboard" element={<MyLearning />} />

        <Route element={<ProtectedRoute />}>
          <Route path="certificates" element={<Certificates />} />
          <Route path="learn/:lessonId" element={<Lesson />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>

        {/* Focus-mode course screens — single-screen, no sidebar */}
        <Route path="kurs/:slug/onboarding" element={<AttestatsiyaOnboarding />} />
        <Route path="kurs/:slug/diagnostika" element={<Diagnostic />} />
        <Route path="kurs/:slug/imtihon/:id" element={<AttestatsiyaExam />} />
      </Route>

      {/* ───────── INTERNAL APP SHELL (slug-driven sidebar + app topbar) ───────── */}
      <Route path="kurs/:slug" element={<CourseLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="natija" element={<AttestatsiyaResults />} />
        <Route path="dars/:id" element={<AttestatsiyaLesson />} />
        <Route path="testlar" element={<AttestatsiyaTests />} />
        <Route path="konspektlar" element={<Konspektlar />} />
        <Route path="imtihon" element={<AttestatsiyaMockExams />} />
        <Route path="imtihon/:id/natija" element={<AttestatsiyaExamResult />} />
        <Route path="xatolar" element={<ErrorNotebook />} />
        <Route path="obuna" element={<Pricing />} />
      </Route>

      {/* ───────── LEGACY redirects: /attestatsiya/* → /kurs/attestatsiya/* ───────── */}
      <Route path="attestatsiya" element={<Navigate to="/kurs/attestatsiya" replace />} />
      <Route path="attestatsiya/*" element={<LegacyAttestatsiyaRedirect />} />
    </Route>
  )
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
