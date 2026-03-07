import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { action, payload } = await req.json();

    if (action === "generate_note") {
      // 1. Fetch previous 10 notes
      const { data: previousNotes } = await supabase
        .from("knowledge_items")
        .select("content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      let styleSummary = "User writing style: normal, structured sentences.";
      if (previousNotes && previousNotes.length > 0) {
        let totalWords = 0;
        let bulletNotes = 0;
        
        previousNotes.forEach((n) => {
          const words = (n.content || "").split(/\s+/).length;
          totalWords += words;
          if (n.content.includes("•") || n.content.includes("- ") || n.content.includes("* ")) {
            bulletNotes++;
          }
        });
        
        const avgWords = Math.round(totalWords / previousNotes.length);
        const prefersBullets = bulletNotes >= previousNotes.length / 2;
        const toneDesc = avgWords < 50 ? "very concise" : avgWords < 150 ? "concise" : "detailed";
        
        styleSummary = `User writing style:
- ${prefersBullets ? "prefers bullet points" : "prefers paragraph formatting"}
- average note length: ~${avgWords} words
- tone: ${toneDesc} explanations`;
      }

      const completion = await openai.chat.completions.create({
        model: "openrouter/auto",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are generating personal knowledge notes for a Second Brain app.
Do NOT generate long articles, blog posts, or documentation.
Do NOT generate headings like "Overview", "Frameworks", or numbered chapters.
Do NOT generate long explanations or academic tone.

Notes MUST follow these constraints:
- Keep notes concise (60-120 words).
- Use simple bullet points (maximum 6 bullet points).
- Write like a quick personal note (short insights, condensed ideas, reusable concepts).

${styleSummary}

Always format your response as a raw JSON object with exactly three fields:
1. "content": The deeply structured personal note adapting to the user's writing style. Do not make it overly long, avoid filler.
2. "title": A short meaningful concept label (1-3 words only). (e.g., "Vector Databases", "React Hooks")
3. "tags": An array of exactly 3 to 5 single keywords (lowercase, no spaces, represent main topics).

You must output ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Topic:\n${payload.prompt}\n\nGenerate a short, concise personal note matching this user's writing style. Follow all constraints strictly.`,
          },
        ],
      });
      
      const rawContent = completion.choices?.[0]?.message?.content || "{}";
      
      let finalContent = "";
      let title = "";
      let tags: string[] = [];
      
      try {
        const cleanedContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedContent);
        finalContent = parsed.content || "";
        title = parsed.title || "";
        if (Array.isArray(parsed.tags)) {
          tags = parsed.tags
            .map((t: string) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
            .filter(Boolean)
            .slice(0, 5);
        }
      } catch (e) {
        console.error("Failed to parse JSON for generate_note", e);
        // Fallback
        finalContent = rawContent; 
      }
      
      return NextResponse.json({ content: finalContent.trim(), title, tags });
    }

    if (action === "process_voice_input") {
      const { prompt } = payload;
      
      const intentCompletion = await openai.chat.completions.create({
        model: "openrouter/auto",
        temperature: 0.1,
        messages: [
          {
             role: "system",
             content: `Classify the following text as either "note_creation" or "command". 
If the text is an instruction to the system like evaluating notes, summarizing notes, creating an agenda, extracting tasks, or semantic search (e.g. "Summarize today's notes", "Create meeting agenda", "Turn this into tasks", "What did I capture about AI yesterday?", "Plan my week"):
Output ONLY {"intent": "command", "query": "extracted search query if applicable"}

If the text is just a spoken idea, thought, or note to be captured:
Output ONLY {"intent": "note_creation"}

Output strictly in JSON.`
          },
          {
             role: "user",
             content: prompt
          }
        ]
      });

      let intent = "note_creation";
      let searchReq = prompt;
      try {
        const raw = intentCompletion.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(raw.replace(/```json/gi, "").replace(/```/g, "").trim());
        if (parsed.intent === "command") {
           intent = "command";
           searchReq = parsed.query || prompt;
        }
      } catch (e) {}

      // Get user's recent notes for Context and Style
      const { data: previousNotes } = await supabase
        .from("knowledge_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      const recentNotes = previousNotes || [];
      
      let styleSummary = "User Style Pattern:\n- normal, structured sentences.";
      if (recentNotes.length > 0) {
        let totalWords = 0;
        let bulletNotes = 0;
        recentNotes.slice(0, 10).forEach((n) => {
          const words = (n.content || "").split(/\s+/).length;
          totalWords += words;
          if (n.content.includes("•") || n.content.includes("- ") || n.content.includes("* ")) {
            bulletNotes++;
          }
        });
        const avgWords = Math.round(totalWords / Math.min(recentNotes.length, 10));
        const prefersBullets = bulletNotes >= Math.min(recentNotes.length, 10) / 2;
        const toneDesc = avgWords < 50 ? "very concise" : avgWords < 150 ? "concise" : "detailed";
        
        styleSummary = `User Style Pattern:
- ${prefersBullets ? "prefers bullet points for structure" : "prefers paragraph formatting"}
Typical Output Length:
- ~${avgWords} words
Typical Tone:
- tone: ${toneDesc} and practical`;
      }

      if (intent === "note_creation") {
         const completion = await openai.chat.completions.create({
          model: "openrouter/auto",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: `Convert the following voice transcript into structured notes.
Do NOT generate long articles, blog posts, or documentation.

Follow the user's specific writing style based on their past notes:

${styleSummary}

Instructions:
- Keep it concise (60-120 words).
- Follow the user's formatting style strictly.
- Write like a quick personal note (short insights, condensed ideas).
- Correct any possible spelling mistakes in the voice transcript.

Always format your response as a raw JSON object with exactly three fields:
1. "content": The deeply structured personal note adapting to the user's writing style. Do not make it overly long, avoid filler.
2. "title": A short meaningful concept label (1-3 words only).
3. "tags": An array of exactly 3 to 6 single keywords (lowercase, no spaces, represent main topics).

You must output ONLY valid JSON.`,
            },
            {
              role: "user",
              content: `Transcript:\n${prompt}\n\nGenerate a short, structured note matching this user's writing style.`,
            },
          ],
        });
        
        const rawContent = completion.choices?.[0]?.message?.content || "{}";
        let finalContent = "", title = "", tags: string[] = [];
        try {
          const cleanedContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedContent);
          finalContent = parsed.content || "";
          title = parsed.title || "";
          if (Array.isArray(parsed.tags)) tags = parsed.tags.map((t: string) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")).filter(Boolean).slice(0, 6);
        } catch (e) {
          finalContent = rawContent; 
        }
        return NextResponse.json({ intent: "note_creation", content: finalContent.trim(), title, tags });
      } else {
         // It's a command
         let context = "";
         const { data: searchData, error } = await supabase.rpc("search_notes", {
           search_query: searchReq,
           user_id: user.id
         });
         if (!error && searchData && searchData.length > 0) {
            context = searchData.map((note: any) => `Title: ${note.title}\nContent: ${note.content}`).join("\n\n---\n\n");
         } else if (recentNotes.length > 0) {
            context = recentNotes.map((n: any) => `Title: ${n.title}\nDate: ${n.created_at}\nContent: ${n.content}`).join("\n\n---\n\n");
         } else {
            context = "No relevant notes found.";
         }

         const completion = await openai.chat.completions.create({
          model: "openrouter/auto",
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: `You are an AI assistant processing a user voice command on their personal notes database.
The user is commanding you to process their notes (e.g. summarize, create agenda, extract tasks, semantic query).

Here are the user's matching notes from their database:
<notes>
${context}
</notes>

IMPORTANT: Follow the user's personal styling formatting rules below for your output:
${styleSummary}

Always format your response as a raw JSON object with exactly three fields:
1. "content": The generated answer/summary/agenda/tasks formatted according to the user's styling rules.
2. "title": A short meaningful concept label representing the action (e.g., "Daily Summary", "Meeting Agenda", "Extracted Tasks").
3. "tags": An array of exactly 3 to 6 single keywords (lowercase, no spaces).

You must output ONLY valid JSON.`,
            },
            {
              role: "user",
              content: `Voice Command:\n${prompt}\n\nPlease analyze the notes and generate the output following my personal writing style.`,
            },
          ],
        });

        const rawContent = completion.choices?.[0]?.message?.content || "{}";
        let finalContent = "", title = "", tags: string[] = [];
        try {
          const cleanedContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedContent);
          finalContent = parsed.content || "";
          title = parsed.title || "";
          if (Array.isArray(parsed.tags)) tags = parsed.tags.map((t: string) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")).filter(Boolean).slice(0, 6);
        } catch (e) {
          finalContent = rawContent; 
        }

        return NextResponse.json({ intent: "command", content: finalContent.trim(), title, tags });
      }
    }

    if (action === "generate_metadata") {
      const completion = await openai.chat.completions.create({
        model: "openrouter/auto",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You are a strict data extractor. Analyze the provided content and return a raw JSON object with two fields:
1. "title": A short meaningful title (1-3 words only) representing the core idea. It should feel like a clean knowledge label, not a sentence (e.g., "Vector Databases", "React Hooks", "Habit Systems").
2. "tags": An array of exactly 3 to 5 single keywords extracted from the content. Requirements: lowercase, no spaces, represent main topics.

You must output ONLY valid JSON. Do not include markdown formatting or any other text.
Example format:
{
  "title": "Vector Databases",
  "tags": ["vector", "database", "embeddings", "semantic"]
}`,
          },
          {
            role: "user",
            content: payload.content,
          },
        ],
      });
      
      const rawContent = completion.choices?.[0]?.message?.content || "{}";
      
      let title = "";
      let tags: string[] = [];
      
      try {
        // Strip out potential markdown code block wrappers
        const cleanedContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedContent);
        
        if (parsed.title) {
          title = parsed.title;
        }
        
        if (Array.isArray(parsed.tags)) {
          tags = parsed.tags
            .map((t: string) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
            .filter(Boolean)
            .slice(0, 5);
        }
      } catch (e) {
        console.error("Failed to parse metadata JSON", e);
      }

      return NextResponse.json({ title, tags });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: unknown) {
    console.error("Generate API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
