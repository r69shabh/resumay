"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>("resumay-toast", { detail: message }));
}

type Item = { id: number; message: string };
let nextId = 0;

export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const id = ++nextId;
      setItems((prev) => [...prev.slice(-2), { id, message: (e as CustomEvent<string>).detail }]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 2800);
    };
    window.addEventListener("resumay-toast", onToast);
    return () => window.removeEventListener("resumay-toast", onToast);
  }, []);

  if (items.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {items.map((i) => (
        <div
          key={i.id}
          className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>{i.message}</span>
        </div>
      ))}
    </div>
  );
}
