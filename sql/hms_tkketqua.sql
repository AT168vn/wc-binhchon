-- Kết quả bình chọn World Cup theo ngày, tài khoản và trận đấu
CREATE TABLE IF NOT EXISTS hms_tkketqua (
  id BIGSERIAL PRIMARY KEY,
  ngay_thi_dau DATE NOT NULL,
  su_taikhoan VARCHAR(100) NOT NULL,
  round_id VARCHAR(100) NOT NULL,
  tran_id VARCHAR(100) NOT NULL,
  ket_qua VARCHAR(100) NOT NULL,
  ket_qua_ten VARCHAR(200),
  da_khoa BOOLEAN NOT NULL DEFAULT FALSE,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_hms_tkketqua_taikhoan_tran UNIQUE (su_taikhoan, tran_id)
);

CREATE INDEX IF NOT EXISTS idx_hms_tkketqua_ngay ON hms_tkketqua (ngay_thi_dau);
CREATE INDEX IF NOT EXISTS idx_hms_tkketqua_taikhoan_ngay ON hms_tkketqua (su_taikhoan, ngay_thi_dau);
CREATE INDEX IF NOT EXISTS idx_hms_tkketqua_round ON hms_tkketqua (round_id);

COMMENT ON TABLE hms_tkketqua IS 'Kết quả bình chọn WC theo ngày thi đấu, tài khoản và trận';
COMMENT ON COLUMN hms_tkketqua.ngay_thi_dau IS 'Ngày thi đấu (YYYY-MM-DD)';
COMMENT ON COLUMN hms_tkketqua.su_taikhoan IS 'Tài khoản bình chọn';
COMMENT ON COLUMN hms_tkketqua.round_id IS 'Mã tab/ngày (vd: tran-14062026)';
COMMENT ON COLUMN hms_tkketqua.tran_id IS 'Mã trận (vd: tran-14062026-match-1)';
COMMENT ON COLUMN hms_tkketqua.ket_qua IS 'Mã lựa chọn (vd: qatar, hoa, brasil)';
COMMENT ON COLUMN hms_tkketqua.ket_qua_ten IS 'Tên hiển thị lựa chọn';
COMMENT ON COLUMN hms_tkketqua.da_khoa IS 'TRUE sau khi bấm Đồng ý';
