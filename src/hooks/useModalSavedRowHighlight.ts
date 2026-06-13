'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const PULSE_MS = 3000;

/**
 * Sau khi Lưu (sửa) thành công: tô cả dòng theo ID.
 * - 3 giây đầu: nền #FFCDCD (hồng nhạt như ảnh) + nhấp nháy (`animate-pulse`).
 * - Sau đó: giữ nền đó (không nháy) cho tới khi chọn dòng khác hoặc đóng modal.
 *
 * @param selectedRowId — ID dòng đang chọn trong bảng (vd. `selected?.id`). Bỏ qua tham số nếu không cần xóa highlight khi đổi dòng.
 */
export function useModalSavedRowHighlight(
  isOpen: boolean,
  selectedRowId?: number | string | null
) {
  const [highlightRowId, setHighlightRowIdState] = useState<number | string | null>(null);
  const [pulseActive, setPulseActive] = useState(false);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPulseTimer = useCallback(() => {
    if (pulseTimerRef.current != null) {
      clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }
  }, []);

  const setHighlightRowId = useCallback(
    (id: number | string | null) => {
      stopPulseTimer();
      setHighlightRowIdState(id);
      if (id == null) {
        setPulseActive(false);
        return;
      }
      setPulseActive(true);
      pulseTimerRef.current = setTimeout(() => {
        setPulseActive(false);
        pulseTimerRef.current = null;
      }, PULSE_MS);
    },
    [stopPulseTimer]
  );

  useEffect(() => {
    if (!isOpen) {
      stopPulseTimer();
      setHighlightRowIdState(null);
      setPulseActive(false);
    }
  }, [isOpen, stopPulseTimer]);

  /** Chọn dòng khác dòng đang highlight → bỏ highlight, về màu bình thường / màu chọn. */
  useEffect(() => {
    if (selectedRowId === undefined) return;
    if (highlightRowId == null) return;
    if (selectedRowId == null) return;
    if (String(selectedRowId) !== String(highlightRowId)) {
      stopPulseTimer();
      setHighlightRowIdState(null);
      setPulseActive(false);
    }
  }, [selectedRowId, highlightRowId, stopPulseTimer]);

  const clearHighlight = useCallback(() => {
    stopPulseTimer();
    setHighlightRowIdState(null);
    setPulseActive(false);
  }, [stopPulseTimer]);

  /** Nền dòng bảng: ưu tiên dòng vừa lưu (nhấp nháy 3s rồi cố định), sau đó dòng đang chọn, cuối cùng xen kẽ. */
  const rowToneClass = useCallback(
    (
      rowId: number | string,
      index: number,
      selectedId: number | string | null | undefined,
      evenClass = 'bg-orange-50/80',
      oddClass = 'bg-white'
    ) => {
      if (highlightRowId != null && String(highlightRowId) === String(rowId)) {
        /* #FFCDCD — literal cho Tailwind JIT */
        const base = 'bg-[#FFCDCD] border border-rose-200/70';
        return pulseActive ? `${base} animate-pulse` : base;
      }
      if (selectedId != null && String(selectedId) === String(rowId)) {
        return 'bg-blue-100';
      }
      return index % 2 === 0 ? evenClass : oddClass;
    },
    [highlightRowId, pulseActive]
  );

  return { highlightRowId, setHighlightRowId, clearHighlight, rowToneClass };
}
