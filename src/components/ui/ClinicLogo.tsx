'use client';

/** Logo clinic: trái tim + ECG + viền tròn gradient xanh (Topbar) + thập y tế - dùng chung login / sidebar */
interface ClinicLogoProps {
  size?: number;
  className?: string;
  /** 'white' cho nền tối (sidebar) */
  variant?: 'default' | 'white';
}

/** Viền tròn default: cùng tông Topbar (#1a237e → #0d47a1) + highlight 3D (#42a5f5). */
const RING_GRADIENT_STOPS = [
  { offset: '0%', color: '#42a5f5' },
  { offset: '42%', color: '#1565c0' },
  { offset: '100%', color: '#1a237e' },
] as const;

const ClinicLogo = ({ size = 40, className = '', variant = 'default' }: ClinicLogoProps) => {
  const isWhite = variant === 'white';
  const heartFill = isWhite ? '#fff' : '#4CAF50';
  const crossFill = isWhite ? '#fff' : '#2196F3';
  /**
   * Id cố định theo variant — tránh lệch hydration do `useId` khác nhau giữa SSR và client
   * khi thứ tự hook / cây component khác (MUI, sidebar `!isMounted`, v.v.).
   * Chỉ dùng một `ClinicLogo` mỗi variant trên cùng một document (hiện tại: login HOẶC sidebar).
   */
  const gradientId = isWhite ? 'clinic-logo-ring-white' : 'clinic-logo-ring-default';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} title="Quản Lý Đào Tạo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          {isWhite ? (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#e0e0e0" />
            </linearGradient>
          ) : (
            <linearGradient id={gradientId} x1="10%" y1="8%" x2="90%" y2="92%">
              {RING_GRADIENT_STOPS.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          )}
        </defs>
        <path
          d="M60 20 A40 40 0 0 1 100 60 A40 40 0 0 1 60 100 A40 40 0 0 1 20 60 A40 40 0 0 1 60 20"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <g transform="translate(60, 60)">
          <path
            d="M0 -12 C-8 -20 -18 -16 -18 -8 C-18 0 -8 8 0 16 C8 8 18 0 18 -8 C18 -16 8 -20 0 -12 Z"
            fill={heartFill}
          />
          <path
            d="M-22 0 L-14 0 L-10 -6 L-6 4 L-2 -2 L2 2 L6 -4 L10 4 L14 0 L22 0"
            stroke={heartFill}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g transform="translate(76, 46) scale(0.78)">
          <rect x="-4" y="-10" width="8" height="20" fill={crossFill} rx="2" />
          <rect x="-10" y="-4" width="20" height="8" fill={crossFill} rx="2" />
        </g>
      </svg>
    </div>
  );
};

export default ClinicLogo;
