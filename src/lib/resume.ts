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
export type AchievementEntry = { title: string; detail: string };

export type ResumeSectionId =
  | "summary"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "achievements"
  | "certificates"
  | "extra";

export type TemplateConfig = {
  templateId?: string;
  fontFamily?: "serif" | "sans";
  headerLayout?: "center" | "left" | "split";
  headerSubtitle?: string;
  sectionOrder?: ResumeSectionId[];
  accent?: string;
  density?: "comfortable" | "compact";
};

export type ResumeContent = {
  template?: string;
  templateConfig?: TemplateConfig;
  name: string;
  phone: string;
  email: string;
  location: string;
  links: ResumeLink[];
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  achievements: AchievementEntry[];
  certificates: CertificateEntry[];
  skills: SkillGroup[];
  extra: ExtraEntry[];
};

export const DEFAULT_TEMPLATE_CONFIGS: Record<
  string,
  {
    templateId: string;
    fontFamily: "serif" | "sans";
    headerLayout: "center" | "left" | "split";
    sectionOrder: ResumeSectionId[];
    headerSubtitle: string;
    accent: string;
    density: "comfortable" | "compact";
  }
> = {
  swe: {
    templateId: "swe",
    density: "comfortable",
    accent: "000000",
    fontFamily: "serif",
    headerLayout: "center",
    sectionOrder: ["experience", "projects", "achievements", "skills", "education", "certificates", "extra"],
    headerSubtitle: "",
  },
  fullstack: {
    templateId: "fullstack",
    density: "comfortable",
    accent: "1D4ED8",
    fontFamily: "sans",
    headerLayout: "left",
    sectionOrder: ["summary", "experience", "projects", "achievements", "skills", "education", "certificates", "extra"],
    headerSubtitle: "Full-Stack Software Engineer",
  },
  aiml: {
    templateId: "aiml",
    density: "comfortable",
    accent: "0E7490",
    fontFamily: "sans",
    headerLayout: "left",
    sectionOrder: ["summary", "achievements", "skills", "experience", "projects", "education", "extra", "certificates"],
    headerSubtitle: "AI & Machine Learning Specialist",
  },
  pm: {
    templateId: "pm",
    density: "comfortable",
    accent: "6D28D9",
    fontFamily: "sans",
    headerLayout: "left",
    sectionOrder: ["summary", "achievements", "skills", "experience", "projects", "education", "certificates", "extra"],
    headerSubtitle: "Senior Technical Product Manager",
  },
  finance: {
    templateId: "finance",
    density: "comfortable",
    accent: "000000",
    fontFamily: "serif",
    headerLayout: "center",
    sectionOrder: ["education", "experience", "achievements", "skills", "certificates", "extra", "projects"],
    headerSubtitle: "",
  },
  consulting: {
    templateId: "consulting",
    density: "comfortable",
    accent: "334155",
    fontFamily: "sans",
    headerLayout: "left",
    sectionOrder: ["summary", "experience", "achievements", "education", "skills", "certificates", "extra"],
    headerSubtitle: "Management Consultant | Strategy & Operations",
  },
  newgrad: {
    templateId: "newgrad",
    density: "comfortable",
    accent: "000000",
    fontFamily: "serif",
    headerLayout: "center",
    sectionOrder: ["education", "achievements", "projects", "experience", "skills", "extra", "certificates"],
    headerSubtitle: "",
  },
  compact: {
    templateId: "compact",
    density: "comfortable",
    accent: "047857",
    fontFamily: "sans",
    headerLayout: "split",
    sectionOrder: ["skills", "experience", "projects", "achievements", "education", "certificates", "extra"],
    headerSubtitle: "Software Engineer",
  },
  campus: {
    templateId: "campus",
    fontFamily: "serif",
    headerLayout: "center",
    sectionOrder: ["education", "experience", "projects", "achievements", "skills", "certificates", "extra"],
    headerSubtitle: "",
    accent: "000000",
    density: "compact",
  },
  blank: {
    templateId: "blank",
    density: "comfortable",
    accent: "000000",
    fontFamily: "serif",
    headerLayout: "center",
    sectionOrder: ["education", "experience", "projects", "achievements", "skills", "certificates", "extra"],
    headerSubtitle: "",
  },
};

