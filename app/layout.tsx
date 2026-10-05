import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "University Consortium AI Data Center | Investment Committee Memo",
  description: "A conditional planning-price memorandum and research framework for a university consortium AI data center. The 25 MW expansion envelope is uncommitted.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
