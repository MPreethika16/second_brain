export const runtime = "nodejs";

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
    // ✅ Attach auth cookies
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

    // ✅ Get logged-in user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { question } = await req.json();

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // 🔎 Search (RLS automatically filters by user_id)
    const { data, error } = await supabase.rpc("search_notes", {
      search_query: question,
      match_count: 5,
    });

    if (error) throw error;

    const context = (data && data.length > 0)
      ? data.map(
          (note: { title: string; content: string }) =>
            `Title: ${note.title}\nContent: ${note.content}`
        ).join("\n\n---\n\n")
      : "No relevant notes found in the user's Second Brain.";

    const completion = await openai.chat.completions.create({
      model: "openrouter/auto",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an intelligent Second Brain assistant. First, use the provided Notes to answer the user's question. If the Notes contain the answer, reference them. If the Notes do not contain enough information, supplement your response with your own vast general knowledge. Always provide a comprehensive and helpful answer.",
        },
        {
          role: "user",
          content: `Notes from my storage:\n${context}\n\nQuestion:\n${question}`,
        },
      ],
    });

    const answer =
      completion.choices?.[0]?.message?.content ??
      "No response generated.";

    return NextResponse.json({
      answer,
      sources: data?.map((n: { id: string; title: string; similarity: number }) => ({
        id: n.id,
        title: n.title,
        similarity: Number((n.similarity ?? 0).toFixed(3)),
      })) || [],
    });
  } catch (error: unknown) {
    console.error("Query API Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}