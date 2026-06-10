import { User } from "lucide-react";

import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  className?: string;
}

export function Avatar({ initials, className }: AvatarProps) {
  return (
    <div className={cn("flex h-9 w-9 items-center justify-center rounded-full border border-flux-primary/30 bg-flux-primary/15 text-xs font-bold text-flux-primary", className)}>
      {initials || <User className="h-4 w-4" />}
    </div>
  );
}