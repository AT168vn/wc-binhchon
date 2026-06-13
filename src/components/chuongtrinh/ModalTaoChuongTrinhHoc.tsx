'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Plus, Upload, X } from 'lucide-react';
import CustomComboBox, { type Option } from '@/components/ui/CustomComboBox';
import { modalComboBoxProps, optionByMa } from '@/components/ui/modal-combobox-props';

const MODAL_ROOT_ID = 'homepage-modal-root';

type ContentItem = {
  id: string;
  title: string;
  periods: string;
};

type TaiLieuBanHanh = {
  id: string;
  soKyHieu: string;
  loaiTaiLieu: string;
  ngayBanHanh: string;
  ngayHieuLuc: string;
};

const CONTENT_ITEMS: ContentItem[] = [
  { id: '1', title: 'Chương trình đào tạo định hướng nghề nghiệp', periods: '4 tiết' },
  { id: '2', title: 'Kỹ năng lắng nghe', periods: '8 tiết' },
  { id: '3', title: 'Kỹ năng giao tiếp', periods: '6 tiết' },
  { id: '4', title: 'Kỹ năng làm việc nhóm', periods: '8 tiết' },
];

const LOAI_CHUONG_TRINH_OPTIONS: Option[] = [
  { ma: 'co-ban', ten: 'Cơ bản' },
  { ma: 'nang-cao', ten: 'Nâng cao' },
];

const LOAI_CHUNG_NHAN_OPTIONS: Option[] = [
  { ma: 'cc', ten: 'Cấp chứng chỉ' },
  { ma: 'cn', ten: 'Chứng nhận' },
];

const DE_THI_OPTIONS: Option[] = [{ ma: 'de-1', ten: 'Đề thi mẫu 1' }];

const TEMPLATE_CC_OPTIONS: Option[] = [{ ma: 'mau-1', ten: 'Mẫu chứng chỉ 1' }];

const LOAI_TAI_LIEU_OPTIONS: Option[] = [
  { ma: 'quyet-dinh', ten: 'Quyết định' },
  { ma: 'cong-van', ten: 'Công văn' },
  { ma: 'thong-tu', ten: 'Thông tư' },
];

const inputClass =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]';

const labelClass = 'mb-1.5 block text-sm font-medium text-[#374151]';

type DieuKienTuyChinh = {
  id: string;
  noiDung: string;
};

function createTaiLieu(): TaiLieuBanHanh {
  return {
    id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    soKyHieu: '',
    loaiTaiLieu: 'quyet-dinh',
    ngayBanHanh: '',
    ngayHieuLuc: '',
  };
}

