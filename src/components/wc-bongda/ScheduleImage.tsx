import { withBasePath } from '@/lib/base-path';

type ScheduleImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Ảnh lịch thi đấu lớn — tải ngay, ưu tiên hiển thị sắc nét */
  priority?: boolean;
};

/** Ảnh tĩnh local — dùng thẻ img gốc, không qua Next/Image optimizer */
export default function ScheduleImage({
  src,
  alt,
  className = '',
  priority = false,
}: ScheduleImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={withBasePath(src)}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      draggable={false}
      className={className}
    />
  );
}
