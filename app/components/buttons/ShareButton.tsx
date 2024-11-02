"use client";

import { useState } from "react";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { ShareIcon } from "../icons/icons";

export default function ShareButton({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <SimpleTooltip content={copied ? "Copied!" : "Share Gallery"} side="left">
      <button
        onClick={handleShare}
        className={`main-btn icon-btn ${className} ml-2`}
      >
        <ShareIcon className="w-5 h-5 text-gray-700" />
      </button>
    </SimpleTooltip>
  );
}
