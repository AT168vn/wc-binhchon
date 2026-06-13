'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import CustomComboBox, { type Option } from '@/components/ui/CustomComboBox';
import { modalComboBoxProps } from '@/components/ui/modal-combobox-props';

const MODAL_ROOT_ID = 'homepage-modal-root';

const AUTHOR_OPTIONS: Option[] = [
  { ma: 'bs-nguyen-thi-b', ten: 'BS. Nguyễn Thị B' },
  { ma: 'ths-tran-van-a', ten: 'ThS. Trần Văn A' },
  { ma: 'bs-le-thi-c', ten: 'BS. Lê Thị C' },
  { ma: 'bs-pham-minh-d', ten: 'BS. Phạm Minh D' },
  { ma: 'bs-hoang-van-e', ten: 'BS. Hoàng Văn E' },
];

const LOAI_CAU_HOI_OPTIONS: Option[] = [
  { ma: 'trac-nghiem-1', ten: 'Trắc nghiệm một đáp án' },
  { ma: 'trac-nghiem-nhieu', ten: 'Trắc nghiệm nhiều đáp án' },
  { ma: 'tu-luan', ten: 'Tự luận' },
  { ma: 'dung-sai', ten: 'Đúng / Sai' },
];

const inputClass =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]';

const textareaClass =
  'w-full resize-y rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]';

const labelClass = 'mb-1.5 block text-sm font-medium text-[#374151]';

type ModalTab = 'thong-tin' | 'cau-hoi';

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parsePeriod(value: string): number {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

type ModalTaoBaiHocProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
};

