import { useState, useMemo } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const allQuestions = [
  { face: "😊", correct: "Happy", options: ["Happy", "Sad", "Angry", "Scared"] },
  { face: "😢", correct: "Sad", options: ["Surprised", "Sad", "Happy", "Calm"] },
  { face: "😠", correct: "Angry", options: ["Scared", "Happy", "Angry", "Calm"] },
  { face: "😨", correct: "Scared", options: ["Angry", "Scared", "Sad", "Happy"] },
  { face: "😲", correct: "Surprised", options: ["Calm", "Angry", "Happy", "Surprised"] },
  { face: "🥰", correct: "Loved", options: ["Angry", "Loved", "Scared", "Sad"] },
  { face: "😌", correct: "Calm", options: ["Calm", "Angry", "Sad", "Surprised"] },
  { face: "🤢", correct: "Disgusted", options: ["Happy", "Disgusted", "Scared", "Calm"] },
];

const GuessEmotion = () => {
  const questions = useMemo(() => [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 5), []);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const { logActivity } = useActivityLog();

  const handleAnswer = async (answer: string) => {
    const correct = answer === questions[current].correct;
    setAnswered(answer);
    if (correct) {
      setScore((s) => s + 1);
      toast.success("You got it! 🎉");
    } else {
      toast.error(`It was ${questions[current].correct}!`);
    }

    setTimeout(async () => {
      if (current < questions.length - 1) {
        setCurrent((c) => c + 1);
        setAnswered(null);
      } else {
        const finalScore = correct ? score + 1 : score;
        const earned = Math.ceil((finalScore / questions.length) * 3);
        setStars(earned);
        setFinished(true);
        await logActivity("guess-emotion", finalScore, earned, { total: questions.length, correct: finalScore });
      }
    }, 1200);
  };

  if (finished) {
    return (
      <ActivityLayout title="Guess Emotion" emoji="🤔" starsEarned={stars}>
        <div className="card-playful p-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-display font-bold text-foreground">{score}/{questions.length} correct!</h2>
          <p className="text-muted-foreground mt-2">Great guessing! ⭐</p>
          <Button className="mt-6 rounded-xl font-display" onClick={() => window.location.reload()}>
            Play Again 🔄
          </Button>
        </div>
      </ActivityLayout>
    );
  }

  const q = questions[current];

  return (
    <ActivityLayout title="Guess Emotion" emoji="🤔" starsEarned={stars}>
      <div className="text-center text-sm text-muted-foreground mb-2">
        {current + 1} of {questions.length}
      </div>
      <div className="card-playful p-8 text-center mb-6">
        <motion.div
          key={current}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl"
        >
          {q.face}
        </motion.div>
        <p className="mt-4 text-lg font-display text-foreground">What emotion is this?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt) => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.9 }}
            disabled={answered !== null}
            onClick={() => handleAnswer(opt)}
            className={`card-playful p-4 font-display font-bold text-lg transition-colors ${
              answered === opt
                ? opt === q.correct
                  ? "bg-accent/30 ring-2 ring-accent"
                  : "bg-destructive/20 ring-2 ring-destructive"
                : answered !== null && opt === q.correct
                ? "bg-accent/30"
                : "hover:bg-muted"
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </ActivityLayout>
  );
};

export default GuessEmotion;
