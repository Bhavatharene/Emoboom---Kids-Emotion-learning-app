import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useState, useEffect, useCallback } from "react";

export interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  earned_at: string;
}

const BADGE_DEFINITIONS = [
  { type: "happy_hero", name: "Happy Hero", emoji: "😊", requirement: "Detect Happy 5 times" },
  { type: "calm_master", name: "Calm Master", emoji: "🧘", requirement: "Complete Calm Down 3 times" },
  { type: "emotion_expert", name: "Emotion Expert", emoji: "🧠", requirement: "Complete all 6 activities" },
  { type: "daily_star", name: "Daily Star", emoji: "⭐", requirement: "3-day streak" },
  { type: "memory_champ", name: "Memory Champ", emoji: "🧩", requirement: "Complete Memory Match 5 times" },
  { type: "quiz_whiz", name: "Quiz Whiz", emoji: "🎯", requirement: "Score 100% on a quiz" },
];

export function useBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);

  const fetchBadges = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("badges")
      .select("*")
      .eq("student_id", user.id);
    if (data) setBadges(data);
  }, [user]);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  const awardBadge = useCallback(async (badgeType: string) => {
    if (!user) return;
    const existing = badges.find((b) => b.badge_type === badgeType);
    if (existing) return;

    const def = BADGE_DEFINITIONS.find((d) => d.type === badgeType);
    if (!def) return;

    await supabase.from("badges").insert({
      student_id: user.id,
      badge_type: badgeType,
      badge_name: def.name,
    });
    await fetchBadges();
  }, [user, badges, fetchBadges]);

  const checkAndAwardBadges = useCallback(async () => {
    if (!user) return;

    // Check happy_hero: 5 happy detections
    const { count: happyCount } = await supabase
      .from("emotion_history")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id)
      .ilike("emotion", "Happy");
    if ((happyCount || 0) >= 5) await awardBadge("happy_hero");

    // Check calm_master: 3 calm down completions
    const { count: calmCount } = await supabase
      .from("activity_logs")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id)
      .eq("activity_type", "calm-down");
    if ((calmCount || 0) >= 3) await awardBadge("calm_master");

    // Check memory_champ: 5 memory matches
    const { count: memCount } = await supabase
      .from("activity_logs")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id)
      .eq("activity_type", "memory-match");
    if ((memCount || 0) >= 5) await awardBadge("memory_champ");

    // Check daily_star: 3-day streak
    const { data: streakData } = await supabase
      .from("daily_streaks")
      .select("current_streak")
      .eq("student_id", user.id)
      .single();
    if ((streakData?.current_streak || 0) >= 3) await awardBadge("daily_star");

    // Check emotion_expert: all 6 activity types
    const { data: actTypes } = await supabase
      .from("activity_logs")
      .select("activity_type")
      .eq("student_id", user.id);
    if (actTypes) {
      const unique = new Set(actTypes.map((a) => a.activity_type));
      if (unique.size >= 6) await awardBadge("emotion_expert");
    }
  }, [user, awardBadge]);

  return { badges, BADGE_DEFINITIONS, fetchBadges, awardBadge, checkAndAwardBadges };
}
