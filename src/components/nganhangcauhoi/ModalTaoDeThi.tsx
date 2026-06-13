'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import CustomComboBox, { type Option } from '@/components/ui/CustomComboBox';
import { modalComboBoxProps } from '@/components/ui/modal-combobox-props';

const MODAL_ROOT_ID = 'homepage-modal-root';

const NGUOI_TAO_OPTIONS: Option[] = [
  { ma: 'bs-nguyen-thi-b', ten: 'BS. Nguyễn Thị B' },
  { ma: 'ths-tran-van-a', ten: 'ThS. Trần Văn A' },
  { ma: 'ts-tran-van-c', ten: 'TS. Trần Văn C' },
];

const BAI_HOC_OPTIONS: Option[] = [
  { ma: 'lang-nghe', ten: 'Kỹ năng lắng nghe' },
  { ma: 'giao-tiep', ten: 'Kỹ năng giao tiếp' },
  { ma: 'lam-viec-nhom', ten: 'Kỹ năng làm việc nhóm' },
];

const inputClass =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]';

const labelClass = 'mb-1.5 block text-sm font-medium text-[#374151]';

type LessonBlock = {
  id: string;
  lesson: Option | null;
};

function todayDisplayDate(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

let nextLessonBlockId = 0;

function createLessonBlock(): LessonBlock {
  nextLessonBlockId += 1;
  return { id: String(nextLessonBlockId), lesson: null };
}

type ModalTaoDeThiProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
};

export default function ModalTaoDeThi({ isOpen, onClose, onSave }: ModalTaoDeThiProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [tenDeThi, setTenDeThi] = useState('');
  const [nguoiTao, setNguoiTao] = useState<Option | null>(null);
  const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>([createLessonBlock()]);
  const [trungBinh, setTrungBinh] = useState('5.0');
  const [kha, setKha] = useState('7.0');
  const [gioi, setGioi] = useState('8.5');
  const [xuatSac, setXuatSac] = useState('9.5');

  useEffect(() => {
    setPortalRoot(document.getElementById(MODAL_ROOT_ID));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setTenDeThi('');
      setNguoiTao(null);
      setLessonBlocks([createLessonBlock()]);
      setTrungBinh('5.0');
      setKha('7.0');
      setGioi('8.5');
      setXuatSac('9.5');
    }
  }, [isOpen]);

  if (!isOpen || !portalRoot) return null;

  const handleAddLessonBlock = () => {
    setLessonBlocks((prev) => [...prev, createLessonBlock()]);
  };

  const handleLessonChange = (blockId: string, value: Option | null) => {
    setLessonBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? { ...block, lesson: value } : block))
    );
  };

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
        aria-labelledby="tao-de-thi-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] px-6 py-4">
          <div>
            <h2 id="tao-de-thi-title" className="text-lg font-bold text-[#111827]">
              Tạo đề thi mới
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Chọn câu hỏi từ ngân hàng và thiết lập cấu trúc đề thi
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
            <h3 className="text-sm font-semibold text-[#111827]">Thông tin đề thi</h3>

            <div>
              <label htmlFor="ten-de-thi" className={labelClass}>
                Tên đề thi
              </label>
              <input
                id="ten-de-thi"
                type="text"
                className={inputClass}
                placeholder="VD: Đề thi Cuối khóa"
                value={tenDeThi}
                onChange={(e) => setTenDeThi(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Người tạo</label>
                <CustomComboBox
                  options={NGUOI_TAO_OPTIONS}
                  value={nguoiTao}
                  onChange={setNguoiTao}
                  placeholder="Chọn người tạo"
                  {...modalComboBoxProps}
                />
              </div>
              <div>
                <label htmlFor="thoi-diem-tao" className={labelClass}>
                  Thời điểm tạo
                </label>
                <input
                  id="thoi-diem-tao"
                  type="text"
                  readOnly
                  className={`${inputClass} bg-[#f9fafb]`}
                  value={todayDisplayDate()}
                />
              </div>
            </div>
          </section>

          <section className="mt-8 border-t border-[#e5e7eb] pt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#111827]">Chọn câu hỏi theo bài học</h3>
              <button
                type="button"
                onClick={handleAddLessonBlock}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
              >
                <Plus className="h-4 w-4" />
                Thêm bài học khác
              </button>
            </div>

            <div className="space-y-4">
              {lessonBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4"
                >
                  <p className="mb-3 text-sm font-semibold text-[#111827]">
                    Bài học #{index + 1}
                  </p>
                  <div>
                    <label className={labelClass}>Chọn bài học</label>
                    <CustomComboBox
                      options={BAI_HOC_OPTIONS}
                      value={block.lesson}
                      onChange={(value) => handleLessonChange(block.id, value)}
                      placeholder="Chọn bài học"
                      {...modalComboBoxProps}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 border-t border-[#e5e7eb] pt-8">
            <h3 className="mb-3 text-sm font-semibold text-[#111827]">Cài đặt điểm số</h3>
            <div className="mb-4 flex flex-wrap items-baseline gap-2">
              <span className="text-sm text-[#6b7280]">Tổng điểm cao nhất</span>
              <span className="text-xl font-bold text-[#111827]">10 điểm</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label htmlFor="trung-binh" className={labelClass}>
                  Trung bình (≥)
                </label>
                <input
                  id="trung-binh"
                  type="text"
                  className={`${inputClass} bg-[#f9fafb]`}
                  value={trungBinh}
                  onChange={(e) => setTrungBinh(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="kha" className={labelClass}>
                  Khá (≥)
                </label>
                <input
                  id="kha"
                  type="text"
                  className={`${inputClass} bg-[#f9fafb]`}
                  value={kha}
                  onChange={(e) => setKha(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="gioi" className={labelClass}>
                  Giỏi (≥)
                </label>
                <input
                  id="gioi"
                  type="text"
                  className={`${inputClass} bg-[#f9fafb]`}
                  value={gioi}
                  onChange={(e) => setGioi(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="xuat-sac" className={labelClass}>
                  Xuất sắc (≥)
                </label>
                <input
                  id="xuat-sac"
                  type="text"
                  className={`${inputClass} bg-[#f9fafb]`}
                  value={xuatSac}
                  onChange={(e) => setXuatSac(e.target.value)}
                />
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
            Lưu đề thi
          </button>
        </div>
      </div>
    </div>,
    portalRoot
  );
}
