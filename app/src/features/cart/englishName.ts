/** The English part of a multi-language name ("అల్లం | Allam | Ginger" → "Ginger"); the whole name if none. */
export function englishName(name: string): string {
  const parts = name.split('|').map((s) => s.trim()).filter(Boolean);
  const english = [...parts].reverse().find((s) => /^[ -~]+$/.test(s));
  return english ?? parts[0] ?? name;
}
