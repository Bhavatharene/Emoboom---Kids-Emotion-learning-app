import { useState } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const situations = [
  {
    situation: "Your friend shares their snack with you! 🍪",
    options: ["Happy", "Sad", "Angry", "Scared"],
    correct: "Happy",
  },
  {
    situation: "Your favorite toy breaks! 🧸",
    options: ["Happy", "Sad", "Surprised", "Calm"],
    correct: "Sad",
  },
  {
    situation: "Someone takes your turn in line! 😤",
    options: ["Happy", "Calm", "Angry", "Scared"],
    correct: "Angry",
  },
  {
    situation: "You hear a loud thunder at night! ⛈️",
    options: ["Happy", "Angry", "Calm", "Scared"],
    correct: "Scared",
  },
  {
    situation: "You get a surprise birthday party! 🎂",
    options: ["Sad", "Surprised", "Angry", "Scared"],
    correct: "Surprised",
  },
];

const SituationQuiz = () => {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const { logActivity } = useActivityLog();

  const handleAnswer = async (answer: string) => {
    const correct = answer === situations[current].correct;
    setAnswered(answer);
    if (correct) {
      setScore((s) => s + 1);
      toast.success("Correct! 🎉");
    } else {
      toast.error(`The answer was ${situations[current].correct}`);
    }

    setTimeout(async () => {
      if (current < situations.length - 1) {
        setCurrent((c) => c + 1);
        setAnswered(null);
      } else {
        const finalScore = correct ? score + 1 : score;
        const earned = Math.ceil((finalScore / situations.length) * 3);
        setStars(earned);
        setFinished(true);
        await logActivity("situation-quiz", finalScore, earned, {
          total: situations.length,
          correct: finalScore,
        });
      }
    }, 1200);
  };

  if (finished) {
    return (
      <ActivityLayout title="Situation Quiz" emoji="🎭" starsEarned={stars}>
        <div className="card-playful p-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            You got {score}/{situations.length}!
          </h2>
          <p className="text-muted-foreground mt-2">Amazing work! ⭐</p>
          <Button
            className="mt-6 rounded-xl font-display"
            onClick={() => {
              setCurrent(0);
              setScore(0);
              setStars(0);
              setAnswered(null);
              setFinished(false);
            }}
          >
            Play Again 🔄
          </Button>
        </div>
      </ActivityLayout>
    );
  }

  const q = situations[current];

  return (
    <ActivityLayout title="Situation Quiz" emoji="🎭" starsEarned={stars}>
      <div className="text-center mb-2 text-sm text-muted-foreground">
        Question {current + 1} of {situations.length}
      </div>
      <div className="card-playful p-6 mb-6 text-center">
        <p className="text-xl font-display font-bold text-foreground">{q.situation}</p>
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

export default SituationQuiz;
