'use client';

import { useState, type ReactNode } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  TrendingUp,  
} from 'lucide-react';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

type TabId = 'nhat-ky' | 'chung-nhan';

type UpcomingLesson = {
  id: string;
  date: string;
  time: string;
  title: string;
  instructor: string;
  periods: string;
};

type EnrolledClass = {
  id: string;
  title: string;
  status: 'studying' | 'completed';
  instructor: string;
  startDate: string;
  endDate?: string;
  lessonsProgress: string;
  progressPercent: number;
  attendancePercent: number;
  score: string;
};

type Certificate = {
  id: string;
  title: string;
  subtitle: string;
  number: string;
  issueDate: string;
  score: string;
};

const STUDENT = {
  initials: 'NV',
  name: 'Nguyễn Văn A',
  code: 'HV2026001',
  workplace: 'Bệnh viện Đa khoa Thống Nhất',
  address: '1 Lý Thường Kiệt, P.7, Q.10, TP.HCM',
  program: 'Điều dưỡng Cơ bản',
  enrollmentDate: '15-01-2026',
};

const METRICS = {
  completion: { value: 65, trend: '+5%', label: 'Hoàn thành chương trình' },
  attendance: { value: 85, badge: 'Đạt yêu cầu', label: 'Tỷ lệ điểm danh' },
  score: { value: 7.8, scale: 'Thang điểm 10', label: 'Điểm trung bình' },
};

const UPCOMING_LESSONS: UpcomingLesson[] = [
  {
    id: '1',
    date: '15-04-2026',
    time: '08:00 - 11:00',
    title: 'Kỹ năng lắng nghe',
    instructor: 'ThS. Trần Văn A',
    periods: '8 tiết (LT: 3, TH: 2, TT: 3)',
  },
  {
    id: '2',
    date: '18-04-2026',
    time: '13:30 - 16:30',
    title: 'Kỹ năng giao tiếp',
    instructor: 'BS. Lê Thị C',
    periods: '6 tiết (LT: 2, TH: 2, TT: 2)',
  },
  {
    id: '3',
    date: '22-04-2026',
    time: '08:00 - 11:00',
    title: 'Thực hành lâm sàng cơ bản',
    instructor: 'BS. Hoàng Văn E',
    periods: '8 tiết (LT: 2, TH: 4, TT: 2)',
  },
];

const ENROLLED_CLASSES: EnrolledClass[] = [
  {
    id: '1',
    title: 'Chương trình Điều dưỡng Đa khoa K12',
    status: 'studying',
    instructor: 'BS. Nguyễn Thị B',
    startDate: '15-01-2026',
    lessonsProgress: '10/15 bài học',
    progressPercent: 65,
    attendancePercent: 85,
    score: '7.8/10',
  },
  {
    id: '2',
    title: 'Kỹ năng mềm cho Nhân viên Y tế K5',
    status: 'completed',
    instructor: 'ThS. Trần Văn A',
    startDate: '01-09-2025',
    endDate: '20-01-2026',
    lessonsProgress: '8/8 bài học',
    progressPercent: 100,
    attendancePercent: 92,
    score: '8.5/10',
  },
];

const CERTIFICATES: Certificate[] = [
  {
    id: '1',
    title: 'Chứng nhận Kỹ năng mềm cho Nhân viên Y tế',
    subtitle: 'Kỹ năng mềm cho Nhân viên Y tế K5',
    number: 'BVTA/2026/KNM-005',
    issueDate: '25-01-2026',
    score: '8.5/10',
  },
];

