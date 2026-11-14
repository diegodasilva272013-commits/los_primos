import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { gsap, magnetic } from "../lib/motion.js";
import { COMBOS, COMBO_PRICE, WHATSAPP } from "../data.js";

gsap.registerPlugin(useGSAP);

/*
  Layout family: horizontal pan (taste-skill 5.B) on a full-bleed amarillo field.
  v3: every card is a brand-color panel where the HD cut-out plate FILLS the card and bleeds past its
  edges (overflow-hidden), lit by a soft radial studio light with a contact shadow under the plate.
  Name, items and the $258 pill sit on a marino scrim at the bottom (blanco on abismo/marino, 13:1+).
  md+ with motion: the section pins and the track scrubs on x; cards skew with scroll velocity and
  each plate drifts inside its card (containerAnimation parallax).
  Mobile or reduced motion: intro, then a native scroll-snap carousel of the same cards, then payoff.
  Text on amarillo is always marino (9.7:1).
*/

const PAN = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const MOBILE = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";
const MOTION = "(prefers-reduced-motion: no-preference)";

/* Panel color per card. `num` = ink for the decorative index number (contrast-safe per DESIGN.md). */
const PANELS = [
  { bg: "bg-cielo", num: "text-marino", light: "rgb(255 255 255 / 0.55)" },
  { bg: "bg-coral", num: "text-marino", light: "rgb(255 240 220 / 0.55)" },
  { bg: "bg-marino-2", num: "text-blanco", light: "rgb(38 160 220 / 0.55)" },
  { bg: "bg-cielo-2", num: "text-abismo", light: "rgb(255 255 255 / 0.5)" },
  { bg: "bg-abismo", num: "text-blanco", light: "rgb(246 216 64 / 0.32)" },
];

