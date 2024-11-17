import { Inter } from "next/font/google";
import "./globals.css";
import { CSPostHogProvider } from "./posthog-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "MyPhotos.site",
  description:
    "Build a beautiful photo website from your Google Photos in 1 minute",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <CSPostHogProvider>
        <body className="bg-background text-foreground">
          {children}
          <Toaster />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
