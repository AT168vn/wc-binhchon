import { NextRequest, NextResponse } from 'next/server';
import { getAuthApplicationBaseUrl, getPmquanlyApiKey } from '@/lib/server/pmquanly-env';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      Username?: string;
      Password?: string;
    };
    const { Username, Password } = body;

    if (!Username || !Password) {
      return NextResponse.json(
        { message: 'Username và Password là bắt buộc.', Code: 400 },
        { status: 400 },
      );
    }

    const apiKey = getPmquanlyApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { message: 'API key chưa được cấu hình (NEXT_PUBLIC_API_KEY).', Code: 500 },
        { status: 500 },
      );
    }

    const res = await fetch(`${getAuthApplicationBaseUrl()}/auth_hsoft`, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Key: apiKey,
        Username: String(Username).trim(),
        Password,
      }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[api/auth/login_hsoft]', err);
    return NextResponse.json(
      { message: 'Lỗi kết nối. Vui lòng thử lại sau.', Code: 500 },
      { status: 500 },
    );
  }
}
