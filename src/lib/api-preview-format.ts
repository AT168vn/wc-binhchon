/** Chuỗi JSON hiển thị trong modal LogAPI / preview (proxy Next.js). */
export function formatApiPreviewRequest(opts: {
  method: string;
  path: string;
  body?: unknown;
}): string {
  return JSON.stringify(
    {
      method: opts.method,
      path: opts.path,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer <token>',
      },
      body: opts.body === undefined ? null : opts.body,
    },
    null,
    2
  );
}
