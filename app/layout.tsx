import "./globals.css";
import { Press_Start_2P, VT323 } from "next/font/google";
import type React from "react";
import ColorfulPixelLogo from "./components/ColorfulPixelLogo";
import BlinkingCursor from "./components/BlinkingCursor";
import FloatingPixels from "./components/FloatingPixels";
import NavMenu from "./components/NavMenu";
import ThemeToggle from "./components/ThemeToggle";
import SoundEffect from "./components/SoundEffect";
import PixelatedBackground from "./components/PixelatedBackground";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata = {
  title: "Tech Stack Mastery | Learning Assistant",
  description:
    "Interactive learning assistant for any programming language, framework or tech stack",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.variable} ${vt323.variable} font-sans bg-gray-900 text-green-400 dark:bg-gray-900 dark:text-green-400`}
      >
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <PixelatedBackground />
        <div className="max-w-4xl mx-auto px-4">
          <header className="py-8 flex flex-col items-center">
            <ColorfulPixelLogo />
            <h1 className="text-4xl font-bold text-center font-pixel mb-10">
              Tech Stack Mastery
            </h1>
            <div className="flex flex-col items-center mb-8">
              <p className="text-xl text-center font-mono flex items-center mb-2">
                Learn • Code • Master <BlinkingCursor />
              </p>
              <p className="text-sm text-center font-mono text-gray-400 max-w-md">
                Your retro-styled AI learning assistant for any programming
                language, framework or development technology
              </p>
            </div>
          </header>
          <main>{children}</main>
          <footer className="py-8 text-center font-mono">
            <p className="mb-2">
              © 2025 Tech Stack Mastery. Level up your coding skills.
            </p>
            <p className="text-xs text-gray-500">
              Powered by AI Learning Assistant • Helping developers since 2025
            </p>
          </footer>
        </div>
        <FloatingPixels />
        <SoundEffect />
      </body>
    </html>
  );
}
