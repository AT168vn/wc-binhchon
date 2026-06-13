'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import {
  WC_SCHEDULE_ROUNDS,
  getDefaultRoundId,
  getTabLabel,
  sortRoundsForTabs,
  startOfDay,
  type WcPollFrame,
  type WcScheduleGroup,
  type WcScheduleRound,
} from '@/config/wc-schedule';
import { WC_LAYOUT } from '@/components/wc-bongda/wc-layout-styles';
import ScheduleImage from '@/components/wc-bongda/ScheduleImage';

const PAGE_TITLE = 'Cập nhật kết quả trận đấu';

type KetQuaThucTe = {
  tran_id: string;
  ket_qua: string;
  ket_qua_ten: string | null;
};

async function saveKetQuaThucTe(payload: {
  ngay_thi_dau: string;
  round_id: string;
  tran_id: string;
  tran_ten: string | null;
  ket_qua: string;
  ket_qua_ten: string | null;
}): Promise<KetQuaThucTe> {
  const res = await fetch('/api/ket-qua-thuc-te', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => null)) as
    | { data?: KetQuaThucTe }
    | { message?: string }
    | null;

  if (!res.ok || !body || !('data' in body) || !body.data) {
    throw new Error(
      body && 'message' in body && body.message
        ? body.message
        : 'Không lưu được kết quả thực tế.',
    );
  }

  return body.data;
}

