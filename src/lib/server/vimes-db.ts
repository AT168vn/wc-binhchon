import { Pool, type PoolConfig } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __vimesPgPool: Pool | undefined;
}

function shouldUseSsl(useConnectionString: boolean): boolean | { rejectUnauthorized: boolean } {
  const flag = process.env.VIMES_DB_SSL?.trim().toLowerCase();
  if (flag === 'true' || flag === '1' || flag === 'yes') {
    return { rejectUnauthorized: false };
  }
  if (flag === 'false' || flag === '0' || flag === 'no') {
    return false;
  }
  if (useConnectionString && process.env.VERCEL === '1') {
    return { rejectUnauthorized: false };
  }
  return false;
}

function getVimesDbConfig(): PoolConfig {
  const connectionString =
    process.env.DATABASE_URL?.trim() ||
    process.env.VIMES_DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim();

  if (connectionString) {
    return {
      connectionString,
      ssl: shouldUseSsl(true),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    };
  }

  const host = process.env.VIMES_DB_HOST?.trim();
  const port = Number(process.env.VIMES_DB_PORT || 5432);
  const user = process.env.VIMES_DB_USER?.trim();
  const password = process.env.VIMES_DB_PASSWORD;
  const database = process.env.VIMES_DB_NAME?.trim();

  if (!host || !user || !database) {
    throw new Error(
      'Thiếu cấu hình DB. Trên Vercel: thêm DATABASE_URL hoặc VIMES_DB_HOST, VIMES_DB_USER, VIMES_DB_NAME trong Settings → Environment Variables. Xem env.example.',
    );
  }

  return {
    host,
    port: Number.isFinite(port) ? port : 5432,
    user,
    password: password ?? '',
    database,
    ssl: shouldUseSsl(false),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  };
}

export function getVimesPool(): Pool {
  if (!global.__vimesPgPool) {
    global.__vimesPgPool = new Pool(getVimesDbConfig());
  }
  return global.__vimesPgPool;
}

export type TaiKhoanBinhChonRow = {
  su_taikhoan: string;
  su_hoten: string | null;
};

export type TaiKhoanBinhChonAuthRow = TaiKhoanBinhChonRow;

export async function verifyTaiKhoanBinhChonLogin(
  suTaikhoan: string,
  suMatKhau: string,
): Promise<TaiKhoanBinhChonAuthRow | null> {
  const pool = getVimesPool();
  const result = await pool.query<TaiKhoanBinhChonAuthRow>(
    `SELECT su_taikhoan, su_hoten
     FROM sys_tkbinhchon
     WHERE su_taikhoan = $1 AND su_matkhau = $2
     LIMIT 1`,
    [suTaikhoan, suMatKhau],
  );
  return result.rows[0] ?? null;
}

export async function queryTaiKhoanBinhChon(): Promise<TaiKhoanBinhChonRow[]> {
  const pool = getVimesPool();
  const result = await pool.query<TaiKhoanBinhChonRow>(
    'SELECT su_taikhoan, su_hoten FROM sys_tkbinhchon ORDER BY su_taikhoan',
  );
  return result.rows;
}

export type HmsTkKetQuaRow = {
  ngay_thi_dau: string;
  su_taikhoan: string;
  round_id: string;
  tran_id: string;
  ket_qua: string;
  ket_qua_ten: string | null;
  da_khoa: boolean;
};

export async function queryKetQuaBinhChon(
  suTaikhoan: string,
  ngayThiDau: string,
): Promise<HmsTkKetQuaRow[]> {
  const pool = getVimesPool();
  const result = await pool.query<HmsTkKetQuaRow>(
    `SELECT
       ngay_thi_dau::text AS ngay_thi_dau,
       su_taikhoan,
       round_id,
       tran_id,
       ket_qua,
       ket_qua_ten,
       da_khoa
     FROM hms_tkketqua
     WHERE su_taikhoan = $1 AND ngay_thi_dau = $2::date
     ORDER BY tran_id`,
    [suTaikhoan, ngayThiDau],
  );
  return result.rows;
}

export type UpsertKetQuaBinhChonInput = {
  ngay_thi_dau: string;
  su_taikhoan: string;
  round_id: string;
  tran_id: string;
  ket_qua: string;
  ket_qua_ten: string | null;
  da_khoa: boolean;
};

export async function upsertKetQuaBinhChon(
  input: UpsertKetQuaBinhChonInput,
): Promise<HmsTkKetQuaRow> {
  const pool = getVimesPool();
  const result = await pool.query<HmsTkKetQuaRow>(
    `INSERT INTO hms_tkketqua (
       ngay_thi_dau, su_taikhoan, round_id, tran_id, ket_qua, ket_qua_ten, da_khoa
     )
     VALUES ($1::date, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (su_taikhoan, tran_id)
     DO UPDATE SET
       ngay_thi_dau = EXCLUDED.ngay_thi_dau,
       round_id = EXCLUDED.round_id,
       ket_qua = EXCLUDED.ket_qua,
       ket_qua_ten = EXCLUDED.ket_qua_ten,
       da_khoa = EXCLUDED.da_khoa,
       ngay_cap_nhat = CURRENT_TIMESTAMP
     RETURNING
       ngay_thi_dau::text AS ngay_thi_dau,
       su_taikhoan,
       round_id,
       tran_id,
       ket_qua,
       ket_qua_ten,
       da_khoa`,
    [
      input.ngay_thi_dau,
      input.su_taikhoan,
      input.round_id,
      input.tran_id,
      input.ket_qua,
      input.ket_qua_ten,
      input.da_khoa,
    ],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error('Không lưu được kết quả bình chọn.');
  }

  return row;
}

