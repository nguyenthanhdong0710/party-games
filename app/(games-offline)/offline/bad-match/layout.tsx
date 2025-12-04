import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bad Match | Party games",
};

export default function BadMatchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
