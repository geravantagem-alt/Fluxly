import { CircleAlert, CircleCheckBig, Info } from "lucide-react";

import type { ToastVariant } from "@/types";

interface AlertProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function Alert({ title, description, variant = "info" }: AlertProps) {
  const icon = variant === "success" ? <CircleCheckBig className="h-4 w-4 text-flux-success" /> : variant === "error" ? <CircleAlert className="h-4 w-4 text-flux-danger" /> : <Info className="h-4 w-4 text-flux-primary" />;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-flux-border bg-flux-surface p-3">
      {icon}
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="text-xs text-flux-muted">{description}</p> : null}
      </div>
    </div>
  );
}