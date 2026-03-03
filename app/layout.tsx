import "./globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { LenisProvider } from "@/components/lenis-provider";
import { CommandPalette } from "@/components/command-palette";

export const metadata = {
  title: "Second Brain",
  description: "AI-powered knowledge system",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased pt-20">
        <LenisProvider>
          <CommandPalette />
          <Navbar />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
