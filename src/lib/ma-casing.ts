/**
 * Viết hoa chữ cái theo locale vi (tiếng Việt); số và ký tự khác giữ nguyên.
 * Dùng cho ô mã (Mã BV, Mã CSKCB, mã khoa phòng) — thường gọi onBlur và trước khi gửi API.
 */
export function normalizeMaLettersUppercase(value: string): string {
  return String(value ?? '').toLocaleUpperCase('vi-VN');
}
