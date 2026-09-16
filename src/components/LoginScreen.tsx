"use client";

import { useState, useEffect } from "react";
import { ResumayLogo } from "@/components/ResumayLogo";
import { Button } from "@/components/ui/button";
import { Check, Sun, Moon } from "lucide-react";

interface LoginScreenProps {
  signInGoogle: () => void;
}

// 10 authentic public domain pastel masterpieces (The Metropolitan Museum of Art Open Access)
const PASTEL_ARTWORKS = [
  { id: 1, src: "/art/pastel-1.jpg", title: "Bouquet of Flowers", artist: "Odilon Redon", date: "ca. 1900–1905" },
  { id: 2, src: "/art/pastel-2.jpg", title: "The Singer in Green", artist: "Edgar Degas", date: "ca. 1884" },
  { id: 3, src: "/art/pastel-3.jpg", title: "The Bouquet of Violets", artist: "Eva Gonzalès", date: "ca. 1882" },
  { id: 4, src: "/art/pastel-4.jpg", title: "The Dance Lesson", artist: "Edgar Degas", date: "ca. 1879" },
  { id: 5, src: "/art/pastel-5.jpg", title: "Valtesse de la Bigne", artist: "Edouard Manet", date: "1879" },
  { id: 6, src: "/art/pastel-6.jpg", title: "Race Horses", artist: "Edgar Degas", date: "ca. 1885–88" },
  { id: 7, src: "/art/pastel-7.jpg", title: "Masquerade Portrait", artist: "Rosalba Carriera", date: "1730–31" },
  { id: 8, src: "/art/pastel-8.jpg", title: "At the Milliner's", artist: "Edgar Degas", date: "1882" },
  { id: 9, src: "/art/pastel-9.jpg", title: "Woman in Turkish Dress", artist: "Jean Etienne Liotard", date: "ca. 1748–52" },
  { id: 10, src: "/art/pastel-10.jpg", title: "Madame Arthur Fontaine", artist: "Odilon Redon", date: "1901" },
];

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function BuyMeACoffeeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 01-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 00-1.322-.238c-.826 0-1.491.284-2.26.613z" />
    </svg>
  );
}

function ThemeToggleBtn() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function LoginScreen({ signInGoogle }: LoginScreenProps) {
  // Rotates public domain pastel art on every refresh
  const [artIndex, setArtIndex] = useState(0);

  useEffect(() => {
    const rand = Math.floor(Math.random() * PASTEL_ARTWORKS.length);
    setArtIndex(rand);
  }, []);

  const currentArt = PASTEL_ARTWORKS[artIndex] || PASTEL_ARTWORKS[0];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground overflow-x-hidden">
      {/* ── 2/3 VISUAL BLOCK: Authentic Public Domain Pastel Masterpiece ── */}
      <div className="relative w-full lg:w-2/3 h-96 sm:h-[480px] lg:h-screen min-h-[440px] lg:min-h-screen overflow-hidden flex flex-col justify-end p-8 sm:p-12 lg:p-16 select-none shrink-0 bg-neutral-950">
        {/* Full Bleed Museum Pastel Artwork */}
        <img
          src={currentArt.src}
          alt={`${currentArt.title} by ${currentArt.artist}`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500"
        />

        {/* Gentle atmospheric shadow gradient concentrated only at the bottom for typography clarity */}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

        {/* The Thought / Quote: Positioned at bottom, clean sans font, subtle shadow */}
        <div className="relative z-20 max-w-2xl space-y-3">
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white leading-snug drop-shadow-md">
            “Resume creation is an art of seeking job.”
          </blockquote>

          <p className="text-sm font-medium text-white/90 drop-shadow-sm">
            r69shabh, 2026
          </p>
        </div>
      </div>

      {/* ── 1/3 SIGN-IN BLOCK: Minimalist Container with Google SSO ── */}
      <div className="w-full lg:w-1/3 min-h-[460px] lg:min-h-screen bg-background border-t lg:border-t-0 lg:border-l border-border flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Top Branding Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ResumayLogo size={36} />
            <span className="text-xl font-extrabold tracking-tight">resumay</span>
          </div>
          <ThemeToggleBtn />
        </div>

        {/* Center Sign In Action */}
        <div className="my-auto py-8 max-w-sm w-full mx-auto space-y-7">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Build your resume
            </h1>
          </div>

          {/* Simple Only Google Signup Option */}
          <div className="space-y-3">
            <Button
              size="lg"
              onClick={signInGoogle}
              className="w-full h-12 text-sm font-semibold gap-3 shadow-xs hover:shadow-md transition-all border border-border bg-card text-card-foreground hover:bg-muted/80 cursor-pointer"
            >
              <GoogleIcon className="h-5 w-5" />
              <span>Continue with Google</span>
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">
              Instant access • No password or credit card required
            </p>
          </div>

          {/* Value Highlights */}
          <div className="pt-6 border-t border-border/60 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>100% ATS-safe standard single-column structure</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Live side-by-side PDF preview via Tectonic engine</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Instant public share links & clean raw text copy</span>
            </div>
          </div>
        </div>

        {/* Footer Attribution & Social Links */}
        <div className="pt-6 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Made with <span className="text-red-500">❤️</span> by{" "}
            <a
              href="https://x.com/r69shabh"
              target="_blank"
              rel="noreferrer"
              className="text-foreground font-medium hover:underline"
            >
              @r69shabh
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            {/* GitHub Repo */}
            <a
              href="https://github.com/r69shabh/resumay"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="GitHub Repository"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com/r69shabh"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Follow on X"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Buy Me a Coffee Official Logo Button */}
            <a
              href="https://buymeacoffee.com/r69shabh"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#FFDD00] text-black hover:scale-110 active:scale-95 transition-all shadow-xs"
              title="Buy me a coffee"
            >
              <BuyMeACoffeeIcon className="h-4 w-4 fill-current" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
