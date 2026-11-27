import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const LabsScrollBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      // Estado inicial (0% scroll): solo bulbo wireframe titilando e interferencia
      gsap.set('.bulb-root', { opacity: 1, x: 0, y: 0, scale: 1 });
      gsap.set('.bulb-flicker', { opacity: 0.72 });
      gsap.set('.bulb-interference', { opacity: 0.85, x: 0 });
      gsap.set('.bulb-filament-lit', { opacity: 0 });
      gsap.set('.bulb-glow', { opacity: 0, scale: 0.65, transformOrigin: 'center' });

      gsap.set('.modules-group', { opacity: 0, y: 18 });
      gsap.set('.module-card', { opacity: 0, y: 14 });
      gsap.set('.devices-group', { opacity: 0, y: 20 });
      gsap.set('.device-screen-fill', { opacity: 0 });

      // Preparar trazos vectoriales animados con strokeDasharray / strokeDashoffset
      const pathSelectors = [
        '.ray-line',
        '.connector-path',
        '.bridge-path',
        '.wireframe-path',
      ];

      pathSelectors.forEach((selector) => {
        const els = gsap.utils.toArray<SVGGeometryElement>(selector);
        els.forEach((el) => {
          const length =
            typeof el.getTotalLength === 'function' ? el.getTotalLength() : 280;
          gsap.set(el, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });
        });
      });

      if (prefersReducedMotion) {
        gsap.set('.bulb-interference, .bulb-flicker', { opacity: 0 });
        gsap.set('.bulb-root', { x: -250, y: -10, scale: 0.9 });
        gsap.set('.bulb-filament-lit', { opacity: 1 });
        gsap.set('.bulb-glow', { opacity: 0.9, scale: 1 });
        gsap.set('.ray-line, .bridge-path, .wireframe-path', { strokeDashoffset: 0 });
        gsap.set('.devices-group, .device-screen-fill', { opacity: 1, y: 0 });
        return;
      }

      // Titileo e interferencia continua en la etapa inicial (antes de estabilizarse con el scroll)
      const flickerTween = gsap.to('.bulb-flicker', {
        opacity: 'random(0.25, 1)',
        duration: 0.14,
        repeat: -1,
        yoyo: true,
        ease: 'steps(2)',
      });

      const interferenceTween = gsap.to('.bulb-interference', {
        x: 'random(-4, 4)',
        opacity: 'random(0.15, 0.9)',
        duration: 0.16,
        repeat: -1,
        yoyo: true,
        ease: 'none',
      });

      // Timeline principal sincronizado al scroll de la página
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });

      // 1. Etapa 1 -> Etapa 2 (0% a 52%): se apaga interferencia, irradia rojo y arma módulos
      tl.to(
        ['.bulb-interference', '.bulb-flicker'],
        {
          opacity: 0,
          duration: 0.1,
          onComplete: () => {
            flickerTween.pause();
            interferenceTween.pause();
          },
          onReverseComplete: () => {
            flickerTween.play();
            interferenceTween.play();
          },
        },
        0.04
      )
        .to(
          '.bulb-root',
          {
            y: -118,
            scale: 0.84,
            duration: 0.22,
            ease: 'power2.inOut',
          },
          0.08
        )
        .to(
          '.bulb-filament-lit',
          {
            opacity: 1,
            duration: 0.14,
          },
          0.12
        )
        .to(
          '.bulb-glow',
          {
            opacity: 0.85,
            scale: 1,
            duration: 0.18,
          },
          0.14
        )
        .to(
          '.ray-line',
          {
            strokeDashoffset: 0,
            duration: 0.18,
            stagger: 0.015,
            ease: 'power2.out',
          },
          0.18
        )
        .to(
          '.modules-group',
          {
            opacity: 1,
            y: 0,
            duration: 0.12,
          },
          0.24
        )
        .to(
          '.connector-path',
          {
            strokeDashoffset: 0,
            duration: 0.24,
            stagger: 0.03,
            ease: 'power2.inOut',
          },
          0.26
        )
        .to(
          '.module-card',
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
            stagger: 0.035,
            ease: 'power2.out',
          },
          0.34
        );

      // 2. Etapa 2 -> Etapa 3 (55% a 100%): módulos pasan a prototipos multidevice con lámpara encendida
      tl.to(
        ['.modules-group', '.connector-path', '.module-card'],
        {
          opacity: 0,
          y: -14,
          duration: 0.16,
          ease: 'power2.in',
        },
        0.56
      )
        .to(
          '.bulb-root',
          {
            x: -250,
            y: -12,
            scale: 0.9,
            duration: 0.24,
            ease: 'power2.inOut',
          },
          0.6
        )
        .to(
          '.bridge-path',
          {
            strokeDashoffset: 0,
            duration: 0.14,
            ease: 'power2.out',
          },
          0.72
        )
        .to(
          '.devices-group',
          {
            opacity: 1,
            y: 0,
            duration: 0.16,
          },
          0.74
        )
        .to(
          '.wireframe-path',
          {
            strokeDashoffset: 0,
            duration: 0.22,
            stagger: 0.015,
            ease: 'power2.out',
          },
          0.76
        )
        .to(
          '.device-screen-fill',
          {
            opacity: 1,
            duration: 0.18,
            stagger: 0.015,
            ease: 'power2.out',
          },
          0.84
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F6F6F6] flex items-center justify-center lg:justify-end lg:pr-8"
    >
      <svg
        ref={svgRef}
        viewBox="0 0 1100 650"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[940px] h-auto opacity-30 sm:opacity-35 lg:opacity-45 select-none"
      >
        <defs>
          <radialGradient id="labRedGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CC0000" stopOpacity="0.25" />
            <stop offset="65%" stopColor="#CC0000" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#CC0000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ETAPA 1 -> 3: LAMPARITA CON TITILEO, RAYOS ROJOS E IRRADIACIÓN */}
        <g className="bulb-root">
          <circle cx="550" cy="295" r="155" fill="url(#labRedGlow)" className="bulb-glow" />

          {/* Interferencia inicial */}
          <g className="bulb-interference" strokeLinecap="round">
            <line x1="388" y1="242" x2="465" y2="234" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="635" y1="226" x2="716" y2="218" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="380" y1="295" x2="452" y2="291" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="648" y1="308" x2="722" y2="303" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="406" y1="350" x2="478" y2="342" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="522" y1="264" x2="536" y2="252" stroke="#CC0000" strokeWidth="1.8" />
            <line x1="566" y1="252" x2="580" y2="263" stroke="#CC0000" strokeWidth="1.8" />
          </g>

          {/* Rayos rojos */}
          <g stroke="#CC0000" strokeWidth="2.5" strokeLinecap="round">
            <line x1="550" y1="158" x2="550" y2="184" className="ray-line" />
            <line x1="482" y1="178" x2="496" y2="200" className="ray-line" />
            <line x1="618" y1="178" x2="604" y2="200" className="ray-line" />
            <line x1="436" y1="225" x2="458" y2="238" className="ray-line" />
            <line x1="664" y1="225" x2="642" y2="238" className="ray-line" />
            <line x1="420" y1="288" x2="446" y2="288" className="ray-line" />
            <line x1="680" y1="288" x2="654" y2="288" className="ray-line" />
          </g>

          {/* Bulbo */}
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

        {/* ETAPA 2: CONECTORES ROJOS Y MÓDULOS DE TRABAJO */}
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

        {/* ETAPA 3: WIREFRAMES Y PROTOTIPOS MULTIDEVICE */}
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