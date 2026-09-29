import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SkillPassport - Decentralized Skill Credentials",
  description: "Own your skills. Verify your achievements on-chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-600 selection:text-white bg-[#090a10] text-[#f4f4f7]">
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-[#1a1d2e] py-6 text-center text-xs text-zinc-500">
            <p>SkillPassport Decentralized Credential Protocol</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
