import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { neonAuthConfigured } from "@/lib/neon-auth";
import NeedKeys from "@/components/NeedKeys";
import Toaster from "@/components/Toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "resumay — LaTeX typesetting, zero LaTeX required",
  description: "Fill in sections, get a polished ATS-friendly PDF with a shareable link.",
};

// Auth via Neon Auth (managed Better Auth). force-dynamic: session-dependent
// pages must not prerender (also lets builds succeed before keys are pasted).
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  if (!neonAuthConfigured()) {
    return (
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col" data-auth-configured="0">
          <NeedKeys />
        </body>
      </html>
    );
  }
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" data-auth-configured="1">{children}<Toaster /></body>
    </html>
  );
}
