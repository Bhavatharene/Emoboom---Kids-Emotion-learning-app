import { useState, useCallback } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, RotateCcw, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Choice {
  text: string;
  type: "kind" | "neutral" | "unkind";
}

interface StoryStep {
  story: string;
  emoji: string;
  isEnding?: boolean;
  choices?: Choice[];
  lesson?: string;
  outcome?: "good" | "mixed" | "bad";
  reflection?: string;
  character?: string;
  scenario?: string;
}

const choiceColors: Record<string, string> = {
  kind: "border-accent/50 hover:bg-accent/10",
  neutral: "border-star/50 hover:bg-star/10",
  unkind: "border-destructive/30 hover:bg-destructive/5",
};

const choiceIcons: Record<string, string> = {
  kind: "💚",
  neutral: "💛",
  unkind: "🔴",
};

const outcomeData: Record<string, { emoji: string; title: string; stars: number; color: string }> = {
  good: { emoji: "🌟", title: "Wonderful Ending!", stars: 5, color: "text-accent" },
  mixed: { emoji: "🤔", title: "It Could Be Better...", stars: 3, color: "text-star" },
  bad: { emoji: "😔", title: "A Lesson Learned", stars: 1, color: "text-destructive" },
};

const AIStoryBuilder = () => {
  const [steps, setSteps] = useState<StoryStep[]>([]);
  const [choicesMade, setChoicesMade] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState(0);
  const [started, setStarted] = useState(false);
  const { logActivity } = useActivityLog();

  const callStoryAPI = useCallback(async (step: number, choice?: Choice) => {
    setLoading(true);
    try {
      const storyContext = steps.map((s, i) =>
        `Part ${i + 1}: ${s.story}${choicesMade[i] ? ` [Child chose: ${choicesMade[i].text} (${choicesMade[i].type})]` : ""}`
      ).join("\n");

      const { data, error } = await supabase.functions.invoke("story-builder", {
        body: { storyContext, choice, step },
      });

      if (error) throw error;
      setSteps((prev) => [...prev, data]);
      return data;
    } catch (err: any) {
      console.error(err);
      toast.error("Could not load the story. Try again!");
      return null;
    } finally {
      setLoading(false);
    }
  }, [steps, choicesMade]);

  const startStory = async () => {
    setStarted(true);
    setSteps([]);
    setChoicesMade([]);
    setStars(0);
    await callStoryAPI(0);
  };

  const makeChoice = async (choice: Choice) => {
    const newChoices = [...choicesMade, choice];
    setChoicesMade(newChoices);

    const nextStep = steps.length;
    const result = await callStoryAPI(nextStep, choice);

    if (result?.isEnding) {
      const outcome = result.outcome || "mixed";
      const earned = outcomeData[outcome]?.stars || 2;
      setStars(earned);

      const kindCount = newChoices.filter((c) => c.type === "kind").length;
      const unkindCount = newChoices.filter((c) => c.type === "unkind").length;

      await logActivity("story-builder", kindCount * 2, earned, {
        outcome,
        totalChoices: newChoices.length,
        kindChoices: kindCount,
        unkindChoices: unkindCount,
      });

      if (outcome === "good") {
        toast.success("Amazing story! You made kind choices! 🌟");
      } else if (outcome === "bad") {
        toast("The story didn't end well. What could you do differently? 🤔");
      }
    }
  };

  const currentStep = steps[steps.length - 1];
  const isEnding = currentStep?.isEnding;
  const endingData = isEnding ? outcomeData[currentStep.outcome || "mixed"] : null;

  // Landing screen
  if (!started) {
    return (
      <ActivityLayout title="AI Story Builder" emoji="📖" starsEarned={stars}>
        <div className="card-playful p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl mb-4"
          >
            📖
          </motion.div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            AI Story Builder
          </h2>
          <p className="text-muted-foreground mb-6 text-lg">
            Your choices shape the story! Make kind choices for a happy ending.
          </p>
          <Button onClick={startStory} className="rounded-xl font-display text-lg h-14 px-8">
            <BookOpen className="w-5 h-5 mr-2" />
            Start a New Story
          </Button>
        </div>
      </ActivityLayout>
    );
  }

  return (
    <ActivityLayout title="AI Story Builder" emoji="📖" starsEarned={stars}>
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < steps.length
                ? choicesMade[i]?.type === "kind"
                  ? "bg-accent"
                  : choicesMade[i]?.type === "unkind"
                  ? "bg-destructive"
                  : i < choicesMade.length
                  ? "bg-star"
                  : "bg-primary"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Story history */}
      <div className="space-y-3 mb-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`card-playful p-5 ${i < steps.length - 1 ? "opacity-60" : ""}`}
          >
            <div className="flex gap-3 items-start">
              <span className="text-3xl flex-shrink-0">{step.emoji}</span>
              <div className="flex-1">
                <p className="text-foreground font-display leading-relaxed">{step.story}</p>
                {choicesMade[i] && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{choiceIcons[choicesMade[i].type]}</span>
                    <span className="italic">You chose: {choicesMade[i].text}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-playful p-6 text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="font-display text-muted-foreground">Writing the next part...</p>
        </motion.div>
      )}

      {/* Choices */}
      <AnimatePresence>
        {currentStep?.choices && !isEnding && !loading && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-center font-display font-bold text-foreground text-sm">
              What should they do? 👇
            </p>
            {currentStep.choices.map((choice, i) => (
              <motion.button
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => makeChoice(choice)}
                disabled={loading}
                className={`w-full card-playful p-4 text-left border-2 transition-colors ${choiceColors[choice.type]}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{choiceIcons[choice.type]}</span>
                  <span className="font-display font-bold text-foreground text-sm">{choice.text}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ending */}
      {isEnding && !loading && endingData && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-playful p-6 text-center mt-2"
        >
          <div className="text-6xl mb-3">{endingData.emoji}</div>
          <h3 className={`text-2xl font-display font-bold ${endingData.color}`}>
            {endingData.title}
          </h3>

          {currentStep.lesson && (
            <div className="mt-3 p-3 rounded-xl bg-muted">
              <p className="font-display text-foreground font-bold text-sm">📚 Lesson:</p>
              <p className="text-muted-foreground text-sm">{currentStep.lesson}</p>
            </div>
          )}

          {currentStep.reflection && (
            <div className="mt-3 p-3 rounded-xl bg-primary/10">
              <p className="font-display text-primary font-bold text-sm">💭 Think about it:</p>
              <p className="text-foreground text-sm">{currentStep.reflection}</p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-1">
            {Array.from({ length: endingData.stars }, (_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="text-2xl"
              >
                ⭐
              </motion.span>
            ))}
          </div>

          <Button onClick={startStory} className="mt-5 rounded-xl font-display text-lg h-12 px-6">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Story
          </Button>
        </motion.div>
      )}
    </ActivityLayout>
  );
};

export default AIStoryBuilder;
