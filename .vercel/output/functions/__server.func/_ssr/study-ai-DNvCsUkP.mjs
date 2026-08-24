import { a as object, i as number, n as array, o as string, t as _enum } from "../_libs/zod.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { n as slugifyConcept } from "./utils-DGLU3z9w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/study-ai-DNvCsUkP.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var packSchema = object({
	title: string().min(1),
	summary: string().min(1),
	explanation: array(string()).min(2).max(8),
	keyPoints: array(string()).min(3).max(8),
	examples: array(object({
		title: string(),
		body: string()
	})).min(1).max(4),
	misconceptions: array(object({
		myth: string(),
		truth: string()
	})).min(2).max(6),
	related: array(string()).min(2).max(8),
	flashcards: array(object({
		front: string(),
		back: string()
	})).min(4).max(10),
	questions: array(object({
		q: string(),
		options: array(string()).length(4),
		answer: number().int().min(0).max(3),
		explanation: string(),
		misconceptionIfWrong: string()
	})).min(4).max(8)
});
var moreQuestionsSchema = object({ questions: array(object({
	q: string(),
	options: array(string()).length(4),
	answer: number().int().min(0).max(3),
	explanation: string(),
	misconceptionIfWrong: string()
})).min(3).max(6) });
var teachbackSchema = object({
	score: number().min(0).max(100),
	verdict: _enum([
		"mastered",
		"partial",
		"needs_work"
	]),
	covered: array(string()),
	missing: array(string()),
	feedback: string(),
	nextHint: string()
});
var diagnosisSchema = object({
	diagnosis: string(),
	likelyMisconception: string(),
	microLesson: string()
});
function extractJson(text) {
	const trimmed = text.trim();
	const raw = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? trimmed;
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) throw new Error("Model did not return JSON");
	return JSON.parse(raw.slice(start, end + 1));
}
function envKey(name) {
	return process.env[name];
}
function providers() {
	const list = [];
	const groq = envKey("GROQ_API_KEY");
	const xai = envKey("XAI_API_KEY");
	if (groq) list.push({
		name: "groq-120b",
		url: "https://api.groq.com/openai/v1/chat/completions",
		key: groq,
		model: "openai/gpt-oss-120b",
		jsonMode: false
	});
	if (xai) list.push({
		name: "xai",
		url: "https://api.x.ai/v1/chat/completions",
		key: xai,
		model: "grok-4.5",
		jsonMode: true
	});
	return list;
}
async function chatJson(system, user, maxTokens = 3500) {
	const available = providers();
	if (available.length === 0) throw new Error("AI is not available in this environment");
	let lastError = "AI request failed";
	for (const provider of available) try {
		const body = {
			model: provider.model,
			temperature: .35,
			max_tokens: maxTokens,
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: user
			}]
		};
		if (provider.jsonMode) body.response_format = { type: "json_object" };
		const res = await fetch(provider.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${provider.key}`
			},
			body: JSON.stringify(body)
		});
		if (!res.ok) {
			lastError = `${provider.name} error ${res.status}`;
			continue;
		}
		return extractJson((await res.json()).choices?.[0]?.message?.content ?? "");
	} catch (err) {
		lastError = err instanceof Error ? err.message : lastError;
	}
	throw new Error(lastError);
}
async function wikipediaContext(concept) {
	try {
		const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(concept)}`;
		const res = await fetch(url, { headers: {
			Accept: "application/json",
			"User-Agent": "Studania/1.0 (student learning app)"
		} });
		if (!res.ok) return "";
		const data = await res.json();
		if (!data.extract) return "";
		return `Wikipedia (${data.title ?? concept}): ${data.extract}`;
	} catch {
		return "";
	}
}
function toQuestions(raw) {
	return raw.map((q) => ({
		q: q.q,
		options: [
			q.options[0],
			q.options[1],
			q.options[2],
			q.options[3]
		],
		answer: q.answer,
		explanation: q.explanation,
		misconceptionIfWrong: q.misconceptionIfWrong
	}));
}
var generateStudyPack_createServerFn_handler = createServerRpc({
	id: "c2bc800b0b448b7278600d25f50d142a04002b792847e4402fc241fc55621bfb",
	name: "generateStudyPack",
	filename: "src/lib/study-ai.ts"
}, (opts) => generateStudyPack.__executeServer(opts));
var generateStudyPack = createServerFn({ method: "POST" }).validator((input) => {
	const concept = input.concept.trim().slice(0, 120);
	if (concept.length < 2) throw new Error("Enter a concept to study");
	return { concept };
}).handler(generateStudyPack_createServerFn_handler, async ({ data }) => {
	const wiki = await wikipediaContext(data.concept);
	const parsed = packSchema.parse(await chatJson(`You are Studania, a rigorous study tutor for high-school and early-college students.
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
Rules: be factually careful. Prefer definitions, mechanisms, and why it matters. No markdown. No emoji.`, `Create a complete study pack for: ${data.concept}
${wiki ? `\nGrounding context (use if accurate, correct if wrong):\n${wiki}` : ""}`));
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
		generatedAt: Date.now()
	};
});
var generateMoreQuestions_createServerFn_handler = createServerRpc({
	id: "49eba8f2dc160a479290eb1ce8ad817e2da795de0df9a2cbe1d2afc40ecf9452",
	name: "generateMoreQuestions",
	filename: "src/lib/study-ai.ts"
}, (opts) => generateMoreQuestions.__executeServer(opts));
var generateMoreQuestions = createServerFn({ method: "POST" }).validator((input) => ({
	title: input.title.trim().slice(0, 120),
	existing: input.existing.slice(0, 20)
})).handler(generateMoreQuestions_createServerFn_handler, async ({ data }) => {
	return toQuestions(moreQuestionsSchema.parse(await chatJson(`You are Studania. Return ONLY JSON: {"questions":[{ "q": string, "options": [string,string,string,string], "answer": 0|1|2|3, "explanation": string, "misconceptionIfWrong": string }]}
Create 4 NEW multiple-choice questions that do not repeat existing ones. Plausible distractors. No markdown.`, `Concept: ${data.title}
Already asked:\n- ${data.existing.join("\n- ")}`, 2200)).questions);
});
var evaluateTeachback_createServerFn_handler = createServerRpc({
	id: "b2d600e7bcdc4a9edc5d6ce9f25be10c67707d59b87fb616b72dfc560a7a0297",
	name: "evaluateTeachback",
	filename: "src/lib/study-ai.ts"
}, (opts) => evaluateTeachback.__executeServer(opts));
var evaluateTeachback = createServerFn({ method: "POST" }).validator((input) => {
	const explanation = input.explanation.trim();
	if (explanation.length < 40) throw new Error("Write a fuller explanation first");
	return {
		title: input.title.trim().slice(0, 120),
		keyPoints: input.keyPoints.slice(0, 10),
		explanation: explanation.slice(0, 4e3)
	};
}).handler(evaluateTeachback_createServerFn_handler, async ({ data }) => {
	return teachbackSchema.parse(await chatJson(`You grade a student's teach-back. Be fair but strict: they must show understanding, not keyword stuffing.
Return ONLY JSON:
{
  "score": number 0-100,
  "verdict": "mastered" | "partial" | "needs_work",
  "covered": string[] (ideas they got right),
  "missing": string[] (important gaps),
  "feedback": string (2-4 sentences, specific, encouraging but honest),
  "nextHint": string (one concrete thing to study next)
}
mastered >= 80, partial 50-79, needs_work < 50. No markdown.`, `Concept: ${data.title}
Key points the student should cover:
${data.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Student explanation:
${data.explanation}`, 1200));
});
var diagnoseMistake_createServerFn_handler = createServerRpc({
	id: "2ead3a79afc1c3219bd00665283ba2f3705802a525e87034d7e27489ad43c9a6",
	name: "diagnoseMistake",
	filename: "src/lib/study-ai.ts"
}, (opts) => diagnoseMistake.__executeServer(opts));
var diagnoseMistake = createServerFn({ method: "POST" }).validator((input) => ({
	title: input.title.trim().slice(0, 120),
	question: input.question.slice(0, 500),
	options: input.options.slice(0, 4),
	chosen: input.chosen.slice(0, 300),
	correct: input.correct.slice(0, 300)
})).handler(diagnoseMistake_createServerFn_handler, async ({ data }) => {
	return diagnosisSchema.parse(await chatJson(`You diagnose the exact misconception behind a wrong multiple-choice answer.
Return ONLY JSON:
{
  "diagnosis": string (what the student likely believed),
  "likelyMisconception": string (name the misconception),
  "microLesson": string (4-6 sentences that correct it with a concrete example)
}
No markdown. No shame. Be precise.`, `Concept: ${data.title}
Question: ${data.question}
Options: ${data.options.join(" | ")}
Student chose: ${data.chosen}
Correct answer: ${data.correct}`, 900));
});
//#endregion
export { diagnoseMistake_createServerFn_handler, evaluateTeachback_createServerFn_handler, generateMoreQuestions_createServerFn_handler, generateStudyPack_createServerFn_handler };
