import type { Dispatch, SetStateAction } from 'react';
import { useLocale } from './localeContext';
import type { PanelData } from './panelData';
import { getObjectAccent } from './pointColorSchemes';
import type { PointSchemeId } from './pointColorSchemes';
import { Section, InputField, Toggle, type Tokens, LIGHT, DARK } from './PropertyPanel';
import { CollabWorkspaceEditSection } from './CollabWorkspacePanel';
import { CollabBodyPartPicker } from './collabPanelShared';

export function CollabSubmodalContent({
  data,
  setData,
  theme,
  pointScheme,
}: {
  data: PanelData;
  setData: Dispatch<SetStateAction<PanelData>>;
  theme: 'light' | 'dark';
  pointScheme: PointSchemeId;
}) {
  const { L, locale } = useLocale();
  const t: Tokens = theme === 'light' ? LIGHT : DARK;
  const objectAccent = getObjectAccent('collab', pointScheme);
  const d = data.collabCreationDefaults;
  const editingWorkspace = data.collabEditingWorkspaceId
    ? data.collabWorkspaces.find((w) => w.id === data.collabEditingWorkspaceId)
    : null;

  function f(key: keyof PanelData) {
    return (v: string) => setData((p) => ({ ...p, [key]: v }));
  }

  const setDefaults = (patch: Partial<typeof d>) => {
    setData((p) => ({ ...p, collabCreationDefaults: { ...p.collabCreationDefaults, ...patch } }));
  };

  return (
    <div className="flex flex-col gap-2">
      {editingWorkspace ? (
        <CollabWorkspaceEditSection
          data={data}
          setData={setData}
          t={t}
          L={L}
          locale={locale}
          objectAccent={objectAccent}
          theme={theme}
        />
      ) : (
        <>
      <Section title={L.collabDefaultsSectionTitle} accentColor={objectAccent} t={t} defaultOpen={false}>
        <CollabBodyPartPicker
          value={d.bodyPartId}
          onChange={(id) => setDefaults({ bodyPartId: id })}
          t={t}
          theme={theme}
          locale={locale}
          bodyPartTitle={L.collabBodyPartSection}
        />
        <Toggle
          label={L.collabClothingThickness}
          tooltip={L.collabInfoTooltipClothing}
          value={d.clothingThickness}
          onChange={(v) => setDefaults({ clothingThickness: v })}
          t={t}
        />
        <Toggle
          label={L.collabWorkerDirection}
          tooltip={L.collabInfoTooltipWorkerDir}
          value={d.workerDirection}
          onChange={(v) => setDefaults({ workerDirection: v })}
          t={t}
        />
      </Section>

      <Section title={L.collabSafety} accentColor={objectAccent} t={t} defaultOpen={false}>
        <Toggle label={L.pflActive} value={data.pflEnabled} onChange={(v) => setData((p) => ({ ...p, pflEnabled: v }))} t={t} />
        <Toggle label={L.ssmActive} value={data.ssmEnabled} onChange={(v) => setData((p) => ({ ...p, ssmEnabled: v }))} t={t} />
        <div style={{ height: 1, background: t.divider }} />
        <InputField label={L.minSepDist} value={data.minSepDist} onChange={f('minSepDist')} t={t} />
        <InputField label={L.safeSpeed} value={data.safeSpeed} onChange={f('safeSpeed')} t={t} />
      </Section>
        </>
      )}
    </div>
  );
}
