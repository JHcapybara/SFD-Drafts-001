import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronUp, Wrench, Plus, FileBox } from 'lucide-react';
import { useLocale } from './localeContext';
import { EE_CATALOG, EE_MAKER_LABEL, type EeCatalogEntry, type EeCatalogMakerId } from './eeModelCatalog';

type MakerTabId = EeCatalogMakerId | 'custom';

const EE_CUSTOM_UPLOADS_STORAGE_KEY = 'sfd-ee-custom-mesh-uploads';
const MAX_STORED_CUSTOM = 40;

interface ModalTokens {
  panelBg: string;
  panelBorder: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  inputBg: string;
  sectionHeaderBg: string;
  tabActiveBg: string;
}

export interface PickedEeModel {
  name: string;
  type: string;
  mass: string;
  fileName: string;
  makerLabel: string;
  source: 'catalog' | 'custom';
}

export type StoredCustomEeModel = PickedEeModel & { id: string; addedAt: number };

function loadStoredCustomUploads(): StoredCustomEeModel[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EE_CUSTOM_UPLOADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is StoredCustomEeModel =>
        Boolean(
          x &&
            typeof x === 'object' &&
            typeof (x as StoredCustomEeModel).id === 'string' &&
            typeof (x as StoredCustomEeModel).fileName === 'string' &&
            typeof (x as StoredCustomEeModel).name === 'string',
        ),
    );
  } catch {
    return [];
  }
}

function saveStoredCustomUploads(items: StoredCustomEeModel[]) {
  try {
    localStorage.setItem(EE_CUSTOM_UPLOADS_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_STORED_CUSTOM)));
  } catch {
    /* quota */
  }
}