export default function ModalTaoBaiHoc({ isOpen, onClose, onSave }: ModalTaoBaiHocProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('thong-tin');
  const [tenBaiHoc, setTenBaiHoc] = useState('');
  const [nguoiBienSoan, setNguoiBienSoan] = useState<Option | null>(null);
  const [ngayNhap, setNgayNhap] = useState(todayIsoDate());
  const [noiDung, setNoiDung] = useState('');
  const [lt, setLt] = useState('0');
  const [th, setTh] = useState('0');
  const [tt, setTt] = useState('0');
  const [loaiCauHoi, setLoaiCauHoi] = useState<Option | null>(null);
  const [cauHoi, setCauHoi] = useState('');

  const tongTiet = useMemo(
    () => parsePeriod(lt) + parsePeriod(th) + parsePeriod(tt),
    [lt, th, tt],
  );

  useEffect(() => {
    setPortalRoot(document.getElementById(MODAL_ROOT_ID));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('thong-tin');
      setTenBaiHoc('');
      setNguoiBienSoan(null);
      setNgayNhap(todayIsoDate());
      setNoiDung('');
      setLt('0');
      setTh('0');
      setTt('0');
      setLoaiCauHoi(null);
      setCauHoi('');
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
        className="flex h-[min(780px,calc(100vh-7rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tao-bai-hoc-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] px-6 py-4">
          <div>
            <h2 id="tao-bai-hoc-title" className="text-lg font-bold text-[#111827]">
              Tạo bài học mới
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">Nhập thông tin bài học và nội dung giảng dạy</p>
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

        <div className="shrink-0 px-6 pt-4">
          <div className="flex rounded-lg bg-[#f3f4f6] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('thong-tin')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'thong-tin'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              Thông tin bài học
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cau-hoi')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'cau-hoi'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              Thêm câu hỏi
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-4">
          <div
            className={`flex min-h-0 flex-1 flex-col overflow-hidden ${activeTab !== 'thong-tin' ? 'hidden' : ''}`}
            aria-hidden={activeTab !== 'thong-tin'}
          >
              <section className="mb-4 shrink-0">
                <h3 className="mb-3 text-base font-semibold text-[#111827]">Thông tin chung</h3>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass} htmlFor="ten-bai-hoc">
                      Tên bài học
                    </label>
                    <input
                      id="ten-bai-hoc"
                      type="text"
                      className={inputClass}
                      placeholder="VD: Kỹ thuật tiêm truyền"
                      value={tenBaiHoc}
                      onChange={(e) => setTenBaiHoc(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="nguoi-bien-soan">
                        Người biên soạn
                      </label>
                      <CustomComboBox
                        id="nguoi-bien-soan"
                        options={AUTHOR_OPTIONS}
                        value={nguoiBienSoan}
                        onChange={setNguoiBienSoan}
                        placeholder="Chọn người biên soạn"
                        {...modalComboBoxProps}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="ngay-nhap">
                        Ngày nhập
                      </label>
                      <input
                        id="ngay-nhap"
                        type="date"
                        className={inputClass}
                        value={ngayNhap}
                        onChange={(e) => setNgayNhap(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-4 flex min-h-0 flex-1 flex-col">
                <label className={`${labelClass} shrink-0`} htmlFor="noi-dung-bai-hoc">
                  Nội dung bài học
                </label>
                <textarea
                  id="noi-dung-bai-hoc"
                  className={`${textareaClass} mt-0 min-h-[5.5rem] flex-1 resize-none`}
                  placeholder="Nhập nội dung bài giảng..."
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                />
              </section>

              <section className="shrink-0">
                <h3 className="mb-3 text-base font-semibold text-[#111827]">Số tiết định biên</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className={labelClass} htmlFor="tiet-lt">
                      Lý thuyết
                    </label>
                    <input
                      id="tiet-lt"
                      type="number"
                      min={0}
                      className={inputClass}
                      value={lt}
                      onChange={(e) => setLt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="tiet-th">
                      Thực hành
                    </label>
                    <input
                      id="tiet-th"
                      type="number"
                      min={0}
                      className={inputClass}
                      value={th}
                      onChange={(e) => setTh(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="tiet-tt">
                      Thực tế
                    </label>
                    <input
                      id="tiet-tt"
                      type="number"
                      min={0}
                      className={inputClass}
                      value={tt}
                      onChange={(e) => setTt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="tiet-tong">
                      Tổng
                    </label>
                    <input
                      id="tiet-tong"
                      type="number"
                      readOnly
                      className={`${inputClass} bg-[#f9fafb] text-[#111827]`}
                      value={tongTiet}
                      aria-readonly
                    />
                  </div>
                </div>
              </section>
          </div>

          <div
            className={`flex min-h-0 flex-1 flex-col overflow-hidden ${activeTab !== 'cau-hoi' ? 'hidden' : ''}`}
            aria-hidden={activeTab !== 'cau-hoi'}
          >
            <section className="flex min-h-0 flex-1 flex-col">
              <h3 className="mb-4 shrink-0 text-base font-semibold text-[#111827]">
                Thêm câu hỏi vào ngân hàng
              </h3>
              <div className="flex min-h-0 flex-1 flex-col space-y-4">
                <div className="shrink-0">
                  <label className={labelClass} htmlFor="loai-cau-hoi">
                    Loại câu hỏi
                  </label>
                  <CustomComboBox
                    id="loai-cau-hoi"
                    options={LOAI_CAU_HOI_OPTIONS}
                    value={loaiCauHoi}
                    onChange={setLoaiCauHoi}
                    placeholder="Chọn loại"
                    {...modalComboBoxProps}
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col">
                  <label className={labelClass} htmlFor="noi-dung-cau-hoi">
                    Câu hỏi
                  </label>
                  <textarea
                    id="noi-dung-cau-hoi"
                    className={`${textareaClass} min-h-[12rem] flex-1`}
                    placeholder="Nhập nội dung câu hỏi..."
                    value={cauHoi}
                    onChange={(e) => setCauHoi(e.target.value)}
                  />
                </div>
              </div>
            </section>
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
            className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
          >
            Lưu bài học
          </button>
        </div>
      </div>
    </div>,
    portalRoot,
  );
}
