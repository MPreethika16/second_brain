import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

// ✅ OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    // ✅ IMPORTANT: await cookies()
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

    // ✅ get logged in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to save notes." },
        { status: 401 }
      );
    }

    let { title, content, type, tags, links, fileUrls } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }
    
    // AI Auto-tagging
    if (!tags || tags.length === 0) {
      try {
        const tagResp = await openai.chat.completions.create({
          model: "openrouter/auto",
          messages: [
            { role: "system", content: "You are an intelligent tagging engine. Analyze the provided title and content, and return a comma-separated list of 3-5 concise, hyper-relevant topic tags (single words or very short phrases). Do not output anything else." },
            { role: "user", content: `Title: ${title}\nContent: ${content}` }
          ],
          temperature: 0.1
        });
        const generatedText = tagResp.choices?.[0]?.message?.content || "";
        if (generatedText) {
          tags = generatedText.split(",").map(t => t.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "")).filter(t => t.length > 0);
        }
      } catch (aiErr) {
        console.error("AI Auto-tagging error:", aiErr);
        tags = [];
      }
    }

    // ✅ insert into knowledge_items
    const { data: noteData, error } = await supabase.from("knowledge_items").insert({
      title,
      content,
      type: type || "note",
      tags: tags || [],
      user_id: user.id,
    }).select().single();

    if (error) {
      console.error("Database Insert Error:", error);
      throw error;
    }

    const noteId = noteData.id;

    // ✅ insert links
    if (links && Array.isArray(links) && links.length > 0) {
      const linkInserts = links.map((url: string) => ({
        knowledge_item_id: noteId,
        url,
      }));
      const { error: linkErr } = await supabase.from("knowledge_links").insert(linkInserts);
      if (linkErr) console.error("Error saving links:", linkErr);
    }

    // ✅ insert attachments
    if (fileUrls && Array.isArray(fileUrls) && fileUrls.length > 0) {
      const attachmentInserts = fileUrls.map((file_url: string) => ({
        knowledge_item_id: noteId,
        file_url,
      }));
      const { error: attachErr } = await supabase.from("knowledge_attachments").insert(attachmentInserts);
      if (attachErr) console.error("Error saving attachments:", attachErr);
    }

    return NextResponse.json({
      message: "Note saved successfully",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}