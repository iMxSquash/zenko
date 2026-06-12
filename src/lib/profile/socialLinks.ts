export const SOCIAL_URL_PATTERNS = {
  linkedin: /^https:\/\/([\w-]+\.)?linkedin\.com\/.+/i,
  instagram: /^https:\/\/(www\.)?instagram\.com\/.+/i,
  twitter: /^https:\/\/(www\.)?(twitter|x)\.com\/.+/i,
  doctolib: /^https:\/\/(www\.)?doctolib\.fr\/.+/i,
} as const;

export function assertValidSocialUrl(
  value: string,
  platform: keyof typeof SOCIAL_URL_PATTERNS,
  label: string
): void {
  if (!value) return;
  if (!SOCIAL_URL_PATTERNS[platform].test(value)) {
    throw new Error(`Lien ${label} invalide.`);
  }
}
