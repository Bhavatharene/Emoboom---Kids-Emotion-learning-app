import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Heart } from "lucide-react";
import type { DailyEmotionSummary } from "@/hooks/useParentInsights";

interface Props {
  todaySummary: DailyEmotionSummary | null;
}

interface Alert {
  type: "warning" | "positive" | "info";
  message: string;
  icon: React.ReactNode;
}

const ParentAlerts = ({ todaySummary }: Props) => {
  if (!todaySummary) return null;

  const alerts: Alert[] = [];
  const total = Object.values(todaySummary.distribution).reduce((a, b) => a + b, 0);

  if (total > 0) {
    const negativeCount = (todaySummary.distribution.sad || 0) +
      (todaySummary.distribution.angry || 0) +
      (todaySummary.distribution.anxious || 0);
    const negativePercent = (negativeCount / total) * 100;

    if (negativePercent > 60) {
      alerts.push({
        type: "warning",
        message: `${Math.round(negativePercent)}% negative emotions today. Consider checking in with your child.`,
        icon: <AlertTriangle className="w-4 h-4" />,
      });
    }

    if (todaySummary.stability === "high_fluctuation") {
      alerts.push({
        type: "info",
        message: "High emotional fluctuation detected. This may indicate your child needs extra support.",
        icon: <TrendingUp className="w-4 h-4" />,
      });
    }

    const positiveCount = (todaySummary.distribution.happy || 0) + (todaySummary.distribution.calm || 0);
    if (positiveCount / total > 0.7) {
      alerts.push({
        type: "positive",
        message: "Consistently positive mood today! Great job! 🌟",
        icon: <Heart className="w-4 h-4" />,
      });
    }
  }

  if (alerts.length === 0) return null;

  const colorMap = {
    warning: "bg-destructive/10 border-destructive/30 text-destructive",
    positive: "bg-accent/10 border-accent/30 text-accent",
    info: "bg-secondary/10 border-secondary/30 text-secondary",
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <motion.div
          key={i}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-display ${colorMap[alert.type]}`}
        >
          {alert.icon}
          <span>{alert.message}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default ParentAlerts;
