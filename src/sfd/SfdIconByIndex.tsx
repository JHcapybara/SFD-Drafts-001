import type { CSSProperties } from 'react';
import { getSfdIconUrlByIndex } from './sfdIconIndexRegistry';
import { SfdSvgMaskIcon } from './SfdSvgMaskIcon';

export type SfdIconByIndexProps = {
  /** 파일명 `_인덱스.svg` 의 숫자 */
  index: number;
  /** 채움색 — `currentColor` 가능 */
  color: string;
  size?: number;
  className?: string;
  /** 기본(0°)은 에셋 원본 방향. 화살표 등은 `itemIconPreferences`의 direction과 함께 쓰면 됨 */
  rotationDeg?: number;
  style?: CSSProperties;
  title?: string;
  'aria-hidden'?: boolean;
};

/**
 * 인덱스로 `sfd-icon-2026` SVG를 불러와 mask 아이콘으로 표시합니다.
 * 크기·색·회전은 호출 측에서 조절합니다.
 */
export function SfdIconByIndex({
  index,
  color,
  size = 20,
  rotationDeg = 0,
  className,
  style,
  title,
  'aria-hidden': ariaHidden,
}: SfdIconByIndexProps) {
  const src = getSfdIconUrlByIndex(index);
  if (!src) {
    if (import.meta.env.DEV) {
      console.warn(`[SfdIconByIndex] 인덱스 ${index} 에 해당하는 SVG가 없습니다.`);
    }
    return null;
  }
  return (
    <SfdSvgMaskIcon
      src={src}
      color={color}
      size={size}
      className={className}
      title={title}
      aria-hidden={ariaHidden}
      style={{
        transform: rotationDeg ? `rotate(${rotationDeg}deg)` : undefined,
        transformOrigin: 'center',
        ...style,
      }}
    />
  );
}
