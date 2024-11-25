import { ImageIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeScreen({ onImport }: { onImport: () => void }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-12 px-4 bg-gradient-to-b from-blue-50/50 to-white">
      <div className="flex flex-col items-center gap-8 animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <ImageIcon className="w-12 h-12 text-white" />
          </div>
          <div className="absolute inset-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl" />
        </div>

        <div className="max-w-lg text-center space-y-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Create Your Photo Gallery in 60 Seconds
          </h1>
          <div className="space-y-3">
            <p className="text-gray-900 text-xl font-medium">
              Import your photos and get a beautiful gallery website instantly
            </p>
            {/* <p className="text-gray-600 text-lg leading-relaxed">
              Share your memories with friends and family through an elegant,
              customizable gallery that you can set up in just one minute.
            </p> */}
          </div>
        </div>

        <Button
          size="lg"
          onClick={onImport}
          className="bg-blue-500 hover:bg-blue-600 text-lg px-8 py-6 rounded-xl transform transition-all hover:scale-105 hover:shadow-xl flex items-center gap-2 group"
        >
          Import Images from Google Photos
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
