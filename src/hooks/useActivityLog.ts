import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useActivityLog() {
  const { user, refreshProfile } = useAuth();

  const logActivity = async (activityType: string, score: number, starsEarned: number, result: Record<string, any> = {}) => {
    if (!user) return;
    await supabase.from("activity_logs").insert({
      student_id: user.id,
      activity_type: activityType,
      score,
      stars_earned: starsEarned,
      result,
    });
    // Update total stars
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_stars")
      .eq("user_id", user.id)
      .single();
    if (profile) {
      await supabase
        .from("profiles")
        .update({ total_stars: (profile.total_stars || 0) + starsEarned })
        .eq("user_id", user.id);
    }
    await refreshProfile();
  };

  const logEmotion = async (emotion: string, source: string) => {
    if (!user) return;
    await supabase.from("emotion_history").insert({
      student_id: user.id,
      emotion,
      source,
    });
  };

  return { logActivity, logEmotion };
}
