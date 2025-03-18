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
  title: "Pixel Multimodal | Interactive AI Chatbot",
  description:
    "Advanced multimodal AI chatbot that understands images, code, text and more",
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
        <div className="max-w-5xl mx-auto px-4">
          <header className="py-12 flex flex-col items-center">
            <ColorfulPixelLogo />
            <h1 className="text-5xl font-bold text-center font-pixel mb-12">
              Multimodal Chatbot
            </h1>
            <div className="flex flex-col items-center mb-10">
              <p className="text-2xl text-center font-mono flex items-center mb-3">
                See • Hear • Understand <BlinkingCursor />
              </p>
              <p className="text-lg text-center font-mono text-gray-300 max-w-lg">
                Your retro-styled AI assistant that can process images, audio,
                code and text all at once
              </p>
            </div>
          </header>
          <main>{children}</main>
          <footer className="py-12 text-center font-mono">
            <p className="mb-3 text-lg">
              © 2025 Pixel Multimodal. Seeing beyond text.
            </p>
            <p className="text-base text-gray-500">
              Powered by Advanced Visual AI • Understanding your world since
              2025
            </p>
          </footer>
        </div>
        <FloatingPixels />
        <SoundEffect />
      </body>
    </html>
  );
}
