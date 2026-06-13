'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, Plus, Users } from 'lucide-react';
import ModalTaoChuongTrinhHoc from '@/components/chuongtrinh/ModalTaoChuongTrinhHoc';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

type ProgramStatus = 'open' | 'closed';
type ClassStatus = 'studying' | 'completed';

type ProgramClass = {
  id: string;
  name: string;
  status: ClassStatus;
  students: string;
  startDate: string;
};

type Program = {
  id: string;
  name: string;
  code: string;
  status: ProgramStatus;
  lessonCount: number;
  certificateType: string;
  classes: ProgramClass[];
};

const PROGRAMS: Program[] = [
  {
    id: 'ddc-2026',
    name: 'Chương trình Điều dưỡng Đa khoa',
    code: 'DDC-2026',
    status: 'open',
    lessonCount: 5,
    certificateType: 'Cấp chứng chỉ',
    classes: [
      {
        id: 'ddc-k12',
        name: 'DDC K12',
        status: 'studying',
        students: '28/30',
        startDate: '15-01-2026',
      },
      {
        id: 'ddc-k11',
        name: 'DDC K11',
        status: 'completed',
        students: '30/30',
        startDate: '10-11-2025',
      },
    ],
  },
  {
    id: 'knm-2026',
    name: 'Kỹ năng mềm cho Nhân viên Y tế',
    code: 'KNM-2026',
    status: 'open',
    lessonCount: 8,
    certificateType: 'Chứng nhận',
    classes: [
      {
        id: 'knm-k3',
        name: 'KNM K3',
        status: 'studying',
        students: '22/25',
        startDate: '01-02-2026',
      },
    ],
  },
  {
    id: 'xn-2026',
    name: 'Xét nghiệm Y học Nâng cao',
    code: 'XN-2026',
    status: 'closed',
    lessonCount: 12,
    certificateType: 'Cấp chứng chỉ',
    classes: [
      {
        id: 'xn-k5',
        name: 'XN K5',
        status: 'completed',
        students: '18/18',
        startDate: '20-09-2025',
      },
    ],
  },
];

function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  if (status === 'open') {
    return (
      <span className="inline-flex rounded-full bg-[#111827] px-2.5 py-0.5 text-sm font-medium text-white">
        Đang mở
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-[#e5e7eb] bg-[#f3f4f6] px-2.5 py-0.5 text-sm font-medium text-[#6b7280]">
      Đã đóng
    </span>
  );
}

function ClassStatusBadge({ status }: { status: ClassStatus }) {
  if (status === 'studying') {
    return (
      <span className="inline-flex rounded-full bg-[#111827] px-2.5 py-0.5 text-sm font-medium text-white">
        Đang học
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-[#e5e7eb] bg-[#f3f4f6] px-2.5 py-0.5 text-sm font-medium text-[#6b7280]">
      Đã hoàn thành
    </span>
  );
}

export default function ChuongTrinhPage() {
  const { showSnackbar } = useAppSnackbar();
  const [selectedId, setSelectedId] = useState(PROGRAMS[0]?.id ?? '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedProgram = useMemo(
    () => PROGRAMS.find((p) => p.id === selectedId) ?? PROGRAMS[0],
    [selectedId]
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
        >
          <Plus className="h-4 w-4" />
          Thêm chương trình
        </button>
      </div>

      <ModalTaoChuongTrinhHoc
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={() => showSnackbar('Đã lưu chương trình học', 'success')}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,340px)_1fr]">
        <aside className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] px-4 py-3">
            <h2 className="text-lg font-bold text-[#111827] md:text-xl">Danh sách chương trình</h2>            
          </div>
          <ul className="p-2">
            {PROGRAMS.map((program) => {
              const isSelected = program.id === selectedProgram?.id;
              return (
                <li key={program.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(program.id)}
                    className={`mb-1 flex w-full items-center gap-2 rounded-lg border px-3 py-3 text-left transition-colors last:mb-0 ${
                      isSelected
                        ? 'border-[#bfdbfe] bg-[#eff6ff]'
                        : 'border-transparent hover:bg-[#f9fafb]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#111827]">{program.name}</p>
                      <p className="mt-0.5 text-sm text-[#6b7280]">{program.code}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <ProgramStatusBadge status={program.status} />
                        <span className="text-sm text-[#6b7280]">{program.lessonCount} bài học</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#9ca3af]" />
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          {selectedProgram ? (
            <>
              <div className="border-b border-[#e5e7eb] px-4 py-4">
                <h2 className="text-lg font-bold text-[#111827] md:text-xl">{selectedProgram.name}</h2>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Mã: {selectedProgram.code} • {selectedProgram.certificateType}
                </p>
              </div>

              <div className="border-b border-[#e5e7eb] px-4 py-3">
                <h3 className="text-base font-semibold text-[#111827]">Thông tin chung</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 border-b border-[#e5e7eb] px-4 py-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-[#6b7280]">Loại chứng nhận</p>
                    <p className="mt-1 text-sm font-medium text-[#111827]">{selectedProgram.certificateType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6b7280]">Tổng số bài học</p>
                    <p className="mt-1 text-sm font-medium text-[#111827]">{selectedProgram.lessonCount} bài</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6b7280]">Trạng thái</p>
                    <div className="mt-1">
                      <ProgramStatusBadge status={selectedProgram.status} />
                    </div>
                  </div>
                </div>

              <div>
                <div className="flex items-center justify-between gap-2 border-b border-[#e5e7eb] px-4 py-3">
                  <h3 className="text-base font-semibold text-[#111827]">Lớp học đang áp dụng</h3>
                  <span className="text-sm text-[#6b7280]">{selectedProgram.classes.length} lớp</span>
                </div>
                <div className="space-y-3 p-4">
                  {selectedProgram.classes.map((cls) => (
                    <article
                      key={cls.id}
                      className="rounded-lg border border-[#e5e7eb] bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-semibold text-[#111827]">{cls.name}</p>
                        <ClassStatusBadge status={cls.status} />
                      </div>

                      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[#6b7280]">
                        <span className="inline-flex items-center gap-1.5 text-[#374151]">
                          <Users className="h-4 w-4 shrink-0" />
                          <span>{cls.students}</span>
                        </span>
                        <span>Bắt đầu: {cls.startDate}</span>
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="px-4 py-6 text-sm text-[#6b7280]">Chưa có chương trình nào.</p>
          )}
        </section>
      </div>
    </div>
  );
}
