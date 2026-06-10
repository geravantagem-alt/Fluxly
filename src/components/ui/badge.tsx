import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex items-center rounded-md border border-flux-border bg-flux-surface-alt px-2 py-1 text-xs font-medium text-flux-muted", className)} {...props} />
  );
}