/** 업로드 목록에 추가(동일 파일명은 최신 항목으로 대체) 후 저장된 전체 목록 반환 */
function pushStoredCustomUpload(model: PickedEeModel): StoredCustomEeModel[] {
  const stored: StoredCustomEeModel = {
    ...model,
    id: `ee-cu-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    addedAt: Date.now(),
  };
  const rest = loadStoredCustomUploads().filter((x) => x.fileName !== model.fileName);
  const next = [stored, ...rest].slice(0, MAX_STORED_CUSTOM);
  saveStoredCustomUploads(next);
  return next;
}

interface EeModelPickerModalProps {
  open: boolean;
  slotIndex: number | null;
  onClose: () => void;
  onPick: (slotIndex: number, model: PickedEeModel) => void;
  t: ModalTokens;
  isDark: boolean;
}

const ACCENT = '#ff8e2b';
const ACCENT_ORANGE = 'linear-gradient(135deg,#ff9a3c 0%,#ff6b00 100%)';

export default function EeModelPickerModal({ open, slotIndex, onClose, onPick, t, isDark }: EeModelPickerModalProps) {
  const { L } = useLocale();
  const [makerTab, setMakerTab] = useState<MakerTabId>('onrobot');
  const [selectedId, setSelectedId] = useState<string>(EE_CATALOG.onrobot[0]?.id ?? '');
  const [customUploads, setCustomUploads] = useState<StoredCustomEeModel[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const catalogList: EeCatalogEntry[] = makerTab === 'custom' ? [] : EE_CATALOG[makerTab];

  const selectedCatalog: EeCatalogEntry | null =
    makerTab !== 'custom' ? EE_CATALOG[makerTab].find((e) => e.id === selectedId) ?? EE_CATALOG[makerTab][0] ?? null : null;

  useEffect(() => {
    if (!open) return;
    setMakerTab('onrobot');
    setSelectedId(EE_CATALOG.onrobot[0]?.id ?? '');
    setCustomUploads(loadStoredCustomUploads());
  }, [open]);

  useEffect(() => {
    if (makerTab !== 'custom' && EE_CATALOG[makerTab][0]) {
      setSelectedId((prev) => (EE_CATALOG[makerTab].some((e) => e.id === prev) ? prev : EE_CATALOG[makerTab][0].id));
    }
  }, [makerTab]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onCustomFile = (files: FileList | null) => {
    if (!files?.length || slotIndex === null) return;
    const f = files[0];
    const base = f.name.replace(/\.(stl|STL|step|STEP|obj|OBJ)$/i, '') || f.name;
    const model: PickedEeModel = {
      name: base,
      type: 'Custom',
      mass: '—',
      fileName: f.name,
      makerLabel: L.eeMakerCustom,
      source: 'custom',
    };
    setCustomUploads(pushStoredCustomUpload(model));
    onPick(slotIndex, model);
    onClose();
  };

  const pickStoredCustom = (row: StoredCustomEeModel) => {
    if (slotIndex === null) return;
    onPick(slotIndex, {
      name: row.name,
      type: row.type,
      mass: row.mass,
      fileName: row.fileName,
      makerLabel: row.makerLabel,
      source: row.source,
    });
    onClose();
  };

  if (!open || typeof document === 'undefined') return null;
  const tabs: { id: MakerTabId; label: string }[] = [
    { id: 'onrobot', label: L.eeMakerOnRobot },
    { id: 'schunk', label: L.eeMakerSchunk },
    { id: 'custom', label: L.eeMakerCustom },
  ];

  const node = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 200, background: 'rgba(0,0,0,0.52)' }}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[400px] max-h-[min(92vh,720px)] flex flex-col rounded-[16px] overflow-hidden shadow-2xl"
        style={{
          background: t.panelBg,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: `1px solid ${t.panelBorder}`,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ee-model-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${t.divider}` }}>
          <ChevronUp className="w-4 h-4 shrink-0" style={{ color: t.textSecondary }} />
          <h2 id="ee-model-modal-title" className="flex-1 text-[14px] font-bold tracking-tight" style={{ color: t.textPrimary }}>
            {L.eeModalTitle}
          </h2>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-[8px] transition-colors duration-150"
            style={{ background: t.sectionHeaderBg, color: t.textSecondary }}
            onClick={onClose}
            aria-label={L.eeModalCloseAria}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto sfd-scroll px-4 py-3 flex flex-col gap-3">
          <p className="text-[11px] leading-relaxed" style={{ color: t.textSecondary }}>
            {L.eeModalDesc}
          </p>

          {makerTab === 'custom' &&
            (customUploads.length > 0 ? (
              <div
                className="rounded-[12px] overflow-hidden flex flex-col"
                style={{
                  border: `1px solid ${t.panelBorder}`,
                  background: t.sectionHeaderBg,
                }}
              >
                <p
                  className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide shrink-0"
                  style={{ color: t.textSecondary, borderBottom: `1px solid ${t.divider}` }}
                >
                  {L.eeModalUploadedListTitle}
                </p>
                <ul className="max-h-[min(36vh,220px)] overflow-y-auto sfd-scroll divide-y" style={{ borderColor: t.divider }}>
                  {customUploads.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 hover:opacity-95"
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        }}
                        onClick={() => pickStoredCustom(row)}
                      >
                        <FileBox className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ACCENT }} strokeWidth={2} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-semibold truncate leading-tight" style={{ color: t.textPrimary }}>
                            {row.fileName}
                          </span>
                          <span className="block text-[10px] mt-0.5 truncate" style={{ color: t.textSecondary }}>
                            {row.name} · {row.type}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div
                className="rounded-[12px] px-3 py-4 text-center text-[11px] leading-relaxed"
                style={{
                  border: `2px dashed ${t.panelBorder}`,
                  background: t.sectionHeaderBg,
                  color: t.textSecondary,
                }}
              >
                {L.eeModalCustomHint}
              </div>
            ))}

          {/* 제조사 탭 + 추가 버튼 */}
          <div className="flex items-stretch gap-2">
            <div className="flex-1 flex gap-1 overflow-x-auto pb-0.5 min-w-0" style={{ scrollbarWidth: 'none' }}>
              {tabs.map((tab) => {
                const active = makerTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMakerTab(tab.id)}
                    className="shrink-0 px-3 py-2 rounded-[10px] text-[11px] font-bold transition-all duration-150 whitespace-nowrap"
                    style={{
                      color: active ? ACCENT : t.textSecondary,
                      background: active ? (isDark ? 'rgba(255,142,43,0.14)' : 'rgba(255,142,43,0.12)') : t.inputBg,
                      border: active ? `2px solid ${ACCENT}` : `2px solid transparent`,
                      boxShadow: active ? '0 0 0 1px rgba(255,142,43,0.2)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".stl,.STL,.step,.STEP,.obj,.OBJ"
              className="hidden"
              onChange={(e) => {
                onCustomFile(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              className="shrink-0 h-10 pl-2.5 pr-3 rounded-full flex items-center justify-center gap-1.5 text-[12px] font-bold transition-transform duration-150 active:scale-[0.96] whitespace-nowrap"
              style={{
                background: ACCENT_ORANGE,
                color: 'white',
                boxShadow: '0 4px 14px rgba(255,107,0,0.45)',
              }}
              title={`${L.eeModalUpload} — STL, STEP, OBJ`}
              aria-label={`${L.eeModalUpload}. ${L.eeModalAddFile}`}
              onClick={() => {
                setMakerTab('custom');
                fileRef.current?.click();
              }}
            >
              <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              {L.eeModalUpload}
            </button>
          </div>

          {/* 카탈로그 그리드 */}
          {makerTab !== 'custom' && (
            <div className="grid grid-cols-3 gap-2">
              {catalogList.map((entry) => {
                const sel = entry.id === selectedId;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className="text-left w-full"
                    onClick={() => {
                      setSelectedId(entry.id);
                      if (slotIndex !== null) {
                        onPick(slotIndex, {
                          name: entry.name,
                          type: entry.type,
                          mass: entry.mass,
                          fileName: entry.fileName,
                          makerLabel: EE_MAKER_LABEL[makerTab as EeCatalogMakerId],
                          source: 'catalog',
                        });
                        onClose();
                      }
                    }}
                  >
                    <div
                      className="relative flex flex-col rounded-[10px] overflow-hidden aspect-square w-full transition-all duration-150"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        boxShadow: sel ? `0 0 0 2px ${ACCENT}` : 'none',
                      }}
                    >
                      <div className="flex-1 flex items-center justify-center min-h-0">
                        <Wrench className="w-8 h-8 opacity-90" style={{ color: isDark ? '#e8e8e8' : '#444' }} strokeWidth={1.25} />
                      </div>
                      <div
                        className="shrink-0 py-1.5 px-1 text-center text-[11px] font-semibold truncate"
                        style={{
                          background: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.78)',
                          color: '#fafafa',
                        }}
                      >
                        {entry.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {makerTab === 'custom' && (
            <button
              type="button"
              className="w-full py-3 rounded-[10px] text-[12px] font-semibold transition-colors"
              style={{ background: t.tabActiveBg, color: t.textPrimary, border: `1px solid ${t.panelBorder}` }}
              onClick={() => fileRef.current?.click()}
            >
              {L.eeModalChooseFile}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
