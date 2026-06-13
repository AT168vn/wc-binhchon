'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import {
  WC_SCHEDULE_ROUNDS,
  getDefaultRoundId,
  getDaysBeforeToday,
  getTabLabel,
  isWcScoringDate,
  sortRoundsForTabs,
  startOfDay,
  type WcPollFrame,
  type WcScheduleGroup,
  type WcScheduleRound,
} from '@/config/wc-schedule';
import { WC_LAYOUT } from '@/components/wc-bongda/wc-layout-styles';
import ScheduleImage from '@/components/wc-bongda/ScheduleImage';
import { usePollFrameClosed } from '@/components/wc-bongda/usePollFrameClosed';

type TaiKhoanBinhChon = {
  su_taikhoan: string;
  su_hoten: string | null;
};

type TongHopBinhChon = TaiKhoanBinhChon & {
  so_tran_chon: number;
  kq_dung: number;
  kq_sai: number;
  khong_tg: number;
  so_tien: number;
};

type KetQuaBinhChon = {
  tran_id: string;
  ket_qua: string;
  ket_qua_ten: string | null;
  da_khoa: boolean;
};

async function saveKetQuaBinhChon(payload: {
  su_taikhoan: string;
  ngay_thi_dau: string;
  round_id: string;
  tran_id: string;
  ket_qua: string;
  ket_qua_ten: string | null;
  da_khoa: boolean;
}): Promise<KetQuaBinhChon> {
  const res = await fetch('/api/ket-qua-binh-chon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => null)) as
    | { data?: KetQuaBinhChon & { ngay_thi_dau?: string; su_taikhoan?: string; round_id?: string } }
    | { message?: string }
    | null;

  if (!res.ok || !body || !('data' in body) || !body.data) {
    throw new Error(
      body && 'message' in body && body.message
        ? body.message
        : 'Không lưu được kết quả bình chọn.',
    );
  }

  return {
    tran_id: body.data.tran_id,
    ket_qua: body.data.ket_qua,
    ket_qua_ten: body.data.ket_qua_ten,
    da_khoa: body.data.da_khoa,
  };
}

const PAGE_TITLE = 'Lịch thi đấu';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function resolveDefaultTaiKhoan(
  rows: TongHopBinhChon[],
  current: string | null,
  loggedInTaikhoan: string,
): string | null {
  if (current && rows.some((row) => row.su_taikhoan === current)) {
    return current;
  }
  if (loggedInTaikhoan && rows.some((row) => row.su_taikhoan === loggedInTaikhoan)) {
    return loggedInTaikhoan;
  }
  return rows[0]?.su_taikhoan ?? null;
}

function ModuleHeader({
  title,
  variant = 'poll',
}: {
  title: string;
  variant?: 'schedule' | 'poll';
}) {
  const isSchedule = variant === 'schedule';

  return (
    <div
      className={`border-b px-3 py-1.5 ${
        isSchedule
          ? 'border-[#006699] bg-[#0088cc]'
          : 'border-[#b8dce8] bg-[#00a8e8]'
      }`}
    >
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

function PollFrame({
  frame,
  roundDate,
  roundId,
  suTaikhoan,
  savedVote,
  onSaved,
}: {
  frame: WcPollFrame;
  roundDate: string;
  roundId: string;
  suTaikhoan: string | null;
  savedVote?: KetQuaBinhChon | null;
  onSaved: (vote: KetQuaBinhChon) => void;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isExpired = usePollFrameClosed(frame);
  const isReadOnly = !suTaikhoan;

  useEffect(() => {
    if (savedVote) {
      setSelectedOptionId(savedVote.ket_qua);
      setIsLocked(savedVote.da_khoa);
    } else {
      setSelectedOptionId(null);
      setIsLocked(false);
    }
    setSaveError(null);
  }, [frame.id, savedVote]);

  async function persistVote(daKhoa: boolean) {
    if (isExpired || !suTaikhoan || !selectedOptionId) {
      return;
    }

    const option = frame.options?.find((item) => item.id === selectedOptionId);

    setIsSaving(true);
    setSaveError(null);

    try {
      const saved = await saveKetQuaBinhChon({
        su_taikhoan: suTaikhoan,
        ngay_thi_dau: roundDate,
        round_id: roundId,
        tran_id: frame.id,
        ket_qua: selectedOptionId,
        ket_qua_ten: option?.label ?? savedVote?.ket_qua_ten ?? null,
        da_khoa: daKhoa,
      });
      setIsLocked(daKhoa);
      onSaved(saved);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Không lưu được kết quả bình chọn.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={WC_LAYOUT.matchFrame}>
      <div className={WC_LAYOUT.matchFrameHeader}>
        {frame.title ? (
          <p className="text-xs font-semibold text-[#111827]">{frame.title}</p>
        ) : (
          <span />
        )}
        {!isExpired ? (
          <p className="text-[11px] leading-tight text-[#374151]">
            <span className="font-semibold text-[#111827]">Đóng:</span> {frame.closeAt}
          </p>
        ) : (
          <span />
        )}
      </div>
      {isExpired ? (
        <div className={WC_LAYOUT.matchFrameBodyMuted}>
          <p className="text-xs font-semibold text-[#6b7280]">Đã hết thời gian bình chọn</p>
        </div>
      ) : frame.options?.length ? (
        <div className={WC_LAYOUT.matchFrameBody}>
          {frame.imageUrl ? (
            <div className="mb-2 flex justify-center">
              <ScheduleImage
                src={frame.imageUrl}
                alt={frame.title ?? 'Bình chọn'}
                className={WC_LAYOUT.pollImage}
              />
            </div>
          ) : null}
          <>
            <div
              className="flex flex-wrap items-center justify-center gap-1 py-0.5"
              role="radiogroup"
              aria-label={frame.title ?? 'Bình chọn'}
              aria-disabled={isLocked || isReadOnly}
            >
              {frame.options.map((option) => {
                const isSelected = selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isExpired || isLocked || isSaving || isReadOnly}
                    onClick={() => {
                      if (isExpired || isReadOnly) {
                        return;
                      }
                      setSelectedOptionId(option.id);
                    }}
                    className={`min-w-[64px] rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
                      isExpired || isLocked || isReadOnly
                        ? isSelected
                          ? 'cursor-not-allowed bg-[#006699] text-white opacity-90'
                          : 'cursor-not-allowed border border-[#e5e7eb] bg-[#f3f4f6] text-[#9ca3af]'
                        : isSelected
                          ? 'bg-[#0088cc] text-white'
                          : 'border border-[#cfd8dc] bg-white text-[#111827] hover:bg-[#f5f7f9]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="my-1.5 border-t border-dotted border-[#b0bec5]" />

            <div className="flex flex-wrap justify-center gap-1.5 pt-0.5">
              <button
                type="button"
                disabled={isExpired || isLocked || !selectedOptionId || isSaving || isReadOnly}
                onClick={() => void persistVote(true)}
                className="rounded-sm bg-[#70ad47] px-3 py-1 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#5f9638] disabled:cursor-not-allowed disabled:bg-[#c8dcc0] disabled:text-[#5f6f58] disabled:shadow-none"
              >
                {isSaving ? 'Đang lưu...' : 'Đồng ý'}
              </button>
              <button
                type="button"
                disabled={isExpired || !isLocked || isSaving || isReadOnly}
                onClick={() => void persistVote(false)}
                className="rounded-sm border border-[#cfd8dc] bg-white px-3 py-1 text-xs font-medium text-[#111827] transition-colors hover:bg-[#f5f7f9] disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:bg-[#f3f4f6] disabled:text-[#9ca3af]"
              >
                Chọn lại
              </button>
            </div>
            {saveError ? <p className="mt-1.5 text-center text-[11px] text-[#b3261e]">{saveError}</p> : null}
          </>
        </div>
      ) : (
        <div className={WC_LAYOUT.matchFrameBodyMuted}>
          <p className="text-xs text-[#6b7280]">Khung bình chọn</p>
        </div>
      )}
    </div>
  );
}

function PollSection({
  frames,
  roundDate,
  roundId,
  suTaikhoan,
  ketQuaMap,
  onSaved,
}: {
  frames: [WcPollFrame, WcPollFrame];
  roundDate: string;
  roundId: string;
  suTaikhoan: string | null;
  ketQuaMap: Record<string, KetQuaBinhChon>;
  onSaved: (vote: KetQuaBinhChon) => void;
}) {
  return (
    <>
      <ModuleHeader title="Bình chọn" variant="poll" />
      <div className="px-3 py-1.5">
        <div className={WC_LAYOUT.pollGrid}>
          {frames.map((frame) => (
            <PollFrame
              key={frame.id}
              frame={frame}
              roundDate={roundDate}
              roundId={roundId}
              suTaikhoan={suTaikhoan}
              savedVote={ketQuaMap[frame.id] ?? null}
              onSaved={onSaved}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function EmptyPollFrameSlot({ title }: { title: string }) {
  return (
    <div className={WC_LAYOUT.matchFrameEmpty}>
      <div className={`${WC_LAYOUT.matchFrameHeader} border-dashed border-[#d1d5db]`}>
        <p className="text-xs font-semibold text-[#9ca3af]">{title}</p>
        <span />
      </div>
      <div className={WC_LAYOUT.matchFrameBodyMuted}>
        <p className="text-xs text-[#9ca3af]">—</p>
      </div>
    </div>
  );
}

function EmptyScheduleGroupPlaceholder({
  label,
  pollTitles,
}: {
  label: string;
  pollTitles: [string, string];
}) {
  return (
    <article className={WC_LAYOUT.groupArticleEmpty}>
      <ModuleHeader title={label} variant="schedule" />
      <div className={WC_LAYOUT.scheduleImageBox}>
        <p className="text-xs text-[#9ca3af]">Không có trận đấu</p>
      </div>
      <ModuleHeader title="Bình chọn" variant="poll" />
      <div className="px-3 py-1.5">
        <div className={WC_LAYOUT.pollGrid}>
          <EmptyPollFrameSlot title={pollTitles[0]} />
          <EmptyPollFrameSlot title={pollTitles[1]} />
        </div>
      </div>
    </article>
  );
}

function ScheduleGroupContent({
  label,
  group,
  roundDate,
  roundId,
  suTaikhoan,
  ketQuaMap,
  onSaved,
}: {
  label: string;
  group: WcScheduleGroup;
  roundDate: string;
  roundId: string;
  suTaikhoan: string | null;
  ketQuaMap: Record<string, KetQuaBinhChon>;
  onSaved: (vote: KetQuaBinhChon) => void;
}) {
  return (
    <article id={`wc-group-${group.id}`} className={WC_LAYOUT.groupArticle}>
      <ModuleHeader title={label} variant="schedule" />
      <div className={WC_LAYOUT.scheduleImageBox}>
        {group.imageUrl ? (
          <ScheduleImage
            src={group.imageUrl}
            alt={label}
            className={WC_LAYOUT.scheduleImage}
            priority
          />
        ) : (
          <p className="text-xs text-[#9ca3af]">Không có trận đấu</p>
        )}
      </div>
      <PollSection
        frames={group.pollFrames}
        roundDate={roundDate}
        roundId={roundId}
        suTaikhoan={suTaikhoan}
        ketQuaMap={ketQuaMap}
        onSaved={onSaved}
      />
    </article>
  );
}

function ScheduleRoundContent({
  round,
  suTaikhoan,
  ketQuaMap,
  onSaved,
}: {
  round: WcScheduleRound;
  suTaikhoan: string | null;
  ketQuaMap: Record<string, KetQuaBinhChon>;
  onSaved: (vote: KetQuaBinhChon) => void;
}) {
  const leftGroup = round.groups[0] ?? null;
  const rightGroup = round.groups[1] ?? null;

  return (
    <div id={`wc-round-${round.id}`} className={WC_LAYOUT.roundGrid}>
      {leftGroup ? (
        <ScheduleGroupContent
          label={round.label}
          group={leftGroup}
          roundDate={round.date}
          roundId={round.id}
          suTaikhoan={suTaikhoan}
          ketQuaMap={ketQuaMap}
          onSaved={onSaved}
        />
      ) : (
        <EmptyScheduleGroupPlaceholder label={round.label} pollTitles={['Trận 1', 'Trận 2']} />
      )}
      {rightGroup ? (
        <ScheduleGroupContent
          label={round.label}
          group={rightGroup}
          roundDate={round.date}
          roundId={round.id}
          suTaikhoan={suTaikhoan}
          ketQuaMap={ketQuaMap}
          onSaved={onSaved}
        />
      ) : (
        <EmptyScheduleGroupPlaceholder label={round.label} pollTitles={['Trận 3', 'Trận 4']} />
      )}
    </div>
  );
}

export default function DMBinhChonWC() {
  const { user, logout, isInitialized } = useAuth();
  const loggedInTaikhoan = (user?.username || user?.hsoft_Account || '').trim();
  const loggedInHoten = (user?.displayName || '').trim() || loggedInTaikhoan;
  const showLoggedInUser = isInitialized && Boolean(loggedInTaikhoan);
  const [tongHopList, setTongHopList] = useState<TongHopBinhChon[]>([]);
  const [loadingTongHop, setLoadingTongHop] = useState(true);
  const [tongHopError, setTongHopError] = useState<string | null>(null);
  const [tongHopReloadKey, setTongHopReloadKey] = useState(0);
  const [selectedTaiKhoan, setSelectedTaiKhoan] = useState<string | null>(null);
  const [selectedRoundId, setSelectedRoundId] = useState(getDefaultRoundId);
  const [ketQuaMap, setKetQuaMap] = useState<Record<string, KetQuaBinhChon>>({});
  const [loadingKetQua, setLoadingKetQua] = useState(false);
  const [ketQuaError, setKetQuaError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const today = startOfDay(new Date());
  const sortedRounds = sortRoundsForTabs(WC_SCHEDULE_ROUNDS, today);

  const selectedRound =
    WC_SCHEDULE_ROUNDS.find((round) => round.id === selectedRoundId) ??
    WC_SCHEDULE_ROUNDS.find((round) => getDaysBeforeToday(round.date, today) === 0) ??
    sortedRounds[0];

  const tinhDiemNgay = selectedRound ? isWcScoringDate(selectedRound.date) : false;
  const canEditVotes = Boolean(
    loggedInTaikhoan &&
      selectedTaiKhoan &&
      selectedTaiKhoan.toLowerCase() === loggedInTaikhoan.toLowerCase(),
  );
  const selectedTaiKhoanHoten =
    tongHopList.find((item) => item.su_taikhoan === selectedTaiKhoan)?.su_hoten?.trim() ||
    selectedTaiKhoan;

  useEffect(() => {
    if (!selectedRound) {
      setTongHopList([]);
      return;
    }

    const roundDate = selectedRound.date;
    let cancelled = false;

    async function loadTongHop() {
      setLoadingTongHop(true);
      setTongHopError(null);

      try {
        const params = new URLSearchParams({ ngay: roundDate });
        const res = await fetch(`/api/tong-hop-binh-chon?${params.toString()}`, {
          cache: 'no-store',
        });
        const body = (await res.json().catch(() => null)) as
          | { data?: TongHopBinhChon[]; message?: string }
          | null;

        if (!res.ok) {
          throw new Error(body?.message || 'Không tải được tổng hợp bình chọn.');
        }

        const data = Array.isArray(body?.data) ? body.data : [];
        if (!cancelled) {
          setTongHopList(data);
          setSelectedTaiKhoan((current) =>
            resolveDefaultTaiKhoan(data, current, loggedInTaikhoan),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setTongHopError(
            err instanceof Error ? err.message : 'Không tải được tổng hợp bình chọn.',
          );
          setTongHopList([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingTongHop(false);
        }
      }
    }

    loadTongHop();
    return () => {
      cancelled = true;
    };
  }, [selectedRound?.date, tongHopReloadKey, loggedInTaikhoan]);

  useEffect(() => {
    if (!selectedTaiKhoan || !selectedRound) {
      setKetQuaMap({});
      return;
    }

    const suTaikhoan = selectedTaiKhoan;
    const roundDate = selectedRound.date;

    let cancelled = false;

    async function loadKetQua() {
      setLoadingKetQua(true);
      setKetQuaError(null);

      try {
        const params = new URLSearchParams({
          su_taikhoan: suTaikhoan,
          ngay: roundDate,
        });
        const res = await fetch(`/api/ket-qua-binh-chon?${params.toString()}`, {
          cache: 'no-store',
        });
        const body = (await res.json().catch(() => null)) as
          | { data?: KetQuaBinhChon[]; message?: string }
          | null;

        if (!res.ok) {
          throw new Error(body?.message || 'Không tải được kết quả bình chọn.');
        }

        const rows = Array.isArray(body?.data) ? body.data : [];
        const nextMap = Object.fromEntries(rows.map((row) => [row.tran_id, row]));

        if (!cancelled) {
          setKetQuaMap(nextMap);
        }
      } catch (err) {
        if (!cancelled) {
          setKetQuaError(
            err instanceof Error ? err.message : 'Không tải được kết quả bình chọn.',
          );
          setKetQuaMap({});
        }
      } finally {
        if (!cancelled) {
          setLoadingKetQua(false);
        }
      }
    }

    loadKetQua();
    return () => {
      cancelled = true;
    };
  }, [selectedTaiKhoan, selectedRound.id, selectedRound.date]);

  function handleSavedVote(vote: KetQuaBinhChon) {
    setKetQuaMap((current) => ({
      ...current,
      [vote.tran_id]: vote,
    }));
    setTongHopReloadKey((key) => key + 1);
  }

  async function handleLogoutClick() {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    try {
      await logout(true);
    } catch {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(320px,400px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
      <aside className="overflow-hidden rounded-sm border border-[#cfd8dc] bg-white xl:max-w-[420px]">
        <div className="border-b border-[#cfd8dc] bg-[#f5f7f9] px-3 py-2">
          <p className="text-xs font-semibold text-[#0088cc]">Tài khoản</p>
          {!tinhDiemNgay ? (
            <p className="mt-1 text-[11px] leading-snug text-[#6b7280]">
              
            </p>
          ) : null}
        </div>

        <nav className="max-h-[calc(100vh-10rem)] overflow-x-auto overflow-y-auto" aria-label="Tài khoản">
          {loadingTongHop ? (
            <p className="px-3 py-3 text-xs text-[#6b7280]">Đang tải danh sách...</p>
          ) : tongHopError ? (
            <p className="px-3 py-3 text-xs text-[#b3261e]">{tongHopError}</p>
          ) : tongHopList.length === 0 ? (
            <p className="px-3 py-3 text-xs text-[#6b7280]">Chưa có tài khoản.</p>
          ) : (
            <table className="w-full table-fixed text-xs">
              <thead>
                <tr className="border-b border-[#cfd8dc] bg-[#f5f7f9] text-left font-semibold text-[#374151]">
                  <th className="w-8 px-1 py-1.5 text-center">STT</th>
                  <th className="px-1 py-1.5">Họ tên</th>
                  <th className="w-11 px-1 py-1.5 text-center">Đúng</th>
                  <th className="w-11 px-1 py-1.5 text-center">Sai</th>
                  <th className="w-11 px-1 py-1.5 text-center">Ko TG</th>
                  <th className="w-[68px] px-1 py-1.5 text-right">Tiền</th>
                </tr>
              </thead>
              <tbody>
                {tongHopList.map((item, index) => {
                  const isSelected = item.su_taikhoan === selectedTaiKhoan;
                  const isLoggedInRow =
                    showLoggedInUser && item.su_taikhoan === loggedInTaikhoan;
                  const displayName = item.su_hoten?.trim() || item.su_taikhoan;

                  return (
                    <tr
                      key={item.su_taikhoan}
                      onClick={() => setSelectedTaiKhoan(item.su_taikhoan)}
                      className={`cursor-pointer border-b border-[#e5e7eb] transition-colors ${
                        isSelected
                          ? 'bg-[#e6f4fb]'
                          : isLoggedInRow
                            ? 'bg-[#f0faf4]'
                            : 'hover:bg-[#f5f7f9]'
                      }`}
                    >
                      <td className="px-1 py-1.5 text-center text-[#6b7280]">{index + 1}</td>
                      <td className="px-1 py-1.5">
                        <span
                          className="block truncate font-medium text-[#111827]"
                          title={displayName}
                        >
                          {displayName}
                        </span>
                      </td>
                      <td className="px-1 py-1.5 text-center font-medium text-[#15803d]">
                        {item.kq_dung}
                      </td>
                      <td className="px-1 py-1.5 text-center font-medium text-[#b3261e]">
                        {item.kq_sai}
                      </td>
                      <td className="px-1 py-1.5 text-center font-medium text-[#6b7280]">
                        {item.khong_tg}
                      </td>
                      <td className="px-1 py-1.5 text-right font-medium text-[#111827]">
                        {formatCurrency(item.so_tien)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </nav>
      </aside>

      <section className="min-w-0 overflow-hidden rounded-sm border border-[#cfd8dc] bg-white">
        <div className="flex items-center justify-between gap-2 bg-[#0088cc] px-3 py-1.5">
          <h2 className="text-base font-semibold leading-tight text-white">{PAGE_TITLE}</h2>
          {showLoggedInUser ? (
            <button
              type="button"
              onClick={() => void handleLogoutClick()}
              disabled={isLoggingOut}
              className="max-w-[min(220px,40vw)] rounded-sm px-1.5 py-0.5 text-right transition-colors hover:bg-white/10 disabled:opacity-70"
              title="Đăng xuất"
            >
              <span className="block truncate text-[11px] font-semibold leading-tight text-white">
                {loggedInHoten}
              </span>
              <span className="block truncate text-[10px] leading-tight text-white/90">
                {isLoggingOut ? 'Đang đăng xuất...' : loggedInTaikhoan}
              </span>
            </button>
          ) : null}
        </div>

        <div className="border-b border-[#cfd8dc] bg-[#f5f7f9] px-4 pt-3">
          <div className="flex gap-1" role="tablist" aria-label="Chọn ngày thi đấu">
            {sortedRounds.map((round) => {
              const isActive = selectedRoundId === round.id;
              const tabLabel = getTabLabel(round.date, today);

              return (
                <button
                  key={round.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`wc-round-${round.id}`}
                  onClick={() => setSelectedRoundId(round.id)}
                  className={`rounded-t-sm px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border border-b-0 border-[#cfd8dc] bg-white text-[#0088cc]'
                      : 'text-[#6b7280] hover:bg-white/70 hover:text-[#0088cc]'
                  }`}
                >
                  {tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-4 md:p-5">
          {loadingKetQua ? (
            <p className="mb-3 text-sm text-[#6b7280]">Đang tải kết quả bình chọn...</p>
          ) : null}
          {ketQuaError ? (
            <p className="mb-3 text-sm text-[#b3261e]">{ketQuaError}</p>
          ) : null}
          {showLoggedInUser && selectedTaiKhoan && !canEditVotes ? (
            <p className="mb-3 rounded-sm border border-[#b8dce8] bg-[#e6f4fb] px-3 py-2 text-sm text-[#374151]">
              Đang xem bình chọn của{' '}
              <span className="font-semibold text-[#0088cc]">{selectedTaiKhoanHoten}</span>. Chỉ
              tài khoản đang đăng nhập (
              <span className="font-semibold text-[#0088cc]">{loggedInHoten}</span>) mới được bình
              chọn.
            </p>
          ) : null}
          <ScheduleRoundContent
            round={selectedRound}
            suTaikhoan={canEditVotes ? loggedInTaikhoan : null}
            ketQuaMap={ketQuaMap}
            onSaved={handleSavedVote}
          />
        </div>
      </section>
    </div>
  );
}
