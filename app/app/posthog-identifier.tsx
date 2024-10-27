"use client";

import { User } from "@supabase/supabase-js";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export function PosthogIdentifier({ user }: { user: User }) {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.identify(user.id);
  }, [user]);

  return null;
}
