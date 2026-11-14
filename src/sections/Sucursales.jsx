import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { HouseLine, MapPin, Phone } from "@phosphor-icons/react";
import { gsap } from "../lib/motion.js";
import { SUCURSALES } from "../data.js";

gsap.registerPlugin(useGSAP);

/*
  Layout family: interactive index list on marino. One row per branch.
  Desktop hover: an amarillo fill wipes in from the left behind the row and every label
  turns marino (9.7:1). No cursor follower: nothing ever covers the phone links.
  Mobile: compact stacked rows, phone and "Cómo llegar" share one wrapping row.
*/

const telHref = (t) => `tel:+52${t.replace(/\s+/g, "")}`;

const MOTION = "(prefers-reduced-motion: no-preference)";

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

export default function Sucursales() {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION, () => {
        gsap.from("[data-char]", {
          yPercent: 120,
          rotation: 6,
          duration: 1,
          ease: "expo.out",
          stagger: 0.022,
          scrollTrigger: { trigger: "[data-title]", start: "top 88%", once: true },
        });

        // Each row rises once; gsap.from guarantees the resting state is fully visible.
        gsap.utils.toArray("[data-row]", scope.current).forEach((row) => {
          const st = { trigger: row, start: "top 88%", once: true };
          gsap.from(row, { y: 48, opacity: 0, duration: 0.85, ease: "power3.out", scrollTrigger: st });
          gsap.from(row.querySelector("[data-line]"), {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { ...st },
          });
        });

        gsap.from("[data-dates]", {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-dates]", start: "top 88%", once: true },
        });
      });
    },
    { scope }
  );

  return (
    <section id="sucursales" ref={scope} aria-labelledby="sucursales-titulo" className="bg-marino py-28 text-blanco md:py-40">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <h2
          id="sucursales-titulo"
          data-title
          className="display display-stack pt-2 text-[clamp(2.25rem,8vw,8.5rem)] text-blanco"
        >
          <span className="block whitespace-nowrap">
            <Chars text="Seis sucursales." />
          </span>
          <span className="block whitespace-nowrap">
            <Chars text="Una sola sazón." />
          </span>
        </h2>

        <div className="relative mt-14 md:mt-24">
          <ul>

          {SUCURSALES.map((s) => (
            <li key={s.name} data-row className="group relative">
              <div data-line aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/20" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-amarillo transition-transform duration-[650ms] ease-[var(--ease-out-expo)] lg:group-focus-within:scale-x-100 lg:group-hover:scale-x-100"
              />

              <div className="relative grid grid-cols-1 gap-3 py-7 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-6 lg:py-10">
                <div className="lg:col-span-5">
                  <h3 className="display display-stack pt-1 text-[clamp(2.5rem,4.6vw,4.5rem)] text-blanco transition-[color,translate] duration-500 ease-[var(--ease-out-expo)] lg:group-focus-within:translate-x-3 lg:group-focus-within:text-marino lg:group-hover:translate-x-3 lg:group-hover:text-marino">
                    {s.name}
                  </h3>
                  {s.origin && (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amarillo px-3 py-1.5 text-sm font-bold text-marino transition-colors duration-300 lg:group-focus-within:bg-marino lg:group-focus-within:text-amarillo lg:group-hover:bg-marino lg:group-hover:text-amarillo">
                      <HouseLine size={16} weight="bold" aria-hidden="true" />
                      Nuestra primera casa
                    </p>
                  )}
                </div>

                <div className="text-base leading-relaxed lg:col-span-4">
                  <p className="text-blanco transition-colors duration-300 lg:group-focus-within:text-marino lg:group-hover:text-marino">
                    {s.addr}
                  </p>
                  <p className="mt-1 text-blanco/80 transition-colors duration-300 lg:group-focus-within:text-marino lg:group-hover:text-marino">
                    {s.hours}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 lg:col-span-3 lg:justify-end">
                  {s.tel.map((t) => (
                    <a
                      key={t}
                      href={telHref(t)}
                      aria-label={`Llamar a ${s.name}, ${t}`}
                      className="inline-flex min-h-12 items-center gap-2 font-semibold tabular-nums text-blanco underline-offset-4 transition-colors duration-300 hover:text-amarillo hover:underline lg:hover:text-marino lg:group-focus-within:text-marino lg:group-hover:text-marino"
                    >
                      <Phone size={18} weight="bold" aria-hidden="true" />
                      {t}
                    </a>
                  ))}
                  <a
                    href={s.map}
                    target="_blank"
                    rel="noopener"
                    aria-label={`Cómo llegar a ${s.name}`}
                    className="btn btn-ghost min-h-12 px-5 text-sm text-blanco lg:group-focus-within:text-marino lg:group-hover:text-marino"
                  >
                    <MapPin size={20} weight="bold" aria-hidden="true" />
                    Cómo llegar
                  </a>
                </div>
              </div>
            </li>
          ))}
          </ul>
          <div aria-hidden="true" className="h-px bg-white/20" />
        </div>

        <p data-dates className="mt-12 max-w-[60ch] text-base leading-relaxed text-blanco/80 md:text-lg">
          Cerramos el 25 de diciembre y el 1 de enero. El 24 y 31 de diciembre cerramos a las 18:00.
        </p>
      </div>
    </section>
  );
}
