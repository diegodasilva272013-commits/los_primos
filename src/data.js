// Real data extracted from losprimosrestaurante.mx (menu, sucursales, nosotros). Prices MXN.

export const WHATSAPP = "https://wa.me/528123727515";
export const WHATSAPP_LABEL = "81 2372 7515";

export const SOCIAL = {
  instagram: "https://www.instagram.com/losprimosrestaurante/",
  facebook: "https://www.facebook.com/losprimosrestaurante.mx",
  tripadvisor:
    "https://www.tripadvisor.com.mx/Restaurant_Review-g1136270-d10630872-Reviews-Los_Primos_Restaurante-Apodaca_Northern_Mexico.html",
  facturacion: "https://www.wansoft.net/LosPrimos/FE.html",
  bolsa: "https://losprimosrestaurante.mx/bolsa-de-trabajo/",
  privacidad: "https://losprimosrestaurante.mx/aviso-de-privacidad/",
};

// Sabores: the color-block story (one per signature dish)
export const SABORES = [
  // Each sabor is a floating CUT-OUT product (reel: one product per screen, full-bleed color).
  {
    id: "pulpo",
    name: "Pulpo Zarandeado",
    line: "El platillo de la casa.",
    body: "Pulpo entero a las brasas con nuestro sazón original, arroz y verdura fresca.",
    img: "/cut/pulpo.webp", w: 1200, h: 884,
    color: "#26a0dc",
    ink: "#1b2766",
    specs: [["Precio", "$559"], ["Cocción", "Brasas"], ["Para", "Compartir"]],
  },
  {
    id: "brochetas",
    name: "Brochetas",
    line: "Camarón, tocino y fuego.",
    body: "Brochetas de camarón con champiñón, cebolla, pimiento y tocino. Con arroz y brócoli.",
    img: "/cut/brochetas.webp", w: 788, h: 480,
    color: "#f6d840",
    ink: "#1b2766",
    specs: [["Precio", "$335"], ["Proteína", "Camarón"], ["Estilo", "Parrilla"]],
  },
  {
    id: "bbq",
    name: "Envueltos BBQ",
    line: "Dulce, ahumado y regio.",
    body: "Camarones envueltos en tocino bañados en salsa barbecue, con arroz y verdura.",
    img: "/cut/bbq.webp", w: 810, h: 486,
    color: "#ed6f5f",
    ink: "#1b2766",
    specs: [["Precio", "$339"], ["Proteína", "Camarón"], ["Salsa", "Barbecue"]],
  },
  {
    id: "estrella",
    name: "Combo Estrella",
    line: "Un poquito de todo.",
    body: "Tostada de ceviche de pescado, camaroncitos empanizados, camarón envuelto y taco de camarón chipotle.",
    img: "/cut/estrella.webp", w: 702, h: 416,
    color: "#1b2766",
    ink: "#fbfdff",
    specs: [["Precio", "$258"], ["Incluye", "4 piezas"], ["Para", "Uno"]],
  },
];

