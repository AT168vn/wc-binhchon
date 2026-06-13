'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export function useDebouncedNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const navigatingRef = useRef(false);

  const debouncedPush = useDebounce(async (path: string) => {
    if (path === pathname || navigatingRef.current) return;

    try {
      navigatingRef.current = true;
      setIsNavigating(true);
      setActiveItem(path);

      router.prefetch(path);

      await new Promise((r) => setTimeout(r, 100));
      await router.push(path);
    } catch (err) {
      console.error('Navigation error:', err);
    } finally {
      setTimeout(() => {
        navigatingRef.current = false;
        setIsNavigating(false);
        setActiveItem(null);
      }, 100);
    }
  }, 300);

  const callPage = useCallback(
    (path: string) => {
      debouncedPush(path);
    },
    [debouncedPush],
  );

  return { callPage, isNavigating, activeItem };
}
