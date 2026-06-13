'use client';

import { ChevronDown, Hospital } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FEATURE_IN_DEVELOPMENT_MESSAGE,
    isImplementedAppRoute,
    menuItems,
} from '@/config/menu';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';
import { filterMenuByPermissions } from '@/lib/menu/permissionFilter';
import { usePermissions } from '@/hooks/usePermissions';

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const MENU_STATE_KEY = 'sidebarMenuState';

function isPathActive(pathname: string, path: string): boolean {
    return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Sidebar({ isOpen, isCollapsed }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { showSnackbar } = useAppSnackbar();
    const { hasAction } = usePermissions();
    const [isMounted, setIsMounted] = useState(false);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const visibleMenus = useMemo(() => filterMenuByPermissions(menuItems, hasAction), [hasAction]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        const fromStorage = localStorage.getItem(MENU_STATE_KEY);
        const parsed = fromStorage ? (JSON.parse(fromStorage) as Record<string, boolean>) : {};

        visibleMenus.forEach((item) => {
            if (!item.subItems?.length) return;
            const hasActiveChild = item.subItems.some((sub) => isPathActive(pathname, sub.path));
            if (hasActiveChild) parsed[item.path] = true;
        });

        setOpenMenus(parsed);
    }, [isMounted, pathname, visibleMenus]);

    const persistMenuState = useCallback((nextState: Record<string, boolean>) => {
        localStorage.setItem(MENU_STATE_KEY, JSON.stringify(nextState));
    }, []);

    const handleNavigate = useCallback((path: string) => {
        if (!isImplementedAppRoute(path)) {
            showSnackbar(FEATURE_IN_DEVELOPMENT_MESSAGE, 'success');
            return;
        }
        router.push(path);
    }, [router, showSnackbar]);

    const handleToggleParent = useCallback((path: string) => {
        setOpenMenus((prev) => {
            const next = { ...prev, [path]: !prev[path] };
            persistMenuState(next);
            return next;
        });
    }, [persistMenuState]);

    if (!isMounted) {
        return (
            <aside className={`fixed left-0 top-0 z-50 h-screen border-r-2 border-[#e5e7eb] bg-white ${isCollapsed ? 'w-16' : 'w-72'} ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300`}>
                <div className="h-[72px] border-b-2 border-[#e5e7eb]" />
            </aside>
        );
    }

    return (
        <aside
            className={`fixed left-0 top-0 z-50 h-screen border-r-2 border-[#e5e7eb] bg-white transition-all duration-300 ${isCollapsed ? 'w-16 min-w-[4rem]' : 'w-72'} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="flex h-full flex-col">
                <div className="flex h-[72px] items-center gap-3 border-b-2 border-[#e5e7eb] px-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eff6ff] text-[#2563eb]">
                        <Hospital className="h-5 w-5" />
                    </div>
                    {!isCollapsed ? (
                        <div className="min-w-0">
                            <p className="truncate text-base font-bold leading-tight text-[#111827]">BV Tâm Anh</p>
                            <p className="truncate text-sm text-[#6b7280]">Hệ thống đào tạo</p>
                        </div>
                    ) : null}
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="space-y-1.5">
                        {visibleMenus.map((item) => {
                            const isActiveParent = isPathActive(pathname, item.path);
                            const hasSubmenu = !!item.subItems?.length;
                            const isOpenSubmenu = !!openMenus[item.path];
                            const Icon = item.icon;

                            return (
                                <li key={item.path}>
                                    {hasSubmenu ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleParent(item.path)}
                                                className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left transition-colors ${
                                                    isActiveParent ? 'bg-[#edf2ff] text-[#1d4ed8]' : 'text-[#374151] hover:bg-[#f3f4f6]'
                                                }`}
                                                title={isCollapsed ? item.title : undefined}
                                            >
                                                <Icon className="h-5 w-5 shrink-0" />
                                                {!isCollapsed ? (
                                                    <>
                                                        <span className="ml-3 flex-1 truncate text-base font-medium">{item.title}</span>
                                                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpenSubmenu ? 'rotate-180' : ''}`} />
                                                    </>
                                                ) : null}
                                            </button>

                                            {!isCollapsed && (
                                                <div className={`grid transition-[grid-template-rows] duration-300 ${isOpenSubmenu ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                                    <div className="min-h-0 overflow-hidden">
                                                        <ul className="mt-1 space-y-1 pl-11">
                                                            {item.subItems?.map((sub) => {
                                                                const isActiveSub = isPathActive(pathname, sub.path);
                                                                return (
                                                                    <li key={sub.path}>
                                                                        <Link
                                                                            href={sub.path}
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                handleNavigate(sub.path);
                                                                            }}
                                                                            className={`block rounded-lg px-3 py-2 text-[15px] ${
                                                                                isActiveSub ? 'text-[#2563eb] font-medium' : 'text-[#374151] hover:bg-[#f9fafb]'
                                                                            }`}
                                                                        >
                                                                            {sub.title}
                                                                        </Link>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href={item.path}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNavigate(item.path);
                                            }}
                                            className={`flex items-center rounded-xl px-3 py-2.5 transition-colors ${
                                                isActiveParent ? 'bg-[#edf2ff] text-[#1d4ed8]' : 'text-[#374151] hover:bg-[#f3f4f6]'
                                            }`}
                                            title={isCollapsed ? item.title : undefined}
                                        >
                                            <Icon className="h-5 w-5 shrink-0" />
                                            {!isCollapsed ? <span className="ml-3 truncate text-base font-medium">{item.title}</span> : null}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </aside>
    );
}