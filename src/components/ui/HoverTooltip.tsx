'use client';

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  cloneElement,
  isValidElement,
  type ReactElement,
} from 'react';
import { createPortal } from 'react-dom';

export type HoverTooltipProps = {
  label: string;
  /** Khoảng cách (px) giữa mép dưới tooltip và mép trên nút */
  gapPx?: number;
  children: ReactElement;
};

/**
 * Tooltip React — hiển thị qua portal (`position: fixed`) để không bị cắt bởi `overflow` của bảng/modal.
 * Không dùng `title` trình duyệt; giao diện tối giản (không viền nổi bật).
 */
export default function HoverTooltip({ label, gapPx = 6, children }: HoverTooltipProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const tooltipId = useId();

  const updatePosition = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      top: r.top,
      left: r.left + r.width / 2,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, updatePosition]);

  const show = () => {
    updatePosition();
    setOpen(true);
  };
  const hide = () => setOpen(false);

  const child = isValidElement(children)
    ? cloneElement(children, {
        ...(open ? { 'aria-describedby': tooltipId } : {}),
      })
    : children;

  const portal =
    open &&
    typeof document !== 'undefined' &&
    createPortal(
      <span
        id={tooltipId}
        role="tooltip"
        style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          transform: `translate(-50%, calc(-100% - ${gapPx}px))`,
          pointerEvents: 'none',
        }}
        className="z-[10000] max-w-[min(18rem,calc(100vw-1rem))] whitespace-nowrap bg-neutral-800/95 px-2 py-1 text-xs font-medium text-white shadow-sm"
      >
        {label}
      </span>,
      document.body
    );

  return (
    <>
      <span
        ref={wrapRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {child}
      </span>
      {portal}
    </>
  );
}
