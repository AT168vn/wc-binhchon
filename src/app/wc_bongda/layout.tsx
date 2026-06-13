import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bình chọn',
};

export default function WcBongdaLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#eef1f4]">{children}</div>;
}
