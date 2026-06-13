'use client';

import { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

type ProgramType = {
  id: string;
  name: string;
  code: string;
  description: string;
  programCount: number;
};

const PROGRAM_TYPES: ProgramType[] = [
  {
    id: '1',
    name: 'Kỹ thuật chuyên môn khám bệnh chữa bệnh',
    code: 'KTCM',
    description: 'Các chương trình đào tạo chuyên môn y khoa',
    programCount: 12,
  },
  {
    id: '2',
    name: 'Đào tạo bồi dưỡng ngắn hạn',
    code: 'DTBD',
    description: 'Các khóa đào tạo kỹ năng ngắn hạn',
    programCount: 8,
  },
];

type ProgramTypeRowProps = {
  item: ProgramType;
  onEdit: (item: ProgramType) => void;
};

function ProgramTypeRow({ item, onEdit }: ProgramTypeRowProps) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]"
            aria-hidden
          >
            <Tag className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-[#111827]">{item.name}</h3>
              <span className="inline-flex rounded-md bg-[#111827] px-2 py-0.5 text-xs font-medium text-white">
                {item.code}
              </span>
            </div>

            <p className="mt-1.5 text-sm text-[#6b7280]">{item.description}</p>

            <p className="mt-1 text-sm text-[#9ca3af]">
              {item.programCount} chương trình đào tạo
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onEdit(item)}
          className="inline-flex shrink-0 items-center justify-center self-start rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb] sm:self-center"
        >
          Chỉnh sửa
        </button>
    </article>
  );
}

export default function LoaiChuongTrinhPage() {
  const { showSnackbar } = useAppSnackbar();
  const [programTypes] = useState(PROGRAM_TYPES);

  const handleAdd = () => {
    showSnackbar('Chức năng thêm loại chương trình đang phát triển', 'success');
  };

  const handleEdit = (_item: ProgramType) => {
    showSnackbar('Chức năng chỉnh sửa loại chương trình đang phát triển', 'success');
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
        >
          <Plus className="h-4 w-4" />
          Thêm loại chương trình
        </button>
      </div>

      <div className="space-y-3">
        {programTypes.length > 0 ? (
          programTypes.map((item) => (
            <ProgramTypeRow key={item.id} item={item} onEdit={handleEdit} />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-[#e5e7eb] bg-white px-4 py-8 text-center text-sm text-[#6b7280]">
            Chưa có loại chương trình nào. Nhấn &quot;Thêm loại chương trình&quot; để tạo mới.
          </p>
        )}
      </div>
    </div>
  );
}
