'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';

const MODAL_ROOT_ID = 'homepage-modal-root';

export type AttendanceSession = {
  id: string;
  date: string;
  time: string;
  subject: string;
  lecturer: string;
};

type AttendanceStudent = {
  id: string;
  code: string;
  name: string;
};

const DEFAULT_STUDENTS: AttendanceStudent[] = [
  { id: '1', code: 'HV001', name: 'Nguyễn Văn A' },
  { id: '2', code: 'HV002', name: 'Trần Thị B' },
  { id: '3', code: 'HV003', name: 'Lê Văn C' },
];

type ModalDiemDanhProps = {
  isOpen: boolean;
  onClose: () => void;
  session: AttendanceSession | null;
  onSave?: () => void;
};

export default function ModalDiemDanh({
  isOpen,
  onClose,
  session,
  onSave,
}: ModalDiemDanhProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPortalRoot(document.getElementById(MODAL_ROOT_ID));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPresentIds(new Set());
    }
  }, [isOpen]);

  const presentCount = presentIds.size;
  const totalCount = DEFAULT_STUDENTS.length;

  const sessionMeta = useMemo(() => {
    if (!session) return '';
    return `${session.date} • ${session.time} • ${session.lecturer}`;
  }, [session]);

  if (!isOpen || !session || !portalRoot) return null;

  const togglePresent = (studentId: string) => {
    setPresentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave?.();
    onClose();
  };

  return createPortal(
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center overflow-y-auto bg-black/10 p-4">
      <div
        className="flex max-h-[min(90vh,calc(100vh-7rem))] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="diem-danh-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] px-6 py-4">
          <div className="min-w-0">
            <h2 id="diem-danh-title" className="text-lg font-bold text-[#111827]">
              Điểm danh - {session.subject}
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">{sessionMeta}</p>
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
          <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <th className="px-4 py-3 font-medium text-[#374151]">Mã HV</th>
                  <th className="px-4 py-3 font-medium text-[#374151]">Họ và tên</th>
                  <th className="px-4 py-3 text-right font-medium text-[#374151]">Có mặt</th>
                </tr>
              </thead>
              <tbody>
                {DEFAULT_STUDENTS.map((student) => (
                  <tr key={student.id} className="border-b border-[#e5e7eb] last:border-b-0">
                    <td className="px-4 py-3 text-[#6b7280]">{student.code}</td>
                    <td className="px-4 py-3 font-medium text-[#111827]">{student.name}</td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="checkbox"
                        checked={presentIds.has(student.id)}
                        onChange={() => togglePresent(student.id)}
                        className="h-4 w-4 rounded border-[#d1d5db] text-[#2563eb] focus:ring-[#2563eb]"
                        aria-label={`Điểm danh ${student.name}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] px-6 py-4">
          <p className="text-sm font-medium text-[#111827]">
            Đã điểm danh: {presentCount}/{totalCount}
          </p>
          <div className="flex gap-2">
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
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Lưu điểm danh
            </button>
          </div>
        </div>
      </div>
    </div>,
    portalRoot
  );
}
