import crypto from 'crypto';

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

export function createWcSessionToken(input: {
  su_taikhoan: string;
  su_hoten: string | null;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 6 * 60 * 60;
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: input.su_taikhoan,
      username: input.su_taikhoan,
      fullname: input.su_hoten ?? input.su_taikhoan,
      exp,
      iat: now,
    }),
  );
  const secret =
    process.env.WC_SESSION_SECRET?.trim() ||
    process.env.NEXT_PUBLIC_API_KEY?.trim() ||
    'wc-binh-chon-session';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}
