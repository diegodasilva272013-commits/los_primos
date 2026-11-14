// Shared motion infrastructure: Lenis smooth scroll wired into GSAP ScrollTrigger.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis = null;
export function getLenis() {
  return lenis;
}

export function initSmoothScroll() {
  if (lenis || reduceMotion()) return null;
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, anchors: { offset: -80 } });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/** Scroll to an element or y with Lenis when available (anchors, progress rows). */
export function scrollToTarget(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { offset: -72, ...opts });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
    else el?.scrollIntoView({ behavior: "smooth" });
  }
}

/** Magnetic hover for CTAs (desktop pointer only). Returns cleanup. */
export function magnetic(el, strength = 0.35) {
  if (!el || reduceMotion() || !window.matchMedia("(pointer: fine)").matches) return () => {};
  const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
  const move = (e) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => {
    xTo(0);
    yTo(0);
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}

export { gsap, ScrollTrigger };
