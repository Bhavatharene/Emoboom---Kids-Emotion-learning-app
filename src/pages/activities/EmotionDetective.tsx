import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";

type Emotion = "happy" | "sad" | "angry" | "surprised" | "neutral";

interface Character {
  id: string;
  emotion: Emotion;
  emoji: string;
  x: number;
  y: number;
  label: string;
}

interface Scene {
  name: string;
  bg: string;
  bgEmoji: string;
  characters: Character[];
}

const SCENES: Scene[] = [
  {
    name: "Classroom",
    bg: "from-blue-100 to-blue-50",
    bgEmoji: "📚",
    characters: [
      { id: "c1", emotion: "happy", emoji: "😊", x: 15, y: 55, label: "Student A" },
      { id: "c2", emotion: "sad", emoji: "😢", x: 40, y: 45, label: "Student B" },
      { id: "c3", emotion: "neutral", emoji: "😐", x: 65, y: 55, label: "Student C" },
      { id: "c4", emotion: "surprised", emoji: "😲", x: 85, y: 45, label: "Student D" },
    ],
  },
  {
    name: "Playground",
    bg: "from-green-100 to-yellow-50",
    bgEmoji: "🏫",
    characters: [
      { id: "p1", emotion: "happy", emoji: "😄", x: 20, y: 50, label: "Child A" },
      { id: "p2", emotion: "angry", emoji: "😠", x: 50, y: 60, label: "Child B" },
      { id: "p3", emotion: "happy", emoji: "😁", x: 75, y: 45, label: "Child C" },
      { id: "p4", emotion: "sad", emoji: "😞", x: 35, y: 40, label: "Child D" },
      { id: "p5", emotion: "surprised", emoji: "😯", x: 88, y: 58, label: "Child E" },
    ],
  },
  {
    name: "Birthday Party",
    bg: "from-pink-100 to-purple-50",
    bgEmoji: "🎂",
    characters: [
      { id: "b1", emotion: "happy", emoji: "🥳", x: 25, y: 50, label: "Birthday Kid" },
      { id: "b2", emotion: "surprised", emoji: "😲", x: 50, y: 45, label: "Friend A" },
      { id: "b3", emotion: "happy", emoji: "😊", x: 75, y: 55, label: "Friend B" },
      { id: "b4", emotion: "sad", emoji: "😢", x: 10, y: 60, label: "Friend C" },
    ],
  },
  {
    name: "Study Group",
    bg: "from-orange-50 to-amber-50",
    bgEmoji: "✏️",
    characters: [
      { id: "s1", emotion: "neutral", emoji: "😐", x: 20, y: 50, label: "Student A" },
      { id: "s2", emotion: "happy", emoji: "😊", x: 45, y: 45, label: "Student B" },
      { id: "s3", emotion: "angry", emoji: "😤", x: 70, y: 55, label: "Student C" },
      { id: "s4", emotion: "sad", emoji: "😔", x: 88, y: 48, label: "Student D" },
    ],
  },
];

const EMOTION_LABELS: Record<Emotion, string> = {
  happy: "Happy 😊",
  sad: "Sad 😢",
  angry: "Angry 😠",
  surprised: "Surprised 😲",
  neutral: "Neutral 😐",
};

const EmotionDetective = () => {
  const { logActivity } = useActivityLog();
  const [totalStars, setTotalStars] = useState(0);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [targetEmotion, setTargetEmotion] = useState<Emotion>(() => pickTarget(SCENES[0]));
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; charId: string } | null>(null);
  const [found, setFound] = useState<Set<string>>(new Set());

  function pickTarget(scene: Scene): Emotion {
    const emotions = [...new Set(scene.characters.map((c) => c.emotion))];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  const scene = SCENES[sceneIdx % SCENES.length];

  const handleTap = async (char: Character) => {
    if (found.has(char.id)) return;
    if (char.emotion === targetEmotion) {
      setFeedback({ type: "correct", charId: char.id });
      setFound((s) => new Set(s).add(char.id));
      setTotalStars((s) => s + 5);
      await logActivity("emotion-detective", 5, 5, { scene: scene.name, emotion: targetEmotion });
    } else {
      setFeedback({ type: "wrong", charId: char.id });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const nextScene = useCallback(() => {
    const nextIdx = (sceneIdx + 1) % SCENES.length;
    const nextScene = SCENES[nextIdx];
    setSceneIdx(nextIdx);
    setTargetEmotion(pickTarget(nextScene));
    setFeedback(null);
    setFound(new Set());
  }, [sceneIdx]);

  const replay = () => {
    setTotalStars(0);
    setSceneIdx(0);
    setTargetEmotion(pickTarget(SCENES[0]));
    setFeedback(null);
    setFound(new Set());
  };

  return (
    <ActivityLayout title="Emotion Detective" emoji="🔍" starsEarned={totalStars}>
      <div className="card-playful p-5 text-center space-y-4">
        <motion.p key={targetEmotion + sceneIdx} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-lg font-display font-bold text-foreground">
          🔍 Find the child who is <span className="text-primary">{EMOTION_LABELS[targetEmotion]}</span>
        </motion.p>

        <p className="text-sm font-display text-muted-foreground">{scene.bgEmoji} {scene.name}</p>

        {/* Scene */}
        <div className={`relative w-full h-64 rounded-2xl bg-gradient-to-br ${scene.bg} border-2 border-border/50 overflow-hidden`}>
          {/* Background decorations */}
          <div className="absolute inset-0 flex items-end justify-center opacity-20 text-6xl pb-2">{scene.bgEmoji}</div>

          {scene.characters.map((char) => {
            const isFound = found.has(char.id);
            const isWrong = feedback?.type === "wrong" && feedback.charId === char.id;
            const isCorrect = feedback?.type === "correct" && feedback.charId === char.id;

            return (
              <motion.button
                key={char.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full p-1 transition-all ${
                  isFound
                    ? "ring-4 ring-accent scale-110"
                    : isWrong
                    ? "ring-4 ring-destructive animate-wiggle"
                    : "hover:scale-125 active:scale-110"
                }`}
                style={{ left: `${char.x}%`, top: `${char.y}%` }}
                onClick={() => handleTap(char)}
                whileHover={{ scale: isFound ? 1.1 : 1.25 }}
                whileTap={{ scale: 0.9 }}
                disabled={isFound}
              >
                <span className="text-4xl drop-shadow-md">{char.emoji}</span>
                {isCorrect && (
                  <motion.span
                    initial={{ scale: 0, y: 0 }}
                    animate={{ scale: 1, y: -30 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl"
                  >
                    ⭐
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {feedback?.type === "correct" && (
            <motion.div key="correct" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              <p className="text-xl font-display font-bold text-accent">🎉 You found it! ⭐ +5</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={nextScene} className="rounded-xl font-display">Next Scene ➡️</Button>
                <Button onClick={replay} variant="outline" className="rounded-xl font-display">Replay 🔄</Button>
              </div>
            </motion.div>
          )}
          {feedback?.type === "wrong" && (
            <motion.p key="wrong" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-display text-destructive font-bold">
              Look carefully and try again 👀
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </ActivityLayout>
  );
};

export default EmotionDetective;
