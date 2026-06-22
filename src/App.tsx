import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate
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
import Lesson from './pages/Lesson';

// Attestatsiya section components
import AttestatsiyaLayout from './components/AttestatsiyaLayout';
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

// Data router (createBrowserRouter) is required for useBlocker — used to guard
// against losing in-progress test answers on navigation.
//
// Two distinct shells:
//  - <Layout>: PUBLIC chrome (topbar with Kirish / Roʻyxatdan oʻtish + footer).
//    Wraps public pages, focus-mode exam screens, and a few legacy routes.
//  - <AttestatsiyaLayout>: INTERNAL AppShell (sidebar + app topbar, never shows
//    login/register). Wraps every internal course page, including /obuna.
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* ───────── PUBLIC + focus-mode + legacy (public Layout) ───────── */}
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="courses" element={<CourseCatalog />} />
        <Route path="courses/:id" element={<CourseDetails />} />
        <Route path="dev-status" element={<DevStatus />} />
        <Route path="project-status" element={<DevStatus />} />

        {/* Public subscription page (kept separate from internal /attestatsiya/obuna) */}
        <Route path="pricing" element={<Pricing />} />

        {/* Legacy dashboard route → internal app home */}
        <Route path="dashboard" element={<Navigate to="/attestatsiya" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route path="certificates" element={<Certificates />} />
          <Route path="learn/:lessonId" element={<Lesson />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>

        {/* Focus-mode course screens — single-screen, no sidebar */}
        <Route path="attestatsiya/onboarding" element={<AttestatsiyaOnboarding />} />
        <Route path="attestatsiya/diagnostika" element={<Diagnostic />} />
        <Route path="attestatsiya/imtihon/:id" element={<AttestatsiyaExam />} />
      </Route>

      {/* ───────── INTERNAL APP SHELL (sidebar + app topbar) ───────── */}
      <Route path="attestatsiya" element={<AttestatsiyaLayout />}>
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
