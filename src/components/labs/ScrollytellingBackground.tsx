import React, { useEffect, useRef } from 'react';

function clamp(value: number, min = 0, max = 1): number {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export const ScrollytellingBackground: React.FC = () => {
  const svgWrapperRef = useRef<HTMLDivElement | null>(null);

  // Stage 1 refs (0.00 -> 0.40)
  const stage1GroupRef = useRef<SVGGElement | null>(null);
  const stage1GridRef = useRef<SVGGElement | null>(null);
  const stage1InterferenceRef = useRef<SVGGElement | null>(null);

  // Stage 2 refs (0.25 -> 0.76)
  const stage2GroupRef = useRef<SVGGElement | null>(null);
  const stage2GlowRef = useRef<SVGCircleElement | null>(null);
  const stage2RaysRef = useRef<SVGGElement | null>(null);
  const stage2ConnectorsRef = useRef<SVGGElement | null>(null);
  const stage2NodesRef = useRef<SVGGElement | null>(null);
  const stage2BoxRefs = useRef<(SVGGElement | null)[]>([]);

  // Stage 3 refs (0.64 -> 1.00)
  const stage3GroupRef = useRef<SVGGElement | null>(null);
  const stage3GlowRef = useRef<SVGCircleElement | null>(null);
  const stage3BridgeRef = useRef<SVGLineElement | null>(null);
  const stage3DesktopRef = useRef<SVGGElement | null>(null);
  const stage3DesktopUiRef = useRef<SVGGElement | null>(null);
  const stage3MobileRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mq.matches;
    const onMqChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      scheduleUpdate();
    };
    mq.addEventListener('change', onMqChange);

    let rafId = 0;

    const updateFrame = () => {
      rafId = 0;
      const docEl = document.documentElement;
      const maxScroll = Math.max(1, docEl.scrollHeight - window.innerHeight);
      const p = clamp(window.scrollY / maxScroll, 0, 1);

      const isMobile = window.innerWidth < 768;
      const masterOpacity = isMobile ? 0.24 : 0.42;

      if (svgWrapperRef.current) {
        svgWrapperRef.current.style.opacity = String(masterOpacity);
      }

      // ── STAGE 1: Wireframe bulb + construction lines (0.00 -> 0.42) ──
      const s1Out = 1 - smoothstep(0.28, 0.42, p);
      if (stage1GroupRef.current) {
        const scale1 = 1 + p * 0.05;
        stage1GroupRef.current.style.opacity = s1Out.toFixed(4);
        stage1GroupRef.current.style.transform = `scale(${scale1.toFixed(4)})`;
      }
      if (stage1GridRef.current) {
        const dashOffset = (p * 140).toFixed(2);
        stage1GridRef.current.style.strokeDashoffset = dashOffset;
      }
      if (stage1InterferenceRef.current) {
        // Subtle scroll-linked horizontal micro-shift (disabled in reduced motion)
        const jitterX = reducedMotion ? 0 : Math.sin(p * 48) * 2.5 * s1Out;
        stage1InterferenceRef.current.style.transform = `translate3d(${jitterX.toFixed(2)}px, 0, 0)`;
      }

      // ── STAGE 2: Lit bulb, crimson rays, connectors & modules (0.26 -> 0.76) ──
      const s2In = smoothstep(0.26, 0.38, p);
      const s2Out = 1 - smoothstep(0.64, 0.76, p);
      const s2Vis = s2In * s2Out;

      if (stage2GroupRef.current) {
        stage2GroupRef.current.style.opacity = s2Vis.toFixed(4);
      }
      if (stage2GlowRef.current) {
        const glowScale = 0.75 + smoothstep(0.26, 0.46, p) * 0.32;
        stage2GlowRef.current.style.transform = `scale(${glowScale.toFixed(4)})`;
        stage2GlowRef.current.style.opacity = smoothstep(0.26, 0.42, p).toFixed(4);
      }
      if (stage2RaysRef.current) {
        const rayDraw = smoothstep(0.28, 0.44, p);
        stage2RaysRef.current.style.strokeDashoffset = (1 - rayDraw).toFixed(4);
        stage2RaysRef.current.style.opacity = rayDraw.toFixed(4);
      }
      if (stage2ConnectorsRef.current) {
        const connDraw = smoothstep(0.34, 0.54, p);
        stage2ConnectorsRef.current.style.strokeDashoffset = (1 - connDraw).toFixed(4);
      }
      if (stage2NodesRef.current) {
        const nodeOp = smoothstep(0.44, 0.55, p);
        stage2NodesRef.current.style.opacity = nodeOp.toFixed(4);
      }
      for (let i = 0; i < 5; i++) {
        const box = stage2BoxRefs.current[i];
        if (!box) continue;
        const start = 0.43 + i * 0.025;
        const boxP = smoothstep(start, start + 0.11, p);
        const yOff = (1 - boxP) * 20;
        box.style.opacity = boxP.toFixed(4);
        box.style.transform = `translate3d(0, ${yOff.toFixed(2)}px, 0)`;
      }

      // ── STAGE 3: Consolidated multidevice prototype (0.64 -> 1.00) ──
      const s3In = smoothstep(0.64, 0.76, p);
      if (stage3GroupRef.current) {
        stage3GroupRef.current.style.opacity = s3In.toFixed(4);
      }
      if (stage3GlowRef.current) {
        const g3 = 0.8 + smoothstep(0.66, 0.86, p) * 0.25;
        stage3GlowRef.current.style.transform = `scale(${g3.toFixed(4)})`;
      }
      if (stage3BridgeRef.current) {
        const bridgeDraw = smoothstep(0.7, 0.82, p);
        stage3BridgeRef.current.style.strokeDashoffset = (1 - bridgeDraw).toFixed(4);
      }
      if (stage3DesktopRef.current) {
        const deskP = smoothstep(0.72, 0.86, p);
        const deskY = (1 - deskP) * 18;
        stage3DesktopRef.current.style.opacity = deskP.toFixed(4);
        stage3DesktopRef.current.style.transform = `translate3d(0, ${deskY.toFixed(2)}px, 0)`;
      }
      if (stage3DesktopUiRef.current) {
        const uiP = smoothstep(0.79, 0.92, p);
        stage3DesktopUiRef.current.style.opacity = uiP.toFixed(4);
      }
      if (stage3MobileRef.current) {
        const mobP = smoothstep(0.83, 0.97, p);
        const mobY = (1 - mobP) * 26;
        stage3MobileRef.current.style.opacity = mobP.toFixed(4);
        stage3MobileRef.current.style.transform = `translate3d(0, ${mobY.toFixed(2)}px, 0)`;
      }
    };

    const scheduleUpdate = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateFrame);
      }
    };

    // Initial render
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
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F6F6F6] flex items-center justify-center"
    >
      <div
        ref={svgWrapperRef}
        className="w-full h-full flex items-center justify-center p-4 sm:p-10"
        style={{ opacity: 0.42 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 675"
          className="w-full h-full max-w-[1320px] block select-none"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          <defs>
            <radialGradient id="labsRedGlow2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#CC0000" stopOpacity="0.24" />
              <stop offset="65%" stopColor="#CC0000" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#CC0000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="labsRedGlow3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#CC0000" stopOpacity="0.24" />
              <stop offset="65%" stopColor="#CC0000" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#CC0000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ═══════════════════════════════════════════════════════════
              STAGE 1: Wireframe Bulb & Construction Lines (0.00 -> 0.40)
              ═══════════════════════════════════════════════════════════ */}
          <g
            ref={stage1GroupRef}
            style={{ transformOrigin: '600px 337px', willChange: 'opacity, transform' }}
          >
            {/* Editorial construction grid */}
            <g
              ref={stage1GridRef}
              stroke="#1C1C1C"
              strokeOpacity="0.16"
              strokeWidth="1"
              strokeDasharray="4 4"
            >
              <line x1="600" y1="90" x2="600" y2="585" />
              <line x1="360" y1="310" x2="840" y2="310" />
              <circle cx="600" cy="300" r="145" />
              <circle cx="600" cy="300" r="105" />
            </g>

            {/* Interference / sketch lines */}
            <g
              ref={stage1InterferenceRef}
              stroke="#1C1C1C"
              strokeOpacity="0.4"
              strokeWidth="1.2"
              style={{ willChange: 'transform' }}
            >
              <line x1="415" y1="242" x2="505" y2="234" />
              <line x1="695" y1="226" x2="788" y2="218" />
              <line x1="402" y1="295" x2="482" y2="291" />
              <line x1="712" y1="312" x2="795" y2="306" />
              <line x1="430" y1="354" x2="515" y2="346" />
              <line x1="680" y1="362" x2="765" y2="355" />
              <line x1="572" y1="268" x2="586" y2="256" stroke="#CC0000" strokeWidth="1.8" />
              <line x1="618" y1="254" x2="632" y2="265" stroke="#CC0000" strokeWidth="1.8" />
            </g>

            {/* Hand-drawn wireframe bulb */}
            <g stroke="#1C1C1C" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M600 185 C532 185 488 236 488 298 C488 342 514 373 534 401 C545 416 550 430 552 446 L648 446 C650 430 655 416 666 401 C686 373 712 342 712 298 C712 236 668 185 600 185 Z"
                strokeWidth="2.2"
              />
              <path
                d="M597 188 C536 190 493 239 492 300 C492 341 518 371 537 399 C547 414 553 428 555 444"
                strokeWidth="1"
                strokeOpacity="0.55"
              />
              <path
                d="M604 187 C664 191 707 240 708 299 C708 341 682 371 663 399 C653 414 647 428 645 444"
                strokeWidth="1"
                strokeOpacity="0.55"
              />
              <path d="M578 444 L578 362 L564 316" strokeWidth="1.6" />
              <path d="M622 444 L622 362 L636 316" strokeWidth="1.6" />
              <line x1="600" y1="444" x2="600" y2="350" strokeWidth="1.4" strokeDasharray="6 4" />
              <path d="M564 316 Q573 302 582 316 Q591 330 600 314" strokeWidth="1.8" />
              <path
                d="M609 314 Q618 302 627 316 L636 316"
                strokeWidth="1.8"
                strokeDasharray="5 3"
              />
              <rect x="552" y="446" width="96" height="16" rx="4" strokeWidth="2" />
              <rect x="556" y="462" width="88" height="15" rx="4" strokeWidth="2" />
              <rect x="560" y="477" width="80" height="15" rx="4" strokeWidth="2" />
              <path d="M574 492 L626 492 L614 508 L586 508 Z" strokeWidth="2" />
            </g>
          </g>

          {/* ═══════════════════════════════════════════════════════════
              STAGE 2: Crimson Rays, Connectors & Modules (0.26 -> 0.76)
              ═══════════════════════════════════════════════════════════ */}
          <g ref={stage2GroupRef} style={{ opacity: 0, willChange: 'opacity' }}>
            <circle
              ref={stage2GlowRef}
              cx="600"
              cy="185"
              r="165"
              fill="url(#labsRedGlow2)"
              style={{ transformOrigin: '600px 185px', willChange: 'transform, opacity' }}
            />

            {/* Crimson rays drawn outward with scroll */}
            <g
              ref={stage2RaysRef}
              stroke="#CC0000"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset="1"
            >
              <line pathLength={1} x1="600" y1="92" x2="600" y2="68" />
              <line pathLength={1} x1="550" y1="105" x2="538" y2="84" />
              <line pathLength={1} x1="650" y1="105" x2="662" y2="84" />
              <line pathLength={1} x1="515" y1="139" x2="494" y2="126" />
              <line pathLength={1} x1="685" y1="139" x2="706" y2="126" />
              <line pathLength={1} x1="504" y1="185" x2="480" y2="185" />
              <line pathLength={1} x1="696" y1="185" x2="720" y2="185" />
              <line pathLength={1} x1="517" y1="230" x2="496" y2="242" />
              <line pathLength={1} x1="683" y1="230" x2="704" y2="242" />
            </g>

            {/* Lit bulb */}
            <g
              stroke="#1C1C1C"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#FFFFFF"
            >
              <path d="M600 112 C558 112 528 144 528 184 C528 212 544 232 557 250 C564 260 568 269 569 280 L631 280 C632 269 636 260 643 250 C656 232 672 212 672 184 C672 144 642 112 600 112 Z" />
            </g>
            <g stroke="#CC0000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M585 280 L585 224 L575 194" />
              <path d="M615 280 L615 224 L625 194" />
              <path d="M575 194 Q583 182 591 194 Q600 206 609 194 Q617 182 625 194" />
            </g>
            <g stroke="#1C1C1C" strokeWidth="2" fill="#EAEAEA">
              <rect x="569" y="280" width="62" height="11" rx="3" />
              <rect x="572" y="291" width="56" height="11" rx="3" />
              <path d="M582 302 L618 302 L610 314 L590 314 Z" />
            </g>

            {/* Orthogonal red connectors drawn by scroll */}
            <g
              ref={stage2ConnectorsRef}
              stroke="#CC0000"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              strokeDashoffset="1"
            >
              <path pathLength={1} d="M586 322 L586 365 L310 365 L310 405" />
              <path pathLength={1} d="M435 365 L435 405" />
              <path pathLength={1} d="M600 322 L600 405" />
              <path pathLength={1} d="M614 322 L614 365 L890 365 L890 405" />
              <path pathLength={1} d="M765 365 L765 405" />
            </g>

            {/* Connection nodes */}
            <g ref={stage2NodesRef} fill="#CC0000" style={{ opacity: 0 }}>
              <circle cx="586" cy="365" r="4" />
              <circle cx="614" cy="365" r="4" />
              <circle cx="435" cy="365" r="4" />
              <circle cx="765" cy="365" r="4" />
              <circle cx="310" cy="405" r="4" />
              <circle cx="435" cy="405" r="4" />
              <circle cx="600" cy="405" r="4" />
              <circle cx="765" cy="405" r="4" />
              <circle cx="890" cy="405" r="4" />
            </g>

            {/* 5 Modular idea/architecture boxes staggered by scroll */}
            <g stroke="#1C1C1C" strokeWidth="1.8" fill="#FFFFFF">
              <g
                ref={(el) => {
                  stage2BoxRefs.current[0] = el;
                }}
                style={{ opacity: 0, willChange: 'opacity, transform' }}
              >
                <rect x="220" y="405" width="160" height="145" rx="8" />
                <line x1="220" y1="433" x2="380" y2="433" />
                <circle cx="236" cy="419" r="3" fill="#CC0000" stroke="none" />
                <rect x="238" y="450" width="124" height="44" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
                <line x1="238" y1="510" x2="335" y2="510" strokeWidth="1.4" />
                <line x1="238" y1="526" x2="310" y2="526" strokeWidth="1.4" strokeOpacity="0.5" />
              </g>

              <g
                ref={(el) => {
                  stage2BoxRefs.current[1] = el;
                }}
                style={{ opacity: 0, willChange: 'opacity, transform' }}
              >
                <rect x="405" y="405" width="160" height="145" rx="8" />
                <line x1="405" y1="433" x2="565" y2="433" />
                <circle cx="421" cy="419" r="3" fill="#CC0000" stroke="none" />
                <rect x="423" y="450" width="56" height="44" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
                <rect x="491" y="450" width="56" height="44" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
                <line x1="423" y1="510" x2="540" y2="510" strokeWidth="1.4" />
                <line x1="423" y1="526" x2="495" y2="526" strokeWidth="1.4" strokeOpacity="0.5" />
              </g>

              <g
                ref={(el) => {
                  stage2BoxRefs.current[2] = el;
                }}
                style={{ opacity: 0, willChange: 'opacity, transform' }}
              >
                <rect
                  x="585"
                  y="405"
                  width="30"
                  height="145"
                  rx="8"
                  fill="#F6F6F6"
                  stroke="#CC0000"
                  strokeDasharray="4 4"
                />
              </g>

              <g
                ref={(el) => {
                  stage2BoxRefs.current[3] = el;
                }}
                style={{ opacity: 0, willChange: 'opacity, transform' }}
              >
                <rect x="635" y="405" width="160" height="145" rx="8" />
                <line x1="635" y1="433" x2="795" y2="433" />
                <circle cx="651" cy="419" r="3" fill="#CC0000" stroke="none" />
                <circle cx="715" cy="472" r="22" fill="#F6F6F6" strokeWidth="1.2" />
                <line x1="653" y1="510" x2="770" y2="510" strokeWidth="1.4" />
                <line x1="653" y1="526" x2="730" y2="526" strokeWidth="1.4" strokeOpacity="0.5" />
              </g>

              <g
                ref={(el) => {
                  stage2BoxRefs.current[4] = el;
                }}
                style={{ opacity: 0, willChange: 'opacity, transform' }}
              >
                <rect x="820" y="405" width="160" height="145" rx="8" />
                <line x1="820" y1="433" x2="980" y2="433" />
                <circle cx="836" cy="419" r="3" fill="#CC0000" stroke="none" />
                <rect x="838" y="450" width="124" height="20" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
                <rect x="838" y="478" width="124" height="20" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
                <line x1="838" y1="514" x2="930" y2="514" strokeWidth="1.4" />
                <line x1="838" y1="528" x2="900" y2="528" strokeWidth="1.4" strokeOpacity="0.5" />
              </g>
            </g>
          </g>

          {/* ═══════════════════════════════════════════════════════════
              STAGE 3: Consolidated Multidevice Prototype (0.64 -> 1.00)
              ═══════════════════════════════════════════════════════════ */}
          <g ref={stage3GroupRef} style={{ opacity: 0, willChange: 'opacity' }}>
            <circle
              ref={stage3GlowRef}
              cx="255"
              cy="310"
              r="175"
              fill="url(#labsRedGlow3)"
              style={{ transformOrigin: '255px 310px', willChange: 'transform' }}
            />

            <g stroke="#CC0000" strokeWidth="2.6" strokeLinecap="round">
              <line x1="255" y1="185" x2="255" y2="212" />
              <line x1="185" y1="205" x2="199" y2="228" />
              <line x1="325" y1="205" x2="311" y2="228" />
              <line x1="138" y1="252" x2="161" y2="266" />
              <line x1="372" y1="252" x2="349" y2="266" />
              <line x1="122" y1="315" x2="148" y2="315" />
              <line x1="388" y1="315" x2="362" y2="315" />
              <line x1="140" y1="376" x2="163" y2="362" />
              <line x1="370" y1="376" x2="347" y2="362" />
            </g>

            {/* Solid lit bulb */}
            <g
              stroke="#1C1C1C"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#FFFFFF"
            >
              <path d="M255 234 C208 234 176 270 176 315 C176 346 194 369 208 389 C216 400 220 410 221 422 L289 422 C290 410 294 400 302 389 C316 369 334 346 334 315 C334 270 302 234 255 234 Z" />
            </g>
            <g stroke="#CC0000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M239 422 L239 360 L228 326" />
              <path d="M271 422 L271 360 L282 326" />
              <path d="M228 326 Q237 313 246 326 Q255 339 264 326 Q273 313 282 326" />
            </g>
            <g stroke="#1C1C1C" strokeWidth="2.2" fill="#EAEAEA">
              <rect x="221" y="422" width="68" height="12" rx="4" />
              <rect x="224" y="434" width="62" height="12" rx="4" />
              <path d="M235 446 L275 446 L266 460 L244 460 Z" />
            </g>

            {/* Energy bridge drawn by scroll */}
            <line
              ref={stage3BridgeRef}
              pathLength={1}
              x1="395"
              y1="315"
              x2="465"
              y2="315"
              stroke="#CC0000"
              strokeWidth="2.4"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            <circle cx="465" cy="315" r="4.5" fill="#CC0000" />

            {/* Desktop frame */}
            <g
              ref={stage3DesktopRef}
              style={{ opacity: 0, willChange: 'opacity, transform' }}
            >
              <g stroke="#1C1C1C" strokeWidth="2.2" fill="#FFFFFF">
                <rect x="475" y="165" width="470" height="295" rx="12" />
                <line x1="475" y1="197" x2="945" y2="197" strokeWidth="1.6" />
                <circle cx="495" cy="181" r="4" fill="#CC0000" stroke="none" />
                <circle cx="509" cy="181" r="4" fill="#1C1C1C" fillOpacity="0.25" stroke="none" />
                <circle cx="523" cy="181" r="4" fill="#1C1C1C" fillOpacity="0.25" stroke="none" />
                <path d="M675 460 L745 460 L758 502 L662 502 Z" fill="#EAEAEA" />
                <line x1="635" y1="502" x2="785" y2="502" strokeWidth="2.6" strokeLinecap="round" />
              </g>

              {/* Desktop interior UI */}
              <g ref={stage3DesktopUiRef} style={{ opacity: 0 }}>
                <rect x="502" y="214" width="54" height="10" rx="3" fill="#1C1C1C" />
                <rect x="815" y="215" width="32" height="8" rx="2" fill="#1C1C1C" fillOpacity="0.3" />
                <rect x="857" y="215" width="32" height="8" rx="2" fill="#1C1C1C" fillOpacity="0.3" />
                <rect x="899" y="214" width="20" height="10" rx="3" fill="#CC0000" />
                <rect x="502" y="242" width="235" height="96" rx="6" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
                <rect x="753" y="242" width="166" height="14" rx="3" fill="#1C1C1C" />
                <rect x="753" y="266" width="142" height="9" rx="2" fill="#1C1C1C" fillOpacity="0.35" />
                <rect x="753" y="283" width="124" height="9" rx="2" fill="#1C1C1C" fillOpacity="0.35" />
                <rect x="753" y="310" width="76" height="24" rx="4" fill="#CC0000" />
                <rect x="502" y="356" width="130" height="82" rx="6" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
                <rect x="646" y="356" width="130" height="82" rx="6" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
                <rect x="790" y="356" width="129" height="82" rx="6" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
                <circle cx="520" cy="374" r="4" fill="#CC0000" />
                <circle cx="664" cy="374" r="4" fill="#CC0000" />
                <circle cx="808" cy="374" r="4" fill="#CC0000" />
              </g>
            </g>

            {/* Mobile mockup overlapping bottom-right */}
            <g
              ref={stage3MobileRef}
              style={{ opacity: 0, willChange: 'opacity, transform' }}
            >
              <g stroke="#1C1C1C" strokeWidth="2.2" fill="#FFFFFF">
                <rect x="910" y="275" width="135" height="232" rx="18" />
                <line x1="962" y1="289" x2="993" y2="289" strokeWidth="2" strokeLinecap="round" />
              </g>
              <g>
                <rect x="926" y="306" width="38" height="8" rx="2" fill="#1C1C1C" />
                <circle cx="1022" cy="310" r="4" fill="#CC0000" />
                <rect x="926" y="326" width="103" height="62" rx="5" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
                <rect x="926" y="398" width="84" height="8" rx="2" fill="#1C1C1C" />
                <rect x="926" y="413" width="68" height="6" rx="2" fill="#1C1C1C" fillOpacity="0.35" />
                <rect x="926" y="430" width="52" height="16" rx="3" fill="#CC0000" />
                <rect x="926" y="456" width="48" height="34" rx="4" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
                <rect x="981" y="456" width="48" height="34" rx="4" fill="#F6F6F6" stroke="#1C1C1C" strokeWidth="1.2" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