export type HmsTkKetQuaKtRow = {
  ngay_thi_dau: string;
  round_id: string;
  tran_id: string;
  tran_ten: string | null;
  ket_qua: string;
  ket_qua_ten: string | null;
};

export async function queryKetQuaThucTe(ngayThiDau: string): Promise<HmsTkKetQuaKtRow[]> {
  const pool = getVimesPool();
  const result = await pool.query<HmsTkKetQuaKtRow>(
    `SELECT
       ngay_thi_dau::text AS ngay_thi_dau,
       round_id,
       tran_id,
       tran_ten,
       ket_qua,
       ket_qua_ten
     FROM hms_tkketqua_kt
     WHERE ngay_thi_dau = $1::date
     ORDER BY tran_id`,
    [ngayThiDau],
  );
  return result.rows;
}

export type UpsertKetQuaThucTeInput = {
  ngay_thi_dau: string;
  round_id: string;
  tran_id: string;
  tran_ten: string | null;
  ket_qua: string;
  ket_qua_ten: string | null;
};

export async function upsertKetQuaThucTe(
  input: UpsertKetQuaThucTeInput,
): Promise<HmsTkKetQuaKtRow> {
  const pool = getVimesPool();
  const result = await pool.query<HmsTkKetQuaKtRow>(
    `INSERT INTO hms_tkketqua_kt (
       ngay_thi_dau, round_id, tran_id, tran_ten, ket_qua, ket_qua_ten
     )
     VALUES ($1::date, $2, $3, $4, $5, $6)
     ON CONFLICT (tran_id)
     DO UPDATE SET
       ngay_thi_dau = EXCLUDED.ngay_thi_dau,
       round_id = EXCLUDED.round_id,
       tran_ten = EXCLUDED.tran_ten,
       ket_qua = EXCLUDED.ket_qua,
       ket_qua_ten = EXCLUDED.ket_qua_ten,
       ngay_cap_nhat = CURRENT_TIMESTAMP
     RETURNING
       ngay_thi_dau::text AS ngay_thi_dau,
       round_id,
       tran_id,
       tran_ten,
       ket_qua,
       ket_qua_ten`,
    [
      input.ngay_thi_dau,
      input.round_id,
      input.tran_id,
      input.tran_ten,
      input.ket_qua,
      input.ket_qua_ten,
    ],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error('Không lưu được kết quả thực tế.');
  }

  return row;
}

export type TongHopBinhChonRow = {
  su_taikhoan: string;
  su_hoten: string | null;
  so_tran_chon: number;
  kq_dung: number;
  kq_sai: number;
  khong_tg: number;
};

export async function queryTongHopBinhChon(
  ngayThiDau: string,
  tranIds: string[],
): Promise<TongHopBinhChonRow[]> {
  const pool = getVimesPool();
  const result = await pool.query<TongHopBinhChonRow>(
    `WITH tran_ngay AS (
       SELECT unnest($2::text[]) AS tran_id
     )
     SELECT
       tk.su_taikhoan,
       tk.su_hoten,
       COALESCE(COUNT(u.tran_id) FILTER (
         WHERE u.da_khoa = TRUE
       ), 0)::int AS so_tran_chon,
       COALESCE(COUNT(u.tran_id) FILTER (
         WHERE u.da_khoa = TRUE AND k.tran_id IS NOT NULL AND u.ket_qua = k.ket_qua
       ), 0)::int AS kq_dung,
       COALESCE(COUNT(u.tran_id) FILTER (
         WHERE u.da_khoa = TRUE AND k.tran_id IS NOT NULL AND u.ket_qua <> k.ket_qua
       ), 0)::int AS kq_sai,
       COALESCE((
         SELECT COUNT(*)::int
         FROM tran_ngay t
         WHERE NOT EXISTS (
           SELECT 1
           FROM hms_tkketqua u2
           WHERE u2.su_taikhoan = tk.su_taikhoan
             AND u2.ngay_thi_dau = $1::date
             AND u2.tran_id = t.tran_id
             AND u2.da_khoa = TRUE
         )
       ), 0)::int AS khong_tg
     FROM sys_tkbinhchon tk
     LEFT JOIN hms_tkketqua u
       ON u.su_taikhoan = tk.su_taikhoan
      AND u.ngay_thi_dau = $1::date
     LEFT JOIN hms_tkketqua_kt k ON k.tran_id = u.tran_id
     GROUP BY tk.su_taikhoan, tk.su_hoten
     ORDER BY kq_dung DESC, tk.su_hoten NULLS LAST, tk.su_taikhoan`,
    [ngayThiDau, tranIds],
  );
  return result.rows;
}
