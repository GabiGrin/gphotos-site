import { useMemo } from "react";
import { Site } from "@/types/gphotos";
import { getLimits, PremiumPlanLimits } from "@/premium/plans";

export function usePremiumData(site: Site) {
  const combinedPremiumData: PremiumPlanLimits = useMemo(
    () => getLimits(site),
    [site]
  );

  return combinedPremiumData;
}
