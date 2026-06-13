import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-blue-900 px-4 text-white">
      <h1 className="text-[clamp(4rem,18vw,9rem)] font-bold leading-none text-orange-500">404</h1>
      <p className="mt-4 max-w-md text-center text-lg text-white/90">
        Trang bạn tìm không tồn tại trên hệ thống.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
