import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";

import classroomBg from "@/assets/scenes/classroom.jpg";
import playgroundBg from "@/assets/scenes/playground.jpg";
import birthdayBg from "@/assets/scenes/birthday.jpg";
import studygroupBg from "@/assets/scenes/studygroup.jpg";

type Emotion = "happy" | "sad" | "angry" | "surprised";

interface Character {
  id: string;
  emotion: Emotion;
  emoji: string;
  label: string;
}

interface Scene {
  name: string;
  image: string;
  characters: Character[];
}

const SCENES: Scene[] = [
  {
    name: "Classroom",
    image: classroomBg,
    characters: [
      { id: "c1", emotion: "happy", emoji: "😊", label: "Student A" },
      { id: "c2", emotion: "sad", emoji: "😢", label: "Student B" },
      { id: "c3", emotion: "angry", emoji: "😠", label: "Student C" },
      { id: "c4", emotion: "surprised", emoji: "😲", label: "Student D" },
    ],
  },
  {
    name: "Playground",
    image: playgroundBg,
    characters: [
      { id: "p1", emotion: "happy", emoji: "😄", label: "Child A" },
      { id: "p2", emotion: "angry", emoji: "😡", label: "Child B" },
      { id: "p3", emotion: "surprised", emoji: "😯", label: "Child C" },
      { id: "p4", emotion: "sad", emoji: "😞", label: "Child D" },
    ],
  },
  {
    name: "Birthday Party",
    image: birthdayBg,
    characters: [
      { id: "b1", emotion: "happy", emoji: "🥳", label: "Birthday Kid" },
      { id: "b2", emotion: "surprised", emoji: "😲", label: "Friend A" },
      { id: "b3", emotion: "sad", emoji: "😢", label: "Friend B" },
      { id: "b4", emotion: "angry", emoji: "😤", label: "Friend C" },
    ],
  },
  {
    name: "Study Group",
    image: studygroupBg,
    characters: [
      { id: "s1", emotion: "sad", emoji: "😔", label: "Student A" },
      { id: "s2", emotion: "happy", emoji: "😊", label: "Student B" },
      { id: "s3", emotion: "angry", emoji: "😤", label: "Student C" },
      { id: "s4", emotion: "surprised", emoji: "😮", label: "Student D" },
    ],
  },
];

const QUESTIONS_PER_SCENE = 3;

const PROMPTS: Record<Emotion, string[]> = {
  happy: ["Who is feeling happy?", "Find the happy child! 😊", "Tap the child who looks happy."],
  sad: ["Who is feeling sad?", "Find the sad child! 😢", "Tap the child who looks sad."],
  angry: ["Who is feeling angry?", "Tap the child who is angry! 😠", "Find the angry child."],
  surprised: ["Who looks surprised?", "Tap the child who is surprised! 😲", "Find the surprised child."],
};

function pickPrompt(emotion: Emotion): string {
  const list = PROMPTS[emotion];
  return list[Math.floor(Math.random() * list.length)];
}

function shuffleEmotions(scene: Scene): Emotion[] {
  const emotions = [...new Set(scene.characters.map((c) => c.emotion))] as Emotion[];
  for (let i = emotions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emotions[i], emotions[j]] = [emotions[j], emotions[i]];
  }
  return emotions.slice(0, QUESTIONS_PER_SCENE);
}

