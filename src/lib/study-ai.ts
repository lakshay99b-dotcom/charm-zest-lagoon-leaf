import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Diagnosis, PracticeQuestion, StudyPack, TeachbackResult } from "./types";
import { slugifyConcept } from "./utils";

const packSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  explanation: z.array(z.string()).min(2).max(8),
  keyPoints: z.array(z.string()).min(3).max(8),
  examples: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .min(1)
    .max(4),
  misconceptions: z
    .array(z.object({ myth: z.string(), truth: z.string() }))
    .min(2)
    .max(6),
  related: z.array(z.string()).min(2).max(8),
  flashcards: z
    .array(z.object({ front: z.string(), back: z.string() }))
    .min(4)
    .max(10),
  questions: z
    .array(
      z.object({
        q: z.string(),
        options: z.array(z.string()).length(4),
        answer: z.number().int().min(0).max(3),
        explanation: z.string(),
        misconceptionIfWrong: z.string(),
      }),
    )
    .min(4)
    .max(8),
});

const moreQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        q: z.string(),
        options: z.array(z.string()).length(4),
        answer: z.number().int().min(0).max(3),
        explanation: z.string(),
        misconceptionIfWrong: z.string(),
      }),
    )
    .min(3)
    .max(6),
});

const teachbackSchema = z.object({
  score: z.number().min(0).max(100),
  verdict: z.enum(["mastered", "partial", "needs_work"]),
  covered: z.array(z.string()),
  missing: z.array(z.string()),
  feedback: z.string(),
  nextHint: z.string(),
});

const diagnosisSchema = z.object({
  diagnosis: z.string(),
  likelyMisconception: z.string(),
  microLesson: z.string(),
});

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Model did not return JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

type ChatProvider = {
  name: string;
  url: string;
  key: string;
  model: string;
  jsonMode: boolean;
};

function envKey(name: string) {
  return process.env[name];
}

function providers(): ChatProvider[] {
  const list: ChatProvider[] = [];
  const groq = envKey("GROQ_API_KEY");
  const xai = envKey("XAI_API_KEY");
  if (groq) {
    list.push({
      name: "groq-120b",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: groq,
      model: "openai/gpt-oss-120b",
      jsonMode: false,
    });
  }
  if (xai) {
    list.push({
      name: "xai",
      url: "https://api.x.ai/v1/chat/completions",
      key: xai,
      model: "grok-4.5",
      jsonMode: true,
    });
  }
  return list;
}

async function chatJson(system: string, user: string, maxTokens = 3500): Promise<unknown> {
  const available = providers();
  if (available.length === 0) {
    throw new Error("AI is not available in this environment");
  }

  let lastError = "AI request failed";
  for (const provider of available) {
    try {
      const body: Record<string, unknown> = {
        model: provider.model,
        temperature: 0.35,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      };
      if (provider.jsonMode) {
        body.response_format = { type: "json_object" };
      }
      const res = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        lastError = `${provider.name} error ${res.status}`;
        continue;
      }
      const payload = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = payload.choices?.[0]?.message?.content ?? "";
      return extractJson(content);
    } catch (err) {
      lastError = err instanceof Error ? err.message : lastError;
    }
  }
  throw new Error(lastError);
}

async function wikipediaContext(concept: string): Promise<string> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(concept)}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Studania/1.0 (student learning app)",
      },
    });
    if (!res.ok) return "";
    const data = (await res.json()) as { extract?: string; title?: string };
    if (!data.extract) return "";
    return `Wikipedia (${data.title ?? concept}): ${data.extract}`;
  } catch {
    return "";
  }
}

function toQuestions(
  raw: z.infer<typeof moreQuestionsSchema>["questions"],
): PracticeQuestion[] {
  return raw.map((q) => ({
    q: q.q,
    options: [q.options[0], q.options[1], q.options[2], q.options[3]] as [
      string,
      string,
      string,
      string,
    ],
    answer: q.answer as 0 | 1 | 2 | 3,
    explanation: q.explanation,
    misconceptionIfWrong: q.misconceptionIfWrong,
  }));
}

