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
      // Estado inicial limpio: todo oculto excepto el bulbo wireframe
      gsap.set('.stage-1-bulb', { opacity: 1, x: 0, y: 0, scale: 1 });
      gsap.set('.stage-1-interference', { opacity: 0.75 });
      gsap.set('.bulb-filament-red', { opacity: 0 });
      gsap.set('.bulb-halo', { opacity: 0, scale: 0.7, transformOrigin: 'center' });

      // Preparar trazos dibujables con strokeDasharray / strokeDashoffset
      const drawableSelectors = [
        '.stage-2-ray',
        '.stage-2-connector',
        '.stage-3-bridge',
        '.stage-3-wireframe-stroke',
      ];

      drawableSelectors.forEach((selector) => {
        const elements = gsap.utils.toArray<SVGGeometryElement>(selector);
        elements.forEach((el) => {
          const length =
            typeof el.getTotalLength === 'function' ? el.getTotalLength() : 320;
          gsap.set(el, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 1,
          });
        });
      });

      gsap.set('.stage-2-node', { opacity: 0, scale: 0, transformOrigin: 'center' });
      gsap.set('.stage-2-module', { opacity: 0, y: 18 });
      gsap.set('.stage-3-device-group', { opacity: 0, y: 20 });
      gsap.set('.stage-3-ui-fill', { opacity: 0, scaleX: 0.85, transformOrigin: 'left center' });

      // Si el usuario prefiere movimiento reducido, mostrar el estado final estático
      if (prefersReducedMotion) {
        gsap.set('.stage-1-interference', { opacity: 0 });
        gsap.set('.stage-1-bulb', { x: -240, y: -15, scale: 0.92 });
        gsap.set('.bulb-filament-red', { opacity: 1 });
        gsap.set('.bulb-halo', { opacity: 0.85, scale: 1 });
        gsap.set('.stage-2-ray', { strokeDashoffset: 0 });
        gsap.set('.stage-3-bridge, .stage-3-wireframe-stroke', { strokeDashoffset: 0 });
        gsap.set('.stage-3-device-group, .stage-3-ui-fill', { opacity: 1, y: 0, scaleX: 1 });
        return;
      }

      // Micro-interferencia ambiental continua mientras estamos en la Etapa 1
      const interferenceTween = gsap.to('.stage-1-interference', {
        x: 'random(-3, 3)',
        opacity: 'random(0.2, 0.85)',
        duration: 0.18,
        repeat: -1,
        yoyo: true,
        ease: 'none',
      });

      // Timeline maestro vinculado al scroll real de toda la página
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // =========================================================
      // FASE 1 -> FASE 2 (0% a 50% del scroll):
      // Se estabiliza el bulbo, sube, enciende en rojo y arma módulos
      // =========================================================
      tl.to(
        '.stage-1-interference',
        {
          opacity: 0,
          duration: 0.12,
          onComplete: () => {
            interferenceTween.pause();
          },
          onReverseComplete: () => {
            interferenceTween.play();
          },
        },
        0.05
      )
        .to(
          '.stage-1-bulb',
          {
            y: -115,
            scale: 0.84,
            duration: 0.22,
            ease: 'power2.inOut',
          },
          0.08
        )
        .to(
          '.bulb-filament-red',
          {
            opacity: 1,
            duration: 0.15,
          },
          0.14
        )
        .to(
          '.bulb-halo',
          {
            opacity: 0.8,
            scale: 1,
            duration: 0.2,
          },
          0.16
        )
        .to(
          '.stage-2-ray',
          {
            strokeDashoffset: 0,
            duration: 0.18,
            stagger: 0.015,
            ease: 'power2.out',
          },
          0.2
        )
        .to(
          '.stage-2-connector',
          {
            strokeDashoffset: 0,
            duration: 0.24,
            stagger: 0.03,
            ease: 'power2.inOut',
          },
          0.26
        )
        .to(
          '.stage-2-node',
          {
            opacity: 1,
            scale: 1,
            duration: 0.12,
            stagger: 0.02,
            ease: 'back.out(2)',
          },
          0.36
        )
        .to(
          '.stage-2-module',
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
            stagger: 0.03,
            ease: 'power2.out',
          },
          0.4
        );

      // =========================================================
      // FASE 2 -> FASE 3 (55% a 100% del scroll):
      // Módulos evolucionan a wireframes multidispositivo con lámpara encendida
      // =========================================================
      tl.to(
        ['.stage-2-connector', '.stage-2-node', '.stage-2-module'],
        {
          opacity: 0,
          y: -12,
          duration: 0.16,
          ease: 'power2.in',
        },
        0.58
      )
        .to(
          '.stage-1-bulb',
          {
            x: -245,
            y: -10,
            scale: 0.9,
            duration: 0.24,
            ease: 'power2.inOut',
          },
          0.62
        )
        .to(
          '.stage-3-bridge',
          {
            strokeDashoffset: 0,
            duration: 0.14,
            ease: 'power2.out',
          },
          0.74
        )
        .to(
          '.stage-3-device-group',
          {
            opacity: 1,
            y: 0,
            duration: 0.16,
          },
          0.76
        )
        .to(
          '.stage-3-wireframe-stroke',
          {
            strokeDashoffset: 0,
            duration: 0.22,
            stagger: 0.015,
            ease: 'power2.out',
          },
          0.78
        )
        .to(
          '.stage-3-ui-fill',
          {
            opacity: 1,
            scaleX: 1,
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
        className="w-full max-w-[920px] h-auto opacity-30 sm:opacity-35 lg:opacity-45 select-none"
      >
        <defs>
          <radialGradient id="alicariRedGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CC0000" stopOpacity="0.24" />
            <stop offset="65%" stopColor="#CC0000" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#CC0000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ===================================================== */}
        {/* GRUPO 1: BULBO CENTRAL (EVOLUCIONA EN LAS 3 ETAPAS)   */}
        {/* ===================================================== */}
        <g className="stage-1-bulb">
          {/* Halo rojo cuando enciende */}
          <circle cx="550" cy="295" r="155" fill="url(#alicariRedGlow)" className="bulb-halo" />

          {/* Líneas de interferencia iniciales */}
          <g className="stage-1-interference" strokeLinecap="round">
            <line x1="390" y1="242" x2="465" y2="235" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="635" y1="228" x2="715" y2="220" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="382" y1="295" x2="450" y2="292" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="648" y1="308" x2="720" y2="303" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="408" y1="348" x2="478" y2="341" stroke="#1C1C1C" strokeWidth="1.3" />
            <line x1="522" y1="264" x2="536" y2="252" stroke="#CC0000" strokeWidth="1.8" />
            <line x1="566" y1="252" x2="580" y2="263" stroke="#CC0000" strokeWidth="1.8" />
          </g>

          {/* Rayos rojos (Etapa 2 y 3) */}
          <g stroke="#CC0000" strokeWidth="2.5" strokeLinecap="round">
            <line x1="550" y1="158" x2="550" y2="184" className="stage-2-ray" />
            <line x1="482" y1="178" x2="496" y2="200" className="stage-2-ray" />
            <line x1="618" y1="178" x2="604" y2="200" className="stage-2-ray" />
            <line x1="436" y1="225" x2="458" y2="238" className="stage-2-ray" />
            <line x1="664" y1="225" x2="642" y2="238" className="stage-2-ray" />
            <line x1="420" y1="288" x2="446" y2="288" className="stage-2-ray" />
            <line x1="680" y1="288" x2="654" y2="288" className="stage-2-ray" />
          </g>

          {/* Contorno del bulbo */}
          <g stroke="#1C1C1C" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M550 205 C492 205 454 248 454 300 C454 337 476 363 493 386 C502 399 506 410 508 424 L592 424 C594 410 598 399 607 386 C624 363 646 337 646 300 C646 248 608 205 550 205 Z"
              strokeWidth="2.3"
              fill="#FFFFFF"
              fillOpacity="0.65"
            />
            {/* Trazo wireframe doble */}
            <path
              d="M547 209 C496 211 459 251 458 302 C458 336 480 361 496 384"
              strokeWidth="1"
              strokeOpacity="0.45"
            />

            {/* Filamento apagado (wireframe inicial) */}
            <g strokeWidth="1.6" strokeOpacity="0.65">
              <path d="M532 422 L532 352 L520 314" />
              <path d="M568 422 L568 352 L580 314" />
              <path d="M520 314 Q528 302 536 314 Q544 326 550 314 Q558 302 566 314 L580 314" />
            </g>

            {/* Filamento encendido en rojo Alicari */}
            <g className="bulb-filament-red" stroke="#CC0000" strokeWidth="2.4">
              <path d="M532 422 L532 352 L520 314" />
              <path d="M568 422 L568 352 L580 314" />
              <path d="M520 314 Q528 302 536 314 Q544 326 550 314 Q558 302 566 314 L580 314" />
            </g>

            {/* Casquillo */}
            <rect x="508" y="424" width="84" height="13" rx="3" strokeWidth="2" fill="#EAEAEA" />
            <rect x="512" y="437" width="76" height="13" rx="3" strokeWidth="2" fill="#EAEAEA" />
            <path d="M524 450 L576 450 L566 464 L534 464 Z" strokeWidth="2" fill="#1C1C1C" />
          </g>
        </g>

        {/* ===================================================== */}
        {/* GRUPO 2: CONECTORES Y MÓDULOS DE TRABAJO (ETAPA 2)    */}
        {/* ===================================================== */}
        <g>
          {/* Conectores de ideas desde el bulbo elevado */}
          <g stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M538 355 L538 395 L260 395 L260 430" className="stage-2-connector" />
            <path d="M450 395 L450 430" className="stage-2-connector" />
            <path d="M562 355 L562 395 L840 395 L840 430" className="stage-2-connector" />
            <path d="M650 395 L650 430" className="stage-2-connector" />
            <line x1="345" y1="495" x2="375" y2="495" className="stage-2-connector" />
            <line x1="535" y1="495" x2="565" y2="495" className="stage-2-connector" />
            <line x1="725" y1="495" x2="755" y2="495" className="stage-2-connector" />
          </g>

          {/* Nodos rojos */}
          <g fill="#CC0000">
            <circle cx="260" cy="430" r="4.5" className="stage-2-node" />
            <circle cx="450" cy="430" r="4.5" className="stage-2-node" />
            <circle cx="650" cy="430" r="4.5" className="stage-2-node" />
            <circle cx="840" cy="430" r="4.5" className="stage-2-node" />
          </g>

          {/* 4 Módulos de trabajo */}
          <g stroke="#1C1C1C" strokeWidth="1.8" fill="#FFFFFF">
            {/* Módulo 1 */}
            <g className="stage-2-module">
              <rect x="185" y="430" width="160" height="135" rx="8" />
              <line x1="185" y1="456" x2="345" y2="456" strokeWidth="1.4" />
              <circle cx="201" cy="443" r="3" fill="#CC0000" stroke="none" />
              <rect x="203" y="472" width="124" height="38" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
              <line x1="203" y1="526" x2="295" y2="526" strokeWidth="1.4" />
              <line x1="203" y1="542" x2="270" y2="542" strokeWidth="1.4" strokeOpacity="0.45" />
            </g>

            {/* Módulo 2 */}
            <g className="stage-2-module">
              <rect x="375" y="430" width="160" height="135" rx="8" />
              <line x1="375" y1="456" x2="535" y2="456" strokeWidth="1.4" />
              <circle cx="391" cy="443" r="3" fill="#CC0000" stroke="none" />
              <rect x="393" y="472" width="56" height="38" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
              <rect x="461" y="472" width="56" height="38" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
              <line x1="393" y1="526" x2="505" y2="526" strokeWidth="1.4" />
            </g>

            {/* Módulo 3 */}
            <g className="stage-2-module">
              <rect x="565" y="430" width="160" height="135" rx="8" />
              <line x1="565" y1="456" x2="725" y2="456" strokeWidth="1.4" />
              <circle cx="581" cy="443" r="3" fill="#CC0000" stroke="none" />
              <circle cx="645" cy="492" r="20" fill="#F6F6F6" strokeWidth="1.2" />
              <line x1="583" y1="526" x2="695" y2="526" strokeWidth="1.4" />
            </g>

            {/* Módulo 4 */}
            <g className="stage-2-module">
              <rect x="755" y="430" width="160" height="135" rx="8" />
              <line x1="755" y1="456" x2="915" y2="456" strokeWidth="1.4" />
              <circle cx="771" cy="443" r="3" fill="#CC0000" stroke="none" />
              <rect x="773" y="472" width="124" height="16" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
              <rect x="773" y="496" width="124" height="16" rx="4" fill="#F6F6F6" strokeWidth="1.2" />
              <line x1="773" y1="530" x2="865" y2="530" strokeWidth="1.4" />
            </g>
          </g>
        </g>

        {/* ===================================================== */}
        {/* GRUPO 3: WIREFRAMES Y PROTOTIPO MULTIDEVICE (ETAPA 3) */}
        {/* ===================================================== */}
        <g>
          {/* Puente rojo entre lámpara encendida y dispositivos */}
          <line
            x1="415"
            y1="305"
            x2="475"
            y2="305"
            stroke="#CC0000"
            strokeWidth="2.2"
            className="stage-3-bridge"
          />

          <g className="stage-3-device-group">
            {/* Monitor Desktop Wireframe */}
            <rect
              x="480"
              y="165"
              width="440"
              height="275"
              rx="12"
              fill="#FFFFFF"
              stroke="#1C1C1C"
              strokeWidth="2.2"
              className="stage-3-wireframe-stroke"
            />
            <line
              x1="480"
              y1="196"
              x2="920"
              y2="196"
              stroke="#1C1C1C"
              strokeWidth="1.5"
              className="stage-3-wireframe-stroke"
            />
            <circle cx="500" cy="180" r="4" fill="#CC0000" className="stage-3-ui-fill" />
            <circle cx="514" cy="180" r="4" fill="#1C1C1C" fillOpacity="0.25" className="stage-3-ui-fill" />
            <circle cx="528" cy="180" r="4" fill="#1C1C1C" fillOpacity="0.25" className="stage-3-ui-fill" />

            {/* Base Monitor */}
            <path
              d="M668 440 L732 440 L744 480 L656 480 Z"
              fill="#EAEAEA"
              stroke="#1C1C1C"
              strokeWidth="2"
              className="stage-3-wireframe-stroke"
            />
            <line
              x1="630"
              y1="480"
              x2="770"
              y2="480"
              stroke="#1C1C1C"
              strokeWidth="2.4"
              strokeLinecap="round"
              className="stage-3-wireframe-stroke"
            />

            {/* Retícula Wireframe Desktop */}
            <rect
              x="505"
              y="236"
              width="215"
              height="90"
              rx="6"
              fill="#F6F6F6"
              stroke="#1C1C1C"
              strokeWidth="1.2"
              className="stage-3-wireframe-stroke"
            />
            <line
              x1="505"
              y1="236"
              x2="720"
              y2="326"
              stroke="#1C1C1C"
              strokeOpacity="0.22"
              strokeWidth="1"
              className="stage-3-wireframe-stroke"
            />
            <line
              x1="720"
              y1="236"
              x2="505"
              y2="326"
              stroke="#1C1C1C"
              strokeOpacity="0.22"
              strokeWidth="1"
              className="stage-3-wireframe-stroke"
            />

            <rect x="738" y="238" width="154" height="13" rx="3" fill="#1C1C1C" className="stage-3-ui-fill" />
            <rect x="738" y="260" width="132" height="8" rx="2" fill="#1C1C1C" fillOpacity="0.35" className="stage-3-ui-fill" />
            <rect x="738" y="276" width="114" height="8" rx="2" fill="#1C1C1C" fillOpacity="0.35" className="stage-3-ui-fill" />
            <rect x="738" y="302" width="72" height="22" rx="4" fill="#CC0000" className="stage-3-ui-fill" />

            {/* 3 Cards Wireframe inferiores */}
            <rect
              x="505"
              y="344"
              width="120"
              height="74"
              rx="6"
              fill="#F6F6F6"
              stroke="#1C1C1C"
              strokeWidth="1.2"
              className="stage-3-wireframe-stroke"
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
              className="stage-3-wireframe-stroke"
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
              className="stage-3-wireframe-stroke"
            />

            {/* Dispositivo Mobile superpuesto */}
            <rect
              x="885"
              y="265"
              width="126"
              height="218"
              rx="16"
              fill="#FFFFFF"
              stroke="#1C1C1C"
              strokeWidth="2.2"
              className="stage-3-wireframe-stroke"
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
              className="stage-3-wireframe-stroke"
            />
            <line
              x1="900"
              y1="308"
              x2="996"
              y2="366"
              stroke="#1C1C1C"
              strokeOpacity="0.22"
              strokeWidth="1"
              className="stage-3-wireframe-stroke"
            />
            <rect x="900" y="378" width="76" height="8" rx="2" fill="#1C1C1C" className="stage-3-ui-fill" />
            <rect x="900" y="393" width="60" height="6" rx="2" fill="#1C1C1C" fillOpacity="0.35" className="stage-3-ui-fill" />
            <rect x="900" y="410" width="48" height="16" rx="3" fill="#CC0000" className="stage-3-ui-fill" />
          </g>
        </g>
      </svg>
    </div>
  );
};