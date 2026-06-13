import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kết quả trận đấu',
};

export default function WcKetQuaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
