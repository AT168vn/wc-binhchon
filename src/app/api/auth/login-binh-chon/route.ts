import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/lib/auth/constants';
import { buildUserInfoFromBinhChon } from '@/lib/auth/utils';
import { JSON_NO_CACHE_HEADERS } from '@/lib/server/pmquanly-json';
import { verifyTaiKhoanBinhChonLogin } from '@/lib/server/vimes-db';
import { createWcSessionToken } from '@/lib/server/wc-session-token';

const H = { headers: JSON_NO_CACHE_HEADERS };

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { su_taikhoan?: string; su_matkhau?: string; username?: string; password?: string }
      | null;

    const suTaikhoan = (body?.su_taikhoan ?? body?.username)?.trim();
    const suMatKhau = body?.su_matkhau ?? body?.password;

    if (!suTaikhoan || !suMatKhau) {
      return NextResponse.json(
        { message: AUTH_CONFIG.ERRORS.MISSING_CREDENTIALS },
        { status: 400, ...H },
      );
    }

    const account = await verifyTaiKhoanBinhChonLogin(suTaikhoan, suMatKhau);
    if (!account) {
      return NextResponse.json(
        { message: AUTH_CONFIG.ERRORS.INVALID_CREDENTIALS },
        { status: 401, ...H },
      );
    }

    const accessToken = createWcSessionToken(account);
    const userInfo = buildUserInfoFromBinhChon(account);

    return NextResponse.json(
      {
        accessToken,
        userInfo,
      },
      H,
    );
  } catch (err) {
    console.error('[api/auth/login-binh-chon POST]', err);
    const message =
      err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.';
    return NextResponse.json({ message }, { status: 500, ...H });
  }
}
