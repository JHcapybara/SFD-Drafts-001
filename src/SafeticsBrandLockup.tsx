import brandSymbolUrl from './assets/branding/union.svg?url';
import brandWordmarkUrl from './assets/branding/safetics-wordmark.svg?url';

/**
 * Safetics 브랜드 록업 — 에셋은 서비스 포인트 컬러(#FF8E2B)로 맞춤.
 */
export function SafeticsBrandLockup({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 shrink-0 ${className}`}>
      <img
        src={brandSymbolUrl}
        alt=""
        width={24}
        height={24}
        className="shrink-0 object-contain opacity-[0.95]"
        aria-hidden
      />
      <img
        src={brandWordmarkUrl}
        alt="Safetics"
        className="h-[17px] w-auto max-w-[132px] sm:max-w-[152px] object-contain object-left opacity-[0.98] drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]"
      />
    </div>
  );
}