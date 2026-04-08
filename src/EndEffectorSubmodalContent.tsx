import { useRef, useState } from 'react';
import type React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { EeSlot, PanelData } from './panelData';
import { adjustEeSelectedIdxAfterClear, compactEeSlotsToFront } from './panelData';
import { useLocale } from './localeContext';
import {
  Section,
  InputField,
  Toggle,
  LIGHT,
  DARK,
  type Tokens,
} from './PropertyPanel';
import EeModelPickerModal, { type PickedEeModel } from './EeModelPickerModal';
import { EeModelSummaryCard } from './EeModelSummaryCard';
import { accentRgba } from './pointColorSchemes';

function EeTripleInput({
  labels,
  values,
  onChange,
  t,
}: {
  labels: [string, string, string];
  values: [string, string, string];
  onChange?: (i: number, v: string) => void;
  t: Tokens;
}) {
  const [fi, setFi] = useState<number | null>(null);
  return (
    <div className="flex gap-1.5 w-full overflow-hidden">
      {labels.map((label, i) => (
        <div
          key={label}
          className="relative flex-1 min-w-0 flex items-center gap-1 px-2 rounded-[8px] min-h-[34px] transition-all duration-150"
          style={{
            background: t.inputBg,
            border: `1px solid ${fi === i ? t.inputFocusBorder : t.inputBorder}`,
            boxShadow: fi === i ? t.inputFocusShadow : 'none',
          }}
        >
          <span className="text-[12px] shrink-0 leading-none" style={{ color: '#ff8e2b', fontWeight: 700, letterSpacing: '0.02em' }}>
            {label}
          </span>
          <input
            className="flex-1 min-w-0 text-[12px] text-right bg-transparent outline-none leading-none"
            style={{ color: t.textValue, fontWeight: 500 }}
            value={values[i]}
            onChange={(e) => onChange?.(i, e.target.value)}
            onFocus={() => setFi(i)}
            onBlur={() => setFi(null)}
          />
        </div>
      ))}
    </div>
  );
}

function EeSubLabel({ text, t, uppercase = true }: { text: string; t: Tokens; uppercase?: boolean }) {
  const display = uppercase ? text.toUpperCase() : text;
  return <p className="text-[12px] px-1 pt-1" style={{ color: t.textSecondary, fontWeight: 500, letterSpacing: '0.04em' }}>{display}</p>;
}

