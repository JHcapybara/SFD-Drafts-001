import { useEffect, useMemo, useState } from 'react';
import { SfdChevronAccordion } from './sfd/SfdChevronIcons';
import type { MotionSeqItem, MotionTcpPos, MotionTcpRot, PanelData } from './panelData';
import { MOTION_ADD_DEFAULTS, MOTION_JOINT_COUNT, mergeMotionJointAnglesDeg } from './panelData';
import { useLocale } from './localeContext';
import { accentRgba, getObjectAccent } from './pointColorSchemes';
import { Section, InputField, DropdownField, LIGHT, type Tokens } from './PropertyPanel';

type MoveVariant = 'MoveL' | 'MoveJ';
type SpeedBasis = 'time' | 'speed';

type MoveFieldCtx = {
  moveVariant: MoveVariant;
  setMoveVariant: (v: MoveVariant) => void;
  speedBasis: SpeedBasis;
  setSpeedBasis: (v: SpeedBasis) => void;
  timeSec: string;
  setTimeSec: (v: string) => void;
  moveJ_angularSpeedDegSec: string;
  setMoveJ_angularSpeedDegSec: (v: string) => void;
  moveJ_angularAccelDegSec2: string;
  setMoveJ_angularAccelDegSec2: (v: string) => void;
  moveL_linearSpeedMmSec: string;
  setMoveL_linearSpeedMmSec: (v: string) => void;
  moveL_linearAccelMmSec2: string;
  setMoveL_linearAccelMmSec2: (v: string) => void;
};

function patchSeqItem(
  setData: React.Dispatch<React.SetStateAction<PanelData>>,
  id: string,
  patch: Partial<MotionSeqItem>,
) {
  setData((p) => ({
    ...p,
    motionSequenceItems: p.motionSequenceItems.map((it) => (it.id === id ? { ...it, ...patch } : it)),
  }));
}

function mergeMotionTcp(item: MotionSeqItem | null | undefined): { pos: MotionTcpPos; rot: MotionTcpRot } {
  const d = MOTION_ADD_DEFAULTS;
  return {
    pos: {
      x: item?.tcpPos?.x ?? d.motionAddTcpPos.x,
      y: item?.tcpPos?.y ?? d.motionAddTcpPos.y,
      z: item?.tcpPos?.z ?? d.motionAddTcpPos.z,
    },
    rot: {
      rx: item?.tcpRot?.rx ?? d.motionAddTcpRot.rx,
      ry: item?.tcpRot?.ry ?? d.motionAddTcpRot.ry,
      rz: item?.tcpRot?.rz ?? d.motionAddTcpRot.rz,
    },
  };
}

function clampJointDegInt(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(-180, Math.min(180, Math.round(n)));
}

function parseJointDegString(s: string): number {
  return clampJointDegInt(parseFloat(String(s).replace(/,/g, '')));
}

