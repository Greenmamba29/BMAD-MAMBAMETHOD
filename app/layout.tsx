import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BMAD Agent Scaffold",
  description: "Production-ready multi-agent system with BMAD methodology integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}