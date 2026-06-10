import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-flux-border bg-flux-sidebar px-3 text-sm text-flux-text placeholder:text-flux-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flux-primary/70",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };