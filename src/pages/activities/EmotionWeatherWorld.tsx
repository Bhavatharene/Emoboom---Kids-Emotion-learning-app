import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { toast } from "sonner";

interface WeatherPair {
  emotion: string;
  emotionEmoji: string;
  weather: string;
  weatherEmoji: string;
}

const PAIRS: WeatherPair[] = [
  { emotion: "Happy", emotionEmoji: "😊", weather: "Sunny", weatherEmoji: "☀️" },
  { emotion: "Sad", emotionEmoji: "😢", weather: "Rainy", weatherEmoji: "🌧️" },
  { emotion: "Angry", emotionEmoji: "😠", weather: "Stormy", weatherEmoji: "⛈️" },
  { emotion: "Excited", emotionEmoji: "🤩", weather: "Rainbow", weatherEmoji: "🌈" },
];

type GameMode = "match" | "drag" | "complete";

const EmotionWeatherWorld = () => {
  const { logActivity } = useActivityLog();
  const [totalStars, setTotalStars] = useState(0);
  const [mode, setMode] = useState<GameMode>("match");
  const [matchIdx, setMatchIdx] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  // Match mode: show emotion, pick correct weather
  const matchQuestions = useMemo(
    () => [...PAIRS].sort(() => Math.random() - 0.5),
    [round]
  );
  const currentQ = matchQuestions[matchIdx];

  // Shuffled weather options for matching
  const weatherOptions = useMemo(
    () => [...PAIRS].sort(() => Math.random() - 0.5),
    [matchIdx, round]
  );

  const handleMatchAnswer = useCallback(
    async (selectedWeather: string) => {
      if (feedback) return;
      if (selectedWeather === currentQ.weather) {
        setFeedback("correct");
        setTotalStars((s) => s + 5);
        toast.success("Correct! ⭐ +5");
        await logActivity("emotion-weather", 5, 5, {
          emotion: currentQ.emotion,
          weather: currentQ.weather,
        });
      } else {
        setFeedback("wrong");
      }
    },
    [currentQ, feedback, logActivity]
  );

  const nextMatch = () => {
    if (matchIdx + 1 < matchQuestions.length) {
      setMatchIdx((i) => i + 1);
      setFeedback(null);
    } else {
      setMode("complete");
    }
  };

  const replay = () => {
    setTotalStars(0);
    setMode("match");
    setMatchIdx(0);
    setFeedback(null);
    setRound((r) => r + 1);
  };

  if (mode === "complete") {
    return (
      <ActivityLayout title="Weather World" emoji="🌦️" starsEarned={totalStars}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-playful p-8 text-center space-y-4"
        >
          <div className="text-6xl">🌈</div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Weather Master!
          </h2>
          <p className="text-muted-foreground">
            You matched all emotions to their weather!
          </p>
          <Button onClick={replay} className="rounded-xl font-display">
            Play Again 🔄
          </Button>
        </motion.div>
      </ActivityLayout>
    );
  }

  return (
    <ActivityLayout title="Weather World" emoji="🌦️" starsEarned={totalStars}>
      <div className="card-playful p-5 space-y-5">
        <p className="text-xs font-display text-muted-foreground text-center">
          Match {matchIdx + 1} of {matchQuestions.length}
        </p>

        {/* Emotion display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={matchIdx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-2"
          >
            <div className="text-7xl">{currentQ.emotionEmoji}</div>
            <p className="text-xl font-display font-bold text-foreground">
              {currentQ.emotion}
            </p>
            <p className="text-sm font-display text-muted-foreground">
              Which weather matches this feeling?
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Weather options */}
        {!feedback && (
          <div className="grid grid-cols-2 gap-3">
            {weatherOptions.map((w) => (
              <motion.button
                key={w.weather}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMatchAnswer(w.weather)}
                className="card-playful p-5 text-center hover:bg-muted transition-colors"
              >
                <div className="text-5xl mb-2">{w.weatherEmoji}</div>
                <p className="font-display font-bold text-foreground text-sm">
                  {w.weather}
                </p>
              </motion.button>
            ))}
          </div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {feedback === "correct" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center space-y-3"
            >
              <p className="text-xl font-display font-bold text-accent">
                🎉 {currentQ.emotionEmoji} = {currentQ.weatherEmoji} Perfect!
              </p>
              <Button onClick={nextMatch} className="rounded-xl font-display" size="sm">
                {matchIdx + 1 < matchQuestions.length ? "Next ➡️" : "Finish 🎉"}
              </Button>
            </motion.div>
          )}
          {feedback === "wrong" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-2"
            >
              <p className="text-sm font-display text-destructive font-bold">
                Not quite! Try again 👀
              </p>
              <Button
                onClick={() => setFeedback(null)}
                variant="outline"
                className="rounded-xl font-display"
                size="sm"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ActivityLayout>
  );
};

export default EmotionWeatherWorld;
