import { PremiumIcon } from "@/app/components/icons/PremiumIcon";
import { Site } from "@/types/gphotos";
import Link from "next/link";

export function PremiumPlanBadge({ site }: { site: Site }) {
  let premiumPlan = site.premium_plan;

  switch (premiumPlan) {
    case "free":
      return (
        <div className="flex flex-row items-center gap-2">
          <span
            // variant="outline"
            className="capitalize text-xs font-light"
          >
            {premiumPlan} Plan
          </span>
          <Link
            href="?upgrade=true"
            className="main-btn !text-xs !h-6 !gap-2 !px-2"
          >
            Upgrade Now <PremiumIcon size={16} />
          </Link>
        </div>
      );
    case "basic":
      return (
        <div className="flex flex-row items-center gap-2">
          <span
            // variant="outline"
            className="capitalize text-xs font-light flex flex-row"
          >
            {premiumPlan} Plan
          </span>
          <Link
            href="?upgrade=true"
            className="main-btn !text-xs !h-6 !gap-2 !px-2"
          >
            Upgrade to Pro <PremiumIcon size={16} />
          </Link>
        </div>
      );
    case "pro":
      return (
        <div className="flex flex-row items-center gap-2">
          <span
            // variant="outline"
            className="capitalize text-xs font-light flex flex-row gap-2"
          >
            {premiumPlan} Plan <PremiumIcon size={16} />
          </span>
        </div>
      );
  }
}
