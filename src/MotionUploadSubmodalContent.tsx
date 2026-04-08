import type { MotionUploadWaypoint, PanelData } from './panelData';
import { MOTION_ADD_DEFAULTS } from './panelData';
import {
  formatUploadDurationSecDisplay,
  parseUploadTimecodeToSeconds,
  sumMotionUploadGroupDurationSec,
} from './panelData';
import { useLocale } from './localeContext';
import { MotionUploadSection, LIGHT, type Tokens } from './PropertyPanel';

const t: Tokens = LIGHT;
const d = MOTION_ADD_DEFAULTS;

/** `${groupId}:file` | `${groupId}:${waypointId}` */
export function parseMotionUploadSelectionKey(key: string | null):
  | { kind: 'file'; groupId: string }
  | { kind: 'waypoint'; groupId: string; waypointId: string }
  | null {
  if (!key) return null;
  const i = key.indexOf(':');
  if (i < 0) return null;
  const groupId = key.slice(0, i);
  const rest = key.slice(i + 1);
  if (rest === 'file') return { kind: 'file', groupId };
  if (!rest) return null;
  return { kind: 'waypoint', groupId, waypointId: rest };
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 rounded-[8px] min-h-[34px]"
      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, opacity: 0.92 }}
    >
      <span className="text-[13px] shrink-0 leading-none" style={{ color: t.textSecondary, fontWeight: 500 }}>
        {label}
      </span>
      <span className="flex-1 min-w-0 text-[12px] text-right font-medium truncate" style={{ color: t.textValue }}>
        {value}
      </span>
    </div>
  );
}

type MoveVariant = 'MoveL' | 'MoveJ';
type SpeedBasis = 'time' | 'speed';

/** `MotionSubmodalContent`의 MoveMotionFormFields와 동일 레이아웃 · 조회 전용 */
function ReadonlyMoveMotionFields({
  moveVariant,
  speedBasis,
  timeSec,
  moveJ_angularSpeedDegSec,
  moveJ_angularAccelDegSec2,
  moveL_linearSpeedMmSec,
  moveL_linearAccelMmSec2,
}: {
  moveVariant: MoveVariant;
  speedBasis: SpeedBasis;
  timeSec: string;
  moveJ_angularSpeedDegSec: string;
  moveJ_angularAccelDegSec2: string;
  moveL_linearSpeedMmSec: string;
  moveL_linearAccelMmSec2: string;
}) {
  const { L } = useLocale();
  return (
    <div
      className="flex flex-col gap-2 pointer-events-none select-none"
      role="group"
      aria-label={`${L.motionFunctionLabel} · ${L.motionUploadSubmodalBadgeReadonly}`}
    >
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
              background: 'linear-gradient(180deg, #ffffff 0%, rgba(236,253,245,0.95) 100%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(52,211,153,0.45)',
            }}
          />
          <div
            className="relative z-[1] flex-1 min-w-0 rounded-[8px] py-2.5 px-2 text-[11px] text-center"
            style={{
              color: moveVariant === 'MoveL' ? '#047857' : t.textSecondary,
              fontWeight: moveVariant === 'MoveL' ? 700 : 500,
              letterSpacing: moveVariant === 'MoveL' ? '-0.02em' : '-0.01em',
            }}
          >
            {L.motionFunctionMoveL}
          </div>
          <div
            className="relative z-[1] flex-1 min-w-0 rounded-[8px] py-2.5 px-2 text-[11px] text-center"
            style={{
              color: moveVariant === 'MoveJ' ? '#047857' : t.textSecondary,
              fontWeight: moveVariant === 'MoveJ' ? 700 : 500,
              letterSpacing: moveVariant === 'MoveJ' ? '-0.02em' : '-0.01em',
            }}
          >
            {L.motionFunctionMoveJ}
          </div>
        </div>
      </div>

      <ReadonlyRow
        label={L.speedBasisLabel}
        value={speedBasis === 'time' ? L.speedBasisTime : L.speedBasisSpeed}
      />

      {speedBasis === 'time' && (
        <ReadonlyRow label={L.motionAddTimeSecLabel} value={timeSec} />
      )}

      {speedBasis === 'speed' && moveVariant === 'MoveJ' && (
        <>
          <ReadonlyRow label={L.motionAddAngularSpeedDeg} value={moveJ_angularSpeedDegSec} />
          <ReadonlyRow label={L.motionAddAngularAccelDeg} value={moveJ_angularAccelDegSec2} />
        </>
      )}

      {speedBasis === 'speed' && moveVariant === 'MoveL' && (
        <>
          <ReadonlyRow label={L.motionAddLinearSpeedMm} value={moveL_linearSpeedMmSec} />
          <ReadonlyRow label={L.motionAddLinearAccelMm} value={moveL_linearAccelMmSec2} />
        </>
      )}
    </div>
  );
}

