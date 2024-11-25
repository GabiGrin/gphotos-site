export function slugify(title: string) {
  return title
    .replace(/ /g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}
