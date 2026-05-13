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
      <body className="min-h-full flex flex-col bg-[#030305] text-zinc-50 font-sans relative overflow-x-hidden">
        {/* Noise Texture Overlay */}
        <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        
        {/* Animated Ambient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#7C5CFF]/10 blur-[120px] animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#00E0FF]/10 blur-[120px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-[#7C5CFF]/10 blur-[120px] animate-blob animation-delay-4000"></div>
        </div>

        <RealtimeListener />
        <Navbar />
        <main className="flex-1 pt-12 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