const EmotionDetective = () => {
  const { logActivity } = useActivityLog();
  const [totalStars, setTotalStars] = useState(0);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [questionQueue, setQuestionQueue] = useState<Emotion[]>(() => shuffleEmotions(SCENES[0]));
  const [questionIdx, setQuestionIdx] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const scene = SCENES[sceneIdx % SCENES.length];
  const targetEmotion = questionQueue[questionIdx];
  const prompt = useMemo(() => pickPrompt(targetEmotion), [targetEmotion, questionIdx, sceneIdx]);

  const handleTap = async (char: Character) => {
    if (feedback === "correct") return;
    if (char.emotion === targetEmotion) {
      setFeedback("correct");
      setHighlightedId(char.id);
      setTotalStars((s) => s + 5);
      await logActivity("emotion-detective", 5, 5, { scene: scene.name, emotion: targetEmotion });
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1400);
    }
  };

  const nextQuestion = useCallback(() => {
    const nextQ = questionIdx + 1;
    if (nextQ < questionQueue.length) {
      setQuestionIdx(nextQ);
      setFeedback(null);
      setHighlightedId(null);
    } else {
      const nextSceneIdx = (sceneIdx + 1) % SCENES.length;
      const nextScene = SCENES[nextSceneIdx];
      setSceneIdx(nextSceneIdx);
      setQuestionQueue(shuffleEmotions(nextScene));
      setQuestionIdx(0);
      setFeedback(null);
      setHighlightedId(null);
    }
  }, [questionIdx, questionQueue.length, sceneIdx]);

  const replay = () => {
    setTotalStars(0);
    setSceneIdx(0);
    const q = shuffleEmotions(SCENES[0]);
    setQuestionQueue(q);
    setQuestionIdx(0);
    setFeedback(null);
    setHighlightedId(null);
  };

  const sceneProgress = `Question ${questionIdx + 1} of ${questionQueue.length}`;

  return (
    <ActivityLayout title="Emotion Detective" emoji="🔍" starsEarned={totalStars}>
      <div className="card-playful p-5 text-center space-y-4">
        {/* Prompt */}
        <motion.div
          key={`${sceneIdx}-${questionIdx}`}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-1"
        >
          <p className="text-lg font-display font-bold text-foreground">🔍 {prompt}</p>
          <p className="text-xs font-display text-muted-foreground">
            {scene.name} — {sceneProgress}
          </p>
        </motion.div>

        {/* Scene image with characters overlaid */}
        <div className="relative w-full rounded-2xl border-2 border-border/50 overflow-hidden">
          <img
            src={scene.image}
            alt={`${scene.name} scene`}
            className="w-full h-56 sm:h-64 object-cover"
          />

          {/* Character grid overlay */}
          <div className="relative grid grid-cols-2 gap-3 p-3 bg-background/80 backdrop-blur-sm">
            {scene.characters.map((char) => {
              const isHighlighted = highlightedId === char.id;

              return (
                <motion.button
                  key={char.id}
                  className={`relative flex flex-col items-center justify-center rounded-2xl p-4 sm:p-5 transition-all min-h-[90px] ${
                    isHighlighted
                      ? "bg-accent/30 ring-4 ring-accent shadow-lg scale-105"
                      : "bg-background hover:bg-accent/10 hover:shadow-md active:scale-95 border border-border/40"
                  }`}
                  onClick={() => handleTap(char)}
                  whileHover={{ scale: isHighlighted ? 1.05 : 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  disabled={feedback === "correct"}
                >
                  <span className="text-5xl sm:text-6xl drop-shadow-md leading-none">{char.emoji}</span>
                  <span className="text-xs font-display text-muted-foreground mt-2">{char.label}</span>
                  {isHighlighted && (
                    <motion.span
                      initial={{ scale: 0, y: 0 }}
                      animate={{ scale: 1, y: -18 }}
                      className="absolute -top-1 right-1 text-2xl"
                    >
                      ⭐
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence mode="wait">
          {feedback === "correct" && (
            <motion.div
              key="correct"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="text-xl font-display font-bold text-accent">🎉 Correct! Well done! ⭐ +5</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={nextQuestion} className="rounded-xl font-display">
                  {questionIdx + 1 < questionQueue.length ? "Next Question ➡️" : "Next Scene ➡️"}
                </Button>
                <Button onClick={replay} variant="outline" className="rounded-xl font-display">
                  Replay 🔄
                </Button>
              </div>
            </motion.div>
          )}
          {feedback === "wrong" && (
            <motion.p
              key="wrong"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-display text-destructive font-bold"
            >
              Look carefully and try again 👀
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </ActivityLayout>
  );
};

export default EmotionDetective;
