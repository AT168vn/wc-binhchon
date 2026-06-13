/**
 * Header tránh HTTP cache cho JSON API proxy (browser/CDN).
 * Dùng chung cho route handler Next.js và khớp `cache: 'no-store'` phía client.
 */
export const JSON_NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, must-revalidate',
} as const;

/**
 * Chuẩn hóa JSON từ pmquanly: mảng trực tiếp, null, hoặc `{ datas: [...] }` / `{ data: [...] }`.
 */
export function extractDatasArrayFromUpstream(data: unknown): unknown[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null) {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.datas)) return o.datas;
    if (Array.isArray(o.data)) return o.data;
  }
  return [];
}

/**
 * Đọc body từ response upstream (JSON hoặc text/plain chứa JSON — khớp curl `Accept: text/plain`).
 */
export async function parsePmquanlyResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  const t = text.trim();
  if (!t) return null;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    return null;
  }
}
