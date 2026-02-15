import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const activities = [
  { id: "emoji-learning", emoji: "😀", title: "Emoji Learning", desc: "Learn emotion names!", color: "bg-happy" },
  { id: "face-detection", emoji: "📷", title: "Face Detection", desc: "What face are you making?", color: "bg-sad" },
  { id: "situation-quiz", emoji: "🎭", title: "Situation Quiz", desc: "How would you feel?", color: "bg-accent" },
  { id: "calm-down", emoji: "🧘", title: "Calm Down", desc: "Breathe and relax!", color: "bg-calm" },
  { id: "guess-emotion", emoji: "🤔", title: "Guess Emotion", desc: "What are they feeling?", color: "bg-surprised" },
  { id: "memory-match", emoji: "🧩", title: "Memory Match", desc: "Match emoji pairs!", color: "bg-angry" },
];

const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activitiesCompleted, setActivitiesCompleted] = useState(0);
  const [lastEmotion, setLastEmotion] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;
      const { count } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("student_id", profile.user_id);
      setActivitiesCompleted(count || 0);

      const { data: emotions } = await supabase
        .from("emotion_history")
        .select("emotion")
        .eq("student_id", profile.user_id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (emotions && emotions.length > 0) setLastEmotion(emotions[0].emotion);
    };
    fetchStats();
  }, [profile]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Hi, {profile?.name || "Friend"}! 👋
            </h1>
            <p className="text-muted-foreground">Ready to explore emotions?</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="card-playful p-5 mb-6"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-2xl font-display font-bold text-star">
                <Star className="w-6 h-6 fill-star text-star" />
                {profile?.total_stars || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Stars</p>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-secondary">{activitiesCompleted}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
            <div>
              <div className="text-2xl">{lastEmotion || "🤗"}</div>
              <p className="text-xs text-muted-foreground mt-1">Last Emotion</p>
            </div>
          </div>
        </motion.div>

        {/* Activity Grid */}
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Activities</h2>
        <div className="grid grid-cols-2 gap-4">
          {activities.map((act, i) => (
            <motion.button
              key={act.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/activity/${act.id}`)}
              className={`card-playful p-5 text-center cursor-pointer hover:shadow-xl transition-shadow`}
            >
              <div className="text-4xl mb-2">{act.emoji}</div>
              <h3 className="font-display font-bold text-foreground text-sm">{act.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{act.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
