"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Bug,
  FileText,
  HelpCircle,
  Search,
  ExternalLink,
  Mail,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

export type SuggestionItem = {
  id: string;
  type: "feature" | "template" | "bug" | "other" | string;
  message: string;
  contact: string;
  createdAt: string;
};

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  feature: {
    label: "Feature",
    icon: <Sparkles className="h-3 w-3" />,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  template: {
    label: "Template",
    icon: <FileText className="h-3 w-3" />,
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  bug: {
    label: "Bug",
    icon: <Bug className="h-3 w-3" />,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  other: {
    label: "Other",
    icon: <HelpCircle className="h-3 w-3" />,
    badgeClass: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  },
};

export function SuggestionsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [query, setQuery] = useState("");

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suggestions");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.suggestions)) {
          setItems(data.suggestions);
        }
      }
    } catch (e) {
      console.error("Failed to load suggestions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void loadSuggestions();
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesQuery =
        !query.trim() ||
        item.message.toLowerCase().includes(query.toLowerCase()) ||
        item.contact.toLowerCase().includes(query.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [items, filterType, query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-2xl text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">User Suggestions</h3>
                <Badge variant="secondary" className="text-xs">
                  {items.length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Feedback and template requests submitted by users
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSuggestions}
              disabled={loading}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar: Filters and Search */}
        <div className="flex flex-col gap-2.5 border-b border-border/60 px-6 py-3 sm:flex-row sm:items-center sm:justify-between bg-muted/20">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: "all", label: "All" },
              { id: "feature", label: "💡 Feature" },
              { id: "template", label: "📄 Template" },
              { id: "bug", label: "🐛 Bug" },
              { id: "other", label: "💬 Other" },
            ].map((tab) => {
              const active = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-56">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search feedback…"
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border/50">
          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <p className="mt-3 text-xs">Loading suggestions…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 stroke-1 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium">No suggestions found</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                {items.length === 0
                  ? "Suggestions submitted via the floating box will appear here."
                  : "No suggestions match the selected filter."}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
              const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const isEmail = item.contact.includes("@");
              const isTwitter = item.contact.startsWith("@") || item.contact.includes("twitter.com") || item.contact.includes("x.com");
              const cleanTwitter = item.contact.replace(/^@/, "").replace(/https?:\/\/(twitter|x)\.com\//, "");

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-2 select-text">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.badgeClass}`}
                      >
                        {cfg.icon}
                        <span>{cfg.label}</span>
                      </span>
                      {item.contact && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>from</span>
                          {isEmail ? (
                            <a
                              href={`mailto:${item.contact}`}
                              className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
                            >
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{item.contact}</span>
                            </a>
                          ) : isTwitter ? (
                            <a
                              href={`https://x.com/${cleanTwitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
                            >
                              <span>@{cleanTwitter}</span>
                              <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                            </a>
                          ) : (
                            <span className="font-medium text-foreground">{item.contact}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <time className="text-[11px] text-muted-foreground shrink-0 font-mono">
                      {dateStr}
                    </time>
                  </div>

                  <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-3 border border-border/50">
                    {item.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/80 px-6 py-3 text-xs text-muted-foreground bg-muted/20">
          <span>
            Showing <strong className="text-foreground">{filtered.length}</strong> of{" "}
            <strong className="text-foreground">{items.length}</strong> suggestions
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="h-7 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
