import type { CSSProperties } from 'react';

export type SfdSvgMaskIconProps = {
  /** Vite로 가져온 SVG URL (`…svg?url`) */
  src: string;
  /** 채우기 색 — `currentColor` 사용 시 부모 `color` 상속 */
  color: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  'aria-hidden'?: boolean;
  title?: string;
};

/**
 * 흰색 실루엣 SVG를 `mask-image`로 씌워 `color`·`size`를 자유롭게 바꿉니다.
 * (`sfd-icon-2026` 등 회사 에셋용)
 */
export function SfdSvgMaskIcon({
  src,
  color,
  size = 20,
  className,
  style,
  'aria-hidden': ariaHidden = true,
  title,
}: SfdSvgMaskIconProps) {
  /** `url()` 안에 경로를 안전하게 넣기 (특수문자·상대경로) */
  const maskUrl = `url(${JSON.stringify(src)})`;
  /** 마스크와 `transform`을 한 요소에 두면 일부 브라우저에서 마스크가 무시되고 색만 채워진 네모로 보임 */
  const { transform, transformOrigin, ...restStyle } = style ?? {};

  return (
    <span
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={ariaHidden}
      aria-label={title}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        transform,
        transformOrigin: transformOrigin ?? 'center',
        ...restStyle,
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          backgroundColor: color,
          maskImage: maskUrl,
          WebkitMaskImage: maskUrl,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskMode: 'alpha',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
    </span>
  );
}
