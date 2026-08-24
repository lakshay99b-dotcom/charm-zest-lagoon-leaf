import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { diagnoseMistake, evaluateTeachback, generateMoreQuestions } from "@/lib/study-ai";
import { useStudyStore } from "@/lib/store";
import type { Diagnosis, PracticeQuestion, StudyPack, TeachbackResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Tab = "learn" | "revise" | "practise" | "mastery";

const TABS: { id: Tab; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "revise", label: "Revise" },
  { id: "practise", label: "Practise" },
  { id: "mastery", label: "Mastery" },
];

export function StudyWorkspace({
  pack,
  onBack,
  onOpenRelated,
}: {
  pack: StudyPack;
  onBack: () => void;
  onOpenRelated: (concept: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("learn");
  const touchProgress = useStudyStore((s) => s.touchProgress);
  const progress = useStudyStore((s) => s.progress[pack.slug]);
  const mastery = progress?.masteryScore;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        All concepts
      </button>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-4xl">{pack.title}</h1>
          <p className="mt-2 max-w-2xl text-muted">{pack.summary}</p>
        </div>
        {typeof mastery === "number" && (
          <div className="w-full sm:w-40">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-subtle">Mastery</p>
            <Progress value={mastery} />
            <p className="mt-1 text-sm tabular-nums text-muted">{mastery}%</p>
          </div>
        )}
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "min-h-11 shrink-0 px-4 text-sm font-medium transition-colors duration-150",
              tab === item.id
                ? "border-b-2 border-accent text-fg"
                : "border-b-2 border-transparent text-muted hover:text-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "learn" && <LearnPanel pack={pack} onOpenRelated={onOpenRelated} />}
      {tab === "revise" && (
        <RevisePanel
          pack={pack}
          onReviewed={() =>
            touchProgress(pack.slug, pack.title, {
              cardsReviewed: (progress?.cardsReviewed ?? 0) + 1,
            })
          }
        />
      )}
      {tab === "practise" && <PractisePanel pack={pack} />}
      {tab === "mastery" && <MasteryPanel pack={pack} />}
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-xl bg-elevated p-5 shadow-border sm:p-6">{children}</section>
  );
}

function LearnPanel({
  pack,
  onOpenRelated,
}: {
  pack: StudyPack;
  onOpenRelated: (concept: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Panel>
        <h2 className="mb-4 text-xl font-medium">Explanation</h2>
        <div className="space-y-3 text-[1.05rem] leading-relaxed text-fg">
          {pack.explanation.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-4 text-xl font-medium">Key points</h2>
        <ul className="space-y-2.5">
          {pack.keyPoints.map((point) => (
            <li key={point} className="flex gap-3 text-[1.05rem] leading-relaxed">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {pack.examples.map((ex) => (
        <Panel key={ex.title}>
          <h2 className="mb-2 text-xl font-medium">{ex.title}</h2>
          <p className="leading-relaxed text-fg">{ex.body}</p>
        </Panel>
      ))}

      <Panel>
        <h2 className="mb-4 text-xl font-medium">Common misconceptions</h2>
        <div className="space-y-4">
          {pack.misconceptions.map((m) => (
            <div key={m.myth} className="rounded-lg bg-surface p-4">
              <p className="text-sm font-medium text-bad">Not this</p>
              <p className="mt-1 text-fg">{m.myth}</p>
              <p className="mt-3 text-sm font-medium text-ok">Instead</p>
              <p className="mt-1 text-fg">{m.truth}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-3 text-xl font-medium">Study next</h2>
        <div className="flex flex-wrap gap-2">
          {pack.related.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onOpenRelated(item)}
              className="min-h-11 rounded-full border border-border bg-surface px-3.5 text-sm text-fg hover:border-accent/40"
            >
              {item}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function RevisePanel({ pack, onReviewed }: { pack: StudyPack; onReviewed: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = pack.flashcards[index];

  function go(next: number) {
    setIndex(next);
    setFlipped(false);
    onReviewed();
  }

  if (!card) return null;

  return (
    <div className="space-y-4">
      <Panel>
        <h2 className="mb-3 text-xl font-medium">Quick summary</h2>
        <p className="leading-relaxed">{pack.summary}</p>
      </Panel>
      <Panel>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium">Flashcards</h2>
          <p className="text-sm tabular-nums text-muted">
            {index + 1} / {pack.flashcards.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFlipped((v) => !v)}
          className="flex min-h-48 w-full flex-col items-center justify-center rounded-lg bg-surface px-6 py-10 text-center"
        >
          <p className="text-lg font-medium leading-snug">{flipped ? card.back : card.front}</p>
          <p className="mt-4 text-xs text-subtle">{flipped ? "Answer" : "Tap to reveal"}</p>
        </button>
        <div className="mt-5 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={index === 0}
            onClick={() => go(index - 1)}
          >
            Previous
          </Button>
          <Button
            className="flex-1"
            disabled={index >= pack.flashcards.length - 1}
            onClick={() => go(index + 1)}
          >
            Next
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function PractisePanel({ pack }: { pack: StudyPack }) {
  const savePack = useStudyStore((s) => s.savePack);
  const touchProgress = useStudyStore((s) => s.touchProgress);
  const progress = useStudyStore((s) => s.progress[pack.slug]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);

  const question = pack.questions[index];
  const correct = chosen === question?.answer;

  async function onCheck() {
    if (chosen === null || !question) return;
    setChecked(true);
    setDiagnosis(null);
    touchProgress(pack.slug, pack.title, {
      questionsAttempted: (progress?.questionsAttempted ?? 0) + 1,
      questionsCorrect: (progress?.questionsCorrect ?? 0) + (chosen === question.answer ? 1 : 0),
    });
  }

  async function onDiagnose() {
    if (!question || chosen === null) return;
    setBusy(true);
    setError(null);
    try {
      const result = await diagnoseMistake({
        data: {
          title: pack.title,
          question: question.q,
          options: question.options,
          chosen: question.options[chosen],
          correct: question.options[question.answer],
        },
      });
      setDiagnosis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not diagnose that answer");
    } finally {
      setBusy(false);
    }
  }

  async function onMore() {
    setBusy(true);
    setError(null);
    try {
      const extra = await generateMoreQuestions({
        data: {
          title: pack.title,
          existing: pack.questions.map((q) => q.q),
        },
      });
      savePack({ ...pack, questions: [...pack.questions, ...extra] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate more questions");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    setIndex((i) => Math.min(i + 1, pack.questions.length - 1));
    setChosen(null);
    setChecked(false);
    setDiagnosis(null);
    setError(null);
  }

  if (!question) {
    return (
      <Panel>
        <p className="text-muted">No questions yet.</p>
      </Panel>
    );
  }

  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-medium">Practice</h2>
        <p className="text-sm tabular-nums text-muted">
          {index + 1} / {pack.questions.length}
        </p>
      </div>
      <p className="mb-5 text-lg font-medium leading-snug">{question.q}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const selected = chosen === i;
          const showMark = checked && (i === question.answer || selected);
          return (
            <label
              key={opt}
              className={cn(
                "flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors duration-150",
                selected && !checked && "border-accent bg-surface",
                checked && i === question.answer && "border-ok bg-ok/8",
                checked && selected && i !== question.answer && "border-bad bg-bad/8",
                !selected && !checked && "border-border hover:border-accent/30",
              )}
            >
              <input
                type="radio"
                name="practice-option"
                className="mt-1"
                checked={selected}
                disabled={checked}
                onChange={() => setChosen(i)}
              />
              <span className="flex-1 leading-snug">{opt}</span>
              {showMark && i === question.answer && <Check className="mt-0.5 size-4 text-ok" />}
            </label>
          );
        })}
      </div>

      {checked && (
        <div
          className={cn(
            "mt-5 rounded-lg p-4",
            correct ? "bg-ok/10 text-fg" : "bg-bad/10 text-fg",
          )}
        >
          <p className="font-medium">{correct ? "Correct" : "Not quite"}</p>
          <p className="mt-2 leading-relaxed">{question.explanation}</p>
          {!correct && (
            <p className="mt-3 text-sm text-muted">{question.misconceptionIfWrong}</p>
          )}
        </div>
      )}

      {diagnosis && (
        <div className="mt-4 rounded-lg bg-surface p-4">
          <p className="text-sm font-medium text-accent">{diagnosis.likelyMisconception}</p>
          <p className="mt-2 leading-relaxed">{diagnosis.diagnosis}</p>
          <p className="mt-3 leading-relaxed">{diagnosis.microLesson}</p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-bad">{error}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {!checked ? (
          <Button className="sm:min-w-40" disabled={chosen === null} onClick={onCheck}>
            Check answer
          </Button>
        ) : (
          <>
            {index < pack.questions.length - 1 ? (
              <Button className="sm:min-w-40" onClick={next}>
                Next question
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button className="sm:min-w-40" disabled={busy} onClick={onMore}>
                {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Generate more
              </Button>
            )}
            {!correct && !diagnosis && (
              <Button variant="secondary" disabled={busy} onClick={onDiagnose}>
                {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Diagnose this mistake
              </Button>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}

function MasteryPanel({ pack }: { pack: StudyPack }) {
  const touchProgress = useStudyStore((s) => s.touchProgress);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TeachbackResult | null>(null);

  const keywords = useMemo(
    () => pack.keyPoints.slice(0, 4).map((p) => p.split(" ").slice(0, 4).join(" ")),
    [pack.keyPoints],
  );

  async function onEvaluate() {
    setBusy(true);
    setError(null);
    try {
      const graded = await evaluateTeachback({
        data: {
          title: pack.title,
          keyPoints: pack.keyPoints,
          explanation: text,
        },
      });
      setResult(graded);
      touchProgress(pack.slug, pack.title, { masteryScore: graded.score });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not evaluate that explanation");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Panel>
        <h2 className="mb-2 text-xl font-medium">Teach it back</h2>
        <p className="mb-4 text-muted">
          Explain {pack.title} as if teaching a classmate. Cover the mechanism, not just the name.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {keywords.map((k) => (
            <Badge key={k}>{k}</Badge>
          ))}
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start with what it is, then how it works, then why it matters..."
        />
        <div className="mt-4 flex gap-3">
          <Button disabled={busy || text.trim().length < 40} onClick={onEvaluate}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Evaluate
          </Button>
          {result && (
            <Button
              variant="ghost"
              onClick={() => {
                setResult(null);
                setText("");
              }}
            >
              <RotateCcw className="size-4" />
              Try again
            </Button>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-bad">{error}</p>}
      </Panel>

      {result && (
        <Panel>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-xl font-medium">Feedback</h2>
            <p className="font-display text-3xl tabular-nums">{result.score}</p>
          </div>
          <Progress value={result.score} className="mb-4" />
          <p className="text-sm font-medium uppercase tracking-wide text-muted">
            {result.verdict.replace("_", " ")}
          </p>
          <p className="mt-3 leading-relaxed">{result.feedback}</p>
          {result.covered.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-ok">Covered</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {result.covered.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {result.missing.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-warn">Missing</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {result.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-4 rounded-lg bg-surface p-3 text-sm leading-relaxed">{result.nextHint}</p>
        </Panel>
      )}
    </div>
  );
}
