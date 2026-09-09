// Structured resume data (source of truth for form mode) + one-way renderer to LaTeX.
// Users type normal text; we escape it and emit a disciplined single-column
// template (ATS-safe: real text, standard layout) compiled by Tectonic.

export type ResumeLink = { label: string; url: string };
export type EducationEntry = {
  school: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  grade: string;
};
export type ExperienceEntry = {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string; // one bullet per line
};
export type ProjectEntry = {
  name: string;
  tech: string;
  date: string;
  url: string;
  bullets: string; // one bullet per line
};
export type CertificateEntry = { name: string; issuer: string; date: string };
export type SkillGroup = { label: string; items: string };
export type ExtraEntry = { title: string; detail: string };

export type ResumeContent = {
  name: string;
  phone: string;
  email: string;
  location: string;
  links: ResumeLink[];
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  certificates: CertificateEntry[];
  skills: SkillGroup[];
  extra: ExtraEntry[];
};

export function defaultContent(): ResumeContent {
  return {
    name: "",
    phone: "",
    email: "",
    location: "",
    links: [],
    summary: "",
    education: [{ school: "", degree: "", location: "", start: "", end: "", grade: "" }],
    experience: [{ title: "", company: "", location: "", start: "", end: "", bullets: "" }],
    projects: [{ name: "", tech: "", date: "", url: "", bullets: "" }],
    certificates: [],
    skills: [{ label: "Languages", items: "" }],
    extra: [],
  };
}

// Merge stored JSON over defaults so old/partial rows still edit cleanly.
export function parseContent(json: unknown): ResumeContent {
  const d = defaultContent();
  if (!json || typeof json !== "object") return d;
  const j = json as Partial<ResumeContent>;
  return {
    ...d,
    ...j,
    links: Array.isArray(j.links) ? j.links : d.links,
    education: Array.isArray(j.education) && j.education.length ? j.education : d.education,
    experience: Array.isArray(j.experience) && j.experience.length ? j.experience : d.experience,
    projects: Array.isArray(j.projects) && j.projects.length ? j.projects : d.projects,
    certificates: Array.isArray(j.certificates) ? j.certificates : d.certificates,
    skills: Array.isArray(j.skills) && j.skills.length ? j.skills : d.skills,
    extra: Array.isArray(j.extra) ? j.extra : d.extra,
  };
}

const ESCAPES: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "&": "\\&",
  "%": "\\%",
  $: "\\$",
  "#": "\\#",
  _: "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

