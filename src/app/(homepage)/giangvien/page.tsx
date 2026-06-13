'use client';

import { useState } from 'react';
import {
  Award,
  BookOpen,
  Clock,
  Star,
} from 'lucide-react';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

type TabId = 'lop-hoc' | 'lich-su' | 'danh-gia' | 'chung-chi';

type TeachingClass = {
  id: string;
  title: string;
  status: 'ongoing' | 'finished';
  students: number;
  lessonsDone: number;
  lessonsTotal: number;
  progressPercent: number;
};

type MonthlyTeaching = {
  id: string;
  month: string;
  classCount: number;
  periods: number;
  barPercent: number;
};

type StudentReview = {
  id: string;
  studentName: string;
  date: string;
  rating: number;
  comment: string;
};

type LecturerCertificate = {
  id: string;
  title: string;
  year: string;
};

const LECTURER = {
  initials: 'NB',
  name: 'BS. Nguyễn Thị B',
  title: 'Bác sĩ Chuyên khoa II • Khoa Điều dưỡng',
  workplace: 'Bệnh viện Tâm Anh Quận 7',
  address: '1 Đường số 1, KDC Vạn Phúc, Q.7, TP.HCM',
  specialties: ['Điều dưỡng Nội khoa', 'Kỹ thuật tiêm truyền', 'Chăm sóc người bệnh'],
};

const STATS = {
  totalPeriods: 100,
  activeClasses: 3,
  averageRating: 4.7,
  certificates: 3,
};

const TEACHING_CLASSES: TeachingClass[] = [
  {
    id: '1',
    title: 'Chương trình Điều dưỡng Đa khoa K12',
    status: 'ongoing',
    students: 28,
    lessonsDone: 10,
    lessonsTotal: 15,
    progressPercent: 65,
  },
  {
    id: '2',
    title: 'Kỹ năng mềm cho Nhân viên Y tế K8',
    status: 'ongoing',
    students: 22,
    lessonsDone: 7,
    lessonsTotal: 8,
    progressPercent: 85,
  },
  {
    id: '3',
    title: 'Chăm sóc Bệnh nhân Nội khoa K10',
    status: 'finished',
    students: 18,
    lessonsDone: 12,
    lessonsTotal: 12,
    progressPercent: 100,
  },
];

const MONTHLY_TEACHING: MonthlyTeaching[] = [
  { id: '1', month: 'Tháng 1', classCount: 3, periods: 24, barPercent: 75 },
  { id: '2', month: 'Tháng 2', classCount: 4, periods: 32, barPercent: 100 },
  { id: '3', month: 'Tháng 3', classCount: 3, periods: 28, barPercent: 88 },
  { id: '4', month: 'Tháng 4', classCount: 2, periods: 16, barPercent: 50 },
];

const REVIEWS: StudentReview[] = [
  {
    id: '1',
    studentName: 'Nguyễn Văn A',
    date: '20-03-2026',
    rating: 5,
    comment: 'Giảng viên nhiệt tình, giải đáp rõ ràng',
  },
  {
    id: '2',
    studentName: 'Trần Thị B',
    date: '18-03-2026',
    rating: 5,
    comment: 'Bài giảng dễ hiểu, thực hành tốt',
  },
  {
    id: '3',
    studentName: 'Lê Văn C',
    date: '15-03-2026',
    rating: 4,
    comment: 'Nội dung phong phú, cần thêm ví dụ thực tế',
  },
];

const LECTURER_CERTIFICATES: LecturerCertificate[] = [
  { id: '1', title: 'Chứng chỉ Giảng viên Y khoa', year: 'Năm 2020' },
  { id: '2', title: 'Chuyên khoa II Nội tổng hợp', year: 'Năm 2018' },
  { id: '3', title: 'Chứng chỉ Hồi sức cấp cứu', year: 'Năm 2019' },
];

const TABS: { id: TabId; label: string }[] = [
  { id: 'lop-hoc', label: 'Lớp học' },
  { id: 'lich-su', label: 'Lịch sử giảng dạy' },
  { id: 'danh-gia', label: 'Đánh giá' },
  { id: 'chung-chi', label: 'Chứng chỉ' },
];

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
      <div
        className="h-full rounded-full bg-[#2563eb] transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

