import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { gsap, magnetic, reduceMotion } from "../lib/motion.js";
import { MENU, WHATSAPP } from "../data.js";

const TITLE = "El menú";

/* Same card language as the Vitrina: brand-color panel, studio light, the dish fills the card. */
const PANELS = [
  { bg: "bg-cielo", light: "rgba(255,255,255,0.55)" },
  { bg: "bg-amarillo", light: "rgba(255,255,255,0.62)" },
  { bg: "bg-coral", light: "rgba(255,236,226,0.55)" },
  { bg: "bg-marino-2", light: "rgba(130,200,245,0.38)" },
];
const SHADOW = "radial-gradient(closest-side, rgba(12,21,56,0.42), rgba(12,21,56,0))";

/* Plate width from container units, capped at the file's natural width (never upscaled). */
function plateStyle(c, kx, ky) {
  const ar = c.w / c.h;
  const y = ar < 1 ? Math.min(ky, 1.02) : ky;
  return {
    width: `min(${c.w}px, ${Math.round(kx * 100)}cqw, ${(y * ar * 100).toFixed(1)}cqh)`,
    maxWidth: "none",
    height: "auto",
  };
}

const fromPrice = (c) => Math.min(...c.items.map((it) => parseInt(it[2].replace(/\D/g, ""), 10) || Infinity));

