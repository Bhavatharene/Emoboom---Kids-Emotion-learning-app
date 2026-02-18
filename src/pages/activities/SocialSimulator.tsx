import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { toast } from "sonner";

interface Reaction {
  text: string;
  isPositive: boolean;
  explanation: string;
}

interface Situation {
  scene: string;
  emoji: string;
  reactions: Reaction[];
}

const SITUATIONS: Situation[] = [
  {
    scene: "Someone takes your toy without asking!",
    emoji: "😤",
    reactions: [
      { text: "Ask for it back politely 🗣️", isPositive: true, explanation: "Using kind words helps others understand how you feel." },
      { text: "Grab it back", isPositive: false, explanation: "Grabbing can lead to a fight. Try asking with words instead." },
      { text: "Tell a grown-up 👩‍🏫", isPositive: true, explanation: "Asking for help from an adult is a smart choice!" },
    ],
  },
  {
    scene: "Your friend is crying because they fell down.",
    emoji: "😢",
    reactions: [
      { text: "Ask if they're okay 💕", isPositive: true, explanation: "Checking on a friend shows you care about them." },
      { text: "Walk away", isPositive: false, explanation: "Your friend needs you! A kind word can help a lot." },
      { text: "Help them up 🤲", isPositive: true, explanation: "Helping someone up is a kind and caring thing to do!" },
    ],
  },
  {
    scene: "You lost a race at school! Everyone else finished first.",
    emoji: "🏃",
    reactions: [
      { text: "Clap for the winner 👏", isPositive: true, explanation: "Being a good sport means being happy for others too!" },
      { text: "Cry and give up", isPositive: false, explanation: "It's okay to feel sad, but trying again is what makes you strong!" },
      { text: "Say 'I'll try harder next time!' 💪", isPositive: true, explanation: "That's the spirit! Practice makes progress." },
    ],
  },
  {
    scene: "A classmate says something mean about your drawing.",
    emoji: "🎨",
    reactions: [
      { text: "Say 'I worked hard on this' 🖌️", isPositive: true, explanation: "Standing up for yourself with calm words is very brave." },
      { text: "Say something mean back", isPositive: false, explanation: "Being mean back makes everyone feel bad. Use kind words." },
      { text: "Talk to your teacher 📝", isPositive: true, explanation: "It's okay to ask for help when someone is not being kind." },
    ],
  },
  {
    scene: "Your little sibling wants to play but you want alone time.",
    emoji: "🧸",
    reactions: [
      { text: "Play for 5 minutes first ⏰", isPositive: true, explanation: "Giving a little time shows you love them!" },
      { text: "Yell 'Go away!'", isPositive: false, explanation: "That might hurt their feelings. Try explaining calmly what you need." },
      { text: "Say 'I need quiet time, let's play later' 💬", isPositive: true, explanation: "Using your words to explain your feelings is very grown-up!" },
    ],
  },
  {
    scene: "You see a kid sitting alone at lunch, looking sad.",
    emoji: "😔",
    reactions: [
      { text: "Invite them to sit with you 🪑", isPositive: true, explanation: "Including others makes everyone feel they belong!" },
      { text: "Ignore them", isPositive: false, explanation: "They might really need a friend right now. A small act of kindness can change their day!" },
      { text: "Wave and smile at them 😊", isPositive: true, explanation: "A smile can make someone's day brighter!" },
    ],
  },
];

const SocialSimulator = () => {
  const { logActivity } = useActivityLog();
  const questions = useMemo(() => [...SITUATIONS].sort(() => Math.random() - 0.5).slice(0, 5), []);
  const [current, setCurrent] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; isPositive: boolean } | null>(null);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const handleReaction = (reaction: Reaction) => {
    if (feedback) return;
    setFeedback({ text: reaction.explanation, isPositive: reaction.isPositive });
    if (reaction.isPositive) {
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
      await logActivity("social-simulator", correctCount, totalStars, {
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
      <ActivityLayout title="Social Situations" emoji="🎭" starsEarned={totalStars}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-playful p-8 text-center space-y-4">
          <div className="text-6xl">🏆</div>
          <h2 className="text-2xl font-display font-bold text-foreground">Great Job!</h2>
          <p className="text-muted-foreground">{correctCount} kind choices out of {questions.length}!</p>
          <Button onClick={replay} className="rounded-xl font-display">Play Again 🔄</Button>
        </motion.div>
      </ActivityLayout>
    );
  }

  const q = questions[current];

  return (
    <ActivityLayout title="Social Situations" emoji="🎭" starsEarned={totalStars}>
      <div className="card-playful p-5 space-y-4">
        <p className="text-xs font-display text-muted-foreground text-center">
          Situation {current + 1} of {questions.length}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            className="text-center space-y-3"
          >
            <div className="text-6xl">{q.emoji}</div>
            <p className="text-lg font-display font-bold text-foreground">{q.scene}</p>
          </motion.div>
        </AnimatePresence>

        {!feedback && (
          <div className="space-y-3">
            <p className="text-xs font-display text-muted-foreground text-center">What would you do?</p>
            {q.reactions.map((r, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleReaction(r)}
                className="w-full card-playful p-4 text-left font-display font-bold text-foreground hover:bg-muted transition-colors"
              >
                {r.text}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`rounded-2xl p-4 text-center space-y-3 ${
                feedback.isPositive ? "bg-accent/20 border-2 border-accent/40" : "bg-primary/10 border-2 border-primary/30"
              }`}
            >
              <p className="text-3xl">{feedback.isPositive ? "⭐" : "💡"}</p>
              <p className="font-display font-bold text-foreground text-sm">{feedback.text}</p>
              {feedback.isPositive && <p className="text-xs font-display text-accent font-bold">+5 stars!</p>}
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

export default SocialSimulator;
