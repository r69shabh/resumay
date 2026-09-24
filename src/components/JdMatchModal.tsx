"use client";

import { useState } from "react";
import { X, Target } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { analyzeGaps, type GapResult } from "@/lib/jd-gaps";

export default function JdMatchModal({
  resumeText,
  onClose,
}: {
  resumeText: string;
  onClose: () => void;
}) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<GapResult | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Target className="h-3.5 w-3.5" />
              Job-description match
            </h2>
            <p className="text-xs text-muted-foreground">
              Keywords in the posting missing from your resume
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          rows={5}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the job description here…"
          className="mt-4 font-mono text-xs"
        />
        <Button
          size="sm"
          disabled={jd.trim().length < 20}
          onClick={() => setResult(analyzeGaps(jd, resumeText))}
          className="mt-2"
        >
          Analyze gaps
        </Button>

        {result && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Keyword coverage</span>
              <span className="font-semibold">
                {Math.round(result.coverage * 100)}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.round(result.coverage * 100)}%` }}
              />
            </div>
            {result.missing.length > 0 ? (
              <>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.missing.map((m) => (
                    <span
                      key={m.term}
                      className="rounded-full border border-dashed px-2 py-0.5 text-[11px] text-foreground"
                      title={`Appears ${m.count}× in the posting`}
                    >
                      {m.term}
                      {m.count > 1 && (
                        <span className="ml-1 text-muted-foreground">×{m.count}</span>
                      )}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  Add these where truthful — preferably inside experience bullets
                  with numbers. Single words only, not phrases.
                </p>
              </>
            ) : (
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                No gaps found — your resume covers the posting&apos;s distinctive keywords.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
