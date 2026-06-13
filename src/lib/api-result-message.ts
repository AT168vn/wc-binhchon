/** Lấy chuỗi thông báo từ phản hồi API (ưu tiên `message` / `Message`, bỏ khoảng trắng). */
export function apiResultText(
  result: { message?: unknown; Message?: unknown; message_other?: unknown },
  keys: Array<'message' | 'Message' | 'message_other'> = ['message', 'Message', 'message_other']
): string {
  for (const k of keys) {
    const raw = result[k];
    if (raw == null) continue;
    const s = typeof raw === 'string' ? raw.trim() : String(raw).trim();
    if (s) return s;
  }
  return '';
}

/** Thông báo snackbar thành công: luôn có chuỗi hiển thị kể cả khi API trả `message` rỗng. */
export function apiSuccessMessage(
  result: { message?: unknown; Message?: unknown },
  fallback: string
): string {
  const s = apiResultText(result, ['message', 'Message']);
  return s || fallback;
}
