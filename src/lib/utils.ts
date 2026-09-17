export { cn } from "cn"

// Download filename from the resume title ("Backend Engineer" -> "backend-engineer.pdf").
export function downloadFileName(title: string, fallback: string, ext: string): string {
  const base =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;
  return `${base}.${ext}`;
}