export function getResolvedTemplateConfig(c: ResumeContent): {
  templateId: string;
  fontFamily: "serif" | "sans";
  headerLayout: "center" | "left" | "split";
  sectionOrder: ResumeSectionId[];
  headerSubtitle: string;
  accent: string;
  density: "comfortable" | "compact";
} {
  const tid = c.template || c.templateConfig?.templateId || "swe";
  const def = DEFAULT_TEMPLATE_CONFIGS[tid] || DEFAULT_TEMPLATE_CONFIGS.swe;
  return {
    templateId: tid,
    fontFamily: c.templateConfig?.fontFamily || def.fontFamily,
    headerLayout: c.templateConfig?.headerLayout || def.headerLayout,
    accent: c.templateConfig?.accent || def.accent || "000000",
    density: c.templateConfig?.density || "comfortable",
    headerSubtitle:
      c.templateConfig?.headerSubtitle !== undefined
        ? c.templateConfig.headerSubtitle
        : def.headerSubtitle,
    sectionOrder:
      c.templateConfig?.sectionOrder && c.templateConfig.sectionOrder.length
        ? c.templateConfig.sectionOrder
        : def.sectionOrder,
  };
}

export function defaultContent(): ResumeContent {
  return {
    template: "swe",
    name: "",
    phone: "",
    email: "",
    location: "",
    links: [],
    summary: "",
    education: [{ school: "", degree: "", location: "", start: "", end: "", grade: "" }],
    experience: [{ title: "", company: "", location: "", start: "", end: "", bullets: "" }],
    projects: [{ name: "", tech: "", date: "", url: "", bullets: "" }],
    achievements: [],
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
    template: typeof j.template === "string" ? j.template : d.template,
    templateConfig:
      j.templateConfig && typeof j.templateConfig === "object" ? j.templateConfig : d.templateConfig,
    links: Array.isArray(j.links) ? j.links : d.links,
    education: Array.isArray(j.education) && j.education.length ? j.education : d.education,
    experience: Array.isArray(j.experience) && j.experience.length ? j.experience : d.experience,
    projects: Array.isArray(j.projects) && j.projects.length ? j.projects : d.projects,
    achievements: Array.isArray(j.achievements) ? j.achievements : d.achievements,
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
    .map((l) => l.trim().replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

const nonEmpty = (o: object) => Object.values(o).some((v) => String(v ?? "").trim() !== "");

// A section with nothing in it should not take up space in the editor or the
// PDF — the renderer already skips empty bodies, this is the shared test.
export function sectionHasContent(c: ResumeContent, id: ResumeSectionId): boolean {
  switch (id) {
    case "summary":
      return !!c.summary.trim();
    case "education":
      return c.education.some(nonEmpty);
    case "experience":
      return c.experience.some(nonEmpty);
    case "projects":
      return c.projects.some(nonEmpty);
    case "skills":
      return c.skills.some((s) => s.label.trim() || s.items.trim());
    case "achievements":
      return (c.achievements ?? []).some(nonEmpty);
    case "certificates":
      return c.certificates.some(nonEmpty);
    case "extra":
      return c.extra.some(nonEmpty);
  }
}

// Bold the things recruiters scan for: explicit **highlights**, plus metrics
// (35%, 240ms, 10K+, 2.1M, 12x) which placement feedback says are always missed.
const METRIC = /(\d+(?:\.\d+)?\s?(?:%|ms|sec|s|x|×|[KkMmBb]\+?|\+))/g;

export function richText(s: string): string {
  return s
    .split(/(\*\*[^*\n]+\*\*)/g)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return `\\textbf{${escapeLatex(part.slice(2, -2).trim())}}`;
      }
      return part
        .split(METRIC)
        .map((token, i) => (i % 2 ? `\\textbf{${escapeLatex(token)}}` : escapeLatex(token)))
        .join("");
    })
    .join("");
}

