import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
  ArrowUp,
  Binoculars,
  Briefcase,
  FacebookLogo,
  InstagramLogo,
  MapPin,
  Receipt,
  ShieldCheck,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { gsap, magnetic, scrollToTarget } from "../lib/motion.js";
import { ILU, SOCIAL, SUCURSALES, WHATSAPP, WHATSAPP_LABEL } from "../data.js";

gsap.registerPlugin(useGSAP);

/*
  Layout family: polished closing on abismo, three tiers with one spacing rhythm.
  1. Invitation band: brand line art (crab left, almeja right, low opacity) + one line + WhatsApp CTA.
  2. Directory grid (md 4 cols, mobile stacked): brand / Visítanos / Contacto / Síguenos.
     Every link is plain text, min-h-12, amarillo + underline on hover.
  3. The "LOS PRIMOS" wordmark, COMPLETE and fitted to the viewport width, rising through a mask
     with scrub; then the legal line and "Volver arriba".
  Contrast: blanco and blanco/70+ on abismo (>= 9:1), amarillo on abismo (12:1).
*/

const CONTACTO = [
  ["Facturación", SOCIAL.facturacion, Receipt],
  ["Bolsa de trabajo", SOCIAL.bolsa, Briefcase],
  ["Aviso de privacidad", SOCIAL.privacidad, ShieldCheck],
];

const REDES = [
  ["Instagram", SOCIAL.instagram, InstagramLogo],
  ["Facebook", SOCIAL.facebook, FacebookLogo],
  ["TripAdvisor", SOCIAL.tripadvisor, Binoculars],
];

const linkCls =
  "inline-flex min-h-12 items-center gap-2.5 text-base font-medium text-blanco/85 decoration-amarillo decoration-2 underline-offset-[6px] transition-colors duration-300 hover:text-amarillo hover:underline";

const headCls = "text-sm font-bold uppercase tracking-[0.14em] text-amarillo";

