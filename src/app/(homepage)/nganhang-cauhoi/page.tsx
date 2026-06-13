'use client';

import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus } from 'lucide-react';
import ModalTaoDeThi from '@/components/nganhangcauhoi/ModalTaoDeThi';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

type ExamStatus = 'open' | 'closed';

type ExamLesson = {
  id: string;
  name: string;
  tn: number;
  tl: number;
};

type Exam = {
  id: string;
  title: string;
  author: string;
  date: string;
  status: ExamStatus;
  lessons: ExamLesson[];
  totalQuestions: number;
  totalPoints: number;
};

const EXAMS: Exam[] = [
  {
    id: '1',
    title: 'Đề thi Cuối khóa - Điều dưỡng Đa khoa',
    author: 'BS. Nguyễn Thị B',
    date: '20-03-2026',
    status: 'open',
    lessons: [
      { id: 'l1', name: 'Kỹ năng lắng nghe', tn: 5, tl: 2 },
      { id: 'l2', name: 'Kỹ năng giao tiếp', tn: 3, tl: 1 },
      { id: 'l3', name: 'Thực hành lâm sàng cơ bản', tn: 2, tl: 0 },
    ],
    totalQuestions: 13,
    totalPoints: 10,
  },
  {
    id: '2',
    title: 'Đề thi Giữa kỳ - Kỹ năng mềm',
    author: 'ThS. Trần Văn A',
    date: '15-02-2026',
    status: 'closed',
    lessons: [
      { id: 'l4', name: 'Kỹ năng lắng nghe', tn: 4, tl: 1 },
      { id: 'l5', name: 'Kỹ năng làm việc nhóm', tn: 3, tl: 2 },
    ],
    totalQuestions: 10,
    totalPoints: 8,
  },
  {
    id: '3',
    title: 'Đề thi Thực hành - Xét nghiệm Y học',
    author: 'TS. Trần Văn C',
    date: '10-01-2026',
    status: 'open',
    lessons: [{ id: 'l6', name: 'Kỹ thuật lấy mẫu', tn: 6, tl: 0 }],
    totalQuestions: 6,
    totalPoints: 6,
  },
];

function ExamStatusBadge({ status }: { status: ExamStatus }) {
  if (status === 'open') {
    return (
      <span className="inline-flex shrink-0 rounded-md bg-[#111827] px-2 py-0.5 text-xs font-medium text-white">
        Đang mở
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 rounded-md border border-[#e5e7eb] bg-[#f3f4f6] px-2 py-0.5 text-xs font-medium text-[#6b7280]">
      Đã đóng
    </span>
  );
}

export default function NganHangCauHoiPage() {
  const { showSnackbar } = useAppSnackbar();
  const [selectedId, setSelectedId] = useState(EXAMS[0]?.id ?? '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedExam = useMemo(
    () => EXAMS.find((e) => e.id === selectedId) ?? EXAMS[0],
    [selectedId]
  );

  const lessonCount = selectedExam?.lessons.length ?? 0;

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
        >
          <Plus className="h-4 w-4" />
          Tạo đề thi
        </button>
      </div>

      <ModalTaoDeThi
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={() => showSnackbar('Đã lưu đề thi', 'success')}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Danh sách đề thi */}
        <aside className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] px-4 py-3">
            <h2 className="text-lg font-bold text-[#111827]">Danh sách đề thi</h2>
          </div>
          <ul className="p-2">
            {EXAMS.map((exam) => {
              const isSelected = exam.id === selectedExam?.id;
              return (
                <li key={exam.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(exam.id)}
                    className={`mb-2 flex w-full flex-col rounded-lg border px-3 py-3 text-left transition-colors last:mb-0 ${
                      isSelected
                        ? 'border-[#bfdbfe] border-l-4 border-l-[#2563eb] bg-[#eff6ff]'
                        : 'border-[#e5e7eb] bg-white hover:bg-[#f9fafb]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 text-sm font-semibold text-[#111827]">
                        {exam.title}
                      </p>
                      <ExamStatusBadge status={exam.status} />
                    </div>
                    <p className="mt-1 text-xs text-[#6b7280]">
                      {exam.author} • {exam.date}
                    </p>

                    <div className="mt-3 space-y-2">
                      {exam.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between gap-3 rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2"
                        >
                          <span className="min-w-0 flex-1 text-xs font-medium text-[#374151]">
                            {lesson.name}
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="rounded bg-[#eff6ff] px-2 py-0.5 text-xs font-semibold text-[#2563eb]">
                              TN: {lesson.tn}
                            </span>
                            <span className="rounded bg-[#fff7ed] px-2 py-0.5 text-xs font-semibold text-[#ea580c]">
                              TL: {lesson.tl}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#e5e7eb] pt-2 text-xs text-[#6b7280]">
                      <span>Tổng: {exam.totalQuestions} câu</span>
                      <span className="font-medium text-[#111827]">{exam.totalPoints} điểm</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Chi tiết đề thi */}
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          {selectedExam ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e5e7eb] px-4 py-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#111827] md:text-xl">
                    {selectedExam.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Tạo bởi: {selectedExam.author} • {selectedExam.date}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => showSnackbar('Chức năng xem đề thi đang phát triển', 'success')}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
                  >
                    <Eye className="h-4 w-4" />
                    Xem
                  </button>
                  <button
                    type="button"
                    onClick={() => showSnackbar('Chức năng sửa đề thi đang phát triển', 'success')}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
                  >
                    <Pencil className="h-4 w-4" />
                    Sửa
                  </button>
                </div>
              </div>

              <div className="border-b border-[#e5e7eb] px-4 py-4">
                <h3 className="mb-3 text-base font-semibold text-[#111827]">Tổng quan</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <article className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-[#2563eb]">{selectedExam.totalQuestions}</p>
                    <p className="mt-0.5 text-sm text-[#6b7280]">Tổng câu hỏi</p>
                  </article>
                  <article className="rounded-lg border border-[#bbf7d0] bg-[#ecfdf5] px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-[#059669]">{selectedExam.totalPoints}</p>
                    <p className="mt-0.5 text-sm text-[#6b7280]">Tổng điểm</p>
                  </article>
                  <article className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-[#ea580c]">{lessonCount}</p>
                    <p className="mt-0.5 text-sm text-[#6b7280]">Bài học</p>
                  </article>
                </div>
              </div>

              <div className="px-4 py-4">
                <h3 className="mb-3 text-base font-semibold text-[#111827]">
                  Chi tiết câu hỏi theo bài học
                </h3>
                <div className="space-y-3">
                  {selectedExam.lessons.map((lesson) => (
                    <article
                      key={lesson.id}
                      className="rounded-lg border border-[#e5e7eb] bg-white p-4"
                    >
                      <p className="font-bold text-[#111827]">{lesson.name}</p>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        <p>
                          <span className="text-[#6b7280]">Trắc nghiệm: </span>
                          <span className="font-medium text-[#2563eb]">{lesson.tn} câu</span>
                        </p>
                        <p>
                          <span className="text-[#6b7280]">Tự luận: </span>
                          <span className="font-medium text-[#ea580c]">{lesson.tl} câu</span>
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-[#6b7280]">
              Chọn một đề thi để xem chi tiết.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
