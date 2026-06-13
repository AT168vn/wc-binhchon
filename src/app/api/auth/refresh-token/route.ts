import { NextRequest, NextResponse } from 'next/server';
import { getPmquanlyApiKey, getPmquanlyAuthBaseUrl } from '@/lib/server/pmquanly-env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const refreshToken = body?.refreshToken;
    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json(
        { message: 'Thiếu refreshToken' },
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

    const res = await fetch(`${AUTH_BASE}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        'X-API-KEY': PMQUANLY_API_KEY,
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = data?.message ?? data?.Message ?? 'Làm mới token thất bại.';
      return NextResponse.json({ message }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/auth/refresh-token]', err);
    return NextResponse.json(
      { message: 'Lỗi kết nối. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
