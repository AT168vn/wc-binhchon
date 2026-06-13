import { NextRequest, NextResponse } from 'next/server';
import {
  WC_TIEN_MOI_KHONG_TG,
  WC_TIEN_MOI_KQ_DUNG,
  WC_TIEN_MOI_KQ_SAI,
  getTranIdsForDate,
  isWcScoringDate,
  WC_NGAY_BAT_DAU_TINH_DIEM,
} from '@/config/wc-schedule';
import { JSON_NO_CACHE_HEADERS } from '@/lib/server/pmquanly-json';
import { queryTaiKhoanBinhChon, queryTongHopBinhChon } from '@/lib/server/vimes-db';

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
    const tranIds = getTranIdsForDate(ngayThiDau);
    const tinhDiem = isWcScoringDate(ngayThiDau);

    const rows = tinhDiem
      ? await queryTongHopBinhChon(ngayThiDau, tranIds)
      : (await queryTaiKhoanBinhChon()).map((item) => ({
          ...item,
          so_tran_chon: 0,
          kq_dung: 0,
          kq_sai: 0,
          khong_tg: 0,
        }));

    const data = rows.map((row) => ({
      ...row,
      so_tien: tinhDiem
        ? row.kq_dung * WC_TIEN_MOI_KQ_DUNG +
          row.kq_sai * WC_TIEN_MOI_KQ_SAI +
          row.khong_tg * WC_TIEN_MOI_KHONG_TG
        : 0,
    }));

    return NextResponse.json(
      {
        data,
        meta: {
          ngay: ngayThiDau,
          so_tran: tranIds.length,
          tinh_diem: tinhDiem,
          ngay_bat_dau_tinh_diem: WC_NGAY_BAT_DAU_TINH_DIEM,
          tien_moi_kq_dung: WC_TIEN_MOI_KQ_DUNG,
          tien_moi_kq_sai: WC_TIEN_MOI_KQ_SAI,
          tien_moi_khong_tg: WC_TIEN_MOI_KHONG_TG,
        },
      },
      H,
    );
  } catch (err) {
    console.error('[api/tong-hop-binh-chon GET]', err);
    const message =
      err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.';
    return NextResponse.json({ message }, { status: 500, ...H });
  }
}
