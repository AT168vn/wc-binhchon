'use client';

import { useMemo, useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import ModalDiemDanh from '@/components/lophoc/ModalDiemDanh';
import ModalNhapHocVien from '@/components/lophoc/ModalNhapHocVien';
import ModalTaoLopHoc from '@/components/lophoc/ModalTaoLopHoc';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

type ClassStatus = 'studying' | 'completed' | 'enrolling';

type ScheduleStatus = 'completed' | 'ongoing' | 'upcoming' | 'cancelled';

type ScheduleSession = {
  id: string;
  date: string;
  session: string;
  time: string;
  subject: string;
  lecturer: string;
  status: ScheduleStatus;
};

type ClassItem = {
  id: string;
  name: string;
  programName: string;
  students: string;
  dateRange: string;
  status: ClassStatus;
  schedule: ScheduleSession[];
};

const CLASSES: ClassItem[] = [
  {
    id: 'k12',
    name: 'Điều dưỡng Đa khoa K12',
    programName: 'Chương trình Điều dưỡng Đa khoa',
    students: '28/30',
    dateRange: '15-01-2026 - 30-06-2026',
    status: 'studying',
    schedule: [
      {
        id: 'k12-1',
        date: '10-04-2026',
        session: 'Sáng',
        time: '08:00 - 11:00',
        subject: 'Kỹ năng lắng nghe',
        lecturer: 'BS. Nguyễn Thị B',
        status: 'completed',
      },
      {
        id: 'k12-2',
        date: '15-04-2026',
        session: 'Sáng',
        time: '08:00 - 11:00',
        subject: 'Kỹ năng giao tiếp',
        lecturer: 'BS. Lê Thị C',
        status: 'ongoing',
      },
    ],
  },
  {
    id: 'k13',
    name: 'Điều dưỡng Đa khoa K13',
    programName: 'Chương trình Điều dưỡng Đa khoa',
    students: '12/30',
    dateRange: '01-03-2026 - 30-08-2026',
    status: 'enrolling',
    schedule: [
      {
        id: 'k13-1',
        date: '10-04-2026',
        session: 'Sáng',
        time: '08:00 - 11:00',
        subject: 'Kỹ năng lắng nghe',
        lecturer: 'BS. Nguyễn Thị B',
        status: 'completed',
      },
      {
        id: 'k13-2',
        date: '12-04-2026',
        session: 'Chiều',
        time: '13:30 - 16:30',
        subject: 'Kỹ năng giao tiếp',
        lecturer: 'BS. Lê Thị C',
        status: 'ongoing',
      },
      {
        id: 'k13-3',
        date: '18-04-2026',
        session: 'Sáng',
        time: '08:00 - 11:00',
        subject: 'Thực hành lâm sàng cơ bản',
        lecturer: 'BS. Hoàng Văn E',
        status: 'upcoming',
      },
      {
        id: 'k13-4',
        date: '20-04-2026',
        session: 'Sáng',
        time: '08:00 - 11:00',
        subject: 'Kỹ năng làm việc nhóm',
        lecturer: 'BS. Phạm Minh D',
        status: 'cancelled',
      },
    ],
  },
  {
    id: 'knm-k8',
    name: 'Kỹ năng mềm cho Nhân viên Y tế K8',
    programName: 'Kỹ năng mềm cho Nhân viên Y tế',
    students: '22/25',
    dateRange: '01-02-2026 - 30-05-2026',
    status: 'studying',
    schedule: [
      {
        id: 'knm-1',
        date: '08-04-2026',
        session: 'Sáng',
        time: '08:00 - 11:00',
        subject: 'Kỹ năng lắng nghe',
        lecturer: 'ThS. Trần Văn A',
        status: 'completed',
      },
    ],
  },
  {
    id: 'k11',
    name: 'Điều dưỡng Đa khoa K11',
    programName: 'Chương trình Điều dưỡng Đa khoa',
    students: '30/30',
    dateRange: '10-11-2025 - 28-02-2026',
    status: 'completed',
    schedule: [
      {
        id: 'k11-1',
        date: '15-02-2026',
        session: 'Sáng',
        time: '08:00 - 11:00',
        subject: 'Tổng kết chương trình',
        lecturer: 'BS. Nguyễn Thị B',
        status: 'completed',
      },
    ],
  },
];

const SCHEDULE_STATUS_CONFIG: Record<
  ScheduleStatus,
  { label: string; cardClass: string; badgeClass: string }
> = {
  completed: {
    label: 'Đã học xong',
    cardClass: 'border-[#fde68a] bg-[#fefce8]',
    badgeClass: 'text-[#a16207]',
  },
  ongoing: {
    label: 'Đang diễn ra',
    cardClass: 'border-[#bbf7d0] bg-[#ecfdf5]',
    badgeClass: 'text-[#059669]',
  },
  upcoming: {
    label: 'Chưa học',
    cardClass: 'border-[#e5e7eb] bg-white',
    badgeClass: 'text-[#6b7280]',
  },
  cancelled: {
    label: 'Bị nghỉ',
    cardClass: 'border-[#fecdd3] bg-[#fff1f2]',
    badgeClass: 'text-[#e11d48]',
  },
};

const LEGEND_ITEMS: { status: ScheduleStatus; label: string }[] = [
  { status: 'ongoing', label: 'Đang diễn ra' },
  { status: 'completed', label: 'Đã học xong' },
  { status: 'upcoming', label: 'Chưa học' },
  { status: 'cancelled', label: 'Bị nghỉ' },
];

function ClassStatusBadge({ status }: { status: ClassStatus }) {
  if (status === 'studying') {
    return (
      <span className="inline-flex shrink-0 rounded-md bg-[#111827] px-2 py-0.5 text-xs font-medium text-white">
        Đang học
      </span>
    );
  }
  if (status === 'enrolling') {
    return (
      <span className="inline-flex shrink-0 rounded-md bg-[#eff6ff] px-2 py-0.5 text-xs font-medium text-[#2563eb]">
        Đang tuyển sinh
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 rounded-md border border-[#e5e7eb] bg-[#f3f4f6] px-2 py-0.5 text-xs font-medium text-[#6b7280]">
      Đã kết thúc
    </span>
  );
}

function ScheduleCard({
  session,
  onSelect,
}: {
  session: ScheduleSession;
  onSelect: (session: ScheduleSession) => void;
}) {
  const config = SCHEDULE_STATUS_CONFIG[session.status];
  return (
    <button
      type="button"
      onClick={() => onSelect(session)}
      className={`w-full rounded-lg border p-4 text-left transition-opacity hover:opacity-95 ${config.cardClass}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-[#111827]">{session.date}</span>
          <span className="text-[#6b7280]">•</span>
          <span className="text-[#374151]">{session.session}</span>
        </div>
        <span className={`text-sm font-medium ${config.badgeClass}`}>{config.label}</span>
      </div>
      <p className="mt-2 text-sm text-[#6b7280]">{session.time}</p>
      <p className="mt-1 font-bold text-[#111827]">{session.subject}</p>
      <p className="mt-1 text-sm text-[#6b7280]">Giảng viên: {session.lecturer}</p>
    </button>
  );
}

export default function LopHocThoiKhoaBieuPage() {
  const { showSnackbar } = useAppSnackbar();
  const [selectedId, setSelectedId] = useState('k13');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportStudentModalOpen, setIsImportStudentModalOpen] = useState(false);
  const [attendanceSession, setAttendanceSession] = useState<ScheduleSession | null>(null);

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CLASSES;
    return CLASSES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.programName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedClass = useMemo(
    () => CLASSES.find((c) => c.id === selectedId) ?? CLASSES[0],
    [selectedId]
  );

  const handleCreateClass = () => {
    setIsCreateModalOpen(true);
  };

  const handleImportStudents = () => {
    setIsImportStudentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleCreateClass}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
        >
          <Plus className="h-4 w-4" />
          Tạo lớp học
        </button>
      </div>

      <ModalTaoLopHoc
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={() => showSnackbar('Đã lưu lớp học', 'success')}
      />

      {selectedClass ? (
        <ModalNhapHocVien
          isOpen={isImportStudentModalOpen}
          onClose={() => setIsImportStudentModalOpen(false)}
          className={selectedClass.name}
          onSave={() => showSnackbar('Đã thêm học viên', 'success')}
        />
      ) : null}

      <ModalDiemDanh
        isOpen={attendanceSession !== null}
        onClose={() => setAttendanceSession(null)}
        session={attendanceSession}
        onSave={() => showSnackbar('Đã lưu điểm danh', 'success')}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,340px)_1fr]">
        {/* Danh sách lớp học */}
        <aside className="flex max-h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white lg:max-h-[calc(100vh-8rem)]">
          <div className="border-b border-[#e5e7eb] px-4 py-3">
            <h2 className="text-lg font-bold text-[#111827]">Danh sách lớp học</h2>
          </div>
          <div className="border-b border-[#e5e7eb] p-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm lớp học..."
                className="w-full rounded-lg border border-[#e5e7eb] bg-white py-2 pl-9 pr-3 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              />
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto p-2">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls) => {
                const isSelected = cls.id === selectedClass?.id;
                return (
                  <li key={cls.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(cls.id)}
                      className={`mb-1 flex w-full flex-col gap-2 rounded-lg border px-3 py-3 text-left transition-colors last:mb-0 ${
                        isSelected
                          ? 'border-[#bfdbfe] border-l-4 border-l-[#2563eb] bg-[#eff6ff]'
                          : 'border-transparent hover:bg-[#f9fafb]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 text-sm font-semibold text-[#111827]">
                          {cls.name}
                        </p>
                        <ClassStatusBadge status={cls.status} />
                      </div>
                      <p className="text-xs text-[#6b7280]">{cls.programName}</p>
                      <p className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                        <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {cls.students}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                        <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {cls.dateRange}
                      </p>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-6 text-center text-sm text-[#6b7280]">
                Không tìm thấy lớp học.
              </li>
            )}
          </ul>
        </aside>

        {/* Thời khóa biểu */}
        <section className="flex max-h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white lg:max-h-[calc(100vh-8rem)]">
          {selectedClass ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e5e7eb] px-4 py-4">
                <div>
                  <h2 className="text-lg font-bold text-[#111827] md:text-xl">
                    {selectedClass.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#6b7280]">Thời khóa biểu</p>
                </div>
                {selectedClass.status === 'enrolling' ? (
                  <button
                    type="button"
                    onClick={handleImportStudents}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Nhập học viên
                  </button>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {selectedClass.schedule.length > 0 ? (
                  selectedClass.schedule.map((session) => (
                    <ScheduleCard
                      key={session.id}
                      session={session}
                      onSelect={setAttendanceSession}
                    />
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-[#6b7280]">
                    Chưa có lịch học cho lớp này.
                  </p>
                )}
              </div>

              <div className="shrink-0 border-t border-[#e5e7eb] px-4 py-3">
                <p className="mb-2 text-sm font-semibold text-[#111827]">Chú thích màu sắc</p>
                <div className="flex flex-wrap gap-3">
                  {LEGEND_ITEMS.map((item) => {
                    const cfg = SCHEDULE_STATUS_CONFIG[item.status];
                    return (
                      <div key={item.status} className="flex items-center gap-2">
                        <span
                          className={`h-4 w-6 rounded border ${cfg.cardClass}`}
                          aria-hidden
                        />
                        <span className="text-xs text-[#6b7280]">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-[#6b7280]">
              Chọn một lớp học để xem thời khóa biểu.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
