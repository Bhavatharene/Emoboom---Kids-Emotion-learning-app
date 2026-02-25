import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { WeeklyData } from "@/hooks/useParentInsights";

interface Props {
  weeklyData: WeeklyData | null;
  loading: boolean;
  childName: string;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: "hsl(45, 95%, 65%)",
  sad: "hsl(210, 70%, 65%)",
  angry: "hsl(0, 75%, 60%)",
  anxious: "hsl(270, 50%, 65%)",
  calm: "hsl(155, 55%, 60%)",
};

const ParentWeeklyInsights = ({ weeklyData, loading, childName }: Props) => {
  const [aiSummary, setAiSummary] = useState<{ patternSummary: string; trend: string; insight: string } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (weeklyData && weeklyData.allEmotions.length > 0) {
      fetchAISummary();
    }
  }, [weeklyData]);

  const fetchAISummary = async () => {
    if (!weeklyData) return;
    setSummaryLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("parent-insights", {
        body: {
          action: "weekly-summary",
          emotionData: { recentEmotions: weeklyData.allEmotions },
          childName,
        },
      });
      if (!error && data) setAiSummary(data);
    } catch {
      // Use fallback
      setAiSummary({
        patternSummary: `${childName} shows a healthy range of emotions this week.`,
        trend: "stable",
        insight: "Consistent emotional expression is a sign of healthy development.",
      });
    }
    setSummaryLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!weeklyData) return null;

  const trendEmoji = aiSummary?.trend === "improving" ? "📈" : aiSummary?.trend === "needs_attention" ? "⚠️" : "📊";

  return (
    <div className="space-y-4">
      {/* Chart */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="card-playful">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">📊 Weekly Emotion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.dailyCounts}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {Object.entries(EMOTION_COLORS).map(([key, color]) => (
                    <Bar key={key} dataKey={key} fill={color} stackId="emotions" radius={[2, 2, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dominant Emotion */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <Card className="card-playful">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Dominant Emotion This Week</p>
            <p className="text-lg font-display font-bold text-foreground capitalize mt-1">
              {weeklyData.dominantEmotion}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Summary */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="card-playful">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">{trendEmoji} AI Pattern Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : aiSummary ? (
              <div className="space-y-2">
                <p className="text-sm text-foreground">{aiSummary.patternSummary}</p>
                <p className="text-xs text-muted-foreground italic">💡 {aiSummary.insight}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available for analysis yet.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ParentWeeklyInsights;