function resolveWaypointReadonly(wp: MotionUploadWaypoint) {
  const moveVariant = (wp.moveVariant ?? d.motionAddMoveVariant) as MoveVariant;
  const speedBasis = (wp.moveSpeedBasis ?? d.motionAddSpeedBasis) as SpeedBasis;
  const tcSec = parseUploadTimecodeToSeconds(wp.timecode);
  const timeSec = formatUploadDurationSecDisplay(tcSec);
  const dash = '—';
  return {
    moveVariant,
    speedBasis,
    timeSec,
    moveJ_angularSpeedDegSec: wp.moveJ_angularSpeedDegSec ?? dash,
    moveJ_angularAccelDegSec2: wp.moveJ_angularAccelDegSec2 ?? dash,
    moveL_linearSpeedMmSec: wp.moveL_linearSpeedMmSec ?? dash,
    moveL_linearAccelMmSec2: wp.moveL_linearAccelMmSec2 ?? dash,
  };
}

export function MotionUploadSubmodalContent({
  data,
  setData,
  selectedUploadKey,
}: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  selectedUploadKey: string | null;
}) {
  const { L } = useLocale();
  const parsed = parseMotionUploadSelectionKey(selectedUploadKey);

  if (!parsed) {
    return <MotionUploadSection data={data} setData={setData} t={t} />;
  }

  const group = data.motionUploadFileGroups.find((g) => g.id === parsed.groupId);
  if (!group) {
    return <p className="text-[11px] leading-[18px] px-0.5" style={{ color: t.textSecondary }}>{L.motionSubmodalEditFormPlaceholder}</p>;
  }

  if (parsed.kind === 'file') {
    const totalSec = sumMotionUploadGroupDurationSec(group);
    return (
      <div className="flex flex-col gap-2">
        <ReadonlyRow label={L.motionUploadReadonlyFileLabel} value={group.fileName} />
        <ReadonlyRow
          label={L.motionUploadReadonlyMotionDurationLabel}
          value={`${formatUploadDurationSecDisplay(totalSec)} s`}
        />
      </div>
    );
  }

  const wp = group.waypoints.find((w) => w.id === parsed.waypointId);
  if (!wp) {
    return <p className="text-[11px] leading-[18px] px-0.5" style={{ color: t.textSecondary }}>{L.motionSubmodalEditFormPlaceholder}</p>;
  }

  const ro = resolveWaypointReadonly(wp);
  return (
    <ReadonlyMoveMotionFields
      moveVariant={ro.moveVariant}
      speedBasis={ro.speedBasis}
      timeSec={ro.timeSec}
      moveJ_angularSpeedDegSec={ro.moveJ_angularSpeedDegSec}
      moveJ_angularAccelDegSec2={ro.moveJ_angularAccelDegSec2}
      moveL_linearSpeedMmSec={ro.moveL_linearSpeedMmSec}
      moveL_linearAccelMmSec2={ro.moveL_linearAccelMmSec2}
    />
  );
}
