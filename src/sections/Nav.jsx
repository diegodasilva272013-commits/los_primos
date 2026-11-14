import { useEffect, useRef, useState } from "react";
import { List, X, WhatsappLogo } from "@phosphor-icons/react";
import { WHATSAPP } from "../data.js";
import { ScrollTrigger, gsap, scrollToTarget, reduceMotion } from "../lib/motion.js";

const LINKS = [
  ["Sabores", "#sabores"],
  ["Historia", "#historia"],
  ["Menú", "#menu"],
  ["Combos", "#combos"],
  ["Sucursales", "#sucursales"],
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const bar = useRef(null);

  // Hide on scroll down, show on scroll up (ScrollTrigger direction, not a raw scroll listener).
  useEffect(() => {
    if (reduceMotion()) return;
    const st = ScrollTrigger.create({
      start: 120,
      end: "max",
      onUpdate: (self) => {
        gsap.to(bar.current, { yPercent: self.direction === 1 ? -140 : 0, duration: 0.5, ease: "power3.out", overwrite: true });
      },
    });
    return () => st.kill();
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    scrollToTarget(href);
  };

  return (
    <header ref={bar} className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6">
      <nav
        aria-label="Principal"
        className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between gap-3 rounded-full bg-marino/95 pl-2 pr-2 shadow-[0_12px_40px_-12px_rgba(12,21,56,0.6)] ring-1 ring-white/10 backdrop-blur-xl"
      >
        <a href="#inicio" onClick={(e) => go(e, "#inicio")} className="flex min-h-12 items-center gap-2 rounded-full pr-3" aria-label="Los Primos Restaurante, inicio">
          <img src="/img/logo.png" width={512} height={512} alt="" className="h-[58px] w-[58px] -my-2 drop-shadow-md transition-transform duration-500 hover:rotate-[-8deg] hover:scale-110" />
          <span className="display hidden text-xl tracking-wide text-blanco sm:block">Los Primos</span>
        </a>
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a
                href={href}
                onClick={(e) => go(e, href)}
                className="group relative inline-flex min-h-12 items-center overflow-hidden rounded-full px-4 text-sm font-bold uppercase tracking-wider text-blanco/85 hover:text-marino"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-amarillo transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0" />
                <span className="relative">{label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a href={WHATSAPP} target="_blank" rel="noopener" className="btn btn-amarillo hidden !min-h-[52px] sm:inline-flex">
            <WhatsappLogo size={20} weight="bold" aria-hidden="true" />
            Pedir por WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="grid h-[52px] w-[52px] place-items-center rounded-full bg-white/10 text-blanco lg:hidden"
          >
            {open ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="menu-movil" className="mx-auto mt-2 max-w-[1400px] rounded-[32px] bg-marino p-3 shadow-2xl ring-1 ring-white/10 lg:hidden">
          <ul className="flex flex-col">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <a href={href} onClick={(e) => go(e, href)} className="display flex min-h-14 items-center rounded-full px-4 text-4xl text-blanco hover:bg-white/10">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a href={WHATSAPP} target="_blank" rel="noopener" className="btn btn-amarillo mt-2 w-full sm:hidden">
            <WhatsappLogo size={20} weight="bold" aria-hidden="true" />
            Pedir por WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
