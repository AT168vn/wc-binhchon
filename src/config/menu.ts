import {    
    LayoutGrid,
    BookOpen,
    FileText,
    ClipboardList,
    Users,
    GraduationCap,
    CircleUserRound,
    Award,
    FolderTree,
} from "lucide-react";
import { LucideIcon } from 'lucide-react';

export interface SubMenuItem {
    title: string;
    path: string;
    pageTitle: string;
    subItems?: SubMenuItem[];
}

export interface MenuItem {
    title: string;
    path: string;
    pageTitle: string;
    icon: LucideIcon;
    subItems?: SubMenuItem[];
}

/**
 * Prefix đường dẫn đã có `page.tsx` trong App Router.
 * Điều hướng từ menu tới path không khớp → snackbar, không vào trang 404.
 * Khi thêm module mới: bổ sung prefix tương ứng.
 */
export const IMPLEMENTED_ROUTE_PREFIXES: readonly string[] = [    
    '/trangchu',
    '/daotao',
    '/chuongtrinh',
    '/baihoc',
    '/danhmuc/coso',
    '/danhmuc/loaichuongtrinh',
    '/danhmuc/diadiem-daotao',
    '/chungchi-chungnhan',
    '/hocvien',
    '/giangvien',
    '/lophoc-thoikhoabieu',
    '/nganhang-cauhoi',
];

export const FEATURE_IN_DEVELOPMENT_MESSAGE = 'Chức năng đang phát triển.';

export function isImplementedAppRoute(path: string): boolean {
    if (!path) return false;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    for (const prefix of IMPLEMENTED_ROUTE_PREFIXES) {
        if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
            return true;
        }
    }
    return false;
}

export const menuItems: MenuItem[] = [
    {
        title: "Tổng quan",
        path: "/trangchu",
        pageTitle: "TỔNG QUAN",
        icon: LayoutGrid,
    },
    {
        title: "Đào tạo CME",
        path: "/daotao",
        pageTitle: "ĐÀO TẠO CME",
        icon: BookOpen,
    },
    {
        title: "Chương trình học",
        path: "/chuongtrinh",
        pageTitle: "QUẢN LÝ CHƯƠNG TRÌNH HỌC",
        icon: BookOpen,
    },
    {
        title: "Bài học",
        path: "/baihoc",
        pageTitle: "BÀI HỌC",
        icon: FileText,
    },
    {
        title: "Ngân hàng Câu hỏi",
        path: "/nganhang-cauhoi",
        pageTitle: "NGÂN HÀNG CÂU HỎI",
        icon: ClipboardList,
    },
    {
        title: "Lớp học & Thời khóa biểu",
        path: "/lophoc-thoikhoabieu",
        pageTitle: "LỚP HỌC & THỜI KHÓA BIỂU",
        icon: Users,
    },
    {
        title: "Giảng viên",
        path: "/giangvien",
        pageTitle: "GIẢNG VIÊN",
        icon: GraduationCap,
    },
    {
        title: "Học viên",
        path: "/hocvien",
        pageTitle: "HỌC VIÊN",
        icon: CircleUserRound,
    },
    {
        title: "Cấp chứng chỉ/Chứng nhận",
        path: "/chungchi-chungnhan",
        pageTitle: "CẤP CHỨNG CHỈ/CHỨNG NHẬN",
        icon: Award,
    },
    {
        title: "Danh mục",
        path: "/danhmuc",
        pageTitle: "DANH MỤC",
        icon: FolderTree,
        subItems: [
            {
                title: "Loại chương trình",
                path: "/danhmuc/loaichuongtrinh",
                pageTitle: "LOẠI CHƯƠNG TRÌNH",
            },
            {
                title: "Cơ sở",
                path: "/danhmuc/coso",
                pageTitle: "CƠ SỞ",
            },
            {
                title: "Địa điểm đào tạo",
                path: "/danhmuc/diadiem-daotao",
                pageTitle: "ĐỊA ĐIỂM ĐÀO TẠO",
            },
        ],
    },
];

/** Thu thập mọi (path, pageTitle) từ menu (cha + con + lồng nhau) */
function collectPathTitles(): { path: string; pageTitle: string }[] {
    const result: { path: string; pageTitle: string }[] = [];
    for (const item of menuItems) {
        result.push({ path: item.path, pageTitle: item.pageTitle });
        if (item.subItems) {
            for (const sub of item.subItems) {
                result.push({ path: sub.path, pageTitle: sub.pageTitle });
                if (sub.subItems) {
                    for (const nested of sub.subItems) {
                        result.push({ path: nested.path, pageTitle: nested.pageTitle });
                    }
                }
            }
        }
    }
    return result;
}

export const getPageTitle = (path: string): string => {
    const all = collectPathTitles();
    const exact = all.find((x) => x.path === path);
    if (exact) return exact.pageTitle;

    // Không khớp đúng: dùng title của route cha (path prefix dài nhất) để tab con không mất title topbar
    const prefixMatches = all.filter((x) => path.startsWith(x.path + "/") || path === x.path);
    const best = prefixMatches.sort((a, b) => b.path.length - a.path.length)[0];
    return best ? best.pageTitle : "";
}; 