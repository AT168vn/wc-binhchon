'use client';

import Link from 'next/link';
import Image from 'next/image';
import ClinicLogo from '@/components/ui/ClinicLogo';
import { getCustomLogoUrl } from '@/lib/logo';

interface LogoProps {
    isCollapsed: boolean;
}

const Logo: React.FC<LogoProps> = ({ isCollapsed }) => {
    const customLogoUrl = getCustomLogoUrl();
    const size = isCollapsed ? 36 : 48;

    return (
        <div className="h-[72px] flex items-center justify-center">
            <Link
                href="/wc_bongda"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center hover:opacity-90 transition-opacity duration-200 ease-in-out"
                title={process.env.NEXT_PUBLIC_TEN_HIEN_THI}
            >
                {customLogoUrl ? (
                    <Image
                        src={customLogoUrl}
                        alt="Logo"
                        width={size}
                        height={size}
                        className="object-contain"
                    />
                ) : (
                    <ClinicLogo size={size} />
                )}
            </Link>
        </div>
    );
};

export default Logo; 