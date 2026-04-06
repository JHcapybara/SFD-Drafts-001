import type { CSSProperties } from 'react';
import { SfdIconByIndex } from './SfdIconByIndex';

/** `icon_collapse_unfold-line_055.svg` — 기본 방향 위 */
export const SFD_ICON_INDEX_CHEVRON = 55;

type ChevronBaseProps = {
  color: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

const baseTransition: CSSProperties = { transition: 'transform 0.2s ease' };

/** 드롭다운: 닫힘=아래, 열림=위 */
export function SfdChevronDropdown({ open, color, size = 14, className, style }: ChevronBaseProps & { open: boolean }) {
  return (
    <SfdIconByIndex
      index={SFD_ICON_INDEX_CHEVRON}
      color={color}
      size={size}
      className={`shrink-0 ${className ?? ''}`}
      rotationDeg={open ? 0 : 180}
      style={{ ...baseTransition, ...style }}
    />
  );
}

/** 아코디언: 닫힘=오른쪽, 열림=아래 */
export function SfdChevronAccordion({ open, color, size = 14, className, style }: ChevronBaseProps & { open: boolean }) {
  return (
    <SfdIconByIndex
      index={SFD_ICON_INDEX_CHEVRON}
      color={color}
      size={size}
      className={`shrink-0 ${className ?? ''}`}
      rotationDeg={open ? 180 : 90}
      style={{ ...baseTransition, ...style }}
    />
  );
}

/** 트리/리스트: 접힘=오른쪽, 펼침=아래 */
export function SfdChevronTree({ expanded, color, size = 14, className, style }: ChevronBaseProps & { expanded: boolean }) {
  return (
    <SfdIconByIndex
      index={SFD_ICON_INDEX_CHEVRON}
      color={color}
      size={size}
      className={`shrink-0 ${className ?? ''}`}
      rotationDeg={expanded ? 180 : 90}
      style={{ ...baseTransition, ...style }}
    />
  );
}