// Escape user text for LaTeX body text.
export function escapeLatex(s: string): string {
  return s.replace(/[\\&%$#_{}~^]/g, (c) => ESCAPES[c]);
}

// URLs go inside \href{...} nested in template macros: the outer macro tokenizes
// first, so % (comment), # (parameter) and & (alignment) must never reach TeX raw.
// hyperref converts \% \# \& back to URI chars. Verified against tectonic; _ and ~
// are safe raw. (encodeURI is wrong here — it injects % escapes that break.)
export function escapeUrl(u: string): string {
  return u.trim().replace(/[%#&]/g, (c) => `\\${c}`);
}

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim().replace(/^[-•*]\s+/, ""))
    .filter(Boolean);

const nonEmpty = (o: object) => Object.values(o).some((v) => String(v ?? "").trim() !== "");

export function renderLatex(c: ResumeContent): string {
  const contact: string[] = [];
  if (c.phone.trim()) contact.push(escapeLatex(c.phone.trim()));
  if (c.email.trim())
    contact.push(`\\href{mailto:${escapeUrl(c.email)}}{${escapeLatex(c.email.trim())}}`);
  if (c.location.trim()) contact.push(escapeLatex(c.location.trim()));
  for (const l of c.links) {
    if (!l.url.trim()) continue;
    const label = escapeLatex(l.label.trim() || l.url.trim());
    contact.push(`\\href{${escapeUrl(l.url)}}{${label}}`);
  }

  const edu = c.education.filter(nonEmpty);
  const exp = c.experience.filter(nonEmpty);
  const proj = c.projects.filter(nonEmpty);
  const certs = c.certificates.filter(nonEmpty);
  const skills = c.skills.filter((s) => s.label.trim() || s.items.trim());
  const extra = c.extra.filter(nonEmpty);

  const section = (title: string, body: string) =>
    body ? `%---------- ${title.toUpperCase()} ----------\n\\section{${title}}\n${body}\n` : "";

  const heading = `\\begin{center}\n  \\textbf{\\Huge \\scshape ${escapeLatex(c.name.trim() || "Your Name")}} \\\\ \\vspace{1pt}\n  \\small ${contact.join(" $|$ ")}\n\\end{center}\n`;

  const summary = c.summary.trim()
    ? `\\section{Professional Summary}\n${escapeLatex(c.summary.trim())}\n`
    : "";

  const education = edu.length
    ? `\\resumeSubHeadingListStart\n${edu
        .map((e) => {
          // ponytail: grade stays inline — `\\` would break the tabular row
          const degree = e.degree.trim() + (e.grade.trim() ? ` (Grade: ${e.grade.trim()})` : "");
          const dates = `${e.start.trim()}${e.start.trim() && e.end.trim() ? " -- " : ""}${e.end.trim()}`;
          return `  \\resumeSubheading\n    {${escapeLatex(e.school)}}{${escapeLatex(e.location)}}\n    {${escapeLatex(degree)}}{${escapeLatex(dates)}}`;
        })
        .join("\n")}\n\\resumeSubHeadingListEnd`
    : "";

  const experience = exp.length
    ? `\\resumeSubHeadingListStart\n${exp
        .map((e) => {
          const items = lines(e.bullets)
            .map((b) => `      \\resumeItem{${escapeLatex(b)}}`)
            .join("\n");
          return `  \\resumeSubheading\n    {${escapeLatex(e.title)}}{${escapeLatex(e.start)}${e.start && e.end ? " -- " : ""}${escapeLatex(e.end)}}\n    {${escapeLatex(e.company)}}{${escapeLatex(e.location)}}\n    \\resumeItemListStart\n${items}\n    \\resumeItemListEnd`;
        })
        .join("\n")}\n\\resumeSubHeadingListEnd`
    : "";

  const projects = proj.length
    ? `\\resumeSubHeadingListStart\n${proj
        .map((p) => {
          const items = lines(p.bullets)
            .map((b) => `      \\resumeItem{${escapeLatex(b)}}`)
            .join("\n");
          const link = p.url.trim() ? ` $|$ \\href{${escapeUrl(p.url)}}{Link}` : "";
          const tech = p.tech.trim() ? ` $|$ \\emph{${escapeLatex(p.tech)}}` : "";
          return `  \\resumeSubheading\n    {${escapeLatex(p.name)}${tech}${link}}{${escapeLatex(p.date)}}\n    {}{}\n    \\resumeItemListStart\n${items}\n    \\resumeItemListEnd`;
        })
        .join("\n")}\n\\resumeSubHeadingListEnd`
    : "";

  const skillBlock = skills.length
    ? `\\begin{itemize}[leftmargin=0.15in, label={}]\n  \\small{\\item{\n${skills.map((s) => `    \\textbf{${escapeLatex(s.label)}}{: ${escapeLatex(s.items)}} \\\\`).join("\n")}\n  }}\n\\end{itemize}`
    : "";

  const simpleList = (items: string[]) =>
    items.length
      ? `\\begin{itemize}[leftmargin=0.15in]\n${items.map((i) => `  \\item\\small{${i}}`).join("\n")}\n\\end{itemize}`
      : "";

  const certificates = simpleList(
    certs.map(
      (x) =>
        `\\textbf{${escapeLatex(x.name)}}${x.issuer.trim() ? ` -- ${escapeLatex(x.issuer)}` : ""}${x.date.trim() ? ` \\hfill ${escapeLatex(x.date)}` : ""}`,
    ),
  );

  const extraBlock = simpleList(
    extra.map(
      (x) =>
        `\\textbf{${escapeLatex(x.title)}}${x.detail.trim() ? `: ${escapeLatex(x.detail)}` : ""}`,
    ),
  );

  return `%------------------------ Resume ------------------------
% Generated from structured data. Edit via the form; raw edits live in the LaTeX tab.
\\documentclass[letterpaper,11pt]{article}

\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{enumitem}
\\usepackage{tabularx}
\\usepackage[usenames,dvipsnames]{color}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{-2pt}}}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
  \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{\\small#3} & \\textit{\\small #4} \\\\
  \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

${heading}
${summary}
${section("Education", education)}
${section("Experience", experience)}
${section("Projects", projects)}
${section("Technical Skills", skillBlock)}
${section("Certificates", certificates)}
${section("Extra Curricular", extraBlock)}
\\end{document}
`;
}

// Plain-text rendering for ATS consumption: linear, labeled, no markup.
// Used by the public share text view and /r/[slug]/text.
export function renderPlainText(c: ResumeContent): string {
  const out: string[] = [];
  if (c.name.trim()) out.push(c.name.trim());
  const contact = [
    c.phone.trim(),
    c.email.trim(),
    c.location.trim(),
    ...c.links.filter((l) => l.url.trim()).map((l) => (l.label.trim() ? `${l.label.trim()}: ${l.url.trim()}` : l.url.trim())),
  ].filter(Boolean);
  if (contact.length) out.push(contact.join(" | "));
  const block = (title: string, lines: string[]) => {
    if (lines.length) out.push("", title.toUpperCase(), ...lines);
  };
  if (c.summary.trim()) block("Professional Summary", [c.summary.trim()]);
  block(
    "Education",
    c.education.filter(nonEmpty).map((e) => {
      const head = [e.school.trim(), e.location.trim()].filter(Boolean).join(", ");
      const sub = [e.degree.trim(), [e.start.trim(), e.end.trim()].filter(Boolean).join(" -- ")]
        .filter(Boolean)
        .join(", ");
      return [head, sub + (e.grade.trim() ? ` (Grade: ${e.grade.trim()})` : "")]
        .filter(Boolean)
        .join("\n");
    }),
  );
  block(
    "Experience",
    c.experience.filter(nonEmpty).flatMap((e) => {
      const head = [e.title.trim(), e.company.trim()].filter(Boolean).join(" at ");
      const sub = [[e.start.trim(), e.end.trim()].filter(Boolean).join(" -- "), e.location.trim()]
        .filter(Boolean)
        .join(", ");
      return [
        [head, sub].filter(Boolean).join("\n"),
        ...lines(e.bullets).map((b) => `- ${b}`),
      ];
    }),
  );
  block(
    "Projects",
    c.projects.filter(nonEmpty).flatMap((p) => {
      const head = [[p.name.trim(), p.tech.trim()].filter(Boolean).join(" | "), p.date.trim()]
        .filter(Boolean)
        .join("\n");
      return [head, ...lines(p.bullets).map((b) => `- ${b}`)].filter(Boolean);
    }),
  );
  block(
    "Technical Skills",
    c.skills
      .filter((s) => s.label.trim() || s.items.trim())
      .map((s) => `${s.label.trim()}: ${s.items.trim()}`),
  );
  block(
    "Certificates",
    c.certificates
      .filter(nonEmpty)
      .map((x) => [x.name.trim(), [x.issuer.trim(), x.date.trim()].filter(Boolean).join(", ")].filter(Boolean).join(" - ")),
  );
  block(
    "Extra Curricular",
    c.extra
      .filter(nonEmpty)
      .map((x) => [x.title.trim(), x.detail.trim()].filter(Boolean).join(": ")),
  );
  return out.join("\n");
}

// schema.org/Person JSON-LD for structured consumers of the share page.
export function shareJsonLd(c: ResumeContent): object {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: c.name.trim() || undefined,
    email: c.email.trim() || undefined,
    telephone: c.phone.trim() || undefined,
    address: c.location.trim() || undefined,
    sameAs: c.links.map((l) => l.url.trim()).filter(Boolean),
    knowsAbout: c.skills.map((s) => s.items.trim()).filter(Boolean),
    alumniOf: c.education.map((e) => e.school.trim()).filter(Boolean),
  };
}
