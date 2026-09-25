// Universal resume quality checks. Deliberately audience-agnostic: the same
// rules apply to a student, a PM and a staff engineer. Rules cover things that
// are wrong for everyone (generic bullets, unquantified claims, dead links,
// skill ratings) rather than any one hiring style.

import type { ResumeContent } from "./resume";

export type LintSeverity = "error" | "warn" | "info";

export type LintIssue = {
  id: string;
  severity: LintSeverity;
  title: string;
  detail: string;
};

export type LintReport = {
  score: number;
  issues: LintIssue[];
  passed: number;
  total: number;
};

const bulletLines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim().replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

const ACTION_VERBS = new Set(
  (
    "built,engineered,designed,automated,optimised,optimized,implemented,spearheaded,reduced,scaled,launched,deployed," +
    "migrated,improved,delivered,created,developed,led,architected,shipped,accelerated,cut,increased,eliminated,rebuilt," +
    "refactored,integrated,configured,monitored,analyzed,analysed,modelled,modeled,orchestrated,drafted," +
    "containerised,containerized,utilised,utilized,prioritised,prioritized,organised,organized,recognised,recognized," +
    "centralised,centralized,visualised,visualized,standardised,standardized,specialised,specialized,minimised,maximised," +
    "owned,drove,grew,generated,launched,negotiated,published,presented,mentored,coached,chaired,resolved,forecasted"
  ).split(","),
);

const GENERIC = /^(worked on|worked with|responsible for|helped (on|with)?|assisted|was involved in|involved in|participated in|part of|contributed to|tasked with|focused on|helped)\b/i;

const hasNumber = (s: string) => /\d/.test(s);

