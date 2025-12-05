import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProtectedRoute } from './src/components/auth/ProtectedRoute';
import { LandingPage } from './src/pages/LandingPage';
import { SignInPage } from './src/pages/SignInPage';
import { SignUpPage } from './src/pages/SignUpPage';
import { UpgradePage } from './src/pages/UpgradePage';
import DashboardApp from './src/pages/DashboardApp';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardApp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upgrade"
            element={
              <ProtectedRoute>
                <UpgradePage />
              </ProtectedRoute>
            }
          />

          {/* Redirect old paths to dashboard */}
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
