import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STAGE_LABELS = [
  'Etapa 01 de 03: idea wireframe',
  'Etapa 02 de 03: rayos rojos y módulos conectados',
  'Etapa 03 de 03: lámpara encendida y prototipos multidispositivo',
] as const;

export const LabsScrollBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const flickerRef = useRef<gsap.core.Tween | null>(null);
  const stageTargetsRef = useRef<[number, number, number]>([0, 0.45, 1]);
  const manualOverrideRef = useRef(false);
  const lastManualScrollYRef = useRef(0);
  const prefersReducedMotionRef = useRef(false);

  const [activeStage, setActiveStage] = useState<0 | 1 | 2>(0);

  const syncFlicker = useCallback((progress: number) => {
    const flicker = flickerRef.current;
    if (!flicker) return;
    if (progress > 0.06) {
      flicker.pause();
    } else {
      flicker.play();
    }
  }, []);

  const goToStage = useCallback(
    (nextStage: 0 | 1 | 2) => {
      const tl = tlRef.current;
      if (!tl) return;
      manualOverrideRef.current = true;
      lastManualScrollYRef.current = window.scrollY;
      setActiveStage(nextStage);

      const targetProgress = stageTargetsRef.current[nextStage];
      if (prefersReducedMotionRef.current) {
        tl.progress(targetProgress);
        syncFlicker(targetProgress);
      } else {
        gsap.to(tl, {
          progress: targetProgress,
          duration: 0.65,
          ease: 'power2.inOut',
          overwrite: 'auto',
          onUpdate: () => syncFlicker(tl.progress()),
        });
      }
    },
    [syncFlicker]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    prefersReducedMotionRef.current = prefersReducedMotion;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(container);

      // Estado inicial (0% scroll): solo bulbo wireframe con guías y filamento inestable
      gsap.set(q('.bulb-assembly'), {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        svgOrigin: '640 345',
      });
      gsap.set(q('.blueprint-guides'), { opacity: 0.7 });
      gsap.set(q('.filament-raw'), { opacity: 0.85 });
      gsap.set(q('.filament-lit, .bulb-red-tint, .bulb-halo'), { opacity: 0 });
      gsap.set(q('.bulb-halo'), { scale: 0.7, svgOrigin: '640 345' });

      gsap.set(q('.modules-stage'), { opacity: 0, x: 18 });
      gsap.set(q('.devices-stage'), { opacity: 0, x: 24 });
      gsap.set(q('.sweep-trails'), { opacity: 0 });
      gsap.set(q('.bottom-lines-stage'), { opacity: 0 });

      const drawables = gsap.utils.toArray<SVGGeometryElement>(
        q('.draw-ray, .draw-mod-line, .draw-dev-line, .draw-trail, .draw-bottom')
      );
      drawables.forEach((el) => {
        const len =
          typeof el.getTotalLength === 'function' ? el.getTotalLength() : 320;
        gsap.set(el, {
          strokeDasharray: len,
          strokeDashoffset: len,
          opacity: 0,
        });
      });

      // Titileo sutil de filamento en estado inicial (solo si no hay prefers-reduced-motion)
      let flickerTween: gsap.core.Tween | null = null;
      if (!prefersReducedMotion) {
        flickerTween = gsap.to(q('.filament-raw'), {
          opacity: 'random(0.35, 1)',
          x: 'random(-1.5, 1.5)',
          duration: 0.14,
          repeat: -1,
          yoyo: true,
          ease: 'steps(2)',
        });
      }
      flickerRef.current = flickerTween;

      // Timeline maestro mapeado a los beats del recorrido (0.0 -> 1.0)
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'none' },
      });
      tlRef.current = tl;

      // 0.00 -> 0.14: Se atenúan guías, se enciende el bulbo en rojo y nacen rayos
      tl.to(
        q('.blueprint-guides'),
        { opacity: 0.12, duration: 0.1 },
        0.03
      )
        .to(
          q('.filament-raw'),
          {
            opacity: 0,
            duration: 0.08,
            onComplete: () => {
              flickerTween?.pause();
            },
            onReverseComplete: () => {
              flickerTween?.play();
            },
          },
          0.06
        )
        .to(
          q('.filament-lit, .bulb-red-tint'),
          { opacity: 1, duration: 0.1 },
          0.07
        )
        .to(
          q('.bulb-halo'),
          { opacity: 0.9, scale: 1, duration: 0.12 },
          0.07
        )
        .to(q('.draw-ray'), { opacity: 1, duration: 0.02, stagger: 0.008 }, 0.08)
        .to(
          q('.draw-ray'),
          { strokeDashoffset: 0, duration: 0.14, stagger: 0.008 },
          0.08
        );

      // 0.16 -> 0.42: Bulbo se mueve a la izquierda, surgen módulos wireframe y conectores
      tl.to(
        q('.bulb-assembly'),
        { x: -245, scale: 0.96, duration: 0.2, ease: 'power2.inOut' },
        0.16
      )
        .to(
          q('.modules-stage'),
          { opacity: 1, x: 0, duration: 0.12 },
          0.2
        )
        .to(q('.draw-mod-line'), { opacity: 1, duration: 0.02, stagger: 0.012 }, 0.22)
        .to(
          q('.draw-mod-line'),
          { strokeDashoffset: 0, duration: 0.22, stagger: 0.012 },
          0.22
        );

      // 0.42 -> 0.68: Barrido de transición y consolidación en Desktop + Mobile wireframes
      tl.to(
        q('.sweep-trails'),
        { opacity: 0.85, duration: 0.08 },
        0.42
      )
        .to(q('.draw-trail'), { opacity: 1, duration: 0.02, stagger: 0.01 }, 0.43)
        .to(
          q('.draw-trail'),
          { strokeDashoffset: 0, duration: 0.14, stagger: 0.01 },
          0.43
        )
        .to(
          q('.modules-stage'),
          { opacity: 0, x: -16, duration: 0.14 },
          0.46
        )
        .to(
          q('.devices-stage'),
          { opacity: 1, x: 0, duration: 0.14 },
          0.48
        )
        .to(q('.draw-dev-line'), { opacity: 1, duration: 0.02, stagger: 0.01 }, 0.49)
        .to(
          q('.draw-dev-line'),
          { strokeDashoffset: 0, duration: 0.2, stagger: 0.01 },
          0.49
        )
        .to(
          q('.sweep-trails'),
          { opacity: 0, duration: 0.12 },
          0.56
        );

      // 0.60 -> 0.90: Líneas inferiores con nodos y acentos rojos finales
      tl.to(
        q('.bottom-lines-stage'),
        { opacity: 1, duration: 0.08 },
        0.62
      )
        .to(q('.draw-bottom'), { opacity: 1, duration: 0.02, stagger: 0.01 }, 0.64)
        .to(
          q('.draw-bottom'),
          { strokeDashoffset: 0, duration: 0.2, stagger: 0.01 },
          0.64
        );

      const totalDur = tl.duration() || 1;
      stageTargetsRef.current = [0, Math.min(0.43 / totalDur, 0.48), 1];

      // Completa el 100% del timeline al ~76% del scroll total y convive sin conflictos con las flechas mobile
      const st = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: () =>
          '+=' +
          Math.max(
            400,
            Math.round((document.documentElement.scrollHeight - window.innerHeight) * 0.76)
          ),
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (manualOverrideRef.current) {
            if (Math.abs(window.scrollY - lastManualScrollYRef.current) > 90) {
              manualOverrideRef.current = false;
            } else {
              return;
            }
          }

          if (prefersReducedMotion) {
            tl.progress(self.progress);
          } else {
            gsap.to(tl, {
              progress: self.progress,
              duration: 0.25,
              ease: 'power1.out',
              overwrite: 'auto',
            });
          }

          syncFlicker(self.progress);

          const nextStage: 0 | 1 | 2 =
            self.progress < 0.22 ? 0 : self.progress < 0.72 ? 1 : 2;
          setActiveStage((prev) => (prev === nextStage ? prev : nextStage));
        },
      });

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });
      resizeObserver.observe(document.body);

      const onLoadRefresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', onLoadRefresh);

      const refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);

      return () => {
        window.clearTimeout(refreshTimer);
        window.removeEventListener('load', onLoadRefresh);
        resizeObserver.disconnect();
        st.kill();
        tlRef.current = null;
        flickerRef.current = null;
      };
    }, container);

    return () => ctx.revert();
  }, [syncFlicker]);

  return (
    <>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F6F6F6] flex items-center justify-center lg:justify-end lg:pr-4 xl:pr-8"
      >
        <svg
          viewBox="0 0 1280 720"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[115%] max-w-none sm:w-full sm:max-w-[920px] xl:max-w-[1040px] h-auto opacity-35 sm:opacity-35 lg:opacity-45 select-none"
        >
        <defs>
          <radialGradient id="videoBulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CC0000" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#CC0000" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#CC0000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="videoGlassTint" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#E65A5A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#B81D1D" stopOpacity="0.18" />
          </radialGradient>
        </defs>

        {/* ============================================================ */}
        {/* 1. BULBO + GUÍAS WIREFRAME + RAYOS ROJOS                     */}
        {/* ============================================================ */}
        <g className="bulb-assembly">
          {/* Halo rojo de encendido */}
          <circle
            cx="640"
            cy="345"
            r="195"
            fill="url(#videoBulbGlow)"
            className="bulb-halo"
          />

          {/* Guías técnicas iniciales (00:00) */}
          <g className="blueprint-guides" stroke="#1E1E1E" strokeWidth="1">
            <line x1="640" y1="75" x2="640" y2="620" strokeOpacity="0.22" />
            <line x1="400" y1="295" x2="880" y2="295" strokeOpacity="0.22" />
            <line x1="485" y1="150" x2="485" y2="570" strokeOpacity="0.14" />
            <line x1="795" y1="150" x2="795" y2="570" strokeOpacity="0.14" />
            <path
              d="M445 295 A195 195 0 0 1 640 100"
              strokeDasharray="4 4"
              strokeOpacity="0.35"
            />
            <polygon points="640,95 634,104 646,104" fill="#1E1E1E" fillOpacity="0.4" stroke="none" />
          </g>

          {/* Rayos rojos alrededor del bulbo (00:01) */}
          <g stroke="#CC0000" strokeWidth="2.4" strokeLinecap="round">
            <line x1="640" y1="108" x2="640" y2="144" className="draw-ray" />
            <line x1="564" y1="126" x2="582" y2="158" className="draw-ray" />
            <line x1="716" y1="126" x2="698" y2="158" className="draw-ray" />
            <line x1="504" y1="176" x2="532" y2="198" className="draw-ray" />
            <line x1="776" y1="176" x2="748" y2="198" className="draw-ray" />
            <line x1="472" y1="248" x2="506" y2="258" className="draw-ray" />
            <line x1="808" y1="248" x2="774" y2="258" className="draw-ray" />
            <line x1="466" y1="332" x2="502" y2="332" className="draw-ray" />
            <line x1="814" y1="332" x2="778" y2="332" className="draw-ray" />
            <line x1="490" y1="408" x2="522" y2="392" className="draw-ray" />
            <line x1="790" y1="408" x2="758" y2="392" className="draw-ray" />
          </g>

          {/* Cuerpo del bulbo */}
          <path
            d="M640 168 C568 168 518 220 518 288 C518 336 544 369 565 398 C576 413 582 426 584 442 L696 442 C698 426 704 413 715 398 C736 369 762 336 762 288 C762 220 712 168 640 168 Z"
            fill="#FFFFFF"
            fillOpacity="0.55"
            stroke="#1E1E1E"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Tinte rojo interior al encenderse */}
          <path
            d="M640 168 C568 168 518 220 518 288 C518 336 544 369 565 398 C576 413 582 426 584 442 L696 442 C698 426 704 413 715 398 C736 369 762 336 762 288 C762 220 712 168 640 168 Z"
            fill="url(#videoGlassTint)"
            className="bulb-red-tint"
          />

          {/* Filamento inicial wireframe (con interferencia) */}
          <g className="filament-raw" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M616 440 L616 355 L600 302" />
            <path d="M664 440 L664 355 L680 302" />
            <path d="M600 302 L612 286 L624 306 L640 284 L656 306 L668 286 L680 302" />
          </g>

          {/* Filamento iluminado en rojo */}
          <g className="filament-lit" stroke="#CC0000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M616 440 L616 355 L600 302" />
            <path d="M664 440 L664 355 L680 302" />
            <path d="M600 302 Q612 284 624 304 Q640 322 656 304 Q668 284 680 302" />
          </g>

          {/* Casquillo roscado */}
          <g stroke="#1E1E1E" strokeWidth="2" fill="#D8D6D0">
            <rect x="584" y="442" width="112" height="16" rx="4" />
            <rect x="588" y="458" width="104" height="15" rx="4" />
            <rect x="592" y="473" width="96" height="15" rx="4" />
            <path d="M608 488 L672 488 L660 506 L620 506 Z" fill="#2A2A2A" />
          </g>
        </g>

        {/* ============================================================ */}
        {/* 2. MÓDULOS WIREFRAME Y CONECTORES (00:02 - 00:03)             */}
        {/* ============================================================ */}
        <g className="modules-stage">
          {/* Conectores desde el bulbo hacia módulos */}
          <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
            <path d="M475 275 L545 275" stroke="#CC0000" className="draw-mod-line" />
            <path d="M475 340 L565 340 L565 405 L685 405" stroke="#CC0000" className="draw-mod-line" />
            <path d="M455 445 L580 445 L580 490 L795 490" stroke="#1E1E1E" strokeOpacity="0.55" className="draw-mod-line" />
            <path d="M430 465 L595 465 L595 515 L940 515" stroke="#1E1E1E" strokeOpacity="0.45" className="draw-mod-line" />
          </g>

          {/* Segmentos rojos destacados sobre rutas */}
          <line x1="605" y1="405" x2="655" y2="405" stroke="#CC0000" strokeWidth="4" strokeLinecap="round" className="draw-mod-line" />
          <line x1="625" y1="490" x2="680" y2="490" stroke="#CC0000" strokeWidth="4" strokeLinecap="round" className="draw-mod-line" />

          {/* Ventana / Módulo superior izquierdo */}
          <g stroke="#1E1E1E" strokeWidth="1.4" fill="#FFFFFF" fillOpacity="0.72">
            <rect x="545" y="165" width="215" height="145" rx="4" className="draw-mod-line" />
            <line x1="545" y1="186" x2="760" y2="186" className="draw-mod-line" />
            <rect x="562" y="205" width="75" height="55" rx="2" fill="#F4F3EE" className="draw-mod-line" />
            <rect x="648" y="212" width="24" height="24" rx="2" fill="#F4F3EE" className="draw-mod-line" />
            <rect x="678" y="212" width="24" height="24" rx="2" fill="#F4F3EE" className="draw-mod-line" />
            <rect x="708" y="212" width="24" height="24" rx="2" fill="#F4F3EE" className="draw-mod-line" />
          </g>

          {/* Ventana / Módulo superior derecho */}
          <g stroke="#1E1E1E" strokeWidth="1.4" fill="#FFFFFF" fillOpacity="0.68">
            <rect x="795" y="210" width="245" height="125" rx="4" className="draw-mod-line" />
            <line x1="795" y1="230" x2="1040" y2="230" className="draw-mod-line" />
            <line x1="815" y1="255" x2="950" y2="255" strokeOpacity="0.4" className="draw-mod-line" />
            <line x1="815" y1="274" x2="990" y2="274" strokeOpacity="0.4" className="draw-mod-line" />
            <line x1="815" y1="293" x2="920" y2="293" strokeOpacity="0.4" className="draw-mod-line" />
          </g>

          {/* Ventana / Módulo inferior central */}
          <g stroke="#1E1E1E" strokeWidth="1.4" fill="#FFFFFF" fillOpacity="0.72">
            <rect x="685" y="365" width="210" height="115" rx="4" className="draw-mod-line" />
            <line x1="685" y1="385" x2="895" y2="385" className="draw-mod-line" />
            <rect x="705" y="405" width="46" height="34" rx="2" fill="#F4F3EE" className="draw-mod-line" />
            <rect x="772" y="405" width="46" height="34" rx="2" fill="#F4F3EE" className="draw-mod-line" />
            <line x1="751" y1="422" x2="772" y2="422" className="draw-mod-line" />
          </g>

          {/* Ventana / Módulo inferior derecho */}
          <g stroke="#1E1E1E" strokeWidth="1.4" fill="#FFFFFF" fillOpacity="0.68">
            <rect x="920" y="355" width="225" height="135" rx="4" className="draw-mod-line" />
            <line x1="920" y1="375" x2="1145" y2="375" className="draw-mod-line" />
            <line x1="940" y1="402" x2="1095" y2="402" strokeOpacity="0.4" className="draw-mod-line" />
            <line x1="940" y1="422" x2="1060" y2="422" strokeOpacity="0.4" className="draw-mod-line" />
          </g>
        </g>

        {/* ============================================================ */}
        {/* 3. TRAZOS DE BARRIDO EN TRANSICIÓN (00:03 - 00:04)            */}
        {/* ============================================================ */}
        <g className="sweep-trails" strokeLinecap="round">
          <path d="M515 305 Q640 295 760 285" stroke="#CC0000" strokeWidth="2.2" className="draw-trail" />
          <path d="M515 335 Q650 345 780 330" stroke="#1E1E1E" strokeWidth="1.6" strokeOpacity="0.5" className="draw-trail" />
          <path d="M515 365 Q660 390 810 385" stroke="#CC0000" strokeWidth="2" className="draw-trail" />
          <path d="M515 395 Q670 420 830 420" stroke="#1E1E1E" strokeWidth="1.5" strokeOpacity="0.45" className="draw-trail" />
        </g>

        {/* ============================================================ */}
        {/* 4. PROTOTIPOS WIREFRAME DESKTOP + MOBILE (00:04 - 00:09)       */}
        {/* ============================================================ */}
        <g className="devices-stage">
          {/* Desktop Monitor Wireframe */}
          <g stroke="#1E1E1E" strokeLinejoin="round">
            <rect
              x="615"
              y="185"
              width="430"
              height="270"
              rx="12"
              fill="#FFFFFF"
              fillOpacity="0.82"
              strokeWidth="2.4"
              className="draw-dev-line"
            />
            <rect
              x="631"
              y="201"
              width="398"
              height="238"
              rx="4"
              fill="#F8F7F4"
              strokeWidth="1.4"
              className="draw-dev-line"
            />
            {/* Peana */}
            <path
              d="M792 455 L868 455 L878 505 L782 505 Z"
              fill="#E2E0DA"
              strokeWidth="2"
              className="draw-dev-line"
            />
            <line
              x1="748"
              y1="505"
              x2="912"
              y2="505"
              strokeWidth="2.6"
              strokeLinecap="round"
              className="draw-dev-line"
            />
          </g>

          {/* Estructura interna Wireframe Desktop */}
          <g stroke="#1E1E1E" strokeOpacity="0.55" strokeWidth="1.2">
            {/* Barra superior */}
            <line x1="631" y1="222" x2="1029" y2="222" className="draw-dev-line" />
            <circle cx="644" cy="211" r="3" fill="#1E1E1E" fillOpacity="0.35" stroke="none" />
            <circle cx="655" cy="211" r="3" fill="#1E1E1E" fillOpacity="0.35" stroke="none" />
            <circle cx="666" cy="211" r="3" fill="#1E1E1E" fillOpacity="0.35" stroke="none" />

            {/* Sidebar izquierda */}
            <line x1="662" y1="222" x2="662" y2="439" className="draw-dev-line" />
            <rect x="639" y="238" width="15" height="15" rx="2" fill="none" className="draw-dev-line" />
            <rect x="639" y="264" width="15" height="15" rx="2" fill="none" className="draw-dev-line" />
            <rect x="639" y="290" width="15" height="15" rx="2" fill="none" className="draw-dev-line" />

            {/* Bloque principal con aspa de wireframe */}
            <rect x="680" y="256" width="165" height="92" rx="3" fill="#EFECE6" className="draw-dev-line" />
            <line x1="680" y1="256" x2="845" y2="348" strokeOpacity="0.3" className="draw-dev-line" />
            <line x1="845" y1="256" x2="680" y2="348" strokeOpacity="0.3" className="draw-dev-line" />

            {/* Columna derecha */}
            <rect x="858" y="256" width="152" height="58" rx="3" fill="#EFECE6" className="draw-dev-line" />
            <line x1="858" y1="328" x2="985" y2="328" className="draw-dev-line" />
            <line x1="858" y1="342" x2="955" y2="342" className="draw-dev-line" />

            {/* 3 Cajas inferiores */}
            <rect x="680" y="362" width="96" height="62" rx="3" fill="#EFECE6" className="draw-dev-line" />
            <rect x="788" y="362" width="96" height="62" rx="3" fill="#EFECE6" className="draw-dev-line" />
            <rect x="896" y="362" width="114" height="62" rx="3" fill="#EFECE6" className="draw-dev-line" />
          </g>

          {/* Mobile Phone Wireframe superpuesto a la derecha */}
          <g stroke="#1E1E1E" strokeLinejoin="round">
            <rect
              x="982"
              y="322"
              width="126"
              height="232"
              rx="18"
              fill="#FFFFFF"
              fillOpacity="0.92"
              strokeWidth="2.4"
              className="draw-dev-line"
            />
            <rect
              x="991"
              y="344"
              width="108"
              height="188"
              rx="6"
              fill="#F8F7F4"
              strokeWidth="1.3"
              className="draw-dev-line"
            />
            <line x1="1032" y1="333" x2="1058" y2="333" strokeWidth="2" strokeLinecap="round" className="draw-dev-line" />
            <circle cx="1045" cy="542" r="4" fill="none" strokeWidth="1.4" className="draw-dev-line" />

            {/* Contenido Wireframe Mobile */}
            <rect x="1001" y="356" width="88" height="56" rx="3" fill="#EFECE6" strokeWidth="1.1" className="draw-dev-line" />
            <line x1="1001" y1="356" x2="1089" y2="412" strokeOpacity="0.3" strokeWidth="1" className="draw-dev-line" />
            <line x1="1089" y1="356" x2="1001" y2="412" strokeOpacity="0.3" strokeWidth="1" className="draw-dev-line" />
            <line x1="1001" y1="426" x2="1075" y2="426" strokeWidth="1.4" className="draw-dev-line" />
            <line x1="1001" y1="440" x2="1055" y2="440" strokeWidth="1.2" strokeOpacity="0.5" className="draw-dev-line" />
            <rect x="1001" y="456" width="40" height="46" rx="3" fill="#EFECE6" strokeWidth="1.1" className="draw-dev-line" />
            <rect x="1049" y="456" width="40" height="46" rx="3" fill="#EFECE6" strokeWidth="1.1" className="draw-dev-line" />
          </g>
        </g>

        {/* ============================================================ */}
        {/* 5. LÍNEAS INFERIORES CON NODOS Y ACENTOS ROJOS (00:07 - 00:10) */}
        {/* ============================================================ */}
        <g className="bottom-lines-stage">
          <g stroke="#1E1E1E" strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M368 506 L368 575 L465 575" className="draw-bottom" />
            <path d="M388 506 L388 552 L530 552 L530 610" className="draw-bottom" />
            <path d="M408 506 L408 532 L645 532 L645 585 L895 585" className="draw-bottom" />
            <path d="M815 505 L815 548 L965 548" className="draw-bottom" />
          </g>

          {/* Segmentos rojos en las líneas inferiores */}
          <g stroke="#CC0000" strokeWidth="3.8" strokeLinecap="round">
            <line x1="485" y1="552" x2="515" y2="552" className="draw-bottom" />
            <line x1="765" y1="585" x2="825" y2="585" className="draw-bottom" />
          </g>

          {/* Pequeños nodos circulares */}
          <g stroke="#1E1E1E" strokeWidth="1.4" fill="#F4F3EE">
            <circle cx="465" cy="575" r="4" className="draw-bottom" />
            <circle cx="530" cy="610" r="4" className="draw-bottom" />
            <circle cx="895" cy="585" r="4" className="draw-bottom" />
            <circle cx="965" cy="548" r="4" className="draw-bottom" />
          </g>
        </g>
      </svg>
      </div>

      {/* Control discreto paso a paso para mobile (< 768px) */}
      <div
        role="region"
        aria-label="Control paso a paso de la animación de fondo"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 md:hidden flex items-center gap-1.5 rounded-full bg-[#F6F6F6]/92 backdrop-blur-md border border-[#dedbd3] px-1.5 py-1 shadow-[0_8px_28px_rgba(1,1,1,0.08)]"
      >
        <button
          type="button"
          onClick={() => goToStage(Math.max(0, activeStage - 1) as 0 | 1 | 2)}
          disabled={activeStage === 0}
          aria-label="Etapa anterior de la animación"
          className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center bg-transparent hover:bg-white active:bg-[#eceae4] text-[#1C1C1C] disabled:opacity-35 disabled:cursor-not-allowed border-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </button>

        <div
          className="flex flex-col items-center justify-center px-2 select-none"
          aria-live="polite"
        >
          <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-[#1C1C1C] tabular-nums leading-none">
            0{activeStage + 1} / 03
          </span>
          <span className="sr-only">{STAGE_LABELS[activeStage]}</span>
          <div className="flex items-center gap-1.5 mt-1.5" aria-hidden="true">
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeStage === idx
                    ? 'w-3.5 bg-[#CC0000]'
                    : 'w-1.5 bg-[#cfccc4]'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => goToStage(Math.min(2, activeStage + 1) as 0 | 1 | 2)}
          disabled={activeStage === 2}
          aria-label="Etapa siguiente de la animación"
          className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center bg-transparent hover:bg-white active:bg-[#eceae4] text-[#1C1C1C] disabled:opacity-35 disabled:cursor-not-allowed border-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]"
        >
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </>
  );
};