/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { emotion, childName } = await req.json();
    if (!emotion) {
      return new Response(JSON.stringify({ error: "No emotion provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a warm, friendly emotion coach for children aged 6-11 named MindBloom Buddy. A child named "${childName || 'friend'}" just expressed or was detected feeling "${emotion}".

Based on the emotion, respond with ONLY valid JSON (no markdown) with these fields:
- "message": A short encouraging response (max 30 words, use simple words a 7-year-old understands)
- "activity": A suggested mini-activity (max 15 words)
- "emoji": A single emoji that matches the coaching response
- "type": one of "encouragement", "story", "breathing", "fun", "game"

Emotion guidelines:
- Happy → Celebrate with them, suggest sharing joy
- Sad → Comforting short story or kind words, suggest drawing feelings
- Angry → Gentle breathing guidance, suggest squeezing a pillow
- Surprised → Fun interactive reaction, suggest exploring what surprised them
- Neutral → Suggest playing an emotion game or trying something fun`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `The child is feeling: ${emotion}` },
        ],
        max_tokens: 200,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment!" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits needed. Please try again later." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let result;
    try {
      result = JSON.parse(content.replace(/```json\n?|```/g, "").trim());
    } catch {
      result = {
        message: "You're doing great! Every feeling is okay. 💛",
        activity: "Try drawing how you feel!",
        emoji: "🌟",
        type: "encouragement",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("emotion-coach error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
