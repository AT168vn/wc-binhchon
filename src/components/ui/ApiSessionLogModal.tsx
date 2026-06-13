'use client';

import Modal from '@/components/ui/Modal';
import type { ApiSessionLogEntry } from '@/hooks/useModalApiLog';

export interface ApiSessionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearLogs: () => void;
  contained?: boolean;
  logs: ApiSessionLogEntry[];
}

function formatTime(at: number): string {
  try {
    return new Date(at).toLocaleTimeString('vi-VN', { hour12: false });
  } catch {
    return String(at);
  }
}

export default function ApiSessionLogModal({ isOpen, onClose, onClearLogs, contained = false, logs }: ApiSessionLogModalProps) {
  const json = JSON.stringify(
    logs.map(({ id: _i, ...rest }) => ({
      ...rest,
      time: formatTime(rest.at),
    })),
    null,
    2
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="LogAPI — phiên gọi API (GET/POST/…)" size="lg" contained={contained}>
      <p className="text-xs text-gray-500 mb-2">
        Ghi lại các lần gọi qua <code className="bg-gray-100 px-1 rounded">loggedFetch</code> kể từ lần mở modal hoặc sau khi xóa log.
      </p>
      <pre className="max-h-[min(60vh,480px)] overflow-auto rounded-md bg-gray-900 p-4 text-left text-xs text-cyan-100 whitespace-pre-wrap break-words">
        {logs.length === 0 ? '(Chưa có lần gọi API trong phiên này)' : json}
      </pre>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClearLogs}
          disabled={logs.length === 0}
          className="px-4 py-2 text-sm rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:pointer-events-none"
        >
          Xóa log
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-md bg-[#007BFF] text-white hover:bg-[#004494]"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
}
