"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Sparkles, Shield, CodeIcon } from "lucide-react";

export function UpgradeModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showUpgrade = searchParams.get("upgrade") === "true";

  const handleClose = () => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("upgrade");
    router.replace(newUrl.pathname + newUrl.search);
  };

  return (
    <Dialog open={showUpgrade} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center space-x-2">
            <DialogTitle className="text-2xl font-bold">
              Unlock Premium Today
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            {/* Features with Icons */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <p className="font-medium">Unlimited Photos & Albums</p>
                  <p className="text-sm text-muted-foreground">
                    Share your entire portfolio without limits
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p className="font-medium">Professional Branding</p>
                  <p className="text-sm text-muted-foreground">
                    Remove MyPhotos.site branding & use your domain
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">VIP Support & Features</p>
                  <p className="text-sm text-muted-foreground">
                    Priority support & early access to new features
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CodeIcon className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <p className="font-medium">Embed Your Gallery</p>
                  <p className="text-sm text-muted-foreground">
                    Embed your gallery on any website or platform
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm italic text-center">
                "MyPhotos Site Premium helped me create a beautiful portfolio
                for my photography hobby!"
                <br />
                <span className="font-medium">
                  - Or C., Amateur Photographer
                </span>
              </p>
            </div>

            {/* CTA Section */}
            <div className="space-y-3 pt-2">
              <Button className="w-full h-12" asChild>
                <a
                  href="/api/track-upgrade"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Pricing Plans
                </a>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime • Secure payment
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
