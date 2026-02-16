import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface CoachResponse {
  message: string;
  activity: string;
  emoji: string;
  type: string;
}

interface EmotionCoachProps {
  emotion: string;
  onClose?: () => void;
}

const EmotionCoach = ({ emotion, onClose }: EmotionCoachProps) => {
  const { profile } = useAuth();
  const [response, setResponse] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);

  const getCoaching = async () => {
    setLoading(true);
    setAsked(true);
    try {
      const { data, error } = await supabase.functions.invoke("emotion-coach", {
        body: { emotion, childName: profile?.name || "friend" },
      });
      if (error) throw error;
      setResponse(data);
    } catch (err: any) {
      toast.error("Couldn't get coaching right now. Try again!");
      console.error(err);
    }
    setLoading(false);
  };

  if (!asked) {
    return (
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card-playful p-5 text-center">
        <Sparkles className="w-8 h-8 text-star mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">Want a tip from your Emotion Coach?</p>
        <Button onClick={getCoaching} className="rounded-xl font-display">
          <Sparkles className="w-4 h-4 mr-2" />
          Get Coaching!
        </Button>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="card-playful p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-sm font-display text-muted-foreground">Thinking...</p>
      </div>
    );
  }

  if (!response) return null;

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card-playful p-5">
      <div className="flex items-start gap-3">
        <div className="text-4xl">{response.emoji}</div>
        <div className="flex-1">
          <p className="font-display font-bold text-foreground text-sm mb-1">MindBloom Buddy says:</p>
          <p className="text-foreground text-sm">{response.message}</p>
          <div className="mt-3 bg-primary/10 rounded-xl p-3">
            <p className="text-xs font-display font-bold text-primary">💡 Try this:</p>
            <p className="text-xs text-foreground">{response.activity}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" onClick={getCoaching} className="rounded-xl text-xs flex-1">
          Another tip ✨
        </Button>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl text-xs">
            Close
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EmotionCoach;
