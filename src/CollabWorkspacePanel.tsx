import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, Hand, Minus, Plus, Share2, X } from 'lucide-react';
import type { AppLocale } from './types';
import type { AppLabels } from './labels';
import type { CollabWorkspaceItem, PanelData } from './panelData';
import { COLLAB_ROBOT_NAMES, createCollabWorkspaceFromDefaults } from './panelData';
import { PrimaryCtaButton, Toggle, type Tokens } from './PropertyPanel';
import { CollabBodyPartPicker, DoubleMmRow, SubHeading } from './collabPanelShared';

/** 할당·미할당 리스트: 항목이 이 개수 이상이면 동일 높이 상한에서 세로 스크롤 */
const COLLAB_LIST_SCROLL_AT = 4;

function collabWorkspaceListClass(pt: 'pt-0' | 'pt-1', count: number): string {
  const base = `flex flex-col gap-1 px-2 pb-2 ${pt}`;
  return count >= COLLAB_LIST_SCROLL_AT
    ? `${base} min-h-0 max-h-[140px] overflow-y-auto sfd-scroll`
    : base;
}

function patchWs(list: PanelData['collabWorkspaces'], id: string, patch: Partial<PanelData['collabWorkspaces'][number]>) {
  return list.map((w) => (w.id === id ? { ...w, ...patch } : w));
}

const ROBOT_INFINITE_CHUNK = 8;

