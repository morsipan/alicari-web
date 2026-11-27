import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const LabsScrollBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(container);

      // Estado inicial limpio (scroll = 0): solo bulbo wireframe visible
      gsap.set(q('.bulb-root'), {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        svgOrigin: '550 295',
      });
      gsap.set(q('.bulb-flicker'), { opacity: 0.75 });
      gsap.set(q('.bulb-interference'), { opacity: prefersReducedMotion ? 0.35 : 0.85, x: 0 });
      gsap.set(q('.bulb-filament-lit'), { opacity: 0 });
      gsap.set(q('.bulb-glow'), { opacity: 0, scale: 0.65, svgOrigin: '550 295' });

      gsap.set(q('.modules-group'), { opacity: 0, y: 16 });
      gsap.set(q('.module-card'), { opacity: 0, y: 14 });
      gsap.set(q('.devices-group'), { opacity: 0, y: 18 });
      gsap.set(q('.device-screen-fill'), { opacity: 0 });

      // Preparar todos los trazos dibujables ocultos (opacity: 0 evita puntos de strokeLinecap="round")
      const strokeEls = gsap.utils.toArray<SVGGeometryElement>(
        q('.ray-line, .connector-path, .bridge-path, .wireframe-path')
      );
      strokeEls.forEach((el) => {
        const len =
          typeof el.getTotalLength === 'function' ? el.getTotalLength() : 280;
        gsap.set(el, {
          strokeDasharray: len,
          strokeDashoffset: len,
          opacity: 0,
        });
      });

      // Micro-interferencia ambiental solo si no hay prefers-reduced-motion
      let flickerTween: gsap.core.Tween | null = null;
      let interferenceTween: gsap.core.Tween | null = null;

      if (!prefersReducedMotion) {
        flickerTween = gsap.to(q('.bulb-flicker'), {
          opacity: 'random(0.25, 1)',
          duration: 0.14,
          repeat: -1,
          yoyo: true,
          ease: 'steps(2)',
        });

        interferenceTween = gsap.to(q('.bulb-interference'), {
          x: 'random(-4, 4)',
          opacity: 'random(0.15, 0.9)',
          duration: 0.16,
          repeat: -1,
          yoyo: true,
          ease: 'none',
        });
      }

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'none' },
      });

      // Fase 1 -> Fase 2 (0% a 50% del scroll)
      tl.to(
        q('.bulb-interference, .bulb-flicker'),
        {
          opacity: 0,
          duration: 0.08,
          onComplete: () => {
            flickerTween?.pause();
            interferenceTween?.pause();
          },
          onReverseComplete: () => {
            flickerTween?.play();
            interferenceTween?.play();
          },
        },
        0.02
      )
        .to(q('.bulb-root'), { y: -118, scale: 0.84, duration: 0.18 }, 0.05)
        .to(q('.bulb-filament-lit'), { opacity: 1, duration: 0.1 }, 0.08)
        .to(q('.bulb-glow'), { opacity: 0.85, scale: 1, duration: 0.14 }, 0.1)
        .to(q('.ray-line'), { opacity: 1, duration: 0.02, stagger: 0.01 }, 0.12)
        .to(q('.ray-line'), { strokeDashoffset: 0, duration: 0.16, stagger: 0.01 }, 0.12)
        .to(q('.modules-group'), { opacity: 1, y: 0, duration: 0.08 }, 0.16)
        .to(q('.connector-path'), { opacity: 1, duration: 0.02, stagger: 0.015 }, 0.18)
        .to(
          q('.connector-path'),
          { strokeDashoffset: 0, duration: 0.2, stagger: 0.015 },
          0.18
        )
        .to(q('.module-card'), { opacity: 1, y: 0, duration: 0.16, stagger: 0.02 }, 0.24);

      // Fase 2 -> Fase 3 (55% a 95% del scroll, garantizando escena completa al llegar al cierre)
      tl.to(
        q('.modules-group, .connector-path, .module-card'),
        { opacity: 0, y: -14, duration: 0.1 },
        0.55
      )
        .to(q('.bulb-root'), { x: -245, y: -10, scale: 0.9, duration: 0.16 }, 0.58)
        .to(q('.bridge-path'), { opacity: 1, duration: 0.02 }, 0.68)
        .to(q('.bridge-path'), { strokeDashoffset: 0, duration: 0.1 }, 0.68)
        .to(q('.devices-group'), { opacity: 1, y: 0, duration: 0.1 }, 0.7)
        .to(q('.wireframe-path'), { opacity: 1, duration: 0.02, stagger: 0.006 }, 0.72)
        .to(
          q('.wireframe-path'),
          { strokeDashoffset: 0, duration: 0.15, stagger: 0.006 },
          0.72
        )
        .to(
          q('.device-screen-fill'),
          { opacity: 1, duration: 0.1, stagger: 0.008 },
          0.82
        )
        // Tramo final (0.95 -> 1.00) en reposo con toda la escena desplegada
        .to({}, { duration: 0.05 }, 0.95);

      const st = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        animation: tl,
        invalidateOnRefresh: true,
      });

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });
      resizeObserver.observe(document.body);

      const refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);

      return () => {
        window.clearTimeout(refreshTimer);
        resizeObserver.disconnect();
        st.kill();
      };
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F6F6F6] flex items-center justify-center lg:justify-end lg:pr-6 xl:pr-10"
    >
      <svg
        viewBox="0 0 1100 650"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[820px] xl:max-w-[900px] h-auto opacity-30 sm:opacity-35 lg:opacity-40 select-none"
      >
        <defs>
          <radialGradient id="labRedGlowFix" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CC0000" stopOpacity="0.25" />
            <stop offset="65%" stopColor="#CC0000" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#CC0000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="bulb-root">
          <circle cx="550" cy="295" r="155" fill="url(#labRedGlowFix)" className="bulb-glow" />

          <g className="bulb-interference" strokeLinecap="round">
            <line x1="388" y1="242" x2="465" y2="234" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="635" y1="226" x2="716" y2="218" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="380" y1="295" x2="452" y2="291" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="648" y1="308" x2="722" y2="303" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="406" y1="350" x2="478" y2="342" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="522" y1="264" x2="536" y2="252" stroke="#CC0000" strokeWidth="1.8" />
            <line x1="566" y1="252" x2="580" y2="263" stroke="#CC0000" strokeWidth="1.8" />
          </g>

          <g stroke="#CC0000" strokeWidth="2.5" strokeLinecap="round">
            <line x1="550" y1="158" x2="550" y2="184" className="ray-line" />
            <line x1="482" y1="178" x2="496" y2="200" className="ray-line" />
            <line x1="618" y1="178" x2="604" y2="200" className="ray-line" />
            <line x1="436" y1="225" x2="458" y2="238" className="ray-line" />
            <line x1="664" y1="225" x2="642" y2="238" className="ray-line" />
            <line x1="420" y1="288" x2="446" y2="288" className="ray-line" />
            <line x1="680" y1="288" x2="654" y2="288" className="ray-line" />
          </g>

          <g stroke="#1C1C1C" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M550 205 C492 205 454 248 454 300 C454 337 476 363 493 386 C502 399 506 410 508 424 L592 424 C594 410 598 399 607 386 C624 363 646 337 646 300 C646 248 608 205 550 205 Z"
              strokeWidth="2.3"
              fill="#FFFFFF"
              fillOpacity="0.68"
            />
            <g className="bulb-flicker" strokeWidth="1.6">
              <path d="M532 422 L532 352 L520 314" />
              <path d="M568 422 L568 352 L580 314" />
              <path d="M520 314 Q528 302 536 314 Q544 326 550 314 Q558 302 566 314 L580 314" />
            </g>
            <g className="bulb-filament-lit" stroke="#CC0000" strokeWidth="2.4">
              <path d="M532 422 L532 352 L520 314" />
              <path d="M568 422 L568 352 L580 314" />
              <path d="M520 314 Q528 302 536 314 Q544 326 550 314 Q558 302 566 314 L580 314" />
            </g>
            <rect x="508" y="424" width="84" height="13" rx="3" strokeWidth="2" fill="#EAEAEA" />
            <rect x="512" y="437" width="76" height="13" rx="3" strokeWidth="2" fill="#EAEAEA" />
            <path d="M524 450 L576 450 L566 464 L534 464 Z" strokeWidth="2" fill="#1C1C1C" />
          </g>
        </g>

        <g className="modules-group">
          <g stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M538 355 L538 395 L260 395 L260 430" className="connector-path" />
            <path d="M450 395 L450 430" className="connector-path" />
            <path d="M562 355 L562 395 L840 395 L840 430" className="connector-path" />
            <path d="M650 395 L650 430" className="connector-path" />
            <line x1="345" y1="495" x2="375" y2="495" className="connector-path" />
            <line x1="535" y1="495" x2="565" y2="495" className="connector-path" />
            <line x1="725" y1="495" x2="755" y2="495" className="connector-path" />
          </g>

          <g stroke="#1C1C1C" strokeWidth="1.8" fill="#FFFFFF">
            <g className="module-card">
              <rect x="185" y="430" width="160" height="135" rx="8" />
              <line x1="185" y1="456" x2="345" y2="456" strokeWidth="1.4" />
              <circle cx="201" cy="443" r="3" fill="#CC0000" stroke="none" />
              <rect x="203" y="472" width="124" height="38" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
              <line x1="203" y1="526" x2="295" y2="526" strokeWidth="1.4" />
            </g>
            <g className="module-card">
              <rect x="375" y="430" width="160" height="135" rx="8" />
              <line x1="375" y1="456" x2="535" y2="456" strokeWidth="1.4" />
              <circle cx="391" cy="443" r="3" fill="#CC0000" stroke="none" />
              <rect x="393" y="472" width="56" height="38" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
              <rect x="461" y="472" width="56" height="38" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
              <line x1="393" y1="526" x2="505" y2="526" strokeWidth="1.4" />
            </g>
            <g className="module-card">
              <rect x="565" y="430" width="160" height="135" rx="8" />
              <line x1="565" y1="456" x2="725" y2="456" strokeWidth="1.4" />
              <circle cx="581" cy="443" r="3" fill="#CC0000" stroke="none" />
              <circle cx="645" cy="492" r="20" fill="#F6F6F6" strokeWidth="1.2" />
              <line x1="583" y1="526" x2="695" y2="526" strokeWidth="1.4" />
            </g>
            <g className="module-card">
              <rect x="755" y="430" width="160" height="135" rx="8" />
              <line x1="755" y1="456" x2="915" y2="456" strokeWidth="1.4" />
              <circle cx="771" cy="443" r="3" fill="#CC0000" stroke="none" />
              <rect x="773" y="472" width="124" height="16" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
              <rect x="773" y="496" width="124" height="16" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
              <line x1="773" y1="530" x2="865" y2="530" strokeWidth="1.4" />
            </g>
          </g>
        </g>

        <g>
          <line
            x1="415"
            y1="305"
            x2="475"
            y2="305"
            stroke="#CC0000"
            strokeWidth="2.2"
            className="bridge-path"
          />
          <g className="devices-group">
            <rect
              x="480"
              y="165"
              width="440"
              height="275"
              rx="12"
              fill="#FFFFFF"
              stroke="#1C1C1C"
              strokeWidth="2.2"
              className="wireframe-path"
            />
            <line
              x1="480"
              y1="196"
              x2="920"
              y2="196"
              stroke="#1C1C1C"
              strokeWidth="1.5"
              className="wireframe-path"
            />
            <path
              d="M668 440 L732 440 L744 480 L656 480 Z"
              fill="#EAEAEA"
              stroke="#1C1C1C"
              strokeWidth="2"
              className="wireframe-path"
            />
            <rect
              x="505"
              y="236"
              width="215"
              height="90"
              rx="6"
              fill="#F6F6F6"
              stroke="#1C1C1C"
              strokeWidth="1.2"
              className="wireframe-path"
            />
            <line
              x1="505"
              y1="236"
              x2="720"
              y2="326"
              stroke="#1C1C1C"
              strokeOpacity="0.22"
              strokeWidth="1"
              className="wireframe-path"
            />
            <rect x="738" y="238" width="154" height="13" rx="3" fill="#1C1C1C" className="device-screen-fill" />
            <rect x="738" y="302" width="72" height="22" rx="4" fill="#CC0000" className="device-screen-fill" />
            <rect
              x="505"
              y="344"
              width="120"
              height="74"
              rx="6"
              fill="#F6F6F6"
              stroke="#1C1C1C"
              strokeWidth="1.2"
              className="wireframe-path"
            />
            <rect
              x="640"
              y="344"
              width="120"
              height="74"
              rx="6"
              fill="#F6F6F6"
              stroke="#1C1C1C"
              strokeWidth="1.2"
              className="wireframe-path"
            />
            <rect
              x="775"
              y="344"
              width="118"
              height="74"
              rx="6"
              fill="#F6F6F6"
              stroke="#1C1C1C"
              strokeWidth="1.2"
              className="wireframe-path"
            />

            <rect
              x="885"
              y="265"
              width="126"
              height="218"
              rx="16"
              fill="#FFFFFF"
              stroke="#1C1C1C"
              strokeWidth="2.2"
              className="wireframe-path"
            />
            <rect
              x="900"
              y="308"
              width="96"
              height="58"
              rx="5"
              fill="#F6F6F6"
              stroke="#1C1C1C"
              strokeWidth="1.2"
              className="wireframe-path"
            />
            <rect x="900" y="378" width="76" height="8" rx="2" fill="#1C1C1C" className="device-screen-fill" />
            <rect x="900" y="410" width="48" height="16" rx="3" fill="#CC0000" className="device-screen-fill" />
          </g>
        </g>
      </svg>
    </div>
  );
};
