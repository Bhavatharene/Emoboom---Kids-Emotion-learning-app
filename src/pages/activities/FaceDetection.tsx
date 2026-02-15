import { useState, useRef, useCallback } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import { useActivityLog } from "@/hooks/useActivityLog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, RotateCcw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const emotionEmojis: Record<string, string> = {
  Happy: "😊",
  Sad: "😢",
  Angry: "😠",
  Scared: "😨",
  Surprised: "😲",
  Calm: "😌",
  Neutral: "😐",
};

const FaceDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ emotion: string; confidence: number; tip: string } | null>(null);
  const [stars, setStars] = useState(0);
  const { logActivity, logEmotion } = useActivityLog();
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreaming(true);
      setResult(null);
    } catch {
      toast.error("Could not access camera. Please allow camera permission! 📷");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setAnalyzing(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.7);

    try {
      const { data, error } = await supabase.functions.invoke("detect-emotion", {
        body: { image: base64 },
      });

      if (error) throw error;

      setResult(data);
      const emotion = data.emotion || "Neutral";
      await logEmotion(emotion, "face");
      const earned = 2;
      setStars((s) => s + earned);
      await logActivity("face-detection", 1, earned, { emotion, confidence: data.confidence });
      toast.success(`Detected: ${emotion}! ⭐⭐`);
    } catch (err: any) {
      toast.error("Couldn't detect emotion. Try again!");
      console.error(err);
    }
    setAnalyzing(false);
  }, [logActivity, logEmotion]);

  return (
    <ActivityLayout title="Face Detection" emoji="📷" starsEarned={stars}>
      <canvas ref={canvasRef} className="hidden" />

      {!streaming ? (
        <div className="card-playful p-8 text-center">
          <div className="text-8xl mb-4">📷</div>
          <p className="text-lg text-muted-foreground mb-6">
            Let's see your face and guess how you're feeling!
          </p>
          <Button onClick={startCamera} className="rounded-xl font-display text-lg h-14 px-8">
            <Camera className="w-5 h-5 mr-2" />
            Open Camera
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card-playful overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-2xl mirror"
              style={{ transform: "scaleX(-1)" }}
            />
            {analyzing && (
              <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center rounded-2xl">
                <div className="bg-card p-4 rounded-2xl flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="font-display font-bold text-foreground">Analyzing...</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={captureAndAnalyze}
              disabled={analyzing}
              className="flex-1 rounded-xl font-display text-lg h-14"
            >
              {analyzing ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Camera className="w-5 h-5 mr-2" />
              )}
              {analyzing ? "Detecting..." : "Detect My Emotion!"}
            </Button>
            <Button
              variant="outline"
              onClick={() => { stopCamera(); setResult(null); }}
              className="rounded-xl h-14"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          className="card-playful p-6 text-center mt-4"
        >
          <div className="text-6xl mb-3">
            {emotionEmojis[result.emotion] || "😐"}
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground">
            You look {result.emotion}!
          </h3>
          <p className="text-muted-foreground mt-2">{result.tip}</p>
          <div className="mt-3 inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-display">
            Confidence: {result.confidence}/10
          </div>
        </motion.div>
      )}
    </ActivityLayout>
  );
};

export default FaceDetection;
