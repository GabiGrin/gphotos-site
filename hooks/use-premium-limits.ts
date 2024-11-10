import { useMemo } from "react";
import { Site } from "@/types/gphotos";
import { getLimits, PremiumPlanLimits, premiumPlans } from "@/premium/plans";

export function usePremiumLimits(site: Site | null) {
  const combinedPremiumData: PremiumPlanLimits = useMemo(() => {
    if (!site) {
      return premiumPlans.free;
    }
    return getLimits(site);
  }, [site]);

  return combinedPremiumData;
}
