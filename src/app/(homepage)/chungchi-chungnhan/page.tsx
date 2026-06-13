'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import ModalDSHocVienCapChungChi, {
  type CertificateClassDetail,
} from '@/components/chungchi/ModalDSHocVienCapChungChi';

const CLASSES_PENDING_CERTIFICATE: CertificateClassDetail[] = [
  {
    id: '1',
    code: 'DDC K12',
    certificateType: 'Cấp chứng chỉ',
    programName: 'Chương trình Điều dưỡng Đa khoa',
    stats: { total: 28, completed: 25, passed: 22, failed: 3 },
    students: [
      {
        id: 's1',
        code: 'HV001',
        name: 'Nguyễn Văn A',
        attendance: 95,
        score: '8.5/10',
        status: 'passed',
      },
      {
        id: 's2',
        code: 'HV002',
        name: 'Trần Thị B',
        attendance: 88,
        score: '7.8/10',
        status: 'passed',
      },
      {
        id: 's3',
        code: 'HV003',
        name: 'Lê Văn C',
        attendance: 65,
        score: '5.5/10',
        status: 'failed',
      },
    ],
  },
  {
    id: '2',
    code: 'KNM K5',
    certificateType: 'Cấp chứng nhận',
    programName: 'Kỹ năng mềm cho Nhân viên Y tế',
    stats: { total: 22, completed: 20, passed: 18, failed: 2 },
    students: [
      {
        id: 's4',
        code: 'HV101',
        name: 'Phạm Thị D',
        attendance: 92,
        score: '8.0/10',
        status: 'passed',
      },
      {
        id: 's5',
        code: 'HV102',
        name: 'Hoàng Văn E',
        attendance: 90,
        score: '7.5/10',
        status: 'passed',
      },
      {
        id: 's6',
        code: 'HV103',
        name: 'Vũ Thị F',
        attendance: 70,
        score: '5.0/10',
        status: 'failed',
      },
    ],
  },
];

type StatBoxProps = {
  label: string;
  value: number;
  variant: 'default' | 'completed' | 'passed' | 'failed';
};

function StatBox({ label, value, variant }: StatBoxProps) {
  const styles = {
    default: 'bg-[#f3f4f6] text-[#111827]',
    completed: 'bg-[#eff6ff] text-[#2563eb]',
    passed: 'bg-[#ecfdf5] text-[#059669]',
    failed: 'bg-[#fef2f2] text-[#dc2626]',
  } as const;

  return (
    <div className={`rounded-lg px-3 py-2.5 text-center ${styles[variant]}`}>
      <p className="text-xs text-inherit opacity-80">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

type CertificateClassRowProps = {
  item: CertificateClassDetail;
  onSelect: (item: CertificateClassDetail) => void;
  showDivider: boolean;
};

function CertificateClassRow({ item, onSelect, showDivider }: CertificateClassRowProps) {
  return (
    <div className={showDivider ? 'border-t border-[#e5e7eb]' : ''}>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-[#f9fafb]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-[#111827]">{item.code}</span>
              <span className="inline-flex rounded-md bg-[#2563eb] px-2 py-0.5 text-xs font-medium text-white">
                {item.certificateType}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#6b7280]">{item.programName}</p>
          </div>
          <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-[#9ca3af]" aria-hidden />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatBox label="Tổng số HV" value={item.stats.total} variant="default" />
          <StatBox label="Đã hoàn thành" value={item.stats.completed} variant="completed" />
          <StatBox label="Đạt yêu cầu" value={item.stats.passed} variant="passed" />
          <StatBox label="Không đạt" value={item.stats.failed} variant="failed" />
        </div>
      </button>
    </div>
  );
}

export default function ChungChiChungNhanPage() {
  const [selectedClass, setSelectedClass] = useState<CertificateClassDetail | null>(null);

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <header className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-4 md:px-5">
          <h2 className="text-lg font-bold text-[#111827] md:text-xl">
            Lớp học cần cấp chứng chỉ/chứng nhận
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Danh sách các lớp đã hoàn thành và sẵn sàng cấp chứng chỉ
          </p>
        </header>

        {CLASSES_PENDING_CERTIFICATE.length > 0 ? (
          CLASSES_PENDING_CERTIFICATE.map((item, index) => (
            <CertificateClassRow
              key={item.id}
              item={item}
              onSelect={setSelectedClass}
              showDivider={index > 0}
            />
          ))
        ) : (
          <p className="px-4 py-8 text-center text-sm text-[#6b7280]">
            Chưa có lớp học nào cần cấp chứng chỉ/chứng nhận.
          </p>
        )}
      </div>

      <ModalDSHocVienCapChungChi
        isOpen={selectedClass !== null}
        onClose={() => setSelectedClass(null)}
        classItem={selectedClass}
      />
    </div>
  );
}
