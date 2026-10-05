import type { ResumeContent } from "./resume";
import { RESUME_TEMPLATES } from "./templates-data";

// Detects content still carrying our seeded sample data. A resume built from a
// template and barely edited looks complete and can score well, so shipping it
// sends a stranger's name, a fake phone number and example.com to a recruiter.
// We mark the samples as samples and warn before export rather than silently
// letting a 92/100 "pass" imply the document is ready to send.

export type SeedFinding = {
  field: string;
  value: string;
};

// Placeholder people from RESUME_TEMPLATES, derived rather than hand-listed so
// a newly added template can't ship an unflagged fake identity. Matched as a
// whole phrase, case-insensitively, so a real "Morgan" is not caught.
const SEED_NAMES = new Set(
  RESUME_TEMPLATES.map((t) => t.content.name.trim().toLowerCase()).filter(Boolean),
);

// Any @example.* address is reserved for docs, never deliverable.
const EXAMPLE_EMAIL = /@example\.(com|org|net|edu)\b/i;

// 555-01xx is the fictional-number block reserved for fiction. Our seeds use
// the 234-5678 family, but matching the whole reserved range is more durable.
const RESERVED_PHONE = /\b555[-.\s]?01\d{2}\b/;

const SEED_EMAIL_DOMAINS = /@(gmail|outlook|yahoo|hotmail|icloud|proton(mail)?)\.(com|me|net)\b/i;

const norm = (s: string) => s.trim().toLowerCase();

function seedName(name: string): boolean {
  return SEED_NAMES.has(norm(name));
}

// URLs the templates ship with: example.com hosts and the bare "yourhandle"
// style placeholders people forget to replace.
function seedUrl(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (/example\.(com|org|net)/i.test(u)) return true;
  return /\/(your|my|username|handle)[-a-z0-9]*$/i.test(u);
}

export function findSeedData(c: ResumeContent): SeedFinding[] {
  const out: SeedFinding[] = [];
  const add = (field: string, value: string) => {
    if (value.trim()) out.push({ field, value: value.trim() });
  };

  if (seedName(c.name)) add("Full name", c.name);
  if (EXAMPLE_EMAIL.test(c.email)) add("Email", c.email);
  else if (SEED_EMAIL_DOMAINS.test(c.email) && /^(alex|taylor|jordan|marcus|jonathan|elena|samira|david)\b/i.test(c.email)) {
    add("Email", c.email);
  }
  if (RESERVED_PHONE.test(c.phone)) add("Phone", c.phone);
  else if (/\b555\b/.test(c.phone)) add("Phone", c.phone);
  if (/\bSan Francisco, CA\b|\bBerkeley, CA\b|\bNew York, NY\b|\bAustin, TX\b/i.test(c.location)) {
    add("Location", c.location);
  }
  for (const l of c.links ?? []) {
    if (seedUrl(l.url)) add(l.label || "Link", l.url);
  }
  for (const e of c.experience) {
    if (seedName(e.company)) add("Company", e.company);
  }
  return out;
}

// Empty required-ish fields: present in the layout but never filled in. These
// are the ones that print as blank space or get read as an omission.
export function findEmptyFields(c: ResumeContent): string[] {
  const out: string[] = [];
  if (!c.name.trim()) out.push("Full name");
  if (!c.email.trim()) out.push("Email");
  if (!c.phone.trim()) out.push("Phone");
  const hasExp = c.experience.some((e) => e.company.trim() || e.title.trim());
  if (!hasExp) out.push("Any work experience");
  const hasEdu = c.education.some((e) => e.school.trim() || e.degree.trim());
  if (!hasEdu) out.push("Any education");
  return out;
}

export type ExportPreflight = {
  seed: SeedFinding[];
  empty: string[];
  // One line per thing to fix, ready to show in a confirm dialog.
  messages: string[];
};

export function preflightExport(c: ResumeContent): ExportPreflight {
  const seed = findSeedData(c);
  const empty = findEmptyFields(c);
  const messages: string[] = [];
  if (seed.length) {
    const shown = seed.slice(0, 4).map((s) => `${s.field} (${s.value})`).join(", ");
    const more = seed.length > 4 ? ` +${seed.length - 4} more` : "";
    messages.push(`Sample data still in: ${shown}${more}.`);
  }
  if (empty.length) {
    messages.push(`Still empty: ${empty.join(", ")}.`);
  }
  return { seed, empty, messages };
}
