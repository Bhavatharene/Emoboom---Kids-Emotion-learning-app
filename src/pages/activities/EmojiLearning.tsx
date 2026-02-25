import { useState } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { speakText } from "@/lib/speech";

const emotions = [
  { emoji: "😊", name: "Happy", meaning: "Feeling glad, joyful, and full of smiles!" },
  { emoji: "😢", name: "Sad", meaning: "Feeling down, like you want to cry." },
  { emoji: "😠", name: "Angry", meaning: "Feeling mad or frustrated about something." },
  { emoji: "😨", name: "Scared", meaning: "Feeling afraid or worried about something." },
  { emoji: "😲", name: "Surprised", meaning: "Feeling amazed or shocked by something unexpected!" },
  { emoji: "😌", name: "Calm", meaning: "Feeling peaceful and relaxed inside." },
  { emoji: "🤢", name: "Disgusted", meaning: "Feeling grossed out by something yucky." },
  { emoji: "🥰", name: "Loved", meaning: "Feeling warm, cared for, and special." },
];

const EmojiLearning = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [stars, setStars] = useState(0);
  const { logActivity, logEmotion } = useActivityLog();

  const handleSelect = async (idx: number) => {
    setSelected(idx);
    const emotion = emotions[idx];
    speakText(emotion.name);
    await logEmotion(emotion.name, "emoji");
    const earned = 1;
    setStars((s) => s + earned);
    await logActivity("emoji-learning", 1, earned, { emotion: emotion.name });
    toast.success(`Great! You learned about ${emotion.name}! ⭐`);
  };

  return (
    <ActivityLayout title="Emoji Learning" emoji="😀" starsEarned={stars}>
      <p className="text-center text-muted-foreground mb-6">
        Tap an emoji to learn what it means!
      </p>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {emotions.map((e, i) => (
          <motion.button
            key={e.name}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSelect(i)}
            className={`text-5xl p-3 rounded-2xl transition-colors ${
              selected === i ? "bg-primary/20 ring-2 ring-primary" : "bg-card hover:bg-muted"
            }`}
          >
            {e.emoji}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {selected !== null && (
          <motion.div
            key={selected}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="card-playful p-6 text-center"
          >
            <div className="text-6xl mb-3">{emotions[selected].emoji}</div>
            <h3 className="text-2xl font-display font-bold text-foreground">{emotions[selected].name}</h3>
            <p className="text-muted-foreground mt-2">{emotions[selected].meaning}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </ActivityLayout>
  );
};

export default EmojiLearning;