export const MENU = [
  {
    id: "barra-fria",
    label: "Barra fría",
    img: "/img/aguachile-house.webp",
    items: [
      ["Torre de Mariscos", "Camarón curtido, atún, pulpo y camarón cocido", "$359"],
      ["Aguachile House", "Camarón curtido en salsa verde de la casa", "$299"],
      ["Aguachile Negro", "Camarón en salsa negra", "$299"],
      ["Ceviche de Camarón", "", "$289"],
      ["Camarones para Pelar", "8 piezas", "$259"],
      ["Ostión en su Concha", "6 piezas", "$259"],
      ["Ceviche de Pescado", "", "$209"],
    ],
  },
  {
    id: "cocteles",
    label: "Cócteles",
    img: "/img/coctel.webp",
    items: [
      ["Cóctel de Camarón", "Sencillo $146 · Doble $204", "$289"],
      ["Cóctel de Pulpo", "Sencillo $169 · Doble $229", "$319"],
      ["Cóctel de Ostión", "Sencillo $146 · Doble $204", "$289"],
      ["Campechano", "Elige 2 o 3: camarón, pulpo, ostión", "$289"],
    ],
    note: "Precio de tamaño grande. Con salsa coctelera de la casa, aguacate, cebolla y cilantro.",
  },
  {
    id: "tacos",
    label: "Tacos y tostadas",
    img: "/img/tostada.webp",
    items: [
      ["Taco Gobernador", "Machaca de camarón con queso", "$82"],
      ["Taco Camarón Baja", "Capeado, col morada, aderezo chipotle", "$82"],
      ["Chilaca Gobernador", "Rellena de machaca de camarón y queso", "$105"],
      ["Taco Pulpo al Ajillo", "Con chile cambray y queso", "$105"],
      ["Tostada Ceviche de Camarón", "Aguacate, chipotle, pico con pepino", "$123"],
      ["Tostada de Pulpo", "Aguacate y pico de gallo", "$146"],
      ["Tostada Mixta", "Elige 2 ingredientes", "$146"],
    ],
  },
  {
    id: "caldos",
    label: "Caldos",
    img: "/img/sopa.webp",
    items: [
      ["Sopa de Mariscos", "Filete, camarón, pulpo, ostión, almeja, jaiba", "$269"],
      ["Camarón Macuil", "", "$239"],
      ["Caldo de Camarón", "Mediano $169", "$209"],
      ["Caldo Mixto", "Elige 2 mariscos", "$199"],
      ["Caldo de Filete", "Mediano $120", "$164"],
    ],
    note: "Envenena tu caldo por $59 o agrégale queso fundido por $49.",
  },
  {
    id: "camarones",
    label: "Camarones",
    img: "/img/ajillo.webp",
    items: [
      ["Camarones Envueltos", "", "$335"],
      ["Camarones al Coco", "", "$326"],
      ["En Crema de Champiñones", "", "$309"],
      ["Al Ajillo", "", "$305"],
      ["A la Mantequilla", "", "$305"],
      ["Empanizados", "", "$305"],
      ["A la Diabla", "", "$289"],
      ["Rancheros o Veracruzana", "", "$289"],
    ],
  },
  {
    id: "especialidades",
    label: "Especialidades",
    img: "/img/filete-rey.webp",
    items: [
      ["Pulpo Zarandeado", "Sazón original, a las brasas", "$559"],
      ["Salmón en Salsa Los Cabos", "", "$369"],
      ["Salmón a las Brasas", "Aderezo de la casa", "$359"],
      ["Camarones Envueltos BBQ", "", "$339"],
      ["Brochetas de Camarón", "Champiñón, cebolla, pimiento, tocino", "$335"],
      ["Filete del Rey", "Camarones, champiñones y queso", "$303"],
      ["Filete Philadelphia", "Tocino, queso crema, crema de champiñones", "$303"],
      ["Filete del Primo Cremas", "Crema con ajo y queso gratinado", "$279"],
    ],
  },
  {
    id: "compartir",
    label: "Para compartir",
    img: "/img/del-tio.webp",
    items: [
      ["Preferida del Tío", "Para 2 personas. Individual $338", "$638"],
      ["Tradicional", "Para 2 personas. Individual $294", "$544"],
      ["Molcajete de Chicharrón de Pulpo", "", "$539"],
      ["Molcajete Mixto", "", "$489"],
      ["Huachinango", "En temporada. Frito, ajillo o brasas", "$622"],
      ["Mojarra", "Frita, ajillo o brasas", "$349"],
      ["Rib Eye Asado", "Papa al horno, guacamole y cebolla asada", "$409"],
    ],
  },
  {
    id: "bebidas",
    label: "Bebidas",
    img: "/img/michelada.webp",
    items: [
      ["Alma de Jamaica", "Mezcal 400 Conejos, jamaica, limón", "$179"],
      ["Fuego Dorado", "Mezcal 400 Conejos, mango, limón", "$179"],
      ["Margarita de Mango", "", "$159"],
      ["Piña Colada", "", "$159"],
      ["Tarro Michelado con Clamato", "Grande", "$68"],
      ["Agrégale camarón a tu cerveza", "60 g", "$52"],
      ["Aguas frescas", "Limonada, jamaica, pepino, piña chía, sandía", "$54"],
    ],
  },
];