function ClassStatusBadge({ status }: { status: TeachingClass['status'] }) {
  if (status === 'ongoing') {
    return (
      <span className="inline-flex rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-medium text-[#059669]">
        Đang diễn ra
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-[#e5e7eb] bg-[#f3f4f6] px-2.5 py-0.5 text-xs font-medium text-[#6b7280]">
      Đã kết thúc
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#e5e7eb]'
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

function ClassesTab() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <div className="border-b border-[#e5e7eb] px-4 py-3">
        <h3 className="text-base font-bold text-[#111827]">Lớp đang phụ trách</h3>
      </div>
      <div className="divide-y divide-[#e5e7eb]">
        {TEACHING_CLASSES.map((cls) => (
          <article key={cls.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-[#111827]">{cls.title}</h4>
                  <ClassStatusBadge status={cls.status} />
                </div>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {cls.students} học viên • {cls.lessonsDone}/{cls.lessonsTotal} bài
                </p>
              </div>
              <p className="shrink-0 text-sm text-[#6b7280]">
                <span className="font-semibold text-[#111827]">{cls.progressPercent}%</span> Hoàn thành
              </p>
            </div>
            <div className="mt-3">
              <ProgressBar percent={cls.progressPercent} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TeachingHistoryTab() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <div className="border-b border-[#e5e7eb] px-4 py-3">
        <h3 className="text-base font-bold text-[#111827]">Lịch sử số tiết đã dạy</h3>
      </div>
      <div className="divide-y divide-[#e5e7eb]">
        {MONTHLY_TEACHING.map((item) => (
          <article key={item.id} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[100px_1fr_auto] sm:items-center sm:gap-4">
            <p className="font-semibold text-[#111827]">{item.month}</p>
            <div className="min-w-0">
              <p className="mb-2 text-sm text-[#6b7280]">{item.classCount} lớp học</p>
              <ProgressBar percent={item.barPercent} />
            </div>
            <p className="text-right text-base font-bold text-[#111827] sm:text-left">
              {item.periods} tiết
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ReviewsTab() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e7eb] px-4 py-3">
        <h3 className="text-base font-bold text-[#111827]">Đánh giá từ học viên</h3>
        <p className="flex items-center gap-1 text-sm font-semibold text-[#111827]">
          <Star className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" aria-hidden />
          {STATS.averageRating} / 5.0
        </p>
      </div>
      <div className="divide-y divide-[#e5e7eb]">
        {REVIEWS.map((review) => (
          <article key={review.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-[#111827]">{review.studentName}</p>
              <p className="shrink-0 text-sm text-[#6b7280]">{review.date}</p>
            </div>
            <div className="mt-2">
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-2 text-sm text-[#6b7280]">{review.comment}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function CertificatesTab() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <div className="border-b border-[#e5e7eb] px-4 py-3">
        <h3 className="text-base font-bold text-[#111827]">Chứng chỉ đã đạt được</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        {LECTURER_CERTIFICATES.map((cert) => (
          <article
            key={cert.id}
            className="flex items-start gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]"
              aria-hidden
            >
              <Award className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-[#111827]">{cert.title}</h4>
              <p className="mt-0.5 text-sm text-[#6b7280]">{cert.year}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function GiangVienPage() {
  const { showSnackbar } = useAppSnackbar();
  const [activeTab, setActiveTab] = useState<TabId>('lop-hoc');

  const handleEditProfile = () => {
    showSnackbar('Chức năng chỉnh sửa hồ sơ đang phát triển', 'success');
  };

  return (
    <div className="min-h-screen space-y-4 bg-[#f6f8fb] p-4 md:p-6">
      {/* Hồ sơ giảng viên */}
      <article className="rounded-lg border border-[#e5e7eb] bg-white p-4 md:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-xl font-bold text-white"
                aria-hidden
              >
                {LECTURER.initials}
              </div>
              <div className="min-w-0 flex-1 space-y-1 text-sm">
                <h2 className="text-xl font-bold text-[#111827]">{LECTURER.name}</h2>
                <p className="text-[#6b7280]">{LECTURER.title}</p>
                <p className="text-[#6b7280]">Đơn vị công tác: {LECTURER.workplace}</p>
                <p className="text-[#6b7280]">Địa chỉ: {LECTURER.address}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEditProfile}
              className="inline-flex shrink-0 items-center justify-center self-start rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb] sm:self-auto"
            >
              Chỉnh sửa hồ sơ
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {LECTURER.specialties.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#2563eb]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      {/* Thống kê */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <article className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
            <Clock className="h-5 w-5" aria-hidden />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#111827]">{STATS.totalPeriods}</p>
          <p className="mt-0.5 text-sm text-[#6b7280]">Tổng số tiết đã dạy</p>
        </article>
        <article className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ecfdf5] text-[#059669]">
            <BookOpen className="h-5 w-5" aria-hidden />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#111827]">{STATS.activeClasses}</p>
          <p className="mt-0.5 text-sm text-[#6b7280]">Lớp đang phụ trách</p>
        </article>
        <article className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff7ed] text-[#ea580c]">
            <Star className="h-5 w-5" aria-hidden />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#111827]">{STATS.averageRating}</p>
          <p className="mt-0.5 text-sm text-[#6b7280]">Đánh giá trung bình</p>
        </article>
        <article className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f3ff] text-[#7c3aed]">
            <Award className="h-5 w-5" aria-hidden />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#111827]">{STATS.certificates}</p>
          <p className="mt-0.5 text-sm text-[#6b7280]">Chứng chỉ đạt được</p>
        </article>
      </div>

      {/* Tabs */}
      <div>
        <div className="mb-4 inline-flex flex-wrap rounded-lg bg-[#f3f4f6] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'lop-hoc' && <ClassesTab />}
        {activeTab === 'lich-su' && <TeachingHistoryTab />}
        {activeTab === 'danh-gia' && <ReviewsTab />}
        {activeTab === 'chung-chi' && <CertificatesTab />}
      </div>
    </div>
  );
}
