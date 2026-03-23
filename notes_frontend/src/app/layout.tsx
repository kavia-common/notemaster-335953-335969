import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoteMaster",
  description: "Create, search, and organize notes with tags.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
