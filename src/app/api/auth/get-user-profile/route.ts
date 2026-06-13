import { NextRequest, NextResponse } from 'next/server';
import { getPmquanlyApiKey, getPmquanlyAuthBaseUrl } from '@/lib/server/pmquanly-env';
import { JSON_NO_CACHE_HEADERS } from '@/lib/server/pmquanly-json';

const H = { headers: JSON_NO_CACHE_HEADERS };

interface PmquanlyUserProfile {
  id: string;
  userId: number;
  userName: string;
  firstName?: string | null;
  lastName?: string | null;
  fullname?: string | null;
  systemRole?: number;
  systemRoleName?: string | null;
  dateOfBirth?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  isMaster?: boolean | null;
  email?: string | null;
  emailConfirmed?: boolean | null;
  phoneNumber?: string | null;
  phoneNumberConfirmed?: boolean | null;
  twoFactorEnabled?: boolean | null;
  profiles?: unknown;
  roles?: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';

    if (!token) {
      return NextResponse.json({ message: 'Thiếu Bearer token' }, { status: 401, ...H });
    }

    const apiKey = getPmquanlyApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { message: 'API key chưa được cấu hình (CME_API_KEY).' },
        { status: 500, ...H }
      );
    }

    const authBase = getPmquanlyAuthBaseUrl();

    const res = await fetch(`${authBase}/api/auth/get-user-profile`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'X-API-KEY': apiKey,
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data ?? { message: 'Chức năng đang phát triển.' }, { status: res.status, ...H });
    }

    return NextResponse.json(data as PmquanlyUserProfile, H);
  } catch (err) {
    console.error('[api/auth/get-user-profile]', err);
    return NextResponse.json({ message: 'Lỗi kết nối. Vui lòng thử lại sau.' }, { status: 500, ...H });
  }
}

