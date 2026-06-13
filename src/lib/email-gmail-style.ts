/**
 * Kiểm tra email bắt buộc + định dạng tương thích quy ước Gmail (địa chỉ @gmail.com hoặc domain khác cùng kiểu local).
 *
 * Local part: chữ Latin không dấu, số, dấu chấm (.), dấu cộng (+) cho plus-addressing;
 * không bắt đầu/kết thúc bằng `.` hoặc `+`, không có `..`.
 * Domain: nhãn chuẩn + TLD ≥ 2 ký tự.
 */
export const GMAIL_STYLE_EMAIL_INVALID_MESSAGE =
  'Email là bắt buộc. Nhập đúng định dạng (ví dụ: ten.nguoi@gmail.com): chỉ chữ không dấu, số, dấu chấm và dấu +; không bắt đầu/kết thúc bằng dấu chấm; không hai dấu chấm liên tiếp.';

const LOCAL_MAX = 64;
const DOMAIN_MAX = 255;
/** Tổng độ dài tối đa theo RFC 5321/5322 thực tế hay dùng */
const ADDR_MAX = 254;

function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > DOMAIN_MAX) return false;
  if (!domain.includes('.')) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
  for (const label of labels) {
    if (!label.length || label.length > 63) return false;
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label)) return false;
  }
  return true;
}

/** Local part kiểu Gmail / Google Account (bản rút gọn, đủ cho UI). */
function isValidGmailLocalPart(local: string): boolean {
  if (!local.length || local.length > LOCAL_MAX) return false;
  if (local.startsWith('.') || local.endsWith('.')) return false;
  if (local.startsWith('+') || local.endsWith('+')) return false;
  if (local.includes('..')) return false;
  if (!/^[a-zA-Z0-9.+]+$/.test(local)) return false;
  return true;
}

export function isValidGmailStyleEmail(raw: string): boolean {
  const s = raw.trim();
  if (!s.length || s.length > ADDR_MAX) return false;
  const at = s.indexOf('@');
  if (at <= 0) return false;
  if (s.indexOf('@', at + 1) >= 0) return false;
  const local = s.slice(0, at);
  const domain = s.slice(at + 1).trim();
  if (!isValidGmailLocalPart(local) || !isValidDomain(domain)) return false;
  return true;
}
