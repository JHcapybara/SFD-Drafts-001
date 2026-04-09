import { useCallback, useEffect, useRef, useState } from 'react';
import { GripVertical, Minus, Play, Plus, RotateCcw, X } from 'lucide-react';
import { POINT_ORANGE } from './pointColorSchemes';
import { DARK, LIGHT, type Tokens } from './PropertyPanel';
import { WORKSPACE_CONTENT_TOP_PX } from './chromeLayout';
import type { OnboardingOpenAppAction } from './onboardingAppActions';
import { TUTORIAL_KO_KR } from './data/tutorialKoKr';
import {
  ONBOARDING_TAB_INTROS,
  ONBOARDING_TAB_LABELS,
  ONBOARDING_TAB_ORDER,
  stepsForTab,
  type OnboardingGuideStep,
  type OnboardingTabId,
} from './onboardingGuideSteps';
import { SfdOnboardingSpotlight } from './SfdOnboardingSpotlight';
import type { SfdOnboardingTargetId } from './sfd/sfdOnboardingTargets';

const CHECKLIST_WIDTH = 448;
const TUTORIAL_WIDTH = 380;
const MINIMIZED_PILL_DRAG_WIDTH = 360;
const STORAGE_KEY_DISMISS = 'sfd-onboarding-guide-dismissed';

type Locale = 'ko' | 'en';

function useDraggablePanel(
  widthPx: number,
  getInitialPos: () => { left: number; top: number },
): {
  pos: { left: number; top: number };
  onHeaderPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  resetPosition: () => void;
} {
  const [pos, setPos] = useState(getInitialPos);
  const getInitialRef = useRef(getInitialPos);
  getInitialRef.current = getInitialPos;
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const resetPosition = useCallback(() => {
    setPos(getInitialRef.current());
  }, []);

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragRef.current = {
        x: e.clientX - pos.left,
        y: e.clientY - pos.top,
      };
    },
    [pos.left, pos.top],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const margin = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = e.clientX - d.x;
      let top = e.clientY - d.y;
      left = Math.max(margin, Math.min(left, vw - widthPx - margin));
      top = Math.max(WORKSPACE_CONTENT_TOP_PX + margin, Math.min(top, vh - margin - 40));
      setPos((p) => (p.left === left && p.top === top ? p : { left, top }));
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [widthPx]);

  return { pos, onHeaderPointerDown, resetPosition };
}

