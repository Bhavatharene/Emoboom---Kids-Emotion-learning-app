import { useState } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { motion } from "framer-motion";
import { toast } from "sonner";

const faces = [
  { emoji: "😊", emotion: "Happy" },
  { emoji: "😢", emotion: "Sad" },
  { emoji: "😠", emotion: "Angry" },
  { emoji: "😨", emotion: "Scared" },
];

const FaceDetection = () => {
  const [detected, setDetected] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const { logActivity, logEmotion } = useActivityLog();

  const handleDetect = async (emotion: string) => {
    setDetected(emotion);
    await logEmotion(emotion, "face");
    const earned = 2;
    setStars((s) => s + earned);
    await logActivity("face-detection", 1, earned, { emotion });
    toast.success(`You're feeling ${emotion}! ⭐⭐`);
  };

  return (
    <ActivityLayout title="Face Detection" emoji="📷" starsEarned={stars}>
      <div className="card-playful p-6 text-center mb-6">
        <div className="text-8xl mb-4">
          {detected ? faces.find((f) => f.emotion === detected)?.emoji : "🪞"}
        </div>
        <p className="text-muted-foreground">
          {detected
            ? `You're feeling ${detected}!`
            : "How are you feeling right now? Tap your emotion below!"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {faces.map((f) => (
          <motion.button
            key={f.emotion}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDetect(f.emotion)}
            className={`card-playful p-4 text-center ${
              detected === f.emotion ? "ring-2 ring-primary bg-primary/10" : ""
            }`}
          >
            <div className="text-4xl mb-2">{f.emoji}</div>
            <p className="font-display font-bold text-foreground">{f.emotion}</p>
          </motion.button>
        ))}
      </div>
    </ActivityLayout>
  );
};

export default FaceDetection;
