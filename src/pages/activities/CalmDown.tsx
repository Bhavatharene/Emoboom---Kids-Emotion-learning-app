import { useState, useEffect, useCallback } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CalmDown = () => {
  const [mode, setMode] = useState<"choose" | "breathe" | "bubbles">("choose");
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const [breathCount, setBreathCount] = useState(0);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [popped, setPopped] = useState(0);
  const [stars, setStars] = useState(0);
  const { logActivity } = useActivityLog();

  // Breathing
  useEffect(() => {
    if (mode !== "breathe") return;
    const phases: ("in" | "hold" | "out")[] = ["in", "hold", "out"];
    const durations = [4000, 2000, 4000];
    let phaseIdx = 0;

    const run = () => {
      setBreathPhase(phases[phaseIdx]);
      const timer = setTimeout(() => {
        phaseIdx = (phaseIdx + 1) % 3;
        if (phaseIdx === 0) setBreathCount((c) => c + 1);
        run();
      }, durations[phaseIdx]);
      return timer;
    };

    const timer = run();
    return () => clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    if (breathCount >= 3 && mode === "breathe") {
      const earned = 2;
      setStars((s) => s + earned);
      logActivity("calm-down", 1, earned, { type: "breathing" });
      toast.success("Great breathing! You earned stars! 🌟");
      setMode("choose");
      setBreathCount(0);
    }
  }, [breathCount]);

  // Bubbles
  useEffect(() => {
    if (mode !== "bubbles") return;
    const newBubbles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      size: Math.random() * 30 + 40,
    }));
    setBubbles(newBubbles);
    setPopped(0);
  }, [mode]);

  const popBubble = useCallback(async (id: number) => {
    setBubbles((b) => b.filter((bb) => bb.id !== id));
    const newPopped = popped + 1;
    setPopped(newPopped);
    if (newPopped >= 12) {
      const earned = 2;
      setStars((s) => s + earned);
      await logActivity("calm-down", 1, earned, { type: "bubbles" });
      toast.success("All bubbles popped! 🫧⭐");
      setMode("choose");
    }
  }, [popped]);

  if (mode === "choose") {
    return (
      <ActivityLayout title="Calm Down" emoji="🧘" starsEarned={stars}>
        <p className="text-center text-muted-foreground mb-6">Pick an activity to relax!</p>
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode("breathe")}
            className="card-playful p-6 w-full text-center"
          >
            <div className="text-5xl mb-2">🌬️</div>
            <h3 className="font-display font-bold text-lg text-foreground">Breathing Exercise</h3>
            <p className="text-sm text-muted-foreground">Breathe in... hold... breathe out...</p>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode("bubbles")}
            className="card-playful p-6 w-full text-center"
          >
            <div className="text-5xl mb-2">🫧</div>
            <h3 className="font-display font-bold text-lg text-foreground">Bubble Pop</h3>
            <p className="text-sm text-muted-foreground">Pop all the bubbles to feel calm!</p>
          </motion.button>
        </div>
      </ActivityLayout>
    );
  }

  if (mode === "breathe") {
    return (
      <ActivityLayout title="Calm Down" emoji="🧘" starsEarned={stars}>
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">Breath {breathCount + 1} of 3</p>
          <motion.div
            animate={{
              scale: breathPhase === "in" ? 1.5 : breathPhase === "hold" ? 1.5 : 1,
            }}
            transition={{ duration: breathPhase === "hold" ? 0.3 : breathPhase === "in" ? 4 : 4 }}
            className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center"
          >
            <span className="text-4xl font-display font-bold text-secondary-foreground">
              {breathPhase === "in" ? "In" : breathPhase === "hold" ? "Hold" : "Out"}
            </span>
          </motion.div>
          <p className="mt-6 text-lg font-display text-foreground">
            {breathPhase === "in" ? "Breathe in slowly... 🌬️" : breathPhase === "hold" ? "Hold it... 😌" : "Let it out... 💨"}
          </p>
          <Button variant="outline" className="mt-8 rounded-xl" onClick={() => { setMode("choose"); setBreathCount(0); }}>
            Back
          </Button>
        </div>
      </ActivityLayout>
    );
  }

  // Bubbles mode
  return (
    <ActivityLayout title="Calm Down" emoji="🧘" starsEarned={stars}>
      <p className="text-center text-muted-foreground mb-4">
        Pop all the bubbles! ({12 - bubbles.length}/12)
      </p>
      <div className="relative w-full h-80 bg-secondary/20 rounded-3xl overflow-hidden">
        {bubbles.map((b) => (
          <motion.button
            key={b.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: [0, -10, 0] }}
            transition={{ y: { repeat: Infinity, duration: 2 + Math.random() * 2 } }}
            exit={{ scale: 0 }}
            onClick={() => popBubble(b.id)}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size }}
            className="absolute rounded-full bg-secondary/60 border-2 border-secondary hover:bg-primary/30 transition-colors cursor-pointer"
          />
        ))}
      </div>
      <Button variant="outline" className="mt-4 rounded-xl mx-auto block" onClick={() => setMode("choose")}>
        Back
      </Button>
    </ActivityLayout>
  );
};

export default CalmDown;
