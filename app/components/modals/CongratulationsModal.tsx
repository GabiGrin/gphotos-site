import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export function CongratulationsModal({
  isOpen,
  onClose,
  username,
}: CongratulationsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <VisuallyHidden>
        <DialogTitle>Congratulations</DialogTitle>
      </VisuallyHidden>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              🎉 Your Gallery Is Ready!
            </h2>
            <p className="text-muted-foreground">
              Great job importing your first images from Google Photos. Here's
              how to make your gallery even better:
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                1
              </span>
              <p className="font-medium pt-1">
                Personalize your gallery with a title and description
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                2
              </span>
              <p className="font-medium pt-1">
                Keep building your collection by importing more photos
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                3
              </span>
              <p className="font-medium pt-1">
                Share your gallery with the world. This is your link:{" "}
                <a
                  href={`https://${username}.myphotos.site`}
                  className="text-blue-500 hover:underline"
                  target="_blank"
                >
                  {username}.myphotos.site
                </a>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Learn how in the video below ↓
            </p>
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src="https://www.tella.tv/video/cm3y8nqth000e03l21m28agqq/embed?feature=oembed"
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
