import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-lg border border-border bg-elevated px-4 text-base text-fg placeholder:text-subtle outline-none transition-[box-shadow,border-color] duration-150",
        "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}
