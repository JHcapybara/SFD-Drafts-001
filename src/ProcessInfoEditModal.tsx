import { useMemo, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { POINT_ORANGE, accentRgba } from './pointColorSchemes';

export type ProcessInfoSnapshot = {
  processName: string;
  processType: string;
  memo: string;
};

const PROCESS_TYPE_OPTIONS: { value: string; ko: string; en: string }[] = [
  { value: 'assembly', ko: '조립', en: 'Assembly' },
  { value: 'welding', ko: '용접', en: 'Welding' },
  { value: 'handling', ko: '이송·물류', en: 'Handling' },
  { value: 'inspection', ko: '검사', en: 'Inspection' },
  { value: 'machining', ko: '가공', en: 'Machining' },
];

/** 라이트 모드 — 공정 정보 모달 전용 토큰 */
const MODAL_TOKENS_LIGHT = {
  scrim: 'rgba(0,0,0,0.5)',
  scrimBackdrop: 'blur(2px)',
  dialogBg: '#ffffff',
  dialogBorder: 'rgba(15,23,42,0.1)',
  dialogShadow: '0 24px 48px rgba(15,23,42,0.18)',
  headerBorder: 'rgba(15,23,42,0.08)',
  title: '#18181b',
  label: '#27272a',
  inputBg: '#ffffff',
  inputBorder: 'rgba(15,23,42,0.14)',
  inputText: '#18181b',
  errorText: '#dc2626',
  hintBoxBg: 'rgba(244,244,245,0.95)',
  hintBoxBorder: 'rgba(15,23,42,0.08)',
  hintText: '#71717a',
  hintStrong: '#3f3f46',
  hintSelected: '#3f3f46',
  footerBg: 'rgba(250,250,250,0.96)',
  footerBorder: 'rgba(15,23,42,0.08)',
  cancelBg: '#ffffff',
  cancelBorder: POINT_ORANGE,
  cancelText: POINT_ORANGE,
  chevron: '#71717a',
} as const;

/** 다크 모드 — 공정 정보 모달 전용 토큰 */
const MODAL_TOKENS_DARK = {
  scrim: 'rgba(0,0,0,0.62)',
  scrimBackdrop: 'blur(6px)',
  dialogBg: 'rgba(18,20,26,0.96)',
  dialogBorder: 'rgba(255,255,255,0.14)',
  dialogShadow: '0 24px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
  headerBorder: 'rgba(255,255,255,0.1)',
  title: '#f4f4f5',
  label: '#e4e4e7',
  inputBg: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.16)',
  inputText: '#f4f4f5',
  errorText: '#f87171',
  hintBoxBg: 'rgba(255,255,255,0.05)',
  hintBoxBorder: 'rgba(255,255,255,0.1)',
  hintText: 'rgba(228,228,231,0.65)',
  hintStrong: '#e4e4e7',
  hintSelected: '#f4f4f5',
  footerBg: 'rgba(12,14,18,0.92)',
  footerBorder: 'rgba(255,255,255,0.1)',
  cancelBg: 'transparent',
  cancelBorder: POINT_ORANGE,
  cancelText: '#fdba74',
  chevron: 'rgba(228,228,231,0.7)',
} as const;

type Props = {
  open: boolean;
  locale: 'ko' | 'en';
  theme: 'light' | 'dark';
  initial: ProcessInfoSnapshot;
  onClose: () => void;
  onSave: (next: ProcessInfoSnapshot) => void;
};

