import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AnalyzePage from './pages/AnalyzePage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHairstyles from './pages/admin/AdminHairstyles';
import AdminUsers from './pages/admin/AdminUsers';

import QuizPage from './pages/QuizPage';
import TrendingPage from './pages/TrendingPage';

// ── Full-page loader ───────────────────────────────────────────────────────
const Loader = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="spinner" />
      <p className="text-slate-500 text-sm">Loading...</p>
    </div>
  </div>
);

// ── Route guards ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return !user ? children : <Navigate to="/analyze" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// ── Layout wrappers ────────────────────────────────────────────────────────
const WithNavbar = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

// ── App ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public + user pages — all wrapped with Navbar */}
      <Route path="/" element={<WithNavbar><LandingPage /></WithNavbar>} />
      <Route path="/trending" element={<WithNavbar><TrendingPage /></WithNavbar>} />
      <Route path="/login"    element={<WithNavbar><PublicRoute><LoginPage /></PublicRoute></WithNavbar>} />
      <Route path="/register" element={<WithNavbar><PublicRoute><RegisterPage /></PublicRoute></WithNavbar>} />
      <Route path="/analyze"  element={<WithNavbar><ProtectedRoute><AnalyzePage /></ProtectedRoute></WithNavbar>} />
      <Route path="/result/:id" element={<WithNavbar><ProtectedRoute><ResultPage /></ProtectedRoute></WithNavbar>} />
      <Route path="/history"  element={<WithNavbar><ProtectedRoute><HistoryPage /></ProtectedRoute></WithNavbar>} />
      <Route path="/profile"  element={<WithNavbar><ProtectedRoute><ProfilePage /></ProtectedRoute></WithNavbar>} />
      <Route path="/quiz"     element={<WithNavbar><ProtectedRoute><QuizPage /></ProtectedRoute></WithNavbar>} />

      {/* Admin pages — own layout, no Navbar */}
      <Route
        path="/admin"
        element={<AdminRoute><AdminLayout /></AdminRoute>}
      >
        <Route index            element={<AdminDashboard />} />
        <Route path="hairstyles" element={<AdminHairstyles />} />
        <Route path="users"      element={<AdminUsers />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
