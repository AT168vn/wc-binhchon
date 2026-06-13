import { resolveAppApiPath } from '@/lib/app-api-path';

/** Fetch API nội bộ, hỗ trợ base URL khi deploy GitHub Pages. */
export function browserApiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof input !== 'string') {
    return fetch(input, init);
  }

  return fetch(resolveAppApiPath(input), init);
}