const TITLE_OVERRIDES: Record<string, Partial<Record<ResumeSectionId, string>>> = {
  swe: {
    experience: "Experience",
    projects: "Projects",
    skills: "Technical Skills",
    education: "Education",
  },
  fullstack: {
    summary: "Professional Summary",
    experience: "Work Experience",
    projects: "Key Projects",
    skills: "Technical Skills",
    education: "Education",
  },
  aiml: {
    summary: "Professional Summary",
    skills: "Core Technical Skills and Tooling",
    experience: "Work and Research Experience",
    projects: "Key Systems and Projects",
    education: "Education",
    extra: "Publications and Competitions",
  },
  pm: {
    summary: "Executive Summary",
    skills: "Core Competencies and Leadership",
    experience: "Professional Experience",
    projects: "Strategic Initiatives",
    certificates: "Certifications",
    education: "Education",
  },
  finance: {
    education: "Education",
    experience: "Investment Banking Experience",
    skills: "Financial and Analytical Skills",
    certificates: "Licenses and Certifications",
    extra: "Leadership and Honors",
  },
  consulting: {
    summary: "Executive Summary",
    experience: "Management Consulting Experience",
    education: "Education",
    skills: "Core Competencies and Tools",
    extra: "Honors and Extracurricular Leadership",
  },
  newgrad: {
    education: "Education and Academic Honors",
    projects: "Technical Projects and Hackathons",
    experience: "Work and Internship Experience",
    skills: "Skills and Relevant Coursework",
    extra: "Leadership and Activities",
  },
  campus: {
    education: "Education",
    experience: "Internships",
    projects: "Projects",
    achievements: "Achievements",
    skills: "Technical Skills",
    certificates: "Certifications",
    extra: "Positions of Responsibility",
  },
  compact: {
    skills: "Technical Skills",
    experience: "Experience",
    projects: "Projects",
    education: "Education",
  },
};

