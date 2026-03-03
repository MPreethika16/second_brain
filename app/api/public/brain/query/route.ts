export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get("q");
    const userId = searchParams.get("userId");

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // 🔎 Search globally (bypassing RLS with supabaseAdmin)
    const { data, error } = await supabaseAdmin.rpc("search_notes", {
      search_query: question,
      match_count: 5,
    });

    if (error) {
      console.error("RPC Error:", error.message);
      throw error;
    }

    const context = (data && data.length > 0)
      ? data.map((note: { title: string; content: string }) => `Title: ${note.title}\nContent: ${note.content}`).join("\n\n---\n\n")
      : "No relevant notes found in the user's Second Brain.";

    const completion = await openai.chat.completions.create({
      model: "openrouter/auto",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Answer ONLY using the provided notes. If not found, say you could not find it in the notes. This is a public query, return a helpful, direct answer.",
        },
        {
          role: "user",
          content: `Notes:\n${context}\n\nQuestion:\n${question}`,
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
    console.error("Public Query API Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
