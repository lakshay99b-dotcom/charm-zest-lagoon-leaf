import { BookOpen } from "lucide-react";

export function AppHeader({
  status,
  onHome,
}: {
  status?: string;
  onHome?: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2.5 text-left"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-fg">
            <BookOpen className="size-4" strokeWidth={2} />
          </span>
          <span className="font-display text-lg font-medium tracking-tight">Studania</span>
        </button>
        <p className="max-w-[50%] truncate text-sm text-muted">{status ?? "Ready"}</p>
      </div>
    </header>
  );
}
