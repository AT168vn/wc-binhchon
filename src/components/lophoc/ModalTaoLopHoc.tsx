'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import CustomComboBox, { type Option } from '@/components/ui/CustomComboBox';
import { modalComboBoxProps } from '@/components/ui/modal-combobox-props';

const MODAL_ROOT_ID = 'homepage-modal-root';

const CHUONG_TRINH_OPTIONS: Option[] = [
  { ma: 'ddc', ten: 'Chương trình Điều dưỡng Đa khoa' },
  { ma: 'knm', ten: 'Kỹ năng mềm cho Nhân viên Y tế' },
  { ma: 'xn', ten: 'Xét nghiệm Y học Nâng cao' },
];

const BUOI_TIET_OPTIONS: Option[] = [
  { ma: 'ca-ngay', ten: 'Cả ngày (8 tiết: 07:00 - 16:15)' },
  { ma: 'ca-ngay-1-8', ten: 'Cả ngày - Tiết 1-8 (07:00 - 16:15)' },
  { ma: 'sang', ten: 'Buổi sáng (4 tiết: 07:00 - 10:15)' },
  { ma: 'sang-1-4', ten: 'Sáng - Tiết 1-4 (07:00 - 10:15)' },
  { ma: 'sang-t1', ten: 'Sáng - Tiết 1 (07:00 - 07:45)' },
  { ma: 'sang-t2', ten: 'Sáng - Tiết 2 (07:50 - 08:35)' },
  { ma: 'sang-t3', ten: 'Sáng - Tiết 3 (08:40 - 09:25)' },
  { ma: 'sang-t4', ten: 'Sáng - Tiết 4 (09:30 - 10:15)' },
  { ma: 'chieu', ten: 'Buổi chiều (4 tiết: 13:00 - 16:15)' },
  { ma: 'chieu-5-8', ten: 'Chiều - Tiết 5-8 (13:00 - 16:15)' },
  { ma: 'chieu-t5', ten: 'Chiều - Tiết 5 (13:00 - 13:45)' },
  { ma: 'chieu-t6', ten: 'Chiều - Tiết 6 (13:50 - 14:35)' },
  { ma: 'chieu-t7', ten: 'Chiều - Tiết 7 (14:40 - 15:25)' },
  { ma: 'chieu-t8', ten: 'Chiều - Tiết 8 (15:30 - 16:15)' },
  { ma: 'toi', ten: 'Buổi tối (4 tiết: 18:00 - 21:15)' },
  { ma: 'toi-9-12', ten: 'Tối - Tiết 9-12 (18:00 - 21:15)' },
];

const BAI_HOC_OPTIONS: Option[] = [
  { ma: 'lang-nghe', ten: 'Kỹ năng lắng nghe' },
  { ma: 'giao-tiep', ten: 'Kỹ năng giao tiếp' },
];

const GIANG_VIEN_OPTIONS: Option[] = [
  { ma: 'bs-nguyen-thi-b', ten: 'BS. Nguyễn Thị B' },
  { ma: 'ts-tran-van-c', ten: 'TS. Trần Văn C' },
];

const DIA_DIEM_OPTIONS: Option[] = [
  { ma: 'phong-1a', ten: 'Phòng học 1A tòa A' },
  { ma: 'phong-th-2b', ten: 'Phòng thực hành 2B tòa VNVC' },
  { ma: 'phong-12a', ten: 'Phòng học 12A giảng đường' },
];

const BAI_THI_OPTIONS: Option[] = [
  { ma: 'giua-ky', ten: 'Kiểm tra giữa kỳ' },
  { ma: 'cuoi-ky', ten: 'Thi cuối kỳ' },
  { ma: 'thuc-hanh', ten: 'Thi thực hành' },
];

const inputClass =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]';

const labelClass = 'mb-1.5 block text-sm font-medium text-[#374151]';

type ModalTaoLopHocProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
};

