export type QRTab = 'URL' | 'Text' | 'Contact';

export interface ContactData {
  name: string;
  org: string;
  phone: string;
  email: string;
}

export type QRInputData =
  | { tab: 'URL'; url: string }
  | { tab: 'Text'; text: string }
  | { tab: 'Contact'; contact: ContactData };

// Escapes characters that have special meaning in vCard 3.0 property values.
function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

export function getContent(data: QRInputData): string {
  if (data.tab === 'URL') {
    let u = data.url.trim();
    // Only prepend https:// if the value has no scheme at all (e.g. ftp:// is left untouched).
    if (u && !/^[a-z][a-z0-9+\-.]*:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }
  if (data.tab === 'Text') {
    return data.text.trim();
  }
  if (data.tab === 'Contact') {
    const { name, org, phone, email } = data.contact;
    const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    // Only emit a field line if the value is non-empty — empty lines confuse some scanners.
    if (name.trim()) lines.push(`FN:${escapeVCard(name.trim())}`);
    if (org.trim()) lines.push(`ORG:${escapeVCard(org.trim())}`);
    if (phone.trim()) lines.push(`TEL:${escapeVCard(phone.trim())}`);
    if (email.trim()) lines.push(`EMAIL:${escapeVCard(email.trim())}`);
    lines.push('END:VCARD');
    return lines.join('\n');
  }
  return '';
}

// Returns a short human-readable label for display in history.
export function getLabel(data: QRInputData): string {
  if (data.tab === 'URL') return data.url.trim().slice(0, 40);
  if (data.tab === 'Text') return data.text.trim().slice(0, 40);
  if (data.tab === 'Contact') {
    const { name, org, phone, email } = data.contact;
    const first = [name, org, phone, email].find((v) => v.trim());
    return (first ?? 'Contact').trim().slice(0, 40);
  }
  return '';
}

export function isValid(data: QRInputData): boolean {
  if (data.tab === 'Contact') {
    // Require at least one non-empty contact field — the vCard template alone is not valid.
    const { name, org, phone, email } = data.contact;
    return [name, org, phone, email].some((v) => v.trim().length > 0);
  }
  return getContent(data).length > 0;
}