export function renderLatex(c: ResumeContent): string {
  const config = getResolvedTemplateConfig(c);
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

  const nameStr = escapeLatex(c.name.trim() || "Your Name");
  const subStr = config.headerSubtitle ? escapeLatex(config.headerSubtitle) : "";

  // Per-template accent as rgb triple for the stock `color` package
  // (no xcolor dependency, so the offline serverless bundle is untouched).
  const accentHex = /^[0-9a-fA-F]{6}$/.test(config.accent) ? config.accent : "000000";
  const accentRgb = [0, 2, 4]
    .map((i) => (parseInt(accentHex.slice(i, i + 2), 16) / 255).toFixed(3))
    .join(",");
  const nameColored = `{\\color{accent}${nameStr}}`;

  // Dynamic Header layout
  let heading = "";
  if (config.headerLayout === "left") {
    heading = `\\begin{flushleft}
  {\\Huge\\bfseries ${nameColored}}${subStr ? ` \\\\ \\vspace{1pt}{\\small\\textit{${subStr}}}` : ""} \\\\ \\vspace{2pt}
  \\small ${contact.join(" $|$ ")}
\\end{flushleft}
\\vspace{-4pt}
`;
  } else if (config.headerLayout === "split") {
    const half = Math.ceil(contact.length / 2);
    const row1 = contact.slice(0, half).join(" $|$ ");
    const row2 = contact.slice(half).join(" $|$ ");
    heading = `\\noindent
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  \\begin{tabular}[b]{@{}l@{}}
    {\\Huge\\bfseries ${nameColored}} \\\\
    ${subStr ? `\\textit{\\small ${subStr}} \\\\` : ""}
  \\end{tabular}
  &
  \\begin{tabular}[b]{@{}r@{}}
    ${row1 ? `${row1} \\\\` : ""}
    ${row2}
  \\end{tabular}
\\end{tabular*}
\\vspace{-2pt}
`;
  } else {
    // Default: centered classic Jake's style
    heading = `\\begin{center}
  \\textbf{\\Huge \\scshape ${nameColored}} \\\\ \\vspace{1pt}
  \\small ${contact.join(" $|$ ")}
\\end{center}
`;
  }

  const edu = c.education.filter(nonEmpty);
  const exp = c.experience.filter(nonEmpty);
  const proj = c.projects.filter(nonEmpty);
  const certs = c.certificates.filter(nonEmpty);
  const skills = c.skills.filter((s) => s.label.trim() || s.items.trim());
  const extra = c.extra.filter(nonEmpty);
  const achievements = (c.achievements ?? []).filter(nonEmpty);

  const section = (title: string, body: string) =>
    body ? `%---------- ${title.toUpperCase()} ----------\n\\section{${escapeLatex(title)}}\n${body}\n` : "";

  const summary = c.summary.trim() ? `${richText(c.summary.trim())}\n` : "";

  const education = edu.length
    ? `\\resumeSubHeadingListStart\n${edu
        .map((e) => {
          const degree = e.degree.trim() + (e.grade.trim() ? ` (Grade: ${e.grade.trim()})` : "");
          const dates = `${e.start.trim()}${e.start.trim() && e.end.trim() ? " -- " : ""}${e.end.trim()}`;
          return `  \\resumeSubheading\n    {${escapeLatex(e.school)}}{${escapeLatex(e.location)}}\n    {${escapeLatex(degree)}}{${escapeLatex(dates)}}`;
        })
        .join("\n")}\n\\resumeSubHeadingListEnd`
    : "";

  const experience = exp.length
    ? `\\resumeSubHeadingListStart\n${exp
        .map((e) => {
          const bulletLines = lines(e.bullets);
          const itemList = bulletLines.length
            ? `\n    \\resumeItemListStart\n${bulletLines
                .map((b) => `      \\resumeItem{${richText(b)}}`)
                .join("\n")}\n    \\resumeItemListEnd`
            : "";
          return `  \\resumeSubheading\n    {${escapeLatex(e.title)}}{${escapeLatex(e.start)}${e.start && e.end ? " -- " : ""}${escapeLatex(e.end)}}\n    {${escapeLatex(e.company)}}{${escapeLatex(e.location)}}${itemList}`;
        })
        .join("\n")}\n\\resumeSubHeadingListEnd`
    : "";

  const projects = proj.length
    ? `\\resumeSubHeadingListStart\n${proj
        .map((p) => {
          const bulletLines = lines(p.bullets);
          const link = p.url.trim() ? ` $|$ \\href{${escapeUrl(p.url)}}{Link}` : "";
          const tech = p.tech.trim() ? ` $|$ \\textbf{${richText(p.tech)}}` : "";
          const itemList = bulletLines.length
            ? `\n    \\resumeItemListStart\n${bulletLines
                .map((b) => `      \\resumeItem{${richText(b)}}`)
                .join("\n")}\n    \\resumeItemListEnd`
            : "";
          return `  \\resumeSubheading\n    {${escapeLatex(p.name)}${tech}${link}}{${escapeLatex(p.date)}}\n    {}{}${itemList}`;
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
        `\\textbf{${escapeLatex(x.title)}}${x.detail.trim() ? ` -- ${richText(x.detail)}` : ""}`,
    ),
  );

  const achievementsBlock = simpleList(
    achievements.map(
      (x) =>
        `\\textbf{${escapeLatex(x.title)}}${x.detail.trim() ? ` -- ${richText(x.detail)}` : ""}`,
    ),
  );

  const sectionBodies: Record<ResumeSectionId, { defaultTitle: string; body: string }> = {
    summary: { defaultTitle: "Professional Summary", body: summary },
    education: { defaultTitle: "Education", body: education },
    experience: { defaultTitle: "Experience", body: experience },
    projects: { defaultTitle: "Projects", body: projects },
    achievements: { defaultTitle: "Achievements", body: achievementsBlock },
    skills: { defaultTitle: "Technical Skills", body: skillBlock },
    certificates: { defaultTitle: "Certificates", body: certificates },
    extra: { defaultTitle: "Extra Curricular", body: extraBlock },
  };

  const renderedSections: string[] = [];
  const handled = new Set<string>();

  for (const secId of config.sectionOrder) {
    handled.add(secId);
    const item = sectionBodies[secId];
    if (!item || !item.body.trim()) continue;
    const title = TITLE_OVERRIDES[config.templateId]?.[secId] || item.defaultTitle;
    renderedSections.push(section(title, item.body));
  }

  // Any remaining populated sections not in custom order
  for (const [secId, item] of Object.entries(sectionBodies) as [
    ResumeSectionId,
    { defaultTitle: string; body: string },
  ][]) {
    if (!handled.has(secId) && item.body.trim()) {
      const title = TITLE_OVERRIDES[config.templateId]?.[secId] || item.defaultTitle;
      renderedSections.push(section(title, item.body));
    }
  }

  // Compact density reuses the compact template's tighter page box.
  const tightBox = config.templateId === "compact" || config.density === "compact";
  const secPad = config.density === "compact" ? "-6pt" : "-4pt";
  const itemPad = config.density === "compact" ? "-3pt" : "-2pt";
  const listPad = config.density === "compact" ? "-7pt" : "-5pt";
  const subPad = config.density === "compact" ? "-9pt" : "-7pt";

  const marginSetup =
    tightBox
      ? `\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.6in}
