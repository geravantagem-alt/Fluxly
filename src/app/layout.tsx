import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { Providers } from "./providers";

import "./globals.css";
import "@/styles/animations.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Fluxly",
  description: "Fluxly - mapeamento visual de processos para PMEs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} ${jetbrainsMono.variable}`} lang="pt-BR">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
