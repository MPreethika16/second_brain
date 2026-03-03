export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { prompt, type } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let systemPrompt = "Answer the user's research query comprehensively so they can use it as a note in their knowledge base. Format in clear, readable Markdown. Keep it under 500 words and be highly informative.";

    if (type === "link") {
      systemPrompt = "You are a research assistant. The user wants links and resources about a topic. Perform a deep research analysis on the given topic. Provide a comprehensive summary and then a list of 5-10 highly relevant, authoritative URLs/links related to the query, formatted in Markdown with brief descriptions for each link.";
    } else if (type === "insight") {
      systemPrompt = "You are an analytical engine. Provide deep, profound insights, paradigms, or unconventional perspectives on the user's topic. Focus on high-level mental models, frameworks, and strategic thinking rather than just factual summaries. Format in clear, readable Markdown. Keep it concise but profound.";
    }

    const completion = await openai.chat.completions.create({
      model: "openrouter/auto",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content ?? "No response generated.";

    return NextResponse.json({ content });
  } catch (error: unknown) {
    console.error("Generate API Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
