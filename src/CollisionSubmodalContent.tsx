import type { Dispatch, SetStateAction } from 'react';
import type { CollisionCategoryId, CollisionPrimitive, CollisionShapeSettings, PanelData } from './panelData';
import { SfdIconByIndex } from './sfd/SfdIconByIndex';
import { mergeCollisionShapeSettings } from './panelData';
import { findCollisionAreaInCategory } from './collisionCategory';
import { patchCollisionShape } from './collisionShapePatch';
import { useLocale } from './localeContext';
import { accentRgba, getObjectAccent } from './pointColorSchemes';
import type { AppLabels } from './labels';
import { InputField, Section, Toggle, LIGHT, DARK, type Tokens } from './PropertyPanel';

const PRIMITIVE_ICONS: { id: CollisionPrimitive; iconIndex: number }[] = [
  { id: 'cube', iconIndex: 95 },
  { id: 'cylinder', iconIndex: 96 },
  { id: 'halfSphere', iconIndex: 94 },
  { id: 'corner', iconIndex: 158 },
];

const MM_SUFFIX = '[mm]';

function ShapeDimensionFields({
  primitive,
  s,
  setData,
  selectedAreaId,
  collisionCategoryId,
  t,
  L,
}: {
  primitive: CollisionPrimitive;
  s: CollisionShapeSettings;
  setData: Dispatch<SetStateAction<PanelData>>;
  selectedAreaId: string | null;
  collisionCategoryId: CollisionCategoryId;
  t: Tokens;
  L: AppLabels;
}) {
  const patch = (p: Partial<CollisionShapeSettings>) =>
    patchCollisionShape(setData, selectedAreaId, p, collisionCategoryId);

  switch (primitive) {
    case 'cylinder':
      return (
        <>
          <InputField label={L.collisionDimRadius} value={s.radiusMm} onChange={(v) => patch({ radiusMm: v })} t={t} />
          <InputField
            label={L.collisionDimHeightPlain}
            value={s.heightMm}
            onChange={(v) => patch({ heightMm: v })}
            t={t}
            suffix={MM_SUFFIX}
            labelInfo
            infoAriaLabel={L.collisionDimHeightHint}
          />
          <InputField label={L.collisionDimFillet} value={s.filletMm} onChange={(v) => patch({ filletMm: v })} t={t} />
        </>
      );
    case 'halfSphere':
      return (
        <InputField
          label={L.collisionDimRadiusPlain}
          value={s.radiusMm}
          onChange={(v) => patch({ radiusMm: v })}
          t={t}
          suffix={MM_SUFFIX}
          labelInfo
          infoAriaLabel={L.collisionDimRadiusHint}
        />
      );
    case 'cube':
      return (
        <>
          <InputField
            label={L.collisionDimSize}
            value={s.sizeMm}
            onChange={(v) => patch({ sizeMm: v })}
            t={t}
            suffix={MM_SUFFIX}
            labelInfo
            infoAriaLabel={L.collisionDimSizeHint}
          />
          <InputField label={L.collisionDimFillet} value={s.filletMm} onChange={(v) => patch({ filletMm: v })} t={t} />
        </>
      );
    case 'corner':
      return (
        <>
          <InputField
            label={L.collisionDimSize}
            value={s.sizeMm}
            onChange={(v) => patch({ sizeMm: v })}
            t={t}
            suffix={MM_SUFFIX}
          />
          <InputField label={L.collisionDimFillet} value={s.filletMm} onChange={(v) => patch({ filletMm: v })} t={t} />
        </>
      );
    default:
      return null;
  }
}

