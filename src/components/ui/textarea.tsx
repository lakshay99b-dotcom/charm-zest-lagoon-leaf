import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-40 w-full rounded-xl border border-border bg-elevated px-4 py-3 text-base text-fg placeholder:text-subtle outline-none transition-[box-shadow,border-color] duration-150",
        "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}
