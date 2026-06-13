-- Tài khoản bình chọn World Cup
CREATE TABLE IF NOT EXISTS sys_tkbinhchon (
  su_taikhoan VARCHAR(100) PRIMARY KEY,
  su_hoten VARCHAR(255),
  su_matkhau VARCHAR(255) NOT NULL
);

COMMENT ON TABLE sys_tkbinhchon IS 'Tài khoản đăng nhập trang bình chọn WC';
COMMENT ON COLUMN sys_tkbinhchon.su_taikhoan IS 'Tên đăng nhập (vd: tuandv)';
COMMENT ON COLUMN sys_tkbinhchon.su_hoten IS 'Họ tên hiển thị';
COMMENT ON COLUMN sys_tkbinhchon.su_matkhau IS 'Mật khẩu đăng nhập';

-- Ví dụ:
-- INSERT INTO sys_tkbinhchon (su_taikhoan, su_hoten, su_matkhau)
-- VALUES ('tuandv', N'Tuấn DV', 'matkhau123');