\\addtolength{\\textwidth}{1.2in}
\\addtolength{\\topmargin}{-.6in}
\\addtolength{\\textheight}{1.2in}`
      : config.fontFamily === "sans"
      ? `\\addtolength{\\oddsidemargin}{-0.45in}
\\addtolength{\\evensidemargin}{-0.45in}
\\addtolength{\\textwidth}{0.9in}
\\addtolength{\\topmargin}{-.45in}
\\addtolength{\\textheight}{0.9in}`
      : `\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}`;

  const titleFormat =
    config.fontFamily === "sans"
      ? `\\titleformat{\\section}{
  \\vspace{${secPad}}\\bfseries\\raggedright\\large
}{}{0em}{}[\\color{accent}\\titlerule \\vspace{-5pt}]`
      : `\\titleformat{\\section}{
  \\vspace{${secPad}}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{accent}\\titlerule \\vspace{-5pt}]`;

  const fontPkg =
    config.fontFamily === "sans"
      ? `\\usepackage[T1]{fontenc}
\\usepackage[scaled=0.92]{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}`
      : "";

  return `%------------------------ Resume ------------------------
% Template: ${config.templateId} | Layout: ${config.headerLayout} | Font: ${config.fontFamily}
\\documentclass[letterpaper,11pt]{article}

\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{enumitem}
\\usepackage{tabularx}
\\usepackage[usenames,dvipsnames]{color}
\\definecolor{accent}{rgb}{${accentRgb}}
${fontPkg}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
${marginSetup}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

${titleFormat}

\\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{${itemPad}}}}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
  \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{\\small#3} & \\textit{\\small #4} \\\\
  \\end{tabular*}\\vspace{${subPad}}
}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{${listPad}}}

\\begin{document}