export function EndEffectorSubmodalContent({
  data,
  setData,
  selectedIdx,
  setSelectedEeIdx,
  theme,
  accentColor,
  mode = 'settings',
}: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  selectedIdx: number | null;
  /** 리스트 압축 시 App 쪽 선택 인덱스 보정용 */
  setSelectedEeIdx?: Dispatch<SetStateAction<number | null>>;
  theme: 'light' | 'dark';
  accentColor: string;
  mode?: 'settings' | 'connection';
}) {
  const { L } = useLocale();
  const t: Tokens = theme === 'light' ? LIGHT : DARK;
  const isDark = theme === 'dark';
  const [eePickerOpen, setEePickerOpen] = useState(false);
  const selectedEe = selectedIdx !== null ? data.eeSlots[selectedIdx] : null;
  const eeSubmodalRenderCountRef = useRef(0);
  eeSubmodalRenderCountRef.current += 1;
  console.log('[Render][EndEffectorSubmodalContent]', {
    count: eeSubmodalRenderCountRef.current,
    mode,
    selectedIdx,
    selectedEeExists: selectedEe != null,
    eePickerOpen,
    eeFilledCount: data.eeSlots.filter(Boolean).length,
  });

  function assignSlotFromPicker(slot: number, m: PickedEeModel) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      slots[slot] = {
        objectName: 'object_name',
        name: m.name,
        modelFileName: m.fileName,
        type: m.type,
        mass: m.mass,
        makerLabel: m.makerLabel,
        source: m.source,
        tcpPos: { x: '0', y: '0', z: '200' },
        tcpRot: { rx: '0', ry: '0', rz: '0' },
        eeSize: { w: '0', d: '0', h: '0' },
        eeOuterDiam: '0',
        eeCom: { cx: '0', cy: '0', cz: '0' },
        eeAutoCom: true,
        linkedItems: [],
      };
      return { ...p, eeSlots: slots };
    });
  }

  function clearEeSlot(idx: number) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      slots[idx] = null;
      return { ...p, eeSlots: compactEeSlotsToFront(slots) };
    });
    setSelectedEeIdx?.((prev: number | null) => adjustEeSelectedIdxAfterClear(prev, idx));
  }

  function updateEeField(idx: number, field: keyof EeSlot, value: string) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      const ee = slots[idx];
      if (ee) slots[idx] = { ...ee, [field]: value };
      return { ...p, eeSlots: slots };
    });
  }

  function updateEeTcp(idx: number, group: 'tcpPos' | 'tcpRot', field: string, value: string) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      const ee = slots[idx];
      if (ee) slots[idx] = { ...ee, [group]: { ...ee[group], [field]: value } };
      return { ...p, eeSlots: slots };
    });
  }

  function updateEeSize(idx: number, field: 'w' | 'd' | 'h', value: string) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      const ee = slots[idx];
      if (ee) slots[idx] = { ...ee, eeSize: { ...ee.eeSize, [field]: value } };
      return { ...p, eeSlots: slots };
    });
  }

  function updateEeCom(idx: number, field: 'cx' | 'cy' | 'cz', value: string) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      const ee = slots[idx];
      if (ee) slots[idx] = { ...ee, eeCom: { ...ee.eeCom, [field]: value } };
      return { ...p, eeSlots: slots };
    });
  }

  if (selectedIdx == null) {
    return (
      <p className="text-[11px] leading-relaxed px-0.5" style={{ color: t.textSecondary }}>
        {mode === 'connection'
          ? L.eeConnEmptySlotHint
          : `${L.eeListTitle}에서 상세 설정할 엔드이펙터를 선택하세요.`}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <EeModelPickerModal
        open={eePickerOpen}
        slotIndex={selectedIdx}
        onClose={() => setEePickerOpen(false)}
        onPick={(slot, model) => assignSlotFromPicker(slot, model)}
        t={t}
        isDark={isDark}
      />
      {selectedEe ? (
        <>
          {mode === 'settings' ? (
            <>
              <Section title={L.eeDetail} accentColor={accentColor} t={t}>
                <EeModelSummaryCard
                  modelFileName={selectedEe.modelFileName}
                  type={selectedEe.type}
                  modelDisplayName={selectedEe.source === 'custom' ? selectedEe.modelFileName : selectedEe.name}
                  makerLabel={selectedEe.makerLabel}
                  source={selectedEe.source}
                  t={t}
                  isDark={isDark}
                />
                <InputField
                  label={L.eeObjectName}
                  value={selectedEe.objectName}
                  onChange={(v) => updateEeField(selectedIdx, 'objectName', v)}
                  t={t}
                />
                <InputField
                  label={L.eeMass}
                  value={selectedEe.mass}
                  onChange={(v) => updateEeField(selectedIdx, 'mass', v)}
                  t={t}
                />
                <Toggle
                  label={L.autoCoM}
                  tooltip={L.autoCoMTooltip}
                  value={selectedEe.eeAutoCom}
                  onChange={(v) => setData((p) => {
                    const slots = [...p.eeSlots] as (EeSlot | null)[];
                    const ee = slots[selectedIdx];
                    if (ee) slots[selectedIdx] = { ...ee, eeAutoCom: v };
                    return { ...p, eeSlots: slots };
                  })}
                  t={t}
                />
                <EeSubLabel text={L.weightCoMMm} t={t} />
                <EeTripleInput
                  labels={['Cx', 'Cy', 'Cz']}
                  values={[selectedEe.eeCom.cx, selectedEe.eeCom.cy, selectedEe.eeCom.cz]}
                  onChange={(i, v) => {
                    const k = ['cx', 'cy', 'cz'] as const;
                    updateEeCom(selectedIdx, k[i], v);
                  }}
                  t={t}
                />
              </Section>

              <Section title={L.eeTcpSectionTitle} accentColor={accentColor} t={t}>
                <EeSubLabel text={L.tcpPosition} t={t} />
                <EeTripleInput
                  labels={['X', 'Y', 'Z']}
                  values={[selectedEe.tcpPos.x, selectedEe.tcpPos.y, selectedEe.tcpPos.z]}
                  onChange={(i, v) => {
                    const k = ['x', 'y', 'z'] as const;
                    updateEeTcp(selectedIdx, 'tcpPos', k[i], v);
                  }}
                  t={t}
                />
                <EeSubLabel text={L.tcpDirection} t={t} uppercase={false} />
                <EeTripleInput
                  labels={['Rx', 'Ry', 'Rz']}
                  values={[selectedEe.tcpRot.rx, selectedEe.tcpRot.ry, selectedEe.tcpRot.rz]}
                  onChange={(i, v) => {
                    const k = ['rx', 'ry', 'rz'] as const;
                    updateEeTcp(selectedIdx, 'tcpRot', k[i], v);
                  }}
                  t={t}
                />
                <EeSubLabel text={L.eeObjectSize} t={t} />
                <EeTripleInput
                  labels={['W', 'D', 'H']}
                  values={[selectedEe.eeSize.w, selectedEe.eeSize.d, selectedEe.eeSize.h]}
                  onChange={(i, v) => {
                    const k = ['w', 'd', 'h'] as const;
                    updateEeSize(selectedIdx, k[i], v);
                  }}
                  t={t}
                />
                <InputField label={L.eeOuterDiam} value={selectedEe.eeOuterDiam} onChange={(v) => updateEeField(selectedIdx, 'eeOuterDiam', v)} t={t} />
              </Section>
              <button
                type="button"
                className="w-full py-2.5 rounded-[10px] text-[12px] font-semibold transition-all duration-150 active:scale-[0.99]"
                style={{
                  color: accentColor,
                  background: isDark ? accentRgba(accentColor, 0.1) : accentRgba(accentColor, 0.07),
                  border: `1px solid ${isDark ? accentRgba(accentColor, 0.4) : accentRgba(accentColor, 0.3)}`,
                }}
                onClick={() => clearEeSlot(selectedIdx)}
              >
                {L.eeRemoveFromList}
              </button>
            </>
          ) : (
            <Section title={L.connLinkedList} accentColor={accentColor} t={t}>
              {selectedEe.linkedItems.length === 0 ? (
                <p className="text-[12px] px-1 py-2 leading-relaxed" style={{ color: t.textSecondary }}>
                  {L.connListEmpty}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedEe.linkedItems.map((row, i) => (
                    <div key={i} className="rounded-[10px] px-3 py-2.5" style={{ border: `1px solid ${t.inputBorder}`, background: t.inputBg }}>
                      <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: t.textPrimary }} title={row.name}>
                        <span style={{ color: t.textSecondary, fontWeight: 500 }}>{L.connColName}</span>{' '}
                        <span style={{ color: t.textPrimary }}>{row.name}</span>
                      </p>
                      <p className="text-[11px] mt-1.5 leading-snug truncate" style={{ color: t.textSecondary }}>
                        <span style={{ fontWeight: 600 }}>{L.connColModel}</span> {row.model}
                      </p>
                      <p className="text-[11px] mt-0.5 leading-snug truncate" style={{ color: t.textSecondary }}>
                        <span style={{ fontWeight: 600 }}>{L.connColKind}</span> {row.kind}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}
        </>
      ) : (
        mode === 'connection' ? (
          <p className="text-[12px] px-1 py-2 leading-relaxed text-center" style={{ color: t.textSecondary }}>
            {L.eeConnEmptySlotHint}
          </p>
        ) : (
          <button
            type="button"
            className="w-full rounded-[10px] py-2.5 text-[12px] font-semibold transition-all duration-150"
            style={{
              background: '#ff8e2b',
              color: '#fff',
              border: '1px solid rgba(255,142,43,0.65)',
            }}
            onClick={() => setEePickerOpen(true)}
          >
            {L.eeSelectModel}
          </button>
        )
      )}
    </div>
  );
}
