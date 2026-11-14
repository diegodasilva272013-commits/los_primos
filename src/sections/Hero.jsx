import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowDownRight, WhatsappLogo } from "@phosphor-icons/react";
import { HERO_PLATOS, WHATSAPP } from "../data.js";
import { gsap, ScrollTrigger, scrollToTarget, magnetic, reduceMotion } from "../lib/motion.js";
import Bubbles from "../components/Bubbles.jsx";

gsap.registerPlugin(useGSAP);

/*
  CHISPA-style hero with the real brand.
  Layout (top to bottom, nothing collides):
    row 1: copy column (eyebrow, h1, text, CTAs, flavor switcher) | product stage (blob + floating cut-out)
    row 2: giant MARISCOS word, in normal flow, full width: no UI ever sits on it.
  Anton metrics: accent top 1.10em, so the h1 uses leading 1.12 and the rise mask reaches 0.3em above each line.
*/
const MASK = { clipPath: "inset(-0.3em -0.1em -0.1em -0.1em)" };
const AUTO_SECONDS = 5;
const N = HERO_PLATOS.length;
const BLOB_FX = { "#f6d840": "saturate(0) brightness(1.22)" }; // yellow blob turns white on the yellow field
const BLOB_DEFAULT = "saturate(1) brightness(1)";
const HIDDEN = { visibility: "hidden", opacity: 0 };
const BURST = 10;

const ALT = {
  pulpo: "Pulpo zarandeado a las brasas con aguacate y verdura fresca",
  estrella: "Combo Estrella con tostada de ceviche, camaroncitos, camarón envuelto y taco",
  bbq: "Camarones envueltos en tocino con salsa barbecue, arroz y verdura",
};
const SHORT = { pulpo: "Pulpo", estrella: "Estrella", bbq: "BBQ" };

function Chars({ text, className }) {
  return [...text].map((c, i) => (
    <span key={i} className={`inline-block ${className}`}>
      {c === " " ? " " : c}
    </span>
  ));
}

