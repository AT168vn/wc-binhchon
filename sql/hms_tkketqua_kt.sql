-- Kết quả thực tế các trận (đáp án đúng) để so sánh với hms_tkketqua
CREATE TABLE IF NOT EXISTS hms_tkketqua_kt (
  id BIGSERIAL PRIMARY KEY,
  ngay_thi_dau DATE NOT NULL,
  round_id VARCHAR(100) NOT NULL,
  tran_id VARCHAR(100) NOT NULL,
  tran_ten VARCHAR(100),
  ket_qua VARCHAR(100) NOT NULL,
  ket_qua_ten VARCHAR(200),
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_hms_tkketqua_kt_tran UNIQUE (tran_id)
);

CREATE INDEX IF NOT EXISTS idx_hms_tkketqua_kt_ngay ON hms_tkketqua_kt (ngay_thi_dau);
CREATE INDEX IF NOT EXISTS idx_hms_tkketqua_kt_round ON hms_tkketqua_kt (round_id);

COMMENT ON TABLE hms_tkketqua_kt IS 'Kết quả thực tế trận đấu WC để đối chiếu bình chọn';
COMMENT ON COLUMN hms_tkketqua_kt.tran_id IS 'Mã trận, khớp hms_tkketqua.tran_id';
COMMENT ON COLUMN hms_tkketqua_kt.ket_qua IS 'Mã đáp án đúng (vd: qatar, hoa)';
