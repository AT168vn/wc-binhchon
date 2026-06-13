export type WcPollOption = {
  id: string;
  label: string;
};

export type WcPollFrame = {
  id: string;
  title?: string;
  imageUrl?: string;
  closeAt: string;
  pollExpired?: boolean;
  options?: WcPollOption[];
};

export type WcScheduleGroup = {
  id: string;
  imageUrl: string;
  pollFrames: [WcPollFrame, WcPollFrame];
};

export type WcScheduleRound = {
  id: string;
  date: string;
  label: string;
  groups: WcScheduleGroup[];
};

export const WC_SCHEDULE_ROUNDS: WcScheduleRound[] = [
  {
    id: 'bang-a-12062026',
    date: '2026-06-12',
    label: 'Vòng đấu bảng: Ngày 12/06/2026',
    groups: [
      {
        id: 'bang-a-12062026-group',
        imageUrl: '/images/TranDau/BangA_12.06.2026.jpg',
        pollFrames: [
          {
            id: 'bang-a-match-1',
            title: 'Trận 1',
            closeAt: '11:00 12/06/2026',
            pollExpired: true,
          },
          {
            id: 'bang-a-match-2',
            title: 'Trận 2',
            closeAt: '11:00 12/06/2026',
            pollExpired: true,
          },
        ],
      },
    ],
  },
  {
    id: 'bang-b-d-13062026',
    date: '2026-06-13',
    label: 'Vòng đấu bảng: Ngày 13/06/2026',
    groups: [
      {
        id: 'bang-b-d-13062026-group',
        imageUrl: '/images/TranDau/BangB_D_13.06.2026.jpg',
        pollFrames: [
          {
            id: 'bang-b-d-match-1',
            title: 'Trận 1',
            closeAt: '11:00 13/06/2026',
            pollExpired: true,
          },
          {
            id: 'bang-b-d-match-2',
            title: 'Trận 2',
            closeAt: '11:00 13/06/2026',
            pollExpired: true,
          },
        ],
      },
    ],
  },
  {
    id: 'tran-14062026',
    date: '2026-06-14',
    label: 'Vòng đấu bảng: Ngày 14/06/2026',
    groups: [
      {
        id: 'tran-14062026-group-1-2',
        imageUrl: '/images/TranDau/Tran1_2_14.06.2026.jpg',
        pollFrames: [
          {
            id: 'tran-14062026-match-1',
            title: 'Trận 1',
            closeAt: '13:30 14/06/2026',
            options: [
              { id: 'qatar', label: 'Qatar' },
              { id: 'hoa', label: 'Hòa' },
              { id: 'thuy-si', label: 'Thụy Sĩ' },
            ],
          },
          {
            id: 'tran-14062026-match-2',
            title: 'Trận 2',
            closeAt: '16:30 14/06/2026',
            options: [
              { id: 'brasil', label: 'Brasil' },
              { id: 'hoa', label: 'Hòa' },
              { id: 'maroc', label: 'Maroc' },
            ],
          },
        ],
      },
      {
        id: 'tran-14062026-group-3-4',
        imageUrl: '/images/TranDau/Tran3_4_14.06.2026.jpg',
        pollFrames: [
          {
            id: 'tran-14062026-match-3',
            title: 'Trận 3',
            closeAt: '07:30 14/06/2026',
            options: [
              { id: 'haiti', label: 'Haiti' },
              { id: 'hoa', label: 'Hòa' },
              { id: 'scotland', label: 'Scotland' },
            ],
          },
          {
            id: 'tran-14062026-match-4',
            title: 'Trận 4',
            closeAt: '10:30 14/06/2026',
            options: [
              { id: 'uc', label: 'Úc' },
              { id: 'hoa', label: 'Hòa' },
              { id: 'tho-nhi-ky', label: 'Thổ Nhĩ Kỳ' },
            ],
          },
        ],
      },
    ],
  },
];

export function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function parseRoundDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

export function getDaysBeforeToday(roundDateStr: string, today = startOfDay(new Date())): number {
  const roundDate = parseRoundDate(roundDateStr);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((today.getTime() - roundDate.getTime()) / msPerDay);
}

