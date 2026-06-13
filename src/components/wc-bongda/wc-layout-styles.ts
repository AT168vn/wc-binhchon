/** Class dùng chung cho layout wc_bongda / wc_ketqua */
export const WC_LAYOUT = {
  roundGrid: 'grid w-full grid-cols-1 items-stretch gap-3 lg:grid-cols-2',
  groupArticle: 'flex h-full min-w-0 flex-col overflow-hidden rounded-sm border border-[#cfd8dc]',
  groupArticleEmpty:
    'flex h-full min-w-0 flex-col overflow-hidden rounded-sm border border-dashed border-[#cfd8dc] bg-[#fafbfc]',
  /** Không giới hạn chiều cao — ảnh hiển thị full width cột, tránh ép scale gây mờ */
  scheduleImageBox: 'flex w-full items-center justify-center bg-white px-1 py-1',
  scheduleImage:
    'wc-schedule-image block h-auto w-full max-w-none rounded-sm border border-[#cfd8dc]',
  pollImage:
    'wc-schedule-image block h-auto w-auto max-w-full rounded-sm border border-[#cfd8dc]',
  pollGrid: 'grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2',
  matchFrame: 'flex h-full w-full flex-col overflow-hidden rounded-sm border border-[#cfd8dc] bg-white',
  matchFrameEmpty:
    'flex h-full w-full flex-col overflow-hidden rounded-sm border border-dashed border-[#d1d5db] bg-[#f9fafb]',
  matchFrameHeader:
    'flex min-h-[28px] flex-wrap items-center justify-between gap-x-2 gap-y-0.5 border-b border-[#cfd8dc] bg-[#f5f7f9] px-2 py-1',
  matchFrameBody: 'flex min-h-[118px] flex-1 flex-col justify-center p-1.5',
  matchFrameBodyMuted:
    'flex min-h-[118px] flex-1 flex-col items-center justify-center rounded-sm border border-dashed border-[#cfd8dc] bg-[#f9fafb] p-2',
} as const;
