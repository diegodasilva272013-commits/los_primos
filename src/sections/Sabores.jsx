import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { SABORES, ILU } from "../data.js";
import { gsap, scrollToTarget } from "../lib/motion.js";

gsap.registerPlugin(useGSAP);

/*
  Four sabores, one color-morph story (CHISPA reel): full-bleed color, ONE floating HD cut-out per screen.
  Desktop (lg+, motion allowed): pinned stage, 12 cols. Text cols 1-6 (xl 1-5), product cols 7-12 (xl 6-12):
  the product never covers text. Outlined names + brand line art live only behind the product half.
  Each step: the old plate leaves right, the new one drops in and lands with a settle bounce.
  Product box has a fixed aspect (BOX); each plate is fitted from its real w/h, never wider than its natural width.
  Mobile / reduced motion: stacked color blocks (name, line, product, body, specs), visible by default.
*/
const PIN_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const MOBILE_MOTION = "(prefers-reduced-motion: no-preference)";
const MASK = { clipPath: "inset(-0.3em -0.1em -0.1em -0.1em)" };
const LAST = SABORES.length - 1;
const BOX = 1.5;
const HIDDEN = { visibility: "hidden", opacity: 0 };
const STUDIO = "drop-shadow(0 36px 36px rgba(0,0,0,0.26)) drop-shadow(0 10px 12px rgba(0,0,0,0.16))";
const ILUS = [
  { src: ILU.almeja, w: 1000, h: 829 },
  { src: ILU.crab, w: 1000, h: 856 },
  { src: ILU.barco, w: 1000, h: 838 },
];

const ALT = {
  aguachile: "Aguachile negro: camarón curtido en salsa negra con pepino, zanahoria y cebolla morada",
  bbq: "Camarones envueltos en tocino bañados en salsa barbecue, con arroz amarillo y verdura",
  molcajete: "Molcajete mixto con chicharrón de pescado y de pulpo, guacamole y chiles toreados",
  estrella: "Combo Estrella con tostada de ceviche, camaroncitos empanizados, camarón envuelto y taco",
};

// Widest word of each name in Anton em units (AGUACHILE, CAMARONES, MOLCAJETE, ESTRELLA): names fill their column.
const WORD_EM = { aguachile: 4.3, bbq: 4.5, molcajete: 4.4, estrella: 3.7 };
const em = (id) => WORD_EM[id] || 4.6;

/** Size of a w x h image fitted (contain) in a box of aspect `box`, as % of the box. */
function fit(w, h, box) {
  const r = w / h;
  return r >= box ? { wp: 100, hp: (box / r) * 100 } : { wp: (r / box) * 100, hp: 100 };
}

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

/* HD cut-out fitted in the product box from its real size, with neutral studio shadow. */
function Plate({ s, eager = false }) {
  const f = fit(s.w, s.h, BOX);
  return (
    <div style={{ width: `${f.wp}%`, maxWidth: s.w, aspectRatio: `${s.w} / ${s.h}` }}>
      <img
        src={s.img}
        width={s.w}
        height={s.h}
        alt={ALT[s.id] || s.name}
        loading={eager ? undefined : "lazy"}
        decoding="async"
        className="h-full w-full object-contain"
        style={{ filter: STUDIO }}
      />
    </div>
  );
}

/* Soft contact shadow placed under the plate's real bottom edge (decorative). */
function Contact({ s, cls = "", style }) {
  const f = fit(s.w, s.h, BOX);
  return (
    <span
      aria-hidden="true"
      className={`absolute block h-[9%] ${cls}`}
      style={{ left: `${50 - f.wp * 0.36}%`, width: `${f.wp * 0.72}%`, top: `${50 + f.hp / 2 - 6}%`, ...style }}
    >
      <span className="sab-breathe block h-full w-full rounded-[50%] bg-black/35 blur-2xl" />
    </span>
  );
}

