'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  menuItems,
  isImplementedAppRoute,
  FEATURE_IN_DEVELOPMENT_MESSAGE,
} from '@/config/menu';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

type BottomNavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

const BOTTOM_NAV_HEIGHT_PX = 72;

function isPathActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(path + '/');
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { showSnackbar } = useAppSnackbar();

  // 5 mục chính thường dùng nhất trên mobile.
  // Các module khác vẫn truy cập qua nút menu (drawer/sidebar) trên app bar.
  const rootPaths = new Set([
    '/quanlytiepdon',
    '/quanlykhambenh',
    '/quanlyvienphi',
    '/quanlyduoc',
    '/quanlyhethong',
    '/baocaothongke',
  ]);

  const items: BottomNavItem[] = menuItems
    .filter((m) => rootPaths.has(m.path))
    .map((m) => ({
      label: m.title,
      path: m.path,
      icon: m.icon,
    }));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      style={{ height: BOTTOM_NAV_HEIGHT_PX }}
      aria-label="Điều hướng dưới"
    >
      <div
        className="h-full px-2 flex items-center justify-between"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {items.map((item) => {
          const active = isPathActive(pathname, item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-1"
              aria-current={active ? 'page' : undefined}
              onClick={(e) => {
                if (!isImplementedAppRoute(item.path)) {
                  e.preventDefault();
                  showSnackbar(FEATURE_IN_DEVELOPMENT_MESSAGE, 'success');
                }
              }}
            >
              <Icon
                className="w-6 h-6"
                color={active ? '#007BFF' : '#6B7280'}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className="text-[11px] leading-3 font-semibold"
                style={{ color: active ? '#007BFF' : '#6B7280' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

