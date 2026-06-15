import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import AttestatsiyaExam from './pages/AttestatsiyaExam';
import AttestatsiyaExamResult from './pages/AttestatsiyaExamResult';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="courses" element={<CourseCatalog />} />
              <Route path="courses/:id" element={<CourseDetails />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="learn/:lessonId" element={<Lesson />} />
              </Route>

              {/* Attestatsiya section (Nested inside main Layout) */}
              <Route path="attestatsiya" element={<AttestatsiyaLayout />}>
                <Route index element={<AttestatsiyaLanding />} />
                <Route path="dars/:id" element={<AttestatsiyaLesson />} />
                <Route path="testlar" element={<AttestatsiyaTests />} />
                <Route path="imtihon/:id" element={<AttestatsiyaExam />} />
                <Route path="imtihon/:id/natija" element={<AttestatsiyaExamResult />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

