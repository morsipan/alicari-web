import React, { useEffect, useRef } from 'react';

function clamp(value: number, min = 0, max = 1): number {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export const ScrollytellingLabBackground: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Shared bulb & Phase 1 refs
  const constructionGridRef = useRef<SVGGElement | null>(null);
  const interferenceRef = useRef<SVGGElement | null>(null);
  const wireframeDoubleRef = useRef<SVGGElement | null>(null);
  const bulbGlassFillRef = useRef<SVGPathElement | null>(null);
  const filamentGraphiteRef = useRef<SVGGElement | null>(null);
  const filamentRedRef = useRef<SVGGElement | null>(null);

  // Phase 2 refs (ignition, rays, orthogonal connectors & modular blocks)
  const crimsonGlowRef = useRef<SVGCircleElement | null>(null);
  const crimsonRaysRef = useRef<SVGGElement | null>(null);
  const phase2GroupRef = useRef<SVGGElement | null>(null);
  const connectorsRef = useRef<SVGGElement | null>(null);
  const connectorNodesRef = useRef<SVGGElement | null>(null);
  const moduleRefs = useRef<(SVGGElement | null)[]>([]);

  // Phase 3 refs (bridge + multidevice wireframe assembly)
  const phase3GroupRef = useRef<SVGGElement | null>(null);
  const energyBridgeRef = useRef<SVGPathElement | null>(null);
  const bridgeDotRef = useRef<SVGCircleElement | null>(null);
  const desktopOutlineRef = useRef<SVGGElement | null>(null);
  const desktopUiRef = useRef<SVGGElement | null>(null);
  const mobileOutlineRef = useRef<SVGGElement | null>(null);
  const mobileUiRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mq.matches;

    let rafId = 0;

    const applyState = (p: number, isReduced: boolean) => {
      const isMobile = window.innerWidth < 768;
      if (wrapperRef.current) {
        wrapperRef.current.style.opacity = isMobile ? '0.18' : '0.32';
      }

      // If prefers-reduced-motion is enabled, show clean final static state (Phase 3)
      if (isReduced) {
        if (constructionGridRef.current) constructionGridRef.current.style.opacity = '0.06';
        if (interferenceRef.current) interferenceRef.current.style.opacity = '0';
        if (wireframeDoubleRef.current) wireframeDoubleRef.current.style.opacity = '0';
        if (bulbGlassFillRef.current) bulbGlassFillRef.current.style.opacity = '1';
        if (filamentGraphiteRef.current) filamentGraphiteRef.current.style.opacity = '0';
        if (filamentRedRef.current) filamentRedRef.current.style.opacity = '1';
        if (crimsonGlowRef.current) {
          crimsonGlowRef.current.style.opacity = '1';
          crimsonGlowRef.current.style.transform = 'scale(1)';
        }
        if (crimsonRaysRef.current) {
          crimsonRaysRef.current.style.opacity = '1';
          crimsonRaysRef.current.style.strokeDashoffset = '0';
        }
        if (phase2GroupRef.current) phase2GroupRef.current.style.opacity = '0';
        if (phase3GroupRef.current) phase3GroupRef.current.style.opacity = '1';
        if (energyBridgeRef.current) energyBridgeRef.current.style.strokeDashoffset = '0';
        if (bridgeDotRef.current) bridgeDotRef.current.style.opacity = '1';
        if (desktopOutlineRef.current) {
          desktopOutlineRef.current.style.opacity = '1';
          desktopOutlineRef.current.style.strokeDashoffset = '0';
          desktopOutlineRef.current.style.transform = 'translate3d(0,0,0)';
        }
        if (desktopUiRef.current) desktopUiRef.current.style.opacity = '1';
        if (mobileOutlineRef.current) {
          mobileOutlineRef.current.style.opacity = '1';
          mobileOutlineRef.current.style.strokeDashoffset = '0';
          mobileOutlineRef.current.style.transform = 'translate3d(0,0,0)';
        }
        if (mobileUiRef.current) mobileUiRef.current.style.opacity = '1';
        return;
      }

      // ── PHASE 1 (0.00 -> 0.34): Wireframe bulb + construction + subtle interference ──
      const ignite = smoothstep(0.18, 0.38, p);
      const gridOpacity = 0.24 - ignite * 0.16;
      if (constructionGridRef.current) {
        constructionGridRef.current.style.opacity = gridOpacity.toFixed(4);
        constructionGridRef.current.style.strokeDashoffset = (p * 120).toFixed(2);
      }
      if (interferenceRef.current) {
        const interfFade = 1 - smoothstep(0.16, 0.34, p);
        const microShift = Math.sin(p * 52) * 2.2 * interfFade;
        interferenceRef.current.style.opacity = interfFade.toFixed(4);
        interferenceRef.current.style.transform = `translate3d(${microShift.toFixed(2)}px, 0, 0)`;
      }
      if (wireframeDoubleRef.current) {
        wireframeDoubleRef.current.style.opacity = (1 - ignite).toFixed(4);
      }
      if (bulbGlassFillRef.current) {
        bulbGlassFillRef.current.style.opacity = ignite.toFixed(4);
      }
      if (filamentGraphiteRef.current) {
        filamentGraphiteRef.current.style.opacity = (1 - ignite).toFixed(4);
      }
      if (filamentRedRef.current) {
        filamentRedRef.current.style.opacity = ignite.toFixed(4);
      }

      // ── PHASE 2 (0.22 -> 0.72): Crimson glow, rays draw out, connectors & modules ──
      if (crimsonGlowRef.current) {
        const glowScale = 0.65 + ignite * 0.38 + smoothstep(0.65, 1, p) * 0.08;
        crimsonGlowRef.current.style.opacity = ignite.toFixed(4);
        crimsonGlowRef.current.style.transform = `scale(${glowScale.toFixed(4)})`;
      }
      if (crimsonRaysRef.current) {
        const raysDraw = smoothstep(0.22, 0.4, p);
        crimsonRaysRef.current.style.opacity = raysDraw.toFixed(4);
        crimsonRaysRef.current.style.strokeDashoffset = (1 - raysDraw).toFixed(4);
      }

      const p2In = smoothstep(0.28, 0.48, p);
      const p2Retract = smoothstep(0.62, 0.76, p);
      const p2Visible = p2In * (1 - p2Retract);

      if (phase2GroupRef.current) {
        phase2GroupRef.current.style.opacity = (1 - p2Retract).toFixed(4);
      }
      if (connectorsRef.current) {
        // Draw down (0.28 -> 0.48), then retract smoothly (0.62 -> 0.74)
        const connLen = p2In * (1 - smoothstep(0.6, 0.74, p));
        connectorsRef.current.style.strokeDashoffset = (1 - connLen).toFixed(4);
      }
      if (connectorNodesRef.current) {
        const nodeOp = smoothstep(0.4, 0.5, p) * (1 - p2Retract);
        connectorNodesRef.current.style.opacity = nodeOp.toFixed(4);
      }
      for (let i = 0; i < 4; i++) {
        const mod = moduleRefs.current[i];
        if (!mod) continue;
        const start = 0.39 + i * 0.032;
        const modEnter = smoothstep(start, start + 0.12, p);
        const modOp = modEnter * (1 - p2Retract);
        const modY = (1 - modEnter) * 18 - p2Retract * 12;
        mod.style.opacity = (p2Visible > 0 ? modOp : 0).toFixed(4);
        mod.style.transform = `translate3d(0, ${modY.toFixed(2)}px, 0)`;
      }

      // ── PHASE 3 (0.64 -> 1.00): Bridge draws & Multidevice wireframe assembles ──
      const p3Base = smoothstep(0.64, 0.74, p);
      if (phase3GroupRef.current) {
        phase3GroupRef.current.style.opacity = p3Base.toFixed(4);
      }
      if (energyBridgeRef.current) {
        const bridgeDraw = smoothstep(0.66, 0.79, p);
        energyBridgeRef.current.style.strokeDashoffset = (1 - bridgeDraw).toFixed(4);
      }
      if (bridgeDotRef.current) {
        bridgeDotRef.current.style.opacity = smoothstep(0.76, 0.82, p).toFixed(4);
      }
      if (desktopOutlineRef.current) {
        const deskDraw = smoothstep(0.71, 0.87, p);
        const deskY = (1 - deskDraw) * 14;
        desktopOutlineRef.current.style.opacity = smoothstep(0.7, 0.76, p).toFixed(4);
        desktopOutlineRef.current.style.strokeDashoffset = (1 - deskDraw).toFixed(4);
        desktopOutlineRef.current.style.transform = `translate3d(0, ${deskY.toFixed(2)}px, 0)`;
      }
      if (desktopUiRef.current) {
        desktopUiRef.current.style.opacity = smoothstep(0.81, 0.93, p).toFixed(4);
      }
      if (mobileOutlineRef.current) {
        const mobDraw = smoothstep(0.8, 0.94, p);
        const mobY = (1 - mobDraw) * 20;
        mobileOutlineRef.current.style.opacity = smoothstep(0.79, 0.85, p).toFixed(4);
        mobileOutlineRef.current.style.strokeDashoffset = (1 - mobDraw).toFixed(4);
        mobileOutlineRef.current.style.transform = `translate3d(0, ${mobY.toFixed(2)}px, 0)`;
      }
      if (mobileUiRef.current) {
        mobileUiRef.current.style.opacity = smoothstep(0.88, 0.99, p).toFixed(4);
      }
    };

    const updateFrame = () => {
      rafId = 0;
      const docEl = document.documentElement;
      const maxScroll = Math.max(1, docEl.scrollHeight - window.innerHeight);
      const progress = clamp(window.scrollY / maxScroll, 0, 1);
      applyState(progress, reducedMotion);
    };

    const scheduleUpdate = () => {
      if (reducedMotion) {
        applyState(1, true);
        return;
      }
      if (!rafId) {
        rafId = requestAnimationFrame(updateFrame);
      }
    };

    const onMqChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      scheduleUpdate();
    };

    mq.addEventListener('change', onMqChange);
    updateFrame();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      mq.removeEventListener('change', onMqChange);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F6F6F6] flex items-center justify-end"
    >
      {/* Asymmetric right-aligned stage on desktop, discreetly framed on mobile */}
      <div
        ref={wrapperRef}
        className="w-full h-full flex items-center justify-end pr-0 sm:pr-4 lg:pr-8 xl:pr-12"
        style={{ opacity: 0.32 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 720"
          className="w-[125%] sm:w-full h-full max-w-[1180px] block select-none translate-x-[10%] sm:translate-x-[4%] lg:translate-x-0"
          preserveAspectRatio="xMaxYMid meet"
          fill="none"
        >
          <defs>
            <radialGradient id="labBulbCrimsonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#CC0000" stopOpacity="0.24" />
              <stop offset="62%" stopColor="#CC0000" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#CC0000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ═══════════════════════════════════════════════════════════
              CORE BULB (Anchored right-side at x=930, y=210)
              Evolves continuously across Phase 1 -> Phase 2 -> Phase 3
              ═══════════════════════════════════════════════════════════ */}
          <g>
            {/* Phase 1: Dashed construction grid */}
            <g
              ref={constructionGridRef}
              stroke="#1C1C1C"
              strokeWidth="1"
              strokeDasharray="4 5"
              style={{ opacity: 0.24 }}
            >
              <line x1="930" y1="55" x2="930" y2="395" />
              <line x1="740" y1="205" x2="1120" y2="205" />
              <circle cx="930" cy="205" r="128" />
              <circle cx="930" cy="205" r="92" />
            </g>

            {/* Phase 1: Subtle wireframe interference sketch ticks */}
            <g
              ref={interferenceRef}
              stroke="#1C1C1C"
              strokeOpacity="0.45"
              strokeWidth="1.2"
              style={{ willChange: 'opacity, transform' }}
            >
              <line x1="782" y1="158" x2="844" y2="152" />
              <line x1="1016" y1="146" x2="1084" y2="140" />
              <line x1="774" y1="210" x2="834" y2="207" />
              <line x1="1028" y1="218" x2="1090" y2="213" />
              <line x1="794" y1="258" x2="854" y2="252" />
              <line x1="1006" y1="264" x2="1068" y2="258" />
              <line x1="906" y1="184" x2="918" y2="173" stroke="#CC0000" strokeWidth="1.6" />
              <line x1="944" y1="172" x2="956" y2="182" stroke="#CC0000" strokeWidth="1.6" />
            </g>

            {/* Phase 2 & 3: Crimson radial glow */}
            <circle
              ref={crimsonGlowRef}
              cx="930"
              cy="205"
              r="165"
              fill="url(#labBulbCrimsonGlow)"
              style={{
                opacity: 0,
                transformOrigin: '930px 205px',
                willChange: 'opacity, transform',
              }}
            />

            {/* Phase 2 & 3: Crimson rays drawn geometrically outward */}
            <g
              ref={crimsonRaysRef}
              stroke="#CC0000"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset="1"
              style={{ opacity: 0 }}
            >
              <line pathLength={1} x1="930" y1="112" x2="930" y2="82" />
              <line pathLength={1} x1="882" y1="125" x2="868" y2="100" />
              <line pathLength={1} x1="978" y1="125" x2="992" y2="100" />
              <line pathLength={1} x1="846" y1="160" x2="822" y2="146" />
              <line pathLength={1} x1="1014" y1="160" x2="1038" y2="146" />
              <line pathLength={1} x1="836" y1="205" x2="808" y2="205" />
              <line pathLength={1} x1="1024" y1="205" x2="1052" y2="205" />
              <line pathLength={1} x1="848" y1="252" x2="824" y2="266" />
              <line pathLength={1} x1="1012" y1="252" x2="1036" y2="266" />
            </g>

            {/* Bulb white fill (fades in on ignition) */}
            <path
              ref={bulbGlassFillRef}
              d="M930 132 C886 132 854 166 854 208 C854 238 871 260 885 279 C892 289 896 299 897 310 L963 310 C964 299 968 289 975 279 C989 260 1006 238 1006 208 C1006 166 974 132 930 132 Z"
              fill="#FFFFFF"
              style={{ opacity: 0 }}
            />

            {/* Primary graphite bulb contour (always present) */}
            <path
              d="M930 132 C886 132 854 166 854 208 C854 238 871 260 885 279 C892 289 896 299 897 310 L963 310 C964 299 968 289 975 279 C989 260 1006 238 1006 208 C1006 166 974 132 930 132 Z"
              stroke="#1C1C1C"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Phase 1 sketchy double-stroke contour (fades out on ignition) */}
            <g
              ref={wireframeDoubleRef}
              stroke="#1C1C1C"
              strokeWidth="1"
              strokeOpacity="0.5"
              strokeLinecap="round"
            >
              <path d="M927 135 C889 137 859 169 858 210 C858 238 874 258 888 277 C895 287 899 297 900 308" />
              <path d="M934 134 C971 138 1001 170 1002 209 C1002 238 986 258 972 277 C965 287 961 297 960 308" />
            </g>

            {/* Phase 1 Graphite Wireframe Filament */}
            <g
              ref={filamentGraphiteRef}
              stroke="#1C1C1C"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M914 310 L914 250 L904 218" strokeWidth="1.6" />
              <path d="M946 310 L946 250 L956 218" strokeWidth="1.6" />
              <line x1="930" y1="310" x2="930" y2="242" strokeWidth="1.3" strokeDasharray="5 4" />
              <path d="M904 218 Q912 206 920 218 Q928 230 936 216" strokeWidth="1.8" />
              <path
                d="M940 216 Q948 206 956 218"
                strokeWidth="1.8"
                strokeDasharray="4 3"
              />
            </g>

            {/* Phase 2 & 3 Crimson Active Filament */}
            <g
              ref={filamentRedRef}
              stroke="#CC0000"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0 }}
            >
              <path d="M914 310 L914 250 L904 218" />
              <path d="M946 310 L946 250 L956 218" />
              <path d="M904 218 Q912 206 921 218 Q930 230 939 218 Q948 206 956 218" />
            </g>

            {/* Screw base */}
            <g stroke="#1C1C1C" strokeWidth="2" fill="#EAEAEA">
              <rect x="897" y="310" width="66" height="12" rx="3" />
              <rect x="900" y="322" width="60" height="12" rx="3" />
              <path d="M910 334 L950 334 L942 346 L918 346 Z" />
            </g>
          </g>

          {/* ═══════════════════════════════════════════════════════════
              PHASE 2: Orthogonal Connectors & Modular Work Blocks
              Draws geometrically downward from bulb, then retracts cleanly
              ═══════════════════════════════════════════════════════════ */}
          <g ref={phase2GroupRef} style={{ opacity: 0, willChange: 'opacity' }}>
            <g
              ref={connectorsRef}
              stroke="#CC0000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              strokeDashoffset="1"
            >
              <path pathLength={1} d="M922 354 L922 404 L515 404 L515 446" />
              <path pathLength={1} d="M685 404 L685 446" />
              <path pathLength={1} d="M855 404 L855 446" />
              <path pathLength={1} d="M938 354 L938 404 L1030 404 L1030 446" />
            </g>

            <g ref={connectorNodesRef} fill="#CC0000" style={{ opacity: 0 }}>
              <circle cx="922" cy="404" r="4" />
              <circle cx="685" cy="404" r="4" />
              <circle cx="855" cy="404" r="4" />
              <circle cx="515" cy="446" r="4" />
              <circle cx="685" cy="446" r="4" />
              <circle cx="855" cy="446" r="4" />
              <circle cx="1030" cy="446" r="4" />
            </g>

            {/* 4 Modular Architecture Blocks */}
            <g stroke="#1C1C1C" strokeWidth="1.8" fill="#FFFFFF">
              <g
                ref={(el) => {
                  moduleRefs.current[0] = el;
                }}
                style={{ opacity: 0, willChange: 'opacity, transform' }}
              >
                <rect x="440" y="446" width="150" height="136" rx="8" />
                <line x1="440" y1="472" x2="590" y2="472" />
                <circle cx="456" cy="459" r="3" fill="#CC0000" stroke="none" />
                <rect x="456" y="488" width="118" height="40" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
                <line x1="456" y1="544" x2="548" y2="544" strokeWidth="1.4" />
                <line x1="456" y1="560" x2="520" y2="560" strokeWidth="1.4" strokeOpacity="0.45" />
              </g>

              <g
                ref={(el) => {
                  moduleRefs.current[1] = el;
                }}
                style={{ opacity: 0, willChange: 'opacity, transform' }}
              >
                <rect x="610" y="446" width="150" height="136" rx="8" />
                <line x1="610" y1="472" x2="760" y2="472" />
                <circle cx="626" cy="459" r="3" fill="#CC0000" stroke="none" />
                <rect x="626" y="488" width="54" height="40" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
                <rect x="690" y="488" width="54" height="40" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
                <line x1="626" y1="544" x2="736" y2="544" strokeWidth="1.4" />
                <line x1="626" y1="560" x2="695" y2="560" strokeWidth="1.4" strokeOpacity="0.45" />
              </g>

              <g
                ref={(el) => {
                  moduleRefs.current[2] = el;
                }}
                style={{ opacity: 0, willChange: 'opacity, transform' }}
              >
                <rect x="780" y="446" width="150" height="136" rx="8" />
                <line x1="780" y1="472" x2="930" y2="472" />
                <circle cx="796" cy="459" r="3" fill="#CC0000" stroke="none" />
                <circle cx="855" cy="508" r="20" fill="#F6F6F6" strokeWidth="1.2" />
                <line x1="796" y1="544" x2="908" y2="544" strokeWidth="1.4" />
                <line x1="796" y1="560" x2="872" y2="560" strokeWidth="1.4" strokeOpacity="0.45" />
              </g>

              <g
                ref={(el) => {
                  moduleRefs.current[3] = el;
                }}
                style={{ opacity: 0, willChange: 'opacity, transform' }}
              >
                <rect x="955" y="446" width="150" height="136" rx="8" />
                <line x1="955" y1="472" x2="1105" y2="472" />
                <circle cx="971" cy="459" r="3" fill="#CC0000" stroke="none" />
                <rect x="971" y="488" width="118" height="18" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
                <rect x="971" y="514" width="118" height="18" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
                <line x1="971" y1="548" x2="1062" y2="548" strokeWidth="1.4" />
                <line x1="971" y1="562" x2="1032" y2="562" strokeWidth="1.4" strokeOpacity="0.45" />
              </g>
            </g>
          </g>

          {/* ═══════════════════════════════════════════════════════════
              PHASE 3: Energy Bridge + Multidevice Prototype (Desktop + Mobile)
              Draws its own outlines & wireframes progressively with scroll
              ═══════════════════════════════════════════════════════════ */}
          <g ref={phase3GroupRef} style={{ opacity: 0, willChange: 'opacity' }}>
            {/* Bridge from bulb base down-left into multidevice prototype */}
            <path
              ref={energyBridgeRef}
              pathLength={1}
              d="M930 354 L930 410 L862 410"
              stroke="#CC0000"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            <circle
              ref={bridgeDotRef}
              cx="862"
              cy="410"
              r="4.5"
              fill="#CC0000"
              style={{ opacity: 0 }}
            />

            {/* Desktop Monitor Frame (stroke-drawn by scroll) */}
            <g
              ref={desktopOutlineRef}
              stroke="#1C1C1C"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              strokeDashoffset="1"
              style={{ opacity: 0, willChange: 'opacity, transform' }}
            >
              <rect pathLength={1} x="430" y="340" width="420" height="260" rx="12" fill="#FFFFFF" />
              <line pathLength={1} x1="430" y1="370" x2="850" y2="370" strokeWidth="1.6" />
              <path pathLength={1} d="M606 600 L674 600 L686 638 L594 638 Z" fill="#EAEAEA" />
              <line pathLength={1} x1="568" y1="638" x2="712" y2="638" strokeWidth="2.6" />
            </g>

            {/* Desktop UI Wireframe Interior */}
            <g ref={desktopUiRef} style={{ opacity: 0 }}>
              <circle cx="448" cy="355" r="3.5" fill="#CC0000" />
              <circle cx="461" cy="355" r="3.5" fill="#1C1C1C" fillOpacity="0.25" />
              <circle cx="474" cy="355" r="3.5" fill="#1C1C1C" fillOpacity="0.25" />

              {/* Nav skeleton */}
              <rect x="454" y="386" width="48" height="9" rx="2.5" fill="#1C1C1C" />
              <rect x="734" y="387" width="28" height="7" rx="2" fill="#1C1C1C" fillOpacity="0.3" />
              <rect x="772" y="387" width="28" height="7" rx="2" fill="#1C1C1C" fillOpacity="0.3" />
              <rect x="810" y="386" width="18" height="9" rx="2.5" fill="#CC0000" />

              {/* Hero wireframe */}
              <rect x="454" y="410" width="206" height="84" rx="6" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
              <rect x="676" y="410" width="152" height="12" rx="3" fill="#1C1C1C" />
              <rect x="676" y="432" width="128" height="8" rx="2" fill="#1C1C1C" fillOpacity="0.35" />
              <rect x="676" y="447" width="110" height="8" rx="2" fill="#1C1C1C" fillOpacity="0.35" />
              <rect x="676" y="470" width="68" height="21" rx="4" fill="#CC0000" />

              {/* 3 Product cards wireframe */}
              <rect x="454" y="510" width="116" height="72" rx="6" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
              <rect x="582" y="510" width="116" height="72" rx="6" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
              <rect x="710" y="510" width="118" height="72" rx="6" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
              <circle cx="470" cy="526" r="3.5" fill="#CC0000" />
              <circle cx="598" cy="526" r="3.5" fill="#CC0000" />
              <circle cx="726" cy="526" r="3.5" fill="#CC0000" />
            </g>

            {/* Mobile Device Frame overlapping right edge of desktop */}
            <g
              ref={mobileOutlineRef}
              stroke="#1C1C1C"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset="1"
              style={{ opacity: 0, willChange: 'opacity, transform' }}
            >
              <rect pathLength={1} x="822" y="442" width="122" height="206" rx="16" fill="#FFFFFF" />
              <line pathLength={1} x1="868" y1="455" x2="898" y2="455" strokeWidth="2" />
            </g>

            {/* Mobile UI Wireframe Interior */}
            <g ref={mobileUiRef} style={{ opacity: 0 }}>
              <rect x="836" y="470" width="34" height="7" rx="2" fill="#1C1C1C" />
              <circle cx="924" cy="474" r="3.5" fill="#CC0000" />
              <rect x="836" y="488" width="94" height="54" rx="5" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
              <rect x="836" y="552" width="76" height="7" rx="2" fill="#1C1C1C" />
              <rect x="836" y="565" width="60" height="5.5" rx="2" fill="#1C1C1C" fillOpacity="0.35" />
              <rect x="836" y="580" width="48" height="14" rx="3" fill="#CC0000" />
              <rect x="836" y="604" width="44" height="30" rx="4" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
              <rect x="886" y="604" width="44" height="30" rx="4" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