export const generateStudyPack = createServerFn({ method: "POST" })
  .validator((input: { concept: string }) => {
    const concept = input.concept.trim().slice(0, 120);
    if (concept.length < 2) throw new Error("Enter a concept to study");
    return { concept };
  })
  .handler(async ({ data }): Promise<StudyPack> => {
    const wiki = await wikipediaContext(data.concept);
    const parsed = packSchema.parse(
      await chatJson(
        `You are Studania, a rigorous study tutor for high-school and early-college students.
Return ONLY valid JSON matching this shape:
{
  "title": string,
  "summary": string (2-4 sentences),
  "explanation": string[] (4-6 short paragraphs, clear, accurate, no fluff),
  "keyPoints": string[] (5-7 exam-ready bullets),
  "examples": [{"title": string, "body": string}] (2-3 worked or concrete examples),
  "misconceptions": [{"myth": string, "truth": string}] (3-5 common student mistakes),
  "related": string[] (4-6 related concepts a student should study next),
  "flashcards": [{"front": string, "back": string}] (6-8 active-recall cards),
  "questions": [{
    "q": string,
    "options": [string, string, string, string],
    "answer": 0|1|2|3,
    "explanation": string,
    "misconceptionIfWrong": string
  }] (5-6 multiple choice; distractors must be plausible misconceptions; answer is the index of the correct option)
}
Rules: be factually careful. Prefer definitions, mechanisms, and why it matters. No markdown. No emoji.`,
        `Create a complete study pack for: ${data.concept}
${wiki ? `\nGrounding context (use if accurate, correct if wrong):\n${wiki}` : ""}`,
      ),
    );

    return {
      slug: slugifyConcept(parsed.title || data.concept),
      title: parsed.title,
      summary: parsed.summary,
      explanation: parsed.explanation,
      keyPoints: parsed.keyPoints,
      examples: parsed.examples,
      misconceptions: parsed.misconceptions,
      related: parsed.related,
      flashcards: parsed.flashcards,
      questions: toQuestions(parsed.questions),
      generatedAt: Date.now(),
    };
  });

export const generateMoreQuestions = createServerFn({ method: "POST" })
  .validator((input: { title: string; existing: string[] }) => ({
    title: input.title.trim().slice(0, 120),
    existing: input.existing.slice(0, 20),
  }))
  .handler(async ({ data }): Promise<PracticeQuestion[]> => {
    const parsed = moreQuestionsSchema.parse(
      await chatJson(
        `You are Studania. Return ONLY JSON: {"questions":[{ "q": string, "options": [string,string,string,string], "answer": 0|1|2|3, "explanation": string, "misconceptionIfWrong": string }]}
Create 4 NEW multiple-choice questions that do not repeat existing ones. Plausible distractors. No markdown.`,
        `Concept: ${data.title}
Already asked:\n- ${data.existing.join("\n- ")}`,
        2200,
      ),
    );
    return toQuestions(parsed.questions);
  });

export const evaluateTeachback = createServerFn({ method: "POST" })
  .validator((input: { title: string; keyPoints: string[]; explanation: string }) => {
    const explanation = input.explanation.trim();
    if (explanation.length < 40) throw new Error("Write a fuller explanation first");
    return {
      title: input.title.trim().slice(0, 120),
      keyPoints: input.keyPoints.slice(0, 10),
      explanation: explanation.slice(0, 4000),
    };
  })
  .handler(async ({ data }): Promise<TeachbackResult> => {
    return teachbackSchema.parse(
      await chatJson(
        `You grade a student's teach-back. Be fair but strict: they must show understanding, not keyword stuffing.
Return ONLY JSON:
{
  "score": number 0-100,
  "verdict": "mastered" | "partial" | "needs_work",
  "covered": string[] (ideas they got right),
  "missing": string[] (important gaps),
  "feedback": string (2-4 sentences, specific, encouraging but honest),
  "nextHint": string (one concrete thing to study next)
}
mastered >= 80, partial 50-79, needs_work < 50. No markdown.`,
        `Concept: ${data.title}
Key points the student should cover:
${data.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Student explanation:
${data.explanation}`,
        1200,
      ),
    );
  });

export const diagnoseMistake = createServerFn({ method: "POST" })
  .validator(
    (input: {
      title: string;
      question: string;
      options: string[];
      chosen: string;
      correct: string;
    }) => ({
      title: input.title.trim().slice(0, 120),
      question: input.question.slice(0, 500),
      options: input.options.slice(0, 4),
      chosen: input.chosen.slice(0, 300),
      correct: input.correct.slice(0, 300),
    }),
  )
  .handler(async ({ data }): Promise<Diagnosis> => {
    return diagnosisSchema.parse(
      await chatJson(
        `You diagnose the exact misconception behind a wrong multiple-choice answer.
Return ONLY JSON:
{
  "diagnosis": string (what the student likely believed),
  "likelyMisconception": string (name the misconception),
  "microLesson": string (4-6 sentences that correct it with a concrete example)
}
No markdown. No shame. Be precise.`,
        `Concept: ${data.title}
Question: ${data.question}
Options: ${data.options.join(" | ")}
Student chose: ${data.chosen}
Correct answer: ${data.correct}`,
        900,
      ),
    );
  });
