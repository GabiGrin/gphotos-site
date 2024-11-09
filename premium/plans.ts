import { Site } from "@/types/gphotos";

export interface PremiumPlanLimits {
  photoLimit: number;
  albumLimit: number;
  branding: boolean;
  customDomain: boolean;
}

export const premiumPlans = {
  free: {
    photoLimit: 20,
    albumLimit: 1,
    branding: true,
    customDomain: false,
  },
  basic: {
    photoLimit: 100,
    albumLimit: 2,
    branding: true,
    customDomain: false,
  },
  pro: {
    photoLimit: 500,
    albumLimit: 5,
    branding: false,
    customDomain: true,
  },
};

export type PremiumPlanType = keyof typeof premiumPlans;

export function getLimits(site: Site) {
  const premiumPlan = premiumPlans[site.premium_plan ?? "free"];
  const overrides =
    (site.premium_overrides as unknown as PremiumPlanLimits) ?? {};

  return {
    ...premiumPlan,
    ...overrides,
  };
}