export default function Footer() {
  const scope = useRef(null);
  const logo = useRef(null);
  const cta = useRef(null);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = (sel) => gsap.utils.toArray(sel, scope.current);

        // Invitation band: line rises, CTA follows; illustrations rock gently forever.
        gsap.from(q("[data-band-rise]"), {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: q("[data-band]")[0], start: "top 85%", once: true },
        });
        q("[data-ilu]").forEach((el, i) => {
          gsap.to(el, {
            y: i ? 14 : -14,
            rotation: i ? -6 : 6,
            duration: 4 + i,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });

        // Logo spins in; directory columns rise in sequence.
        gsap.from(logo.current, {
          scale: 0.4,
          rotation: -90,
          opacity: 0,
          duration: 1.1,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: logo.current, start: "top 90%", once: true },
        });
        gsap.from(q("[data-col]"), {
          y: 36,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: q("[data-grid]")[0], start: "top 88%", once: true },
        });

        // Wordmark rises through its mask; it is complete (yPercent 0) before the page ends.
        gsap.fromTo(
          q("[data-wordmark]"),
          { yPercent: 70 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: q("[data-wordmark-box]")[0], start: "top bottom", end: "bottom bottom", scrub: 0.6 },
          }
        );

        const off = magnetic(cta.current);
        return () => off();
      });
    },
    { scope }
  );

  const spinLogo = contextSafe(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (gsap.isTweening(logo.current)) return;
    gsap.to(logo.current, { rotation: "+=360", duration: 0.9, ease: "back.out(1.4)" });
  });

  const goTo = (href) => (e) => {
    e.preventDefault();
    scrollToTarget(href);
  };

  return (
    <footer ref={scope} className="relative overflow-hidden bg-abismo text-blanco">
      {/* 1. Invitation band */}
      <div data-band className="relative isolate overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-[6%] top-1/2 w-[min(42vw,400px)] -translate-y-1/2 opacity-[0.1] md:left-[2%]">
            <img data-ilu src={ILU.crab} width={1000} height={856} alt="" loading="lazy" decoding="async" className="h-auto w-full" />
          </div>
          <div className="absolute -right-[6%] top-1/2 w-[min(38vw,360px)] -translate-y-1/2 opacity-[0.1] md:right-[2%]">
            <img data-ilu src={ILU.almeja} width={1000} height={829} alt="" loading="lazy" decoding="async" className="h-auto w-full" />
          </div>
        </div>

        <div className="mx-auto flex max-w-[1400px] flex-col items-center px-4 py-20 text-center md:px-8 md:py-28">
          <p data-band-rise className="display display-stack max-w-[18ch] text-balance text-[clamp(2.25rem,5vw,4.75rem)] text-blanco">
            Te esperamos en cualquiera de nuestras <span className="text-amarillo">seis sucursales.</span>
          </p>
          <div data-band-rise className="mt-10">
            <a ref={cta} href={WHATSAPP} target="_blank" rel="noopener" className="btn btn-amarillo min-h-[58px]">
              <WhatsappLogo size={22} weight="bold" aria-hidden="true" />
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* 2. Directory grid */}
      <div className="mx-auto max-w-[1400px] px-4 pt-16 md:px-8 md:pt-20">
        <div data-grid className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4 md:gap-8 lg:gap-12">
          <div data-col className="flex flex-col items-start gap-6">
            <img
              ref={logo}
              onPointerEnter={spinLogo}
              src="/img/logo.png"
              alt="Los Primos Restaurante"
              width="512"
              height="512"
              loading="lazy"
              decoding="async"
              className="h-[140px] w-[140px] shrink-0"
            />
            <p className="display display-stack max-w-[12ch] text-[clamp(1.75rem,2.4vw,2.5rem)] text-blanco">
              El lugar para comer delicioso.
            </p>
          </div>

          <nav data-col aria-labelledby="ft-visitanos" className="min-w-0">
            <h2 id="ft-visitanos" className={headCls}>
              Visítanos
            </h2>
            <ul className="mt-4 flex flex-col">
              {SUCURSALES.map((s) => (
                <li key={s.name}>
                  <a href="#sucursales" onClick={goTo("#sucursales")} className={linkCls}>
                    <MapPin size={18} weight="bold" aria-hidden="true" className="shrink-0 text-blanco/60" />
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav data-col aria-labelledby="ft-contacto" className="min-w-0">
            <h2 id="ft-contacto" className={headCls}>
              Contacto
            </h2>
            <ul className="mt-4 flex flex-col">
              <li>
                <a href={WHATSAPP} target="_blank" rel="noopener" aria-label={`WhatsApp ${WHATSAPP_LABEL}`} className={`${linkCls} tabular-nums`}>
                  <WhatsappLogo size={18} weight="bold" aria-hidden="true" className="shrink-0 text-blanco/60" />
                  {WHATSAPP_LABEL}
                </a>
              </li>
              {CONTACTO.map(([label, href, Icon]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener" className={linkCls}>
                    <Icon size={18} weight="bold" aria-hidden="true" className="shrink-0 text-blanco/60" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav data-col aria-labelledby="ft-siguenos" className="min-w-0">
            <h2 id="ft-siguenos" className={headCls}>
              Síguenos
            </h2>
            <ul className="mt-4 flex flex-col">
              {REDES.map(([label, href, Icon]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener" aria-label={`Los Primos en ${label}`} className={linkCls}>
                    <Icon size={20} weight="bold" aria-hidden="true" className="shrink-0" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* 3. Wordmark (complete, fitted to width) rising through its mask */}
      <div
        data-wordmark-box
        aria-hidden="true"
        className="mt-16 overflow-hidden px-[1.5vw] pb-[0.05em] pt-[0.07em] text-[20.5vw] leading-[0.82] md:mt-24"
      >
        <p data-wordmark className="display select-none whitespace-nowrap text-center leading-[0.82] text-cielo">
          Los Primos
        </p>
      </div>

      {/* Legal line + back to top */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-col items-start gap-4 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-blanco/70">© 2026 Los Primos Restaurante. Monterrey, Nuevo León.</p>
          <a
            href="#inicio"
            onClick={goTo("#inicio")}
            className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold uppercase tracking-[0.06em] text-blanco ring-1 ring-white/20 transition-colors duration-300 hover:bg-amarillo hover:text-marino hover:ring-amarillo"
          >
            <ArrowUp size={18} weight="bold" aria-hidden="true" />
            Volver arriba
          </a>
        </div>
      </div>
    </footer>
  );
}
