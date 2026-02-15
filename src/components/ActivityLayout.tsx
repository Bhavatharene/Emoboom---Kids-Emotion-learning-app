import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";

interface ActivityLayoutProps {
  title: string;
  emoji: string;
  children: ReactNode;
  starsEarned?: number;
}

const ActivityLayout = ({ title, emoji, children, starsEarned }: ActivityLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{emoji}</span>
            <h1 className="text-xl font-display font-bold text-foreground">{title}</h1>
          </div>
          {starsEarned !== undefined && starsEarned > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto flex items-center gap-1 bg-star/20 text-star px-3 py-1 rounded-full font-display font-bold"
            >
              <Star className="w-4 h-4 fill-star" />
              +{starsEarned}
            </motion.div>
          )}
        </div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityLayout;
