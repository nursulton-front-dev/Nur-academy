import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route
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
import AttestatsiyaLanding from './pages/AttestatsiyaLanding';
import AttestatsiyaLesson from './pages/AttestatsiyaLesson';
import AttestatsiyaTests from './pages/AttestatsiyaTests';
import AttestatsiyaMockExams from './pages/AttestatsiyaMockExams';
import AttestatsiyaExam from './pages/AttestatsiyaExam';
import AttestatsiyaExamResult from './pages/AttestatsiyaExamResult';
import DevStatus from './pages/DevStatus';
import Diagnostic from './pages/Diagnostic';
import AttestatsiyaOnboarding from './pages/AttestatsiyaOnboarding';
import ErrorNotebook from './pages/ErrorNotebook';
import Pricing from './pages/Pricing';

// Data router (createBrowserRouter) is required for useBlocker — used to guard
// against losing in-progress test answers on navigation.
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Landing />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="courses" element={<CourseCatalog />} />
      <Route path="courses/:id" element={<CourseDetails />} />
      <Route path="dev-status" element={<DevStatus />} />
      <Route path="project-status" element={<DevStatus />} />

      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="learn/:lessonId" element={<Lesson />} />
      </Route>

      {/* Course onboarding gate — focused step, no course sidebar */}
      <Route path="attestatsiya/onboarding" element={<AttestatsiyaOnboarding />} />

      {/* Attestatsiya section (Nested inside main Layout) */}
      <Route path="attestatsiya" element={<AttestatsiyaLayout />}>
        <Route index element={<AttestatsiyaLanding />} />
        <Route path="dars/:id" element={<AttestatsiyaLesson />} />
        <Route path="testlar" element={<AttestatsiyaTests />} />
        <Route path="mock-imtihonlar" element={<AttestatsiyaMockExams />} />
        <Route path="imtihon/:id" element={<AttestatsiyaExam />} />
        <Route path="imtihon/:id/natija" element={<AttestatsiyaExamResult />} />
        <Route path="diagnostika" element={<Diagnostic />} />
        <Route path="xatolar" element={<ErrorNotebook />} />
        <Route path="pricing" element={<Pricing />} />
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
