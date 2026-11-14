import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, reduceMotion, getLenis } from "../lib/motion.js";

/**
 * Brand intro: marino curtain, logo badge pops with a bounce, counter 0-100,
 * then the curtain lifts (clip-path) and dispatches "lp:intro-done" so the hero plays.
 */
export default function Preloader() {
  const root = useRef(null);
  const [gone, setGone] = useState(() => reduceMotion());

  useGSAP(
    () => {
      if (gone) {
        window.__lpIntroDone = true;
        window.dispatchEvent(new Event("lp:intro-done"));
        return;
      }
      getLenis()?.stop();
      const count = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          getLenis()?.start();
          setGone(true);
        },
      });
      tl.from(".pl-logo", { scale: 0, rotate: -25, duration: 0.9, ease: "back.out(1.8)" })
        .to(count, {
          v: 100,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => {
            const el = root.current?.querySelector(".pl-count");
            if (el) el.textContent = String(Math.round(count.v)).padStart(3, "0");
          },
        }, 0.2)
        .to(".pl-logo", { y: -14, duration: 0.35, ease: "power2.out", yoyo: true, repeat: 1 }, 0.9)
        .add(() => {
          window.__lpIntroDone = true;
          window.dispatchEvent(new Event("lp:intro-done"));
        }, 1.35)
        .to(".pl-inner", { scale: 0.85, opacity: 0, duration: 0.4, ease: "power2.in" }, 1.3)
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, 1.4);
    },
    { scope: root }
  );

  if (gone) return null;
  return (
    <div
      ref={root}
      aria-hidden="true"
      className="fixed inset-0 z-[70] grid place-items-center bg-marino"
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      <div className="pl-inner flex flex-col items-center gap-6">
        <img src="/img/logo.png" width={512} height={512} alt="" className="pl-logo w-[min(56vw,260px)] drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]" />
        <div className="flex items-baseline gap-3 font-semibold uppercase tracking-[0.2em] text-cielo">
          <span>Preparando la sazón</span>
          <span className="pl-count display text-3xl tracking-normal text-amarillo">000</span>
        </div>
      </div>
    </div>
  );
}
