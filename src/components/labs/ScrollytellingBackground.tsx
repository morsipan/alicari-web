import React, { useEffect, useRef, useState } from 'react';

function clamp(value: number, min = 0, max = 1): number {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export const ScrollytellingBackground: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const stage1Ref = useRef<HTMLDivElement | null>(null);
  const stage2Ref = useRef<HTMLDivElement | null>(null);
  const stage3Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getMaxOpacity = () => (window.innerWidth < 768 ? 0.2 : 0.36);

    if (reducedMotion) {
      const maxOp = getMaxOpacity();
      if (stage1Ref.current) {
        stage1Ref.current.style.opacity = '0';
        stage1Ref.current.style.transform = 'scale(1)';
      }
      if (stage2Ref.current) {
        stage2Ref.current.style.opacity = '0';
        stage2Ref.current.style.transform = 'scale(1)';
      }
      if (stage3Ref.current) {
        stage3Ref.current.style.opacity = String(maxOp);
        stage3Ref.current.style.transform = 'scale(1)';
      }
      return;
    }

    let rafId = 0;

    const updateFrame = () => {
      rafId = 0;
      const docEl = document.documentElement;
      const maxScroll = Math.max(1, docEl.scrollHeight - window.innerHeight);
      const p = clamp(window.scrollY / maxScroll, 0, 1);
      const maxOp = getMaxOpacity();

      // Continuous crossfade weights across 0.0 -> 1.0:
      // Stage 1: 0.00 - 0.35 (fades out 0.30 -> 0.42)
      const w1 = 1 - smoothstep(0.3, 0.42, p);

      // Stage 2: 0.30 - 0.70 (fades in 0.28 -> 0.40, fades out 0.65 -> 0.76)
      const w2In = smoothstep(0.28, 0.4, p);
      const w2Out = 1 - smoothstep(0.65, 0.76, p);
      const w2 = w2In * w2Out;

      // Stage 3: 0.65 - 1.00 (fades in 0.64 -> 0.76)
      const w3 = smoothstep(0.64, 0.76, p);

      if (stage1Ref.current) {
        const s1 = 1 + p * 0.04;
        stage1Ref.current.style.opacity = (w1 * maxOp).toFixed(4);
        stage1Ref.current.style.transform = `translate3d(0, 0, 0) scale(${s1.toFixed(4)})`;
      }

      if (stage2Ref.current) {
        const s2 = 0.985 + clamp((p - 0.28) / 0.48, 0, 1) * 0.035;
        stage2Ref.current.style.opacity = (w2 * maxOp).toFixed(4);
        stage2Ref.current.style.transform = `translate3d(0, 0, 0) scale(${s2.toFixed(4)})`;
      }

      if (stage3Ref.current) {
        const s3 = 0.985 + clamp((p - 0.64) / 0.36, 0, 1) * 0.03;
        stage3Ref.current.style.opacity = (w3 * maxOp).toFixed(4);
        stage3Ref.current.style.transform = `translate3d(0, 0, 0) scale(${s3.toFixed(4)})`;
      }
    };

    const scheduleUpdate = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateFrame);
      }
    };

    // Initial paint
    updateFrame();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F6F6F6] flex items-center justify-center"
    >
      <style>{`
        @keyframes labsBgInterference {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 1; }
          23% { transform: translate3d(0.7px, -0.3px, 0); opacity: 0.95; }
          25% { transform: translate3d(-0.8px, 0.2px, 0); opacity: 0.9; }
          27% { transform: translate3d(0, 0, 0); opacity: 1; }
          66% { transform: translate3d(-0.6px, -0.2px, 0); opacity: 0.96; }
          68% { transform: translate3d(0.7px, 0.3px, 0); opacity: 0.91; }
          70% { transform: translate3d(0, 0, 0); opacity: 1; }
        }
        .labs-bg-stage1-motion {
          animation: labsBgInterference 4.8s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .labs-bg-stage1-motion {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      {/* Stage 1: Wireframe lightbulb (0.0 -> 0.35) */}
      <div
        ref={stage1Ref}
        className="absolute inset-0 flex items-center justify-center p-4 sm:p-10"
        style={{ opacity: reducedMotion ? 0 : 0.36, willChange: 'opacity, transform' }}
      >
        <img
          src="/images/labs/etapa-1-wireframe-lamparita.svg"
          alt=""
          className={`w-full h-full max-w-[1320px] object-contain select-none ${
            reducedMotion ? '' : 'labs-bg-stage1-motion'
          }`}
        />
      </div>

      {/* Stage 2: Red rays & modular connections (0.30 -> 0.70) */}
      <div
        ref={stage2Ref}
        className="absolute inset-0 flex items-center justify-center p-4 sm:p-10"
        style={{ opacity: 0, willChange: 'opacity, transform' }}
      >
        <img
          src="/images/labs/etapa-2-rayos-conexiones.svg"
          alt=""
          className="w-full h-full max-w-[1320px] object-contain select-none"
        />
      </div>

      {/* Stage 3: Consolidated multidevice prototype (0.65 -> 1.0) */}
      <div
        ref={stage3Ref}
        className="absolute inset-0 flex items-center justify-center p-4 sm:p-10"
        style={{ opacity: reducedMotion ? 0.32 : 0, willChange: 'opacity, transform' }}
      >
        <img
          src="/images/labs/etapa-3-prototipo-multidevice.svg"
          alt=""
          className="w-full h-full max-w-[1320px] object-contain select-none"
        />
      </div>
    </div>
  );
};
