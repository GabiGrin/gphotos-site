import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Your Gallery | GPhotos.site",
};

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
