"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export function SimpleTooltip({
  children,
  content,
  delayDuration = 0,
  side,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  delayDuration?: number;
  side?: "bottom" | "top" | "right" | "left";
}) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
