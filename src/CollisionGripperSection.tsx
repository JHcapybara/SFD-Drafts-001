import type { Dispatch, SetStateAction } from 'react';
import type { CollisionCategoryId, CollisionShapeSettings, PanelData } from './panelData';
import { mergeCollisionShapeSettings } from './panelData';
import { findCollisionAreaInCategory } from './collisionCategory';
import { patchCollisionShape } from './collisionShapePatch';
import { useLocale } from './localeContext';
import { Toggle, type Tokens } from './PropertyPanel';

function MiniCheck({
  label,
  checked,
  onChange,
  t,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  t: Tokens;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex items-center gap-2 w-full text-left py-1 pl-2 rounded-[6px] transition-opacity"
      style={{ opacity: disabled ? 0.45 : 1 }}
      onClick={() => !disabled && onChange(!checked)}
    >
      <span
        className="w-3.5 h-3.5 rounded-[4px] shrink-0 flex items-center justify-center text-[9px] font-bold leading-none"
        style={{
          border: `1px solid ${checked ? '#ff8e2b' : t.inputBorder}`,
          background: checked ? 'linear-gradient(135deg,#ff9a3c,#ff6b00)' : 'transparent',
          color: checked ? 'white' : 'transparent',
        }}
      >
        {checked ? '✓' : ''}
      </span>
      <span className="text-[11px] leading-snug" style={{ color: t.textSecondary }}>
        {label}
      </span>
    </button>
  );
}

/** 그리퍼에서 형상 생성 블록 (서브모달·연속 생성 확장 패널 공통) */
export function CollisionGripperSection({
  data,
  setData,
  selectedAreaId,
  collisionCategoryId,
  t,
}: {
  data: PanelData;
  setData: Dispatch<SetStateAction<PanelData>>;
  selectedAreaId: string | null;
  collisionCategoryId: CollisionCategoryId;
  t: Tokens;
}) {
  const { L } = useLocale();
  const item = findCollisionAreaInCategory(data, collisionCategoryId, selectedAreaId);
  const s: CollisionShapeSettings = mergeCollisionShapeSettings(data.collisionShapeDefaults, item ?? undefined);

  return (
    <div
      className="rounded-[10px] p-2 flex flex-col gap-1"
      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}` }}
    >
      <Toggle
        label={L.collisionGripperGen}
        value={s.gripperGenerate}
        onChange={(v) =>
          patchCollisionShape(setData, selectedAreaId, { gripperGenerate: v }, collisionCategoryId)
        }
        t={t}
      />
      {s.gripperGenerate && (
        <div className="flex flex-col gap-0.5 pt-1 border-t mt-1" style={{ borderColor: t.divider }}>
          <MiniCheck
            label={L.collisionGripperVertices}
            checked={s.gripperVertices}
            onChange={(v) =>
              patchCollisionShape(setData, selectedAreaId, { gripperVertices: v }, collisionCategoryId)
            }
            t={t}
          />
          <MiniCheck
            label={L.collisionGripperWireframe}
            checked={s.gripperWireframe}
            onChange={(v) =>
              patchCollisionShape(setData, selectedAreaId, { gripperWireframe: v }, collisionCategoryId)
            }
            t={t}
          />
          <MiniCheck
            label={L.collisionGripperEnlarge}
            checked={s.gripperEnlarge}
            onChange={(v) =>
              patchCollisionShape(setData, selectedAreaId, { gripperEnlarge: v }, collisionCategoryId)
            }
            t={t}
          />
        </div>
      )}
    </div>
  );
}
