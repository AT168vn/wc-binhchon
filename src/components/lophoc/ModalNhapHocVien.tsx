'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, X } from 'lucide-react';

const MODAL_ROOT_ID = 'homepage-modal-root';

const inputClass =
  'w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]';

const labelClass = 'mb-1.5 block text-sm font-medium text-[#374151]';

type ModalNhapHocVienProps = {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  onSave?: () => void;
};

export default function ModalNhapHocVien({
  isOpen,
  onClose,
  className: classTitle,
  onSave,
}: ModalNhapHocVienProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [maHocVien, setMaHocVien] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [khoaPhongBan, setKhoaPhongBan] = useState('');

  useEffect(() => {
    setPortalRoot(document.getElementById(MODAL_ROOT_ID));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setMaHocVien('');
      setHoTen('');
      setEmail('');
      setSoDienThoai('');
      setKhoaPhongBan('');
    }
  }, [isOpen]);

  if (!isOpen || !portalRoot) return null;

  const handleSave = () => {
    onSave?.();
    onClose();
  };

  return createPortal(
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center overflow-y-auto bg-black/10 p-4">
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nhap-hoc-vien-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] px-6 py-4">
          <div>
            <h2 id="nhap-hoc-vien-title" className="text-lg font-bold text-[#111827]">
              Nhập thông tin học viên
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">Thêm học viên vào lớp {classTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111827]"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ma-hoc-vien" className={labelClass}>
                Mã học viên
              </label>
              <input
                id="ma-hoc-vien"
                type="text"
                className={inputClass}
                placeholder="VD: HV2026001"
                value={maHocVien}
                onChange={(e) => setMaHocVien(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ho-ten" className={labelClass}>
                Họ và tên
              </label>
              <input
                id="ho-ten"
                type="text"
                className={inputClass}
                placeholder="VD: Nguyễn Văn A"
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                className={inputClass}
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="so-dien-thoai" className={labelClass}>
                Số điện thoại
              </label>
              <input
                id="so-dien-thoai"
                type="tel"
                className={inputClass}
                placeholder="0912345678"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="khoa-phong-ban" className={labelClass}>
              Khoa/Phòng ban
            </label>
            <input
              id="khoa-phong-ban"
              type="text"
              className={inputClass}
              placeholder="VD: Khoa Nội"
              value={khoaPhongBan}
              onChange={(e) => setKhoaPhongBan(e.target.value)}
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[#e5e7eb] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
          >
            <UserPlus className="h-4 w-4" />
            Thêm học viên
          </button>
        </div>
      </div>
    </div>,
    portalRoot
  );
}
