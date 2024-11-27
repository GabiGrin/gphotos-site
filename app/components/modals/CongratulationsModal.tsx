import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col gap-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              🎉 Your Photos Are Ready!
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
              <div>
                <p className="font-medium">Personalize your gallery</p>
                <p className="text-muted-foreground">
                  Add a title and description that tells your story
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                2
              </span>
              <div>
                <p className="font-medium">Keep building your collection</p>
                <p className="text-muted-foreground">
                  Import more photos anytime to grow your gallery
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                3
              </span>
              <div>
                <p className="font-medium">
                  Share gallery with friends and family
                </p>
                <p className="text-muted-foreground">
                  <a
                    href={`https://${username}.myphotos.site`}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                  >
                    Copy your gallery link
                  </a>{" "}
                  and share it with loved ones
                </p>
              </div>
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
