import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { gsap, magnetic, reduceMotion } from "../lib/motion.js";
import { MENU, WHATSAPP } from "../data.js";

const TITLE = "El menú";

/*
  Light color block (espuma + marino) so the page breathes between dark sections.
  Signature micro-interaction (pointer: fine only): hovering an item row shows a floating 220x160
  rounded-[32px] preview of the category dish that follows the cursor, and the row gets an amarillo sweep.
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
  const under = MENU[prev ?? active];

  /* One-time: header reveal, frame inset reveal, blob spin, cursor preview setters. */
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
          { clipPath: "inset(18% 14% 18% 14% round 32px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 32px)",
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: q(".m-panel")[0], start: "top 88%", once: true },
          }
        );
        gsap.from(q(".m-blob"), {
          scale: 0.6,
          autoAlpha: 0,
          duration: 1,
          ease: "back.out(1.5)",
          scrollTrigger: { trigger: q(".m-panel")[0], start: "top 88%", once: true },
        });
        gsap.to(q(".m-blob-spin"), { rotate: 360, duration: 40, ease: "none", repeat: -1 });
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
        gsap.set(c, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
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

  /* Items reveal on first view (short, early); on every tab change: inset wipe on the photo, items stagger. */
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
            autoAlpha: 0,
            duration: 0.4,
            ease: "power3.out",
            stagger: 0.03,
            scrollTrigger: { trigger: q(".m-list")[0], start: "top 88%", once: true },
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
        gsap.fromTo(q(".m-img-top img"), { scale: 1.25 }, { scale: 1.08, duration: 1.1, ease: "expo.out" });
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
    gsap.to(cursor.current, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(1.8)", overwrite: "auto" });
  };
  const onListMove = (e) => {
    const f = follow.current;
    if (!f) return;
    f.x(e.clientX);
    f.y(e.clientY);
    f.r(gsap.utils.clamp(-18, 18, (e.clientX - f.lastX) * 1.2));
    f.lastX = e.clientX;
  };
  const onListLeave = () => {
    if (!follow.current) return;
    follow.current.r(0);
    gsap.to(cursor.current, { scale: 0, autoAlpha: 0, duration: 0.3, ease: "power2.in", overwrite: "auto" });
  };

  return (
    <section
      id="menu"
      ref={root}
      aria-labelledby="menu-titulo"
      className="relative overflow-x-clip bg-espuma pb-24 pt-24 text-marino md:pb-32 md:pt-32"
    >
      {/* Floating dish preview that follows the pointer (desktop fine pointer only) */}
      <div
        ref={cursor}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[160px] w-[220px] overflow-hidden rounded-[32px] bg-blanco opacity-0 shadow-[0_24px_50px_-16px_rgba(27,39,102,0.5)] [@media(pointer:fine)]:block"
      >
        <img src={cat.img} width={220} height={160} alt="" className="h-full w-full scale-[1.12] object-cover" />
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
          className="m-panel mt-10 grid rounded-[32px] grid-cols-1 gap-12 md:mt-14 lg:grid-cols-12 lg:gap-14"
        >
          {/* Visual */}
          <div className="min-w-0 lg:col-span-5">
            {/* Padding keeps the frame shadow and the offset blob inside the column (no clipped edges). */}
            <div className="relative px-2 pb-10 pt-2 sm:px-6 lg:sticky lg:top-28">
              <div className="relative mx-auto w-[min(100%,420px)]">
                <div aria-hidden="true" className="m-blob pointer-events-none absolute -bottom-6 -right-4 w-[62%] opacity-90 sm:-right-6">
                  <img
                    src="/img/blob.webp"
                    width={700}
                    height={700}
                    loading="lazy"
                    decoding="async"
                    alt=""
                    className="m-blob-spin h-auto w-full"
                  />
                </div>
                <div className="m-frame relative aspect-[4/5] w-full overflow-hidden rounded-[32px] bg-blanco shadow-[0_30px_60px_-24px_rgba(27,39,102,0.55)]">
                  <img
                    src={under.img}
                    width={520}
                    height={650}
                    loading="lazy"
                    decoding="async"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-[1.08] object-cover"
                  />
                  <div key={cat.id} className="m-img-top absolute inset-0 overflow-hidden rounded-[32px]">
                    <img
                      src={cat.img}
                      width={520}
                      height={650}
                      loading="lazy"
                      decoding="async"
                      alt={`Platillo de la categoría ${cat.label} de Los Primos`}
                      className="h-full w-full scale-[1.08] object-cover"
                    />
                  </div>
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
                    <span className="relative shrink-0 pb-1.5">
                      <span className="display text-2xl text-marino">{price}</span>
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 right-0 h-[3px] w-7 rounded-full bg-coral"
                      />
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
