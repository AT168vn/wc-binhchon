'use client';

import Modal from '@/components/ui/Modal';
import type { PendingApiApply } from '@/hooks/useModalApiLog';

export interface ApiPayloadPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contained?: boolean;
  /** JSON đã format sẵn (create/edit hoặc delete tùy pending). */
  previewBody: string;
  showLogApiToolbar: boolean;
  pendingApiApply: PendingApiApply;
  saving: boolean;
  deleting: boolean;
  onApply: () => void | Promise<void>;
}

export default function ApiPayloadPreviewModal({
  isOpen,
  onClose,
  contained = false,
  previewBody,
  showLogApiToolbar,
  pendingApiApply,
  saving,
  deleting,
  onApply,
}: ApiPayloadPreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="LogAPI — payload gửi đi (preview)"
      size="lg"
      contained={contained}
    >
      <p className="text-xs text-gray-500 mb-2">
        Phương thức và path là proxy trong app; token hiển thị dạng placeholder.
        {showLogApiToolbar && pendingApiApply != null ? (
          <span className="block mt-1 text-amber-800">
            Bấm <strong>Áp dụng</strong> để thực hiện gọi API (Lưu / Xóa).
          </span>
        ) : null}
      </p>
      <pre className="max-h-[min(60vh,480px)] overflow-auto rounded-md bg-gray-900 p-4 text-left text-xs text-green-200 whitespace-pre-wrap break-words">
        {previewBody || '(Không có dữ liệu)'}
      </pre>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Đóng
        </button>
        {pendingApiApply != null ? (
          <button
            type="button"
            onClick={() => void onApply()}
            disabled={saving || deleting}
            className="px-4 py-2 text-sm rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {saving || deleting ? 'Đang xử lý…' : 'Áp dụng'}
          </button>
        ) : null}
      </div>
    </Modal>
  );
}
