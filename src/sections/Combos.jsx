import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { gsap, magnetic } from "../lib/motion.js";
import { COMBOS, COMBO_PRICE, WHATSAPP } from "../data.js";

gsap.registerPlugin(useGSAP);

/*
  Layout family: horizontal pan (taste-skill 5.B) on a full-bleed amarillo field.
  md+ with motion: the section pins at "top top" and the inner track scrubs on x until the
  payoff panel sits flush right. Cards tilt/skew with scroll velocity. The Estrella card shows
  its floating cut-out; every other combo shows its photo in a rounded-[32px] 4/3 frame that
  opens with a clip-path inset reveal. The $258 sticker (a badge, not an image) spins with scroll.
  Mobile or reduced motion: intro stacked above a native scroll-snap carousel, then the payoff.
  Text on amarillo is always marino (9.7:1). No mascot here (it lives only in CtaFinal).
*/

const PAN = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const MOBILE = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";
const MOTION = "(prefers-reduced-motion: no-preference)";

const FRAME_FROM = "inset(100% 0% 0% 0% round 32px)";
const FRAME_TO = "inset(0% 0% 0% 0% round 32px)";

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
        // The Estrella cut-out floats on its own (no frame).
        gsap.to(q("[data-floaty]"), { y: -14, rotation: 3, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });

        const offs = q("[data-magnetic]").map((el) => magnetic(el));
        return () => offs.forEach((off) => off());
      });

      // Desktop: pinned horizontal pan + velocity tilt + containerAnimation details.
      mm.add(PAN, () => {
        const el = track.current;
        // clientWidth excludes the vertical scrollbar, so the payoff panel ends flush right.
        const distance = () => Math.max(0, el.scrollWidth - document.documentElement.clientWidth);

        const tilts = q("[data-tilt]");
        const setSkew = gsap.quickSetter(tilts, "skewX", "deg");
        const setRot = gsap.quickSetter(tilts, "rotation", "deg");
        const clampSkew = gsap.utils.clamp(-9, 9);
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
              const s = clampSkew(self.getVelocity() / -260);
              if (Math.abs(s) > Math.abs(proxy.skew)) {
                proxy.skew = s;
                gsap.to(proxy, {
                  skew: 0,
                  duration: 0.9,
                  ease: "power3",
                  overwrite: true,
                  onUpdate: () => {
                    setSkew(proxy.skew);
                    setRot(proxy.skew * 0.35);
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

        // The Estrella cut-out turns gently as it crosses the viewport.
        q("[data-spin]").forEach((sp) => {
          gsap.fromTo(
            sp,
            { rotation: -12 },
            {
              rotation: 12,
              ease: "none",
              scrollTrigger: { trigger: sp, containerAnimation: pan, start: "left right", end: "right left", scrub: true },
            }
          );
        });

        // Photos inside their frames drift (scale) as they cross; the frame itself stays still.
        q("[data-zoom]").forEach((img) => {
          gsap.fromTo(
            img,
            { scale: 1.18 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: img, containerAnimation: pan, start: "left right", end: "right left", scrub: true },
            }
          );
        });

        const vw = document.documentElement.clientWidth;

        // Frame reveals: clip-path inset opens once, played (never scrubbed) so it always completes.
        q("[data-frame]").forEach((frame) => {
          const visible = frame.getBoundingClientRect().left < vw;
          gsap.fromTo(
            frame,
            { clipPath: FRAME_FROM },
            {
              clipPath: FRAME_TO,
              duration: 1.1,
              ease: "expo.out",
              scrollTrigger: visible
                ? { trigger: wrap.current, start: "top 88%", once: true }
                : { trigger: frame, containerAnimation: pan, start: "left 100%", once: true },
            }
          );
        });

        // Cards that start offscreen rise and straighten as they slide in (played, not scrubbed).
        q("[data-card]").forEach((card, i) => {
          if (card.offsetLeft < vw) return;
          gsap.from(card, {
            y: 120,
            rotation: i % 2 ? -8 : 8,
            opacity: 0,
            duration: 0.9,
            ease: "back.out(1.4)",
            scrollTrigger: { trigger: card, containerAnimation: pan, start: "left 100%", toggleActions: "play none none none" },
          });
        });

        // Payoff copy and CTA: played when the panel enters, ends at opacity 1 regardless of scroll stop.
        const payoff = q("[data-payoff]")[0];
        gsap.from(q("[data-payoff-line]"), {
          y: 70,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: payoff, containerAnimation: pan, start: "left 100%", toggleActions: "play none none none" },
        });
      });

      // Mobile: sticker spins with page scroll, carousel cards slide in once, frames open.
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
        gsap.fromTo(
          q("[data-frame]"),
          { clipPath: FRAME_FROM },
          {
            clipPath: FRAME_TO,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.1,
            scrollTrigger: { trigger: carousel, start: "top 88%", once: true },
          }
        );
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
          className="relative flex w-max items-stretch gap-4 px-4 will-change-transform md:gap-6 md:pl-[max(2rem,calc((100vw_-_1400px)/2_+_2rem))] md:pr-8 md:motion-safe:h-[100dvh] md:motion-safe:items-center md:motion-safe:gap-[4.5vw] md:motion-safe:pb-10 md:motion-safe:pt-24"
        >
          {/* Desktop intro panel, first stop of the pan */}
          <div className="hidden w-[min(50vw,820px)] shrink-0 flex-col justify-center md:motion-safe:flex">
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

          {COMBOS.map((combo, i) => {
            const isStar = combo.name === "Estrella";
            const alt = `Combo ${combo.name}: ${combo.items.toLowerCase()}`;
            return (
              <article key={combo.name} data-card className="w-[78vw] shrink-0 snap-start md:w-[clamp(300px,28vw,420px)]">
                <div
                  data-tilt
                  className="flex h-full flex-col rounded-[32px] bg-blanco p-5 shadow-[0_30px_60px_-30px_rgb(27_39_102/0.5)] will-change-transform md:p-6"
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="display text-2xl tabular-nums text-marino/70">0{i + 1}</span>
                    <span className="rounded-full bg-amarillo px-3 py-1 text-sm font-bold tabular-nums text-marino">
                      {COMBO_PRICE}
                    </span>
                  </div>

                  {isStar ? (
                    // Cut-out floats freely in the same 4/3 slot (no frame, no mask).
                    <div className="relative mx-auto mt-4 flex aspect-[4/3] w-full max-w-[min(100%,46dvh)] items-center justify-center">
                      <div data-spin className="w-[96%]">
                        <img
                          data-floaty
                          src="/cut/estrella.webp"
                          alt={alt}
                          width="702"
                          height="416"
                          loading="lazy"
                          decoding="async"
                          className="h-auto w-full drop-shadow-[0_22px_26px_rgb(27_39_102/0.35)]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      data-frame
                      className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-[min(100%,46dvh)] overflow-hidden rounded-[32px] bg-espuma"
                    >
                      <img
                        data-zoom
                        src={combo.img}
                        alt={alt}
                        width="560"
                        height="420"
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="display mt-6 px-1 text-[clamp(2.75rem,4vw,4rem)]">{combo.name}</h3>
                  <p className="mt-3 px-1 text-base leading-relaxed text-marino/80">{combo.items}</p>
                </div>
              </article>
            );
          })}

          {/* Desktop payoff panel: closes the pan flush right. Type only, nothing on top of it. */}
          <div data-payoff className="hidden w-[min(40vw,560px)] shrink-0 flex-col items-start justify-center md:motion-safe:flex">
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
