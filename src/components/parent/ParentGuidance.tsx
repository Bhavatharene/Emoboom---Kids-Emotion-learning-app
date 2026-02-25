import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, RefreshCw } from "lucide-react";
import type { DailyEmotionSummary, WeeklyData } from "@/hooks/useParentInsights";

interface Props {
  todaySummary: DailyEmotionSummary | null;
  weeklyData: WeeklyData | null;
  childName: string;
}

interface GuidanceData {
  detectedEmotion: string;
  summary: string;
  recommendedAction: string;
  dos: string[];
  donts: string[];
  encouragement: string;
}

// Fallback rule-based guidance
const FALLBACK_GUIDANCE: Record<string, GuidanceData> = {
  sad: {
    detectedEmotion: "sad",
    summary: "Your child has been feeling sad recently.",
    recommendedAction: "Encourage open conversation and offer emotional support. Let them know it's okay to feel sad.",
    dos: ["Listen without judgment", "Offer comfort and hugs", "Share a calming activity together"],
    donts: ["Don't dismiss their feelings", "Don't say 'cheer up'", "Don't compare with other children"],
    encouragement: "Your presence means the world to them. 💙",
  },
  angry: {
    detectedEmotion: "angry",
    summary: "Your child has shown signs of frustration or anger.",
    recommendedAction: "Allow cooling time before discussing. Help them name their feelings and find healthy outlets.",
    dos: ["Stay calm yourself", "Validate their emotion", "Teach deep breathing"],
    donts: ["Don't react with anger", "Don't punish the emotion", "Don't force immediate discussion"],
    encouragement: "Teaching anger management is one of the most valuable gifts! 💪",
  },
  anxious: {
    detectedEmotion: "anxious",
    summary: "Your child seems to be experiencing worry or anxiety.",
    recommendedAction: "Provide reassurance and maintain consistent routines. Help them express what's worrying them.",
    dos: ["Create a safe space to talk", "Maintain routines", "Practice relaxation together"],
    donts: ["Don't dismiss their fears", "Don't over-reassure", "Don't avoid the topic"],
    encouragement: "Your patience helps build their resilience. 🌈",
  },
  happy: {
    detectedEmotion: "happy",
    summary: "Your child is in a great emotional state!",
    recommendedAction: "Reinforce the positive behavior and activities that contributed to this mood.",
    dos: ["Celebrate with them", "Ask what made them happy", "Encourage sharing joy with others"],
    donts: ["Don't take it for granted", "Don't set unrealistic expectations", "Don't compare days"],
    encouragement: "You're clearly doing something right! Keep it up! ⭐",
  },
  calm: {
    detectedEmotion: "calm",
    summary: "Your child is feeling peaceful and balanced.",
    recommendedAction: "This is a great time for meaningful conversations and bonding activities.",
    dos: ["Enjoy quality time", "Introduce new learning", "Practice mindfulness together"],
    donts: ["Don't overstimulate", "Don't disrupt the calm", "Don't add pressure"],
    encouragement: "A calm child is a thriving child. Well done! 🌿",
  },
};

const ParentGuidance = ({ todaySummary, weeklyData, childName }: Props) => {
  const [guidance, setGuidance] = useState<GuidanceData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (todaySummary) fetchGuidance();
  }, [todaySummary]);

  const fetchGuidance = async () => {
    if (!todaySummary) return;
    setLoading(true);

    const dominant = todaySummary.mostFrequent;
    const allEmotions = weeklyData?.allEmotions || [dominant];

    try {
      const { data, error } = await supabase.functions.invoke("parent-insights", {
        body: {
          action: "guidance",
          emotionData: { dominantEmotion: dominant, recentEmotions: allEmotions },
          childName,
        },
      });
      if (!error && data) {
        setGuidance(data);
      } else {
        setGuidance(FALLBACK_GUIDANCE[dominant] || FALLBACK_GUIDANCE.calm);
      }
    } catch {
      setGuidance(FALLBACK_GUIDANCE[dominant] || FALLBACK_GUIDANCE.calm);
    }
    setLoading(false);
  };

  if (loading || !guidance) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="card-playful border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-star" /> AI Parenting Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-primary/10 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Detected Pattern</p>
              <p className="text-sm font-display font-bold text-foreground capitalize">{guidance.detectedEmotion}</p>
              <p className="text-sm text-foreground mt-1">{guidance.summary}</p>
            </div>
            <div>
              <p className="text-xs font-display font-bold text-primary mb-1">💡 Recommended Action</p>
              <p className="text-sm text-foreground">{guidance.recommendedAction}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Do's and Don'ts */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 gap-3">
          <Card className="card-playful">
            <CardContent className="p-4">
              <p className="text-sm font-display font-bold text-accent mb-2">✅ Do's</p>
              <ul className="space-y-1.5">
                {guidance.dos.map((item, i) => (
                  <li key={i} className="text-xs text-foreground">• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="card-playful">
            <CardContent className="p-4">
              <p className="text-sm font-display font-bold text-destructive mb-2">❌ Don'ts</p>
              <ul className="space-y-1.5">
                {guidance.donts.map((item, i) => (
                  <li key={i} className="text-xs text-foreground">• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Encouragement */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="card-playful bg-accent/10">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-display font-bold text-foreground">{guidance.encouragement}</p>
          </CardContent>
        </Card>
      </motion.div>

      <Button variant="outline" className="w-full rounded-xl font-display" onClick={fetchGuidance}>
        <RefreshCw className="w-4 h-4 mr-2" /> Refresh Guidance
      </Button>
    </div>
  );
};

export default ParentGuidance;
