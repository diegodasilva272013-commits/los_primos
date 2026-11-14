import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { SABORES } from "../data.js";
import { gsap, scrollToTarget } from "../lib/motion.js";

gsap.registerPlugin(useGSAP);

/*
  Four sabores, one color-morph story (CHISPA reel): full-bleed color, ONE floating cut-out product per screen.
  Desktop (lg+, motion allowed): pinned stage, 12 cols. Text cols 1-6, product cols 7-12: the product never
  covers text. The outlined names band slides only behind the product half. Each step the old product flies
  out right and the new one flies in from the left.
  Mobile / reduced motion: stacked color blocks (name, line, product, body, specs), visible by default.
*/
const PIN_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const MOBILE_MOTION = "(prefers-reduced-motion: no-preference)";
const MASK = { clipPath: "inset(-0.3em -0.1em -0.1em -0.1em)" };
const LAST = SABORES.length - 1;

const ALT = {
  pulpo: "Pulpo zarandeado a las brasas con arroz y verdura fresca",
  brochetas: "Brochetas de camarón con pimiento, tocino, arroz y brócoli",
  bbq: "Camarones envueltos en tocino bañados en salsa barbecue, con arroz y verdura",
  estrella: "Combo Estrella con tostada de ceviche, camaroncitos, camarón envuelto y taco",
};

// Widest word of each name in Anton em units (ZARANDEADO, BROCHETAS, ENVUELTOS, ESTRELLA): names fill their column.
const WORD_EM = { pulpo: 4.73, brochetas: 4.0, bbq: 4.0, estrella: 3.6 };

function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const on = () => setMatch(mql.matches);
    on();
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, [query]);
  return match;
}