function ProgressBar({ percent, colorClass }: { percent: number; colorClass: string }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
      <div
        className={`h-full rounded-full transition-all ${colorClass}`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  percent,
  barColor,
  iconClassName,
  topRight,
}: {
  icon: typeof TrendingUp;
  value: string;
  label: string;
  percent: number;
  barColor: string;
  iconClassName: string;
  topRight: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-[#e5e7eb] bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        {topRight}
      </div>
      <p className="mt-3 text-2xl font-bold text-[#111827]">{value}</p>
      <p className="mt-0.5 text-sm text-[#6b7280]">{label}</p>
      <ProgressBar percent={percent} colorClass={barColor} />
    </article>
  );
}

function ClassStatusBadge({ status }: { status: EnrolledClass['status'] }) {
  if (status === 'studying') {
    return (
      <span className="inline-flex rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-medium text-[#059669]">
        Đang học
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-[#e5e7eb] bg-[#f3f4f6] px-2.5 py-0.5 text-xs font-medium text-[#6b7280]">
      Đã hoàn thành
    </span>
  );
}

function ClassLogTab() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <div className="border-b border-[#e5e7eb] px-4 py-3">
        <h3 className="text-base font-bold text-[#111827]">Danh sách lớp học</h3>
      </div>
      <div className="divide-y divide-[#e5e7eb]">
        {ENROLLED_CLASSES.map((cls) => (
          <article key={cls.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-[#111827]">{cls.title}</h4>
                  <ClassStatusBadge status={cls.status} />
                </div>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Giảng viên: {cls.instructor} • Bắt đầu: {cls.startDate}
                  {cls.endDate ? ` • Hoàn thành: ${cls.endDate}` : ''}
                </p>
                <p className="mt-0.5 text-sm text-[#6b7280]">{cls.lessonsProgress}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b7280]">Tiến độ</span>
                  <span className="font-medium text-[#2563eb]">{cls.progressPercent}%</span>
                </div>
                <ProgressBar percent={cls.progressPercent} colorClass="bg-[#2563eb]" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b7280]">Điểm danh</span>
                  <span className="font-medium text-[#059669]">{cls.attendancePercent}%</span>
                </div>
                <ProgressBar percent={cls.attendancePercent} colorClass="bg-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6b7280]">Điểm số</p>
                <p className="mt-2 text-base font-bold text-[#111827]">{cls.score}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CertificatesTab({ onDownload }: { onDownload: (cert: Certificate) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <div className="border-b border-[#e5e7eb] px-4 py-3">
        <h3 className="text-base font-bold text-[#111827]">Kho chứng nhận</h3>
      </div>
      <div className="space-y-3 p-4">
        {CERTIFICATES.map((cert) => (
          <article
            key={cert.id}
            className="flex flex-col gap-4 rounded-lg border border-[#dbeafe] bg-[#f0f7ff] p-4 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-white"
                aria-hidden
              >
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-[#111827]">{cert.title}</h4>
                <p className="mt-0.5 text-sm text-[#6b7280]">{cert.subtitle}</p>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b7280]">
                  <span>Số: {cert.number}</span>
                  <span>Ngày cấp: {cert.issueDate}</span>
                  <span>Điểm: {cert.score}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDownload(cert)}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb] sm:self-center"
            >
              <Download className="h-4 w-4" aria-hidden />
              Tải xuống PDF
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function HocVienPage() {
  const { showSnackbar } = useAppSnackbar();
  const [activeTab, setActiveTab] = useState<TabId>('nhat-ky');

  const handleDownloadCert = (cert: Certificate) => {
    showSnackbar(`Đang tải ${cert.number}`, 'success');
  };

  return (
    <div className="min-h-screen space-y-4 bg-[#f6f8fb] p-4 md:p-6">
      {/* Hồ sơ học viên */}
      <article className="rounded-lg border border-[#e5e7eb] bg-white p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0d9488] text-xl font-bold text-white"
            aria-hidden
          >
            {STUDENT.initials}
          </div>
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <h2 className="text-xl font-bold text-[#111827]">{STUDENT.name}</h2>
            <p className="text-[#6b7280]">Mã học viên: {STUDENT.code}</p>
            <p className="text-[#6b7280]">Đơn vị công tác: {STUDENT.workplace}</p>
            <p className="text-[#6b7280]">Địa chỉ: {STUDENT.address}</p>
            <p className="text-[#6b7280]">
              Chương trình: <span className="font-semibold text-[#111827]">{STUDENT.program}</span>
            </p>
            <p className="text-[#6b7280]">
              Ngày nhập học: <span className="font-semibold text-[#111827]">{STUDENT.enrollmentDate}</span>
            </p>
          </div>
        </div>
      </article>

      {/* Chỉ số */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          icon={TrendingUp}
          value={`${METRICS.completion.value}%`}
          label={METRICS.completion.label}
          percent={METRICS.completion.value}
          barColor="bg-[#2563eb]"
          iconClassName="bg-[#eff6ff] text-[#2563eb]"
          topRight={
            <span className="text-sm font-medium text-[#2563eb]">{METRICS.completion.trend}</span>
          }
        />
        <MetricCard
          icon={CheckCircle2}
          value={`${METRICS.attendance.value}%`}
          label={METRICS.attendance.label}
          percent={METRICS.attendance.value}
          barColor="bg-[#059669]"
          iconClassName="bg-[#ecfdf5] text-[#059669]"
          topRight={
            <span className="text-xs font-medium text-[#059669]">{METRICS.attendance.badge}</span>
          }
        />
        <MetricCard
          icon={Award}
          value={String(METRICS.score.value)}
          label={METRICS.score.label}
          percent={METRICS.score.value * 10}
          barColor="bg-[#ea580c]"
          iconClassName="bg-[#fff7ed] text-[#ea580c]"
          topRight={
            <span className="text-xs text-[#6b7280]">{METRICS.score.scale}</span>
          }
        />
      </div>

      {/* Lịch học sắp tới */}
      <article className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-4 py-3">
          <h3 className="text-base font-bold text-[#111827]">Lịch học sắp tới</h3>
        </div>
        <ul className="divide-y divide-[#e5e7eb]">
          {UPCOMING_LESSONS.map((lesson) => (
            <li
              key={lesson.id}
              className="grid grid-cols-[minmax(130px,auto)_1fr] gap-x-4 gap-y-2 p-4 text-left sm:gap-x-6 sm:gap-y-2.5"
            >
              <p className="flex items-center gap-1.5 text-sm text-[#6b7280]">
                <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                {lesson.date}
              </p>
              <p className="font-bold text-[#111827]">{lesson.title}</p>

              <p className="flex items-center gap-1.5 text-sm text-[#6b7280]">
                <Clock className="h-4 w-4 shrink-0" aria-hidden />
                {lesson.time}
              </p>
              <p className="text-sm text-[#6b7280]">{lesson.instructor}</p>

              <span aria-hidden />
              <p className="text-sm font-medium text-[#2563eb]">{lesson.periods}</p>
            </li>
          ))}
        </ul>
      </article>

      {/* Tabs */}
      <div>
        <div className="mb-4 inline-flex rounded-lg bg-[#f3f4f6] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('nhat-ky')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'nhat-ky'
                ? 'bg-white text-[#111827] shadow-sm'
                : 'text-[#6b7280] hover:text-[#111827]'
            }`}
          >
            Nhật ký lớp học
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chung-nhan')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'chung-nhan'
                ? 'bg-white text-[#111827] shadow-sm'
                : 'text-[#6b7280] hover:text-[#111827]'
            }`}
          >
            Chứng nhận ({CERTIFICATES.length})
          </button>
        </div>

        {activeTab === 'nhat-ky' ? (
          <ClassLogTab />
        ) : (
          <CertificatesTab onDownload={handleDownloadCert} />
        )}
      </div>
    </div>
  );
}
