'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, MenuItem, ListItemIcon, Divider, Button, TextField } from '@mui/material';
import { MdMenuOpen, MdOutlineMenu } from 'react-icons/md';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/providers';
import { getPersistedSelectedBranch } from '@/lib/auth/selectedBranch';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';
import { getPageTitle } from "@/config/menu";
import Modal from '@/components/ui/Modal';
import { browserApiFetch } from '@/lib/http/browser-api-fetch';

/** Lấy message từ body JSON lỗi API (không dùng any). */
function getJsonErrorMessage(body: unknown, fallback: string): string {
    if (body !== null && typeof body === 'object' && 'message' in body) {
        const m = (body as Record<string, unknown>).message;
        if (typeof m === 'string' && m.trim()) return m;
    }
    return fallback;
}

type CustomTopbarHeader = { title: string; subtitle: string };

function getCustomTopbarHeader(pathname: string): CustomTopbarHeader | null {
    const headers: Record<string, CustomTopbarHeader> = {
        '/trangchu': {
            title: 'Tổng quan',
            subtitle: 'Hệ thống quản lý đào tạo tại chức',
        },
        '/chuongtrinh': {
            title: 'Quản lý Chương trình học',
            subtitle: 'Đóng gói và quản lý sản phẩm đào tạo',
        },
        '/baihoc': {
            title: 'Quản lý Bài học',
            subtitle: 'Biên soạn nội dung chi tiết và quản lý thư viện bài học',
        },
        '/nganhang-cauhoi': {
            title: 'Quản lý Ngân hàng Câu hỏi',
            subtitle: 'Tạo và quản lý các đề thi từ ngân hàng câu hỏi',
        },
        '/lophoc-thoikhoabieu': {
            title: 'Quản lý Lớp học & Thời khóa biểu',
            subtitle: 'Tạo lớp học và xếp lịch học cho chương trình đào tạo',
        },
        '/giangvien': {
            title: 'Hồ sơ Giảng viên',
            subtitle: 'Quản lý thông tin và hoạt động giảng dạy',
        },
        '/hocvien': {
            title: 'Hồ sơ Học viên',
            subtitle: 'Theo dõi tiến độ và kết quả học tập',
        },
        '/chungchi-chungnhan': {
            title: 'Cấp chứng chỉ/Chứng nhận',
            subtitle: 'Quản lý và in chứng chỉ/chứng nhận cho học viên hoàn thành khóa học',
        },
        '/danhmuc/loaichuongtrinh': {
            title: 'Loại chương trình',
            subtitle: 'Quản lý danh mục loại chương trình đào tạo',
        },
        '/danhmuc/coso': {
            title: 'Cơ sở',
            subtitle: 'Quản lý danh sách cơ sở bệnh viện',
        },
        '/danhmuc/diadiem-daotao': {
            title: 'Địa điểm đào tạo',
            subtitle: 'Quản lý phòng học và địa điểm tổ chức đào tạo',
        },
    };
    return headers[pathname] ?? null;
}

function TopbarCustomTitle({ title, subtitle }: CustomTopbarHeader) {
    return (
        <div className="min-w-0">
            <h2
                className="min-w-0 shrink truncate text-sm font-bold sm:text-base md:text-lg lg:text-xl max-w-[min(42vw,24rem)] sm:max-w-[min(38vw,28rem)] bg-gradient-to-r from-[#1a237e] via-[#0d47a1] to-[#1565c0] bg-clip-text text-transparent"
                title={title}
            >
                {title}
            </h2>
            <p className="truncate text-xs text-[#9ca3af] sm:text-sm">{subtitle}</p>
            <div className="mt-1 h-[3px] w-full rounded-full bg-gradient-to-r from-[#1a237e] via-[#0d47a1] to-[#42a5f5] shadow-[0_2px_6px_rgba(26,35,126,0.35)]" />
        </div>
    );
}

