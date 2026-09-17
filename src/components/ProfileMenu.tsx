"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Moon, Sun } from "lucide-react";

export type ProfileUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  picture?: string | null;
  avatar_url?: string | null;
};

function ThemeRow() {
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
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={toggle}
      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      <span className="flex-1 text-left">Dark mode</span>
      <span
        className={`flex h-4 w-7 items-center rounded-full px-0.5 transition-colors ${
          dark ? "justify-end bg-foreground" : "justify-start bg-muted"
        }`}
      >
        <span className="h-3 w-3 rounded-full bg-background shadow-xs" />
      </span>
    </button>
  );
}

export default function ProfileMenu({
  user,
  onSignOut,
  menuExtras,
}: {
  user: ProfileUser;
  onSignOut: () => void;
  menuExtras?: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const photo = user.image || user.picture || user.avatar_url || null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-border transition-all hover:ring-2 hover:ring-ring"
        title={user.email ?? "Profile"}
      >
        {photo ? (
          <img
            src={photo}
            alt={user.name || user.email || "Profile"}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-semibold uppercase text-foreground">
            {user.name?.[0] || user.email?.[0] || "U"}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-in fade-in zoom-in-95 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-lg">
            <div className="mb-1 border-b px-2.5 py-2">
              {user.name && (
                <p className="truncate text-xs font-semibold">{user.name}</p>
              )}
              <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
            </div>
            {menuExtras?.(() => setOpen(false))}
            <ThemeRow />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-md border-t px-2 py-1.5 pt-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
