export function formatMoney(amount: number, privacyMode: boolean = false): string {
  if (privacyMode) return 'S/ ••••••';
  return 'S/ ' + (amount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function maskRuc(ruc: string, privacyMode: boolean = false): string {
  if (!privacyMode || !ruc) return ruc || '—';
  if (ruc.length <= 4) return '••••';
  return ruc.substring(0, 2) + '••••••' + ruc.substring(ruc.length - 2);
}

export function maskPhone(phone: string, privacyMode: boolean = false): string {
  if (!privacyMode || !phone) return phone || '—';
  if (phone.length <= 3) return '••••';
  return phone.substring(0, 2) + '••••••' + phone.substring(phone.length - 2);
}

export function maskEmail(email: string, privacyMode: boolean = false): string {
  if (!privacyMode || !email) return email || '—';
  const parts = email.split('@');
  if (parts.length < 2) return '••••@••••.com';
  return parts[0].substring(0, 2) + '••••@' + parts[1];
}

export function maskAccount(account: string, privacyMode: boolean = false): string {
  if (!privacyMode || !account) return account || '—';
  if (account.length <= 4) return '••••';
  return account.substring(0, 3) + '••••••••' + account.slice(-2);
}

export function maskName(name: string, privacyMode: boolean = false): string {
  if (!privacyMode || !name) return name || '—';
  const words = name.split(' ');
  return words.map(w => w.length > 2 ? w[0] + '•••' : w).join(' ');
}