export function ProcessInfoEditModal({ open, locale, theme, initial, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<ProcessInfoSnapshot>(initial);
  const [nameError, setNameError] = useState(false);

  const tok = theme === 'dark' ? MODAL_TOKENS_DARK : MODAL_TOKENS_LIGHT;

  useEffect(() => {
    if (open) {
      setDraft(initial);
      setNameError(false);
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const t = useMemo(
    () =>
      locale === 'en'
        ? {
            title: 'Edit process information',
            requiredNote: 'Fields marked with an asterisk (*) are required.',
            processName: 'Process name',
            processType: 'Process type',
            processTypePlaceholder: 'Please select or enter the process type.',
            memo: 'Memo',
            typeDetailHint: 'Additional details for the selected process type will appear here.',
            typeSelectedPrefix: 'Selected:',
            save: 'Save',
            cancel: 'Cancel',
            nameRequired: 'Please enter a process name.',
          }
        : {
            title: '공정 정보 수정',
            requiredNote: '별표(*) 표시는 필수 입력 항목입니다.',
            processName: '공정 명',
            processType: '공정 유형',
            processTypePlaceholder: '공정 유형을 입력해주세요.',
            memo: '메모',
            typeDetailHint: '선택한 공정 유형에 따른 추가 정보가 여기에 표시됩니다.',
            typeSelectedPrefix: '선택:',
            save: '저장',
            cancel: '취소',
            nameRequired: '공정 명을 입력해 주세요.',
          },
    [locale],
  );

  const selectedTypeLabel = PROCESS_TYPE_OPTIONS.find((o) => o.value === draft.processType);

  const handleSave = useCallback(() => {
    const name = draft.processName.trim();
    if (!name) {
      setNameError(true);
      return;
    }
    setNameError(false);
    onSave({ ...draft, processName: name });
    onClose();
  }, [draft, onSave, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const inputBorder = nameError ? tok.errorText : tok.inputBorder;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0"
        style={{
          background: tok.scrim,
          backdropFilter: tok.scrimBackdrop,
          WebkitBackdropFilter: tok.scrimBackdrop,
        }}
        aria-label={locale === 'en' ? 'Close' : '닫기'}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="process-info-modal-title"
        className="relative w-full max-w-[480px] rounded-[12px] border"
        style={{
          borderColor: tok.dialogBorder,
          background: tok.dialogBg,
          boxShadow: tok.dialogShadow,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: tok.headerBorder }}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <h2 id="process-info-modal-title" className="text-[16px] font-bold leading-tight" style={{ color: tok.title }}>
              {t.title}
            </h2>
            <p className="text-[11px] font-semibold shrink-0" style={{ color: POINT_ORANGE }}>
              {t.requiredNote}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 max-h-[min(72vh,560px)] overflow-y-auto sfd-scroll">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold" style={{ color: tok.label }}>
              <span className="mr-0.5" style={{ color: tok.errorText }}>
                *
              </span>
              {t.processName}
            </label>
            <input
              type="text"
              value={draft.processName}
              onChange={(e) => {
                setDraft((d) => ({ ...d, processName: e.target.value }));
                if (nameError) setNameError(false);
              }}
              className="h-10 w-full rounded-[8px] border px-3 text-[13px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,142,43,0.45)] focus-visible:ring-offset-0"
              style={{
                borderColor: inputBorder,
                background: tok.inputBg,
                color: tok.inputText,
              }}
              placeholder=""
            />
            {nameError && (
              <p className="text-[11px] font-medium" style={{ color: tok.errorText }}>
                {t.nameRequired}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold" style={{ color: tok.label }}>
              {t.processType}
            </label>
            <div className="relative">
              <select
                value={draft.processType}
                onChange={(e) => setDraft((d) => ({ ...d, processType: e.target.value }))}
                className="h-10 w-full appearance-none rounded-[8px] border pl-3 pr-10 text-[13px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,142,43,0.45)] focus-visible:ring-offset-0 cursor-pointer"
                style={{
                  borderColor: tok.inputBorder,
                  background: tok.inputBg,
                  color: tok.inputText,
                }}
              >
                <option value="">{t.processTypePlaceholder}</option>
                {PROCESS_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {locale === 'en' ? o.en : o.ko}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                strokeWidth={2.2}
                style={{ color: tok.chevron }}
                aria-hidden
              />
            </div>
            <div
              className="min-h-[72px] rounded-[8px] border px-3 py-2.5 text-[12px] leading-relaxed"
              style={{
                borderColor: tok.hintBoxBorder,
                background: tok.hintBoxBg,
                color: tok.hintText,
              }}
            >
              {draft.processType && selectedTypeLabel ? (
                <span style={{ color: tok.hintSelected }}>
                  <span className="font-semibold" style={{ color: tok.hintStrong }}>
                    {t.typeSelectedPrefix}
                  </span>{' '}
                  {locale === 'en' ? selectedTypeLabel.en : selectedTypeLabel.ko}
                </span>
              ) : (
                t.typeDetailHint
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold" style={{ color: tok.label }}>
              {t.memo}
            </label>
            <textarea
              value={draft.memo}
              onChange={(e) => setDraft((d) => ({ ...d, memo: e.target.value }))}
              rows={5}
              className="w-full resize-y min-h-[120px] rounded-[8px] border px-3 py-2.5 text-[13px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,142,43,0.45)] focus-visible:ring-offset-0"
              style={{
                borderColor: tok.inputBorder,
                background: tok.inputBg,
                color: tok.inputText,
              }}
              placeholder=""
            />
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-2 px-6 py-4 border-t rounded-b-[12px]"
          style={{
            borderColor: tok.footerBorder,
            background: tok.footerBg,
          }}
        >
          <button
            type="button"
            className={`h-9 min-w-[88px] rounded-[8px] border text-[13px] font-semibold transition-colors duration-150 ${
              theme === 'dark' ? 'hover:bg-white/[0.08]' : 'hover:bg-black/[0.04]'
            }`}
            style={{
              borderColor: tok.cancelBorder,
              color: tok.cancelText,
              background: tok.cancelBg,
            }}
            onClick={onClose}
          >
            {t.cancel}
          </button>
          <button
            type="button"
            className="h-9 min-w-[88px] rounded-[8px] border text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-95"
            style={{
              borderColor: accentRgba(POINT_ORANGE, theme === 'dark' ? 0.45 : 0.35),
              background: POINT_ORANGE,
              boxShadow: `0 4px 14px ${accentRgba(POINT_ORANGE, theme === 'dark' ? 0.42 : 0.35)}`,
            }}
            onClick={handleSave}
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
