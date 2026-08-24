import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Clock3, LoaderCircle } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { StudyWorkspace } from "@/components/study-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { generateStudyPack } from "@/lib/study-ai";
import { useStudyStore } from "@/lib/store";
import { slugifyConcept } from "@/lib/utils";
import type { StudyPack } from "@/lib/types";

export const Route = createFileRoute("/")({ component: Home });

const SUGGESTIONS = [
  "Photosynthesis",
  "Quadratic equations",
  "Newton's laws",
  "Supply and demand",
  "Cell division",
  "Binary search",
  "Ohm's law",
  "French Revolution",
];

function Home() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<StudyPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const packs = useStudyStore((s) => s.packs);
  const recents = useStudyStore((s) => s.recents);
  const savePack = useStudyStore((s) => s.savePack);

  useEffect(() => {
    setHydrated(true);
  }, []);

  async function openConcept(raw: string) {
    const concept = raw.trim();
    if (concept.length < 2) return;
    const slug = slugifyConcept(concept);
    const cached = packs[slug] ?? Object.values(packs).find(
      (p) => p.title.toLowerCase() === concept.toLowerCase(),
    );
    if (cached) {
      setActive(cached);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    setActive(null);
    try {
      const pack = await generateStudyPack({ data: { concept } });
      savePack(pack);
      setActive(pack);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build that study pack");
    } finally {
      setLoading(false);
    }
  }

  if (active) {
    return (
      <div className="min-h-dvh">
        <AppHeader status={active.title} onHome={() => setActive(null)} />
        <StudyWorkspace
          pack={packs[active.slug] ?? active}
          onBack={() => setActive(null)}
          onOpenRelated={(concept) => void openConcept(concept)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <AppHeader status={loading ? "Building your pack" : "Ready"} />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:pt-16">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted">
          Study any concept
        </p>
        <h1 className="mt-3 max-w-xl text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl">
          Learn it. Revise it. Practise until it sticks.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Studania builds a full study pack for whatever you type — explanation,
          flashcards, questions, and a teach-back that actually grades understanding.
        </p>

        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            void openConcept(query);
          }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Photosynthesis, quadratic equations, Ohm's law..."
            aria-label="Concept to study"
            autoFocus
          />
          <Button type="submit" size="lg" disabled={loading || query.trim().length < 2}>
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Start
            {!loading && <ArrowRight className="size-4" />}
          </Button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>
        )}

        {loading ? (
          <div className="mt-10 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <p className="pt-2 text-sm text-muted">Writing a study pack for this concept...</p>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap gap-2">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    void openConcept(item);
                  }}
                  className="min-h-11 rounded-full border border-border bg-elevated px-3.5 text-sm text-fg shadow-border hover:border-accent/30"
                >
                  {item}
                </button>
              ))}
            </div>

            {hydrated && recents.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
                  <Clock3 className="size-4 text-muted" />
                  Continue
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recents
                    .map((slug) => packs[slug])
                    .filter(Boolean)
                    .map((pack) => (
                      <button
                        key={pack.slug}
                        type="button"
                        onClick={() => setActive(pack)}
                        className="rounded-xl bg-elevated p-5 text-left shadow-border transition-transform duration-150 hover:-translate-y-0.5"
                      >
                        <p className="font-display text-xl font-medium">{pack.title}</p>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                          {pack.summary}
                        </p>
                      </button>
                    ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
