'use client';

import { ReactNode, useCallback, useRef, type KeyboardEvent } from 'react';
import { handleModalEnterNavigation } from '@/components/ui/modal-enter-navigation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Nội dung bổ sung bên phải tiêu đề (vd: combobox cơ sở), trước nút đóng */
  headerExtra?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Khi true: modal dùng absolute, nằm trọn trong container cha (content), không phủ full màn hình */
  contained?: boolean;
  /**
   * Khi false: vùng nội dung không cuộn; để children tự bố trí flex + overflow (tránh 2 thanh cuộn).
   * Mặc định true giữ hành vi cũ cho các modal khác.
   */
  scrollableContent?: boolean;
  /**
   * Enter trên input/select (không phải textarea): chuyển focus theo thứ tự DOM trong modal.
   * Nút vẫn dùng Enter để kích hoạt khi đã focus vào nút.
   */
  enterFocusNavigation?: boolean;
  /** Khi true: nút X trên header bị vô hiệu (mờ), không gọi onClose. */
  headerCloseDisabled?: boolean;
  /**
   * Z-index lớp phủ. Modal `fixed` mặc định `z-[100]`.
   * Modal `contained` mặc định `z-30` (dưới topbar `z-40` và sidebar `z-50`) trừ khi ghi đè.
   */
  overlayZIndexClass?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  headerExtra,
  children,
  size = 'lg',
  contained = false,
  scrollableContent = true,
  enterFocusNavigation = true,
  headerCloseDisabled = false,
  overlayZIndexClass,
}: ModalProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const overlayZ =
    overlayZIndexClass ?? (contained ? 'z-30' : 'z-[100]');

  const onKeyDownCapture = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!enterFocusNavigation) return;
      handleModalEnterNavigation(e, boxRef.current);
    },
    [enterFocusNavigation]
  );

  if (!isOpen) return null;

  const sizeClasses = contained
    ? {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'w-full max-w-full',
      }
    : {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'w-[95vw] max-w-[95vw]',
      };

  /** Trong vùng content (contained): giới hạn theo khối cha, không dùng vh toàn màn hình. */
  const heightClasses = contained
    ? {
        sm: 'max-h-full',
        md: 'max-h-full',
        lg: 'max-h-full',
        xl: 'max-h-full',
        full: 'h-full max-h-full min-h-0 w-full',
      }
    : {
        sm: 'max-h-[90vh]',
        md: 'max-h-[90vh]',
        lg: 'max-h-[90vh]',
        xl: 'max-h-[90vh]',
        full: 'h-[85vh] min-h-[85vh] max-h-[85vh]',
      };

  const overlayClass = contained
    ? `absolute inset-0 ${overlayZ} flex items-center justify-center bg-black/10 p-4 min-h-0 overflow-auto`
    : `fixed inset-0 ${overlayZ} flex items-center justify-center bg-black/10 p-4`;

  const boxClass = `bg-white rounded-xl shadow-xl w-full overflow-hidden ${sizeClasses[size]} ${heightClasses[size]} relative flex flex-col min-h-0`;

  return (
    <div className={overlayClass}>
      <div
        ref={boxRef}
        className={boxClass}
        data-modal-root
        onKeyDownCapture={onKeyDownCapture}
      >
        {/* Header — trên màn nhỏ ẩn tiêu đề (chừng chỗ cho headerExtra / tìm kiếm); vẫn có trong cây a11y (sr-only). */}
        <div className="px-4 py-2 border-b border-[#0d2477] bg-[#102E9E]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full">
            <h2 className="max-sm:sr-only sm:not-sr-only text-base font-medium text-white min-w-0 sm:flex-1 sm:truncate">
              {title}
            </h2>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:shrink-0 sm:flex-initial sm:justify-start">
              {headerExtra}
              <button
                type="button"
                onClick={headerCloseDisabled ? undefined : onClose}
                disabled={headerCloseDisabled}
                className={`shrink-0 p-0.5 transition-colors ${
                  headerCloseDisabled
                    ? 'text-white/30 cursor-not-allowed'
                    : 'text-white/80 hover:text-white'
                }`}
                aria-label="Đóng"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content: chiều cao cố định (phần còn lại của modal), scroll bên trong */}
        <div
          className={`p-6 flex-1 min-h-0 flex flex-col ${scrollableContent ? 'overflow-y-auto' : 'overflow-hidden'}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
