// Plain-English explanations for common Tectonic/XeTeX failures.
// Parses the raw log tail the compiler returns; each hint optionally carries
// the source line the engine was reading (the `l.42` marker).

export type LatexHint = {
  title: string;
  detail: string;
  line?: number;
};

function sourceLine(log: string, fromIndex: number): number | undefined {
  const tail = log.slice(fromIndex, fromIndex + 400);
  const m = tail.match(/\bl\.(\d{1,5})\b/);
  return m ? Number(m[1]) : undefined;
}

export function explainLatexLog(rawLog: string): LatexHint[] {
  const log = rawLog || "";
  const hints: LatexHint[] = [];
  const seen = new Set<string>();
  const push = (key: string, h: LatexHint) => {
    if (!seen.has(key)) {
      seen.add(key);
      hints.push(h);
    }
  };

  let m: RegExpExecArray | null;

  const missingItem = /Something's wrong--perhaps a missing \\item/.exec(log);
  if (missingItem) {
    push("item", {
      title: "A list has no items in it",
      detail:
        "Somewhere a bullet or entry list starts but contains no \\item. In the form editor this happens with hand-edited LaTeX; generated resumes never emit empty lists. Add a bullet or remove the empty list.",
      line: sourceLine(log, missingItem.index),
    });
  }

  const alignTab = /Misplaced alignment tab character &/.exec(log);
  if (alignTab) {
    push("amp", {
      title: "Unescaped & in your text",
      detail:
        "LaTeX reads & as a table column separator. Write \\& instead. The form editor escapes this for you automatically.",
      line: sourceLine(log, alignTab.index),
    });
  }

  const undefRe = /Undefined control sequence\.?\s*\n?.{0,120}?\\([a-zA-Z@]+)/g;
  while ((m = undefRe.exec(log)) !== null) {
    push(`undef:${m[1]}`, {
      title: `Unknown command \\${m[1]}`,
      detail:
        "This command isn't defined — usually a typo, or a package that isn't loaded. If you typed it by hand, check the spelling against the template preamble.",
      line: sourceLine(log, m.index),
    });
    if (hints.length > 4) break;
  }

  const mathRe = /Missing \$ inserted/.exec(log);
  if (mathRe) {
    push("math", {
      title: "A character that needs math mode",
      detail:
        "Characters like _, ^ or $ outside math mode trigger this. In normal text write \\_, \\^ and \\$ — the form editor handles this automatically.",
      line: sourceLine(log, mathRe.index),
    });
  }

  const braceRe = /Missing \} inserted|Too many \}'s|Extra \}, or forgotten/.exec(log);
  if (braceRe) {
    push("brace", {
      title: "Mismatched curly braces",
      detail:
        "An opening { is missing its closing partner (or vice versa). Check the line reported and count the braces.",
      line: sourceLine(log, braceRe.index),
    });
  }

  const envRe = /\\begin\{([^}]*)\}.*?ended by \\end\{([^}]*)\}|LaTeX Error: \\begin\{[^}]*\} on input line \d+ ended by/.exec(
    log,
  );
  if (envRe) {
    push("env", {
      title: "Mismatched environments",
      detail: `A \\begin{${envRe[1] || "…"}} block isn't closed with the matching \\end. Every opened environment must close in reverse order.`,
      line: sourceLine(log, envRe.index),
    });
  }

  const pkgRe = /(?:! LaTeX Error: File `([^']+)' not found|! Package \S+ Error: [^\n]*)/.exec(log);
  if (pkgRe) {
    push("pkg", {
      title: pkgRe[1] ? `Missing file: ${pkgRe[1]}` : "A package failed to load",
      detail:
        "The compiler can't fetch something the document asks for. Stick to the packages in the starter template — arbitrary \\usepackage lines may not resolve offline.",
      line: sourceLine(log, pkgRe.index),
    });
  }

  const errRe = /! ([^\n]{4,160})/.exec(log);
  if (errRe && hints.length === 0) {
    push("generic", {
      title: errRe[1].trim(),
      detail: "The full log below has the surrounding lines — the reported line number is where the engine gave up, so look just above it.",
      line: sourceLine(log, errRe.index),
    });
  }

  return hints;
}
