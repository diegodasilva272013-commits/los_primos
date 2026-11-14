import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { MapPin, WhatsappLogo } from "@phosphor-icons/react";
import { gsap, magnetic, scrollToTarget } from "../lib/motion.js";
import { WHATSAPP } from "../data.js";
import Bubbles from "../components/Bubbles.jsx";

gsap.registerPlugin(useGSAP);

/*
  Layout family: final "destapa la chispa" moment on a full-bleed cielo field.
  Desktop: headline, waving mascot + copy and CTAs on the left; cluster of three cut-out plates
  on the right, the whole composition fits one 100dvh screen. Mobile: headline, plates, copy, CTAs.
  The mascot lives only here. Nothing sits under the plates, nothing overlaps text.
  Text on cielo is always marino (4.67:1). Never white here.
  Plate layers: [data-par] mouse parallax > [data-fly] entrance > [data-bob] idle float.
*/

const MOTION = "(prefers-reduced-motion: no-preference)";
const PARALLAX = "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (min-width: 1024px)";

const PLATES = [
  {
    src: "/cut/pulpo.webp",
    w: 1200,
    h: 884,
    alt: "Pulpo zarandeado con arroz y verdura fresca",
    pos: "left-0 top-0 w-[50%] z-10",
    tilt: "-rotate-[10deg]",
    depth: 0.45,
    from: -28,
  },
  {
    src: "/cut/pulpo-dark.webp",
    w: 798,
    h: 498,
    alt: "Pulpo a las brasas sobre pepino, zanahoria y aguacate",
    pos: "left-[16%] top-[24%] w-[72%] z-20",
    tilt: "rotate-[3deg]",
    depth: 0.9,
    from: 18,
  },
  {
    src: "/cut/estrella.webp",
    w: 702,
    h: 416,
    alt: "Combo Estrella con tostada, camaroncitos, camarón envuelto y taco",
    pos: "right-0 bottom-0 w-[52%] z-30",
    tilt: "rotate-[8deg]",
    depth: 1.4,
    from: 32,
  },
];

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

export default function CtaFinal() {
  const scope = useRef(null);
  const cta = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION, () => {
        const q = (sel) => gsap.utils.toArray(sel, scope.current);

        // Entrance: headline rises, plates fly up from below spinning into place,
        // mascot pops, copy and CTAs follow.
        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: scope.current, start: "top 88%", once: true },
        });
        tl.from(q("[data-char]"), { yPercent: 120, rotation: 8, duration: 1, stagger: 0.03 })
          .from(
            q("[data-fly]"),
            {
              y: () => window.innerHeight * 0.45,
              rotation: (i) => PLATES[i].from * 2,
              scale: 0.7,
              opacity: 0,
              duration: 1.4,
              ease: "back.out(1.2)",
              stagger: 0.15,
            },
            0.15
          )
          .from(q("[data-mascot]"), { scale: 0, rotation: -40, duration: 1, ease: "back.out(1.8)" }, 0.5)
          .from(q("[data-rise]"), { y: 36, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.6);

        // Idle float, each plate on its own rhythm so the cluster never syncs up.
        q("[data-bob]").forEach((el, i) => {
          gsap.to(el, {
            y: -10 - i * 6,
            rotation: i % 2 ? -2.5 : 2.5,
            duration: 2.4 + i * 0.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * 0.3,
          });
        });

        // Mascot waves hello and keeps its spot next to the CTA.
        gsap.fromTo(
          q("[data-wave]"),
          { rotation: -9 },
          { rotation: 9, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "60% 90%" }
        );

        const off = magnetic(cta.current);
        return () => off();
      });

      // Desktop mouse parallax: deeper plates travel further.
      mm.add(PARALLAX, () => {
        const el = scope.current;
        const items = gsap.utils.toArray("[data-par]", el).map((node, i) => ({
          d: PLATES[i].depth,
          x: gsap.quickTo(node, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(node, "y", { duration: 0.9, ease: "power3" }),
        }));
        const mascot = gsap.utils.toArray("[data-mascot]", el)[0];
        const mx = mascot && gsap.quickTo(mascot, "x", { duration: 1, ease: "power3" });
        const move = (e) => {
          const r = el.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          items.forEach((it) => {
            it.x(nx * 44 * it.d);
            it.y(ny * 32 * it.d);
          });
          mx?.(nx * -14);
        };
        const leave = () => {
          items.forEach((it) => {
            it.x(0);
            it.y(0);
          });
          mx?.(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope }
  );

  const goSucursales = (e) => {
    e.preventDefault();
    scrollToTarget("#sucursales");
  };

  return (
    <section
      id="pedir"
      ref={scope}
      aria-labelledby="pedir-titulo"
      className="relative isolate overflow-hidden bg-cielo py-24 text-marino md:py-28"
    >
      <Bubbles count={34} color="251,253,255" className="-z-10" />

      {/* lg: two columns sized to fit one 100dvh screen at 1440x900.
          Left: headline, mascot + copy, CTAs (gap-8 between blocks). Right: plate cluster.
          Mobile: headline, plates, copy, CTAs. Nothing overlaps text. */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-y-8 px-4 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-x-12">
        <h2
          id="pedir-titulo"
          className="display display-stack max-w-[12ch] pt-2 text-[clamp(3.25rem,7vw,7.5rem)] text-marino lg:col-span-6 lg:row-start-1 lg:self-end"
        >
          <Chars text="¿Qué se te antoja hoy?" />
        </h2>

        {/* Plate cluster (each plate has its own alt). Height capped so the section fits one screen. */}
        <div className="relative mx-auto aspect-[5/4] w-full max-w-[min(100%,560px)] lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:max-w-[min(100%,72dvh)]">
          {PLATES.map((p) => (
            <div key={p.src} data-par className={`absolute ${p.pos} will-change-transform`}>
              <div data-fly>
                <div data-bob className={p.tilt}>
                  <img
                    src={p.src}
                    alt={p.alt}
                    width={p.w}
                    height={p.h}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full drop-shadow-[0_30px_34px_rgb(12_21_56/0.38)]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mascot + copy + CTAs */}
        <div className="flex flex-col gap-8 lg:col-span-6 lg:row-start-2 lg:self-start">
          <div className="flex items-center gap-8">
            <div data-mascot className="w-[clamp(110px,12vw,180px)] shrink-0">
              <img
                data-wave
                src="/img/mascota.png"
                alt="Pescadito chef de Los Primos saludando"
                width="300"
                height="300"
                loading="lazy"
                decoding="async"
                className="h-auto w-full drop-shadow-[0_18px_22px_rgb(12_21_56/0.3)]"
              />
            </div>
            <p data-rise className="max-w-[22ch] text-lg font-semibold leading-snug sm:text-xl md:text-2xl">
              Pide por WhatsApp o ven a la sucursal que te quede más cerca.
            </p>
          </div>

          <div data-rise className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a ref={cta} href={WHATSAPP} target="_blank" rel="noopener" className="btn btn-marino min-h-[60px] text-[1.05rem]">
              <WhatsappLogo size={22} weight="bold" aria-hidden="true" />
              Pedir por WhatsApp
            </a>
            <a href="#sucursales" onClick={goSucursales} className="btn btn-ghost min-h-[60px] text-[1.05rem] text-marino">
              <MapPin size={22} weight="bold" aria-hidden="true" />
              Ver sucursales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
