import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2, MessageCircle } from "lucide-react";
import type { WeeklyData } from "@/hooks/useParentInsights";

interface Props {
  weeklyData: WeeklyData | null;
  childName: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Keyword-based fallback
const getKeywordResponse = (message: string, childName: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes("angry") || lower.includes("anger") || lower.includes("tantrum")) {
    return `When ${childName} feels angry, try staying calm yourself first. Give them space to cool down, then talk about what happened. Deep breathing exercises together can be very helpful! 🧘`;
  }
  if (lower.includes("sad") || lower.includes("crying") || lower.includes("upset")) {
    return `It's important to validate ${childName}'s sadness. Let them know it's okay to feel sad, and offer comfort. Reading a favorite book together or doing a calming activity can help. 💙`;
  }
  if (lower.includes("anxious") || lower.includes("worried") || lower.includes("scared")) {
    return `Anxiety in children is common. Help ${childName} by maintaining routines, talking about their worries, and teaching simple relaxation techniques. Your reassurance goes a long way! 🌈`;
  }
  if (lower.includes("happy") || lower.includes("positive") || lower.includes("good")) {
    return `That's wonderful! Celebrate ${childName}'s positive emotions. Ask them what made them happy and encourage them to share joy with others. Keep up the great parenting! ⭐`;
  }
  if (lower.includes("help") || lower.includes("advice") || lower.includes("what should")) {
    return `I'm here to help! You can ask me about handling specific emotions, building emotional resilience, or creating a supportive environment for ${childName}. What would you like to know? 😊`;
  }
  return `That's a great question about ${childName}! Every child's emotional journey is unique. Try observing patterns and responding with empathy. Would you like specific tips for a particular emotion? 💛`;
};

const ParentChatbot = ({ weeklyData, childName }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: `Hi! 👋 I'm your parenting support assistant. Ask me anything about ${childName}'s emotions, behavior, or how to respond to specific situations. I'm here to help!` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("parent-insights", {
        body: {
          action: "chat",
          message: userMsg,
          emotionData: { recentEmotions: weeklyData?.allEmotions || [] },
          childName,
        },
      });

      if (!error && data?.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error("No reply");
      }
    } catch {
      const fallback = getKeywordResponse(userMsg, childName);
      setMessages(prev => [...prev, { role: "assistant", content: fallback }]);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <Card className="card-playful">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-secondary" /> Parent Support Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72 pr-3" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 mt-3">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your child's emotions..."
              className="rounded-xl text-sm"
              disabled={loading}
            />
            <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()} className="rounded-xl shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ParentChatbot;
