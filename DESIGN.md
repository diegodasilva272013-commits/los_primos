# Los Primos Restaurante: Design Brief v2 (REAL BRAND + reel-level motion)

The client rejected v1: "no usaste mi branding, no aparece el logo, cosas superpuestas, faltan animaciones,
es una página estática muy básica, no se parece a la del reel". v2 must fix every one of those.

## Reference (the reel's "CHISPA" demo, what "level" means)
Saturated full-bleed color fields that MORPH between "flavors"; giant condensed type spanning the viewport;
ONE hero product (here: a clean cut-out plate) floating with 3D tilt, idle float and particles (bubbles);
bottom flavor switcher that recolors the entire hero; pinned scroll scenes; continuous, cinematic motion;
pill CTAs; big final CTA with clustered products. Motion is the product: the page must feel ALIVE at all times.

## Brand (sampled from the official logo /img/logo.png and site assets)
Tailwind tokens (src/styles.css): marino #1b2766 · marino-2 #142052 · abismo #0c1538 · cielo #26a0dc · cielo-2
· espuma #e8f6fd · blanco #fbfdff · oro #c8891e · amarillo #f6d840 · coral #ed6f5f · tinta #121a40.
- Logo: /img/logo.png (512x512 transparent badge, fish mascot with hat + "Los Primos Restaurante"). USE IT.
- Mascot alone: /img/mascota.png (300x300 transparent: fish chef, thumbs up, holding a cloche). USE IT as a
  character that appears and reacts (waves/bounces/peeks) in several sections.
- Brand blob: /img/blob.webp (yellow organic shape, transparent) for backdrops behind plates; rotate slowly.
- Buttons: `.btn .btn-amarillo` (primary, marino label), `.btn .btn-marino`, `.btn .btn-ghost` (border currentColor).
- Fonts: Anton (`.display`, `.display-stack` for multi-line = leading 1.04) + Barlow body.
CONTRAST (computed): marino on cielo 4.67 OK · marino on coral 4.61 OK · marino on amarillo 9.7 · blanco on marino 13.5.
  BLANCO ON CIELO/CORAL/AMARILLO IS FORBIDDEN for text (fails). On cielo/coral/amarillo use marino or abismo text.
- Radius: interactive = pill; image cards = rounded-[32px]; badges/plates = circle. Nothing else.
- Container: `mx-auto max-w-[1400px] px-4 md:px-8`. Fixed nav is 68px tall + 12px top: content top padding >= pt-28.

## Assets
- Clean CUT-OUT plates (transparent webp, float them, no circles needed): /cut/pulpo-dark.webp 798x498 (BEST),
  /cut/pulpo.webp 1200x884, /cut/estrella.webp 702x416, /cut/brochetas.webp 798x484.
- Photos (rectangular, white plates): /img/*.webp (see src/data.js). Use in rounded-[32px] frames or circles with
  overflow-hidden + scale 1.12 to hide plate edges.
- Data: src/data.js (SABORES, MENU, COMBOS, SUCURSALES, HISTORIA, VALORES, HERO_PLATOS, WHATSAPP, SOCIAL). Real data only.

## Motion infrastructure (src/lib/motion.js) USE IT
- `import { gsap, ScrollTrigger, reduceMotion, scrollToTarget, magnetic } from "../lib/motion.js"` (Lenis smooth scroll
  already runs globally and feeds ScrollTrigger). `useGSAP` from @gsap/react with `{ scope }`.
- `magnetic(el)` returns cleanup: apply to primary CTAs.
- `<Bubbles count color="r,g,b" />` from src/components/Bubbles.jsx: canvas of rising bubbles, absolute inset-0.
- Preloader dispatches `window` event "lp:intro-done" (and sets window.__lpIntroDone = true) when the curtain lifts:
  the HERO intro timeline must wait for it (if already true, play immediately).
- Wrap motion in `gsap.matchMedia()` with "(prefers-reduced-motion: no-preference)"; reduced motion = static final state.
- Only transform/opacity/clip-path/filter:blur(small) animations. No window scroll listeners (use ScrollTrigger).
- Use ScrollTrigger `getVelocity()` / `onUpdate(self)` for velocity effects (skew, marquee speed).

## Hard rules (taste-skill pre-flight + client complaints)
- NO OVERLAPS that hide content: text never sits under images or under the nav. Decorative overlaps (plate over a
  giant background word) are fine ONLY if the text remains readable (put the word behind with lower z, or outline it).
- Zero em/en dashes in visible text. Phosphor icons only. No new deps. Spanish (Mexico) copy, warm regio tone.
- CTA labels (one per intent, page-wide): "Ver el menú" (#menu) · "Pedir por WhatsApp" (WHATSAPP, _blank, rel noopener,
  WhatsappLogo) · "Ver sucursales" (#sucursales). Use `scrollToTarget(href)` on in-page anchor clicks.
- Touch targets >= 48px. Mobile (<768px) explicit single column, no page horizontal overflow at 390px.
- Images: width/height attrs, Spanish alt, loading="lazy" except hero.
- Only ONE marquee on the page: the Ticker band (owned by the Hero builder).