/* Visual per-character name; the accessible name lives on the h3 (aria-label). */
function Name({ text, charClass }) {
  const words = text.split(" ");
  return (
    <span aria-hidden="true">
      {words.map((w, wi) => (
        <span key={wi}>
          <span className="inline-block" style={MASK}>
            {[...w].map((c, ci) => (
              <span key={ci} className={`inline-block ${charClass}`}>
                {c}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

/* Price first and big, then the other two specs: three columns. */
function Specs({ specs, className = "" }) {
  return (
    <dl className={`grid grid-cols-[auto_auto_auto] items-end justify-start gap-x-6 sm:gap-x-9 lg:gap-x-12 ${className}`}>
      {specs.map(([label, value], i) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-bold uppercase tracking-[0.14em]">{label}</dt>
          <dd
            className={`display mt-2 ${
              i === 0 ? "text-5xl leading-[0.9] sm:text-6xl lg:text-[length:clamp(3rem,7dvh,5.5rem)]" : "text-xl leading-none sm:text-2xl lg:text-3xl"
            }`}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* Free-floating cut-out: no frame, no mask, just the product and its shadow. */
function Product({ s, className = "", eager = false }) {
  return (
    <img
      src={s.img}
      width={s.w}
      height={s.h}
      alt={ALT[s.id]}
      loading={eager ? undefined : "lazy"}
      decoding="async"
      className={`h-full w-full object-contain drop-shadow-[0_40px_36px_rgba(12,21,56,0.42)] ${className}`}
    />
  );
}

/* Soft contact shadow under a floating product (decorative ellipse, not an image mask). */
function Contact({ cls }) {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 -bottom-[4%] flex justify-center">
      <div className={`${cls} h-8 w-[60%] rounded-[50%] bg-abismo/45 blur-2xl`} />
    </div>
  );
}

/* Pinned stage (desktop, motion allowed) */
function Stage({ active, goTo }) {
  const s0 = SABORES[0];
  // The outer div is React's; ScrollTrigger wraps .sab-stage in its pin-spacer.
  return (
    <div>
      <div className="sab-stage relative h-[100dvh] overflow-hidden">
        <div className="sab-bg absolute inset-0" style={{ backgroundColor: s0.color }} />

        <div className="sab-ink absolute inset-0" style={{ color: s0.ink }}>
          {/* Giant outlined names: only behind the product half, faded in from its left edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/2 right-0 top-0 flex items-center overflow-hidden opacity-25 [mask-image:linear-gradient(to_right,transparent,black_18%)]"
          >
            <div
              className="sab-track display outline-text flex w-max gap-[0.5em] whitespace-nowrap pl-[6vw]"
              style={{ fontSize: "min(30dvh, 18vw)", lineHeight: 1.1 }}
            >
              {SABORES.map((s) => (
                <span key={s.id}>{s.name}</span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto grid h-full max-w-[1400px] grid-cols-12 gap-x-8 px-8 pb-28 pt-28">
            {/* Text cols 1-6: every sabor stacked in the same cell, only one visible */}
            <div className="col-span-6 grid items-center self-center" style={{ containerType: "inline-size" }}>
              {SABORES.map((s, i) => (
                <article
                  key={s.id}
                  className="sab-copy col-start-1 row-start-1"
                  style={{ color: s.ink, ...(i === 0 ? null : { visibility: "hidden", opacity: 0 }) }}
                >
                  <h3
                    aria-label={s.name}
                    className="display display-stack"
                    style={{ fontSize: `min(${(80 / WORD_EM[s.id]).toFixed(2)}cqw, 13dvh, 8.5rem)` }}
                  >
                    <Name text={s.name} charClass="sab-char" />
                  </h3>
                  <p className="sab-reveal mt-[2.2dvh] text-pretty text-2xl font-bold leading-tight xl:text-3xl">{s.line}</p>
                  <p className="sab-reveal mt-2 max-w-[44ch] text-pretty text-lg font-medium leading-relaxed">{s.body}</p>
                  <Specs specs={s.specs} className="sab-reveal mt-[3dvh]" />
                </article>
              ))}
            </div>

            {/* Product cols 7-12: one floating cut-out at a time */}
            <div className="relative col-span-6 flex items-center justify-start pl-4">
              <div className="sab-prod-in relative aspect-[4/3] w-[min(46vw,720px,82dvh)]">
                <Contact cls="sab-contact" />
                <div className="sab-turn h-full w-full">
                  <div className="sab-float h-full w-full">
                    {SABORES.map((s, i) => (
                      <div
                        key={s.id}
                        aria-hidden={i === active ? undefined : "true"}
                        className="sab-prod absolute inset-0 flex items-center justify-center"
                        style={i === 0 ? undefined : { visibility: "hidden", opacity: 0 }}
                      >
                        <Product s={s} eager={i === 0} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress: the four names, clickable to their step */}
          <nav aria-label="Sabores" className="absolute inset-x-0 bottom-8">
            <ul className="mx-auto flex max-w-[1400px] flex-wrap gap-x-2 px-6">
              {SABORES.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "step" : undefined}
                    className={`display group relative inline-flex min-h-12 items-center rounded-full px-4 text-2xl transition-shadow duration-300 xl:text-3xl ${
                      i === active ? "ring-2 ring-current" : ""
                    }`}
                  >
                    {s.name}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-4 bottom-2 h-[3px] origin-left rounded-full bg-current transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
                        i === active ? "scale-x-0" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

/* Stacked blocks: mobile/tablet, and desktop with reduced motion.
   Mobile order: name, line, product, body, specs. lg: text cols 1-6, product cols 7-12. */
function Stacked() {
  return (
    <div>
      {SABORES.map((s) => (
        <article key={s.id} style={{ backgroundColor: s.color, color: s.ink }} className="sab-block relative overflow-hidden">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 px-4 py-16 md:px-8 md:py-24 lg:grid-flow-dense lg:grid-cols-12 lg:items-center lg:gap-x-8">
            <h3
              aria-label={s.name}
              className="display display-stack lg:col-span-6 lg:col-start-1"
              style={{ fontSize: `min(${(86 / WORD_EM[s.id]).toFixed(2)}vw, 8rem)` }}
            >
              <Name text={s.name} charClass="sab-m-char" />
            </h3>
            <p className="sab-m-reveal mt-4 text-pretty text-2xl font-bold leading-tight md:text-3xl lg:col-span-6 lg:col-start-1">
              {s.line}
            </p>
            <div className="relative mx-auto my-10 w-[88vw] max-w-[640px] lg:col-span-6 lg:col-start-7 lg:row-span-4 lg:row-start-1 lg:my-0 lg:w-full lg:max-w-[720px]">
              <div className="sab-m-prod relative aspect-[4/3] w-full">
                <Contact cls="" />
                <div className="sab-m-turn h-full w-full">
                  <div className="sab-m-float h-full w-full">
                    <Product s={s} />
                  </div>
                </div>
              </div>
            </div>
            <p className="sab-m-reveal max-w-[44ch] text-pretty text-lg font-medium leading-relaxed lg:col-span-6 lg:col-start-1 lg:mt-3">
              {s.body}
            </p>
            <Specs specs={s.specs} className="sab-m-reveal mt-8 lg:col-span-6 lg:col-start-1" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Sabores() {
  const root = useRef(null);
  const stRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const pinned = useMedia(PIN_QUERY);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      if (pinned) {
        mm.add(PIN_QUERY, () => {
          const stage = root.current.querySelector(".sab-stage");
          if (!stage) return;
          const q = gsap.utils.selector(stage);
          const copies = q(".sab-copy");
          const prods = q(".sab-prod");
          const track = q(".sab-track")[0];

          // Idle: the product floats and breathes, independent of scroll.
          gsap.set(q(".sab-turn"), { transformPerspective: 1000 });
          gsap.set(q(".sab-float"), { y: 12, rotation: -2 });
          gsap
            .timeline({ repeat: -1, yoyo: true, defaults: { duration: 2.8, ease: "sine.inOut" } })
            .to(q(".sab-float"), { y: -12, rotation: 2 }, 0)
            .fromTo(q(".sab-contact"), { scaleX: 1, opacity: 0.6 }, { scaleX: 0.75, opacity: 0.3 }, 0);

          // Entrance before the pin: name rises, product spins in. Short, once.
          gsap
            .timeline({ scrollTrigger: { trigger: stage, start: "top 80%", once: true } })
            .from(copies[0].querySelectorAll(".sab-char"), { yPercent: 115, duration: 0.6, stagger: 0.03, ease: "power3.out" }, 0)
            .from(copies[0].querySelectorAll(".sab-reveal"), { y: 30, opacity: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" }, 0.15)
            .from(q(".sab-prod-in"), { xPercent: -30, rotation: -30, scale: 0.7, opacity: 0, duration: 1, ease: "back.out(1.4)" }, 0);

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: () => `+=${LAST * 140}%`,
              pin: true,
              pinSpacing: true,
              scrub: 0.5,
              invalidateOnRefresh: true,
              snap: { snapTo: 1 / LAST, inertia: false, duration: { min: 0.2, max: 0.45 }, delay: 0.05, ease: "power1.inOut" },
              onUpdate(self) {
                const idx = Math.round(self.progress * LAST);
                if (idx !== activeRef.current) {
                  activeRef.current = idx;
                  setActive(idx);
                }
              },
            },
          });

          // Continuous: the product turns and tilts with scroll, the outlined names slide behind it.
          tl.fromTo(q(".sab-turn"), { rotation: -8, rotationY: -14 }, { rotation: 8, rotationY: 14, duration: LAST }, 0).to(
            track,
            { x: () => -Math.max(0, track.scrollWidth - window.innerWidth * 0.45), duration: LAST },
            0
          );

          // Each step finishes well before its snap point (i), so a snapped step is always fully revealed.
          for (let i = 1; i <= LAST; i++) {
            const s = SABORES[i];
            const at = i - 0.85;
            const chars = copies[i].querySelectorAll(".sab-char");
            const reveals = copies[i].querySelectorAll(".sab-reveal");
            tl.to(q(".sab-bg"), { backgroundColor: s.color, duration: 0.5, ease: "power2.inOut" }, at)
              .to(q(".sab-ink"), { color: s.ink, duration: 0.5, ease: "power2.inOut" }, at)
              .to(copies[i - 1], { autoAlpha: 0, y: -40, duration: 0.22, ease: "power2.in" }, at)
              .fromTo(copies[i], { autoAlpha: 0, y: 0 }, { autoAlpha: 1, duration: 0.02 }, at + 0.22)
              .fromTo(chars, { yPercent: 115 }, { yPercent: 0, duration: 0.28, stagger: 0.015, ease: "power3.out" }, at + 0.22)
              .fromTo(reveals, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.24, stagger: 0.04, ease: "power2.out" }, at + 0.3)
              .to(prods[i - 1], { xPercent: 40, rotation: 25, scale: 0.7, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, at)
              .fromTo(
                prods[i],
                { xPercent: -60, rotation: -25, scale: 0.7, autoAlpha: 0 },
                { xPercent: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.42, ease: "back.out(1.6)" },
                at + 0.2
              );
          }
          tl.set({}, {}, LAST); // timeline length == step count, so snap 1/LAST lands on rest states

          stRef.current = tl.scrollTrigger;

          return () => {
            stRef.current = null;
            activeRef.current = 0;
            setActive(0);
          };
        });
      } else {
        mm.add(MOBILE_MOTION, () => {
          gsap.utils.toArray(".sab-block", root.current).forEach((block, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            const prod = block.querySelector(".sab-m-prod");
            gsap
              .timeline({ scrollTrigger: { trigger: block, start: "top 88%", once: true } })
              .from(block.querySelectorAll(".sab-m-char"), { yPercent: 115, duration: 0.5, stagger: 0.025, ease: "power3.out" }, 0)
              .from(block.querySelectorAll(".sab-m-reveal"), { y: 24, opacity: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }, 0.1);
            gsap.from(prod, {
              xPercent: -40 * dir,
              rotation: -25 * dir,
              scale: 0.75,
              opacity: 0,
              duration: 0.8,
              ease: "back.out(1.5)",
              scrollTrigger: { trigger: prod, start: "top 88%", once: true },
            });
            // Idle float + scroll-driven turn and tilt.
            gsap.set(block.querySelector(".sab-m-turn"), { transformPerspective: 900 });
            gsap.fromTo(
              block.querySelector(".sab-m-float"),
              { y: 8, rotation: -2 },
              { y: -8, rotation: 2, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 }
            );
            gsap.fromTo(
              block.querySelector(".sab-m-turn"),
              { rotation: -8 * dir, rotationY: -12 * dir },
              {
                rotation: 8 * dir,
                rotationY: 12 * dir,
                ease: "none",
                scrollTrigger: { trigger: block, start: "top bottom", end: "bottom top", scrub: true },
              }
            );
          });
        });
      }
    },
    { scope: root, dependencies: [pinned], revertOnUpdate: true }
  );

  const goTo = (i) => {
    const st = stRef.current;
    if (!st) return;
    scrollToTarget(st.start + ((st.end - st.start) * i) / LAST, { offset: 0 });
  };

  return (
    <section id="sabores" ref={root} aria-labelledby="sabores-titulo" className={pinned ? "relative" : "relative overflow-hidden"}>
      <h2 id="sabores-titulo" className="sr-only">
        Nuestros sabores
      </h2>
      {pinned ? <Stage active={active} goTo={goTo} /> : <Stacked />}
    </section>
  );
}
