// Guards the trust-related invariants that are easy to regress silently:
//   1. every shipped template is recognisable as sample data,
//   2. a genuinely personalised resume is NOT flagged,
//   3. a template full of placeholders can no longer score like a finished doc.
//
// Plain asserts, no test framework: run with `npm run verify`.
import {
  findSeedData,
  findEmptyFields,
  preflightExport,
} from "../src/lib/example-data.ts";
import { lintResume } from "../src/lib/resume-lint.ts";
import { RESUME_TEMPLATES } from "../src/lib/templates-data.ts";
import { defaultContent, parseContent } from "../src/lib/resume.ts";

let failures = 0;
function check(cond, msg) {
  if (cond) {
    console.log(`  ok   ${msg}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${msg}`);
  }
}

console.log("\nsample-data detection");
for (const t of RESUME_TEMPLATES) {
  if (t.id === "blank") continue;
  const n = findSeedData(t.content).length;
  check(n > 0, `template "${t.id}" is flagged (${n} findings)`);
}

console.log("\nno false positives");
const blank = defaultContent();
check(findSeedData(blank).length === 0, "empty resume is not flagged as sample data");
check(findEmptyFields(blank).length > 0, "empty resume reports missing fields");

const real = parseContent({
  ...blank,
  name: "Priya Raghunathan",
  email: "priya.raghunathan@gmail.com",
  phone: "+44 7700 900461",
  location: "Bengaluru, India",
  links: [{ label: "GitHub", url: "https://github.com/priyar" }],
  experience: [
    {
      title: "Site Reliability Engineer",
      company: "Razorpay",
      location: "Bengaluru",
      start: "2022",
      end: "Present",
      bullets: "Cut p99 latency 40% by rewriting the routing layer.",
    },
  ],
  education: [
    { school: "IISc", degree: "BE", location: "Bengaluru", start: "2016", end: "2020", grade: "" },
  ],
});
check(findSeedData(real).length === 0, "real resume is not flagged");
check(preflightExport(real).messages.length === 0, "real resume passes export preflight");

console.log("\nplaceholders cannot look finished");
const pm = RESUME_TEMPLATES.find((t) => t.id === "pm");
if (pm) {
  const report = lintResume(pm.content, 1, pm.traits);
  check(
    report.issues.some((i) => i.id === "seed"),
    "placeholder template trips the sample-data check",
  );
  check(report.score < 92, `placeholder score penalised (${report.score} < 92)`);
}

console.log(
  failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
