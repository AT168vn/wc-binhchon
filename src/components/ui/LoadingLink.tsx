'use client';

import { useDebouncedNavigation } from '@/hooks/useDebouncedNavigation';
import { ReactNode } from 'react';
import Link from 'next/link';

interface LoadingLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  scroll?: boolean;
}

export default function LoadingLink({ href, children, className, prefetch = true, scroll = true }: LoadingLinkProps) {
  const { callPage } = useDebouncedNavigation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    callPage(href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className} prefetch={prefetch} scroll={scroll}>
      {children}
    </Link>
  );
}
