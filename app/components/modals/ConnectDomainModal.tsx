import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MainButton } from "@/app/components/MainButton";
import { EmailIcon } from "@/app/components/icons/icons";

export default function ConnectDomainModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const emailSubject = encodeURIComponent("Connect Domain Request");
  const emailLink = `mailto:hey@gphotos.site?subject=${emailSubject}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Custom Domain</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-neutral-600">
            We're currently working on automating the custom domain setup
            process. Meanwhile, send us an email and we'll help you set up your
            custom domain within 24 hours.
          </p>
          <div className="flex justify-center">
            <a
              href={emailLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200 font-medium text-sm"
            >
              <span>Contact hey@gphotos.site</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
