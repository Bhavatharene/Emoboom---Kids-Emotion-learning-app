import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { speakText } from "@/lib/speech";

type EyeOption = "normal" | "closed" | "wide";
type BrowOption = "straight" | "raised" | "angled";
type MouthOption = "smile" | "frown" | "open";

interface FaceParts {
  eyes: EyeOption;
  brows: BrowOption;
  mouth: MouthOption;
}

type Emotion = "Happy" | "Sad" | "Angry" | "Surprised";

const CORRECT_COMBOS: Record<Emotion, FaceParts> = {
  Happy: { eyes: "normal", brows: "raised", mouth: "smile" },
  Sad: { eyes: "closed", brows: "angled", mouth: "frown" },
  Angry: { eyes: "normal", brows: "angled", mouth: "frown" },
  Surprised: { eyes: "wide", brows: "raised", mouth: "open" },
};

const EMOTIONS: Emotion[] = ["Happy", "Sad", "Angry", "Surprised"];

const EMOTION_EMOJI: Record<Emotion, string> = {
  Happy: "😊",
  Sad: "😢",
  Angry: "😠",
  Surprised: "😲",
};

function CartoonFace({ parts }: { parts: FaceParts }) {
  const eyeMap: Record<EyeOption, React.ReactNode> = {
    normal: (
      <>
        <circle cx="70" cy="90" r="10" fill="hsl(260, 30%, 25%)" />
        <circle cx="130" cy="90" r="10" fill="hsl(260, 30%, 25%)" />
        <circle cx="73" cy="87" r="3" fill="white" />
        <circle cx="133" cy="87" r="3" fill="white" />
      </>
    ),
    closed: (
      <>
        <path d="M55 90 Q70 100 85 90" stroke="hsl(260, 30%, 25%)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M115 90 Q130 100 145 90" stroke="hsl(260, 30%, 25%)" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    ),
    wide: (
      <>
        <ellipse cx="70" cy="88" rx="14" ry="16" fill="white" stroke="hsl(260, 30%, 25%)" strokeWidth="3" />
        <circle cx="70" cy="88" r="8" fill="hsl(260, 30%, 25%)" />
        <ellipse cx="130" cy="88" rx="14" ry="16" fill="white" stroke="hsl(260, 30%, 25%)" strokeWidth="3" />
        <circle cx="130" cy="88" r="8" fill="hsl(260, 30%, 25%)" />
      </>
    ),
  };

  const browMap: Record<BrowOption, React.ReactNode> = {
    straight: (
      <>
        <line x1="52" y1="68" x2="88" y2="68" stroke="hsl(260, 30%, 25%)" strokeWidth="4" strokeLinecap="round" />
        <line x1="112" y1="68" x2="148" y2="68" stroke="hsl(260, 30%, 25%)" strokeWidth="4" strokeLinecap="round" />
      </>
    ),
    raised: (
      <>
        <path d="M52 72 Q70 56 88 72" stroke="hsl(260, 30%, 25%)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M112 72 Q130 56 148 72" stroke="hsl(260, 30%, 25%)" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    ),
    angled: (
      <>
        <line x1="52" y1="64" x2="88" y2="74" stroke="hsl(260, 30%, 25%)" strokeWidth="4" strokeLinecap="round" />
        <line x1="148" y1="64" x2="112" y2="74" stroke="hsl(260, 30%, 25%)" strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  };

  const mouthMap: Record<MouthOption, React.ReactNode> = {
    smile: (
      <path d="M70 140 Q100 170 130 140" stroke="hsl(260, 30%, 25%)" strokeWidth="4" fill="none" strokeLinecap="round" />
    ),
    frown: (
      <path d="M70 155 Q100 130 130 155" stroke="hsl(260, 30%, 25%)" strokeWidth="4" fill="none" strokeLinecap="round" />
    ),
    open: (
      <ellipse cx="100" cy="145" rx="20" ry="15" fill="hsl(0, 75%, 60%)" stroke="hsl(260, 30%, 25%)" strokeWidth="3" />
    ),
  };

  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto drop-shadow-lg">
      <circle cx="100" cy="100" r="90" fill="hsl(45, 95%, 80%)" stroke="hsl(45, 95%, 65%)" strokeWidth="4" />
      {browMap[parts.brows]}
      {eyeMap[parts.eyes]}
      {mouthMap[parts.mouth]}
    </svg>
  );
}

