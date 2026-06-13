import { NextRequest, NextResponse } from 'next/server';
import { JSON_NO_CACHE_HEADERS } from '@/lib/server/pmquanly-json';
import {
  queryKetQuaThucTe,
  upsertKetQuaThucTe,
  type UpsertKetQuaThucTeInput,
} from '@/lib/server/vimes-db';

const H = { headers: JSON_NO_CACHE_HEADERS };

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: NextRequest) {
  const ngayThiDau = request.nextUrl.searchParams.get('ngay')?.trim();

  if (!ngayThiDau) {
    return NextResponse.json(
      { message: 'Thiếu tham số ngay (YYYY-MM-DD).' },
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
    const data = await queryKetQuaThucTe(ngayThiDau);
    return NextResponse.json({ data }, H);
  } catch (err) {
    console.error('[api/ket-qua-thuc-te GET]', err);
    const message =
      err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.';
    return NextResponse.json({ message }, { status: 500, ...H });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as Partial<UpsertKetQuaThucTeInput> | null;

    const ngayThiDau = body?.ngay_thi_dau?.trim();
    const roundId = body?.round_id?.trim();
    const tranId = body?.tran_id?.trim();
    const tranTen = body?.tran_ten?.trim() || null;
    const ketQua = body?.ket_qua?.trim();
    const ketQuaTen = body?.ket_qua_ten?.trim() || null;

    if (!ngayThiDau || !roundId || !tranId || !ketQua) {
      return NextResponse.json(
        { message: 'Thiếu dữ liệu kết quả bắt buộc.' },
        { status: 400, ...H },
      );
    }

    if (!isValidDate(ngayThiDau)) {
      return NextResponse.json(
        { message: 'Ngày thi đấu không hợp lệ (YYYY-MM-DD).' },
        { status: 400, ...H },
      );
    }

    const data = await upsertKetQuaThucTe({
      ngay_thi_dau: ngayThiDau,
      round_id: roundId,
      tran_id: tranId,
      tran_ten: tranTen,
      ket_qua: ketQua,
      ket_qua_ten: ketQuaTen,
    });

    return NextResponse.json({ data }, H);
  } catch (err) {
    console.error('[api/ket-qua-thuc-te POST]', err);
    const message =
      err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.';
    return NextResponse.json({ message }, { status: 500, ...H });
  }
}
