import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "University Consortium AI Data Center | Decision Framework",
  description: "An executive research framework for a university consortium AI data center, with a proposed 25 MW expansion boundary. Findings remain conditional.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