export function CollisionSubmodalContent({
  data,
  setData,
  selectedAreaId,
  collisionCategoryId,
  theme,
}: {
  data: PanelData;
  setData: Dispatch<SetStateAction<PanelData>>;
  selectedAreaId: string | null;
  collisionCategoryId: CollisionCategoryId;
  theme: 'light' | 'dark';
}) {
  const { L, pointScheme } = useLocale();
  const collisionAccent = getObjectAccent('collision', pointScheme);
  const t: Tokens = theme === 'light' ? LIGHT : DARK;
  const item = findCollisionAreaInCategory(data, collisionCategoryId, selectedAreaId);
  const s = mergeCollisionShapeSettings(data.collisionShapeDefaults, item ?? undefined);
  const defaultsMode = selectedAreaId == null;
  /** 기본값→편집 전환 시 Section 내부 state가 갱신되도록 마운트 키 분리 */
  const sectionMountKey = `${collisionCategoryId}:${selectedAreaId ?? 'defaults'}`;

  const accent = collisionAccent;

  const sectionShell =
    theme === 'light'
      ? defaultsMode
        ? {
            border: `1px dashed ${t.inputBorder}`,
            background: 'rgba(0,0,0,0.03)',
            boxShadow: 'none',
          }
        : {
            border: `1px solid ${t.inputBorder}`,
            boxShadow: 'none',
            background: 'rgba(0,0,0,0.025)',
          }
      : defaultsMode
        ? {
            border: `1px dashed ${t.inputBorder}`,
            background: 'rgba(255,255,255,0.04)',
            boxShadow: 'none',
          }
        : {
            border: `1px solid ${t.inputBorder}`,
            boxShadow: 'none',
            background: 'rgba(255,255,255,0.035)',
          };

  const toggleShell =
    theme === 'light'
      ? defaultsMode
        ? {
            border: `1px dashed ${t.inputBorder}`,
            background: 'rgba(0,0,0,0.025)',
          }
        : {
            border: `1px solid ${t.inputBorder}`,
            background: 'rgba(0,0,0,0.02)',
            boxShadow: 'none',
          }
      : defaultsMode
        ? {
            border: `1px dashed ${t.inputBorder}`,
            background: 'rgba(255,255,255,0.035)',
          }
        : {
            border: `1px solid ${t.inputBorder}`,
            background: 'rgba(255,255,255,0.03)',
            boxShadow: 'none',
          };

  return (
    <div className="flex flex-col gap-2.5">
      {defaultsMode ? (
        <p className="text-[10px] leading-relaxed px-0.5 -mt-0.5 mb-0.5" style={{ color: t.textSecondary }}>
          {L.collisionSubmodalDefaultsIntro}
        </p>
      ) : (
        <p
          className="text-[10px] leading-relaxed -mt-0.5 mb-0.5 rounded-[6px] py-1.5 px-2"
          style={{
            color: t.textSecondary,
            background: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${t.inputBorder}`,
          }}
        >
          {L.collisionSubmodalEditIntro}
        </p>
      )}
      <Section
        key={`pose-${sectionMountKey}`}
        title={L.collisionPoseSectionTitle}
        description={defaultsMode ? L.collisionPoseDefaultsHint : L.collisionPoseEditHint}
        accentColor={collisionAccent}
        defaultOpen={!defaultsMode}
        shellStyle={sectionShell}
        t={t}
      >
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            {(['X', 'Y', 'Z'] as const).map((axis, i) => {
              const keys = ['posX', 'posY', 'posZ'] as const;
              const k = keys[i];
              const val = s[k];
              return (
                <div
                  key={axis}
                  className="flex-1 min-w-0 flex items-center gap-1 px-2 rounded-[8px] min-h-[34px]"
                  style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}` }}
                >
                  <span className="text-[12px] shrink-0 font-bold" style={{ color: accent }}>
                    {axis}
                  </span>
                  <input
                    className="flex-1 min-w-0 text-[12px] text-right bg-transparent outline-none"
                    style={{ color: t.textValue, fontWeight: 500 }}
                    value={val}
                    onChange={(e) =>
                      patchCollisionShape(setData, selectedAreaId, { [k]: e.target.value }, collisionCategoryId)
                    }
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-1.5">
            {(['Rx', 'Ry', 'Rz'] as const).map((axis, i) => {
              const keys = ['rotRx', 'rotRy', 'rotRz'] as const;
              const k = keys[i];
              const val = s[k];
              return (
                <div
                  key={axis}
                  className="flex-1 min-w-0 flex items-center gap-1 px-2 rounded-[8px] min-h-[34px]"
                  style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}` }}
                >
                  <span className="text-[12px] shrink-0 font-bold" style={{ color: accent }}>
                    {axis}
                  </span>
                  <input
                    className="flex-1 min-w-0 text-[12px] text-right bg-transparent outline-none"
                    style={{ color: t.textValue, fontWeight: 500 }}
                    value={val}
                    onChange={(e) =>
                      patchCollisionShape(setData, selectedAreaId, { [k]: e.target.value }, collisionCategoryId)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section
        key={`shape-${sectionMountKey}`}
        title={L.collisionShapeSectionTitle}
        description={defaultsMode ? L.collisionShapeDefaultsHint : L.collisionShapeEditHint}
        accentColor={collisionAccent}
        defaultOpen={!defaultsMode}
        shellStyle={sectionShell}
        t={t}
      >
        <div className="grid grid-cols-4 gap-1.5">
          {PRIMITIVE_ICONS.map(({ id, iconIndex }) => {
            const active = s.primitive === id;
            return (
              <button
                key={id}
                type="button"
                className="aspect-square rounded-[10px] flex items-center justify-center transition-all duration-150"
                style={{
                  border: `2px solid ${active ? accent : t.inputBorder}`,
                  background: t.inputBg,
                  boxShadow: active ? `0 0 0 1px ${accentRgba(collisionAccent, 0.25)}` : 'none',
                }}
                onClick={() =>
                  patchCollisionShape(setData, selectedAreaId, { primitive: id }, collisionCategoryId)
                }
                aria-pressed={active}
              >
                <SfdIconByIndex index={iconIndex} color={active ? accent : t.textSecondary} size={24} />
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 pt-1 border-t" style={{ borderColor: t.divider }}>
          <ShapeDimensionFields
            primitive={s.primitive}
            s={s}
            setData={setData}
            selectedAreaId={selectedAreaId}
            collisionCategoryId={collisionCategoryId}
            t={t}
            L={L}
          />
        </div>
      </Section>

      <div className="rounded-[12px] px-2.5 py-2 flex flex-col gap-1.5 transition-colors duration-200" style={toggleShell}>
        <Toggle
          label={L.collisionSoftCover}
          value={s.softCover}
          onChange={(v) => patchCollisionShape(setData, selectedAreaId, { softCover: v }, collisionCategoryId)}
          t={t}
        />
        <Toggle
          label={L.collisionSoftCoverSafety}
          value={s.softCoverSafetyRec}
          onChange={(v) =>
            patchCollisionShape(setData, selectedAreaId, { softCoverSafetyRec: v }, collisionCategoryId)
          }
          t={t}
        />
      </div>
    </div>
  );
}
