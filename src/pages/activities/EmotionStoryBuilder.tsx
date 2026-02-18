import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { toast } from "sonner";

interface Choice {
  text: string;
  isPositive: boolean;
  feedback: string;
}

interface StoryNode {
  text: string;
  emoji: string;
  choices?: Choice[];
}

interface Story {
  title: string;
  theme: string;
  nodes: StoryNode[];
}

const STORIES: Story[] = [
  {
    title: "The Toy Trouble",
    theme: "sharing",
    nodes: [
      {
        text: "You are playing with your favorite toy car. Your friend asks if they can play too.",
        emoji: "🚗",
        choices: [
          { text: "Share the toy 🤝", isPositive: true, feedback: "Wonderful! Sharing makes everyone happy!" },
          { text: "Say no and keep it", isPositive: false, feedback: "Your friend looks sad. Sharing can make playtime more fun!" },
          { text: "Take turns playing", isPositive: true, feedback: "Great idea! Taking turns is a kind thing to do!" },
        ],
      },
      {
        text: "Your friend is so happy! They suggest building a track together.",
        emoji: "😊",
        choices: [
          { text: "Build it together! 🏗️", isPositive: true, feedback: "Teamwork makes the dream work!" },
          { text: "I want to build alone", isPositive: false, feedback: "Working together can make even cooler things!" },
        ],
      },
      {
        text: "You and your friend built an amazing track! Everyone claps. 🎉",
        emoji: "🌟",
      },
    ],
  },
  {
    title: "The Lost Game",
    theme: "losing",
    nodes: [
      {
        text: "You are playing a board game with your friends. You are about to lose!",
        emoji: "🎲",
        choices: [
          { text: "Keep playing fairly 👍", isPositive: true, feedback: "That's great sportsmanship! Trying your best is what matters." },
          { text: "Get angry and flip the board", isPositive: false, feedback: "That might scare your friends. It's okay to feel upset, but try to stay calm." },
          { text: "Cheat to win", isPositive: false, feedback: "Cheating isn't fair. It's more fun when everyone plays honestly!" },
        ],
      },
      {
        text: "The game is over. Your friend won! They look really happy.",
        emoji: "🏆",
        choices: [
          { text: "Say congratulations! 🎊", isPositive: true, feedback: "That's so kind! Your friend feels great!" },
          { text: "Walk away upset", isPositive: false, feedback: "It's okay to feel disappointed. Try saying 'good game' — it helps!" },
        ],
      },
      {
        text: "Your friend says 'Let's play again!' Everyone is having a great time. 🥳",
        emoji: "💛",
      },
    ],
  },
  {
    title: "The New Kid",
    theme: "friendship",
    nodes: [
      {
        text: "A new student joins your class. They look nervous and sit alone at lunch.",
        emoji: "😟",
        choices: [
          { text: "Sit with them 🪑", isPositive: true, feedback: "How kind! They smile and feel welcome." },
          { text: "Ignore them", isPositive: false, feedback: "They look even more lonely. A small hello can make a big difference!" },
          { text: "Wave and say hi! 👋", isPositive: true, feedback: "A friendly wave can brighten someone's whole day!" },
        ],
      },
      {
        text: "The new kid tells you they like drawing. You like drawing too!",
        emoji: "🎨",
        choices: [
          { text: "Draw together! ✏️", isPositive: true, feedback: "You found something in common! That's how friendships start." },
          { text: "Say 'I'm better at it'", isPositive: false, feedback: "That might hurt their feelings. Everyone has their own style!" },
        ],
      },
      {
        text: "You made a new friend today! They drew you a picture as a thank you. 💕",
        emoji: "🌈",
      },
    ],
  },
  {
    title: "Helping Hands",
    theme: "helping",
    nodes: [
      {
        text: "Your classmate drops all their books on the floor. Papers fly everywhere!",
        emoji: "📚",
        choices: [
          { text: "Help pick them up 📖", isPositive: true, feedback: "You're a helper! They say thank you with a big smile." },
          { text: "Laugh and walk past", isPositive: false, feedback: "That could hurt their feelings. How would you feel if that happened to you?" },
          { text: "Ask if they're okay 💬", isPositive: true, feedback: "Checking on someone shows you care. That's really thoughtful!" },
        ],
      },
      {
        text: "Later, you see a younger kid struggling to reach the water fountain.",
        emoji: "💧",
        choices: [
          { text: "Help them reach it 🤲", isPositive: true, feedback: "So thoughtful! Helping others makes you a real hero." },
          { text: "Keep walking", isPositive: false, feedback: "They look thirsty. A little help goes a long way!" },
        ],
      },
      {
        text: "The teacher says 'You were so helpful today!' and gives you a special star. ⭐",
        emoji: "🌟",
      },
    ],
  },
  {
    title: "The Angry Moment",
    theme: "anger",
    nodes: [
      {
        text: "Your sibling accidentally breaks your favorite crayon right before art class!",
        emoji: "😤",
        choices: [
          { text: "Take a deep breath 🌬️", isPositive: true, feedback: "Great choice! Deep breaths help you think clearly." },
          { text: "Yell at them", isPositive: false, feedback: "Yelling can make everyone feel bad. Try counting to 5 first." },
          { text: "Tell them how you feel 💬", isPositive: true, feedback: "Using your words calmly is very grown-up!" },
        ],
      },
      {
        text: "Your sibling says 'I'm sorry.' They offer to share their crayons.",
        emoji: "🖍️",
        choices: [
          { text: "Accept and share! 🤝", isPositive: true, feedback: "Forgiving feels good! Now you have even more colors." },
          { text: "Stay angry", isPositive: false, feedback: "It's okay to need time, but forgiving helps you feel better too." },
        ],
      },
      {
        text: "You and your sibling make a beautiful drawing together! 🎨 The anger is all gone.",
        emoji: "💖",
      },
    ],
  },
];

