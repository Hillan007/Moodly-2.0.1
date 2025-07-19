import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from '@/components/layout/AppLayout';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import MoodTrackerPage from '@/pages/MoodTrackerPage';
import JournalPage from '@/pages/JournalPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import BreathingPage from '@/pages/BreathingPage';
import GoalsPage from '@/pages/GoalsPage';
import MusicPage from '@/pages/MusicPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="mood-tracker" element={<MoodTrackerPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="breathing" element={<BreathingPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="music" element={<MusicPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
