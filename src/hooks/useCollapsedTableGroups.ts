import { useCallback, useState } from 'react';

/** Trạng thái thu gọn theo `key` của dòng group; mặc định tất cả đang mở (expanded). */
export function useCollapsedTableGroups() {
  const [collapsedGroupKeys, setCollapsedGroupKeys] = useState<Set<string>>(() => new Set());

  const resetCollapsedGroups = useCallback(() => {
    setCollapsedGroupKeys(new Set());
  }, []);

  const toggleGroupCollapsed = useCallback((groupKey: string) => {
    setCollapsedGroupKeys((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }, []);

  return { collapsedGroupKeys, toggleGroupCollapsed, resetCollapsedGroups };
}