function CollabSharedRobotsCard({
  ws,
  t,
  L,
  onToggleRobot,
  onToggleAll,
}: {
  ws: CollabWorkspaceItem;
  t: Tokens;
  L: AppLabels;
  onToggleRobot: (name: string) => void;
  onToggleAll: () => void;
}) {
  const total = COLLAB_ROBOT_NAMES.length;
  const [renderCount, setRenderCount] = useState(() => Math.min(ROBOT_INFINITE_CHUNK, total));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRenderCount(Math.min(ROBOT_INFINITE_CHUNK, total));
  }, [ws.id, total]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || renderCount >= total) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (nearBottom) {
      setRenderCount((c) => Math.min(total, c + ROBOT_INFINITE_CHUNK));
    }
  }, [renderCount, total]);

  const visibleNames = COLLAB_ROBOT_NAMES.slice(0, renderCount);
  const allSelected =
    COLLAB_ROBOT_NAMES.length > 0 && COLLAB_ROBOT_NAMES.every((n) => ws.sharedRobotIds.includes(n));

  return (
    <div
      className="rounded-[10px] mt-1 flex h-[196px] flex-col shrink-0 border"
      style={{ borderColor: t.inputBorder }}
    >
      <div className="shrink-0 px-2.5 py-1.5 text-[11px] font-semibold" style={{ color: t.textSecondary, background: t.sectionHeaderBg }}>
        {L.collabSharedRobotsSection}
      </div>
      <div className="shrink-0 flex items-center gap-2 px-2 py-1.5 border-b" style={{ borderColor: t.divider }}>
        <input
          type="checkbox"
          className="accent-[#ff8e2b] rounded border"
          checked={allSelected}
          onChange={onToggleAll}
        />
        <span className="text-[11px] font-medium" style={{ color: t.textPrimary }}>
          {L.collabRobotNameCol}
        </span>
        <span className="text-[10px] ml-auto" style={{ color: t.textSecondary }}>
          {L.collabSelectAllRobots}
        </span>
      </div>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto sfd-scroll overscroll-contain"
      >
        {visibleNames.map((name) => (
          <label
            key={name}
            className="flex items-center gap-2 px-2 py-1.5 border-b cursor-pointer"
            style={{ borderColor: t.divider }}
          >
            <input
              type="checkbox"
              className="accent-[#ff8e2b]"
              checked={ws.sharedRobotIds.includes(name)}
              onChange={() => onToggleRobot(name)}
            />
            <span className="text-[12px]" style={{ color: t.textPrimary }}>
              {name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function CollabWorkspaceEditSection({
  data,
  setData,
  t,
  L,
  locale,
  objectAccent,
  theme,
}: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
  L: AppLabels;
  locale: AppLocale;
  objectAccent: string;
  theme: 'light' | 'dark';
}) {
  const [colorId, setColorId] = useState<string | null>(null);
  const ws = data.collabEditingWorkspaceId
    ? data.collabWorkspaces.find((w) => w.id === data.collabEditingWorkspaceId)
    : null;
  const colorTarget = colorId ? data.collabWorkspaces.find((w) => w.id === colorId) : null;

  const toggleRobotFor = useCallback(
    (wsId: string, robotName: string) => {
      setData((p) => ({
        ...p,
        collabWorkspaces: patchWs(p.collabWorkspaces, wsId, {
          sharedRobotIds: (() => {
            const w = p.collabWorkspaces.find((x) => x.id === wsId);
            if (!w) return [];
            const has = w.sharedRobotIds.includes(robotName);
            return has ? w.sharedRobotIds.filter((x) => x !== robotName) : [...w.sharedRobotIds, robotName];
          })(),
        }),
      }));
    },
    [setData],
  );

  const toggleAllRobots = useCallback((wsId: string) => {
    setData((p) => {
      const w = p.collabWorkspaces.find((x) => x.id === wsId);
      if (!w) return p;
      const allOn = COLLAB_ROBOT_NAMES.every((name) => w.sharedRobotIds.includes(name));
      let nextIds = [...w.sharedRobotIds];
      if (allOn) {
        COLLAB_ROBOT_NAMES.forEach((name) => {
          nextIds = nextIds.filter((x) => x !== name);
        });
      } else {
        COLLAB_ROBOT_NAMES.forEach((name) => {
          if (!nextIds.includes(name)) nextIds.push(name);
        });
      }
      return { ...p, collabWorkspaces: patchWs(p.collabWorkspaces, wsId, { sharedRobotIds: nextIds }) };
    });
  }, [setData]);

  if (!ws) return null;

  return (
    <div
      className="rounded-[12px] shrink-0 flex flex-col gap-2 p-2.5"
      style={{
        border: `1px solid ${t.inputBorder}`,
        background: theme === 'light' ? 'rgba(252,252,253,0.96)' : t.panelBg,
      }}
    >
      <div className="flex items-start gap-2">
        <Hand className="w-5 h-5 shrink-0 mt-0.5" style={{ color: t.textPrimary }} />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold truncate" style={{ color: t.textPrimary }}>
            {ws.name}
          </p>
        </div>
        <button
          type="button"
          className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
          style={{ background: t.closeButtonBg, color: t.textSecondary }}
          aria-label={L.collabOpenColorPickerAria}
          title={L.collabColorModalTitle}
          onClick={() => setColorId(ws.id)}
        >
          <div
            className="w-6 h-2 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${ws.colorHex} 0%, ${ws.colorHex}88 50%, #fff 100%)`,
              border: `1px solid ${t.inputBorder}`,
            }}
          />
        </button>
        <button
          type="button"
          className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
          style={{ background: t.closeButtonBg, color: t.textSecondary }}
          aria-label={L.collabEditModalCloseAria}
          onClick={() => setData((p) => ({ ...p, collabEditingWorkspaceId: null }))}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <SubHeading text={L.collabPositionSection} t={t} />
      <DoubleMmRow
        labels={['X', 'Y']}
        values={[ws.posX, ws.posY]}
        onChange={(i, v) =>
          setData((p) => ({
            ...p,
            collabWorkspaces: patchWs(p.collabWorkspaces, ws.id, i === 0 ? { posX: v } : { posY: v }),
          }))
        }
        t={t}
        unitLabel={L.collabMmUnit}
      />
      <SubHeading text={L.collabSizeSection} t={t} />
      <DoubleMmRow
        labels={['W', 'H']}
        values={[ws.widthMm, ws.heightMm]}
        onChange={(i, v) =>
          setData((p) => ({
            ...p,
            collabWorkspaces: patchWs(p.collabWorkspaces, ws.id, i === 0 ? { widthMm: v } : { heightMm: v }),
          }))
        }
        t={t}
        unitLabel={L.collabMmUnit}
      />
      <div className="pt-1" />
      <CollabBodyPartPicker
        value={ws.bodyPartId}
        onChange={(id) =>
          setData((p) => ({
            ...p,
            collabWorkspaces: patchWs(p.collabWorkspaces, ws.id, { bodyPartId: id }),
          }))
        }
        t={t}
        theme={theme}
        locale={locale}
        bodyPartTitle={L.collabBodyPartSection}
      />
      <Toggle
        label={L.collabClothingThickness}
        tooltip={L.collabInfoTooltipClothing}
        value={ws.clothingThickness}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            collabWorkspaces: patchWs(p.collabWorkspaces, ws.id, { clothingThickness: v }),
          }))
        }
        t={t}
      />
      <Toggle
        label={L.collabWorkerDirection}
        tooltip={L.collabInfoTooltipWorkerDir}
        value={ws.workerDirection}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            collabWorkspaces: patchWs(p.collabWorkspaces, ws.id, { workerDirection: v }),
          }))
        }
        t={t}
      />

      <CollabSharedRobotsCard
        key={ws.id}
        ws={ws}
        t={t}
        L={L}
        onToggleRobot={(name) => toggleRobotFor(ws.id, name)}
        onToggleAll={() => toggleAllRobots(ws.id)}
      />

      {colorTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-[210] flex items-center justify-center p-3"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setColorId(null)}
            role="presentation"
          >
            <div
              className="w-full max-w-[300px] rounded-[14px] p-3 flex flex-col gap-3"
              style={{ background: t.panelBg, border: `1px solid ${t.panelBorder}`, boxShadow: t.panelShadow }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold" style={{ color: t.textPrimary }}>
                  {L.collabColorModalTitle}
                </span>
                <button
                  type="button"
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ background: t.closeButtonBg, color: t.textSecondary }}
                  aria-label={L.collabColorModalCloseAria}
                  onClick={() => setColorId(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] shrink-0" style={{ color: t.textSecondary }}>
                  {L.collabColorChange}
                </span>
                <div
                  className="w-8 h-8 rounded-[8px] border shrink-0"
                  style={{ background: colorTarget.colorHex, borderColor: t.inputBorder }}
                />
              </div>
              <div className="grid grid-cols-10 gap-1.5">
                {[
                  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
                  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c', '#64748b', '#1e293b', '#ffffff', '#000000', '#f59e0b',
                ].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    className="aspect-square rounded-[4px] border transition-transform active:scale-95"
                    style={{
                      background: hex,
                      borderColor: colorTarget.colorHex === hex ? objectAccent : t.inputBorder,
                      boxShadow: colorTarget.colorHex === hex ? `0 0 0 1px ${objectAccent}` : 'none',
                    }}
                    onClick={() =>
                      setData((p) => ({
                        ...p,
                        collabWorkspaces: patchWs(p.collabWorkspaces, colorTarget.id, { colorHex: hex }),
                      }))
                    }
                  />
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: t.textSecondary }}>
                    {L.collabOpacityLabel}
                  </span>
                  <span
                    className="text-[11px] font-mono px-2 py-0.5 rounded-[6px]"
                    style={{ background: t.inputBg, color: t.textPrimary }}
                  >
                    {colorTarget.opacityPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={colorTarget.opacityPercent}
                  className="w-full accent-[#ff8e2b] h-2"
                  onChange={(e) =>
                    setData((p) => ({
                      ...p,
                      collabWorkspaces: patchWs(p.collabWorkspaces, colorTarget.id, {
                        opacityPercent: Number(e.target.value),
                      }),
                    }))
                  }
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function CollabWorkspacePanel({
  data,
  setData,
  t,
  L,
  locale,
  objectAccent,
  theme,
}: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
  L: AppLabels;
  locale: AppLocale;
  objectAccent: string;
  theme: 'light' | 'dark';
}) {
  const [showAssignFromExisting, setShowAssignFromExisting] = useState(false);

  const assignedSet = useMemo(() => new Set(data.collabAssignedWorkspaceIds), [data.collabAssignedWorkspaceIds]);
  const assignedList = useMemo(
    () => data.collabWorkspaces.filter((w) => assignedSet.has(w.id)),
    [data.collabWorkspaces, assignedSet],
  );
  const unassignedList = useMemo(
    () => data.collabWorkspaces.filter((w) => !assignedSet.has(w.id)),
    [data.collabWorkspaces, assignedSet],
  );

  const onCreate = useCallback(() => {
    setData((p) => {
      const nextIdx = p.collabWorkspaces.length + 1;
      const name = locale === 'en' ? `Workspace ${nextIdx}` : `협동작업공간${nextIdx}`;
      const item = createCollabWorkspaceFromDefaults(p, `cw-${Date.now()}`, name);
      return {
        ...p,
        collabWorkspaces: [...p.collabWorkspaces, item],
        collabSelectedWorkspaceId: item.id,
      };
    });
  }, [locale, setData]);

  const toggleAssign = useCallback(
    (id: string, assign: boolean) => {
      setData((p) => {
        const next = assign
          ? [...new Set([...p.collabAssignedWorkspaceIds, id])]
          : p.collabAssignedWorkspaceIds.filter((x) => x !== id);
        return { ...p, collabAssignedWorkspaceIds: next, collabSelectedWorkspaceId: id };
      });
    },
    [setData],
  );

  const assignActionBtn =
    'linear-gradient(135deg,#ff9a3c 0%,#ff6b00 100%)' as const;

  const linkedItemsText = useCallback((w: CollabWorkspaceItem) => {
    if (w.sharedRobotIds.length === 0) return L.collabLinkedToItemsEmpty;
    return w.sharedRobotIds.join(', ');
  }, [L.collabLinkedToItemsEmpty]);

  return (
    <div className="flex flex-col gap-3 min-h-0">
      <div
        className="rounded-[12px] overflow-hidden shrink-0 flex flex-col"
        style={{ border: `1px solid ${t.inputBorder}` }}
      >
        <div className="px-2.5 pt-2.5 pb-2" style={{ background: t.sectionHeaderBg }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Share2 className="w-3.5 h-3.5 shrink-0" style={{ color: objectAccent }} strokeWidth={2.2} />
            <span className="text-[11px] font-semibold leading-tight" style={{ color: t.textSecondary }}>
              {L.collabSharedListTitle}
            </span>
          </div>
          <p className="text-[10px] leading-snug pl-0.5" style={{ color: t.textSecondary }}>
            {L.collabAssignedSectionHint}
          </p>
        </div>
        <div className={collabWorkspaceListClass('pt-1', assignedList.length)}>
          {assignedList.length === 0 ? (
            <p className="text-[11px] px-1 py-1.5" style={{ color: t.textSecondary }}>
              —
            </p>
          ) : (
            assignedList.map((w) => {
              const selected = data.collabSelectedWorkspaceId === w.id;
              return (
                <div
                  key={w.id}
                  className="flex items-center gap-1.5 rounded-[8px] px-1.5 py-1.5"
                  style={{
                    border: selected ? `1px solid ${objectAccent}` : `1px solid transparent`,
                    background: selected ? (theme === 'light' ? 'rgba(255,142,43,0.08)' : 'rgba(255,142,43,0.12)') : 'transparent',
                  }}
                >
                  <button
                    type="button"
                    className="w-7 h-7 shrink-0 rounded-[6px] flex items-center justify-center text-white transition-shadow"
                    style={{ background: assignActionBtn, boxShadow: '0 2px 8px rgba(255,107,0,0.35)' }}
                    aria-label={L.collabUnassignAria}
                    onClick={() => toggleAssign(w.id, false)}
                  >
                    <Minus className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <Hand className="w-4 h-4 shrink-0" style={{ color: t.textPrimary }} strokeWidth={2} />
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left text-[12px] font-medium truncate"
                    style={{ color: t.textPrimary }}
                    onClick={() => {
                      setData((p) => ({
                        ...p,
                        collabSelectedWorkspaceId: w.id,
                        collabEditingWorkspaceId: w.id,
                      }));
                    }}
                  >
                    {w.name}
                  </button>
                  <button
                    type="button"
                    className="p-1 rounded-[6px] shrink-0"
                    style={{ color: t.textSecondary }}
                    aria-label={L.collabVisibilityAria}
                    onClick={() =>
                      setData((p) => ({
                        ...p,
                        collabWorkspaces: patchWs(p.collabWorkspaces, w.id, { visible: !w.visible }),
                      }))
                    }
                  >
                    {w.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {showAssignFromExisting && (
          <>
            <div style={{ height: 1, background: t.divider }} />
            <div className="px-2.5 pt-2 pb-2.5" style={{ background: t.sectionHeaderBg }}>
              <span className="text-[11px] font-semibold block mb-1" style={{ color: t.textSecondary }}>
                {L.collabExistingAssignListTitle}
              </span>
              <p className="text-[10px] leading-snug pl-0.5" style={{ color: t.textSecondary }}>
                {L.collabLibrarySectionHint}
              </p>
            </div>
            <div className={collabWorkspaceListClass('pt-0', unassignedList.length)}>
              {unassignedList.map((w) => (
                <div key={w.id} className="flex items-start gap-1.5 rounded-[8px] px-1.5 py-1.5">
                  <button
                    type="button"
                    className="w-7 h-7 mt-0.5 shrink-0 rounded-[6px] flex items-center justify-center text-white transition-shadow"
                    style={{ background: assignActionBtn, boxShadow: '0 2px 8px rgba(255,107,0,0.35)' }}
                    aria-label={L.collabAssignAria}
                    onClick={() => toggleAssign(w.id, true)}
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <Hand className="w-4 h-4 shrink-0 mt-1" style={{ color: t.textPrimary }} strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      className="w-full min-w-0 text-left text-[12px] font-medium truncate"
                      style={{ color: t.textPrimary }}
                      onClick={() => {
                        setData((p) => ({
                          ...p,
                          collabSelectedWorkspaceId: w.id,
                          collabEditingWorkspaceId: w.id,
                        }));
                      }}
                    >
                      {w.name}
                    </button>
                    <p className="text-[10px] mt-0.5 leading-snug truncate" style={{ color: t.textSecondary }}>
                      <span style={{ fontWeight: 600 }}>{L.collabLinkedToItemsLabel}</span>{' '}
                      {linkedItemsText(w)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <PrimaryCtaButton t={t} onClick={onCreate}>{L.collabCreateBtn}</PrimaryCtaButton>
        <button
          type="button"
          className="h-[38px] px-3 rounded-[10px] text-[12px] font-semibold shrink-0 transition-all duration-150"
          style={{
            color: objectAccent,
            background: theme === 'light' ? 'rgba(255,142,43,0.10)' : 'rgba(255,142,43,0.18)',
            border: `1px solid ${theme === 'light' ? 'rgba(255,142,43,0.35)' : 'rgba(255,142,43,0.30)'}`,
          }}
          onClick={() => setShowAssignFromExisting((v) => !v)}
        >
          {showAssignFromExisting ? L.collabAssignFromExistingHideBtn : L.collabAssignFromExistingBtn}
        </button>
      </div>
    </div>
  );
}
