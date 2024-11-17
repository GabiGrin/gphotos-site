import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Your Gallery | MyPhotos.site",
};

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
