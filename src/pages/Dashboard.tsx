import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, LogOut, BookHeart, Flame, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBadges } from "@/hooks/useBadges";
import { useStreaks } from "@/hooks/useStreaks";

const activities = [
  { id: "emoji-learning", emoji: "😀", title: "Emoji Learning", desc: "Learn emotion names!" },
  { id: "face-detection", emoji: "📷", title: "Face Detection", desc: "What face are you making?" },
  { id: "situation-quiz", emoji: "🎭", title: "Situation Quiz", desc: "How would you feel?" },
  { id: "emotion-dress-up", emoji: "🎨", title: "Emotion Dress-Up", desc: "Build a face!" },
  { id: "emotion-detective", emoji: "🔍", title: "Emotion Detective", desc: "Find the emotion!" },
  { id: "calm-down", emoji: "🧘", title: "Calm Down", desc: "Breathe and relax!" },
  { id: "story-builder", emoji: "📖", title: "AI Story Builder", desc: "Your choices shape the story!" },
  { id: "memory-match", emoji: "🧩", title: "Memory Match", desc: "Match emoji pairs!" },
];

const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activitiesCompleted, setActivitiesCompleted] = useState(0);
  const [lastEmotion, setLastEmotion] = useState<string | null>(null);
  const { badges, BADGE_DEFINITIONS } = useBadges();
  const { streak } = useStreaks();

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
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card-playful p-5 mb-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-xl font-display font-bold text-star">
                <Star className="w-5 h-5 fill-star text-star" />
                {profile?.total_stars || 0}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Stars</p>
            </div>
            <div>
              <div className="text-xl font-display font-bold text-secondary">{activitiesCompleted}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Done</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-xl font-display font-bold text-primary">
                <Flame className="w-5 h-5" />
                {streak.current_streak}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Streak</p>
            </div>
            <div>
              <div className="text-xl">{lastEmotion || "🤗"}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Last Feel</p>
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card-playful p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-star" />
            <h2 className="text-sm font-display font-bold text-foreground">Badges ({badges.length}/{BADGE_DEFINITIONS.length})</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {BADGE_DEFINITIONS.map((def) => {
              const earned = badges.find((b) => b.badge_type === def.type);
              return (
                <div
                  key={def.type}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-display ${
                    earned ? "bg-star/20 text-foreground" : "bg-muted text-muted-foreground opacity-50"
                  }`}
                  title={def.requirement}
                >
                  <span>{def.emoji}</span>
                  <span className="font-bold">{def.name}</span>
                  {earned && <span>✓</span>}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-4">
          <Button
            onClick={() => navigate("/mood-journal")}
            className="flex-1 rounded-xl font-display h-12"
            variant="outline"
          >
            <BookHeart className="w-5 h-5 mr-2" />
            Mood Journal 📔
          </Button>
        </div>

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
              className="card-playful p-5 text-center cursor-pointer hover:shadow-xl transition-shadow"
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
