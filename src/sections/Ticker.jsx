import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../lib/motion.js";
import { HERO_PLATOS, SABORES } from "../data.js";

gsap.registerPlugin(useGSAP);

/*
  The page's only marquee: a tilted amarillo band laid over a marino strip (hero > sabores seam).
  The loop runs on the GSAP ticker so scroll can push it: speed follows |velocity|, direction follows
  the scroll direction (and stays there, CHISPA-style), skew + dish wobble follow velocity and ease back.
  Separators are the same HD cut-outs the hero and sabores already load (cached, no extra requests).
*/
const WORDS = ["Aguachiles", "Cócteles", "Pulpo zarandeado", "Caldos", "Tostadas", "Filetes"];
const DISHES = [...HERO_PLATOS, ...SABORES].map(({ img, w, h }) => ({ img, w, h }));
const BASE_PX = 90; // px per second at rest

function Strip() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w, i) => {
        const d = DISHES[i % DISHES.length];
        return (
          <Fragment key={w}>
            <span className="display whitespace-nowrap px-[0.32em] leading-none">{w}</span>
            <img
              src={d.img}
              width={d.w}
              height={d.h}
              alt=""
              loading="lazy"
              decoding="async"
              className="tk-fish -my-[0.12em] h-[1.24em] w-auto shrink-0 object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.25)]"
              style={{ aspectRatio: `${d.w} / ${d.h}` }}
            />
          </Fragment>
        );
      })}
    </div>
  );
}

export default function Ticker() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = root.current.querySelector(".tk-track");
        const skewEl = root.current.querySelector(".tk-skew");
        const fish = root.current.querySelectorAll(".tk-fish");
        const setX = gsap.quickSetter(track, "x", "px");
        const setSkew = gsap.quickSetter(skewEl, "skewX", "deg");
        const setFish = gsap.quickSetter(fish, "rotation", "deg");
        const s = { x: 0, half: track.scrollWidth / 2, dir: 1, boost: 0, skewT: 0, skew: 0, on: false };

        const tick = (_t, dtRaw) => {
          const dt = Math.min(dtRaw, 64);
          const k = dt / 16.667;
          s.boost *= Math.pow(0.93, k);
          s.skewT *= Math.pow(0.86, k);
          s.skew += (s.skewT - s.skew) * Math.min(1, 0.16 * k);
          s.x -= s.dir * BASE_PX * (1 + s.boost) * (dt / 1000);
          setX(gsap.utils.wrap(-s.half, 0, s.x));
          setSkew(s.skew);
          setFish(s.skew * -1.4);
        };
        const run = (on) => {
          if (on && !s.on) gsap.ticker.add(tick);
          if (!on && s.on) gsap.ticker.remove(tick);
          s.on = on;
        };

        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onRefresh: () => {
            s.half = track.scrollWidth / 2;
          },
          onToggle: (self) => run(self.isActive),
          onUpdate: (self) => {
            const v = self.getVelocity();
            s.dir = self.direction;
            s.boost = Math.max(s.boost, Math.min(Math.abs(v) / 300, 8));
            s.skewT = gsap.utils.clamp(-12, 12, -v / 160);
          },
        });
        run(st.isActive);

        return () => run(false);
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-marino py-14 md:py-20">
      <p className="sr-only">Aguachiles, cócteles, pulpo zarandeado, caldos, tostadas y filetes.</p>
      <div
        aria-hidden="true"
        className="relative left-1/2 w-[114vw] -translate-x-1/2 -rotate-2 bg-amarillo py-[0.22em] text-marino shadow-[0_28px_60px_-24px_rgba(0,0,0,0.6)]"
        style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
      >
        <div className="tk-skew">
          <div className="tk-track flex w-max will-change-transform">
            <Strip />
            <Strip />
          </div>
        </div>
      </div>
    </section>
  );
}
