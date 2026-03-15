import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState } from 'react';
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import CompleteProfile from "./views/admin/profile/CompleteProfile"; // 👈 create this page

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  return (
    <ChakraProvider theme={currentTheme}>
      <AuthProvider>
        <Routes>

          {/* Public only — logged-in users are bounced away */}
          <Route
            path="auth/*"
            element={
              <PublicOnlyRoute>
                <AuthLayout />
              </PublicOnlyRoute>
            }
          />

          {/* Complete profile — needs login, but NOT a completed profile.
              requireProfile={false} prevents the deadlock:
              user can't complete profile if this page itself is blocked. */}
          <Route
            path="complete-profile"
            element={
              <ProtectedRoute requireProfile={false}>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />

          {/* All admin pages — needs login AND completed profile.
              ProtectedRoute defaults to requireProfile={true} */}
          <Route
            path="admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
              </ProtectedRoute>
            }
          />

          <Route
            path="rtl/*"
            element={<RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />}
          />

          <Route path="/" element={<Navigate to="/admin/default" replace />} />

        </Routes>
      </AuthProvider>
    </ChakraProvider>
  );
}