export default function Hero() {
  const root = useRef(null);
  const cta = useRef(null);
  const tabs = useRef([]);
  const api = useRef({ go: () => {}, setHover: () => {}, setFocus: () => {} });
  const firstBadge = useRef(true);
  const [active, setActive] = useState(0);

  useEffect(() => magnetic(cta.current), []);

  const { contextSafe } = useGSAP(
    (_ctx, contextSafe) => {
      const q = gsap.utils.selector(root);
      const section = root.current;
      const items = q(".hp-item");
      const st = { cur: 0, tl: null, auto: null, stopped: false, hover: false, focus: false, inView: true };

      const syncAuto = () => {
        if (!st.auto) return;
        if (st.hover || st.focus || !st.inView) st.auto.pause();
        else st.auto.resume();
      };

      const stopAuto = () => {
        st.stopped = true;
        st.auto?.kill();
        st.auto = null;
        gsap.to(q(".hp-progress"), { scaleX: 0, duration: 0.3, overwrite: true });
      };

      // The progress bar inside the active pill IS the timer: when it fills, the next plate comes in.
      const startAuto = contextSafe(() => {
        st.auto?.kill();
        st.auto = null;
        if (st.stopped || reduceMotion()) return;
        const bars = q(".hp-progress");
        gsap.set(bars, { scaleX: 0 });
        st.auto = gsap.to(bars[st.cur], {
          scaleX: 1,
          duration: AUTO_SECONDS,
          ease: "none",
          onComplete: () => go((st.cur + 1) % N, false),
        });
        syncAuto();
      });

      // Bubble burst: small white rings fly out from the plate center and fade.
      const burst = () => {
        const dots = q(".hp-burst-dot");
        gsap
          .timeline()
          .fromTo(
            dots,
            { x: 0, y: 0, scale: 0, autoAlpha: 1 },
            {
              x: () => gsap.utils.random(-320, 320),
              y: () => gsap.utils.random(-240, 200),
              scale: () => gsap.utils.random(0.6, 1.5),
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.012,
            },
            0
          )
          .to(dots, { autoAlpha: 0, duration: 0.45, ease: "power1.in", stagger: 0.012 }, 0.45);
      };

      const go = contextSafe((next, user) => {
        if (user) stopAuto();
        if (next === st.cur) return;
        const prev = st.cur;
        st.cur = next;
        setActive(next);
        const p = HERO_PLATOS[next];
        const fx = BLOB_FX[p.bg] || BLOB_DEFAULT;
        st.tl?.progress(1).kill();

        if (reduceMotion()) {
          gsap.set(items[prev], { autoAlpha: 0 });
          gsap.set(items[next], { autoAlpha: 1, xPercent: 0, rotation: 0, scale: 1 });
          gsap.set(section, { backgroundColor: p.bg });
          gsap.set(q(".hp-blob-spin"), { filter: fx });
          return;
        }

        // Spin out right, recolor the field, blob pulses, new plate spins in from the left, punch + burst.
        st.tl = gsap
          .timeline()
          .to(items[prev], { rotation: 90, xPercent: 40, scale: 0.6, autoAlpha: 0, duration: 0.55, ease: "power3.in" }, 0)
          .to(section, { backgroundColor: p.bg, duration: 0.8, ease: "power2.inOut" }, 0.2)
          .to(q(".hp-blob-spin"), { filter: fx, duration: 0.6, ease: "power2.inOut" }, 0.3)
          .fromTo(q(".hp-blob-pulse"), { scale: 1 }, { scale: 1.18, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 }, 0.4)
          .fromTo(
            items[next],
            { rotation: -120, xPercent: -45, scale: 0.6, autoAlpha: 0 },
            { rotation: 0, xPercent: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "back.out(1.5)" },
            0.45
          )
          .fromTo(q(".hp-punch"), { scale: 1 }, { scale: 1.09, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 }, 1.0)
          .add(burst, 0.95);
        if (!user) startAuto();
      });

      api.current = {
        go,
        setHover: (v) => {
          st.hover = v;
          syncAuto();
        },
        setFocus: (v) => {
          st.focus = v;
          syncAuto();
        },
      };

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Idle life: blob turns forever, plate floats, contact shadow breathes with it, mascot waves. */
        gsap.to(q(".hp-blob-spin"), { rotation: 360, duration: 60, ease: "none", repeat: -1 });
        gsap.set(q(".hp-float"), { y: 14, rotation: -3 });
        gsap
          .timeline({ repeat: -1, yoyo: true, defaults: { duration: 3, ease: "sine.inOut" } })
          .to(q(".hp-float"), { y: -14, rotation: 3 }, 0)
          .fromTo(q(".hp-shadow"), { scaleX: 1, scaleY: 1, opacity: 0.55 }, { scaleX: 0.74, scaleY: 0.8, opacity: 0.28 }, 0);
        gsap.set(q(".hp-mascot-wave"), { rotation: -7, transformOrigin: "50% 90%" });
        gsap.to(q(".hp-mascot-wave"), { rotation: 9, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1 });

        /* Intro (<= 1.8s), waits for the preloader curtain. */
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" }, onComplete: startAuto });
        intro
          .from(
            q(".hp-word-char"),
            { yPercent: 110, rotation: (i) => (i % 2 ? 8 : -8), duration: 1, stagger: 0.06, ease: "power4.out" },
            0.1
          )
          .from(q(".hp-line"), { yPercent: 115, duration: 0.95, stagger: 0.12, ease: "power4.out" }, 0)
          .from(q(".hp-blob"), { scale: 0, rotation: -90, duration: 1.1, ease: "back.out(1.6)" }, 0.1)
          .from(q(".hp-intro"), { yPercent: -190, duration: 1.2, ease: "bounce.out" }, 0.2)
          .from(q(".hp-intro"), { rotation: -220, scale: 0.6, duration: 1.2, ease: "power3.out" }, 0.2)
          .from(q(".hp-intro"), { opacity: 0, duration: 0.25, ease: "none" }, 0.2)
          .from(q(".hp-shadow-in"), { scale: 0, opacity: 0, duration: 0.7 }, 0.7)
          .add(burst, 1.05)
          .from(q(".hp-fade"), { y: 26, opacity: 0, duration: 0.7, stagger: 0.07 }, 0.3)
          .from(q(".hp-pill"), { scale: 0, opacity: 0, duration: 0.5, stagger: 0.07, ease: "back.out(2)" }, 0.75)
          .from(q(".hp-badge"), { scale: 0, rotation: -14, duration: 0.6, ease: "back.out(2)" }, 1.0)
          .from(q(".hp-mascot-pop"), { yPercent: 130, rotation: -30, duration: 0.8, ease: "back.out(1.7)" }, 0.9);

        const safety = gsap.delayedCall(4, () => play());
        function play() {
          safety.kill();
          if (intro.progress() === 0 && !intro.isActive()) intro.play();
        }
        if (window.__lpIntroDone) play();
        else window.addEventListener("lp:intro-done", play, { once: true });

        /* Scroll out (scrub): plate grows and turns, copy lifts away, giant word slides for parallax. */
        const out = () => ({ trigger: section, start: "top top", end: "bottom top", scrub: true });
        gsap.to(q(".hp-scroll"), { scale: 1.12, rotation: 12, ease: "none", scrollTrigger: out() });
        gsap.to(q(".hp-copy"), { y: -120, opacity: 0, ease: "none", scrollTrigger: { ...out(), end: "70% top" } });
        gsap.to(q(".hp-word-track"), { xPercent: -12, ease: "none", scrollTrigger: out() });

        // Auto-advance only runs while the hero is on screen.
        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            st.inView = self.isActive;
            syncAuto();
          },
        });

        /* 3D tilt toward the pointer + counter-parallax on the blob (desktop, fine pointer). */
        let offPointer = () => {};
        if (window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches) {
          const tilt = q(".hp-tilt")[0];
          const blob = q(".hp-blob")[0];
          const stage = q(".hp-stage")[0];
          gsap.set(tilt, { transformPerspective: 800 });
          const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.7, ease: "power3.out" });
          const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.7, ease: "power3.out" });
          const bx = gsap.quickTo(blob, "x", { duration: 1.1, ease: "power3.out" });
          const by = gsap.quickTo(blob, "y", { duration: 1.1, ease: "power3.out" });
          const clamp = gsap.utils.clamp(-1, 1);
          const move = (e) => {
            const r = stage.getBoundingClientRect();
            const nx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2));
            const ny = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2));
            ry(nx * 16);
            rx(-ny * 16);
            bx(-nx * 40);
            by(-ny * 40);
          };
          const leave = () => {
            rx(0);
            ry(0);
            bx(0);
            by(0);
          };
          section.addEventListener("pointermove", move);
          section.addEventListener("pointerleave", leave);
          offPointer = () => {
            section.removeEventListener("pointermove", move);
            section.removeEventListener("pointerleave", leave);
          };
        }

        return () => {
          window.removeEventListener("lp:intro-done", play);
          offPointer();
          st.auto?.kill();
          st.auto = null;
        };
      });
    },
    { scope: root }
  );

  // Name + price badge: new chars rise on every switch.
  useGSAP(
    () => {
      if (firstBadge.current) {
        firstBadge.current = false;
        return;
      }
      if (reduceMotion()) return;
      gsap.from(".hp-badge-char", { yPercent: 115, duration: 0.5, stagger: 0.018, ease: "power3.out", delay: 0.45 });
      gsap.from(".hp-badge-price", { yPercent: 115, duration: 0.6, ease: "back.out(2)", delay: 0.6 });
    },
    { scope: root, dependencies: [active] }
  );

  const jump = contextSafe(() => {
    if (reduceMotion() || gsap.isTweening(".hp-mascot-jump")) return;
    gsap
      .timeline()
      .to(".hp-mascot-jump", { y: -70, rotation: -12, duration: 0.3, ease: "power2.out" })
      .to(".hp-mascot-jump", { y: 0, rotation: 0, duration: 0.8, ease: "bounce.out" });
  });

  const onTabKey = (e, i) => {
    const map = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: N - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = (map[e.key] + N) % N;
    api.current.go(next, true);
    tabs.current[next]?.focus();
  };

  const p = HERO_PLATOS[active];

  return (
    <section
      id="inicio"
      ref={root}
      aria-label="Inicio"
      className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden pt-28 text-marino"
      style={{ backgroundColor: HERO_PLATOS[0].bg }}
    >
      <Bubbles count={34} color="255,255,255" className="z-0" />

      {/* Mascot peeking from the very bottom-left corner (desktop), clear of the giant word */}
      <div aria-hidden="true" className="absolute -bottom-16 -left-10 z-20 hidden w-[130px] rotate-[14deg] lg:block">
        <div className="hp-mascot-pop">
          <div className="hp-mascot-wave">
            <div className="hp-mascot-jump" onPointerEnter={jump}>
              <img
                src="/img/mascota.png"
                width={300}
                height={300}
                alt=""
                className="w-full drop-shadow-[0_18px_24px_rgba(12,21,56,0.35)]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 items-center px-4 md:px-8 lg:grid-cols-12 lg:gap-x-6">
        {/* Copy + switcher: stacked above the plate on mobile, left column on desktop */}
        <div className="hp-copy lg:col-span-6">
          <p className="hp-fade text-sm font-bold uppercase tracking-[0.2em]">Desde 1995 en Monterrey</p>
          <h1 className="display mt-4" style={{ fontSize: "clamp(3rem, min(7vw, 11dvh), 7.5rem)", lineHeight: 1.12 }}>
            <span className="block" style={MASK}>
              <span className="hp-line block">Mariscos con </span>
            </span>
            <span className="block" style={MASK}>
              <span className="hp-line block">sazón regia</span>
            </span>
          </h1>
          <p className="hp-fade mt-4 max-w-[34rem] text-pretty text-base font-semibold leading-snug md:text-xl">
            Aguachiles, cócteles y pulpo zarandeado en seis sucursales. Como en casa, desde 1995.
          </p>
          <div className="hp-fade mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <a
              ref={cta}
              href="#menu"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget("#menu");
              }}
              className="btn btn-marino"
            >
              Ver el menú
              <ArrowDownRight size={20} weight="bold" aria-hidden="true" />
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener" className="btn btn-ghost text-marino">
              <WhatsappLogo size={20} weight="bold" aria-hidden="true" />
              Pedir por WhatsApp
            </a>
          </div>

          {/* Flavor switcher: its own clear band under the CTAs, recolors the whole hero */}
          <div className="mt-6 flex items-center gap-3">
            <span className="hp-fade hidden text-xs font-bold uppercase tracking-[0.18em] sm:block">Elige tu antojo</span>
            <div
              role="tablist"
              aria-label="Platillos de la casa"
              className="inline-flex max-w-full flex-wrap gap-1 rounded-full bg-marino/90 p-1.5 shadow-[0_14px_30px_-14px_rgba(12,21,56,0.7)]"
              onFocus={() => api.current.setFocus(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) api.current.setFocus(false);
              }}
              onPointerEnter={() => api.current.setHover(true)}
              onPointerLeave={() => api.current.setHover(false)}
            >
              {HERO_PLATOS.map((pl, i) => {
                const on = i === active;
                return (
                  <button
                    key={pl.id}
                    ref={(el) => (tabs.current[i] = el)}
                    id={`hero-tab-${pl.id}`}
                    type="button"
                    role="tab"
                    aria-label={pl.name}
                    aria-selected={on}
                    aria-controls="hero-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => api.current.go(i, true)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className={`hp-pill display relative inline-flex min-h-12 items-center overflow-hidden rounded-full px-5 text-lg transition-[background-color,color] duration-300 lg:px-6 lg:text-xl ${
                      on ? "bg-amarillo text-marino" : "text-blanco hover:bg-blanco/15"
                    }`}
                  >
                    <span className="relative">{SHORT[pl.id]}</span>
                    <span
                      aria-hidden="true"
                      className="hp-progress absolute inset-x-3 bottom-1.5 h-[3px] rounded-full bg-marino"
                      style={{ transform: "scaleX(0)", transformOrigin: "0% 50%" }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* The product: active cut-out plate on its blob */}
        <div
          id="hero-panel"
          role="tabpanel"
          aria-labelledby={`hero-tab-${p.id}`}
          className="hp-stage relative mx-auto mb-4 mt-12 w-[86vw] max-w-[560px] lg:col-span-6 lg:mx-0 lg:-mr-4 lg:mb-0 lg:mt-0 lg:w-[min(46vw,700px,88dvh)] lg:max-w-none lg:justify-self-end"
          onPointerEnter={() => api.current.setHover(true)}
          onPointerLeave={() => api.current.setHover(false)}
        >
          <div className="hp-scroll relative aspect-[798/498] w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="hp-blob aspect-square w-[78%]">
                <div className="hp-blob-pulse h-full w-full">
                  <img
                    src="/img/blob.webp"
                    width={700}
                    height={700}
                    alt=""
                    aria-hidden="true"
                    className="hp-blob-spin h-full w-full"
                    style={{ filter: BLOB_DEFAULT }}
                  />
                </div>
              </div>
            </div>

            {/* Bubble burst on every switch (decorative rings) */}
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-[1]">
              {Array.from({ length: BURST }, (_, i) => (
                <span
                  key={i}
                  className="hp-burst-dot absolute block rounded-full border-2 border-blanco/90"
                  style={{
                    width: 10 + (i % 4) * 7,
                    height: 10 + (i % 4) * 7,
                    marginLeft: -(5 + (i % 4) * 3.5),
                    marginTop: -(5 + (i % 4) * 3.5),
                    opacity: 0,
                    visibility: "hidden",
                  }}
                />
              ))}
            </div>

            {/* Contact shadow: breathes with the float */}
            <div aria-hidden="true" className="absolute inset-x-0 -bottom-[6%] flex justify-center">
              <div className="hp-shadow-in w-[62%]">
                <div className="hp-shadow h-6 w-full rounded-[50%] bg-abismo/50 blur-xl md:h-9" />
              </div>
            </div>

            <div className="hp-intro absolute inset-0 z-[2]">
              <div className="hp-tilt h-full w-full">
                <div className="hp-punch h-full w-full">
                  <div className="hp-float relative h-full w-full">
                    {HERO_PLATOS.map((pl, i) => (
                      <div
                        key={pl.id}
                        aria-hidden={i === active ? undefined : "true"}
                        className="hp-item absolute inset-0 flex items-center justify-center"
                        style={i === 0 ? undefined : HIDDEN}
                      >
                        <img
                          src={pl.img}
                          width={pl.w}
                          height={pl.h}
                          alt={ALT[pl.id]}
                          fetchpriority={i === 0 ? "high" : undefined}
                          className="mx-auto h-auto max-h-full w-[92%] object-contain drop-shadow-[0_34px_34px_rgba(12,21,56,0.4)]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Name + price: corner of the plate, never over the food center */}
          <div className="hp-badge absolute -top-8 left-0 z-20 flex items-center gap-3 rounded-full bg-marino py-2 pl-4 pr-4 text-blanco shadow-[0_16px_34px_-14px_rgba(12,21,56,0.7)] lg:-top-10 lg:left-auto lg:right-4 lg:gap-4 lg:py-3 lg:pl-6 lg:pr-6">
            <span className="sr-only">
              {p.name}, {p.price}
            </span>
            <span key={`n-${active}`} aria-hidden="true" className="display block text-base lg:text-2xl" style={MASK}>
              <Chars text={p.name} className="hp-badge-char" />
            </span>
            <span aria-hidden="true" className="block" style={MASK}>
              <span key={`p-${active}`} className="hp-badge-price display block text-xl text-amarillo lg:text-4xl">
                {p.price}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Giant word: its own band at the bottom, in flow, so no UI can ever sit on it */}
      <div aria-hidden="true" className="pointer-events-none relative z-[1] mt-2 flex justify-center overflow-hidden">
        <div
          className="hp-word-track display whitespace-nowrap"
          style={{ fontSize: "clamp(5rem, min(22vw, 26dvh), 24rem)", lineHeight: 0.92 }}
        >
          <Chars text="MARISCOS" className="hp-word-char" />
        </div>
      </div>
    </section>
  );
}
