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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://makeresumay.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "resumay — Free ATS-Safe Resume Builder",
    template: "%s | resumay",
  },
  description:
    "Create clean, ATS-friendly resumes in minutes. No formatting headaches — enter your details, preview live, and download for free.",
  applicationName: "resumay",
  keywords: [
    "resume builder",
    "free resume builder",
    "ats resume",
    "ats friendly resume",
    "simple resume builder",
    "clean resume templates",
    "professional resume builder",
    "job search resume",
  ],
  authors: [{ name: "r69shabh", url: "https://x.com/r69shabh" }],
  creator: "r69shabh",
  publisher: "resumay",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: "resumay — Free ATS-Safe Resume Builder",
    description:
      "Create clean, ATS-friendly resumes in minutes. No formatting headaches — enter your details, preview live, and download for free.",
    siteName: "resumay",
  },
  twitter: {
    card: "summary_large_image",
    title: "resumay — Free ATS-Safe Resume Builder",
    description:
      "Create clean, ATS-friendly resumes in minutes. No formatting headaches — enter your details, preview live, and download for free.",
    creator: "@r69shabh",
    site: "@r69shabh",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "resumay",
  url: appUrl,
  description:
    "Free ATS-friendly resume builder. Create clean, professional resumes in minutes with live preview and instant download.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "r69shabh",
    url: "https://x.com/r69shabh",
  },
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" data-auth-configured="1">{children}<Toaster /></body>
    </html>
  );
}
