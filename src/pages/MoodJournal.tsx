import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const moods = [
  { emoji: "😊", emotion: "Happy", color: "bg-happy" },
  { emoji: "😢", emotion: "Sad", color: "bg-sad" },
  { emoji: "😠", emotion: "Angry", color: "bg-angry" },
  { emoji: "😲", emotion: "Surprised", color: "bg-surprised" },
  { emoji: "😐", emotion: "Neutral", color: "bg-muted" },
  { emoji: "😌", emotion: "Calm", color: "bg-calm" },
];

interface MoodEntry {
  id: string;
  emoji: string;
  emotion: string;
  note: string;
  created_at: string;
}

const MoodJournal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [weeklyMoods, setWeeklyMoods] = useState<MoodEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchMoods = async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await supabase
        .from("mood_journal")
        .select("*")
        .eq("student_id", user.id)
        .gte("created_at", weekAgo.toISOString())
        .order("created_at", { ascending: false });
      if (data) setWeeklyMoods(data as MoodEntry[]);

      // Check if already logged today
      const today = new Date().toISOString().split("T")[0];
      const todayEntry = (data as MoodEntry[] | null)?.find(
        (m) => m.created_at.startsWith(today)
      );
      if (todayEntry) setTodayMood(todayEntry.emotion);
    };
    fetchMoods();
  }, [user]);

  const logMood = async (emoji: string, emotion: string) => {
    if (!user || submitting) return;
    setSubmitting(true);
    await supabase.from("mood_journal").insert({
      student_id: user.id,
      emoji,
      emotion,
    });
    setTodayMood(emotion);
    toast.success(`Mood logged: ${emoji} ${emotion}!`);

    // Refresh
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data } = await supabase
      .from("mood_journal")
      .select("*")
      .eq("student_id", user.id)
      .gte("created_at", weekAgo.toISOString())
      .order("created_at", { ascending: false });
    if (data) setWeeklyMoods(data as MoodEntry[]);
    setSubmitting(false);
  };

  // Build weekly trend
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: days[d.getDay()],
      date: d.toISOString().split("T")[0],
    };
  });

  const getMoodForDay = (date: string) =>
    weeklyMoods.find((m) => m.created_at.startsWith(date));

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-3xl">📔</span>
          <h1 className="text-xl font-display font-bold text-foreground">Mood Journal</h1>
        </div>

        {/* Daily Check-In */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card-playful p-6 mb-6">
          <h2 className="text-lg font-display font-bold text-foreground mb-2">
            How do you feel today? 🌈
          </h2>
          {todayMood ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-2">
                {moods.find((m) => m.emotion === todayMood)?.emoji}
              </div>
              <p className="text-muted-foreground font-display">
                You're feeling <strong>{todayMood}</strong> today!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {moods.map((m, i) => (
                <motion.button
                  key={m.emotion}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => logMood(m.emoji, m.emotion)}
                  disabled={submitting}
                  className="card-playful p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-1">{m.emoji}</div>
                  <div className="text-xs font-display font-bold text-foreground">{m.emotion}</div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Weekly Trend */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card-playful p-6">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">
            Your Week 📊
          </h2>
          <div className="flex justify-between items-end gap-1">
            {weekDays.map((day) => {
              const entry = getMoodForDay(day.date);
              return (
                <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                  <div className="text-2xl h-10 flex items-center justify-center">
                    {entry ? entry.emoji : "·"}
                  </div>
                  <span className="text-[10px] font-display text-muted-foreground">{day.label}</span>
                </div>
              );
            })}
          </div>

          {weeklyMoods.length === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-4">
              No moods logged this week yet. Start today! 🌟
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MoodJournal;
