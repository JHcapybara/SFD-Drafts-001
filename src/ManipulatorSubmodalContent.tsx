import { useState } from 'react';
import type React from 'react';
import { Lock } from 'lucide-react';
import type { ManipRobotItem, PanelData } from './panelData';
import type { AppLabels } from './labels';
import { useLocale } from './localeContext';
import {
  Section,
  InputField,
  Toggle,
  DropdownField,
  CertStatusDropdown,
  TripleInput,
  SubLabel,
  LIGHT,
  DARK,
  type Tokens,
  ManipConnectionLinksContent,
} from './PropertyPanel';
import { SfdChevronAccordion } from './sfd/SfdChevronIcons';
import { accentRgba } from './pointColorSchemes';

type ManipSubTab = 'detail' | 'safety' | 'conn';

function ManipStopPerformanceBlock({
  robot,
  patch,
  t,
  L,
}: {
  robot: ManipRobotItem;
  patch: (p: Partial<ManipRobotItem>) => void;
  t: Tokens;
  L: AppLabels;
}) {
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const locked = robot.responseDelayLocked;
  return (
    <div className="rounded-[12px] overflow-hidden shrink-0" style={{ border: `1px solid ${t.panelBorder}` }}>
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2.5 transition-colors duration-150"
        style={{ background: hovered ? t.sectionHeaderHover : (open ? t.sectionHeaderBg : 'transparent') }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOpen(!open)}
      >
        <div className="w-[8px] h-[8px] rounded-[2px] shrink-0" style={{ background: '#a78bfa' }} />
        <span className="flex-1 text-left text-[12px] leading-none" style={{ color: t.textPrimary, fontWeight: 600, letterSpacing: '-0.01em' }}>{L.stopPerfTitle}</span>
        <SfdChevronAccordion open={open} color={t.textSecondary} size={14} />
      </button>
      {open && <div style={{ height: 1, background: t.divider }} />}
      {open && (
        <div className="flex flex-col gap-2.5 p-3">
          <div className="rounded-[10px] p-3.5" style={{ border: '1px solid rgba(255,142,43,0.42)', background: t.inputBg }}>
            <p className="text-[12px] mb-1.5 font-medium" style={{ color: t.textSecondary }}>{L.stopTsLabel}</p>
            <div className="flex items-baseline gap-1.5">
              <input
                className="min-w-0 flex-1 text-[18px] font-bold leading-none bg-transparent outline-none tabular-nums"
                style={{ color: t.textPrimary }}
                value={robot.stopTsMs}
                onChange={(e) => patch({ stopTsMs: e.target.value })}
              />
              <span className="text-[18px] font-bold shrink-0" style={{ color: t.textPrimary }}>ms</span>
            </div>
            <p className="text-[10px] mt-2.5 leading-relaxed" style={{ color: t.textSecondary }}>{L.stopPerfHint}</p>
          </div>
          <div className="rounded-[10px] p-3.5" style={{ border: `1px solid ${t.inputBorder}`, background: t.inputBg }}>
            <p className="text-[12px] mb-1.5 font-medium" style={{ color: t.textSecondary }}>{L.stopSsLabel}</p>
            <div className="flex items-baseline gap-1.5">
              <input
                className="min-w-0 flex-1 text-[18px] font-bold leading-none bg-transparent outline-none tabular-nums"
                style={{ color: '#ff8e2b' }}
                value={robot.stopSsMm}
                onChange={(e) => patch({ stopSsMm: e.target.value })}
              />
              <span className="text-[18px] font-bold shrink-0" style={{ color: '#ff8e2b' }}>mm</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <span className="text-[13px] shrink-0" style={{ color: t.textSecondary, fontWeight: 500 }}>{L.responseDelayLabel}</span>
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5 min-h-[36px] transition-colors duration-150"
              style={{
                background: locked ? t.inputReadonlyBg : t.tabBarBg,
                border: locked ? `1px dashed ${t.inputReadonlyBorder}` : `1px solid ${t.inputBorder}`,
              }}
            >
              <button
                type="button"
                className="p-0.5 rounded-md transition-opacity"
                style={{ opacity: locked ? 1 : 0.45, color: t.textSecondary }}
                onClick={() => patch({ responseDelayLocked: !locked })}
              >
                <Lock className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <input
                className="w-14 bg-transparent text-right text-[12px] font-semibold outline-none tabular-nums"
                style={{ color: locked ? t.inputReadonlyValue : t.textValue }}
                value={robot.responseDelayMs}
                readOnly={locked}
                onChange={(e) => patch({ responseDelayMs: e.target.value })}
              />
              <span className="text-[11px] font-medium shrink-0" style={{ color: t.textSecondary }}>ms</span>
              <span className="text-[11px] font-semibold shrink-0 pl-1" style={{ color: t.textSecondary }}>{L.measureLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ManipulatorSubmodalContent({
  data,
  setData,
  theme,
  accentColor,
}: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  theme: 'light' | 'dark';
  accentColor: string;
}) {
  const { L } = useLocale();
  const t: Tokens = theme === 'light' ? LIGHT : DARK;
  const [subTab, setSubTab] = useState<ManipSubTab>('detail');
  const robots = data.manipRobots;
  const idx = data.manipSelectedRobotIdx == null || robots.length === 0
    ? -1
    : Math.min(Math.max(0, data.manipSelectedRobotIdx), robots.length - 1);
  const robot = idx >= 0 ? robots[idx] : null;
  const monitorBadgeBg = accentRgba(accentColor, 0.22);
  const monitorBadgeColor = accentColor;

  const patch = (p: Partial<ManipRobotItem>) => {
    if (idx < 0) return;
    setData((pd) => ({
      ...pd,
      manipRobots: pd.manipRobots.map((r, i) => (i === idx ? { ...r, ...p } : r)),
    }));
  };

  const tabBtn = (id: ManipSubTab, label: string) => {
    const on = subTab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => setSubTab(id)}
        className="flex-1 min-w-0 px-2 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all duration-150"
        style={{
          color: on ? accentColor : t.textSecondary,
          background: on ? (theme === 'light' ? `${accentColor}18` : `${accentColor}22`) : 'transparent',
          boxShadow: on ? `inset 0 0 0 1px ${accentRgba(accentColor, 0.35)}` : 'none',
        }}
      >
        {label}
      </button>
    );
  };

  if (!robot) {
    return (
      <p className="text-[11px] leading-relaxed" style={{ color: t.textSecondary }}>
        {L.manipListPanelSubtitle}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-h-0">
      <div className="flex gap-1 p-0.5 rounded-[10px] shrink-0" style={{ background: t.tabBarBg }}>
        {tabBtn('detail', L.manipSubTabDetail)}
        {tabBtn('safety', L.manipSubTabSafety)}
        {tabBtn('conn', L.manipSubTabConn)}
      </div>

      {subTab === 'detail' && (
        <div className="flex flex-col gap-2">
          <Section title={L.manipSpec} accentColor={accentColor} t={t}>
            <InputField label={L.manipObjectName} value={robot.manipObjectName} onChange={(v) => patch({ manipObjectName: v })} t={t} />
            <InputField
              label={L.manipRobotType}
              value={robot.manipRobotType}
              readOnly
              t={t}
              labelInfo
              infoAriaLabel={L.manipRobotTypeSystemHint}
            />
            <InputField label={L.manipMaker} value={robot.manipMaker} onChange={(v) => patch({ manipMaker: v })} t={t} />
            <InputField label={L.manipModel} value={robot.manipModel} onChange={(v) => patch({ manipModel: v })} t={t} />
            <Toggle
              label={L.manipCollaborationToggleLabel}
              value={robot.manipCollaboration}
              onChange={(v) => patch({ manipCollaboration: v })}
              t={t}
            />
            {robot.manipCollaboration && (
              <DropdownField
                label={L.manipCollaborationLabel}
                value={robot.manipCollaborationMode ?? 'PFL'}
                t={t}
                options={[
                  { value: 'PFL', label: 'PFL' },
                  { value: 'SSM', label: 'SSM' },
                  { value: 'SRS', label: 'SRS' },
                  { value: 'HGG', label: 'HGG' },
                ]}
                onChange={(v) => patch({ manipCollaborationMode: v as 'PFL' | 'SSM' | 'SRS' | 'HGG' })}
              />
            )}
          </Section>
          <Section title={L.manipPosition} accentColor={accentColor} t={t}>
            <SubLabel text={L.positionMm} t={t} uppercase={false} />
            <TripleInput
              labels={['X', 'Y', 'Z']}
              values={[robot.position.x, robot.position.y, robot.position.z]}
              onChange={(i, v) => {
                const k = ['x', 'y', 'z'] as const;
                patch({ position: { ...robot.position, [k[i]]: v } });
              }}
              t={t}
            />
            <SubLabel text={L.directionDeg} t={t} uppercase={false} />
            <TripleInput
              labels={['Rx', 'Ry', 'Rz']}
              values={[robot.rotation.rx, robot.rotation.ry, robot.rotation.rz]}
              onChange={(i, v) => {
                const k = ['rx', 'ry', 'rz'] as const;
                patch({ rotation: { ...robot.rotation, [k[i]]: v } });
              }}
              t={t}
            />
          </Section>
          <Section title={L.manipMass} accentColor={accentColor} t={t}>
            <SubLabel text={L.manipPhysRobotSize} t={t} uppercase={false} />
            <TripleInput
              labels={['W', 'D', 'H']}
              values={[robot.size.w, robot.size.d, robot.size.h]}
              onChange={(i, v) => {
                const k = ['w', 'd', 'h'] as const;
                patch({ size: { ...robot.size, [k[i]]: v } });
              }}
              t={t}
            />
            <InputField label={L.manipPhysMaxReach} value={robot.manipReach} onChange={(v) => patch({ manipReach: v })} t={t} />
            <InputField label={L.manipPhysJointCount} value={robot.manipJointCount} onChange={(v) => patch({ manipJointCount: v })} t={t} />
            <InputField label={L.manipPhysRobotMass} value={robot.mass} onChange={(v) => patch({ mass: v })} t={t} />
            <InputField label={L.manipPhysPayload} value={robot.manipPayload} onChange={(v) => patch({ manipPayload: v })} t={t} />
            <InputField label={L.manipPhysCurrentLoad} value={robot.manipCurrentLoadWeight} onChange={(v) => patch({ manipCurrentLoadWeight: v })} t={t} />
            <div style={{ height: 1, background: t.divider }} />
            <Toggle label={L.autoCoM} tooltip={L.autoCoMTooltip} value={robot.autoCoM} onChange={(v) => patch({ autoCoM: v })} t={t} />
            <SubLabel text={L.weightCoMMm} t={t} uppercase={false} />
            <TripleInput
              labels={['Cx', 'Cy', 'Cz']}
              values={[robot.centerOfMass.cx, robot.centerOfMass.cy, robot.centerOfMass.cz]}
              onChange={(i, v) => {
                const k = ['cx', 'cy', 'cz'] as const;
                patch({ centerOfMass: { ...robot.centerOfMass, [k[i]]: v } });
              }}
              t={t}
            />
          </Section>
        </div>
      )}

      {subTab === 'safety' && (
        <div className="flex flex-col gap-2">
          <Section title={L.safetySection} accentColor={accentColor} t={t}>
            <DropdownField
              label={L.safetyPl}
              value={robot.safetyPl}
              t={t}
              options={[
                { value: 'a', label: 'PL a (ISO 13849-1)' },
                { value: 'b', label: 'PL b' },
                { value: 'c', label: 'PL c' },
                { value: 'd', label: 'PL d' },
                { value: 'e', label: 'PL e' },
              ]}
              onChange={(v) => patch({ safetyPl: v })}
            />
            <DropdownField
              label={L.safetyCategory}
              value={robot.safetyCategory}
              t={t}
              options={[
                { value: 'safety_category', label: 'safety_category' },
                { value: 'Cat B', label: 'Cat B' },
                { value: 'Cat 1', label: 'Cat 1' },
                { value: 'Cat 2', label: 'Cat 2' },
                { value: 'Cat 3', label: 'Cat 3' },
                { value: 'Cat 4', label: 'Cat 4' },
              ]}
              onChange={(v) => patch({ safetyCategory: v })}
            />
            <DropdownField
              label={L.safetySil}
              value={robot.safetySil}
              t={t}
              options={[
                { value: 'SIL1', label: 'SIL 1 (IEC 62061)' },
                { value: 'SIL2', label: 'SIL 2' },
                { value: 'SIL3', label: 'SIL 3' },
                { value: 'SIL4', label: 'SIL 4' },
                { value: '-', label: '?' },
              ]}
              onChange={(v) => patch({ safetySil: v })}
            />
            <CertStatusDropdown label={L.safetyCertStatus} value={robot.certStatus} t={t} onChange={(v) => patch({ certStatus: v })} />
          </Section>
          <Section title={L.safetyCertSpecs} accentColor={accentColor} t={t}>
            <InputField label={L.safetyStopTime} value={robot.safetyStopTime} onChange={(v) => patch({ safetyStopTime: v })} t={t} />
            <InputField label={L.safetyTcpLimit} value={robot.safetyTcpLimit} onChange={(v) => patch({ safetyTcpLimit: v })} t={t} />
          </Section>
          <Section title={L.safetyLogicTitle} accentColor={accentColor} t={t}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] shrink-0" style={{ color: t.textSecondary, fontWeight: 500 }}>{L.safetyApplied}</span>
              <button
                type="button"
                className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-opacity"
                style={{
                  background: robot.safetyLogicApplied ? 'rgba(34,197,94,0.22)' : 'rgba(120,120,120,0.18)',
                  color: robot.safetyLogicApplied ? '#22c55e' : t.textSecondary,
                }}
                onClick={() => patch({ safetyLogicApplied: !robot.safetyLogicApplied })}
              >
                {robot.safetyLogicApplied ? L.badgeApplied : L.badgeNotApplied}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] shrink-0" style={{ color: t.textSecondary, fontWeight: 500 }}>{L.safetyMonitor}</span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: monitorBadgeBg, color: monitorBadgeColor }}>{robot.safetyMonitoringStatus}</span>
            </div>
            <DropdownField
              label={L.safetyMonitorPick}
              value={robot.safetyMonitoringStatus}
              t={t}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Standby', label: 'Standby' },
                { value: 'Idle', label: 'Idle' },
                { value: 'Fault', label: 'Fault' },
              ]}
              onChange={(v) => patch({ safetyMonitoringStatus: v })}
            />
            <InputField label={L.safetyLastVerify} value={robot.safetyLastVerified} onChange={(v) => patch({ safetyLastVerified: v })} t={t} />
          </Section>
          <ManipStopPerformanceBlock robot={robot} patch={patch} t={t} L={L} />
        </div>
      )}

      {subTab === 'conn' && (
        <Section title={L.connLinkedList} accentColor={accentColor} t={t}>
          <ManipConnectionLinksContent links={robot.manipConnLinks} L={L} t={t} />
        </Section>
      )}
    </div>
  );
}
