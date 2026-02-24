/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyContext, choice, step } = await req.json();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt: string;

    if (step === 0) {
      // Generate opening story
      systemPrompt = `You are a children's story writer for kids aged 6-11. Create the beginning of a short emotional learning story.

Pick a random scenario from: school, playground, birthday party, family dinner, new student arriving, lost pet, sharing toys, group project.

Write a short story opening (2-3 sentences, simple words) that presents an emotional situation.
Then provide exactly 3 choices for what the main character should do. Each choice should represent a different emotional response:
- One clearly kind/empathetic choice
- One neutral/selfish choice  
- One unkind/hurtful choice

Respond with ONLY valid JSON (no markdown):
{
  "story": "the story paragraph text",
  "character": "character name",
  "scenario": "brief scenario label",
  "emoji": "one emoji representing the scene",
  "choices": [
    {"text": "choice text (max 12 words)", "type": "kind"},
    {"text": "choice text (max 12 words)", "type": "neutral"},
    {"text": "choice text (max 12 words)", "type": "unkind"}
  ]
}`;
    } else {
      // Continue story based on choice
      systemPrompt = `You are a children's story writer for kids aged 6-11. Continue this emotional learning story.

Previous story context: ${storyContext}
The child chose: "${choice.text}" (which was a ${choice.type} choice)

${step >= 3 ? `This is the FINAL step. Write the ending.` : `This is step ${step + 1} of the story.`}

Rules:
- If the choice was "kind": the story should show positive consequences and the character feeling good
- If the choice was "neutral": things are okay but the character notices they could have done better
- If the choice was "unkind": show gentle consequences — someone's feelings get hurt, and the character starts to realize something is wrong

${step >= 3 ? `
Write a clear ending (2-3 sentences). 
- If previous choices were mostly kind: happy ending with a warm lesson
- If previous choices were mostly neutral: okay ending but the character wishes they had been kinder
- If previous choices were mostly unkind: sad ending where the character sees the hurt they caused and wants to change

Respond with ONLY valid JSON:
{
  "story": "the ending paragraph",
  "emoji": "emoji for the ending",
  "isEnding": true,
  "lesson": "a simple moral lesson in 10 words or less",
  "outcome": "good" or "mixed" or "bad",
  "reflection": "a gentle question for the child to think about (max 15 words)"
}
` : `
Write the next part (2-3 sentences) and provide 3 new choices.

Respond with ONLY valid JSON:
{
  "story": "the next paragraph",
  "emoji": "emoji for this part",
  "isEnding": false,
  "choices": [
    {"text": "choice text (max 12 words)", "type": "kind"},
    {"text": "choice text (max 12 words)", "type": "neutral"},  
    {"text": "choice text (max 12 words)", "type": "unkind"}
  ]
}
`}`;
    }

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
          { role: "user", content: step === 0 ? "Start a new story" : `Continue the story. The child chose: "${choice.text}"` },
        ],
        max_tokens: 400,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment!" }), {
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
        story: "Once upon a time, a child had to make an important choice...",
        emoji: "📖",
        isEnding: false,
        choices: [
          { text: "Help a friend who looks sad", type: "kind" },
          { text: "Keep playing by yourself", type: "neutral" },
          { text: "Ignore everyone and walk away", type: "unkind" },
        ],
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("story-builder error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
