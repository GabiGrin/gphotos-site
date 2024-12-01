import { Site } from "@/types/myphotos";

export interface PremiumPlanLimits {
  photoLimit: number;
  albumLimit: number;
  branding: boolean;
  customDomain: boolean;
  embedding: boolean;
}

export const premiumPlans = {
  free: {
    photoLimit: 50,
    albumLimit: Infinity,
    branding: true,
    customDomain: false,
    embedding: false,
  },
  basic: {
    photoLimit: 1000,
    albumLimit: Infinity,
    branding: true,
    customDomain: false,
    embedding: false,
  },
  pro: {
    photoLimit: Infinity,
    albumLimit: Infinity,
    branding: false,
    customDomain: true,
    embedding: true,
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
