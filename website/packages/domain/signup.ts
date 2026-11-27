/** UI preview only. Real enrollment requires a server, verification, consent and rate limits. */
export const callingCodes = [
  { id: 'US', label: 'United States', prefix: '+1' },
  { id: 'CA', label: 'Canada', prefix: '+1' },
  { id: 'GB', label: 'United Kingdom', prefix: '+44' },
  { id: 'AE', label: 'United Arab Emirates', prefix: '+971' },
  { id: 'JO', label: 'Jordan', prefix: '+962' },
  { id: 'DE', label: 'Germany', prefix: '+49' },
] as const;
export type CountryId = typeof callingCodes[number]['id'];
export const samplePhone = '202 555 0111';
export function validatePreviewPhone(phone: string, country: CountryId): string | null {
  if (!phone.trim()) return 'Enter a number, or use the sample number below.';
  if (!/^[\d\s().-]+$/.test(phone)) return 'Use digits only, with spaces, dashes or parentheses if needed.';
  const digits = phone.replace(/\D/g, '');
  const callingCode = callingCodes.find(item => item.id === country);
  if (!callingCode) return 'Choose a country calling code.';
  const internationalLength = digits.length + callingCode.prefix.length - 1;
  if (internationalLength < 7 || internationalLength > 15) return 'Check the number length. Use 7–15 digits including the country code.';
  if ((country === 'US' || country === 'CA') && digits.length !== 10) return 'Use a 10-digit number after +1.';
  return null;
}
export function canPreviewMessage(message: string): boolean {
  return message.trim().length > 0 && message.trim().length <= 280;
}
