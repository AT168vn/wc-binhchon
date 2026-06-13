import { NextRequest, NextResponse } from 'next/server';
import { findPollFrame, isPollFrameClosed } from '@/config/wc-schedule';
import { JSON_NO_CACHE_HEADERS } from '@/lib/server/pmquanly-json';
import { getWcSessionSuTaikhoanFromRequest } from '@/lib/server/wc-session-token';
import {
  queryKetQuaBinhChon,
  upsertKetQuaBinhChon,
  type UpsertKetQuaBinhChonInput,
} from '@/lib/server/vimes-db';

const H = { headers: JSON_NO_CACHE_HEADERS };

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: NextRequest) {
  const suTaikhoan = request.nextUrl.searchParams.get('su_taikhoan')?.trim();
  const ngayThiDau = request.nextUrl.searchParams.get('ngay')?.trim();

  if (!suTaikhoan || !ngayThiDau) {
    return NextResponse.json(
      { message: 'Thiếu tham số su_taikhoan hoặc ngay (YYYY-MM-DD).' },
      { status: 400, ...H },
    );
  }

  if (!isValidDate(ngayThiDau)) {
    return NextResponse.json(
      { message: 'Tham số ngay không hợp lệ (YYYY-MM-DD).' },
      { status: 400, ...H },
    );
  }

  try {
    const data = await queryKetQuaBinhChon(suTaikhoan, ngayThiDau);
    return NextResponse.json({ data }, H);
  } catch (err) {
    console.error('[api/ket-qua-binh-chon GET]', err);
    const message =
      err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.';
    return NextResponse.json({ message }, { status: 500, ...H });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as Partial<UpsertKetQuaBinhChonInput> | null;

    const suTaikhoan = body?.su_taikhoan?.trim();
    const ngayThiDau = body?.ngay_thi_dau?.trim();
    const roundId = body?.round_id?.trim();
    const tranId = body?.tran_id?.trim();
    const ketQua = body?.ket_qua?.trim();
    const ketQuaTen = body?.ket_qua_ten?.trim() || null;
    const daKhoa = body?.da_khoa === true;

    if (!suTaikhoan || !ngayThiDau || !roundId || !tranId || !ketQua) {
      return NextResponse.json(
        { message: 'Thiếu dữ liệu bình chọn bắt buộc.' },
        { status: 400, ...H },
      );
    }

    if (!isValidDate(ngayThiDau)) {
      return NextResponse.json(
        { message: 'Ngày thi đấu không hợp lệ (YYYY-MM-DD).' },
        { status: 400, ...H },
      );
    }

    const pollFrame = findPollFrame(tranId, roundId);
    if (pollFrame && isPollFrameClosed(pollFrame)) {
      return NextResponse.json(
        { message: 'Đã hết thời gian bình chọn.' },
        { status: 403, ...H },
      );
    }

    const sessionSuTaikhoan = getWcSessionSuTaikhoanFromRequest(request);
    if (!sessionSuTaikhoan) {
      return NextResponse.json(
        { message: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.' },
        { status: 401, ...H },
      );
    }

    if (sessionSuTaikhoan.toLowerCase() !== suTaikhoan.toLowerCase()) {
      return NextResponse.json(
        { message: 'Bạn chỉ được cập nhật bình chọn của chính mình.' },
        { status: 403, ...H },
      );
    }

    const data = await upsertKetQuaBinhChon({
      ngay_thi_dau: ngayThiDau,
      su_taikhoan: suTaikhoan,
      round_id: roundId,
      tran_id: tranId,
      ket_qua: ketQua,
      ket_qua_ten: ketQuaTen,
      da_khoa: daKhoa,
    });

    return NextResponse.json({ data }, H);
  } catch (err) {
    console.error('[api/ket-qua-binh-chon POST]', err);
    const message =
      err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.';
    return NextResponse.json({ message }, { status: 500, ...H });
  }
}
