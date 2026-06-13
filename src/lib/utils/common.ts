// Debounce function để tránh gọi API quá nhiều
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function để giới hạn số lần gọi function
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Export CSV
export function exportToCsv<T extends Record<string, unknown>>(filename: string, rows: T[]) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0] as object);
  const csv = [headers.join(','), ...rows.map((row) => headers.map((field) => JSON.stringify(row[field] ?? '')).join(','))].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/** Bỏ hậu tố trong ngoặc đơn cuối chuỗi (vd. "Tên (VT)") — dùng khi hiển thị tên nhóm không kèm viết tắt. */
export function stripDisplayAbbrevSuffix(s: string): string {
  return (s ?? '').replace(/\s*\([^)]*\)\s*$/, '').trim();
}