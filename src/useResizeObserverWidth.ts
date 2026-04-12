import { useEffect, useState, type RefObject } from 'react';

/** 요소의 content box 너비(px). 레이아웃 전 0일 수 있음. */
export function useResizeObserverWidth<T extends HTMLElement>(ref: RefObject<T | null>): number {
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setW(Math.round(el.getBoundingClientRect().width));
    measure();
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw != null) setW(Math.round(cw));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}
