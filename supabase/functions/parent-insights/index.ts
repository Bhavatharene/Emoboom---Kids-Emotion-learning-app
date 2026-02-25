import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_URL = "https://api.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, emotionData, message, childName } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (action === "guidance") {
      const dominantEmotion = emotionData?.dominantEmotion || "neutral";
      const recentEmotions = emotionData?.recentEmotions || [];

      const prompt = `You are a supportive parenting advisor for a children's emotional learning app called Sparkle Mind Kids.

The child "${childName}" has been showing these emotions recently: ${recentEmotions.join(", ")}.
The dominant emotion is: ${dominantEmotion}.

Provide a JSON response with:
- "detectedEmotion": the dominant emotion
- "summary": a 1-2 sentence summary of the child's emotional state
- "recommendedAction": a specific actionable suggestion for the parent (2-3 sentences)
- "dos": array of 3 things the parent should do
- "donts": array of 3 things the parent should avoid
- "encouragement": a short encouraging message for the parent

Respond ONLY with valid JSON.`;

      const response = await fetch(LOVABLE_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        detectedEmotion: dominantEmotion,
        summary: `Your child has been feeling ${dominantEmotion} recently.`,
        recommendedAction: "Spend quality time with your child and talk about their feelings.",
        dos: ["Listen actively", "Validate their feelings", "Be patient"],
        donts: ["Don't dismiss their emotions", "Don't compare with others", "Don't force them to talk"],
        encouragement: "You're doing a great job as a parent! 💪"
      };

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "chat") {
      const recentEmotions = emotionData?.recentEmotions || [];
      const prompt = `You are a warm, supportive parenting advisor chatbot for Sparkle Mind Kids, a children's emotional learning app.

The child "${childName}" has shown these recent emotions: ${recentEmotions.join(", ")}.

The parent asks: "${message}"

Rules:
- Be practical, supportive, and warm
- Use the child's emotion data when relevant
- NEVER provide medical or clinical diagnoses
- Keep responses concise (2-4 sentences)
- Use simple, parent-friendly language
- Include an emoji or two for warmth

Respond naturally as a helpful parenting advisor.`;

      const response = await fetch(LOVABLE_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "I'm here to help! Could you tell me more about what you're noticing? 😊";

      return new Response(JSON.stringify({ reply: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "weekly-summary") {
      const recentEmotions = emotionData?.recentEmotions || [];
      const prompt = `Analyze these child emotions from the past week: ${recentEmotions.join(", ")}.

Provide a JSON response with:
- "patternSummary": a 2-sentence summary of emotional patterns
- "trend": "improving" | "stable" | "needs_attention"
- "insight": a specific observation about the pattern

Respond ONLY with valid JSON.`;

      const response = await fetch(LOVABLE_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        patternSummary: "Your child shows a healthy range of emotions this week.",
        trend: "stable",
        insight: "Consistent emotional expression is a sign of healthy development."
      };

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Parent insights error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
