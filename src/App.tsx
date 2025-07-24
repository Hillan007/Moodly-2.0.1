import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

// Public Pages
import WelcomePage from '@/pages/WelcomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

// Protected Pages
import DashboardPage from '@/pages/DashboardPage';
import HomePage from '@/pages/HomePage';
import MoodTrackerPage from '@/pages/MoodTrackerPage';
import JournalPage from '@/pages/JournalPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import BreathingPage from '@/pages/BreathingPage';
import GoalsPage from '@/pages/GoalsPage';
import MusicPage from '@/pages/MusicPage';
import ProfilePage from '@/pages/ProfilePage';

import AppLayout from '@/components/layout/AppLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/welcome" replace />;
};

// Public Route Component (for login/signup)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppContent = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Welcome Landing Page */}
        <Route path="/welcome" element={<WelcomePage />} />
        
        {/* Auth Routes - redirect to dashboard if already logged in */}
        <Route path="/login" element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        } />
        <Route path="/signup" element={
          <AuthRoute>
            <SignupPage />
          </AuthRoute>
        } />

        {/* Protected Routes - require authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/mood-tracker" element={
          <ProtectedRoute>
            <AppLayout>
              <MoodTrackerPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/journal" element={
          <ProtectedRoute>
            <AppLayout>
              <JournalPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AppLayout>
              <AnalyticsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/breathing" element={
          <ProtectedRoute>
            <AppLayout>
              <BreathingPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <AppLayout>
              <GoalsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/music" element={
          <ProtectedRoute>
            <AppLayout>
              <MusicPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Default redirect to welcome page */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" />
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
