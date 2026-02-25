import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyEmotionSummary } from "@/hooks/useParentInsights";

interface Props {
  todaySummary: DailyEmotionSummary | null;
  loading: boolean;
  getEmotionEmoji: (emotion: string) => string;
}

const STABILITY_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  stable: { label: "Stable", color: "text-accent", emoji: "🟢" },
  moderate: { label: "Moderate Variation", color: "text-star", emoji: "🟡" },
  high_fluctuation: { label: "High Fluctuation", color: "text-destructive", emoji: "🔴" },
};

const EMOTION_COLORS: Record<string, string> = {
  happy: "bg-happy",
  sad: "bg-sad",
  angry: "bg-angry",
  anxious: "bg-scared",
  calm: "bg-calm",
};

const ParentOverview = ({ todaySummary, loading, getEmotionEmoji }: Props) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!todaySummary) return null;

  const total = Object.values(todaySummary.distribution).reduce((a, b) => a + b, 0);
  const stabilityInfo = STABILITY_LABELS[todaySummary.stability] || STABILITY_LABELS.stable;

  return (
    <div className="space-y-4">
      {/* Emotion Summary */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="card-playful">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">
              🎭 Today's Emotion Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Most Frequent</p>
                <p className="text-lg font-display font-bold text-foreground capitalize">
                  {getEmotionEmoji(todaySummary.mostFrequent)} {todaySummary.mostFrequent}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Sessions</p>
                <p className="text-lg font-display font-bold text-foreground">{todaySummary.totalSessions}</p>
              </div>
            </div>

            {/* Distribution bars */}
            <div className="space-y-2">
              {Object.entries(todaySummary.distribution)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, count]) => (
                  <div key={emotion} className="flex items-center gap-2">
                    <span className="text-sm w-20 capitalize font-display">
                      {getEmotionEmoji(emotion)} {emotion}
                    </span>
                    <Progress
                      value={total > 0 ? (count / total) * 100 : 0}
                      className={`flex-1 h-3 ${EMOTION_COLORS[emotion] ? `[&>div]:${EMOTION_COLORS[emotion]}` : ""}`}
                    />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {total > 0 ? Math.round((count / total) * 100) : 0}%
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stability */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <Card className="card-playful">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stabilityInfo.emoji}</span>
              <div>
                <p className="text-xs text-muted-foreground">Emotional Stability</p>
                <p className={`font-display font-bold ${stabilityInfo.color}`}>{stabilityInfo.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline */}
      {todaySummary.recentTimeline.length > 0 && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="card-playful">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">🕐 Recent Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todaySummary.recentTimeline.map((record, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                    <span className="text-sm font-display capitalize">
                      {getEmotionEmoji(record.emotion)} {record.emotion}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ParentOverview;