export function lintResume(c: ResumeContent, pages: number | null): LintReport {
  const issues: LintIssue[] = [];
  let total = 0;
  const check = (ok: boolean, severity: LintSeverity, id: string, title: string, detail: string) => {
    total += 1;
    if (!ok) issues.push({ id, severity, title, detail });
  };

  const exp = c.experience.filter((e) => Object.values(e).some((v) => String(v).trim()));
  const proj = c.projects.filter((p) => Object.values(p).some((v) => String(v).trim()));
  const edu = c.education.filter((e) => Object.values(e).some((v) => String(v).trim()));
  const skills = c.skills.filter((s) => s.label.trim() || s.items.trim());
  const bullets = [
    ...exp.flatMap((e) => bulletLines(e.bullets).map((b) => ({ b, where: e.company || e.title }))),
    ...proj.flatMap((p) => bulletLines(p.bullets).map((b) => ({ b, where: p.name }))),
  ];

  // Length
  check(
    pages == null || pages <= 1,
    "warn",
    "pages",
    pages && pages > 1 ? `Resume runs to ${pages} pages` : "Resume length",
    "One page is the norm. Two pages is usually only worth it for senior candidates with deep experience — otherwise tighten or cut.",
  );

  // Contact
  check(!!c.name.trim(), "error", "name", "No name", "The header needs your full name.");
  check(!!c.phone.trim(), "warn", "phone", "No phone number", "Add a phone number recruiters can call.");
  check(
    !!c.email.trim(),
    "warn",
    "email",
    "No email",
    "Add an email address. A professional or college-domain address reads better than a personal one.",
  );
  const broken = c.links.filter((l) => l.label.trim() && !l.url.trim());
  check(
    broken.length === 0,
    "error",
    "brokenlink",
    broken.length > 1 ? `${broken.length} links have no URL` : "A link has no URL",
    "Empty link rows look unfinished and some reviewers treat them as broken. Fill the URL or remove the row.",
  );
  check(
    c.links.filter((l) => l.url.trim()).length > 0,
    "info",
    "nolinks",
    "No profile or portfolio links",
    "LinkedIn, GitHub or a portfolio give reviewers somewhere to go after reading the resume.",
  );

  // Evidence
  check(
    exp.length + proj.length > 0,
    "error",
    "evidence",
    "No experience or projects",
    "A resume needs evidence of work. Add at least one role, internship or project.",
  );
  check(
    exp.length > 0 || proj.length > 0,
    "info",
    "volume",
    exp.length + proj.length <= 2 ? "Very little experience listed" : "Experience looks healthy",
    "One or two entries is fine early on, but reviewers look for a pattern. Add anything substantial you've shipped.",
  );

  // Bullets
  const generic = bullets.filter(({ b }) => GENERIC.test(b));
  check(
    generic.length === 0,
    "error",
    "generic",
    generic.length > 1
      ? `${generic.length} bullets describe duties instead of outcomes`
      : "A bullet describes duties instead of outcomes",
    'Replace "worked on" / "responsible for" with what you built, how, and what changed. Example: "Built X in Y, cutting Z by 35%."',
  );

  const unquantified = bullets.filter(({ b }) => !hasNumber(b));
  check(
    unquantified.length === 0,
    "warn",
    "quantify",
    unquantified.length > 1
      ? `${unquantified.length} bullets have no measurable result`
      : "A bullet has no measurable result",
    "Add scale or impact where it's true: %, ms, users, requests, revenue, team size, volume. Metrics are auto-bolded in the PDF.",
  );

  const verbose = bullets.filter(({ b }) => b.length > 200);
  check(
    verbose.length === 0,
    "info",
    "longbullet",
    verbose.length > 1 ? `${verbose.length} bullets are very long` : "A bullet is very long",
    "Bullets longer than two lines get skimmed. Split the detail or cut it to the outcome.",
  );

  for (const group of [
    ...exp.map((e) => ({ label: e.company || e.title, n: bulletLines(e.bullets).length })),
    ...proj.map((p) => ({ label: p.name, n: bulletLines(p.bullets).length })),
  ]) {
    if (group.n > 5) {
      check(
        false,
        "info",
        "bulletcount",
        `${group.label} has ${group.n} bullets`,
        "Keep the strongest 4–5 and let the rest go. Reviewers rarely read further.",
      );
    } else {
      check(true, "info", "bulletcount", "bullet count", "");
    }
  }

  const weakOpeners = bullets.filter(({ b }) => !ACTION_VERBS.has(b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "")));
  check(
    weakOpeners.length === 0,
    "info",
    "verb",
    weakOpeners.length > 1
      ? `${weakOpeners.length} bullets don't open with a strong verb`
      : "A bullet doesn't open with a strong verb",
    "Start with Built, Reduced, Led, Designed, Automated, Scaled — it sets the tone for the whole line.",
  );

  const verbCounts = new Map<string, number>();
  for (const { b } of bullets) {
    const v = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
    if (ACTION_VERBS.has(v)) verbCounts.set(v, (verbCounts.get(v) ?? 0) + 1);
  }
  const repeated = [...verbCounts.entries()].filter(([, n]) => n >= 3);
  check(
    repeated.length === 0,
    "warn",
    "repeat",
    repeated.length
      ? `Same opening verb ${repeated.length > 1 ? "repeats" : "repeats"}: ${repeated.map(([v]) => `“${v}”`).join(", ")}`
      : "repeated verbs",
    "Vary your openers so the page doesn't read as a list. Swap in Built, Engineered, Designed, Reduced, Scaled, Shipped.",
  );

  // Sections
  check(
    edu.length > 0,
    "warn",
    "education",
    "No education entry",
    "Degree, institution and year are expected on most resumes, even for self-taught candidates.",
  );
  const vagueEdu = edu.filter((e) => !e.end.trim() && !e.start.trim());
  check(
    vagueEdu.length === 0,
    "info",
    "edudates",
    vagueEdu.length ? "An education entry has no dates" : "education dates",
    "Graduation years help reviewers place your experience in time.",
  );

  check(
    proj.length <= 5,
    "info",
    "projectcount",
    `${proj.length} projects listed`,
    "Depth beats count. Keep the ones you'd happily defend in a follow-up question.",
  );
  check(
    !proj.some((p) => p.name.trim() && !p.url.trim()),
    "info",
    "projectlink",
    "A project has no link",
    "A repo or demo link is the fastest proof the work is real.",
  );

  check(
    skills.length <= 7,
    "info",
    "skillgroups",
    `${skills.length} skill categories`,
    "Long lists dilute the signal. Group by what the role actually needs.",
  );
  check(
    !skills.some((s) => /[★☆]|\b\d\s*\/\s*5\b|\b\d{1,3}\s*%/.test(s.items)),
    "warn",
    "ratings",
    "Skill ratings found",
    "Rating yourself (Python ★★★★★) reads as padding. List skills plainly and let your bullets prove depth.",
  );

  const summaryWords = c.summary.trim() ? c.summary.trim().split(/\s+/).length : 0;
  check(
    summaryWords <= 60,
    "info",
    "summary",
    summaryWords > 60 ? `Summary runs ${summaryWords} words` : "summary length",
    "Summaries are skimmed or skipped. Keep it to 2–3 specific lines, or cut it and lead with your strongest signal.",
  );

  const errors = issues.filter((i) => i.severity === "error").length;
  const warns = issues.filter((i) => i.severity === "warn").length;
  const infos = issues.filter((i) => i.severity === "info").length;
  const score = Math.max(0, Math.min(100, 100 - errors * 14 - warns * 6 - infos * 2));

  return { score, issues, passed: total - issues.length, total };
}
