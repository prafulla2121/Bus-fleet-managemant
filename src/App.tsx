import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Loading from './components/common/Loading';

// Lazy loaded routes for better performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewEntry = lazy(() => import('./pages/NewEntry'));
const ViewEntries = lazy(() => import('./pages/ViewEntries'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  const { user, loading } = useAuth();

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
  };

  // Public route wrapper (redirects if logged in)
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <Loading />;
    if (user) return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="new-entry" element={<NewEntry />} />
          <Route path="view-entries" element={<ViewEntries />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;