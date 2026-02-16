import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useState, useEffect, useCallback } from "react";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export function useStreaks() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>({ current_streak: 0, longest_streak: 0, last_activity_date: null });

  const fetchStreak = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("daily_streaks")
      .select("*")
      .eq("student_id", user.id)
      .single();
    if (data) setStreak(data);
  }, [user]);

  useEffect(() => { fetchStreak(); }, [fetchStreak]);

  const updateStreak = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("daily_streaks")
      .select("*")
      .eq("student_id", user.id)
      .single();

    if (!existing) {
      await supabase.from("daily_streaks").insert({
        student_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
      });
      setStreak({ current_streak: 1, longest_streak: 1, last_activity_date: today });
      return;
    }

    if (existing.last_activity_date === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const newStreak = existing.last_activity_date === yesterdayStr
      ? existing.current_streak + 1
      : 1;
    const longest = Math.max(newStreak, existing.longest_streak);

    await supabase
      .from("daily_streaks")
      .update({ current_streak: newStreak, longest_streak: longest, last_activity_date: today, updated_at: new Date().toISOString() })
      .eq("student_id", user.id);

    setStreak({ current_streak: newStreak, longest_streak: longest, last_activity_date: today });
  }, [user]);

  return { streak, updateStreak, fetchStreak };
}