/** Sửa chuỗi tiếng Việt bị lỗi giải mã UTF-8 kiểu mojibake (vd: Tuáº¥n DÆ°Æ¡ng). */
function normalizeVietnameseText(value?: string | null): string {
    const input = (value || '').trim();
    if (!input) return '';

    // Chỉ thử sửa khi thấy dấu hiệu chuỗi bị lỗi mã hóa.
    const hasMojibakePattern = /(?:Ã.|Æ.|áº|á»|â[€-™]|Ä.)/.test(input);
    if (!hasMojibakePattern) return input;

    try {
        const bytes = Uint8Array.from(input, (char) => char.charCodeAt(0) & 0xff);
        const decoded = new TextDecoder('utf-8').decode(bytes).trim();
        return decoded || input;
    } catch {
        return input;
    }
}

function formatDateForDisplay(input?: string | null): string {
    const raw = (input || '').trim();
    if (!raw) return '';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

type UserProfileFromApi = {
    id: string;
    userId: number;
    userName: string;
    fullname?: string | null;
    systemRole?: number | null;
    systemRoleName?: string | null;
    dateOfBirth?: string | null;
    avatarUrl?: string | null;
    status?: string | null;
    isMaster?: boolean | null;
    email?: string | null;
    phoneNumber?: string | null;
};


interface TopbarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    toggleCollapse: () => void;
    isCollapsed: boolean;
}