function Ilu({ i, className, imgClass = "" }) {
  const it = ILUS[i % ILUS.length];
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <img src={it.src} width={it.w} height={it.h} alt="" loading="lazy" decoding="async" className={`w-full ${imgClass}`} />
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
            className="pointer-events-none absolute bottom-0 left-1/2 right-0 top-0 flex items-center overflow-hidden opacity-20 [mask-image:linear-gradient(to_right,transparent,black_18%)]"
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

          {/* Brand line art drifting behind the product half (never under the text column) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 right-0 overflow-hidden">
            <Ilu i={0} className="-right-[3%] top-[7%] w-[min(26vw,440px)]" imgClass="sab-ilu opacity-[0.16]" />
            <Ilu i={2} className="bottom-[12%] right-[6%] w-[min(21vw,360px)]" imgClass="sab-ilu opacity-[0.14]" />
          </div>

          <div className="relative mx-auto grid h-full max-w-[1400px] grid-cols-12 gap-x-8 px-8 pb-28 pt-28">
            {/* Text: every sabor stacked in the same cell, only one visible */}
            <div className="col-span-6 grid items-center self-center xl:col-span-5" style={{ containerType: "inline-size" }}>
              {SABORES.map((s, i) => (
                <article
                  key={s.id}
                  className="sab-copy col-start-1 row-start-1"
                  style={{ color: s.ink, ...(i === 0 ? null : HIDDEN) }}
                >
                  <h3
                    aria-label={s.name}
                    className="display display-stack"
                    style={{ fontSize: `min(${(80 / em(s.id)).toFixed(2)}cqw, 13dvh, 8.5rem)` }}
                  >
                    <Name text={s.name} charClass="sab-char" />
                  </h3>
                  <p className="sab-reveal mt-[2.2dvh] text-pretty text-2xl font-bold leading-tight xl:text-3xl">{s.line}</p>
                  <p className="sab-reveal mt-2 max-w-[44ch] text-pretty text-lg font-medium leading-relaxed">{s.body}</p>
                  <Specs specs={s.specs} className="sab-reveal mt-[3dvh]" />
                </article>
              ))}
            </div>

            {/* Product: one floating HD cut-out at a time, big */}
            <div className="relative col-span-6 flex items-center justify-start xl:col-span-7">
              <div
                className="sab-prod-in relative w-[min(46vw,900px,calc((100dvh-240px)*1.5))] xl:w-[min(54vw,900px,calc((100dvh-240px)*1.5))]"
                style={{ aspectRatio: BOX }}
              >
                <div className="sab-shadows pointer-events-none absolute inset-0">
                  {SABORES.map((s, i) => (
                    <Contact key={s.id} s={s} cls="sab-contact" style={i === 0 ? null : HIDDEN} />
                  ))}
                </div>
                <div className="sab-tilt h-full w-full">
                  <div className="sab-turn h-full w-full">
                    <div className="sab-punch h-full w-full">
                      <div className="sab-float h-full w-full">
                        <div className="sab-spin relative h-full w-full will-change-transform">
                          {SABORES.map((s, i) => (
                            <div
                              key={s.id}
                              aria-hidden={i === active ? undefined : "true"}
                              className="sab-prod absolute inset-0 flex items-center justify-center"
                              style={i === 0 ? undefined : HIDDEN}
                            >
                              <Plate s={s} eager={i === 0} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
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
      {SABORES.map((s, i) => (
        <article key={s.id} style={{ backgroundColor: s.color, color: s.ink }} className="sab-block relative overflow-hidden">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 px-4 py-16 md:px-8 md:py-24 lg:grid-flow-dense lg:grid-cols-12 lg:items-center lg:gap-x-8">
            <h3
              aria-label={s.name}
              className="display display-stack lg:col-span-6 lg:col-start-1"
              style={{ fontSize: `min(${(86 / em(s.id)).toFixed(2)}vw, 8rem)` }}
            >
              <Name text={s.name} charClass="sab-m-char" />
            </h3>
            <p className="sab-m-reveal mt-4 text-pretty text-2xl font-bold leading-tight md:text-3xl lg:col-span-6 lg:col-start-1">
              {s.line}
            </p>
            <div className="relative mx-auto my-10 w-[92vw] max-w-[680px] lg:col-span-6 lg:col-start-7 lg:row-span-4 lg:row-start-1 lg:my-0 lg:w-full lg:max-w-[760px]">
              {/* Line art behind the plate, bleeding off the right edge only */}
              <Ilu i={i} className="-right-[16%] -top-[4%] w-[58%]" imgClass="sab-m-ilu opacity-[0.16]" />
              <div className="sab-m-prod relative w-full" style={{ aspectRatio: BOX }}>
                <div className="pointer-events-none absolute inset-0">
                  <Contact s={s} />
                </div>
                <div className="sab-m-turn h-full w-full">
                  <div className="sab-m-punch h-full w-full">
                    <div className="sab-m-float relative h-full w-full">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Plate s={s} />
                      </div>
                    </div>
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
    (_ctx, contextSafe) => {
      const mm = gsap.matchMedia();

      // Landing squash + elastic settle (time based, also while scrubbing).
      const settle = contextSafe((el) => {
        gsap.fromTo(
          el,
          { scaleX: 1.05, scaleY: 0.93, transformOrigin: "50% 85%" },
          { scaleX: 1, scaleY: 1, duration: 1, ease: "elastic.out(1, 0.35)", overwrite: true }
        );
      });

      const drift = (els) =>
        els.forEach((el, i) => {
          gsap.fromTo(
            el,
            { rotation: i % 2 ? 7 : -7, x: 0, y: 0 },
            { rotation: i % 2 ? -7 : 7, x: i % 2 ? -20 : 18, y: i % 2 ? 18 : -16, duration: 12 + i * 3, ease: "sine.inOut", yoyo: true, repeat: -1 }
          );
        });

      if (pinned) {
        mm.add(PIN_QUERY, () => {
          const stage = root.current.querySelector(".sab-stage");
          if (!stage) return;
          const q = gsap.utils.selector(stage);
          const copies = q(".sab-copy");
          const prods = q(".sab-prod");
          const shadows = q(".sab-contact");
          const punch = q(".sab-punch")[0];
          const track = q(".sab-track")[0];

          // Idle appetite: float + breathing shadow (same period), slow +/-2deg turn (own period), drifting line art.
          gsap.set(q(".sab-turn"), { transformPerspective: 1100 });
          gsap.fromTo(q(".sab-float"), { y: 12 }, { y: -12, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
          gsap.fromTo(
            q(".sab-breathe"),
            { scaleX: 1, opacity: 1 },
            { scaleX: 0.76, opacity: 0.55, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 }
          );
          gsap.fromTo(q(".sab-spin"), { rotation: -2 }, { rotation: 2, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });
          drift(q(".sab-ilu"));

          // Pointer tilt +/-12deg (fine pointer).
          let offPointer = () => {};
          if (window.matchMedia("(pointer: fine)").matches) {
            const tilt = q(".sab-tilt")[0];
            gsap.set(tilt, { transformPerspective: 1000 });
            const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.8, ease: "power3.out" });
            const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3.out" });
            const clamp = gsap.utils.clamp(-1, 1);
            const move = (e) => {
              const r = tilt.getBoundingClientRect();
              ry(clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)) * 12);
              rx(-clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)) * 12);
            };
            const leave = () => {
              rx(0);
              ry(0);
            };
            stage.addEventListener("pointermove", move);
            stage.addEventListener("pointerleave", leave);
            offPointer = () => {
              stage.removeEventListener("pointermove", move);
              stage.removeEventListener("pointerleave", leave);
            };
          }

          // Entrance before the pin: name rises, the first plate drops in and settles. Short, once.
          gsap
            .timeline({ scrollTrigger: { trigger: stage, start: "top 80%", once: true } })
            .from(copies[0].querySelectorAll(".sab-char"), { yPercent: 115, duration: 0.6, stagger: 0.03, ease: "power3.out" }, 0)
            .from(copies[0].querySelectorAll(".sab-reveal"), { y: 30, opacity: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" }, 0.15)
            .from(q(".sab-prod-in"), { yPercent: -30, rotation: -10, scale: 0.88, autoAlpha: 0, duration: 0.6, ease: "power2.in" }, 0.05)
            .call(() => settle(punch), null, 0.65);

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

          // Continuous: the plate turns gently with scroll, the outlined names slide behind it.
          tl.fromTo(q(".sab-turn"), { rotation: -4, rotationY: -10 }, { rotation: 4, rotationY: 10, duration: LAST }, 0).to(
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
              .to(prods[i - 1], { xPercent: 35, rotation: 14, scale: 0.82, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, at)
              .to(shadows[i - 1], { autoAlpha: 0, duration: 0.2 }, at)
              .fromTo(
                prods[i],
                { xPercent: -18, yPercent: -32, rotation: -12, scale: 0.86, autoAlpha: 0 },
                { xPercent: 0, yPercent: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: "power2.in" },
                at + 0.2
              )
              .fromTo(shadows[i], { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: "power2.out" }, at + 0.4)
              .call(() => {
                if ((tl.scrollTrigger?.direction ?? 1) > 0) settle(punch);
              }, null, at + 0.6);
          }
          tl.set({}, {}, LAST); // timeline length == step count, so snap 1/LAST lands on rest states

          stRef.current = tl.scrollTrigger;

          return () => {
            offPointer();
            stRef.current = null;
            activeRef.current = 0;
            setActive(0);
          };
        });
      } else {
        mm.add(MOBILE_MOTION, () => {
          drift(gsap.utils.toArray(".sab-m-ilu", root.current));
          gsap.utils.toArray(".sab-block", root.current).forEach((block, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            const prod = block.querySelector(".sab-m-prod");
            gsap
              .timeline({ scrollTrigger: { trigger: block, start: "top 88%", once: true } })
              .from(block.querySelectorAll(".sab-m-char"), { yPercent: 115, duration: 0.5, stagger: 0.025, ease: "power3.out" }, 0)
              .from(block.querySelectorAll(".sab-m-reveal"), { y: 24, opacity: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }, 0.1);
            // Plate drops in and lands with a settle bounce.
            gsap.from(prod, {
              xPercent: -12 * dir,
              yPercent: -28,
              rotation: -10 * dir,
              scale: 0.88,
              autoAlpha: 0,
              duration: 0.55,
              ease: "power2.in",
              scrollTrigger: { trigger: prod, start: "top 88%", once: true },
              onComplete: () => settle(block.querySelector(".sab-m-punch")),
            });
            // Idle float + slow +/-2deg turn + gentle scroll tilt.
            gsap.set(block.querySelector(".sab-m-turn"), { transformPerspective: 900 });
            gsap.fromTo(
              block.querySelector(".sab-m-float"),
              { y: 8, rotation: -2 },
              { y: -8, rotation: 2, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 }
            );
            gsap.fromTo(
              block.querySelector(".sab-breathe"),
              { scaleX: 1, opacity: 1 },
              { scaleX: 0.8, opacity: 0.6, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 }
            );
            gsap.fromTo(
              block.querySelector(".sab-m-turn"),
              { rotation: -4 * dir, rotationY: -8 * dir },
              {
                rotation: 4 * dir,
                rotationY: 8 * dir,
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
