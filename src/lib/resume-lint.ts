// Resume checklist derived from campus placement feedback: one page, evidence
// over adjectives, quantified + bolded impact, dedicated achievements, working
// links, no skill ratings. Pure function so it can run in the editor and tests.

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
    "refactored,integrated,configured,monitored,analyzed,analysed,modelled,modeled,orchestrated,automate,drafted," +
    "containerised,containerized,utilised,utilized,prioritised,prioritized,organised,organized,recognised,recognized," +
    "centralised,centralized,visualised,visualized,standardised,standardized,specialised,specialized,minimised,maximised"
  ).split(","),
);

const GENERIC = /^(worked on|worked with|responsible for|helped (on|with)?|assisted|was involved in|involved in|participated in|part of|contributed to|tasked with|focused on|helped)\b/i;

const hasNumber = (s: string) => /\d/.test(s);

export function lintResume(c: ResumeContent, pages: number | null): LintReport {
  const issues: LintIssue[] = [];
  const add = (severity: LintSeverity, id: string, title: string, detail: string) =>
    issues.push({ id, severity, title, detail });

  const exp = c.experience.filter((e) => Object.values(e).some((v) => String(v).trim()));
  const proj = c.projects.filter((p) => Object.values(p).some((v) => String(v).trim()));
  const ach = (c.achievements ?? []).filter((a) => a.title.trim() || a.detail.trim());
  const edu = c.education.filter((e) => Object.values(e).some((v) => String(v).trim()));
  const allBullets = [...exp.flatMap((e) => bulletLines(e.bullets)), ...proj.flatMap((p) => bulletLines(p.bullets))];

  // Format
  if (pages != null && pages > 1) {
    add("error", "pages", `Resume spills onto ${pages} pages`, "Every resume in the reference set was exactly one page. Use Tighten to fit, then cut the lowest-value bullet.");
  }
  if (c.summary.trim()) {
    add("warn", "summary", "Professional summary present", "Campus reviews call generic summaries filler. Cut it unless every line is a specific, defensible claim.");
  }

  // Header
  const linkText = c.links.map((l) => `${l.label} ${l.url}`.toLowerCase());
  const has = (needle: string) => linkText.some((t) => t.includes(needle));
  if (!has("linkedin")) add("error", "linkedin", "No LinkedIn link", "LinkedIn is expected in the header of every technical resume.");
  if (!has("github")) add("error", "github", "No GitHub link", "Recruiters click through to an active GitHub profile before the first interview.");
  if (!has("leetcode") && !has("codeforces") && !has("codechef") && !has("portfolio")) {
    add("info", "coding", "No coding profile or portfolio", "A LeetCode / Codeforces profile or a live portfolio gives instant verifiable proof.");
  }
  if (!c.phone.trim()) add("warn", "phone", "No phone number", "Header should carry a reachable phone number.");
  if (!c.email.trim()) add("warn", "email", "No email", "Header should carry an email address.");
  if (c.links.some((l) => l.label.trim() && !l.url.trim())) {
    add("error", "brokenlink", "A link has no URL", "Dead or empty links are an instant credibility hit. Fill the URL or remove the row.");
  }

  // Education
  if (!edu.length) add("error", "education", "No education entry", "Campus resumes lead with degree, institution, year and CGPA.");
  if (edu.some((e) => !e.grade.trim())) {
    add("warn", "cgpa", "An education row has no score", "Show CGPA / percentage for every qualification you list.");
  }
  if (!edu.some((e) => /class\s*(x|xii|10|12)/i.test(`${e.degree} ${e.school}`))) {
    add("info", "school", "No Class XII / X rows", "Campus checklists expect Class XII and Class X with board, year and marks.");
  }

  // Evidence
  if (!exp.length && !proj.length) {
    add("error", "evidence", "No experience or projects", "A resume needs evidence: internships, projects or open source.");
  }
  if (!exp.length) add("info", "noexp", "No internships listed", "If you have none yet, lead harder with projects and achievements.");
  if (proj.length > 3) add("warn", "projects", `${proj.length} projects listed`, "Keep 2-3 genuinely strong projects; depth beats count.");
  if (proj.some((p) => !p.tech.trim())) {
    add("warn", "tech", "A project has no tech stack", "Name the stack against the project so reviewers see it twice.");
  }
  if (proj.some((p) => !p.url.trim())) {
    add("warn", "projectlink", "A project has no link", "Add a GitHub or live demo link for every project.");
  }

  // Bullets
  for (const e of exp) {
    const n = bulletLines(e.bullets).length;
    if (n > 4) add("warn", "bullets", `${e.company || "An internship"} has ${n} bullets`, "Cap at 4 bullets, strongest impact first.");
  }
  for (const p of proj) {
    const n = bulletLines(p.bullets).length;
    if (n > 4) add("warn", "bullets", `${p.name || "A project"} has ${n} bullets`, "Cap at 4 bullets, strongest impact first.");
  }
  const unquantified = allBullets.filter((b) => !hasNumber(b)).length;
  if (unquantified > 0) {
    add("warn", "quantify", `${unquantified} bullet${unquantified > 1 ? "s have" : " has"} no number`, "Quantify impact: %, ms, users, requests, revenue, team size. Metrics are auto-bolded in the PDF.");
  }
  const generic = allBullets.filter((b) => GENERIC.test(b));
  if (generic.length) {
    add("error", "generic", `${generic.length} generic bullet${generic.length > 1 ? "s" : ""}`, "Replace \"worked on / responsible for\" with what you built and the measurable result.");
  }
  const noVerb = allBullets.filter((b) => !ACTION_VERBS.has(b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "")));
  if (noVerb.length) {
    add("info", "verb", `${noVerb.length} bullet${noVerb.length > 1 ? "s don't" : " doesn't"} start with an action verb`, "Formula: action verb -> what you built -> technical complexity -> measurable impact.");
  }
  const verbCounts = new Map<string, number>();
  for (const b of allBullets) {
    const v = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
    if (ACTION_VERBS.has(v)) verbCounts.set(v, (verbCounts.get(v) ?? 0) + 1);
  }
  for (const [verb, n] of verbCounts) {
    if (n >= 3) add("warn", "repeat", `"${verb}" starts ${n} bullets`, "Vary impact verbs: Built, Engineered, Designed, Automated, Reduced, Scaled, Shipped.");
  }

  // Skills
  if (c.skills.some((s) => /[★☆]|\b\d\s*\/\s*5\b|\b\d{1,3}\s*%/.test(s.items))) {
    add("warn", "ratings", "Skill ratings found", "Never rate skills (Python ★★★★★). List only what you can defend in an interview.");
  }

  // Achievements
  if (!ach.length) {
    add("warn", "achievements", "No achievements section", "CP ratings, ICPC ranks, hackathons and open source belong in a dedicated Achievements section, not buried in extracurriculars.");
  } else if (ach.some((a) => !hasNumber(`${a.title} ${a.detail}`))) {
    add("info", "achmetrics", "An achievement has no rank or number", "Quantify the denominator: ranked 31 among 1,200+ teams.");
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warns = issues.filter((i) => i.severity === "warn").length;
  const infos = issues.filter((i) => i.severity === "info").length;
  const score = Math.max(0, Math.min(100, 100 - errors * 12 - warns * 5 - infos * 1));

  return { score, issues, passed: Math.max(0, 19 - issues.length), total: 19 };
}
