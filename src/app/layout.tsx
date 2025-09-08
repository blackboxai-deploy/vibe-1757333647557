import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameContextProvider } from "@/lib/context/GameContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Game Builder Studio",
  description: "Create amazing games with our visual game building platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <GameContextProvider>
          <div className="min-h-screen bg-gray-950 text-white">
            {children}
          </div>
          <Toaster />
        </GameContextProvider>
      </body>
    </html>
  );
}