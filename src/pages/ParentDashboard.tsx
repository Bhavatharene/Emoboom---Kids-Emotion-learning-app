import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, MessageCircle, ShieldAlert, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useParentInsights } from "@/hooks/useParentInsights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParentOverview from "@/components/parent/ParentOverview";
import ParentWeeklyInsights from "@/components/parent/ParentWeeklyInsights";
import ParentGuidance from "@/components/parent/ParentGuidance";
import ParentChatbot from "@/components/parent/ParentChatbot";
import ParentAlerts from "@/components/parent/ParentAlerts";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const insights = useParentInsights();

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              👨‍👩‍👧 Parent Insights
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitoring {profile?.name || "your child"}'s emotional journey
            </p>
          </div>
        </div>

        {/* Alerts Banner */}
        <ParentAlerts todaySummary={insights.todaySummary} />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="text-xs font-display">
              <BarChart3 className="w-3 h-3 mr-1" /> Today
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs font-display">
              📊 Weekly
            </TabsTrigger>
            <TabsTrigger value="guidance" className="text-xs font-display">
              <Lightbulb className="w-3 h-3 mr-1" /> Tips
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs font-display">
              <MessageCircle className="w-3 h-3 mr-1" /> Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ParentOverview
              todaySummary={insights.todaySummary}
              loading={insights.loading}
              getEmotionEmoji={insights.getEmotionEmoji}
            />
          </TabsContent>

          <TabsContent value="weekly">
            <ParentWeeklyInsights
              weeklyData={insights.weeklyData}
              loading={insights.loading}
              childName={profile?.name || "your child"}
            />
          </TabsContent>

          <TabsContent value="guidance">
            <ParentGuidance
              todaySummary={insights.todaySummary}
              weeklyData={insights.weeklyData}
              childName={profile?.name || "your child"}
            />
          </TabsContent>

          <TabsContent value="chat">
            <ParentChatbot
              weeklyData={insights.weeklyData}
              childName={profile?.name || "your child"}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;
