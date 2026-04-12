import { useEffect, useLayoutEffect, useState } from 'react';
import { onboardingTargetSelector, type SfdOnboardingTargetId } from './sfd/sfdOnboardingTargets';

const PAD = 10;

export type OnboardingHighlightRect = { top: number; left: number; width: number; height: number };

/** 스포트라이트 구멍과 동일한 패딩·좌표계로 하이라이트 영역을 잽니다. */
export function measureOnboardingHighlightRect(targetId: SfdOnboardingTargetId | null): OnboardingHighlightRect | null {
  if (!targetId) return null;
  const el = document.querySelector(onboardingTargetSelector(targetId));
  if (!el || !(el instanceof HTMLElement)) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 && r.height < 2) return null;
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

function measureTarget(targetId: SfdOnboardingTargetId | null): OnboardingHighlightRect | null {
  return measureOnboardingHighlightRect(targetId);
}

/**
 * 뷰포트 전역 어두운 오버레이 + 타깃 주변만 비움(클릭은 구멍으로 통과).
 * 타깃은 `data-sfd-onboarding-target` 으로 찾으며, 리사이즈·스크롤 시 위치를 다시 잽니다.
 */
export function SfdOnboardingSpotlight({
  activeTargetId,
  zIndex = 58,
}: {
  activeTargetId: SfdOnboardingTargetId | null;
  zIndex?: number;
}) {
  const [rect, setRect] = useState<OnboardingHighlightRect | null>(() => measureTarget(activeTargetId));

  useLayoutEffect(() => {
    setRect(measureTarget(activeTargetId));
  }, [activeTargetId]);

  useEffect(() => {
    if (!activeTargetId) return;

    const update = () => setRect(measureTarget(activeTargetId));
    update();

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => update())
        : null;
    const el = document.querySelector(onboardingTargetSelector(activeTargetId));
    if (el instanceof HTMLElement && ro) ro.observe(el);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      ro?.disconnect();
    };
  }, [activeTargetId]);

  if (!activeTargetId) return null;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

  const fullDim = (
    <div
      className="fixed inset-0 pointer-events-auto"
      style={{
        zIndex,
        background: 'rgba(5,8,14,0.72)',
        backdropFilter: 'blur(2px)',
      }}
      aria-hidden
    />
  );

  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return fullDim;
  }

  const t = Math.max(0, rect.top);
  const l = Math.max(0, rect.left);
  const b = Math.min(vh, rect.top + rect.height);
  const r = Math.min(vw, rect.left + rect.width);

  return (
    <>
      {/* 상 */}
      <div
        className="fixed pointer-events-auto"
        style={{
          zIndex,
          top: 0,
          left: 0,
          right: 0,
          height: t,
          background: 'rgba(5,8,14,0.72)',
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden
      />
      {/* 하 */}
      <div
        className="fixed pointer-events-auto"
        style={{
          zIndex,
          top: b,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5,8,14,0.72)',
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden
      />
      {/* 좌 */}
      <div
        className="fixed pointer-events-auto"
        style={{
          zIndex,
          top: t,
          left: 0,
          width: l,
          height: Math.max(0, b - t),
          background: 'rgba(5,8,14,0.72)',
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden
      />
      {/* 우 */}
      <div
        className="fixed pointer-events-auto"
        style={{
          zIndex,
          top: t,
          left: r,
          right: 0,
          height: Math.max(0, b - t),
          background: 'rgba(5,8,14,0.72)',
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden
      />
      {/* 하이라이트 테두리 */}
      <div
        className="fixed pointer-events-none rounded-[10px]"
        style={{
          zIndex: zIndex + 1,
          top: t,
          left: l,
          width: Math.max(0, r - l),
          height: Math.max(0, b - t),
          boxShadow: `0 0 0 2px rgba(255,142,43,0.85), 0 0 32px rgba(255,142,43,0.25)`,
        }}
        aria-hidden
      />
    </>
  );
}