function ModuleHeader({
  title,
  variant = 'poll',
}: {
  title: string;
  variant?: 'schedule' | 'poll' | 'result';
}) {
  const className =
    variant === 'schedule'
      ? 'border-[#006699] bg-[#0088cc]'
      : variant === 'result'
        ? 'border-[#8b5a2b] bg-[#c55a11]'
        : 'border-[#b8dce8] bg-[#00a8e8]';

  return (
    <div className={`border-b px-3 py-1.5 ${className}`}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

function ResultMatchFrame({
  frame,
  roundDate,
  roundId,
  savedResult,
  onSaved,
}: {
  frame: WcPollFrame;
  roundDate: string;
  roundId: string;
  savedResult?: KetQuaThucTe | null;
  onSaved: (result: KetQuaThucTe) => void;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (savedResult) {
      setSelectedOptionId(savedResult.ket_qua);
      setIsApplied(true);
    } else {
      setSelectedOptionId(null);
      setIsApplied(false);
    }
    setSaveError(null);
  }, [frame.id, savedResult]);

  async function handleApply() {
    if (!selectedOptionId) {
      return;
    }

    const option = frame.options?.find((item) => item.id === selectedOptionId);

    setIsSaving(true);
    setSaveError(null);

    try {
      const saved = await saveKetQuaThucTe({
        ngay_thi_dau: roundDate,
        round_id: roundId,
        tran_id: frame.id,
        tran_ten: frame.title ?? null,
        ket_qua: selectedOptionId,
        ket_qua_ten: option?.label ?? null,
      });
      setIsApplied(true);
      onSaved(saved);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Không lưu được kết quả thực tế.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={WC_LAYOUT.matchFrame}>
      <div className={WC_LAYOUT.matchFrameHeader}>
        <p className="text-xs font-semibold text-[#111827]">{frame.title ?? 'Trận đấu'}</p>
        {isApplied && savedResult?.ket_qua_ten ? (
          <p className="text-[11px] leading-tight text-[#374151]">
            <span className="font-semibold text-[#c55a11]">Đã áp dụng:</span>{' '}
            {savedResult.ket_qua_ten}
          </p>
        ) : (
          <span />
        )}
      </div>

      <div className={WC_LAYOUT.matchFrameBody}>
        {!frame.options?.length ? (
          <div className={WC_LAYOUT.matchFrameBodyMuted}>
            <p className="text-xs text-[#6b7280]">Chưa cấu hình lựa chọn cho trận này</p>
          </div>
        ) : (
          <>
            <div
              className="flex flex-wrap items-center justify-center gap-1 py-0.5"
              role="radiogroup"
              aria-label={frame.title ?? 'Kết quả trận'}
            >
              {frame.options.map((option) => {
                const isSelected = selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSaving}
                    onClick={() => {
                      setSelectedOptionId(option.id);
                      setIsApplied(false);
                    }}
                    className={`min-w-[64px] rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#c55a11] text-white'
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
                disabled={!selectedOptionId || isSaving}
                onClick={() => void handleApply()}
                className="rounded-sm bg-[#c55a11] px-3 py-1 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#a84a0e] disabled:cursor-not-allowed disabled:bg-[#e0c4b0] disabled:text-[#7a5a45] disabled:shadow-none"
              >
                {isSaving ? 'Đang lưu...' : 'Áp dụng'}
              </button>
            </div>

            {saveError ? (
              <p className="mt-1.5 text-center text-[11px] text-[#b3261e]">{saveError}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function ResultSection({
  frames,
  roundDate,
  roundId,
  ketQuaMap,
  onSaved,
}: {
  frames: [WcPollFrame, WcPollFrame];
  roundDate: string;
  roundId: string;
  ketQuaMap: Record<string, KetQuaThucTe>;
  onSaved: (result: KetQuaThucTe) => void;
}) {
  return (
    <>
      <ModuleHeader title="Kết quả trận đấu" variant="result" />
      <div className="px-3 py-1.5">
        <div className={WC_LAYOUT.pollGrid}>
          {frames.map((frame) => (
            <ResultMatchFrame
              key={frame.id}
              frame={frame}
              roundDate={roundDate}
              roundId={roundId}
              savedResult={ketQuaMap[frame.id] ?? null}
              onSaved={onSaved}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function EmptyResultFrameSlot({ title }: { title: string }) {
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
  resultTitles,
}: {
  label: string;
  resultTitles: [string, string];
}) {
  return (
    <article className={WC_LAYOUT.groupArticleEmpty}>
      <ModuleHeader title={label} variant="schedule" />
      <div className={WC_LAYOUT.scheduleImageBox}>
        <p className="text-xs text-[#9ca3af]">Không có trận đấu</p>
      </div>
      <ModuleHeader title="Kết quả trận đấu" variant="result" />
      <div className="px-3 py-1.5">
        <div className={WC_LAYOUT.pollGrid}>
          <EmptyResultFrameSlot title={resultTitles[0]} />
          <EmptyResultFrameSlot title={resultTitles[1]} />
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
  ketQuaMap,
  onSaved,
}: {
  label: string;
  group: WcScheduleGroup;
  roundDate: string;
  roundId: string;
  ketQuaMap: Record<string, KetQuaThucTe>;
  onSaved: (result: KetQuaThucTe) => void;
}) {
  return (
    <article className={WC_LAYOUT.groupArticle}>
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
      <ResultSection
        frames={group.pollFrames}
        roundDate={roundDate}
        roundId={roundId}
        ketQuaMap={ketQuaMap}
        onSaved={onSaved}
      />
    </article>
  );
}

function ScheduleRoundContent({
  round,
  ketQuaMap,
  onSaved,
}: {
  round: WcScheduleRound;
  ketQuaMap: Record<string, KetQuaThucTe>;
  onSaved: (result: KetQuaThucTe) => void;
}) {
  const leftGroup = round.groups[0] ?? null;
  const rightGroup = round.groups[1] ?? null;

  return (
    <div id={`wc-ketqua-round-${round.id}`} className={WC_LAYOUT.roundGrid}>
      {leftGroup ? (
        <ScheduleGroupContent
          label={round.label}
          group={leftGroup}
          roundDate={round.date}
          roundId={round.id}
          ketQuaMap={ketQuaMap}
          onSaved={onSaved}
        />
      ) : (
        <EmptyScheduleGroupPlaceholder label={round.label} resultTitles={['Trận 1', 'Trận 2']} />
      )}
      {rightGroup ? (
        <ScheduleGroupContent
          label={round.label}
          group={rightGroup}
          roundDate={round.date}
          roundId={round.id}
          ketQuaMap={ketQuaMap}
          onSaved={onSaved}
        />
      ) : (
        <EmptyScheduleGroupPlaceholder label={round.label} resultTitles={['Trận 3', 'Trận 4']} />
      )}
    </div>
  );
}

export default function DMKetQuaWC() {
  const { user, logout, isInitialized } = useAuth();
  const loggedInTaikhoan = (user?.username || user?.hsoft_Account || '').trim();
  const loggedInHoten = (user?.displayName || '').trim() || loggedInTaikhoan;
  const showLoggedInUser = isInitialized && Boolean(loggedInTaikhoan);
  const [selectedRoundId, setSelectedRoundId] = useState(getDefaultRoundId);
  const [ketQuaMap, setKetQuaMap] = useState<Record<string, KetQuaThucTe>>({});
  const [loadingKetQua, setLoadingKetQua] = useState(false);
  const [ketQuaError, setKetQuaError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const today = startOfDay(new Date());
  const sortedRounds = sortRoundsForTabs(WC_SCHEDULE_ROUNDS, today);

  const selectedRound =
    WC_SCHEDULE_ROUNDS.find((round) => round.id === selectedRoundId) ?? sortedRounds[0];

  useEffect(() => {
    if (!selectedRound) {
      setKetQuaMap({});
      return;
    }

    let cancelled = false;
    const roundDate = selectedRound.date;

    async function loadKetQua() {
      setLoadingKetQua(true);
      setKetQuaError(null);

      try {
        const params = new URLSearchParams({ ngay: roundDate });
        const res = await fetch(`/api/ket-qua-thuc-te?${params.toString()}`, {
          cache: 'no-store',
        });
        const body = (await res.json().catch(() => null)) as
          | { data?: KetQuaThucTe[]; message?: string }
          | null;

        if (!res.ok) {
          throw new Error(body?.message || 'Không tải được kết quả thực tế.');
        }

        const rows = Array.isArray(body?.data) ? body.data : [];
        const nextMap = Object.fromEntries(rows.map((row) => [row.tran_id, row]));

        if (!cancelled) {
          setKetQuaMap(nextMap);
        }
      } catch (err) {
        if (!cancelled) {
          setKetQuaError(
            err instanceof Error ? err.message : 'Không tải được kết quả thực tế.',
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
  }, [selectedRound.id, selectedRound.date]);

  function handleSavedResult(result: KetQuaThucTe) {
    setKetQuaMap((current) => ({
      ...current,
      [result.tran_id]: result,
    }));
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
    <section className="min-w-0 overflow-hidden rounded-sm border border-[#cfd8dc] bg-white">
      <div className="flex items-center justify-between gap-3 bg-[#0088cc] px-4 py-3">
        <h1 className="text-lg font-semibold text-white">{PAGE_TITLE}</h1>
        {showLoggedInUser ? (
          <button
            type="button"
            onClick={() => void handleLogoutClick()}
            disabled={isLoggingOut}
            className="max-w-[min(240px,40vw)] rounded-sm px-2 py-1 text-right transition-colors hover:bg-white/10 disabled:opacity-70"
            title="Đăng xuất"
          >
            <span className="block truncate text-sm font-semibold text-white">
              {loggedInHoten}
            </span>
            <span className="block truncate text-xs text-white/90">
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
          <p className="mb-3 text-sm text-[#6b7280]">Đang tải kết quả đã lưu...</p>
        ) : null}
        {ketQuaError ? <p className="mb-3 text-sm text-[#b3261e]">{ketQuaError}</p> : null}

        <ScheduleRoundContent
          round={selectedRound}
          ketQuaMap={ketQuaMap}
          onSaved={handleSavedResult}
        />
      </div>
    </section>
  );
}