export function formatRoundDateLabel(dateStr: string): string {
  const roundDate = parseRoundDate(dateStr);
  const day = String(roundDate.getDate()).padStart(2, '0');
  const month = String(roundDate.getMonth() + 1).padStart(2, '0');
  const year = roundDate.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getTabLabel(roundDateStr: string, today = startOfDay(new Date())): string {
  if (getDaysBeforeToday(roundDateStr, today) === 0) {
    return 'Hôm nay';
  }

  return formatRoundDateLabel(roundDateStr);
}

export function getDefaultRoundId(today = startOfDay(new Date())): string {
  const todayRound = WC_SCHEDULE_ROUNDS.find(
    (round) => getDaysBeforeToday(round.date, today) === 0,
  );
  if (todayRound) {
    return todayRound.id;
  }

  const sortedRounds = [...WC_SCHEDULE_ROUNDS].sort(
    (a, b) => parseRoundDate(b.date).getTime() - parseRoundDate(a.date).getTime(),
  );
  const latestPastRound = sortedRounds.find(
    (round) => getDaysBeforeToday(round.date, today) > 0,
  );

  return latestPastRound?.id ?? sortedRounds[0]?.id ?? WC_SCHEDULE_ROUNDS[0].id;
}

export function sortRoundsForTabs(
  rounds: WcScheduleRound[],
  today = startOfDay(new Date()),
): WcScheduleRound[] {
  return [...rounds].sort((a, b) => {
    const aDays = getDaysBeforeToday(a.date, today);
    const bDays = getDaysBeforeToday(b.date, today);

    if (aDays === 0 && bDays !== 0) return -1;
    if (bDays === 0 && aDays !== 0) return 1;
    if (aDays === 0 && bDays === 0) return a.id.localeCompare(b.id);

    if (aDays > 0 && bDays > 0) {
      return parseRoundDate(b.date).getTime() - parseRoundDate(a.date).getTime();
    }

    if (aDays > 0 && bDays < 0) return -1;
    if (aDays < 0 && bDays > 0) return 1;

    return parseRoundDate(a.date).getTime() - parseRoundDate(b.date).getTime();
  });
}

export function collectPollFrames(round: WcScheduleRound): WcPollFrame[] {
  return round.groups.flatMap((group) => [...group.pollFrames]);
}

export function getTranIdsForDate(date: string): string[] {
  const round = WC_SCHEDULE_ROUNDS.find((item) => item.date === date);
  if (!round) {
    return [];
  }
  return collectPollFrames(round).map((frame) => frame.id);
}

/** Ngày bắt đầu tính điểm / tiền (các ngày trước chỉ xem lịch, không tính) */
export const WC_NGAY_BAT_DAU_TINH_DIEM = '2026-06-14';

export function isWcScoringDate(date: string): boolean {
  return (
    parseRoundDate(date).getTime() >= parseRoundDate(WC_NGAY_BAT_DAU_TINH_DIEM).getTime()
  );
}

/** Parse chuỗi đóng bình chọn dạng "HH:mm dd/MM/yyyy" (giờ local) */
export function parseCloseAt(closeAt: string): Date | null {
  const match = closeAt.trim().match(/^(\d{1,2}):(\d{2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const day = Number(match[3]);
  const month = Number(match[4]);
  const year = Number(match[5]);
  const value = new Date(year, month - 1, day, hour, minute, 0, 0);

  return Number.isNaN(value.getTime()) ? null : value;
}

export function findPollFrame(tranId: string, roundId?: string): WcPollFrame | null {
  for (const round of WC_SCHEDULE_ROUNDS) {
    if (roundId && round.id !== roundId) {
      continue;
    }
    for (const group of round.groups) {
      for (const frame of group.pollFrames) {
        if (frame.id === tranId) {
          return frame;
        }
      }
    }
  }
  return null;
}

/** Trận đã hết hạn bình chọn (cờ pollExpired hoặc đã qua giờ closeAt) */
export function isPollFrameClosed(frame: WcPollFrame, now = new Date()): boolean {
  if (frame.pollExpired === true) {
    return true;
  }

  const closeAt = parseCloseAt(frame.closeAt);
  if (!closeAt) {
    return false;
  }

  return now.getTime() >= closeAt.getTime();
}

/** Tiền mỗi KQ đúng (VNĐ) — không cộng tiền */
export const WC_TIEN_MOI_KQ_DUNG = 0;

/** Tiền mỗi KQ sai (VNĐ) */
export const WC_TIEN_MOI_KQ_SAI = 20_000;

/** Tiền mỗi KQ không tham gia (VNĐ) */
export const WC_TIEN_MOI_KHONG_TG = 10_000;
