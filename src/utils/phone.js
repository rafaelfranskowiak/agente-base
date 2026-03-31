export function cleanPhone(phone) {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/\D/g, '');
  return cleaned;
}

export function formatToWaha(phone) {
  const cleaned = cleanPhone(phone);
  if (!cleaned.endsWith('@c.us') && !cleaned.endsWith('@s.whatsapp.net')) {
    return `${cleaned}@c.us`;
  }
  return cleaned;
}
