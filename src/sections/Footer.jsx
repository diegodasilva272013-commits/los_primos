import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
  Binoculars,
  Briefcase,
  FacebookLogo,
  InstagramLogo,
  Receipt,
  ShieldCheck,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { gsap } from "../lib/motion.js";
import { SOCIAL, WHATSAPP, WHATSAPP_LABEL } from "../data.js";

gsap.registerPlugin(useGSAP);

/*
  Layout family: closing sign-off on abismo. Logo badge + slogan, one pill system for every
  link, then the full-bleed cielo wordmark rising from below as the page ends.
*/

const LINKS = [
  ["Facturación", SOCIAL.facturacion, Receipt, "Facturación"],
  ["Bolsa de trabajo", SOCIAL.bolsa, Briefcase, "Bolsa de trabajo"],
  ["Aviso de privacidad", SOCIAL.privacidad, ShieldCheck, "Aviso de privacidad"],
  ["Instagram", SOCIAL.instagram, InstagramLogo, "Los Primos en Instagram"],
  ["Facebook", SOCIAL.facebook, FacebookLogo, "Los Primos en Facebook"],
  ["TripAdvisor", SOCIAL.tripadvisor, Binoculars, "Los Primos en TripAdvisor"],
];

const pillCls =
  "inline-flex min-h-12 items-center gap-2 rounded-full bg-white/5 px-5 text-sm font-semibold uppercase tracking-[0.04em] text-blanco ring-1 ring-white/10 transition-colors duration-300 hover:bg-amarillo hover:text-marino";

export default function Footer() {
  const scope = useRef(null);
  const logo = useRef(null);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Pills drop in as the footer arrives.
        gsap.from("[data-pill]", {
          y: 26,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.05,
          scrollTrigger: { trigger: "[data-pills]", start: "top 88%", once: true },
        });
        gsap.from(logo.current, {
          scale: 0.4,
          rotation: -90,
          opacity: 0,
          duration: 1.1,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: logo.current, start: "top 88%", once: true },
        });
        // The wordmark rises out of the floor as the page ends.
        gsap.fromTo(
          "[data-wordmark]",
          { yPercent: 40 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: "[data-wordmark-box]", start: "top bottom", end: "bottom bottom", scrub: true },
          }
        );
      });
    },
    { scope }
  );

  const spinLogo = contextSafe(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (gsap.isTweening(logo.current)) return;
    gsap.to(logo.current, { rotation: "+=360", duration: 0.9, ease: "back.out(1.4)" });
  });

  return (
    <footer ref={scope} className="relative overflow-hidden bg-abismo pt-24 text-blanco md:pt-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center lg:col-span-6">
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
            <p className="display display-stack max-w-[14ch] pt-1 text-[clamp(2.5rem,5vw,4.5rem)] text-blanco">
              El lugar para comer delicioso.
            </p>
          </div>

          <nav aria-label="Enlaces del pie de página" className="lg:col-span-6">
            <ul data-pills className="flex flex-wrap gap-3 lg:justify-end">
              {LINKS.map(([label, href, Icon, aria]) => (
                <li key={label} data-pill>
                  <a href={href} target="_blank" rel="noopener" aria-label={aria} className={pillCls}>
                    <Icon size={20} weight="bold" aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
              <li data-pill>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener"
                  aria-label={`WhatsApp ${WHATSAPP_LABEL}`}
                  className="btn btn-amarillo min-h-12 px-5 text-sm tabular-nums"
                >
                  <WhatsappLogo size={20} weight="bold" aria-hidden="true" />
                  {WHATSAPP_LABEL}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-14 border-t border-white/10 pt-8 text-sm text-blanco/70">
          © 2026 Los Primos Restaurante. Monterrey, Nuevo León.
        </p>
      </div>

      <div data-wordmark-box aria-hidden="true" className="mt-10 overflow-hidden">
        <p
          data-wordmark
          className="display translate-y-[20%] select-none whitespace-nowrap text-center text-[length:21.2vw] leading-[0.8] text-cielo"
        >
          Los Primos
        </p>
      </div>
    </footer>
  );
}