export function OnboardingGuideLayer({
  open,
  onClose,
  isDark,
  locale,
  onOpenRelatedUI,
}: {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  locale: Locale;
  /** Play 클릭 시 관련 앱 UI(라이브러리·충돌 서브모달 등) 자동 오픈 */
  onOpenRelatedUI?: (action: OnboardingOpenAppAction) => void;
}) {
  const t: Tokens = isDark ? DARK : LIGHT;
  const L = locale === 'en' ? copyEn : copyKo;

  const getChecklistInitialPos = useCallback(
    () => ({
      left: Math.max(16, window.innerWidth - CHECKLIST_WIDTH - 24),
      top: WORKSPACE_CONTENT_TOP_PX + 24,
    }),
    [],
  );

  const checklistDrag = useDraggablePanel(CHECKLIST_WIDTH, getChecklistInitialPos);
  const initialMinimizedLeft = Math.max(
    8,
    (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2 - MINIMIZED_PILL_DRAG_WIDTH / 2,
  );
  const initialMinimizedTop = WORKSPACE_CONTENT_TOP_PX + 10;
  const getMinimizedInitialPos = useCallback(
    () => ({ left: initialMinimizedLeft, top: initialMinimizedTop }),
    [initialMinimizedLeft, initialMinimizedTop],
  );
  const minimizedDrag = useDraggablePanel(MINIMIZED_PILL_DRAG_WIDTH, getMinimizedInitialPos);
  const getTutorialInitialPos = useCallback(
    () => ({
      left: Math.max(16, (window.innerWidth - TUTORIAL_WIDTH) / 2),
      top: WORKSPACE_CONTENT_TOP_PX + 80,
    }),
    [],
  );
  const tutorialDrag = useDraggablePanel(TUTORIAL_WIDTH, getTutorialInitialPos);

  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<OnboardingTabId>('cell-safety');
  const [activeStep, setActiveStep] = useState<OnboardingGuideStep | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveStep(null);
      setMinimized(false);
      setActiveTab('cell-safety');
    }
  }, [open]);

  useEffect(() => {
    if (!activeStep) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setActiveStep(null);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [activeStep]);

  const spotlightId: SfdOnboardingTargetId | null = activeStep?.spotlightTarget ?? null;

  const handleDontShowAgain = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DISMISS, '1');
    } catch {
      /* ignore */
    }
    onClose();
  }, [onClose]);

  const handleClosePanel = useCallback(() => {
    setActiveStep(null);
    onClose();
  }, [onClose]);

  const startTutorialForStep = useCallback(
    (step: OnboardingGuideStep) => {
      const actions = step.openAppActions;
      if (actions?.length && onOpenRelatedUI) {
        for (const a of actions) {
          onOpenRelatedUI(a);
        }
      }
      setActiveStep(step);
    },
    [onOpenRelatedUI],
  );

  if (!open) return null;

  const tabSteps = stepsForTab(activeTab);
  const intro = ONBOARDING_TAB_INTROS[activeTab];

  return (
    <>
      <SfdOnboardingSpotlight activeTargetId={activeStep ? spotlightId : null} zIndex={58} />

      {!minimized && (
        <div
          className="fixed flex flex-col rounded-2xl overflow-hidden border box-border"
          style={{
            zIndex: 62,
            left: checklistDrag.pos.left,
            top: checklistDrag.pos.top,
            width: CHECKLIST_WIDTH,
            maxWidth: 'min(448px, calc(100vw - 16px))',
            background: isDark ? 'rgba(14,16,22,0.98)' : t.panelBg,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : t.panelBorder,
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06) inset'
              : '0 25px 50px -12px rgba(15,23,42,0.15), 0 0 0 1px rgba(15,23,42,0.06)',
            backdropFilter: isDark ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: isDark ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
          }}
          role="dialog"
          aria-label={L.title}
        >
          {/* Header */}
          <div
            className="shrink-0 flex items-center gap-2 px-3.5 py-3 cursor-grab active:cursor-grabbing select-none border-b"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : t.divider,
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.65)',
            }}
            onPointerDown={checklistDrag.onHeaderPointerDown}
          >
            <GripVertical className="w-4 h-4 shrink-0" style={{ color: t.dragHandleColor }} strokeWidth={2} aria-hidden />
            <span className="flex-1 min-w-0 text-[14px] font-bold tracking-tight truncate" style={{ color: t.textPrimary }}>
              {L.title}
            </span>
            <button
              type="button"
              className="shrink-0 h-8 px-2 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors hover:opacity-90"
              style={{ background: t.closeButtonBg, color: t.textSecondary }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => checklistDrag.resetPosition()}
              aria-label={L.resetPosition}
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden />
              <span className="hidden sm:inline max-w-[5.5rem] truncate">{L.resetPosition}</span>
            </button>
            <button
              type="button"
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-90"
              style={{ background: t.closeButtonBg, color: t.textSecondary }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setMinimized(true)}
              aria-label={L.minimize}
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-90"
              style={{ background: t.closeButtonBg, color: t.textSecondary }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleClosePanel}
              aria-label={L.close}
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.2} />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="shrink-0 px-2 pt-2 border-b overflow-x-auto sfd-scroll"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : t.divider,
              background: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)',
            }}
            role="tablist"
            aria-label={L.tablistAria}
          >
            <div className="flex items-stretch gap-0 min-w-min pb-px">
              {ONBOARDING_TAB_ORDER.map((tabId) => {
                const active = activeTab === tabId;
                const label = locale === 'en' ? ONBOARDING_TAB_LABELS[tabId].en : ONBOARDING_TAB_LABELS[tabId].ko;
                return (
                  <button
                    key={tabId}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className="shrink-0 px-2.5 py-2.5 text-[11px] font-semibold leading-tight text-center transition-colors rounded-t-lg border-b-2 -mb-px max-w-[7.5rem] sm:max-w-none"
                    style={{
                      color: active ? POINT_ORANGE : t.textSecondary,
                      borderBottomColor: active ? POINT_ORANGE : 'transparent',
                      background: active
                        ? isDark
                          ? 'rgba(255,142,43,0.08)'
                          : 'rgba(255,142,43,0.06)'
                        : 'transparent',
                    }}
                    onClick={() => {
                      setActiveTab(tabId);
                      setActiveStep(null);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-3 py-3 max-h-[min(68vh,560px)]">
            <div
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'}`,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : 'inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <h3
                className="text-[13px] font-bold leading-snug border-b pb-2.5 mb-0.5"
                style={{
                  color: t.textPrimary,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)',
                  textDecoration: 'underline',
                  textUnderlineOffset: 4,
                  textDecorationThickness: 1,
                  textDecorationColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.2)',
                }}
              >
                {locale === 'en' ? intro.headingEn : intro.headingKo}
              </h3>
              <p className="text-[11px] leading-[17px]" style={{ color: t.textSecondary }}>
                {locale === 'en' ? intro.subEn : intro.subKo}
              </p>
              <ol className="flex flex-col gap-0 mt-1">
                {tabSteps.map((step, index) => (
                  <li
                    key={step.id}
                    className="flex items-center gap-3 min-h-[44px] py-1.5 border-t first:border-t-0"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' }}
                  >
                    <span
                      className="shrink-0 w-6 text-[11px] font-bold tabular-nums text-right"
                      style={{ color: t.textSecondary, opacity: 0.85 }}
                    >
                      {index + 1}.
                    </span>
                    <span className="flex-1 min-w-0 text-[11px] leading-[16px] font-medium" style={{ color: t.textPrimary }}>
                      {locale === 'en' ? step.labelEn : step.labelKo}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
                        color: isDark ? 'rgba(228,228,231,0.9)' : 'rgba(82,82,91,0.95)',
                        boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(15,23,42,0.06)',
                      }}
                      aria-label={L.playStepAria(step, locale)}
                      onClick={() => startTutorialForStep(step)}
                    >
                      <Play className="w-4 h-4 ml-0.5" fill="currentColor" strokeWidth={0} aria-hidden />
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div
            className="shrink-0 px-3.5 py-2.5 border-t flex flex-col gap-1"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : t.divider }}
          >
            <button
              type="button"
              className="text-[11px] font-semibold underline underline-offset-2 text-left w-fit"
              style={{ color: t.textSecondary }}
              onClick={handleDontShowAgain}
            >
              {L.dontShowAgain}
            </button>
            <p className="text-[10px] leading-[15px] m-0" style={{ color: t.textSecondary, opacity: 0.9 }}>
              {locale === 'en' ? L.dontShowAgainHintEn : TUTORIAL_KO_KR['TUT-TOG-03'].content.replace(/\n/g, ' ')}
            </p>
          </div>
        </div>
      )}

      {minimized && (
        <div
          className="fixed z-[62] flex items-center gap-2 rounded-full border shadow-lg select-none"
          style={{
            left: minimizedDrag.pos.left,
            top: minimizedDrag.pos.top,
            minWidth: 240,
            maxWidth: 'min(92vw, 360px)',
            paddingLeft: 10,
            paddingRight: 8,
            paddingTop: 6,
            paddingBottom: 6,
            background: isDark ? 'rgba(28,30,38,0.96)' : 'rgba(250,250,252,0.96)',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : t.panelBorder,
            boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset' : t.panelShadow,
            backdropFilter: isDark ? 'blur(20px) saturate(165%)' : 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: isDark ? 'blur(20px) saturate(165%)' : 'blur(16px) saturate(180%)',
          }}
          role="toolbar"
          aria-label={L.title}
          onPointerDown={(e) => {
            const tEl = e.target as HTMLElement;
            if (tEl.closest('[data-onboarding-minimized-action]')) return;
            minimizedDrag.onHeaderPointerDown(e);
          }}
        >
          <GripVertical
            className="w-3.5 h-3.5 shrink-0 cursor-grab active:cursor-grabbing opacity-50"
            style={{ color: t.textSecondary }}
            strokeWidth={2}
            aria-hidden
          />
          <span
            className="flex-1 min-w-0 text-[12px] font-semibold truncate cursor-grab active:cursor-grabbing"
            style={{ color: t.textPrimary }}
          >
            {L.title}
          </span>
          <div className="flex items-center gap-0.5 shrink-0" data-onboarding-minimized-action>
            <button
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: t.textSecondary }}
              aria-label={L.expand}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setMinimized(false);
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: t.textSecondary }}
              aria-label={L.close}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleClosePanel();
              }}
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      )}

      {activeStep && (
        <div
          className="fixed flex flex-col rounded-2xl overflow-hidden border box-border"
          style={{
            zIndex: 64,
            left: tutorialDrag.pos.left,
            top: tutorialDrag.pos.top,
            width: TUTORIAL_WIDTH,
            maxWidth: 'min(380px, calc(100vw - 16px))',
            background: isDark ? 'rgba(18,20,28,0.98)' : t.panelBg,
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : t.panelBorder,
            boxShadow: isDark ? '0 28px 64px rgba(0,0,0,0.7)' : t.panelShadow,
            backdropFilter: isDark ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-tutorial-title"
        >
          <div
            className="shrink-0 flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing select-none border-b"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : t.divider,
              background: isDark ? 'rgba(255,255,255,0.04)' : t.sectionHeaderBg,
            }}
            onPointerDown={tutorialDrag.onHeaderPointerDown}
          >
            <GripVertical className="w-4 h-4 shrink-0" style={{ color: t.dragHandleColor }} strokeWidth={2} aria-hidden />
            <span className="flex-1 text-[11px] font-semibold truncate" style={{ color: t.textSecondary }}>
              {L.tutorialHint}
            </span>
          </div>

          <div className="px-3 pt-3">
            <div
              className="relative w-full h-[168px] rounded-xl overflow-hidden border flex items-center justify-center"
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : t.divider,
                background: isDark
                  ? 'linear-gradient(145deg, rgba(255,142,43,0.12) 0%, rgba(20,22,30,1) 45%)'
                  : 'linear-gradient(145deg, rgba(255,142,43,0.1) 0%, #f4f4f5 50%)',
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255,255,255,0.4) 12px, rgba(255,255,255,0.4) 13px)`,
                }}
                aria-hidden
              />
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full border-2"
                style={{ borderColor: POINT_ORANGE, color: POINT_ORANGE }}
                aria-hidden
              >
                <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
              </div>
              <span
                className="absolute bottom-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.35)', color: '#e5e7eb' }}
              >
                {L.videoPlaceholder}
              </span>
            </div>
          </div>

          <div className="px-3 py-3 flex flex-col gap-2">
            <h2 id="onboarding-tutorial-title" className="text-[14px] font-bold leading-snug" style={{ color: t.textPrimary }}>
              {locale === 'en' ? activeStep.titleEn : activeStep.titleKo}
            </h2>
            <p className="text-[11px] leading-[18px]" style={{ color: t.textSecondary }}>
              {locale === 'en' ? activeStep.bodyEn : activeStep.bodyKo}
            </p>
          </div>

          <div className="px-3 pb-3 flex justify-end">
            <button
              type="button"
              className="min-h-9 px-6 rounded-[10px] text-[12px] font-bold border-2 transition-opacity hover:opacity-95"
              style={{
                borderColor: 'rgba(255,220,140,0.95)',
                color: '#1a0a00',
                background: 'linear-gradient(180deg, #fff4e0 0%, #ffcc66 22%, #ff8e2b 52%, #ea6c12 100%)',
                boxShadow: '0 8px 20px rgba(255,110,20,0.45)',
              }}
              onClick={() => setActiveStep(null)}
            >
              {L.done}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const copyKo = {
  title: '온보딩 가이드',
  resetPosition: '위치 초기화',
  close: '닫기',
  expand: '가이드 펼치기',
  minimize: '최소화',
  dontShowAgain: '다시 보지 않기',
  dontShowAgainHintEn:
    'Use tutorial On/Off toggles to show tutorials again. Turn the toggle On for the tutorial you need.',
  tutorialHint: '튜토리얼',
  videoPlaceholder: '데모 영역',
  done: 'Done',
  tablistAria: '가이드 구역',
  playStepAria: (step: OnboardingGuideStep, loc: Locale) =>
    loc === 'en' ? `Play tutorial: ${step.labelEn}` : `튜토리얼 재생: ${step.labelKo}`,
};

const copyEn = {
  title: 'Onboarding Guide',
  resetPosition: 'Reset position',
  close: 'Close',
  expand: 'Expand guide',
  minimize: 'Minimize',
  dontShowAgain: "Don't show again",
  dontShowAgainHintEn:
    'Use tutorial On/Off toggles to show tutorials again. Turn the toggle On for the tutorial you need.',
  tutorialHint: 'Tutorial',
  videoPlaceholder: 'Preview',
  done: 'Done',
  tablistAria: 'Guide sections',
  playStepAria: (step: OnboardingGuideStep, loc: Locale) =>
    loc === 'en' ? `Play tutorial: ${step.labelEn}` : `Play: ${step.labelEn}`,
};
