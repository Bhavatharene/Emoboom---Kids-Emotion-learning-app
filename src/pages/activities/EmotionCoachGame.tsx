import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";

interface CoachQuestion {
  scenario: string;
  emoji: string;
  options: { text: string; isCorrect: boolean; explanation: string }[];
}

const QUESTIONS: CoachQuestion[] = [
  {
    scenario: "Your friend is sad because they miss their pet.",
    emoji: "😿",
    options: [
      { text: "Give them a hug 🤗", isCorrect: true, explanation: "A hug shows you care and helps them feel less alone." },
      { text: "Say 'Stop being sad'", isCorrect: false, explanation: "Everyone needs time to feel sad. Being patient is kinder." },
      { text: "Laugh at them", isCorrect: false, explanation: "Laughing at someone's feelings can really hurt. Try being kind instead." },
    ],
  },
  {
    scenario: "A younger kid is scared of the dark.",
    emoji: "🌙",
    options: [
      { text: "Tell them a fun story 📖", isCorrect: true, explanation: "A fun story can help them feel brave and safe!" },
      { text: "Say 'That's silly'", isCorrect: false, explanation: "Their feelings are real. Being understanding is better." },
      { text: "Scare them more", isCorrect: false, explanation: "That would make them feel worse. Always be kind!" },
    ],
  },
  {
    scenario: "Your classmate is angry because someone broke their pencil.",
    emoji: "✏️",
    options: [
      { text: "Share your pencil 🤝", isCorrect: true, explanation: "Sharing helps calm anger and shows you're a good friend!" },
      { text: "Tell them to be quiet", isCorrect: false, explanation: "Their anger is real. Try helping instead of shushing." },
      { text: "Break another pencil", isCorrect: false, explanation: "That would make things worse! Helping is always better." },
    ],
  },
  {
    scenario: "Your friend is excited about their birthday!",
    emoji: "🎂",
    options: [
      { text: "Say 'Happy Birthday!' 🎉", isCorrect: true, explanation: "Celebrating together makes happy moments even better!" },
      { text: "Ignore them", isCorrect: false, explanation: "They want to share their joy! Join in the fun!" },
      { text: "Say 'I don't care'", isCorrect: false, explanation: "That would hurt their feelings. Sharing joy is wonderful!" },
    ],
  },
  {
    scenario: "A new kid doesn't know how to play the game.",
    emoji: "🎮",
    options: [
      { text: "Teach them the rules 📋", isCorrect: true, explanation: "Teaching others is a kind and helpful thing to do!" },
      { text: "Don't let them play", isCorrect: false, explanation: "Everyone deserves a chance. Including others is important." },
      { text: "Make fun of them", isCorrect: false, explanation: "Nobody knows everything at first. Be patient and kind!" },
    ],
  },
  {
    scenario: "Your friend made a mistake on their test and feels bad.",
    emoji: "📝",
    options: [
      { text: "Say 'You'll do better next time!' 💪", isCorrect: true, explanation: "Encouragement helps friends believe in themselves!" },
      { text: "Show off your good grade", isCorrect: false, explanation: "That might make them feel worse. Be supportive instead." },
      { text: "Laugh at their score", isCorrect: false, explanation: "That's hurtful. Everyone makes mistakes sometimes." },
    ],
  },
];

const EmotionCoachGame = () => {
  const { logActivity } = useActivityLog();
  const questions = useMemo(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5), []);
  const [current, setCurrent] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const handleAnswer = (option: CoachQuestion["options"][0]) => {
    if (feedback) return;
    setFeedback({ text: option.explanation, isCorrect: option.isCorrect });
    if (option.isCorrect) {
      setTotalStars((s) => s + 5);
      setCorrectCount((c) => c + 1);
    }
  };

  const advance = async () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setFeedback(null);
    } else {
      setFinished(true);
      await logActivity("emotion-coach-game", correctCount, totalStars, {
        total: questions.length,
        correct: correctCount,
      });
    }
  };

  const replay = () => {
    setCurrent(0);
    setTotalStars(0);
    setFeedback(null);
    setFinished(false);
    setCorrectCount(0);
  };

  if (finished) {
    return (
      <ActivityLayout title="Emotion Coach" emoji="💛" starsEarned={totalStars}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-playful p-8 text-center space-y-4">
          <div className="text-6xl">🏆</div>
          <h2 className="text-2xl font-display font-bold text-foreground">You're an Empathy Hero!</h2>
          <p className="text-muted-foreground">{correctCount} caring choices out of {questions.length}!</p>
          <Button onClick={replay} className="rounded-xl font-display">Play Again 🔄</Button>
        </motion.div>
      </ActivityLayout>
    );
  }

  const q = questions[current];

  return (
    <ActivityLayout title="Emotion Coach" emoji="💛" starsEarned={totalStars}>
      <div className="card-playful p-5 space-y-4">
        <p className="text-xs font-display text-muted-foreground text-center">
          Question {current + 1} of {questions.length}
        </p>

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="text-center space-y-3">
            <div className="text-6xl">{q.emoji}</div>
            <p className="text-lg font-display font-bold text-foreground">{q.scenario}</p>
            <p className="text-sm font-display text-muted-foreground">What should you do?</p>
          </motion.div>
        </AnimatePresence>

        {!feedback && (
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => handleAnswer(opt)} className="w-full card-playful p-4 text-left font-display font-bold text-foreground hover:bg-muted transition-colors">
                {opt.text}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`rounded-2xl p-4 text-center space-y-3 ${feedback.isCorrect ? "bg-accent/20 border-2 border-accent/40" : "bg-primary/10 border-2 border-primary/30"}`}>
              <p className="text-3xl">{feedback.isCorrect ? "⭐" : "💡"}</p>
              <p className="font-display font-bold text-foreground text-sm">{feedback.text}</p>
              {feedback.isCorrect && <p className="text-xs font-display text-accent font-bold">+5 stars!</p>}
              <Button onClick={advance} className="rounded-xl font-display" size="sm">
                {current < questions.length - 1 ? "Next ➡️" : "Finish 🎉"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ActivityLayout>
  );
};

export default EmotionCoachGame;