export const COMBOS = [
  { name: "Estrella", items: "Tostada de ceviche de pescado, camaroncitos empanizados, camarón envuelto y taco de camarón chipotle", img: "/img/estrella.webp" },
  { name: "Clásico", items: "Tostada de ceviche de camarón, posta de mojarra y camarones envueltos", img: "/img/mojarra.webp" },
  { name: "Estelar", items: "Tostada de ceviche de pescado, filete empanizado y taco gobernador", img: "/img/taco-chilaca.webp" },
  { name: "Súper", items: "Tostada de ceviche de pescado, camaroncitos empanizados y filete empanizado", img: "/img/empanizados.webp" },
  { name: "Universitario", items: "Medio filete empanizado y medio caldo de filete", img: "/img/filete-phila.webp" },
];
export const COMBO_PRICE = "$258";

export const SUCURSALES = [
  { name: "Apodaca Centro", addr: "Escobedo 604-D, entre Aldama y Blvd. Carlos Salinas, Apodaca", tel: ["81 8386 2816", "81 8386 9245"], hours: "Lun a Dom, 11:00 a 20:00", map: "https://goo.gl/maps/m3giPono4bdvmjNS6", origin: true },
  { name: "Plaza Andenes", addr: "Av. Universidad 1250, San Nicolás de los Garza", tel: ["81 1415 4702"], hours: "Lun a Dom, 11:00 a 22:00", map: "https://goo.gl/maps/hXFjWuyBmFB4DySDA" },
  { name: "Las Hadas", addr: "Gral. Escobedo 340, Col. Las Hadas, Escobedo", tel: ["81 1405 0729"], hours: "Lun a Dom, 11:00 a 20:00", map: "https://maps.app.goo.gl/d82FmLTzi5V2WrF8A" },
  { name: "Moderna", addr: "Pablo A. de la Garza 3000, Col. Moderna, Monterrey", tel: ["81 8351 0808", "81 8351 9999"], hours: "Lun a Dom, 11:00 a 20:00", map: "https://goo.gl/maps/Frfi5A1iQMyQyFQh9" },
  { name: "Plaza Aviana", addr: "Av. Benito Juárez 1410-L4, Plaza Aviana, Escobedo", tel: ["81 1358 9513"], hours: "Lun a Sáb, 11:00 a 22:00. Dom, 11:00 a 20:00", map: "https://goo.gl/maps/fGw5NaA6EGEsEWe17" },
  { name: "Rinconada Colonial", addr: "Carretera Santa Rosa a Apodaca 888, Apodaca", tel: ["81 2593 0677"], hours: "Lun a Dom, 11:00 a 22:00", map: "https://maps.app.goo.gl/ZyvD9iappUchBfpx8" },
];

export const HISTORIA = [
  { year: "1995", text: "Martha Flores y Juan Elizondo abren Coctelería Los Primos en Monterrey: un comedor sencillo con unos diez platillos. Filete empanizado, mojarritas y caldo de pescado." },
  { year: "2018", text: "Después de años creciendo con sus clientes, el comedor se convierte en Los Primos Restaurante." },
  { year: "Hoy", text: "Seis sucursales en el área metropolitana y la misma sazón regia de la primera cocina." },
];

export const VALORES = ["Amor", "Humildad", "Congruencia", "Pasión", "Lealtad", "Persistencia", "Constancia"];

// Hero flavor switcher (clean local cutouts in /public/cut). CHISPA-style: each one recolors the hero.
export const HERO_PLATOS = [
  { id: "pulpo", name: "Pulpo Zarandeado", price: "$559", line: "El platillo de la casa, a las brasas.", img: "/cut/pulpo-dark.webp", w: 798, h: 498, bg: "#26a0dc", ink: "#1b2766" },
  { id: "estrella", name: "Combo Estrella", price: "$258", line: "Tostada, camaroncitos, envuelto y taco.", img: "/cut/estrella.webp", w: 702, h: 416, bg: "#f6d840", ink: "#1b2766" },
  { id: "bbq", name: "Camarones BBQ", price: "$339", line: "Envueltos en tocino, con salsa barbecue.", img: "/cut/bbq.webp", w: 810, h: 486, bg: "#ed6f5f", ink: "#1b2766" },
];
