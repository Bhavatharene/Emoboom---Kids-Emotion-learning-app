import { useState, useEffect, useMemo } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const pairs = [
  { emoji: "😊", name: "Happy" },
  { emoji: "😢", name: "Sad" },
  { emoji: "😠", name: "Angry" },
  { emoji: "😨", name: "Scared" },
  { emoji: "😲", name: "Surprised" },
  { emoji: "😌", name: "Calm" },
];

interface Card {
  id: number;
  content: string;
  pairId: number;
  type: "emoji" | "name";
}

const MemoryMatch = () => {
  const cards = useMemo(() => {
    const c: Card[] = [];
    pairs.forEach((p, i) => {
      c.push({ id: i * 2, content: p.emoji, pairId: i, type: "emoji" });
      c.push({ id: i * 2 + 1, content: p.name, pairId: i, type: "name" });
    });
    return c.sort(() => Math.random() - 0.5);
  }, []);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [stars, setStars] = useState(0);
  const [startTime] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const { logActivity } = useActivityLog();

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts((a) => a + 1);
      const [a, b] = newFlipped;
      const cardA = cards.find((c) => c.id === a)!;
      const cardB = cards.find((c) => c.id === b)!;

      if (cardA.pairId === cardB.pairId) {
        setMatched((m) => [...m, a, b]);
        setFlipped([]);
        toast.success("Match! 🎉");
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0 && !finished) {
      setFinished(true);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const earned = attempts <= 10 ? 3 : attempts <= 15 ? 2 : 1;
      setStars(earned);
      logActivity("memory-match", pairs.length, earned, {
        attempts,
        time_seconds: timeTaken,
      });
    }
  }, [matched]);

  if (finished) {
    return (
      <ActivityLayout title="Memory Match" emoji="🧩" starsEarned={stars}>
        <div className="card-playful p-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-display font-bold text-foreground">All Matched!</h2>
          <p className="text-muted-foreground mt-2">
            {attempts} attempts • {Math.round((Date.now() - startTime) / 1000)}s
          </p>
          <Button className="mt-6 rounded-xl font-display" onClick={() => window.location.reload()}>
            Play Again 🔄
          </Button>
        </div>
      </ActivityLayout>
    );
  }

  return (
    <ActivityLayout title="Memory Match" emoji="🧩" starsEarned={stars}>
      <div className="flex justify-between text-sm text-muted-foreground mb-4">
        <span>Attempts: {attempts}</span>
        <span>Matched: {matched.length / 2}/{pairs.length}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleFlip(card.id)}
              className={`h-20 rounded-2xl font-display font-bold text-lg transition-all ${
                matched.includes(card.id)
                  ? "bg-accent/30 ring-2 ring-accent"
                  : isFlipped
                  ? "bg-primary/20 ring-2 ring-primary"
                  : "bg-muted hover:bg-muted/80 cursor-pointer"
              }`}
            >
              {isFlipped ? (
                <motion.span initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}>
                  {card.type === "emoji" ? (
                    <span className="text-3xl">{card.content}</span>
                  ) : (
                    <span className="text-sm">{card.content}</span>
                  )}
                </motion.span>
              ) : (
                <span className="text-2xl">❓</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </ActivityLayout>
  );
};

export default MemoryMatch;