function createDieuKienTuyChinh(): DieuKienTuyChinh {
  return {
    id: `dk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    noiDung: '',
  };
}

type ModalTaoChuongTrinhHocProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
};

export default function ModalTaoChuongTrinhHoc({ isOpen, onClose, onSave }: ModalTaoChuongTrinhHocProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [selectedContent, setSelectedContent] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
    '4': true,
  });
  const [taiLieuList, setTaiLieuList] = useState<TaiLieuBanHanh[]>([]);
  const [dieuKienTuyChinhList, setDieuKienTuyChinhList] = useState<DieuKienTuyChinh[]>([]);
  const [loaiChuongTrinh, setLoaiChuongTrinh] = useState<Option | null>(null);
  const [loaiChungNhan, setLoaiChungNhan] = useState<Option | null>(null);
  const [deThi, setDeThi] = useState<Option | null>(null);
  const [templateCc, setTemplateCc] = useState<Option | null>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById(MODAL_ROOT_ID));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setTaiLieuList([]);
      setDieuKienTuyChinhList([]);
      setLoaiChuongTrinh(null);
      setLoaiChungNhan(null);
      setDeThi(null);
      setTemplateCc(null);
    }
  }, [isOpen]);

  if (!isOpen || !portalRoot) return null;

  const toggleContent = (id: string) => {
    setSelectedContent((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    onSave?.();
    onClose();
  };

  const handleThemTaiLieu = () => {
    setTaiLieuList((prev) => [...prev, createTaiLieu()]);
  };

  const handleXoaTaiLieu = (id: string) => {
    setTaiLieuList((prev) => prev.filter((item) => item.id !== id));
  };

  const updateTaiLieu = (id: string, field: keyof Omit<TaiLieuBanHanh, 'id'>, value: string) => {
    setTaiLieuList((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleThemDieuKienTuyChinh = () => {
    setDieuKienTuyChinhList((prev) => [...prev, createDieuKienTuyChinh()]);
  };

  const handleXoaDieuKienTuyChinh = (id: string) => {
    setDieuKienTuyChinhList((prev) => prev.filter((item) => item.id !== id));
  };

  const updateDieuKienTuyChinh = (id: string, noiDung: string) => {
    setDieuKienTuyChinhList((prev) => prev.map((item) => (item.id === id ? { ...item, noiDung } : item)));
  };

  return createPortal(
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center overflow-y-auto bg-black/10 p-4">
      <div
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tao-chuong-trinh-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] px-6 py-4">
          <div>
            <h2 id="tao-chuong-trinh-title" className="text-lg font-bold text-[#111827]">
              Tạo chương trình học mới
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">Nhập thông tin chương trình đào tạo và cấu trúc nội dung</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <section className="mb-6">
            <h3 className="mb-4 text-base font-semibold text-[#111827]">Thông tin chung</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="ten-chuong-trinh">
                  Tên chương trình
                </label>
                <input
                  id="ten-chuong-trinh"
                  type="text"
                  className={inputClass}
                  placeholder="VD: Chứng chỉ Điều dưỡng Cơ bản"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="ma-chuong-trinh">
                    Mã chương trình
                  </label>
                  <input
                    id="ma-chuong-trinh"
                    type="text"
                    className={inputClass}
                    placeholder="VD: DDC-2026-K01"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="loai-chuong-trinh">
                    Loại chương trình
                  </label>
                  <CustomComboBox
                    id="loai-chuong-trinh"
                    options={LOAI_CHUONG_TRINH_OPTIONS}
                    value={loaiChuongTrinh}
                    onChange={setLoaiChuongTrinh}
                    placeholder="Chọn loại"
                    {...modalComboBoxProps}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="loai-chung-nhan">
                    Loại chứng nhận
                  </label>
                  <CustomComboBox
                    id="loai-chung-nhan"
                    options={LOAI_CHUNG_NHAN_OPTIONS}
                    value={loaiChungNhan}
                    onChange={setLoaiChungNhan}
                    placeholder="Chọn loại"
                    {...modalComboBoxProps}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="hoc-phi">
                    Học phí (không bắt buộc)
                  </label>
                  <input id="hoc-phi" type="text" className={inputClass} placeholder="VD: 5000000" />
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <h3 className="mb-4 text-base font-semibold text-[#111827]">Cấu trúc nội dung</h3>
            <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
              <ul className="divide-y divide-[#e5e7eb]">
                {CONTENT_ITEMS.map((item) => (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-[#f9fafb]">
                      <input
                        type="checkbox"
                        checked={!!selectedContent[item.id]}
                        onChange={() => toggleContent(item.id)}
                        className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] text-[#111827] focus:ring-[#2563eb]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[#111827]">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-[#6b7280]">{item.periods}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mb-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-[#111827]">Điều kiện hoàn thành</h3>
              <button
                type="button"
                onClick={handleThemDieuKienTuyChinh}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
              >
                <Plus className="h-4 w-4" />
                Tạo điều kiện hoàn thành
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="diem-danh">
                    Điểm danh tối thiểu (%)
                  </label>
                  <input id="diem-danh" type="number" min={0} max={100} className={inputClass} defaultValue="80" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="de-thi">
                    Đề thi (không bắt buộc)
                  </label>
                  <CustomComboBox
                    id="de-thi"
                    options={DE_THI_OPTIONS}
                    value={deThi}
                    onChange={setDeThi}
                    placeholder="Chọn đề thi"
                    {...modalComboBoxProps}
                  />
                </div>
              </div>

              {dieuKienTuyChinhList.length > 0 && (
                <div>
                  <p className={labelClass}>Điều kiện tùy chỉnh</p>
                  <ul className="space-y-2">
                    {dieuKienTuyChinhList.map((dieuKien) => (
                      <li key={dieuKien.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          className={`${inputClass} bg-[#f9fafb]`}
                          placeholder="VD: Hoàn thành bài tập thực hành"
                          value={dieuKien.noiDung}
                          onChange={(e) => updateDieuKienTuyChinh(dieuKien.id, e.target.value)}
                          aria-label="Điều kiện tùy chỉnh"
                        />
                        <button
                          type="button"
                          onClick={() => handleXoaDieuKienTuyChinh(dieuKien.id)}
                          className="shrink-0 rounded p-1 text-[#dc2626] transition-colors hover:bg-[#fef2f2] hover:text-[#b91c1c]"
                          aria-label="Xóa điều kiện"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className={labelClass} htmlFor="template-cc">
                  Template mẫu CC/CN
                </label>
                <CustomComboBox
                  id="template-cc"
                  options={TEMPLATE_CC_OPTIONS}
                  value={templateCc}
                  onChange={setTemplateCc}
                  placeholder="Chọn mẫu"
                  {...modalComboBoxProps}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-[#111827]">Thông tin quyết định ban hành</h3>
              <button
                type="button"
                onClick={handleThemTaiLieu}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
              >
                <Plus className="h-4 w-4" />
                Thêm tài liệu
              </button>
            </div>

            {taiLieuList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] px-6 py-10 text-center">
                <FileText className="mb-3 h-10 w-10 text-[#9ca3af]" />
                <p className="text-sm font-medium text-[#6b7280]">Chưa có tài liệu đính kèm</p>
                <p className="mt-1 text-xs text-[#9ca3af]">
                  Nhấn &apos;Thêm tài liệu&apos; để bổ sung quyết định, công văn
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {taiLieuList.map((taiLieu) => (
                  <div
                    key={taiLieu.id}
                    className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor={`so-ky-hieu-${taiLieu.id}`}>
                          Số/Ký hiệu
                        </label>
                        <input
                          id={`so-ky-hieu-${taiLieu.id}`}
                          type="text"
                          className={inputClass}
                          placeholder="VD: 125/QĐ-BV"
                          value={taiLieu.soKyHieu}
                          onChange={(e) => updateTaiLieu(taiLieu.id, 'soKyHieu', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor={`loai-tl-${taiLieu.id}`}>
                          Loại tài liệu
                        </label>
                        <CustomComboBox
                          id={`loai-tl-${taiLieu.id}`}
                          options={LOAI_TAI_LIEU_OPTIONS}
                          value={optionByMa(LOAI_TAI_LIEU_OPTIONS, taiLieu.loaiTaiLieu)}
                          onChange={(opt) =>
                            updateTaiLieu(taiLieu.id, 'loaiTaiLieu', opt?.ma ?? 'quyet-dinh')
                          }
                          placeholder="Chọn loại tài liệu"
                          {...modalComboBoxProps}
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor={`ngay-bh-${taiLieu.id}`}>
                          Ngày ban hành
                        </label>
                        <input
                          id={`ngay-bh-${taiLieu.id}`}
                          type="date"
                          className={inputClass}
                          value={taiLieu.ngayBanHanh}
                          onChange={(e) => updateTaiLieu(taiLieu.id, 'ngayBanHanh', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor={`ngay-hl-${taiLieu.id}`}>
                          Ngày hiệu lực
                        </label>
                        <input
                          id={`ngay-hl-${taiLieu.id}`}
                          type="date"
                          className={inputClass}
                          value={taiLieu.ngayHieuLuc}
                          onChange={(e) => updateTaiLieu(taiLieu.id, 'ngayHieuLuc', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
                      >
                        <Upload className="h-4 w-4" />
                        Tải lên file
                      </button>
                      <button
                        type="button"
                        onClick={() => handleXoaTaiLieu(taiLieu.id)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#dc2626] transition-colors hover:text-[#b91c1c]"
                      >
                        <X className="h-4 w-4" />
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            Lưu chương trình
          </button>
        </div>
      </div>
    </div>,
    portalRoot,
  );
}