/** Accessible char split: screen readers get the plain string, chars are decorative. */
function Chars({ text }) {
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => (
          <Fragment key={wi}>
            <span className="inline-block whitespace-nowrap [clip-path:inset(-0.35em_-0.15em_-0.12em_-0.15em)]">
              {[...w].map((c, ci) => (
                <span key={ci} data-char className="inline-block will-change-transform">
                  {c}
                </span>
              ))}
            </span>
            {wi < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </>
  );
}

/** Rotating price sticker: marino disc, amarillo type (9.7:1). The ring spins with scroll. */
function Sticker({ ringId }) {
  return (
    <div
      data-sticker
      className="relative grid aspect-square w-[clamp(9.5rem,13vw,13.5rem)] shrink-0 place-items-center rounded-full bg-marino text-amarillo shadow-[0_26px_50px_-20px_rgb(27_39_102/0.6)]"
    >
      <svg data-ring viewBox="0 0 200 200" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <defs>
          <path id={ringId} d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
        </defs>
        <text className="fill-amarillo font-sans text-[14px] font-bold uppercase" textLength="500" lengthAdjust="spacing">
          <textPath href={`#${ringId}`}>Cualquier combo · Mismo precio · </textPath>
        </text>
      </svg>
      <span data-price className="display inline-block text-[clamp(2.4rem,3.9vw,4rem)] leading-none">
        {COMBO_PRICE}
      </span>
    </div>
  );
}

function WhatsCta({ className = "" }) {
  return (
    <a href={WHATSAPP} target="_blank" rel="noopener" data-magnetic className={`btn btn-marino min-h-[56px] ${className}`}>
      <WhatsappLogo size={22} weight="bold" aria-hidden="true" />
      Pedir por WhatsApp
    </a>
  );
}

/*
  Card layers (outer to inner):
  article[data-card] entrance > [data-tilt] velocity skew + panel > plate position (CSS) >
  [data-par] pan parallax > hover zoom (CSS group-hover) > img[data-floaty] idle float.
*/
function ComboCard({ combo, i }) {
  const p = PANELS[i % PANELS.length];
  const alt = `Combo ${combo.name}: ${combo.items.toLowerCase()}`;
  return (
    <article
      data-card
      className="h-[min(70vh,560px)] w-[82vw] max-w-[440px] shrink-0 snap-start md:h-[min(72dvh,640px)] md:w-[min(34vw,520px)] md:max-w-none"
    >
      <div
        data-tilt
        className={`group relative isolate h-full overflow-hidden rounded-[32px] ${p.bg} shadow-[0_40px_70px_-30px_rgb(12_21_56/0.6)] will-change-transform`}
      >
        {/* Studio light: soft radial highlight behind the plate */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{ background: `radial-gradient(70% 55% at 50% 36%, ${p.light}, transparent 72%)` }}
        />

        {/* Decorative index number, top-left above the plate */}
        <span aria-hidden="true" className={`display absolute left-6 top-5 z-20 text-3xl tabular-nums md:left-7 md:top-6 md:text-4xl ${p.num}`}>
          0{i + 1}
        </span>

        {/* Plate: ~145% of the card width, centered high, bleeding past both edges */}
        <div className="absolute left-1/2 top-[40%] w-[145%] -translate-x-1/2 -translate-y-1/2">
          <div data-par className="will-change-transform">
            <div className="relative isolate transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:-rotate-2 group-hover:scale-[1.06]">
              {/* Contact shadow under the plate */}
              <div
                aria-hidden="true"
                className="absolute inset-x-[14%] bottom-[-2%] h-[20%] -z-10 rounded-[50%] bg-[radial-gradient(closest-side,rgb(6_10_30/0.55),transparent)]"
              />
              <img
                data-floaty
                src={combo.img}
                alt={alt}
                width={combo.w}
                height={combo.h}
                loading="lazy"
                decoding="async"
                className="h-auto w-full drop-shadow-[0_26px_30px_rgb(6_10_30/0.45)]"
              />
            </div>
          </div>
        </div>

        {/* Light sweep on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 -translate-x-[120%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:translate-x-[260%]"
        />

        {/* Bottom scrim + copy (blanco on abismo/marino) */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 h-[58%] bg-gradient-to-t from-abismo via-marino/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-7">
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <h3 className="display text-[clamp(2.75rem,4vw,4rem)] text-blanco">{combo.name}</h3>
            <span className="mb-1 rounded-full bg-amarillo px-4 py-1.5 text-base font-bold tabular-nums text-marino">
              {COMBO_PRICE}
            </span>
          </div>
          <p className="mt-3 text-pretty text-base leading-relaxed text-blanco/85">{combo.items}</p>
        </div>
      </div>
    </article>
  );
}

export default function Combos() {
  const wrap = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = (sel) => gsap.utils.toArray(sel, wrap.current);

      // Shared motion (any width): headline rise, sticker pop, idle float, magnetic CTAs.
      mm.add(MOTION, () => {
        gsap.from(q("[data-char]"), {
          yPercent: 120,
          rotation: 8,
          duration: 1,
          ease: "expo.out",
          stagger: 0.05,
          scrollTrigger: { trigger: wrap.current, start: "top 88%", once: true },
        });
        gsap.from(q("[data-sticker]"), {
          scale: 0,
          rotation: -120,
          duration: 1.1,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: wrap.current, start: "top 88%", once: true },
        });
        q("[data-floaty]").forEach((img, i) => {
          gsap.to(img, {
            y: -10,
            rotation: i % 2 ? -1.5 : 1.5,
            duration: 2.4 + (i % 3) * 0.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * 0.2,
          });
        });

        const offs = q("[data-magnetic]").map((el) => magnetic(el));
        return () => offs.forEach((off) => off());
      });

      // Desktop: pinned horizontal pan + velocity skew + plate parallax inside each card.
      mm.add(PAN, () => {
        const el = track.current;
        // clientWidth excludes the vertical scrollbar, so the payoff panel ends flush right.
        const distance = () => Math.max(0, el.scrollWidth - document.documentElement.clientWidth);

        const tilts = q("[data-tilt]");
        const setSkew = gsap.quickSetter(tilts, "skewX", "deg");
        const setRot = gsap.quickSetter(tilts, "rotation", "deg");
        const clampSkew = gsap.utils.clamp(-8, 8);
        const proxy = { skew: 0 };

        const pan = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const s = clampSkew(self.getVelocity() / -280);
              if (Math.abs(s) > Math.abs(proxy.skew)) {
                proxy.skew = s;
                gsap.to(proxy, {
                  skew: 0,
                  duration: 0.9,
                  ease: "power3",
                  overwrite: true,
                  onUpdate: () => {
                    setSkew(proxy.skew);
                    setRot(proxy.skew * 0.3);
                  },
                });
              }
            },
          },
        });

        // Sticker ring spins through the whole section; the price wobbles but stays readable.
        const spinST = {
          trigger: wrap.current,
          start: "top bottom",
          end: () => `+=${window.innerHeight + distance()}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        };
        gsap.to(q("[data-ring]"), { rotation: 720, transformOrigin: "50% 50%", ease: "none", scrollTrigger: spinST });
        gsap.fromTo(q("[data-price]"), { rotation: -14 }, { rotation: 10, ease: "none", scrollTrigger: { ...spinST } });

        // Plate parallax: each plate travels against the pan while its card crosses the viewport.
        q("[data-par]").forEach((par, i) => {
          gsap.fromTo(
            par,
            { xPercent: 9, rotation: i % 2 ? 5 : -5 },
            {
              xPercent: -9,
              rotation: i % 2 ? -3 : 3,
              ease: "none",
              scrollTrigger: {
                trigger: par.closest("[data-card]"),
                containerAnimation: pan,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });

        const vw = document.documentElement.clientWidth;

        // Cards that start offscreen rise and straighten as they slide in (played, not scrubbed).
        q("[data-card]").forEach((card, i) => {
          if (card.offsetLeft < vw) return;
          gsap.from(card, {
            y: 120,
            rotation: i % 2 ? -7 : 7,
            opacity: 0,
            duration: 0.9,
            ease: "back.out(1.4)",
            scrollTrigger: { trigger: card, containerAnimation: pan, start: "left 100%", once: true },
          });
        });

        // Payoff copy and CTA: played once when the panel enters, always ends at opacity 1.
        const payoff = q("[data-payoff]")[0];
        gsap.fromTo(
          q("[data-payoff-line]"),
          { y: 70, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.12,
            scrollTrigger: { trigger: payoff, containerAnimation: pan, start: "left 100%", once: true },
          }
        );
      });

      // Mobile: sticker spins with page scroll, carousel cards slide in once.
      mm.add(MOBILE, () => {
        gsap.to(q("[data-ring]"), {
          rotation: 540,
          transformOrigin: "50% 50%",
          ease: "none",
          scrollTrigger: { trigger: wrap.current, start: "top bottom", end: "bottom top", scrub: 0.6 },
        });
        const carousel = q("[data-carousel]")[0];
        gsap.from(q("[data-card]"), {
          x: 90,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: carousel, start: "top 88%", once: true },
        });
        gsap.from(q("[data-payoff-m]"), {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: q("[data-payoff-m]")[0], start: "top 88%", once: true },
        });
      });
    },
    { scope: wrap }
  );

  return (
    <section
      id="combos"
      ref={wrap}
      aria-label="Combos"
      className="relative overflow-hidden bg-amarillo pb-20 pt-28 text-marino md:pb-28 md:pt-36 md:motion-safe:pb-0 md:motion-safe:pt-0"
    >
      {/* Intro (mobile, or desktop with reduced motion): normal flow above the carousel */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 md:motion-safe:hidden">
        <h2 className="display text-[clamp(5rem,24vw,10rem)]">
          <Chars text="Combos" />
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <Sticker ringId="combo-ring-m" />
          <p className="max-w-[28ch] text-lg font-medium leading-relaxed md:text-xl">
            Cinco combinaciones al mismo precio. Para comer completo sin pensarle.
          </p>
        </div>
      </div>

      <div
        role="region"
        aria-label="Lista de combos"
        tabIndex={0}
        data-carousel
        className="mt-10 w-full snap-x snap-mandatory scroll-px-4 overflow-x-auto overscroll-x-contain pb-6 [scrollbar-width:none] md:mt-14 md:scroll-pl-[max(2rem,calc((100vw_-_1400px)/2_+_2rem))] md:motion-safe:mt-0 md:motion-safe:snap-none md:motion-safe:overflow-visible md:motion-safe:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        <div
          ref={track}
          className="relative flex w-max items-stretch gap-4 px-4 will-change-transform md:gap-6 md:pl-[max(2rem,calc((100vw_-_1400px)/2_+_2rem))] md:pr-8 md:motion-safe:h-[100dvh] md:motion-safe:items-center md:motion-safe:gap-[3vw] md:motion-safe:pb-10 md:motion-safe:pt-24"
        >
          {/* Desktop intro panel, first stop of the pan */}
          <div className="hidden w-[min(46vw,780px)] shrink-0 flex-col justify-center md:motion-safe:flex">
            <h2 className="display text-[clamp(6rem,14vw,14rem)]">
              <Chars text="Combos" />
            </h2>
            <div className="mt-8 flex items-center gap-8">
              <Sticker ringId="combo-ring-d" />
              <p className="max-w-[24ch] text-xl font-medium leading-relaxed lg:text-2xl">
                Cinco combinaciones al mismo precio. Para comer completo sin pensarle.
              </p>
            </div>
          </div>

          {COMBOS.map((combo, i) => (
            <ComboCard key={combo.name} combo={combo} i={i} />
          ))}

          {/* Desktop payoff panel: closes the pan flush right. Type only, nothing on top of it. */}
          <div data-payoff className="hidden w-[min(40vw,560px)] shrink-0 flex-col items-start justify-center pl-[2vw] md:motion-safe:flex">
            <p data-payoff-line className="display display-stack text-[clamp(3rem,5.6vw,6.5rem)] text-marino">
              Cualquier combo, {COMBO_PRICE}.
            </p>
            <div data-payoff-line className="mt-8">
              <WhatsCta />
            </div>
          </div>
        </div>
      </div>

      {/* Payoff (mobile, or desktop with reduced motion) */}
      <div data-payoff-m className="mx-auto mt-12 max-w-[1400px] px-4 md:px-8 md:motion-safe:hidden">
        <p className="display display-stack text-[clamp(2.75rem,12vw,5rem)] text-marino">Cualquier combo, {COMBO_PRICE}.</p>
        <WhatsCta className="mt-6" />
      </div>
    </section>
  );
}
