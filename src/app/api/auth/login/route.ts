import { NextRequest, NextResponse } from 'next/server';
import { getPmquanlyApiKey, getPmquanlyAuthBaseUrl } from '@/lib/server/pmquanly-env';

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { message: 'Thiếu hoặc không phải JSON hợp lệ (cần userName, password).' },
        { status: 400 }
      );
    }
    const { userName, password, terminateSession = true, language = 'string' } = body;

    if (!userName || !password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ thông tin đăng nhập' },
        { status: 400 }
      );
    }

    const AUTH_BASE = getPmquanlyAuthBaseUrl();
    const PMQUANLY_API_KEY = getPmquanlyApiKey();

    if (!PMQUANLY_API_KEY) {
      return NextResponse.json(
        { message: 'API key chưa được cấu hình (CME_API_KEY).' },
        { status: 500 }
      );
    }

    const res = await fetch(`${AUTH_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'X-API-KEY': PMQUANLY_API_KEY,
      },
      body: JSON.stringify({
        userName: String(userName).trim(),
        password,
        terminateSession: !!terminateSession,
        language: String(language),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = data?.message ?? data?.Message ?? 'Tài khoản hoặc mật khẩu không chính xác.';
      return NextResponse.json({ message }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/auth/login]', err);
    return NextResponse.json(
      { message: 'Lỗi kết nối. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
