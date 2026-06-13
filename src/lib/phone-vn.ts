/**
 * Chuẩn hóa nhập SĐT Việt Nam: chỉ giữ chữ số, tối đa 10 ký tự (định dạng hiện tại: 10 số).
 */
export function sanitizeVnPhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10);
}

/** Rỗng được coi là hợp lệ (trường tùy chọn). Có nhập thì phải đúng 10 số. */
export function isValidVnPhoneOptional(digits: string): boolean {
  const d = sanitizeVnPhoneDigits(digits);
  if (d.length === 0) return true;
  return d.length === 10;
}

/** Bắt buộc: đúng 10 chữ số. */
export function isValidVnPhoneRequired(digits: string): boolean {
  return sanitizeVnPhoneDigits(digits).length === 10;
}

export const VN_PHONE_INVALID_MESSAGE =
  'Số ĐT (10 chữ số).';
