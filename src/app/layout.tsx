import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
});

import Navbar from "@/components/Navbar";
import RealtimeListener from "@/components/RealtimeListener";

export const metadata: Metadata = {
  title: "BTHS Predictions",
  description: "Prediction market for the BTHS game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0B0F] text-zinc-50 font-sans" style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, #141421 0%, transparent 50%), radial-gradient(circle at 80% 50%, #10101A 0%, transparent 50%)'
      }}>
        <RealtimeListener />
        <Navbar />
        <main className="flex-1 pt-12">
          {children}
        </main>
      </body>
    </html>
  );
}
