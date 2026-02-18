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
import EmojiLearning from "./pages/activities/EmojiLearning";
import FaceDetection from "./pages/activities/FaceDetection";
import SituationQuiz from "./pages/activities/SituationQuiz";
import CalmDown from "./pages/activities/CalmDown";
import GuessEmotion from "./pages/activities/GuessEmotion";
import MemoryMatch from "./pages/activities/MemoryMatch";
import EmotionDressUp from "./pages/activities/EmotionDressUp";
import EmotionDetective from "./pages/activities/EmotionDetective";
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
    <Route path="/activity/emoji-learning" element={<ProtectedRoute><EmojiLearning /></ProtectedRoute>} />
    <Route path="/activity/face-detection" element={<ProtectedRoute><FaceDetection /></ProtectedRoute>} />
    <Route path="/activity/situation-quiz" element={<ProtectedRoute><SituationQuiz /></ProtectedRoute>} />
    <Route path="/activity/calm-down" element={<ProtectedRoute><CalmDown /></ProtectedRoute>} />
    <Route path="/activity/guess-emotion" element={<ProtectedRoute><GuessEmotion /></ProtectedRoute>} />
    <Route path="/activity/memory-match" element={<ProtectedRoute><MemoryMatch /></ProtectedRoute>} />
    <Route path="/activity/emotion-dress-up" element={<ProtectedRoute><EmotionDressUp /></ProtectedRoute>} />
    <Route path="/activity/emotion-detective" element={<ProtectedRoute><EmotionDetective /></ProtectedRoute>} />
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
