// Malawi phone numbers in international format: +265 followed by 9 digits starting with 8 or 9
export const MALAWI_PHONE_PATTERN = /^\+265[89]\d{8}$/;
export const MALAWI_PHONE_ERROR = "Enter a valid Malawi number (e.g. +265991234567).";


export function toMalawiPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  // Already has country code digits: 265XXXXXXXXX (12 digits)
  if (digits.startsWith("265") && digits.length === 12) return `+${digits}`;
  // Local format: 0XXXXXXXXX (10 digits)
  if (digits.startsWith("0") && digits.length === 10) return `+265${digits.slice(1)}`;
  // 9 significant digits starting with 8 or 9
  if ((digits.startsWith("8") || digits.startsWith("9")) && digits.length === 9) return `+265${digits}`;

  // Partial / in-progress input — return as a partial +265 string so the
  // input field can display what the user has typed so far
  if (digits.startsWith("265")) return `+${digits}`;
  if (digits.startsWith("0")) return `+265${digits.slice(1)}`;
  if (digits.length > 0) return `+265${digits}`;
  return "";
}

export function isValidMalawiPhone(value: string): boolean {
  return MALAWI_PHONE_PATTERN.test(toMalawiPhone(value));
}

/** Returns the +265XXXXXXXXX form for display / submission. */
export function formatMalawiPhone(value?: string | null): string {
  if (!value) return "";
  const intl = toMalawiPhone(value);
  return MALAWI_PHONE_PATTERN.test(intl) ? intl : value;
}
