'use client';

import { useEffect, useState } from 'react';
import { isPollFrameClosed, parseCloseAt, type WcPollFrame } from '@/config/wc-schedule';

/** Theo dõi thời gian đóng bình chọn — tự cập nhật khi tới giờ closeAt */
export function usePollFrameClosed(frame: WcPollFrame): boolean {
  const [isClosed, setIsClosed] = useState(() => isPollFrameClosed(frame));

  useEffect(() => {
    const sync = () => setIsClosed(isPollFrameClosed(frame));
    sync();

    if (frame.pollExpired === true) {
      return;
    }

    const closeAt = parseCloseAt(frame.closeAt);
    if (!closeAt) {
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const msUntilClose = closeAt.getTime() - Date.now();

    if (msUntilClose > 0) {
      timers.push(setTimeout(sync, msUntilClose + 50));
    }

    const interval = setInterval(sync, 30_000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [frame.id, frame.closeAt, frame.pollExpired]);

  return isClosed;
}
