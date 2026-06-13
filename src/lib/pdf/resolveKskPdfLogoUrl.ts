/**
 * Logo PDF KSK: ưu tiên `explicit`, sau đó NEXT_PUBLIC_LOGO, NEXT_PUBLIC_THONG_TIN_LOGO.
 * Giá trị rỗng hoặc `NULL` (không phân biệt hoa thường) → bỏ qua và dùng ứng viên kế tiếp.
 * Mặc định cuối cùng: `/icons/LogoBV.jpg` (LogoBV) khi không có đường dẫn hợp lệ.
 */
export function resolveKskPdfLogoUrl(explicit?: string | null): string | null {
  const candidates: (string | undefined | null)[] = [
    explicit,
    process.env.NEXT_PUBLIC_LOGO,
    process.env.NEXT_PUBLIC_THONG_TIN_LOGO,
    '/icons/LogoBV.jpg',
  ];

  for (const c of candidates) {
    const raw = (c ?? '').trim();
    if (!raw || raw.toUpperCase() === 'NULL') continue;
    if (/^https?:\/\//i.test(raw)) return raw;
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
  }
  return null;
}
