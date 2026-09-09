"use client";

import { useEffect, useState } from "react";

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
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 2600);
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
          className="rounded-full bg-black px-4 py-2 text-sm text-white shadow-lg dark:bg-white dark:text-black"
        >
          {i.message}
        </div>
      ))}
    </div>
  );
}