export default function Topbar({ isSidebarOpen, toggleCollapse, isCollapsed }: TopbarProps) {

    const { user, logout, accessToken } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isChangePasswordVisible, setChangePasswordVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { showSnackbar } = useAppSnackbar();
    const [isClient, setIsClient] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const [currentTitle, setCurrentTitle] = useState("");
    /** Tên Cơ sở đào tạo (hiển thị bên phải topbar, cùng khối với version). */
    const [branchDisplayTen, setBranchDisplayTen] = useState('');
    const pathname = usePathname();
    const [isUserHovered, setIsUserHovered] = useState(false);
    const [isNguoiSuDungModalOpen, setNguoiSuDungModalOpen] = useState(false);

    const [userProfile, setUserProfile] = useState<UserProfileFromApi | null>(null);
    const [loadingUserProfile, setLoadingUserProfile] = useState(false);

    const normalizedUserDisplayName = normalizeVietnameseText(user?.displayName);
    const normalizedUserName = (user?.username || '').trim();

    const avatarSrc =
        (userProfile?.avatarUrl && userProfile.avatarUrl.trim())
            ? userProfile.avatarUrl
            : '/icons/avatar.png';

    const avatarDisplayName = normalizeVietnameseText(userProfile?.fullname) || normalizedUserDisplayName || 'Người dùng';
    const avatarSubText = (userProfile?.userName || '').trim() || normalizedUserName || user?.username || '';

    // Đảm bảo component chỉ render trên client
    useEffect(() => {
        setIsClient(true);
        setIsMobile(window.innerWidth < 768);
    }, []);

    // Đồng bộ trạng thái mobile khi resize
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const customTopbarHeader = getCustomTopbarHeader(pathname);

    useEffect(() => {
        const title = customTopbarHeader?.title ?? (getPageTitle(pathname) || '').toUpperCase();
        setCurrentTitle(title);
    }, [customTopbarHeader, pathname]);

    useEffect(() => {
        if (!isClient) return;
        const b = getPersistedSelectedBranch();
        const raw = (b?.ten ?? '').trim();
        setBranchDisplayTen(raw ? (normalizeVietnameseText(raw) || raw) : '');
    }, [isClient, pathname]);

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            // Không cần router.replace vì đã được xử lý trong AuthProvider
        } catch (error) {
            console.error('Logout error:', error);
            showSnackbar('Đã có lỗi xảy ra khi đăng xuất', 'error');
        }
    };

    const handleProfileNguoidung = async () => {
        handleClose();

        if (loadingUserProfile) return;

        if (!accessToken) {
            showSnackbar('Chưa có token đăng nhập, vui lòng đăng nhập lại', 'error');
            return;
        }

        try {
            setLoadingUserProfile(true);
            const res = await browserApiFetch('/api/auth/get-user-profile', {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await res.json().catch(() => null) as UserProfileFromApi | null;
            if (!res.ok || !data) {
                const msg = getJsonErrorMessage(data, 'Lỗi khi tải thông tin cá nhân');
                showSnackbar(msg, 'error');
                return;
            }

            setUserProfile(data);
            setNguoiSuDungModalOpen(true);
        } catch (e) {
            console.error('load user profile error:', e);
            showSnackbar('Lỗi khi tải thông tin cá nhân', 'error');
        } finally {
            setLoadingUserProfile(false);
        }
    };

    const handleCloseNguoiSuDungModal = () => setNguoiSuDungModalOpen(false);

    const closeChangePasswordModal = () => {
        setChangePasswordVisible(false);
        setNewPassword('');
        setConfirmPassword('');
    };

    const openUserInfoChangePasswordModal = async () => {
        handleClose();
        if (loadingUserProfile) return;

        if (!accessToken) {
            showSnackbar('Chưa có token đăng nhập, vui lòng đăng nhập lại', 'error');
            return;
        }

        try {
            setLoadingUserProfile(true);
            const res = await browserApiFetch('/api/auth/get-user-profile', {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await res.json().catch(() => null) as UserProfileFromApi | null;
            if (!res.ok || !data) {
                const msg = getJsonErrorMessage(data, 'Lỗi khi tải thông tin người dùng');
                showSnackbar(msg, 'error');
                return;
            }

            setUserProfile(data);
            setChangePasswordVisible(true);
        } catch (e) {
            console.error('load user profile for change password error:', e);
            showSnackbar('Lỗi khi tải thông tin người dùng', 'error');
        } finally {
            setLoadingUserProfile(false);
        }
    };

    const passwordRules = useMemo(() => {
        const pwd = newPassword;
        return [
            { label: 'Tối thiểu 8 ký tự', ok: pwd.length >= 8 },
            { label: 'Có chữ hoa (A-Z)', ok: /[A-Z]/.test(pwd) },
            { label: 'Có chữ thường (a-z)', ok: /[a-z]/.test(pwd) },
            { label: 'Có số (0-9)', ok: /\d/.test(pwd) },
            { label: 'Có ký tự đặc biệt', ok: /[^a-zA-Z0-9]/.test(pwd) },
        ];
    }, [newPassword]);
    const passwordPolicySatisfied = passwordRules.every((r) => r.ok);
    const passwordMatched = newPassword === confirmPassword;
    const passwordTooltip = passwordRules.filter((r) => !r.ok).map((r) => `- ${r.label}`).join('\n');
    const confirmPasswordTooltip = passwordMatched ? '' : 'Mật khẩu nhập lại chưa khớp.';

    const handleChangePassword = async () => {
        if (!newPassword.trim()) {
            showSnackbar('Vui lòng nhập mật khẩu', 'error');
            return;
        }
        if (!passwordPolicySatisfied) {
            showSnackbar('Mật khẩu chưa đủ điều kiện', 'error');
            return;
        }
        if (!passwordMatched) {
            showSnackbar('Mật khẩu nhập lại chưa khớp', 'error');
            return;
        }

        try {
            // TODO: Implement change password API call
            showSnackbar('Chức năng đang phát triển.', 'success');
            closeChangePasswordModal();
        } catch (error) {
            showSnackbar('Đã có lỗi xảy ra khi đổi mật khẩu', 'error');
        }
    };

    // Trên server hoặc chưa hydrate xong, render với placeholder
    const handleMenuButtonClick = () => {
        toggleCollapse();
    };

    if (!isClient) {
        return (
            <div className="fixed top-0 right-0 left-0 z-40 h-[72px] border-b-2 border-[#e5e7eb] bg-white transition-all duration-300 ease-in-out">
                <div className="h-full flex items-center px-3">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 bg-gray-200 rounded-full shadow-lg hover:bg-gray-300 transition-colors duration-300"
                            onClick={handleMenuButtonClick}
                        >
                            <MdOutlineMenu className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    <div className="ml-8 flex flex-1 items-center gap-2 min-w-0 overflow-hidden">
                        {customTopbarHeader ? (
                            <TopbarCustomTitle title={customTopbarHeader.title} subtitle={customTopbarHeader.subtitle} />
                        ) : (
                            <h2
                                className="relative min-w-0 shrink font-bold truncate text-sm sm:text-base md:text-lg lg:text-xl max-w-[min(42vw,24rem)] sm:max-w-[min(38vw,28rem)] bg-gradient-to-r from-[#1a237e] via-[#0d47a1] to-[#1565c0] bg-clip-text text-transparent after:block after:w-full after:h-[3px] after:mt-1 after:rounded-full after:bg-gradient-to-r after:from-[#1a237e] after:via-[#0d47a1] after:to-[#42a5f5] after:shadow-[0_2px_6px_rgba(26,35,126,0.35)]"
                                title={currentTitle}
                            >
                                {currentTitle}
                            </h2>
                        )}
                        <div
                            className="hidden min-h-[50px] min-w-0 flex-1 items-center justify-center self-stretch sm:flex"
                            aria-hidden
                        />
                    </div>

                    <div className="ml-2 flex shrink-0 items-center gap-2 sm:ml-4 md:ml-8">
                        {/* Khối thống nhất: cơ sở/chi nhánh + version (tạm bỏ ngày giờ) */}
                        <div
                            className="flex items-center min-w-0 max-w-[min(92vw,20rem)] sm:max-w-[min(50vw,24rem)] md:max-w-[min(40vw,28rem)] rounded-[10px] shadow-[0_4px_8px_rgba(0,0,0,0.3)] border border-white/10 bg-gradient-to-r from-[#1a237e] to-[#0d47a1] py-1.5 px-2.5 sm:py-[6px] sm:px-3 md:px-4"
                            title={branchDisplayTen ? `Cơ sở đào tạo: ${branchDisplayTen}` : 'Cơ sở đào tạo'}
                        >
                            <div className="min-w-0 flex-1 flex flex-col gap-0 pr-2 sm:pr-3 border-r border-white/25">
                                <span className="text-[9px] sm:text-[10px] leading-tight text-white/75 uppercase tracking-wide">
                                    Cơ sở đào tạo
                                </span>
                                <span
                                    className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate"
                                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                >
                                    —
                                </span>
                            </div>
                            <div className="pl-2 sm:pl-3 shrink-0 flex flex-col justify-center">
                                <span className="text-[9px] sm:text-[10px] text-white/75 uppercase tracking-wide leading-tight">Phiên bản</span>
                                <span
                                    className="text-xs sm:text-sm md:text-[15px] font-bold text-white tabular-nums leading-tight"
                                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                >
                                    V:{process.env.NEXT_PUBLIC_VERSION ?? '—'}
                                </span>
                            </div>
                        </div>

                        {/* Avatar placeholder */}
                        <div className="hidden md:flex items-center bg-white p-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer">
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm">
                                    <Image
                                        src={avatarSrc}
                                        alt="Avatar"
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                        unoptimized
                                    />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                        </div>

                        <div
                            className="md:hidden p-2 bg-gray-200 rounded-full shadow-lg hover:bg-gray-300 transition-colors duration-300 cursor-pointer relative"
                        >
                            <div className="w-8 h-8 rounded overflow-hidden border-2 border-blue-100 shadow-sm">
                                <Image
                                    src={avatarSrc}
                                    alt="Avatar"
                                    width={32}
                                    height={32}
                                    className="object-cover w-full h-full"
                                    unoptimized
                                />
                            </div>
                            <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed top-0 right-0 z-40 h-[72px] border-b-2 border-[#e5e7eb] bg-white transition-all duration-300 ease-in-out ${isMobile ? 'left-0' : (isSidebarOpen ? (isCollapsed ? "left-16" : "left-72") : "left-0")}`}>
            <div className="h-full flex items-center px-3">
                <div className="flex items-center gap-4">
                    <button
                        className="p-2 bg-gray-200 rounded-full shadow-lg hover:bg-gray-300 transition-colors duration-300"
                        onClick={handleMenuButtonClick}
                        title={isCollapsed ? 'Mở rộng menu' : 'Thu nhỏ menu (chỉ icon)'}
                    >
                        <AnimatePresence mode="wait">
                            {!isSidebarOpen ? (
                                <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                    <MdOutlineMenu className="w-6 h-6 text-gray-600" />
                                </motion.div>
                            ) : isCollapsed ? (
                                <motion.div key="collapse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                    <MdOutlineMenu className="w-6 h-6 text-gray-600" />
                                </motion.div>
                            ) : (
                                <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                    <MdMenuOpen className="w-6 h-6 text-gray-600" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                <div className="relative ml-8 flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    {customTopbarHeader ? (
                        <TopbarCustomTitle title={customTopbarHeader.title} subtitle={customTopbarHeader.subtitle} />
                    ) : (
                        <h2
                            className="relative min-w-0 shrink truncate text-sm font-bold sm:text-base md:text-lg lg:text-xl max-w-[min(42vw,24rem)] sm:max-w-[min(38vw,28rem)] bg-gradient-to-r from-[#1a237e] via-[#0d47a1] to-[#1565c0] bg-clip-text text-transparent after:block after:w-full after:h-[3px] after:mt-1 after:rounded-full after:bg-gradient-to-r after:from-[#1a237e] after:via-[#0d47a1] after:to-[#42a5f5] after:shadow-[0_2px_6px_rgba(26,35,126,0.35)]"
                            title={currentTitle}
                        >
                            {currentTitle}
                        </h2>
                    )}
                    <div
                        className="hidden min-h-[50px] min-w-0 flex-1 items-center justify-center self-stretch sm:flex"
                        aria-hidden
                    />
                </div>

                <div className="ml-2 flex shrink-0 items-center gap-2 sm:ml-4 md:ml-8">
                    {/* Một khối: cơ sở/chi nhánh + phiên bản (tạm bỏ ngày giờ) */}
                    <div
                        className="flex items-center min-w-0 max-w-[min(92vw,20rem)] sm:max-w-[min(50vw,24rem)] md:max-w-[min(40vw,28rem)] rounded-[10px] shadow-[0_4px_8px_rgba(0,0,0,0.3)] border border-white/10 bg-gradient-to-r from-[#1a237e] to-[#0d47a1] py-1.5 px-2.5 sm:py-[6px] sm:px-3 md:px-4"
                        title={branchDisplayTen ? `Cơ sở đào tạo: ${branchDisplayTen}` : 'Cơ sở đào tạo'}
                    >
                        <div className="min-w-0 flex-1 flex flex-col gap-0 pr-2 sm:pr-3 border-r border-white/25">
                            <span className="text-[9px] sm:text-[10px] leading-tight text-white/75 uppercase tracking-wide">
                                Cơ sở đào tạo
                            </span>
                            <span
                                className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate"
                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                            >
                                {branchDisplayTen || '—'}
                            </span>
                        </div>
                        <div className="pl-2 sm:pl-3 shrink-0 flex flex-col justify-center">
                            <span className="text-[9px] sm:text-[10px] text-white/75 uppercase tracking-wide leading-tight">Phiên bản</span>
                            <span
                                className="text-xs sm:text-sm md:text-[15px] font-bold text-white tabular-nums leading-tight"
                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                            >
                                V: {process.env.NEXT_PUBLIC_VERSION ?? '—'}
                            </span>
                        </div>
                    </div>

                    {/* User avatar - thu nhỏ mặc định, hover mở rộng */}
                    <div
                        className="hidden md:flex items-center"
                        onMouseEnter={() => setIsUserHovered(true)}
                        onMouseLeave={() => setIsUserHovered(false)}
                    >
                        <div
                            className="flex items-center bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
                            onClick={handleClick}
                            style={{
                                padding: isUserHovered ? '8px 12px 8px 24px' : '6px',
                                gap: isUserHovered ? '12px' : '0px',
                            }}
                        >
                            <div
                                className="flex flex-col min-w-0 transition-all duration-300 overflow-hidden"
                                style={{
                                    maxWidth: isUserHovered ? '180px' : '0px',
                                    opacity: isUserHovered ? 1 : 0,
                                }}
                            >
                                <span className="text-sm font-semibold text-[#007BFF] truncate whitespace-nowrap">{avatarDisplayName}</span>
                                <span className="text-xs text-gray-500 truncate whitespace-nowrap">{avatarSubText}</span>
                            </div>
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm">
                                    <Image
                                        src={avatarSrc}
                                        alt="Avatar"
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                        unoptimized
                                    />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile avatar */}
                    <div
                        className="md:hidden p-2 bg-gray-200 rounded-full shadow-lg hover:bg-gray-300 transition-colors duration-300 cursor-pointer relative"
                        onClick={handleClick}
                    >
                        <div className="w-8 h-8 rounded overflow-hidden border-2 border-blue-100 shadow-sm">
                            <Image
                                src={avatarSrc}
                                alt="Avatar"
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                                unoptimized
                            />
                        </div>
                        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                    </div>

                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        slotProps={{
                            paper: {
                                elevation: 3,
                                sx: {
                                    overflow: "visible",
                                    filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.1))",
                                    mt: 1.5,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "16px",
                                    minWidth: "300px",
                                    "&::before": {
                                        content: '""',
                                        display: "block",
                                        position: "absolute",
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: "background.paper",
                                        transform: "translateY(-50%) rotate(45deg)",
                                        zIndex: 0,
                                        borderTop: "1px solid #e5e7eb",
                                        borderLeft: "1px solid #e5e7eb",
                                    },
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm">
                                    <Image
                                        src={avatarSrc}
                                        alt="Avatar"
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <div className="font-semibold text-[#007BFF] text-sm">{avatarDisplayName}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{avatarSubText}</div>
                                </div>
                            </div>
                        </div>

                        <MenuItem onClick={handleProfileNguoidung} sx={{
                            color: "#4b5563",
                            py: 1,
                            px: 2,
                            mx: 1,
                            mt: 0.5,
                            borderRadius: "6px",
                            '&:hover': {
                                backgroundColor: '#f3f4f6',
                                color: '#007BFF',
                                transform: 'translateX(4px)'
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}>
                            <PersonOutlineIcon sx={{
                                color: "inherit",
                                mr: 1.5,
                                fontSize: "1.1rem",
                                transition: 'all 0.2s ease-in-out'
                            }} />
                            <span className="font-medium text-sm">Thông tin người dùng</span>
                        </MenuItem>

                        <MenuItem onClick={openUserInfoChangePasswordModal} sx={{
                            color: "#4b5563",
                            py: 1,
                            px: 2,
                            mx: 1,
                            mt: 0.5,
                            borderRadius: "6px",
                            '&:hover': {
                                backgroundColor: '#f3f4f6',
                                color: '#007BFF',
                                transform: 'translateX(4px)'
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}>
                            <AdminPanelSettingsIcon sx={{
                                color: "inherit",
                                mr: 1.5,
                                fontSize: "1.1rem",
                                transition: 'all 0.2s ease-in-out'
                            }} />
                            <span className="font-medium text-sm">Thay đổi mật khẩu</span>
                        </MenuItem>

                        <Divider sx={{ my: 1 }} />

                        <MenuItem onClick={handleLogout} sx={{
                            color: "#ef4444",
                            py: 1,
                            px: 2,
                            mx: 1,
                            mt: 0.5,
                            borderRadius: "6px",
                            '&:hover': {
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                transform: 'translateX(4px)'
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}>
                            <ListItemIcon>
                                <ExitToAppIcon sx={{
                                    color: "inherit",
                                    fontSize: "1.1rem",
                                    transition: 'all 0.2s ease-in-out'
                                }} />
                            </ListItemIcon>
                            <span className="font-medium text-sm">Đăng xuất</span>
                        </MenuItem>
                    </Menu>
                </div>
            </div>

            <Modal
                isOpen={isNguoiSuDungModalOpen}
                onClose={handleCloseNguoiSuDungModal}
                title="THÔNG TIN CÁ NHÂN"
                size="lg"
            >
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                            <input
                                type="text"
                                readOnly
                                value={userProfile?.userName || user?.username || user?.hsoft_Account || ''}
                                className="w-full h-9 border border-gray-300 rounded-md px-3 text-sm bg-gray-100 text-gray-700"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                            <input
                                type="text"
                                readOnly
                                value={normalizeVietnameseText(userProfile?.fullname) || normalizedUserDisplayName || 'Người dùng'}
                                className="w-full h-9 border border-gray-300 rounded-md px-3 text-sm bg-gray-100 text-gray-700"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                            <input
                                type="text"
                                readOnly
                                value={formatDateForDisplay(userProfile?.dateOfBirth) || '—'}
                                className="w-full h-9 border border-gray-300 rounded-md px-3 text-sm bg-gray-100 text-gray-700"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input
                                type="text"
                                readOnly
                                value={(userProfile?.phoneNumber || '').trim() || '—'}
                                className="w-full h-9 border border-gray-300 rounded-md px-3 text-sm bg-gray-100 text-gray-700"
                            />
                        </div>
                        <div className="flex flex-col md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="text"
                                readOnly
                                value={(userProfile?.email || '').trim() || '—'}
                                className="w-full h-9 border border-gray-300 rounded-md px-3 text-sm bg-gray-100 text-gray-700"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <Button
                            variant="contained"
                            onClick={() => setChangePasswordVisible(true)}
                            sx={{ textTransform: 'none' }}
                        >
                            Thay đổi mật khẩu
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleCloseNguoiSuDungModal}
                            sx={{ textTransform: 'none' }}
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isChangePasswordVisible}
                onClose={closeChangePasswordModal}
                title="THAY ĐỔI MẬT KHẨU"
                size="md"
                overlayZIndexClass={isNguoiSuDungModalOpen ? 'z-[110]' : 'z-[100]'}
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                        <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                            {userProfile?.userName || user?.username || user?.hsoft_Account || ''}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                        <TextField
                            type="password"
                            fullWidth
                            size="small"
                            autoFocus
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            error={!passwordPolicySatisfied && newPassword.length > 0}
                            title={passwordPolicySatisfied ? '' : passwordTooltip}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: !passwordPolicySatisfied && newPassword.length > 0 ? '#ef4444' : '#e5e7eb',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: !passwordPolicySatisfied && newPassword.length > 0 ? '#dc2626' : '#007BFF',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: !passwordPolicySatisfied && newPassword.length > 0 ? '#dc2626' : '#007BFF',
                                    },
                                },
                            }}
                        />
                        {!passwordPolicySatisfied && newPassword.length > 0 && (
                            <p className="mt-1 text-xs text-amber-700">
                                Mật khẩu chưa đủ điều kiện. Di chuột vào ô để xem chi tiết.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu mới</label>
                        <TextField
                            type="password"
                            fullWidth
                            size="small"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={!passwordMatched && confirmPassword.length > 0}
                            title={passwordMatched ? '' : confirmPasswordTooltip}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: !passwordMatched && confirmPassword.length > 0 ? '#ef4444' : '#e5e7eb',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: !passwordMatched && confirmPassword.length > 0 ? '#dc2626' : '#007BFF',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: !passwordMatched && confirmPassword.length > 0 ? '#dc2626' : '#007BFF',
                                    },
                                },
                            }}
                        />
                        {!passwordMatched && confirmPassword.length > 0 && (
                            <p className="mt-1 text-xs text-amber-700">Mật khẩu nhập lại chưa khớp.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-200">
                        <Button
                            variant="contained"
                            onClick={handleChangePassword}
                            sx={{
                                textTransform: 'none',
                                backgroundColor: '#007BFF',
                                '&:hover': {
                                    backgroundColor: '#004494',
                                },
                            }}
                        >
                            Lưu thay đổi
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={closeChangePasswordModal}
                            sx={{
                                textTransform: 'none',
                                color: '#4b5563',
                                borderColor: '#e5e7eb',
                                '&:hover': {
                                    borderColor: '#007BFF',
                                    color: '#007BFF',
                                },
                            }}
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
}
