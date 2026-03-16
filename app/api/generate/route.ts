import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "20 m"),
  analytics: true,
  prefix: "arcaprompt",
});

const SYSTEM_PROMPT = `You are ArcaPrompt — an expert prompt engineer and tech architect for vibe coders and solo founders.

When given a product idea, you return a JSON object with this EXACT structure (no markdown, no backticks, raw JSON only):

{
  "prompts": {
    "system": "A detailed system prompt defining the AI's role, context, and constraints for this product",
    "build": "A comprehensive build prompt describing the full product to give to an LLM like Claude or GPT-4 — include features, user flows, and implementation details",
    "ux": "A UX and design prompt describing the ideal UI/UX — aesthetic, layout, responsiveness, accessibility",
    "edge_cases": "A prompt specifically asking the LLM to handle edge cases, error states, loading states, and failure scenarios"
  },
  "tech_stack": {
    "frontend": "Best frontend framework and why",
    "backend": "Best backend approach and why",
    "database": "Best database for this use case and why",
    "auth": "Best auth solution and why",
    "hosting": "Best hosting platform and why"
  },
  "name_suggestions": ["Name1", "Name2", "Name3", "Name4", "Name5"],
  "domain_suggestions": ["name1.com", "getname1.com", "tryname1.com", "name1.app", "name1.xyz"],
  "one_liner": "A punchy one-line description of the product under 15 words"
}

Rules:
- Prompts must be detailed, specific, and ready to paste into any LLM
- Tech stack must be practical for a solo founder (prefer Vercel, Supabase, Next.js unless something better fits)
- Name suggestions must be unique, non-generic, memorable — avoid names like "AI-something" or "Smart-something"
- If a project name is provided, use it — skip name_suggestions (return empty array) but still suggest domains for that name
- Domain suggestions should be realistic and short
- One-liner must be punchy and specific — no fluff
- Return ONLY valid JSON. No explanation, no markdown.`;

export async function POST(req: NextRequest) {
  try {
    // ── RATE LIMIT ──────────────────────────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "anonymous";

    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      const resetIn = Math.ceil((reset - Date.now()) / 1000 / 60);
      return NextResponse.json(
        {
          error: `You've hit the limit. You can generate ${limit} prompt stacks every 20 minutes. Try again in ${resetIn} minute${resetIn === 1 ? "" : "s"}.`,
          resetAt: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
    // ────────────────────────────────────────────────────

    const { idea, projectName } = await req.json();

    if (!idea || idea.trim().length < 20) {
      return NextResponse.json(
        { error: "Idea too short. Give me more to work with." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
    });

    const userMessage = projectName
      ? `Product idea: ${idea.trim()}\n\nProject name: ${projectName.trim()} (use this name, skip name suggestions, only suggest domains for this name)`
      : `Product idea: ${idea.trim()}\n\n(No name yet — suggest 5 unique, memorable names)`;

    const result = await model.generateContent(userMessage);
    const raw = result.response.text().trim();

    const clean = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("JSON parse failed:", clean.slice(0, 300));
      return NextResponse.json(
        { error: "Engine returned unexpected format. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed, {
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
      },
    });
  } catch (err) {
    console.error("ArcaPrompt API error:", err);
    return NextResponse.json(
      { error: "System disruption. The machine is not responding." },
      { status: 500 }
    );
  }
}