export default function ModalTaoLopHoc({ isOpen, onClose, onSave }: ModalTaoLopHocProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  const [tenLop, setTenLop] = useState('');
  const [chuongTrinh, setChuongTrinh] = useState<Option | null>(null);
  const [soLuong, setSoLuong] = useState('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');

  const [ngayHoc, setNgayHoc] = useState('');
  const [buoiHoc, setBuoiHoc] = useState<Option | null>(null);
  const [baiHoc, setBaiHoc] = useState<Option | null>(null);
  const [giangVien, setGiangVien] = useState<Option | null>(null);
  const [diaDiemHoc, setDiaDiemHoc] = useState<Option | null>(null);

  const [ngayThi, setNgayThi] = useState('');
  const [buoiThi, setBuoiThi] = useState<Option | null>(null);
  const [baiThi, setBaiThi] = useState<Option | null>(null);
  const [giamThi, setGiamThi] = useState<Option | null>(null);
  const [diaDiemThi, setDiaDiemThi] = useState<Option | null>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById(MODAL_ROOT_ID));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setTenLop('');
      setChuongTrinh(null);
      setSoLuong('');
      setTuNgay('');
      setDenNgay('');
      setNgayHoc('');
      setBuoiHoc(null);
      setBaiHoc(null);
      setGiangVien(null);
      setDiaDiemHoc(null);
      setNgayThi('');
      setBuoiThi(null);
      setBaiThi(null);
      setGiamThi(null);
      setDiaDiemThi(null);
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
        className="my-4 flex max-h-[min(90vh,calc(100vh-7rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tao-lop-hoc-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] px-6 py-4">
          <div>
            <h2 id="tao-lop-hoc-title" className="text-lg font-bold text-[#111827]">
              Tạo lớp học mới
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Nhập thông tin lớp học và xếp lịch học ban đầu
            </p>
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

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[#111827]">Thông tin lớp học</h3>

            <div>
              <label htmlFor="ten-lop" className={labelClass}>
                Tên lớp
              </label>
              <input
                id="ten-lop"
                type="text"
                className={inputClass}
                placeholder="VD: Điều dưỡng K13"
                value={tenLop}
                onChange={(e) => setTenLop(e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Chương trình học</label>
              <CustomComboBox
                options={CHUONG_TRINH_OPTIONS}
                value={chuongTrinh}
                onChange={setChuongTrinh}
                placeholder="Chọn chương trình"
                {...modalComboBoxProps}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="so-luong" className={labelClass}>
                  Số lượng dự kiến
                </label>
                <input
                  id="so-luong"
                  type="text"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="30"
                  value={soLuong}
                  onChange={(e) => setSoLuong(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="tu-ngay" className={labelClass}>
                  Từ ngày
                </label>
                <input
                  id="tu-ngay"
                  type="date"
                  className={inputClass}
                  value={tuNgay}
                  onChange={(e) => setTuNgay(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="den-ngay" className={labelClass}>
                  Đến ngày
                </label>
                <input
                  id="den-ngay"
                  type="date"
                  className={inputClass}
                  value={denNgay}
                  onChange={(e) => setDenNgay(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="mt-8 border-t border-[#e5e7eb] pt-8">
            <h3 className="mb-4 text-sm font-semibold text-[#111827]">Xếp lịch học</h3>
            <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4">
              <p className="mb-4 text-sm text-[#6b7280]">
                Sau khi tạo lớp, bạn có thể xếp lịch học cho từng buổi
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ngay-hoc" className={labelClass}>
                      Ngày học
                    </label>
                    <input
                      id="ngay-hoc"
                      type="date"
                      className={inputClass}
                      value={ngayHoc}
                      onChange={(e) => setNgayHoc(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Buổi học / Tiết số</label>
                    <CustomComboBox
                      options={BUOI_TIET_OPTIONS}
                      value={buoiHoc}
                      onChange={setBuoiHoc}
                      placeholder="Chọn buổi hoặc tiết"
                      {...modalComboBoxProps}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Bài học</label>
                    <CustomComboBox
                      options={BAI_HOC_OPTIONS}
                      value={baiHoc}
                      onChange={setBaiHoc}
                      placeholder="Chọn bài học"
                      {...modalComboBoxProps}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Giảng viên</label>
                    <CustomComboBox
                      options={GIANG_VIEN_OPTIONS}
                      value={giangVien}
                      onChange={setGiangVien}
                      placeholder="Chọn giảng viên"
                      {...modalComboBoxProps}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Địa điểm</label>
                  <CustomComboBox
                    options={DIA_DIEM_OPTIONS}
                    value={diaDiemHoc}
                    onChange={setDiaDiemHoc}
                    placeholder="Chọn địa điểm"
                    {...modalComboBoxProps}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 border-t border-[#e5e7eb] pt-8">
            <h3 className="mb-4 text-sm font-semibold text-[#111827]">Xếp lịch thi</h3>
            <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-4">
              <p className="mb-4 text-sm text-[#2563eb]">
                Xếp lịch thi cho các bài kiểm tra và đề thi
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ngay-thi" className={labelClass}>
                      Ngày thi
                    </label>
                    <input
                      id="ngay-thi"
                      type="date"
                      className={inputClass}
                      value={ngayThi}
                      onChange={(e) => setNgayThi(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Buổi thi / Tiết số</label>
                    <CustomComboBox
                      options={BUOI_TIET_OPTIONS}
                      value={buoiThi}
                      onChange={setBuoiThi}
                      placeholder="Chọn buổi hoặc tiết"
                      {...modalComboBoxProps}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Bài thi</label>
                    <CustomComboBox
                      options={BAI_THI_OPTIONS}
                      value={baiThi}
                      onChange={setBaiThi}
                      placeholder="Chọn bài thi"
                      {...modalComboBoxProps}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Giám thị</label>
                    <CustomComboBox
                      options={GIANG_VIEN_OPTIONS}
                      value={giamThi}
                      onChange={setGiamThi}
                      placeholder="Chọn giám thị"
                      {...modalComboBoxProps}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Địa điểm</label>
                  <CustomComboBox
                    options={DIA_DIEM_OPTIONS}
                    value={diaDiemThi}
                    onChange={setDiaDiemThi}
                    placeholder="Chọn địa điểm"
                    {...modalComboBoxProps}
                  />
                </div>
              </div>
            </div>
          </section>
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
            className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
          >
            Lưu lớp học
          </button>
        </div>
      </div>
    </div>,
    portalRoot
  );
}
