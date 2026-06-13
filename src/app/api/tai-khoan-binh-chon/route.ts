import { NextResponse } from 'next/server';
import { JSON_NO_CACHE_HEADERS } from '@/lib/server/pmquanly-json';
import { queryTaiKhoanBinhChon } from '@/lib/server/vimes-db';

const H = { headers: JSON_NO_CACHE_HEADERS };

export async function GET() {
  try {
    const data = await queryTaiKhoanBinhChon();
    return NextResponse.json({ data }, H);
  } catch (err) {
    console.error('[api/tai-khoan-binh-chon]', err);
    const message =
      err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.';
    return NextResponse.json({ message }, { status: 500, ...H });
  }
}
