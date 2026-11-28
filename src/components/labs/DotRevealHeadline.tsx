import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

export interface DotRevealLineSpec {
  text: string;
  accent?: boolean;
}

interface DotRevealHeadlineProps {
  lines: DotRevealLineSpec[];
  accessibleHeading: string;
  className?: string;
}

interface SampledDot {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  phase: number;
}

interface LineRasterData {
  width: number;
  height: number;
  padY: number;
  totalH: number;
  dpr: number;
  cellSize: number;
  fontSize: number;
  dots: SampledDot[];
}

const STAGGER_SEC = 0.16;
const STANDARD_DURATION_SEC = 1.25;
const COMPACT_DURATION_SEC = 0.9;
const START_RGB: [number, number, number] = [46, 43, 51];

function clamp(v: number, min = 0, max = 1): number {
  return v < min ? min : v > max ? max : v;
}

function power1InOut(t: number): number {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

function createSeededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseRgbString(colorStr: string): [number, number, number] {
  const match = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (match) {
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  return [1, 1, 1];
}

export const DotRevealHeadline: React.FC<DotRevealHeadlineProps> = ({
  lines,
  accessibleHeading,
  className = '',
}) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const liveSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const ghostSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rastersRef = useRef<(LineRasterData | null)[]>([]);
  const lastMeasuredSizesRef = useRef<{ w: number; h: number }[]>([]);

  // Capability & preference states
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [isCoarseNoHover, setIsCoarseNoHover] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(pointer: coarse) and (hover: none)').matches
      : false
  );
  const [isSmallFont, setIsSmallFont] = useState<boolean>(false);

  // Playback UI state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Mutable animation clock refs (no React re-render per frame)
  const rafIdRef = useRef<number>(0);
  const hasTriggeredRef = useRef<boolean>(false);
  const isVisibleRef = useRef<boolean>(false);
  const isDocHiddenRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const elapsedSecRef = useRef<number>(0);
  const lastTickMsRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const useFallbackRef = useRef<boolean>(false);
  const durationRef = useRef<number>(STANDARD_DURATION_SEC);

  const totalSequenceDuration = useCallback(() => {
    return Math.max(0, lines.length - 1) * STAGGER_SEC + durationRef.current;
  }, [lines.length]);

  const stopLoop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
    isRunningRef.current = false;
  }, []);

  // Render a single frame at current elapsedSecRef.current without altering progress
  const renderAtCurrentElapsed = useCallback(() => {
    const elapsed = elapsedSecRef.current;
    const duration = durationRef.current;
    const fallback = useFallbackRef.current;

    for (let i = 0; i < lines.length; i++) {
      const liveEl = liveSpanRefs.current[i];
      const canvas = canvasRefs.current[i];
      const ghostEl = ghostSpanRefs.current[i];
      const raster = rastersRef.current[i];

      if (reducedMotion) {
        if (liveEl) {
          liveEl.style.clipPath = 'none';
          liveEl.style.opacity = '1';
        }
        if (ghostEl) {
          ghostEl.style.opacity = '0';
        }
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
          }
        }
        continue;
      }

      const localTime = elapsed - i * STAGGER_SEC;
      const rawT = clamp(localTime / duration, 0, 1);
      const p = power1InOut(rawT);

      // Solid live-type clip in the last quarter (or across full duration on coarse/small-font fallback)
      const q = fallback ? p : clamp((p - 0.74) / 0.24, 0, 1);

      if (liveEl) {
        if (q >= 1) {
          liveEl.style.clipPath = 'none';
          liveEl.style.opacity = '1';
        } else if (q <= 0) {
          liveEl.style.clipPath = 'polygon(0% -15%, 0% -15%, -18% 115%, 0% 115%)';
          liveEl.style.opacity = '1';
        } else {
          const topX = (118 * q).toFixed(2);
          const botX = (118 * q - 18).toFixed(2);
          liveEl.style.clipPath = `polygon(0% -15%, ${topX}% -15%, ${botX}% 115%, 0% 115%)`;
          liveEl.style.opacity = '1';
        }
      }

      if (ghostEl) {
        ghostEl.style.opacity = fallback && q < 1 ? '0.3' : '0';
      }

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        if (!fallback && raster && raster.dots.length > 0 && p > 0 && q < 1) {
          const { width: W, totalH, dpr, cellSize, dots } = raster;
          const minR = cellSize * 0.086;
          const maxR = cellSize * 0.179;
          const arrivalBase = Math.min(p / 0.68, 1);

          ctx.save();
          ctx.scale(dpr, dpr);

          for (let d = 0; d < dots.length; d++) {
            const dot = dots[d];
            const arrival = clamp((arrivalBase - dot.phase) / 0.1, 0, 1);
            if (arrival <= 0.001) continue;

            const front = -12 + q * (1.18 * W + 12) - 0.18 * W * (dot.y / totalH);
            const gate = clamp((dot.x - front) / 10, 0, 1);
            const alpha = arrival * gate;
            if (alpha <= 0.001) continue;

            const radius = minR + (maxR - minR) * arrival;
            const mix = Math.min(1, 0.3 + 0.7 * arrival);
            const mr = Math.round(START_RGB[0] + (dot.r - START_RGB[0]) * mix);
            const mg = Math.round(START_RGB[1] + (dot.g - START_RGB[1]) * mix);
            const mb = Math.round(START_RGB[2] + (dot.b - START_RGB[2]) * mix);

            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgb(${mr},${mg},${mb})`;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
          ctx.globalAlpha = 1;
        }
      }
    }
  }, [lines.length, reducedMotion]);

  const startLoop = useCallback(() => {
    if (reducedMotion || isPausedRef.current || !isVisibleRef.current || isDocHiddenRef.current) {
      return;
    }
    const totalDur = totalSequenceDuration();
    if (elapsedSecRef.current >= totalDur) {
      renderAtCurrentElapsed();
      setIsComplete(true);
      return;
    }

    stopLoop();
    isRunningRef.current = true;
    lastTickMsRef.current = performance.now();

    const tick = (nowMs: number) => {
      if (!isRunningRef.current) return;
      const dt = Math.min(0.05, Math.max(0, (nowMs - lastTickMsRef.current) / 1000));
      lastTickMsRef.current = nowMs;
      elapsedSecRef.current = Math.min(totalDur, elapsedSecRef.current + dt);

      renderAtCurrentElapsed();

      if (elapsedSecRef.current >= totalDur) {
        stopLoop();
        setIsComplete(true);
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [reducedMotion, renderAtCurrentElapsed, stopLoop, totalSequenceDuration]);

  // Measure every glyph via DOM Range and rasterize into offscreen canvas
  const rebuildRasters = useCallback(
    (force = false) => {
      if (typeof window === 'undefined') return;

      let detectedSmallFont = false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      for (let i = 0; i < lines.length; i++) {
        const liveEl = liveSpanRefs.current[i];
        const canvas = canvasRefs.current[i];
        if (!liveEl || !canvas) continue;

        const lineRect = liveEl.getBoundingClientRect();
        const W = Math.ceil(lineRect.width);
        const H = Math.ceil(lineRect.height);
        if (W <= 0 || H <= 0) continue;

        const computed = window.getComputedStyle(liveEl);
        const fontSize = parseFloat(computed.fontSize) || 64;
        if (fontSize < 64) {
          detectedSmallFont = true;
        }

        const prevSize = lastMeasuredSizesRef.current[i];
        if (!force && prevSize && Math.abs(prevSize.w - W) < 1 && Math.abs(prevSize.h - H) < 1) {
          continue;
        }
        lastMeasuredSizesRef.current[i] = { w: W, h: H };

        const padY = Math.ceil(H * 0.18);
        const totalH = H + padY * 2;
        const cellSize = Math.max(2.4, fontSize / 44);

        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(totalH * dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${totalH}px`;
        canvas.style.top = `${-padY}px`;

        const fallbackNow = isCoarseNoHover || fontSize < 64 || reducedMotion;
        if (fallbackNow) {
          rastersRef.current[i] = {
            width: W,
            height: H,
            padY,
            totalH,
            dpr,
            cellSize,
            fontSize,
            dots: [],
          };
          continue;
        }

        // Offscreen rasterization using DOM Range glyph measurements
        const offscreen = document.createElement('canvas');
        offscreen.width = Math.round(W * dpr);
        offscreen.height = Math.round(totalH * dpr);
        const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
        if (!offCtx) continue;

        offCtx.scale(dpr, dpr);
        offCtx.clearRect(0, 0, W, totalH);
        offCtx.font = `${computed.fontWeight} ${fontSize}px ${computed.fontFamily}`;
        offCtx.fillStyle = computed.color;
        offCtx.textBaseline = 'alphabetic';

        const fallbackRgb = parseRgbString(computed.color);
        const fontMetrics = offCtx.measureText('Mg');
        const ascent = fontMetrics.fontBoundingBoxAscent ?? fontMetrics.actualBoundingBoxAscent ?? fontSize * 0.82;
        const descent = fontMetrics.fontBoundingBoxDescent ?? fontMetrics.actualBoundingBoxDescent ?? fontSize * 0.18;

        const textNode = liveEl.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const content = textNode.textContent || '';
          const range = document.createRange();
          for (let c = 0; c < content.length; c++) {
            const ch = content[c];
            if (ch === ' ') continue;
            range.setStart(textNode, c);
            range.setEnd(textNode, c + 1);
            const gRect = range.getBoundingClientRect();
            const gx = gRect.left - lineRect.left;
            const gyTop = gRect.top - lineRect.top;
            const halfLeading = (gRect.height - (ascent + descent)) / 2;
            const baselineY = padY + gyTop + halfLeading + ascent;
            offCtx.fillText(ch, gx, baselineY);
          }
        } else {
          const halfLeading = (H - (ascent + descent)) / 2;
          offCtx.fillText(lines[i].text, 0, padY + halfLeading + ascent);
        }

        const imgData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;
        const rng = createSeededRng(82706 + i * 9973);
        const dots: SampledDot[] = [];

        for (let y = cellSize * 0.5; y < totalH; y += cellSize) {
          for (let x = cellSize * 0.5; x < W; x += cellSize) {
            const px = Math.min(offscreen.width - 1, Math.round(x * dpr));
            const py = Math.min(offscreen.height - 1, Math.round(y * dpr));
            const idx = (py * offscreen.width + px) * 4;
            const alpha = imgData[idx + 3];
            if (alpha > 128) {
              const phase =
                ((x + 0.18 * W * (y / totalH)) / (1.18 * W)) * 0.8 + 0.1 * rng();
              dots.push({
                x,
                y,
                r: imgData[idx] ?? fallbackRgb[0],
                g: imgData[idx + 1] ?? fallbackRgb[1],
                b: imgData[idx + 2] ?? fallbackRgb[2],
                phase,
              });
            }
          }
        }

        rastersRef.current[i] = {
          width: W,
          height: H,
          padY,
          totalH,
          dpr,
          cellSize,
          fontSize,
          dots,
        };
      }

      setIsSmallFont(detectedSmallFont);
      useFallbackRef.current = isCoarseNoHover || detectedSmallFont;
      durationRef.current = detectedSmallFont ? COMPACT_DURATION_SEC : STANDARD_DURATION_SEC;

      // Redraw current frame at preserved progress without restarting
      renderAtCurrentElapsed();
    },
    [isCoarseNoHover, lines, reducedMotion, renderAtCurrentElapsed]
  );

  // Watch media queries (prefers-reduced-motion & coarse non-hover pointer)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarseQuery = window.matchMedia('(pointer: coarse) and (hover: none)');

    const onRmChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const onCoarseChange = (e: MediaQueryListEvent) => setIsCoarseNoHover(e.matches);

    rmQuery.addEventListener('change', onRmChange);
    coarseQuery.addEventListener('change', onCoarseChange);

    return () => {
      rmQuery.removeEventListener('change', onRmChange);
      coarseQuery.removeEventListener('change', onCoarseChange);
    };
  }, []);

  // Await local fonts, then measure/rasterize and observe real element resize
  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        if ('fonts' in document) {
          await document.fonts.load('400 72px Anton');
          await document.fonts.ready;
        }
      } catch {
        // Proceed with measured layout if font API rejects
      }
      if (!active) return;

      rebuildRasters(true);

      if (reducedMotion) {
        elapsedSecRef.current = totalSequenceDuration();
        renderAtCurrentElapsed();
        setIsComplete(true);
      } else if (isVisibleRef.current && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        startLoop();
      }
    };

    init();

    const resizeObserver = new ResizeObserver(() => {
      if (!active) return;
      rebuildRasters(false);
    });

    if (sectionRef.current) {
      resizeObserver.observe(sectionRef.current);
    }

    return () => {
      active = false;
      resizeObserver.disconnect();
    };
  }, [rebuildRasters, reducedMotion, renderAtCurrentElapsed, startLoop, totalSequenceDuration]);

  // IntersectionObserver (threshold 0.15) — one-shot entrance + pause offscreen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const nowVisible = entry.isIntersecting;
        isVisibleRef.current = nowVisible;

        if (nowVisible) {
          if (reducedMotion) {
            elapsedSecRef.current = totalSequenceDuration();
            renderAtCurrentElapsed();
            setIsComplete(true);
            return;
          }
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            elapsedSecRef.current = 0;
            startLoop();
          } else if (!isPausedRef.current && elapsedSecRef.current < totalSequenceDuration()) {
            startLoop();
          }
        } else {
          // Stop RAF when offscreen without destroying rasters
          stopLoop();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [reducedMotion, renderAtCurrentElapsed, startLoop, stopLoop, totalSequenceDuration]);

  // Pause frames when tab is hidden, resume when visible again
  useEffect(() => {
    const onVisibility = () => {
      isDocHiddenRef.current = document.hidden;
      if (document.hidden) {
        stopLoop();
      } else if (
        isVisibleRef.current &&
        !isPausedRef.current &&
        !reducedMotion &&
        hasTriggeredRef.current &&
        elapsedSecRef.current < totalSequenceDuration()
      ) {
        startLoop();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stopLoop();
    };
  }, [reducedMotion, startLoop, stopLoop, totalSequenceDuration]);

  // Control handlers
  const handleReplay = useCallback(() => {
    if (reducedMotion) return;
    stopLoop();
    hasTriggeredRef.current = true;
    isPausedRef.current = false;
    setIsPaused(false);
    setIsComplete(false);
    elapsedSecRef.current = 0;
    renderAtCurrentElapsed();
    startLoop();
  }, [reducedMotion, renderAtCurrentElapsed, startLoop, stopLoop]);

  const handleTogglePause = useCallback(() => {
    if (reducedMotion) return;
    if (isPausedRef.current) {
      isPausedRef.current = false;
      setIsPaused(false);
      startLoop();
    } else {
      isPausedRef.current = true;
      setIsPaused(true);
      stopLoop();
    }
  }, [reducedMotion, startLoop, stopLoop]);

  const handleReset = useCallback(() => {
    stopLoop();
    hasTriggeredRef.current = true;
    isPausedRef.current = false;
    setIsPaused(false);
    elapsedSecRef.current = totalSequenceDuration();
    renderAtCurrentElapsed();
    setIsComplete(true);
  }, [renderAtCurrentElapsed, stopLoop, totalSequenceDuration]);

  // Keyboard shortcut: R to replay outside form controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== 'r' && e.key !== 'R') return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.isContentEditable)
      ) {
        return;
      }
      handleReplay();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handleReplay]);

  const showFallbackGhost = !reducedMotion && (isCoarseNoHover || isSmallFont);

  return (
    <div ref={sectionRef} className={`w-full ${className}`}>
      {/* Accessible single-sentence H1; visual lines are aria-hidden */}
      <h1 className="m-0 p-0">
        <span className="sr-only">{accessibleHeading}</span>
        <span className="flex flex-col items-start gap-1 sm:gap-1.5" aria-hidden="true">
          {lines.map((line, idx) => (
            <span
              key={line.text}
              className="relative inline-block max-w-full"
              style={{ lineHeight: 0.94 }}
            >
              {/* Mobile/coarse-pointer low-opacity ghost */}
              <span
                ref={(el) => {
                  ghostSpanRefs.current[idx] = el;
                }}
                aria-hidden="true"
                className={`pointer-events-none select-none absolute inset-0 font-anton tracking-[0.01em] whitespace-nowrap ${
                  line.accent ? 'text-[#cc0000]' : 'text-[#010101]'
                }`}
                style={{
                  fontSize: 'clamp(3.25rem, 11vw, 7.75rem)',
                  lineHeight: 0.94,
                  opacity: showFallbackGhost ? 0.3 : 0,
                }}
              >
                {line.text}
              </span>

              {/* Live selectable solid typography */}
              <span
                ref={(el) => {
                  liveSpanRefs.current[idx] = el;
                }}
                aria-hidden="true"
                className={`relative block font-anton tracking-[0.01em] whitespace-nowrap select-text ${
                  line.accent ? 'text-[#cc0000]' : 'text-[#010101]'
                }`}
                style={{
                  fontSize: 'clamp(3.25rem, 11vw, 7.75rem)',
                  lineHeight: 0.94,
                  clipPath: reducedMotion
                    ? 'none'
                    : 'polygon(0% -15%, 0% -15%, -18% 115%, 0% 115%)',
                  willChange: 'clip-path',
                }}
              >
                {line.text}
              </span>

              {/* Identically measured canvas overlay padded vertically by 18% */}
              <canvas
                ref={(el) => {
                  canvasRefs.current[idx] = el;
                }}
                aria-hidden="true"
                className={`pointer-events-none absolute left-0 block ${
                  reducedMotion || isCoarseNoHover || isSmallFont ? 'hidden' : ''
                }`}
              />
            </span>
          ))}
        </span>
      </h1>

      {/* Quiet rule + semantic external controls (44px min touch targets) */}
      {!reducedMotion && (
        <div
          className="mt-6 pt-4 border-t border-[#e0ddd6] flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Controles de animación del titular"
        >
          <button
            type="button"
            onClick={handleReplay}
            className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg bg-white hover:bg-[#010101] text-[#010101] hover:text-white border border-[#dedbd3] hover:border-[#010101] text-[11px] font-medium uppercase tracking-[0.12em] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cc0000] focus-visible:ring-offset-2"
            aria-label="Repetir animación tipográfica (tecla R)"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Replay</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePause}
            disabled={isComplete && !isPaused}
            className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg bg-white hover:bg-[#010101] text-[#010101] hover:text-white border border-[#dedbd3] hover:border-[#010101] disabled:opacity-45 disabled:cursor-not-allowed text-[11px] font-medium uppercase tracking-[0.12em] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cc0000] focus-visible:ring-offset-2"
            aria-label={isPaused ? 'Reanudar animación' : 'Pausar animación'}
            aria-pressed={isPaused}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reanudar</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pausa</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg bg-white hover:bg-[#010101] text-[#010101] hover:text-white border border-[#dedbd3] hover:border-[#010101] text-[11px] font-medium uppercase tracking-[0.12em] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cc0000] focus-visible:ring-offset-2"
            aria-label="Mostrar titular completo inmediatamente"
          >
            <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      )}
    </div>
  );
};
