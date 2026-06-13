'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Printer, X, XCircle } from 'lucide-react';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

const MODAL_ROOT_ID = 'homepage-modal-root';

export type CertificateStudent = {
  id: string;
  code: string;
  name: string;
  attendance: number;
  score: string;
  status: 'passed' | 'failed';
};

export type CertificateClassDetail = {
  id: string;
  code: string;
  certificateType: 'Cấp chứng chỉ' | 'Cấp chứng nhận';
  programName: string;
  stats: {
    total: number;
    completed: number;
    passed: number;
    failed: number;
  };
  students: CertificateStudent[];
};

type ModalDSHocVienCapChungChiProps = {
  isOpen: boolean;
  onClose: () => void;
  classItem: CertificateClassDetail | null;
};

type SummaryCardProps = {
  label: string;
  value: number;
  variant: 'default' | 'passed' | 'failed';
};

function SummaryCard({ label, value, variant }: SummaryCardProps) {
  const styles = {
    default: 'border-[#e5e7eb] bg-[#f9fafb] text-[#111827]',
    passed: 'border-[#bbf7d0] bg-[#ecfdf5] text-[#059669]',
    failed: 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]',
  } as const;

  return (
    <div className={`rounded-lg border px-4 py-3 text-center ${styles[variant]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-[#6b7280]">{label}</p>
    </div>
  );
}

function StudentStatusBadge({ status }: { status: CertificateStudent['status'] }) {
  if (status === 'passed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-medium text-[#059669]">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        Đạt
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#fef2f2] px-2.5 py-0.5 text-xs font-medium text-[#dc2626]">
      <XCircle className="h-3.5 w-3.5" aria-hidden />
      Không đạt
    </span>
  );
}

export default function ModalDSHocVienCapChungChi({
  isOpen,
  onClose,
  classItem,
}: ModalDSHocVienCapChungChiProps) {
  const { showSnackbar } = useAppSnackbar();
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById(MODAL_ROOT_ID));
  }, []);

  const summary = useMemo(() => {
    if (!classItem) return { total: 0, passed: 0, failed: 0 };
    const passed = classItem.students.filter((s) => s.status === 'passed').length;
    const failed = classItem.students.filter((s) => s.status === 'failed').length;
    return { total: classItem.students.length, passed, failed };
  }, [classItem]);

  const handlePrint = (student: CertificateStudent) => {
    showSnackbar(`In chứng chỉ cho ${student.name}`, 'success');
  };

  if (!isOpen || !classItem || !portalRoot) return null;

  return createPortal(
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center overflow-y-auto bg-black/10 p-4">
      <div
        className="flex max-h-[min(90vh,calc(100vh-7rem))] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="danh-sach-hoc-vien-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] px-6 py-4">
          <div className="min-w-0">
            <h2 id="danh-sach-hoc-vien-title" className="text-lg font-bold text-[#111827]">
              Danh sách học viên - {classItem.code}
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              {classItem.programName} • {classItem.stats.passed} đạt / {classItem.stats.failed} không đạt
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
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard label="Tổng số học viên" value={summary.total} variant="default" />
            <SummaryCard label="Đạt yêu cầu" value={summary.passed} variant="passed" />
            <SummaryCard label="Không đạt" value={summary.failed} variant="failed" />
          </div>

          <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                    <th className="px-4 py-3 font-medium text-[#374151]">Mã HV</th>
                    <th className="px-4 py-3 font-medium text-[#374151]">Họ và tên</th>
                    <th className="px-4 py-3 font-medium text-[#374151]">Điểm danh</th>
                    <th className="px-4 py-3 font-medium text-[#374151]">Điểm số</th>
                    <th className="px-4 py-3 font-medium text-[#374151]">Trạng thái</th>
                    <th className="px-4 py-3 font-medium text-[#374151]">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {classItem.students.map((student) => (
                    <tr key={student.id} className="border-b border-[#e5e7eb] last:border-b-0">
                      <td className="px-4 py-3 text-[#6b7280]">{student.code}</td>
                      <td className="px-4 py-3 font-semibold text-[#111827]">{student.name}</td>
                      <td className="px-4 py-3 text-[#6b7280]">{student.attendance}%</td>
                      <td className="px-4 py-3 text-[#6b7280]">{student.score}</td>
                      <td className="px-4 py-3">
                        <StudentStatusBadge status={student.status} />
                      </td>
                      <td className="px-4 py-3">
                        {student.status === 'passed' ? (
                          <button
                            type="button"
                            onClick={() => handlePrint(student)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
                          >
                            <Printer className="h-4 w-4 shrink-0" aria-hidden />
                            In chứng chỉ
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>,
    portalRoot
  );
}
