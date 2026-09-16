"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquarePlus, X, Send, Check, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/Toaster";

type FeedbackType = "feature" | "template" | "bug" | "other";

export function SuggestionBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("feature");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast("Please enter your suggestion or feedback.");
      return;
    }

    setSubmitting(true);
    try {
      // Store in localStorage for client persistence
      const prev = JSON.parse(localStorage.getItem("resumay_user_feedback") || "[]");
      prev.push({
        type,
        message: message.trim(),
        contact: contact.trim(),
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("resumay_user_feedback", JSON.stringify(prev));

      // Attempt sending to api/suggestions endpoint if available
      try {
        await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, message, contact }),
        });
      } catch {
        // Safe to ignore if offline or running in mock
      }

      setSubmitted(true);
      toast("Thank you for your suggestion!");
    } catch {
      toast("Failed to record suggestion.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setMessage("");
    setContact("");
    setSubmitted(false);
  };

  return (
    <div ref={boxRef} className="fixed bottom-5 right-5 z-40 select-none">
      {/* Expanded Floating Modal / Popover */}
      {isOpen && (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-foreground">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Give Suggestion</h4>
                <p className="text-[10px] text-muted-foreground">Help make resumay better</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {submitted ? (
            <div className="py-4 text-center space-y-3 animate-in zoom-in-95">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Check className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-foreground">Thank you for your feedback!</h5>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed px-2">
                  Your suggestions directly shape upcoming templates and features.
                </p>
              </div>

              {/* Creator connect box */}
              <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 text-left text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                  <span className="font-medium text-foreground">Connect with the creator</span>
                </div>
                <p className="text-muted-foreground text-[10px]">
                  Have more questions or ideas? Reach out on X or GitHub:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="https://x.com/r69shabh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>@r69shabh</span>
                  </a>
                  <a
                    href="https://github.com/r69shabh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://buymeacoffee.com/r69shabh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                  >
                    <span>☕ Buy Coffee</span>
                  </a>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={resetForm} className="h-7 text-xs">
                  Send another
                </Button>
                <Button size="sm" onClick={() => setIsOpen(false)} className="h-7 text-xs">
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              {/* Type selector pills */}
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    { id: "feature", label: "💡 Feature" },
                    { id: "template", label: "📄 Template" },
                    { id: "bug", label: "🐛 Bug" },
                    { id: "other", label: "💬 Other" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all cursor-pointer ${
                      type === t.id
                        ? "bg-foreground text-background shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Message text area */}
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === "template"
                      ? "e.g. Add a Law / Medical template or more financial modeling formats..."
                      : type === "bug"
                      ? "Describe what happened and what device or browser you're using..."
                      : "Share your ideas on how to make resumay even better..."
                  }
                  rows={3}
                  className="w-full resize-none rounded-md border border-input bg-background/80 p-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              {/* Contact info (optional) */}
              <div>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Your email or X handle (optional)"
                  className="h-8 text-xs placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Submit button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground">
                  Direct to <span className="font-medium text-foreground">@r69shabh</span>
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !message.trim()}
                  className="h-7 gap-1.5 px-3 text-xs"
                >
                  <Send className="h-3 w-3" />
                  <span>{submitting ? "Sending..." : "Submit"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((o) => !o);
          if (!isOpen) setSubmitted(false);
        }}
        className={`group flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3.5 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm transition-all hover:border-foreground/40 hover:bg-card hover:shadow-xl cursor-pointer ${
          isOpen ? "ring-2 ring-ring ring-offset-1" : ""
        }`}
      >
        <MessageSquarePlus className="h-4 w-4 text-foreground/80 group-hover:scale-110 transition-transform" />
        <span>Give suggestion</span>
      </button>
    </div>
  );
}
