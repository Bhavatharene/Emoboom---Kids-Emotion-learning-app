import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MoodJournal from "./pages/MoodJournal";
import EmotionStoryBuilder from "./pages/activities/EmotionStoryBuilder";
import EmotionDetective from "./pages/activities/EmotionDetective";
import SocialSimulator from "./pages/activities/SocialSimulator";
import EmotionDressUp from "./pages/activities/EmotionDressUp";
import MemoryMatch from "./pages/activities/MemoryMatch";
import EmotionCoachGame from "./pages/activities/EmotionCoachGame";
import EmotionWeatherWorld from "./pages/activities/EmotionWeatherWorld";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="text-6xl animate-bounce-gentle">😊</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/mood-journal" element={<ProtectedRoute><MoodJournal /></ProtectedRoute>} />
    <Route path="/activity/emotion-story" element={<ProtectedRoute><EmotionStoryBuilder /></ProtectedRoute>} />
    <Route path="/activity/emotion-detective" element={<ProtectedRoute><EmotionDetective /></ProtectedRoute>} />
    <Route path="/activity/social-simulator" element={<ProtectedRoute><SocialSimulator /></ProtectedRoute>} />
    <Route path="/activity/emotion-dress-up" element={<ProtectedRoute><EmotionDressUp /></ProtectedRoute>} />
    <Route path="/activity/memory-match" element={<ProtectedRoute><MemoryMatch /></ProtectedRoute>} />
    <Route path="/activity/emotion-coach-game" element={<ProtectedRoute><EmotionCoachGame /></ProtectedRoute>} />
    <Route path="/activity/emotion-weather" element={<ProtectedRoute><EmotionWeatherWorld /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