function JointDetailAccordion({
  t,
  angles,
  readOnly,
  onChangeIndex,
  defaultOpen = false,
  openResetKey,
}: {
  t: Tokens;
  angles: string[];
  readOnly: boolean;
  onChangeIndex: (index: number, valueDegStr: string) => void;
  defaultOpen?: boolean;
  openResetKey?: string;
}) {
  const { L } = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const ro = readOnly;

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen, openResetKey]);

  return (
    <div
      className="rounded-[10px] overflow-hidden mt-2"
      style={{
        border: `1px solid ${t.inputBorder}`,
      }}
    >
      <button
        type="button"
        className="w-full flex items-center gap-2 px-2.5 py-2 text-left transition-colors duration-150"
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <SfdChevronAccordion open={open} color={t.textSecondary} size={14} />
        <span className="text-[11px] font-semibold leading-tight" style={{ color: t.textPrimary, letterSpacing: '-0.01em' }}>
          {L.motionJointDetailAccordionTitle}
        </span>
      </button>
      {open && (
        <div
          className="flex flex-col gap-2.5 px-2.5 pb-3 pt-0.5"
          style={{ borderTop: `1px solid ${t.divider}` }}
        >
          {Array.from({ length: MOTION_JOINT_COUNT }, (_, i) => {
            const deg = parseJointDegString(angles[i] ?? '0');
            return (
              <div key={i} className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: t.textSecondary }}>
                    J{i + 1}
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums shrink-0" style={{ color: t.textValue }}>
                    {deg}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={deg}
                  data-readonly={ro ? 'true' : undefined}
                  tabIndex={ro ? -1 : 0}
                  aria-readonly={ro}
                  className={`joint-slider w-full cursor-pointer appearance-none ${ro ? 'pointer-events-none cursor-default' : ''}`}
                  onChange={(e) => {
                    if (ro) return;
                    onChangeIndex(i, String(parseInt(e.target.value, 10)));
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TcpAxisCell({
  label,
  value,
  onChange,
  t,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  t: Tokens;
  readOnly?: boolean;
}) {
  const ro = Boolean(readOnly);
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[9px] font-semibold leading-none tracking-wide" style={{ color: t.textSecondary }}>
        {label}
      </span>
      <input
        type="text"
        readOnly={ro}
        value={value}
        onChange={ro ? undefined : (e) => onChange?.(e.target.value)}
        className="w-full min-w-0 rounded-[6px] px-1.5 py-1.5 text-[12px] font-medium text-right outline-none border transition-colors duration-150"
        style={{
          borderColor: ro ? t.inputReadonlyBorder : t.inputBorder,
          borderStyle: ro ? 'dashed' : 'solid',
          background: ro ? t.inputReadonlyBg : t.inputBg,
          color: ro ? t.inputReadonlyValue : t.textValue,
          cursor: ro ? 'default' : undefined,
        }}
      />
    </div>
  );
}

function MotionTcpPoseGrid({
  t,
  pos,
  rot,
  readOnly,
  onChangePos,
  onChangeRot,
  hideTitle,
}: {
  t: Tokens;
  pos: MotionTcpPos;
  rot: MotionTcpRot;
  readOnly: boolean;
  onChangePos?: (axis: keyof MotionTcpPos, v: string) => void;
  onChangeRot?: (axis: keyof MotionTcpRot, v: string) => void;
  /** true면 상단 「TCP 위치·자세」 제목 생략(바깥 Section 제목과 중복 방지) */
  hideTitle?: boolean;
}) {
  const { L } = useLocale();
  const ro = readOnly;
  return (
    <div className={`flex flex-col gap-2 ${hideTitle ? '' : 'pt-0.5'}`}>
      {!hideTitle && (
        <span className="text-[11px] font-medium px-0.5" style={{ color: t.textSecondary }}>
          {L.motionTcpSectionTitle}
        </span>
      )}
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide px-0.5 mb-1" style={{ color: t.textSecondary }}>
          {L.motionTcpPositionRow}
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <TcpAxisCell
            label={L.motionTcpAxisXmm}
            value={pos.x}
            readOnly={ro}
            t={t}
            onChange={(v) => onChangePos?.('x', v)}
          />
          <TcpAxisCell
            label={L.motionTcpAxisYmm}
            value={pos.y}
            readOnly={ro}
            t={t}
            onChange={(v) => onChangePos?.('y', v)}
          />
          <TcpAxisCell
            label={L.motionTcpAxisZmm}
            value={pos.z}
            readOnly={ro}
            t={t}
            onChange={(v) => onChangePos?.('z', v)}
          />
        </div>
      </div>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide px-0.5 mb-1" style={{ color: t.textSecondary }}>
          {L.motionTcpOrientationRow}
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <TcpAxisCell
            label={L.motionTcpAxisRx}
            value={rot.rx}
            readOnly={ro}
            t={t}
            onChange={(v) => onChangeRot?.('rx', v)}
          />
          <TcpAxisCell
            label={L.motionTcpAxisRy}
            value={rot.ry}
            readOnly={ro}
            t={t}
            onChange={(v) => onChangeRot?.('ry', v)}
          />
          <TcpAxisCell
            label={L.motionTcpAxisRz}
            value={rot.rz}
            readOnly={ro}
            t={t}
            onChange={(v) => onChangeRot?.('rz', v)}
          />
        </div>
      </div>
    </div>
  );
}

function MoveMotionFormFields({
  t,
  d,
  ctx,
  speedBasisOptions,
}: {
  t: Tokens;
  d: typeof MOTION_ADD_DEFAULTS;
  ctx: MoveFieldCtx;
  speedBasisOptions: { value: string; label: string }[];
}) {
  const { L, pointScheme } = useLocale();
  const motionAccent = getObjectAccent('motion', pointScheme);
  const activeText = '#171717';
  const pillBg = 'linear-gradient(180deg, #ffffff 0%, rgba(255,142,43,0.1) 100%)';
  const pillRing = `0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px ${accentRgba(motionAccent, 0.45)}`;
  const { moveVariant, speedBasis } = ctx;
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium px-0.5" style={{ color: t.textSecondary }}>
          {L.motionFunctionLabel}
        </span>
        <div
          className="relative flex w-full rounded-[11px] p-[3px]"
          style={{
            background: 'rgba(0,0,0,0.045)',
            border: `1px solid ${t.inputBorder}`,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
          }}
          role="group"
          aria-label={L.motionFunctionLabel}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute top-[3px] bottom-[3px] rounded-[8px] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              width: 'calc(50% - 3px)',
              left: moveVariant === 'MoveL' ? 3 : 'calc(50% + 0px)',
              background: pillBg,
              boxShadow: pillRing,
            }}
          />
          <button
            type="button"
            className="relative z-[1] flex-1 min-w-0 rounded-[8px] py-2.5 px-2 text-[11px] transition-colors duration-200"
            style={{
              color: moveVariant === 'MoveL' ? activeText : t.textSecondary,
              fontWeight: moveVariant === 'MoveL' ? 700 : 500,
              letterSpacing: moveVariant === 'MoveL' ? '-0.02em' : '-0.01em',
            }}
            onClick={() => ctx.setMoveVariant('MoveL')}
          >
            {L.motionFunctionMoveL}
          </button>
          <button
            type="button"
            className="relative z-[1] flex-1 min-w-0 rounded-[8px] py-2.5 px-2 text-[11px] transition-colors duration-200"
            style={{
              color: moveVariant === 'MoveJ' ? activeText : t.textSecondary,
              fontWeight: moveVariant === 'MoveJ' ? 700 : 500,
              letterSpacing: moveVariant === 'MoveJ' ? '-0.02em' : '-0.01em',
            }}
            onClick={() => ctx.setMoveVariant('MoveJ')}
          >
            {L.motionFunctionMoveJ}
          </button>
        </div>
      </div>

      <DropdownField
        label={L.speedBasisLabel}
        value={speedBasis}
        options={speedBasisOptions}
        onChange={(v) => ctx.setSpeedBasis(v as SpeedBasis)}
        t={t}
      />

      {speedBasis === 'time' && (
        <InputField
          label={L.motionAddTimeSecLabel}
          value={ctx.timeSec}
          onChange={ctx.setTimeSec}
          t={t}
        />
      )}

      {speedBasis === 'speed' && moveVariant === 'MoveJ' && (
        <>
          <InputField
            label={L.motionAddAngularSpeedDeg}
            value={ctx.moveJ_angularSpeedDegSec}
            onChange={ctx.setMoveJ_angularSpeedDegSec}
            t={t}
          />
          <InputField
            label={L.motionAddAngularAccelDeg}
            value={ctx.moveJ_angularAccelDegSec2}
            onChange={ctx.setMoveJ_angularAccelDegSec2}
            t={t}
          />
        </>
      )}

      {speedBasis === 'speed' && moveVariant === 'MoveL' && (
        <>
          <InputField
            label={L.motionAddLinearSpeedMm}
            value={ctx.moveL_linearSpeedMmSec}
            onChange={ctx.setMoveL_linearSpeedMmSec}
            t={t}
          />
          <InputField
            label={L.motionAddLinearAccelMm}
            value={ctx.moveL_linearAccelMmSec2}
            onChange={ctx.setMoveL_linearAccelMmSec2}
            t={t}
          />
        </>
      )}
    </>
  );
}

export function MotionSubmodalContent({
  data,
  setData,
  selectedMotionSeqId = null,
}: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  /** null: 모션 생성 기본값 · id: 해당 행 편집 */
  selectedMotionSeqId?: string | null;
}) {
  const { L, pointScheme } = useLocale();
  const motionAccent = getObjectAccent('motion', pointScheme);
  const t: Tokens = LIGHT;
  const d = MOTION_ADD_DEFAULTS;
  const defaultsMode = selectedMotionSeqId == null;

  const selectedItem = useMemo(
    () => data.motionSequenceItems.find((it) => it.id === selectedMotionSeqId) ?? null,
    [data.motionSequenceItems, selectedMotionSeqId],
  );

  /** 이전 세션 등에서 motion 추가 필드가 빠진 경우 state에 기본값 채움 */
  useEffect(() => {
    if (!defaultsMode) return;
    setData((p) => {
      const patch: Partial<PanelData> = {};
      (Object.keys(MOTION_ADD_DEFAULTS) as (keyof typeof MOTION_ADD_DEFAULTS)[]).forEach((key) => {
        if (p[key] === undefined) Object.assign(patch, { [key]: MOTION_ADD_DEFAULTS[key] });
      });
      if (p.motionAddStopSec === '1,000') {
        patch.motionAddStopSec = MOTION_ADD_DEFAULTS.motionAddStopSec;
      }
      return Object.keys(patch).length ? { ...p, ...patch } : p;
    });
  }, [defaultsMode, setData]);

  const speedBasisOptions = [
    { value: 'time' as const, label: L.speedBasisTime },
    { value: 'speed' as const, label: L.speedBasisSpeed },
  ];

  const panelCtx: MoveFieldCtx = useMemo(
    () => ({
      moveVariant: data.motionAddMoveVariant ?? d.motionAddMoveVariant,
      setMoveVariant: (v) => setData((p) => ({ ...p, motionAddMoveVariant: v })),
      speedBasis: data.motionAddSpeedBasis ?? d.motionAddSpeedBasis,
      setSpeedBasis: (v) => setData((p) => ({ ...p, motionAddSpeedBasis: v })),
      timeSec: data.motionAddTimeSec ?? d.motionAddTimeSec,
      setTimeSec: (v) => setData((p) => ({ ...p, motionAddTimeSec: v })),
      moveJ_angularSpeedDegSec: data.motionAddMoveJ_angularSpeedDegSec ?? d.motionAddMoveJ_angularSpeedDegSec,
      setMoveJ_angularSpeedDegSec: (v) => setData((p) => ({ ...p, motionAddMoveJ_angularSpeedDegSec: v })),
      moveJ_angularAccelDegSec2: data.motionAddMoveJ_angularAccelDegSec2 ?? d.motionAddMoveJ_angularAccelDegSec2,
      setMoveJ_angularAccelDegSec2: (v) => setData((p) => ({ ...p, motionAddMoveJ_angularAccelDegSec2: v })),
      moveL_linearSpeedMmSec: data.motionAddMoveL_linearSpeedMmSec ?? d.motionAddMoveL_linearSpeedMmSec,
      setMoveL_linearSpeedMmSec: (v) => setData((p) => ({ ...p, motionAddMoveL_linearSpeedMmSec: v })),
      moveL_linearAccelMmSec2: data.motionAddMoveL_linearAccelMmSec2 ?? d.motionAddMoveL_linearAccelMmSec2,
      setMoveL_linearAccelMmSec2: (v) => setData((p) => ({ ...p, motionAddMoveL_linearAccelMmSec2: v })),
    }),
    [data, d, setData],
  );

  const itemCtx: MoveFieldCtx | null = useMemo(() => {
    if (!selectedItem || selectedItem.kind !== 'move') return null;
    const it = selectedItem;
    const id = it.id;
    return {
      moveVariant: it.moveVariant ?? d.motionAddMoveVariant,
      setMoveVariant: (v) => patchSeqItem(setData, id, { moveVariant: v }),
      speedBasis: it.moveSpeedBasis ?? d.motionAddSpeedBasis,
      setSpeedBasis: (v) => patchSeqItem(setData, id, { moveSpeedBasis: v }),
      timeSec: it.durationSec ?? d.motionAddTimeSec,
      setTimeSec: (v) => patchSeqItem(setData, id, { durationSec: v }),
      moveJ_angularSpeedDegSec: it.moveJ_angularSpeedDegSec ?? d.motionAddMoveJ_angularSpeedDegSec,
      setMoveJ_angularSpeedDegSec: (v) => patchSeqItem(setData, id, { moveJ_angularSpeedDegSec: v }),
      moveJ_angularAccelDegSec2: it.moveJ_angularAccelDegSec2 ?? d.motionAddMoveJ_angularAccelDegSec2,
      setMoveJ_angularAccelDegSec2: (v) => patchSeqItem(setData, id, { moveJ_angularAccelDegSec2: v }),
      moveL_linearSpeedMmSec: it.moveL_linearSpeedMmSec ?? d.motionAddMoveL_linearSpeedMmSec,
      setMoveL_linearSpeedMmSec: (v) => patchSeqItem(setData, id, { moveL_linearSpeedMmSec: v }),
      moveL_linearAccelMmSec2: it.moveL_linearAccelMmSec2 ?? d.motionAddMoveL_linearAccelMmSec2,
      setMoveL_linearAccelMmSec2: (v) => patchSeqItem(setData, id, { moveL_linearAccelMmSec2: v }),
    };
  }, [selectedItem, d, setData]);

  if (!defaultsMode && !selectedItem) {
    return (
      <p className="text-[11px] leading-relaxed px-0.5" style={{ color: t.textSecondary }}>
        {L.motionSubmodalEditFormPlaceholder}
      </p>
    );
  }

  if (!defaultsMode && selectedItem?.kind === 'stop') {
    const id = selectedItem.id;
    const stopSec = selectedItem.durationSec ?? d.motionAddStopSec;
    const tcp = mergeMotionTcp(selectedItem);
    return (
      <div className="flex flex-col gap-2">
        <Section
          title={L.motionEditStopSectionTitle}
          description={L.motionEditStopSectionHint}
          accentColor={motionAccent}
          t={t}
        >
          <InputField
            label={L.motionAddStopTimeLabel}
            value={stopSec}
            onChange={(v) => patchSeqItem(setData, id, { durationSec: v })}
            t={t}
          />
        </Section>
        <Section
          title={L.motionTcpSectionTitle}
          description={L.motionEditTcpReadonlyHint}
          accentColor={motionAccent}
          t={t}
        >
          <MotionTcpPoseGrid
            t={t}
            pos={tcp.pos}
            rot={tcp.rot}
            readOnly
            hideTitle
          />
          <JointDetailAccordion
            t={t}
            angles={mergeMotionJointAnglesDeg(selectedItem)}
            readOnly
            onChangeIndex={() => {}}
            defaultOpen
            openResetKey={`stop:${id}`}
          />
        </Section>
      </div>
    );
  }

  if (!defaultsMode && selectedItem?.kind === 'move' && itemCtx) {
    const id = selectedItem.id;
    const tcp = mergeMotionTcp(selectedItem);
    return (
      <div className="flex flex-col gap-2">
        <Section
          title={L.motionEditMoveSectionTitle}
          description={L.motionEditMoveSectionHint}
          accentColor={motionAccent}
          t={t}
        >
          <MoveMotionFormFields t={t} d={d} ctx={itemCtx} speedBasisOptions={speedBasisOptions} />
        </Section>
        <Section
          title={L.motionTcpSectionTitle}
          description={L.motionEditTcpSectionHint}
          accentColor={motionAccent}
          t={t}
        >
          <MotionTcpPoseGrid
            t={t}
            pos={tcp.pos}
            rot={tcp.rot}
            readOnly={false}
            hideTitle
            onChangePos={(axis, v) => {
              const m = mergeMotionTcp(selectedItem);
              patchSeqItem(setData, id, { tcpPos: { ...m.pos, [axis]: v } });
            }}
            onChangeRot={(axis, v) => {
              const m = mergeMotionTcp(selectedItem);
              patchSeqItem(setData, id, { tcpRot: { ...m.rot, [axis]: v } });
            }}
          />
          <JointDetailAccordion
            t={t}
            angles={mergeMotionJointAnglesDeg(selectedItem)}
            readOnly={false}
            onChangeIndex={(i, v) => {
              const next = [...mergeMotionJointAnglesDeg(selectedItem)];
              next[i] = v;
              patchSeqItem(setData, id, { jointAnglesDeg: next });
            }}
            defaultOpen
            openResetKey={`move:${id}`}
          />
        </Section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] leading-relaxed px-0.5 -mt-0.5 mb-0.5" style={{ color: t.textSecondary }}>
        {L.motionSubmodalDefaultsIntro}
      </p>
      <Section
        title={L.motionAddMoveSectionTitle}
        description={L.motionAddMoveSectionHint}
        accentColor={motionAccent}
        defaultOpen={false}
        t={t}
      >
        <MoveMotionFormFields t={t} d={d} ctx={panelCtx} speedBasisOptions={speedBasisOptions} />
      </Section>

      <Section
        title={L.motionAddTcpSectionTitle}
        description={L.motionAddTcpSectionHint}
        accentColor={motionAccent}
        defaultOpen={false}
        t={t}
      >
        <MotionTcpPoseGrid
          t={t}
          pos={data.motionAddTcpPos ?? d.motionAddTcpPos}
          rot={data.motionAddTcpRot ?? d.motionAddTcpRot}
          readOnly={false}
          hideTitle
          onChangePos={(axis, v) =>
            setData((p) => ({
              ...p,
              motionAddTcpPos: { ...(p.motionAddTcpPos ?? MOTION_ADD_DEFAULTS.motionAddTcpPos), [axis]: v },
            }))
          }
          onChangeRot={(axis, v) =>
            setData((p) => ({
              ...p,
              motionAddTcpRot: { ...(p.motionAddTcpRot ?? MOTION_ADD_DEFAULTS.motionAddTcpRot), [axis]: v },
            }))
          }
        />
        <JointDetailAccordion
          t={t}
          angles={
            data.motionAddJointAnglesDeg?.length === MOTION_JOINT_COUNT
              ? data.motionAddJointAnglesDeg
              : MOTION_ADD_DEFAULTS.motionAddJointAnglesDeg
          }
          readOnly={false}
          onChangeIndex={(i, v) =>
            setData((p) => {
              const base = p.motionAddJointAnglesDeg?.length === MOTION_JOINT_COUNT
                ? [...p.motionAddJointAnglesDeg]
                : [...MOTION_ADD_DEFAULTS.motionAddJointAnglesDeg];
              base[i] = v;
              return { ...p, motionAddJointAnglesDeg: base };
            })
          }
          defaultOpen={false}
          openResetKey="defaults"
        />
      </Section>

      <Section
        title={L.motionAddStopSectionTitle}
        description={L.motionAddStopSectionHint}
        accentColor={motionAccent}
        defaultOpen={false}
        t={t}
      >
        <InputField
          label={L.motionAddStopTimeLabel}
          value={data.motionAddStopSec ?? d.motionAddStopSec}
          onChange={(v) => setData((p) => ({ ...p, motionAddStopSec: v }))}
          t={t}
        />
      </Section>
    </div>
  );
}
