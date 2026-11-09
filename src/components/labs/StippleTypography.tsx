import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Play, Pause, Sparkles, Layers, Sliders, CheckCircle2 } from 'lucide-react';

interface StippleTypographyProps {
  lines?: string[];
  onStatsChange?: (stats: { pointsCount: number; glyphsCount: number; cellSize: number }) => void;
  className?: string;
}

interface StipplePoint {
  x: number;
  y: number;
  originX: number;
  originY: number;
  scatterX: number;
  scatterY: number;
  lineIndex: number;
  phase: number;
  speed: number;
  size: number;
  color: string;
  isAccent: boolean;
}

interface MeasuredGlyph {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lineIndex: number;
}

interface LineMetrics {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
  lineIndex: number;
}

// Deterministic PRNG: Mulberry32
function createMulberry32(seed: number = 0x2026beef) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// GSAP-style power1.inOut (quadratic ease in-out)
function power1InOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export const StippleTypography: React.FC<StippleTypographyProps> = ({
  lines = ['ALICARI', 'LABS', 'RUNWAY // 2026'],
  onStatsChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const measurerRef = useRef<HTMLDivElement | null>(null);
  const liveTextContainerRef = useRef<HTMLDivElement | null>(null);

  // Animation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'animated' | 'stipple' | 'solid'>('animated');
  const [isFontReady, setIsFontReady] = useState<boolean>(false);
  const [pointsCount, setPointsCount] = useState<number>(0);
  const [glyphsCount, setGlyphsCount] = useState<number>(0);
  const [cellSizeVal, setCellSizeVal] = useState<number>(2.4);
  const [fps, setFps] = useState<number>(60);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Dynamic clip-paths for live text
  const [clipPolygons, setClipPolygons] = useState<string[]>(lines.map(() => 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'));
  const [textOpacities, setTextOpacities] = useState<number[]>(lines.map(() => 0));

  // Mutable refs for RAF loop
  const pointsRef = useRef<StipplePoint[]>([]);
  const lineMetricsRef = useRef<LineMetrics[]>([]);
  const animStartTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);
  const isAnimationFinishedRef = useRef<boolean>(false);
  const dimensionsRef = useRef<{ width: number; height: number; dpr: number }>({ width: 0, height: 0, dpr: 1 });

  // 1. Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 2. Wait for fonts to be ready
  useEffect(() => {
    let isMounted = true;
    const loadFont = async () => {
      try {
        if ('fonts' in document) {
          await document.fonts.ready;
          // Preload Anton specifically
          await document.fonts.load('64px Anton');
        }
      } catch (err) {
        console.warn('Font loading check error, fallback active:', err);
      } finally {
        if (isMounted) {
          setIsFontReady(true);
        }
      }
    };
    loadFont();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Measuring and Point Generation Engine
  const sampleTypography = useCallback(() => {
    if (!containerRef.current || !measurerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = Math.max(300, Math.floor(rect.width));
    const height = Math.max(160, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    dimensionsRef.current = { width, height, dpr };

    const canvas = canvasRef.current;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Measure with DOM Range
    const lineElements = Array.from(measurerRef.current.children) as HTMLElement[];
    const measuredGlyphs: MeasuredGlyph[] = [];
    const lineMetricsList: LineMetrics[] = [];

    const containerBox = measurerRef.current.getBoundingClientRect();

    lineElements.forEach((lineEl, lineIdx) => {
      const lineBox = lineEl.getBoundingClientRect();
      const lineMetric: LineMetrics = {
        top: lineBox.top - containerBox.top,
        bottom: lineBox.bottom - containerBox.top,
        left: lineBox.left - containerBox.left,
        right: lineBox.right - containerBox.left,
        width: lineBox.width,
        height: lineBox.height,
        lineIndex: lineIdx,
      };
      lineMetricsList.push(lineMetric);

      const textNode = lineEl.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const textContent = textNode.textContent || '';
        for (let i = 0; i < textContent.length; i++) {
          if (textContent[i] === ' ') continue;
          try {
            const range = document.createRange();
            range.setStart(textNode, i);
            range.setEnd(textNode, i + 1);
            const glyphBox = range.getBoundingClientRect();
            measuredGlyphs.push({
              char: textContent[i],
              x: glyphBox.left - containerBox.left,
              y: glyphBox.top - containerBox.top,
              width: glyphBox.width,
              height: glyphBox.height,
              lineIndex: lineIdx,
            });
          } catch {
            // Safe fallback
          }
        }
      }
    });

    lineMetricsRef.current = lineMetricsList;
    setGlyphsCount(measuredGlyphs.length);

    // Offscreen Canvas Rendering & Sampling
    const offscreen = document.createElement('canvas');
    offscreen.width = Math.round(width * dpr);
    offscreen.height = Math.round(height * dpr);
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    offCtx.scale(dpr, dpr);
    offCtx.clearRect(0, 0, width, height);

    // Compute font size from first line element
    const computedStyle = window.getComputedStyle(lineElements[0] || measurerRef.current);
    const fontSize = parseFloat(computedStyle.fontSize) || 64;
    const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.1;

    // Strict technical parameters from spec:
    // Cell size: max(2.4, fontSize / 44)
    const cellSize = Math.max(2.4, fontSize / 44);
    setCellSizeVal(Number(cellSize.toFixed(2)));

    // Vertical padding: 18% of line height
    const verticalPadding = 0.18 * lineHeight;

    // Render exact glyphs to offscreen canvas
    offCtx.fillStyle = '#ffffff';
    offCtx.font = `${computedStyle.fontWeight} ${fontSize}px 'Anton', -apple-system, sans-serif`;
    offCtx.textBaseline = 'top';

    lineElements.forEach((lineEl, idx) => {
      const lineMetric = lineMetricsList[idx];
      if (!lineMetric) return;
      const text = lineEl.textContent || '';
      // Draw text at exact line position
      offCtx.fillText(text, lineMetric.left, lineMetric.top);
    });

    // Sample pixels retaining cells whose alpha > 128
    const imgData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
    const pixels = imgData.data;
    const prng = createMulberry32(0x20261109);

    const generatedPoints: StipplePoint[] = [];

    lineMetricsList.forEach((metric) => {
      const sampleTop = Math.max(0, metric.top - verticalPadding);
      const sampleBottom = Math.min(height, metric.bottom + verticalPadding);
      const sampleLeft = Math.max(0, metric.left - 2);
      const sampleRight = Math.min(width, metric.right + 2);

      for (let y = sampleTop; y <= sampleBottom; y += cellSize) {
        for (let x = sampleLeft; x <= sampleRight; x += cellSize) {
          const px = Math.round(x * dpr);
          const py = Math.round(y * dpr);
          if (px < 0 || px >= offscreen.width || py < 0 || py >= offscreen.height) continue;

          const idx = (py * offscreen.width + px) * 4;
          const alpha = pixels[idx + 3];

          // Retain cells whose glyph alpha > 128
          if (alpha > 128) {
            const r1 = prng();
            const r2 = prng();
            const r3 = prng();
            const r4 = prng();

            // Deterministic scatter and phase offset
            const scatterDist = (0.5 - r1) * (fontSize * 0.95);
            const scatterAngle = r2 * Math.PI * 2;
            const isAccent = r3 > 0.94; // 6% signature brand red glint accents

            generatedPoints.push({
              x: x,
              y: y,
              originX: x,
              originY: y,
              scatterX: Math.cos(scatterAngle) * scatterDist,
              scatterY: Math.sin(scatterAngle) * (scatterDist * 0.6),
              lineIndex: metric.lineIndex,
              phase: r4 * Math.PI * 2,
              speed: 0.8 + r1 * 0.6,
              size: cellSize * 0.45,
              color: isAccent ? '#cc0000' : '#f6f6f6',
              isAccent,
            });
          }
        }
      }
    });

    pointsRef.current = generatedPoints;
    setPointsCount(generatedPoints.length);

    if (onStatsChange) {
      onStatsChange({
        pointsCount: generatedPoints.length,
        glyphsCount: measuredGlyphs.length,
        cellSize: Number(cellSize.toFixed(2)),
      });
    }

    // Reset animation timers
    animStartTimeRef.current = performance.now();
    isAnimationFinishedRef.current = false;
  }, [onStatsChange]);

  // Trigger measurement when font is ready or on window resize
  useEffect(() => {
    if (!isFontReady) return;

    sampleTypography();

    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        sampleTypography();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [isFontReady, sampleTypography]);

  // 4. Main Canvas & RAF Render Loop
  useEffect(() => {
    if (!canvasRef.current || !isFontReady) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const ENTRANCE_DURATION = 1.25; // 1.25s per line as requested
    const STAGGER_DELAY = 0.16; // 0.16s stagger between lines

    const render = (now: number) => {
      frameCount++;
      if (now - fpsTimer >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - fpsTimer)));
        frameCount = 0;
        fpsTimer = now;
      }

      const { width, height, dpr } = dimensionsRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (reducedMotion || viewMode === 'solid') {
        // Direct solid text fallback
        setTextOpacities(lines.map(() => 1));
        setClipPolygons(lines.map(() => 'none'));
        return;
      }

      const points = pointsRef.current;
      const lineMetrics = lineMetricsRef.current;
      const elapsedSeconds = isPlaying ? (now - animStartTimeRef.current) / 1000 : (pausedTimeRef.current - animStartTimeRef.current) / 1000;

      // Track per-line progress
      const currentClips: string[] = [];
      const currentOpacities: number[] = [];
      let allLinesCompleted = true;

      for (let lIdx = 0; lIdx < lines.length; lIdx++) {
        const lineStart = lIdx * STAGGER_DELAY;
        const lineElapsed = Math.max(0, elapsedSeconds - lineStart);
        const lineProgress = Math.min(1, lineElapsed / ENTRANCE_DURATION);

        if (lineProgress < 1) {
          allLinesCompleted = false;
        }

        if (viewMode === 'stipple') {
          // Continuous ambient stipple loop without solid snap
          currentOpacities.push(0);
          currentClips.push('polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)');
        } else {
          // Last quarter solid transition (progress >= 0.75)
          if (lineProgress >= 0.75) {
            const quarterT = (lineProgress - 0.75) / 0.25; // 0 -> 1
            const easedQuarter = power1InOut(quarterT);

            // Diagonal clip polygon: sweep from left to right with diagonal slope
            // At 0%: 0. At 100%: 100%
            const leadX = easedQuarter * 130 - 15;
            const tailX = leadX - 25;

            const p1 = Math.min(100, Math.max(0, leadX));
            const p2 = Math.min(100, Math.max(0, tailX));

            if (quarterT >= 0.99) {
              currentClips.push('none');
              currentOpacities.push(1);
            } else {
              currentClips.push(`polygon(0% 0%, ${p1}% 0%, ${p2}% 100%, 0% 100%)`);
              currentOpacities.push(1);
            }
          } else {
            currentClips.push('polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)');
            currentOpacities.push(0);
          }
        }
      }

      setClipPolygons(currentClips);
      setTextOpacities(currentOpacities);

      // Render Stipple Points
      ctx.save();
      ctx.scale(dpr, dpr);

      const totalPoints = points.length;
      for (let i = 0; i < totalPoints; i++) {
        const pt = points[i];
        const metric = lineMetrics[pt.lineIndex];
        const lineStart = pt.lineIndex * STAGGER_DELAY;
        const lineElapsed = Math.max(0, elapsedSeconds - lineStart);
        const rawProgress = Math.min(1, lineElapsed / ENTRANCE_DURATION);
        const easedProgress = power1InOut(rawProgress);

        // Position interpolation: scatter -> target
        const currentScatterFactor = 1 - easedProgress;
        const ambientPhase = now * 0.003 * pt.speed + pt.phase;
        const microJitterX = Math.sin(ambientPhase) * (0.4 * currentScatterFactor + 0.15);
        const microJitterY = Math.cos(ambientPhase * 1.3) * (0.4 * currentScatterFactor + 0.15);

        const curX = pt.originX + pt.scatterX * currentScatterFactor + microJitterX;
        const curY = pt.originY + pt.scatterY * currentScatterFactor + microJitterY;

        // Opacity and solid transition fade-out in last quarter
        let pointAlpha = 0.92;

        if (viewMode === 'animated') {
          if (rawProgress < 0.05) {
            pointAlpha = rawProgress / 0.05;
          } else if (rawProgress >= 0.75) {
            // Check if diagonal front has passed this point
            const quarterT = (rawProgress - 0.75) / 0.25;
            const metricWidth = metric ? metric.width : width;
            const metricLeft = metric ? metric.left : 0;
            const relX = (pt.originX - metricLeft) / Math.max(1, metricWidth);

            // Diagonal front position (normalized 0 to 1)
            const frontNormalized = quarterT * 1.25 - 0.1;

            if (relX <= frontNormalized) {
              // Fade out immediately as solid typography takes over
              const fadeDist = Math.max(0, 1 - (frontNormalized - relX) / 0.15);
              pointAlpha = fadeDist * 0.9;
            }
          }
        }

        if (pointAlpha > 0.01) {
          ctx.beginPath();
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pointAlpha;
          const currentRadius = pt.size * (0.85 + Math.sin(ambientPhase * 2) * 0.15);
          ctx.arc(curX, curY, Math.max(1.1, currentRadius), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      if (allLinesCompleted && viewMode === 'animated') {
        isAnimationFinishedRef.current = true;
      }

      // Continue animation loop
      rafIdRef.current = requestAnimationFrame(render);
    };

    rafIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [isFontReady, isPlaying, viewMode, lines, reducedMotion]);

  // Handlers for controls
  const handleReplay = () => {
    animStartTimeRef.current = performance.now();
    isAnimationFinishedRef.current = false;
    setIsPlaying(true);
    setTextOpacities(lines.map(() => 0));
    setClipPolygons(lines.map(() => 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'));
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      pausedTimeRef.current = performance.now();
      setIsPlaying(false);
    } else {
      const pauseDuration = performance.now() - pausedTimeRef.current;
      animStartTimeRef.current += pauseDuration;
      setIsPlaying(true);
    }
  };

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      {/* ── Visual Runway Grid & Coordinates Background ───────────────── */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
              linear-gradient(to right, rgba(204,0,0,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px, 128px 128px, 64px 64px',
          }}
        />
      </div>

      {/* ── Telemetry Strip / Top Technical Specs ───────────────────────── */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-white/10 bg-black/40 backdrop-blur-sm text-[11px] font-mono tracking-wider text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#cc0000] animate-pulse" />
          <span className="text-white font-semibold">SIGNAL // STIPPLE ENGINE</span>
          <span className="hidden sm:inline text-neutral-500">|</span>
          <span className="hidden sm:inline">DPR: {dimensionsRef.current.dpr}x</span>
          <span className="hidden md:inline text-neutral-500">|</span>
          <span className="hidden md:inline">CELL: {cellSizeVal}px</span>
        </div>

        <div className="flex items-center gap-4 text-neutral-300">
          <div>
            <span className="text-neutral-500">PTS:</span> <span className="text-white font-mono">{pointsCount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-neutral-500">GLYPHS:</span> <span className="text-white font-mono">{glyphsCount}</span>
          </div>
          <div>
            <span className="text-neutral-500">FPS:</span>{' '}
            <span className={`font-mono ${fps < 45 ? 'text-amber-400' : 'text-emerald-400'}`}>{fps}</span>
          </div>
        </div>
      </div>

      {/* ── Main Runway Typography Canvas & Live DOM Container ───────────── */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[280px] sm:min-h-[380px] md:min-h-[460px] flex items-center justify-center p-4 sm:p-8"
      >
        {/* Off-DOM Measurer (Measures glyphs accurately via DOM Range) */}
        <div
          ref={measurerRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center opacity-0 select-none z-[-1]"
        >
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="font-anton uppercase tracking-tight leading-[0.92] text-white"
              style={{
                fontSize: 'clamp(2.8rem, 9.5vw, 7.5rem)',
                letterSpacing: '-0.02em',
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Dynamic Canvas: Stipple particles rendered via offscreen sampling */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-10 w-full h-full block"
        />

        {/* Live DOM Text: Revealed with diagonal clip polygon in the last quarter */}
        <div
          ref={liveTextContainerRef}
          className="relative z-20 flex flex-col items-center justify-center text-center pointer-events-auto"
          aria-label={lines.join(' ')}
        >
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="font-anton uppercase tracking-tight leading-[0.92] text-white transition-opacity duration-150 select-text"
              style={{
                fontSize: 'clamp(2.8rem, 9.5vw, 7.5rem)',
                letterSpacing: '-0.02em',
                clipPath: clipPolygons[idx] || 'none',
                opacity: textOpacities[idx] ?? 1,
                willChange: 'clip-path, opacity',
                textShadow: '0 0 35px rgba(255,255,255,0.15)',
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* ── Accessible Controls Toolbar (Min 44px touch targets) ──────────── */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 p-4 border-t border-white/10 bg-black/60 backdrop-blur-md">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReplay}
            className="min-h-[44px] min-w-[44px] px-4 py-2 flex items-center justify-center gap-2 rounded-md bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-mono text-xs tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
            aria-label="Reiniciar animación tipográfica"
            title="Replay animation (Reiniciar animación)"
          >
            <RotateCcw className="w-4 h-4 text-[#cc0000]" />
            <span className="hidden sm:inline font-semibold">REPLAY</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className="min-h-[44px] min-w-[44px] px-4 py-2 flex items-center justify-center gap-2 rounded-md bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-mono text-xs tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
            aria-label={isPlaying ? 'Pausar animación' : 'Reanudar animación'}
            title={isPlaying ? 'Pausa' : 'Reproducir'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">PAUSA</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">PLAY</span>
              </>
            )}
          </button>
        </div>

        {/* View Mode Selectors */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-900 border border-white/10" role="group" aria-label="Modo de visualización">
          <button
            type="button"
            onClick={() => {
              setViewMode('animated');
              handleReplay();
            }}
            className={`min-h-[44px] px-3 py-2 flex items-center gap-1.5 rounded text-xs font-mono transition-all ${
              viewMode === 'animated'
                ? 'bg-[#cc0000] text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
            aria-pressed={viewMode === 'animated'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">TRANSICIÓN</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('stipple')}
            className={`min-h-[44px] px-3 py-2 flex items-center gap-1.5 rounded text-xs font-mono transition-all ${
              viewMode === 'stipple'
                ? 'bg-[#cc0000] text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
            aria-pressed={viewMode === 'stipple'}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">STIPPLE LOOP</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('solid')}
            className={`min-h-[44px] px-3 py-2 flex items-center gap-1.5 rounded text-xs font-mono transition-all ${
              viewMode === 'solid'
                ? 'bg-[#cc0000] text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
            aria-pressed={viewMode === 'solid'}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">TEXTO SÓLIDO</span>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-neutral-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>AUTÓNOMO DOM RANGE + OFFSCREEN</span>
        </div>
      </div>
    </div>
  );
};
