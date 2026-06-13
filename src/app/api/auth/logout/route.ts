import { NextRequest, NextResponse } from 'next/server';
import { getPmquanlyApiKey, getPmquanlyAuthBaseUrl } from '@/lib/server/pmquanly-env';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Thiếu token đăng nhập' },
        { status: 401 }
      );
    }

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
        { message: 'API key chưa được cấu hình' },
        { status: 500 }
      );
    }

    const res = await fetch(`${AUTH_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'X-API-KEY': PMQUANLY_API_KEY,
        'Authorization': authHeader,
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = data?.message ?? data?.Message ?? 'Đăng xuất thất bại.';
      return NextResponse.json({ message }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/auth/logout]', err);
    return NextResponse.json(
      { message: 'Lỗi kết nối. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