const EmotionStoryBuilder = () => {
  const { logActivity } = useActivityLog();
  const [totalStars, setTotalStars] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);
  const [nodeIdx, setNodeIdx] = useState(0);
  const [positiveChoices, setPositiveChoices] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; isPositive: boolean } | null>(null);
  const [storyComplete, setStoryComplete] = useState(false);

  const story = STORIES[storyIdx % STORIES.length];
  const node = story.nodes[nodeIdx];

  const handleChoice = useCallback(
    async (choice: Choice) => {
      setFeedback({ text: choice.feedback, isPositive: choice.isPositive });
      if (choice.isPositive) {
        setPositiveChoices((p) => p + 1);
      }
    },
    []
  );

  const advance = useCallback(async () => {
    const nextNode = nodeIdx + 1;
    if (nextNode < story.nodes.length) {
      setNodeIdx(nextNode);
      setFeedback(null);
    } else {
      // Story complete
      const earned = Math.max(positiveChoices * 5, 5);
      setTotalStars((s) => s + earned);
      setStoryComplete(true);
      await logActivity("emotion-story", positiveChoices, earned, {
        story: story.title,
        theme: story.theme,
      });
      toast.success(`Story complete! +${earned} ⭐`);
    }
  }, [nodeIdx, story, positiveChoices, logActivity]);

  const nextStory = () => {
    setStoryIdx((s) => s + 1);
    setNodeIdx(0);
    setFeedback(null);
    setPositiveChoices(0);
    setStoryComplete(false);
  };

  const replay = () => {
    setTotalStars(0);
    setStoryIdx(0);
    setNodeIdx(0);
    setFeedback(null);
    setPositiveChoices(0);
    setStoryComplete(false);
  };

  if (storyComplete) {
    return (
      <ActivityLayout title="Emotion Story" emoji="📖" starsEarned={totalStars}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-playful p-8 text-center space-y-4"
        >
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Story Complete!
          </h2>
          <p className="text-muted-foreground">
            "{story.title}" — You made {positiveChoices} kind choices!
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={nextStory} className="rounded-xl font-display">
              Next Story ➡️
            </Button>
            <Button onClick={replay} variant="outline" className="rounded-xl font-display">
              Replay 🔄
            </Button>
          </div>
        </motion.div>
      </ActivityLayout>
    );
  }

  return (
    <ActivityLayout title="Emotion Story" emoji="📖" starsEarned={totalStars}>
      <div className="card-playful p-5 space-y-4">
        {/* Story progress */}
        <div className="flex items-center justify-between text-xs font-display text-muted-foreground">
          <span>📖 {story.title}</span>
          <span>
            Part {nodeIdx + 1} of {story.nodes.length}
          </span>
        </div>

        {/* Story text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${storyIdx}-${nodeIdx}`}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            className="text-center space-y-3"
          >
            <div className="text-6xl">{node.emoji}</div>
            <p className="text-lg font-display font-bold text-foreground leading-relaxed">
              {node.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Choices or continue */}
        {!feedback && node.choices && (
          <div className="space-y-3 pt-2">
            <p className="text-xs font-display text-muted-foreground text-center">
              What do you do?
            </p>
            {node.choices.map((choice, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleChoice(choice)}
                className="w-full card-playful p-4 text-left font-display font-bold text-foreground hover:bg-muted transition-colors"
              >
                {choice.text}
              </motion.button>
            ))}
          </div>
        )}

        {/* No choices — just a final scene */}
        {!feedback && !node.choices && (
          <div className="text-center pt-2">
            <Button onClick={advance} className="rounded-xl font-display">
              Finish Story 🎉
            </Button>
          </div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`rounded-2xl p-4 text-center space-y-3 ${
                feedback.isPositive
                  ? "bg-accent/20 border-2 border-accent/40"
                  : "bg-primary/10 border-2 border-primary/30"
              }`}
            >
              <p className="text-3xl">{feedback.isPositive ? "⭐" : "💡"}</p>
              <p className="font-display font-bold text-foreground text-sm">
                {feedback.text}
              </p>
              {feedback.isPositive && (
                <p className="text-xs font-display text-accent font-bold">+5 stars!</p>
              )}
              <Button onClick={advance} className="rounded-xl font-display" size="sm">
                Continue ➡️
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ActivityLayout>
  );
};

export default EmotionStoryBuilder;