${heading}
${renderedSections.join("\n")}
\\end{document}
`;
}

// Plain-text rendering for ATS consumption: linear, labeled, no markup.
// Used by the public share text view and /r/[slug]/text.
export function renderPlainText(c: ResumeContent): string {
  const config = getResolvedTemplateConfig(c);
  const out: string[] = [];
  if (c.name.trim()) out.push(c.name.trim());
  if (config.headerSubtitle) out.push(config.headerSubtitle);
  const contact = [
    c.phone.trim(),
    c.email.trim(),
    c.location.trim(),
    ...c.links
      .filter((l) => l.url.trim())
      .map((l) => (l.label.trim() ? `${l.label.trim()}: ${l.url.trim()}` : l.url.trim())),
  ].filter(Boolean);
  if (contact.length) out.push(contact.join(" | "));

  const edu = c.education.filter(nonEmpty);
  const exp = c.experience.filter(nonEmpty);
  const proj = c.projects.filter(nonEmpty);
  const certs = c.certificates.filter(nonEmpty);
  const skills = c.skills.filter((s) => s.label.trim() || s.items.trim());
  const extra = c.extra.filter(nonEmpty);
  const achievements = (c.achievements ?? []).filter(nonEmpty);

  const plainBlocks: Record<ResumeSectionId, { defaultTitle: string; lines: string[] }> = {
    summary: {
      defaultTitle: "Professional Summary",
      lines: c.summary.trim() ? [c.summary.trim()] : [],
    },
    education: {
      defaultTitle: "Education",
      lines: edu.map((e) => {
        const head = [e.school.trim(), e.location.trim()].filter(Boolean).join(", ");
        const sub = [e.degree.trim(), [e.start.trim(), e.end.trim()].filter(Boolean).join(" -- ")]
          .filter(Boolean)
          .join(", ");
        return [head, sub + (e.grade.trim() ? ` (Grade: ${e.grade.trim()})` : "")]
          .filter(Boolean)
          .join("\n");
      }),
    },
    experience: {
      defaultTitle: "Experience",
      lines: exp.flatMap((e) => {
        const head = [e.title.trim(), e.company.trim()].filter(Boolean).join(" at ");
        const sub = [[e.start.trim(), e.end.trim()].filter(Boolean).join(" -- "), e.location.trim()]
          .filter(Boolean)
          .join(", ");
        return [
          [head, sub].filter(Boolean).join("\n"),
          ...lines(e.bullets).map((b) => `- ${b}`),
        ];
      }),
    },
    projects: {
      defaultTitle: "Projects",
      lines: proj.flatMap((p) => {
        const head = [[p.name.trim(), p.tech.trim()].filter(Boolean).join(" | "), p.date.trim()]
          .filter(Boolean)
          .join("\n");
        return [head, ...lines(p.bullets).map((b) => `- ${b}`)].filter(Boolean);
      }),
    },
    achievements: {
      defaultTitle: "Achievements",
      lines: achievements.map((x) => [x.title.trim(), x.detail.trim()].filter(Boolean).join(": ")),
    },
    skills: {
      defaultTitle: "Technical Skills",
      lines: skills.map((s) => `${s.label.trim()}: ${s.items.trim()}`),
    },
    certificates: {
      defaultTitle: "Certificates",
      lines: certs.map((x) =>
        [x.name.trim(), [x.issuer.trim(), x.date.trim()].filter(Boolean).join(", ")]
          .filter(Boolean)
          .join(" - ")
      ),
    },
    extra: {
      defaultTitle: "Extra Curricular",
      lines: extra.map((x) => [x.title.trim(), x.detail.trim()].filter(Boolean).join(": ")),
    },
  };

  const handled = new Set<string>();
  const addBlock = (title: string, lns: string[]) => {
    if (lns.length) out.push("", title.toUpperCase(), ...lns);
  };

  for (const secId of config.sectionOrder) {
    handled.add(secId);
    const item = plainBlocks[secId];
    if (!item || !item.lines.length) continue;
    const title = TITLE_OVERRIDES[config.templateId]?.[secId] || item.defaultTitle;
    addBlock(title, item.lines);
  }

  for (const [secId, item] of Object.entries(plainBlocks) as [
    ResumeSectionId,
    { defaultTitle: string; lines: string[] },
  ][]) {
    if (!handled.has(secId) && item.lines.length) {
      const title = TITLE_OVERRIDES[config.templateId]?.[secId] || item.defaultTitle;
      addBlock(title, item.lines);
    }
  }

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