const EmotionDressUp = () => {
  const { logActivity } = useActivityLog();
  const [totalStars, setTotalStars] = useState(0);
  const [round, setRound] = useState(0);
  const [emotion, setEmotion] = useState<Emotion>(() => EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]);
  const [parts, setParts] = useState<FaceParts>({ eyes: "normal", brows: "straight", mouth: "smile" });
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showStarAnim, setShowStarAnim] = useState(false);

  // Speak instruction when emotion changes
  useEffect(() => {
    speakText(`Make the character ${emotion}`);
  }, [emotion, round]);

  const pickNewEmotion = useCallback(() => {
    const next = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    setEmotion(next);
    setParts({ eyes: "normal", brows: "straight", mouth: "smile" });
    setFeedback(null);
    setShowStarAnim(false);
    setRound((r) => r + 1);
  }, []);

  const checkAnswer = async () => {
    const correct = CORRECT_COMBOS[emotion];
    if (parts.eyes === correct.eyes && parts.brows === correct.brows && parts.mouth === correct.mouth) {
      setFeedback("correct");
      setShowStarAnim(true);
      setTotalStars((s) => s + 5);
      await logActivity("emotion-dress-up", 5, 5, { emotion, round });
    } else {
      setFeedback("wrong");
    }
  };

  const replay = () => {
    setTotalStars(0);
    setRound(0);
    pickNewEmotion();
  };

  const opts = <T extends string>(label: string, options: { value: T; label: string }[], current: T, onChange: (v: T) => void) => (
    <div className="space-y-1">
      <p className="text-xs font-display font-bold text-muted-foreground">{label}</p>
      <div className="flex gap-2">
        {options.map((o) => (
          <Button
            key={o.value}
            size="sm"
            variant={current === o.value ? "default" : "outline"}
            className="rounded-xl text-xs flex-1 font-display"
            onClick={() => { onChange(o.value); setFeedback(null); }}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <ActivityLayout title="Emotion Dress-Up" emoji="🎨" starsEarned={totalStars}>
      <div className="card-playful p-6 text-center space-y-4">
        <motion.div key={emotion + round} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <p className="text-lg font-display font-bold text-foreground mb-1">
            Make the face {EMOTION_EMOJI[emotion]} <span className="text-primary">{emotion}</span>
          </p>
        </motion.div>

        <CartoonFace parts={parts} />

        {opts("Eyes 👁️", [
          { value: "normal" as EyeOption, label: "Normal" },
          { value: "closed" as EyeOption, label: "Closed" },
          { value: "wide" as EyeOption, label: "Wide" },
        ], parts.eyes, (v) => setParts((p) => ({ ...p, eyes: v })))}

        {opts("Eyebrows 🤨", [
          { value: "straight" as BrowOption, label: "Straight" },
          { value: "raised" as BrowOption, label: "Raised" },
          { value: "angled" as BrowOption, label: "Angled" },
        ], parts.brows, (v) => setParts((p) => ({ ...p, brows: v })))}

        {opts("Mouth 👄", [
          { value: "smile" as MouthOption, label: "Smile" },
          { value: "frown" as MouthOption, label: "Frown" },
          { value: "open" as MouthOption, label: "Open" },
        ], parts.mouth, (v) => setParts((p) => ({ ...p, mouth: v })))}

        <AnimatePresence mode="wait">
          {feedback === "correct" && (
            <motion.div key="correct" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              <p className="text-2xl font-display font-bold text-accent">🌟 Great job! 🌟</p>
              {showStarAnim && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl">⭐ +5</motion.div>
              )}
              <div className="flex gap-3 justify-center pt-2">
                <Button onClick={pickNewEmotion} className="rounded-xl font-display">Next Emotion ➡️</Button>
                <Button onClick={replay} variant="outline" className="rounded-xl font-display">Replay 🔄</Button>
              </div>
            </motion.div>
          )}
          {feedback === "wrong" && (
            <motion.p key="wrong" initial={{ x: -10 }} animate={{ x: [0, -5, 5, -5, 0] }} className="text-sm font-display text-destructive font-bold">
              Try changing the mouth or eyebrows 🤔
            </motion.p>
          )}
        </AnimatePresence>

        {feedback !== "correct" && (
          <Button onClick={checkAnswer} className="w-full rounded-xl font-display text-lg h-12" size="lg">
            ✅ Check!
          </Button>
        )}
      </div>
    </ActivityLayout>
  );
};

export default EmotionDressUp;
