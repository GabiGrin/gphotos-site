import { useMemo } from "react";
import { Site } from "@/types/gphotos";
import { PremiumPlanLimits, premiumPlans } from "@/premium/plans";

export function usePremiumData(site: Site) {
  const combinedPremiumData: PremiumPlanLimits = useMemo(() => {
    const premiumPlan = premiumPlans[site.premium_plan] ?? {};
    return {
      ...premiumPlan,
      ...((site.premium_overrides as Object) ?? {}),
    };
  }, [site]);

  return combinedPremiumData;
}
