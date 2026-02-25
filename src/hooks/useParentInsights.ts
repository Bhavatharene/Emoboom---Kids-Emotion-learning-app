import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface EmotionRecord {
  emotion: string;
  created_at: string;
  source: string;
}

export interface DailyEmotionSummary {
  mostFrequent: string;
  distribution: Record<string, number>;
  totalSessions: number;
  stability: "stable" | "moderate" | "high_fluctuation";
  recentTimeline: EmotionRecord[];
}

export interface WeeklyData {
  dailyCounts: { day: string; happy: number; sad: number; angry: number; anxious: number; calm: number }[];
  dominantEmotion: string;
  allEmotions: string[];
}

const EMOTION_EMOJIS: Record<string, string> = {
  happy: "😊", sad: "😢", angry: "😠", anxious: "😰", calm: "😌",
  surprised: "😲", scared: "😨", neutral: "😐", excited: "🤩", frustrated: "😤",
};

const normalizeEmotion = (e: string): string => {
  const lower = e.toLowerCase().replace(/[^a-z]/g, "");
  if (["happy", "joy", "excited", "cheerful"].some(k => lower.includes(k))) return "happy";
  if (["sad", "unhappy", "down", "cry"].some(k => lower.includes(k))) return "sad";
  if (["angry", "mad", "furious", "frustrated"].some(k => lower.includes(k))) return "angry";
  if (["anxious", "worried", "nervous", "scared", "fear"].some(k => lower.includes(k))) return "anxious";
  if (["calm", "peaceful", "relaxed", "neutral"].some(k => lower.includes(k))) return "calm";
  return "calm";
};

export function useParentInsights() {
  const { user } = useAuth();
  const [todaySummary, setTodaySummary] = useState<DailyEmotionSummary | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch today's emotions
    const { data: todayEmotions } = await supabase
      .from("emotion_history")
      .select("*")
      .eq("student_id", user.id)
      .gte("created_at", todayStart)
      .order("created_at", { ascending: false });

    // Fetch weekly emotions
    const { data: weekEmotions } = await supabase
      .from("emotion_history")
      .select("*")
      .eq("student_id", user.id)
      .gte("created_at", weekStart)
      .order("created_at", { ascending: true });

    // Also check mood_journal
    const { data: todayMoods } = await supabase
      .from("mood_journal")
      .select("*")
      .eq("student_id", user.id)
      .gte("created_at", todayStart);

    const { data: weekMoods } = await supabase
      .from("mood_journal")
      .select("*")
      .eq("student_id", user.id)
      .gte("created_at", weekStart);

    // Combine sources
    const allTodayEmotions: EmotionRecord[] = [
      ...(todayEmotions || []).map(e => ({ emotion: e.emotion, created_at: e.created_at, source: e.source })),
      ...(todayMoods || []).map(m => ({ emotion: m.emotion, created_at: m.created_at, source: "mood_journal" })),
    ];

    const allWeekEmotions: EmotionRecord[] = [
      ...(weekEmotions || []).map(e => ({ emotion: e.emotion, created_at: e.created_at, source: e.source })),
      ...(weekMoods || []).map(m => ({ emotion: m.emotion, created_at: m.created_at, source: "mood_journal" })),
    ];

    // Use mock data if no real data
    const useMock = allTodayEmotions.length === 0 && allWeekEmotions.length === 0;

    if (useMock) {
      generateMockData();
    } else {
      processTodayData(allTodayEmotions);
      processWeeklyData(allWeekEmotions);
    }

    setLoading(false);
  };

  const processTodayData = (emotions: EmotionRecord[]) => {
    if (emotions.length === 0) {
      setTodaySummary({
        mostFrequent: "calm",
        distribution: { calm: 1 },
        totalSessions: 0,
        stability: "stable",
        recentTimeline: [],
      });
      return;
    }

    const dist: Record<string, number> = {};
    emotions.forEach(e => {
      const norm = normalizeEmotion(e.emotion);
      dist[norm] = (dist[norm] || 0) + 1;
    });

    const mostFrequent = Object.entries(dist).sort((a, b) => b[1] - a[1])[0][0];
    const uniqueEmotions = Object.keys(dist).length;
    const stability = uniqueEmotions <= 2 ? "stable" : uniqueEmotions <= 3 ? "moderate" : "high_fluctuation";

    setTodaySummary({
      mostFrequent,
      distribution: dist,
      totalSessions: emotions.length,
      stability,
      recentTimeline: emotions.slice(0, 10),
    });
  };

  const processWeeklyData = (emotions: EmotionRecord[]) => {
    const days: Record<string, Record<string, number>> = {};
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = dayNames[d.getDay()];
      days[key] = { happy: 0, sad: 0, angry: 0, anxious: 0, calm: 0 };
    }

    const allNormalized: string[] = [];
    emotions.forEach(e => {
      const norm = normalizeEmotion(e.emotion);
      allNormalized.push(norm);
      const d = new Date(e.created_at);
      const key = dayNames[d.getDay()];
      if (days[key]) {
        days[key][norm] = (days[key][norm] || 0) + 1;
      }
    });

    const freq: Record<string, number> = {};
    allNormalized.forEach(e => { freq[e] = (freq[e] || 0) + 1; });
    const dominant = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "calm";

    setWeeklyData({
      dailyCounts: Object.entries(days).map(([day, counts]) => ({ day, happy: counts.happy || 0, sad: counts.sad || 0, angry: counts.angry || 0, anxious: counts.anxious || 0, calm: counts.calm || 0 })),
      dominantEmotion: dominant,
      allEmotions: allNormalized,
    });
  };

  const generateMockData = () => {
    const emotions = ["happy", "sad", "angry", "anxious", "calm"];
    const mockToday: EmotionRecord[] = [];
    const now = new Date();

    for (let i = 0; i < 8; i++) {
      const t = new Date(now.getTime() - i * 30 * 60 * 1000);
      mockToday.push({
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        created_at: t.toISOString(),
        source: "mock",
      });
    }

    processTodayData(mockToday);

    const mockWeek: EmotionRecord[] = [];
    for (let d = 0; d < 7; d++) {
      const count = 3 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const t = new Date(Date.now() - d * 24 * 60 * 60 * 1000 - i * 60 * 60 * 1000);
        mockWeek.push({
          emotion: emotions[Math.floor(Math.random() * emotions.length)],
          created_at: t.toISOString(),
          source: "mock",
        });
      }
    }
    processWeeklyData(mockWeek);
  };

  const getEmotionEmoji = (emotion: string) => EMOTION_EMOJIS[normalizeEmotion(emotion)] || "😐";

  return { todaySummary, weeklyData, loading, getEmotionEmoji, refetch: fetchData };
}
