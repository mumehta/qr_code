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

export function getContent(data: QRInputData): string {
  if (data.tab === 'URL') {
    let u = data.url.trim();
    if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }
  if (data.tab === 'Text') {
    return data.text.trim();
  }
  if (data.tab === 'Contact') {
    const { name, org, phone, email } = data.contact;
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
  }
  return '';
}

export function isValid(data: QRInputData): boolean {
  return getContent(data).length > 0;
}