/*
  One category visual. `label` adds the bottom marino scrim with name + starting price (decorative,
  the same info is in the panel). Photos (bebidas) fill with object-cover; cut-outs bleed past the edges.
*/
function CategoryCard({ cat, index, label = true, alt = "", lazy = true }) {
  const panel = PANELS[index % PANELS.length];
  const imgProps = {
    src: cat.img,
    width: cat.w,
    height: cat.h,
    decoding: "async",
    loading: lazy ? "lazy" : undefined,
    alt,
    "aria-hidden": alt ? undefined : "true",
  };
  return (
    <div className={`absolute inset-0 overflow-hidden ${cat.photo ? "bg-abismo" : panel.bg} [container-type:size]`}>
      {cat.photo ? (
        <img {...imgProps} className="m-plate absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: `radial-gradient(75% 60% at 50% 40%, ${panel.light}, rgba(255,255,255,0) 72%)` }}
          />
          <div
            aria-hidden="true"
            className={`absolute left-1/2 h-[18%] w-[76%] -translate-x-1/2 blur-md ${label ? "top-[54%]" : "top-[62%]"}`}
            style={{ background: SHADOW }}
          />
          <div className={`absolute inset-x-0 top-0 flex items-center justify-center ${label ? "bottom-[20%]" : "bottom-0"}`}>
            <img {...imgProps} style={plateStyle(cat, 1.5, 1.3)} className="m-plate shrink-0" />
          </div>
        </>
      )}
      {label && (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[46%] bg-linear-to-t from-marino from-30% via-marino/85 via-60% to-transparent"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
            <span className="display display-stack min-w-0 text-balance pt-[0.15em] text-4xl text-blanco">{cat.label}</span>
            <span className="shrink-0 pb-1 text-right">
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-blanco/75">Desde</span>
              <span className="display block text-3xl text-amarillo">${fromPrice(cat)}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/*
  Light color block (espuma + marino) so the page breathes between dark sections.
  Signature micro-interaction (pointer: fine only): hovering an item row shows a floating 240x180
  rounded-[32px] card of the category dish that follows the cursor, and the row gets an amarillo sweep.
*/
export default function Menu() {
  const root = useRef(null);
  const tabRefs = useRef([]);
  const ctaRef = useRef(null);
  const cursor = useRef(null);
  const follow = useRef(null); // quickTo setters, only on fine pointers with motion allowed
  const prevActive = useRef(null);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null);
  const cat = MENU[active];
  const underIndex = prev ?? active;

  /* One-time: header reveal, card inset reveal, cursor preview setters. */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const head = q(".m-head")[0];

        gsap.from(q(".m-char"), {
          yPercent: 115,
          rotate: 10,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.05,
          scrollTrigger: { trigger: head, start: "top 85%", once: true },
        });
        gsap.from(q(".m-note"), {
          y: 20,
          autoAlpha: 0,
          duration: 0.8,
          delay: 0.35,
          ease: "power3.out",
          scrollTrigger: { trigger: head, start: "top 85%", once: true },
        });
        gsap.from(q(".m-tab"), {
          y: 24,
          scale: 0.9,
          autoAlpha: 0,
          duration: 0.6,
          ease: "back.out(1.8)",
          stagger: 0.05,
          scrollTrigger: { trigger: q(".m-tabs")[0], start: "top 92%", once: true },
        });
        gsap.fromTo(
          q(".m-frame"),
          { clipPath: "inset(16% 12% 16% 12% round 32px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 32px)",
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: q(".m-panel")[0], start: "top 88%", once: true },
          }
        );
        gsap.from(q(".m-cta > *"), {
          y: 24,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: q(".m-cta")[0], start: "top 92%", once: true },
        });
      });

      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const c = cursor.current;
        gsap.set(c, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 });
        follow.current = {
          x: gsap.quickTo(c, "x", { duration: 0.45, ease: "power3.out" }),
          y: gsap.quickTo(c, "y", { duration: 0.45, ease: "power3.out" }),
          r: gsap.quickTo(c, "rotate", { duration: 0.6, ease: "power3.out" }),
          lastX: 0,
        };
        return () => {
          follow.current = null;
        };
      });
    },
    { scope: root }
  );

  /*
    Items are visible by default (only a small rise, no opacity hide on first view).
    On tab change: clip-path inset wipe on the card, plate rotates in, items stagger.
  */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      const isInitial = prevActive.current === null || prevActive.current === active;
      prevActive.current = active;
      if (isInitial) {
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.from(q(".m-item"), {
            y: 14,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.03,
            scrollTrigger: { trigger: q(".m-list")[0], start: "top 92%", once: true },
          });
        });
        return;
      }
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          q(".m-img-top"),
          { clipPath: "inset(100% 0% 0% 0% round 32px)" },
          { clipPath: "inset(0% 0% 0% 0% round 32px)", duration: 0.85, ease: "expo.out" }
        );
        const plate = q(".m-img-top .m-plate");
        if (MENU[active].photo) gsap.fromTo(plate, { scale: 1.18 }, { scale: 1, duration: 1.1, ease: "expo.out" });
        else
          gsap.fromTo(
            plate,
            { rotate: -16, scale: 0.82, yPercent: 8 },
            { rotate: 0, scale: 1, yPercent: 0, duration: 1.1, ease: "expo.out" }
          );
        gsap.fromTo(q(".m-cat-title"), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" });
        gsap.fromTo(
          q(".m-item"),
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", stagger: 0.03, delay: 0.05 }
        );
      });
    },
    { scope: root, dependencies: [active], revertOnUpdate: true }
  );

  useEffect(() => magnetic(ctaRef.current), []);

  const select = (i) => {
    if (i !== active) {
      setPrev(active);
      setActive(i);
    }
    const el = tabRefs.current[i];
    if (el) {
      el.focus();
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion() ? "auto" : "smooth" });
    }
  };

  const onKeyDown = (e) => {
    const last = MENU.length - 1;
    let next = null;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next !== null) {
      e.preventDefault();
      select(next);
    }
  };

  /* Cursor preview handlers (no-ops unless quickTo setters exist). */
  const onListEnter = (e) => {
    const f = follow.current;
    if (!f) return;
    f.x(e.clientX);
    f.y(e.clientY);
    f.lastX = e.clientX;
    gsap.to(cursor.current, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(1.6)", overwrite: "auto" });
  };
  const onListMove = (e) => {
    const f = follow.current;
    if (!f) return;
    f.x(e.clientX);
    f.y(e.clientY);
    f.r(gsap.utils.clamp(-14, 14, (e.clientX - f.lastX) * 1.1));
    f.lastX = e.clientX;
  };
  const onListLeave = () => {
    if (!follow.current) return;
    follow.current.r(0);
    gsap.to(cursor.current, { scale: 0.6, autoAlpha: 0, duration: 0.25, ease: "power2.out", overwrite: "auto" });
  };

  return (
    <section
      id="menu"
      ref={root}
      aria-labelledby="menu-titulo"
      className="relative overflow-x-clip bg-espuma pb-24 pt-24 text-marino md:pb-32 md:pt-32"
    >
      {/* Floating dish card that follows the pointer (desktop fine pointer only) */}
      <div
        ref={cursor}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[180px] w-[240px] overflow-hidden rounded-[32px] opacity-0 shadow-[0_24px_50px_-16px_rgba(27,39,102,0.55)] [@media(pointer:fine)]:block"
      >
        <CategoryCard key={cat.id} cat={cat} index={active} label={false} />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        {/* Header */}
        <div className="m-head">
          <h2
            id="menu-titulo"
            aria-label={TITLE}
            className="display display-stack whitespace-nowrap text-marino"
            style={{ fontSize: "clamp(4.5rem, 15vw, 13.5rem)" }}
          >
            <span aria-hidden="true" className="inline-block" style={{ clipPath: "inset(-0.45em -0.1em -0.08em -0.1em)" }}>
              {[...TITLE].map((c, i) =>
                c === " " ? (
                  <span key={i}>&nbsp;</span>
                ) : (
                  <span key={i} className="m-char inline-block">
                    {c}
                  </span>
                )
              )}
            </span>
          </h2>
          <p className="m-note mt-6 max-w-[48ch] text-balance text-lg font-medium text-marino/85">
            Precios en pesos mexicanos. Sujetos a cambio sin previo aviso.
          </p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Categorías del menú"
          onKeyDown={onKeyDown}
          className="m-tabs -mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:mx-0 md:mt-16 md:flex-wrap md:gap-3 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {MENU.map((c, i) => {
            const selected = i === active;
            return (
              <button
                key={c.id}
                ref={(el) => (tabRefs.current[i] = el)}
                type="button"
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={selected}
                aria-controls="menu-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                className={`m-tab group relative isolate inline-flex min-h-12 shrink-0 snap-start items-center overflow-hidden whitespace-nowrap rounded-full px-6 text-sm font-bold uppercase tracking-wider transition-[color,scale] duration-300 active:scale-[0.96] ${
                  selected ? "bg-marino text-blanco" : "bg-white text-marino ring-1 ring-marino/15 hover:text-blanco"
                }`}
              >
                {!selected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 origin-bottom scale-y-0 rounded-full bg-marino transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
                  />
                )}
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div
          id="menu-panel"
          role="tabpanel"
          aria-labelledby={`tab-${cat.id}`}
          tabIndex={0}
          className="m-panel mt-10 grid grid-cols-1 gap-12 rounded-[32px] md:mt-14 lg:grid-cols-12 lg:gap-14"
        >
          {/* Visual: tall card, the dish fills it */}
          <div className="min-w-0 lg:col-span-5">
            <div className="relative pb-6 lg:sticky lg:top-28">
              <div className="m-frame relative mx-auto aspect-[4/5] w-[min(100%,440px)] overflow-hidden rounded-[32px] shadow-[0_30px_60px_-24px_rgba(27,39,102,0.55)]">
                {prev !== null && <CategoryCard cat={MENU[underIndex]} index={underIndex} />}
                <div key={cat.id} className="m-img-top absolute inset-0 overflow-hidden rounded-[32px]">
                  <CategoryCard cat={cat} index={active} alt={`Platillo de la categoría ${cat.label} en Los Primos`} />
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="min-w-0 lg:col-span-7">
            <h3 key={`t-${cat.id}`} className="m-cat-title display display-stack pt-[0.2em] text-4xl text-marino md:text-6xl">
              {cat.label}
            </h3>
            {cat.note && <p className="mt-4 max-w-[54ch] text-pretty text-base font-medium text-marino/85">{cat.note}</p>}
            <ul
              key={`l-${cat.id}`}
              onPointerEnter={onListEnter}
              onPointerMove={onListMove}
              onPointerLeave={onListLeave}
              className="m-list mt-8 grid grid-cols-1 gap-x-10 md:grid-cols-2"
            >
              {cat.items.map(([name, desc, price]) => (
                <li key={name} className="m-item group relative isolate -mx-3 border-b border-marino/15 px-3 py-5">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 inset-y-1 -z-10 origin-left scale-x-0 rounded-[18px] bg-amarillo transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(pointer:fine)]:group-hover:scale-x-100"
                  />
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-lg font-bold leading-snug text-marino">{name}</span>
                    <span className="relative shrink-0 pb-1.5 pt-[0.1em]">
                      <span className="display text-2xl text-marino">{price}</span>
                      <span aria-hidden="true" className="absolute bottom-0 right-0 h-[3px] w-7 rounded-full bg-coral" />
                    </span>
                  </div>
                  {desc && <p className="mt-1.5 text-pretty text-sm leading-relaxed text-marino/80">{desc}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="m-cta mt-16 flex flex-col items-center gap-5 text-center md:mt-20 md:flex-row md:justify-center md:gap-8 md:text-left">
          <p className="display display-stack text-3xl text-marino md:text-4xl">¿Ya sabes qué vas a pedir?</p>
          <span className="inline-block">
            <a ref={ctaRef} href={WHATSAPP} target="_blank" rel="noopener" className="btn btn-marino">
              <WhatsappLogo size={22} weight="bold" aria-hidden="true" />
              Pedir por WhatsApp
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
