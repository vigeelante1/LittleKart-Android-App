// Drawing kit for the home tile illustrations (DECISIONS D-94). Every tile is 480 × 480: a soft tinted
// background with a light spot, and two or three simple items standing on one floor line (y = 404),
// all with the same side shading, highlight strip and floor shadow. No brand names or logos.
export const B = 404;

export const TINTS = {
  orange: ['#fff4e6', '#ffe0bf'],
  sky: ['#eaf6ff', '#cfe8fb'],
  green: ['#eef8ee', '#d6edd7'],
  rose: ['#fff0f3', '#fbd9e1'],
  violet: ['#f4f1ff', '#e1dafb'],
  teal: ['#eafaf7', '#cdeee8'],
  yellow: ['#fffbe8', '#fdecb6'],
};

const defs = (a, b) => `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.42" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="floor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#1f2a1f" stop-opacity="0.22"/><stop offset="1" stop-color="#1f2a1f" stop-opacity="0"/></radialGradient>
  <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.16"/><stop offset="0.35" stop-color="#000" stop-opacity="0"/><stop offset="0.72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.22"/></linearGradient>
  <linearGradient id="vshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.25"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.14"/></linearGradient>
  <radialGradient id="ball" cx="0.35" cy="0.32" r="0.75"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.2"/></radialGradient>
</defs>`;

export const tile = (tint, ...items) => {
  const [a, b] = TINTS[tint];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">${defs(a, b)}
  <rect width="480" height="480" fill="url(#bg)"/><ellipse cx="240" cy="210" rx="230" ry="200" fill="url(#glow)"/>
  <ellipse cx="240" cy="${B + 2}" rx="175" ry="17" fill="url(#floor)"/>${items.join('')}</svg>`;
};

const g = (x, y, s, body, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${body}</g>`;
const hi = (x, y, w, h, o = 0.4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="#fff" fill-opacity="${o}"/>`;
const dark = (c, k = 0.78) => {
  const n = parseInt(c.slice(1), 16);
  const f = (v) => Math.round(v * k).toString(16).padStart(2, '0');
  return `#${f(n >> 16)}${f((n >> 8) & 255)}${f(n & 255)}`;
};

// ---- Packs & containers (drawn at a 100-unit design height, scaled by s; origin = bottom centre) ----

/** Crimped snack packet. */
export const packet = (x, s, c, band, emblem = '#ffffff', rot = 0, y = B) => g(x, y, s, `
  <path d="M-33 -96 q16.5 -6 33 0 q16.5 -6 33 0 V-6 q-16.5 6 -33 0 q-16.5 6 -33 0 Z" fill="${c}"/>
  <path d="M-33 -96 q16.5 -6 33 0 q16.5 -6 33 0 V-6 q-16.5 6 -33 0 q-16.5 6 -33 0 Z" fill="url(#shade)"/>
  <path d="M-33 -97 h66 v7 h-66Z M-33 -12 h66 v7 h-66Z" fill="${dark(c)}"/>
  <circle cx="0" cy="-56" r="15" fill="${band}" stroke="${emblem}" stroke-width="2.5"/>
  <ellipse cx="0" cy="-27" rx="17" ry="8" fill="#f6c453"/><ellipse cx="-4" cy="-29" rx="8" ry="3" fill="#fbe08a"/>
  ${hi(-28, -86, 6, 70)}`, rot);

/** PET bottle with label. */
export const bottle = (x, s, liquid, label, cap = label, y = B) => g(x, y, s, `
  <path d="M-6 -100 h12 v7 h-12Z" fill="${cap}"/>
  <path d="M-6 -93 C-6 -82 -17 -78 -17 -64 V-6 q0 6 5 6 h24 q5 0 5 -6 V-64 C17 -78 6 -82 6 -93Z" fill="${liquid}"/>
  <path d="M-17 -52 h34 v26 h-34Z" fill="${label}"/><path d="M-17 -52 h34 v3 h-34Z" fill="#fff" fill-opacity="0.55"/>
  <circle cx="0" cy="-39" r="6.5" fill="#fff" fill-opacity="0.9"/>
  <path d="M-6 -93 C-6 -82 -17 -78 -17 -64 V-6 q0 6 5 6 h24 q5 0 5 -6 V-64 C17 -78 6 -82 6 -93Z" fill="url(#shade)"/>
  ${hi(-13, -62, 4.5, 52, 0.35)}`);

/** Drink can. */
export const can = (x, s, c, band, y = B) => g(x, y, s, `
  <rect x="-17" y="-60" width="34" height="60" rx="4" fill="${c}"/>
  <ellipse cx="0" cy="-58" rx="15" ry="3.5" fill="#cfd6dc"/><ellipse cx="0" cy="-58" rx="8" ry="1.8" fill="#aab4bd"/>
  <path d="M-17 -36 q17 -7 34 0 v10 q-17 -7 -34 0Z" fill="${band}"/>
  <rect x="-17" y="-60" width="34" height="60" rx="4" fill="url(#shade)"/>${hi(-11, -54, 4, 48, 0.35)}`);

/** Gable-top carton (milk, juice). */
export const carton = (x, s, c, band, y = B) => g(x, y, s, `
  <path d="M-22 -86 L-16 -100 h32 L22 -86Z" fill="${dark(c, 0.9)}"/><rect x="-14" y="-104" width="28" height="5" rx="1.5" fill="${dark(c, 0.85)}"/>
  <rect x="-22" y="-86" width="44" height="86" rx="3" fill="${c}"/>
  <path d="M-22 -58 h44 v30 h-44Z" fill="${band}"/><circle cx="0" cy="-43" r="9" fill="#fff" fill-opacity="0.9"/>
  <rect x="-22" y="-86" width="44" height="86" rx="3" fill="url(#shade)"/>${hi(-17, -80, 5, 72, 0.35)}`);

/** Soft pouch / sack (milk pouch, batter, atta). */
export const pouch = (x, s, c, band, y = B, rot = 0) => g(x, y, s, `
  <path d="M-26 -100 h52 l3 10 v80 q0 10 -10 10 h-38 q-10 0 -10 -10 v-80Z" fill="${c}"/>
  <path d="M-26 -100 h52 l3 10 h-58Z" fill="${dark(c, 0.9)}"/>
  <path d="M-29 -60 h58 v30 h-58Z" fill="${band}"/><path d="M-29 -60 q29 -10 58 0" fill="${band}"/>
  <path d="M-29 -90 h58 v80 q0 10 -10 10 h-38 q-10 0 -10 -10Z" fill="url(#shade)"/>${hi(-22, -84, 5, 70, 0.4)}`, rot);

/** Glass jar with a lid. */
export const jar = (x, s, fill, lid, label = '#ffffff', y = B) => g(x, y, s, `
  <rect x="-22" y="-100" width="44" height="14" rx="3" fill="${lid}"/><rect x="-22" y="-100" width="44" height="4" rx="2" fill="#fff" fill-opacity="0.3"/>
  <path d="M-20 -86 h40 q6 0 6 8 V-8 q0 8 -8 8 h-36 q-8 0 -8 -8 V-78 q0 -8 6 -8Z" fill="${fill}"/>
  <rect x="-26" y="-62" width="52" height="30" fill="${label}"/><circle cx="0" cy="-47" r="8" fill="${lid}" fill-opacity="0.85"/>
  <path d="M-20 -86 h40 q6 0 6 8 V-8 q0 8 -8 8 h-36 q-8 0 -8 -8 V-78 q0 -8 6 -8Z" fill="url(#shade)"/>${hi(-19, -78, 5, 66, 0.4)}`);

/** Upright box seen slightly from the side (cereal, tea, detergent). */
export const box = (x, s, c, band, emblem = '#ffffff', y = B) => g(x, y, s, `
  <path d="M26 -100 l10 -6 v100 l-10 6Z" fill="${dark(c, 0.7)}"/><path d="M-26 -100 l10 -6 h52 l-10 6Z" fill="${dark(c, 0.88)}"/>
  <rect x="-26" y="-100" width="52" height="100" fill="${c}"/>
  <path d="M-26 -50 h52 v28 h-52Z" fill="${band}"/><circle cx="0" cy="-72" r="11" fill="${emblem}"/>
  <rect x="-26" y="-100" width="52" height="100" fill="url(#vshade)"/>${hi(-21, -94, 5, 86, 0.3)}`);

/** Flat wide box (soap pack, biscuits, sweets box). */
export const flatBox = (x, s, c, band, y = B) => g(x, y, s, `
  <path d="M-40 -34 l10 -8 h80 l-10 8Z" fill="${dark(c, 0.88)}"/><path d="M40 -34 l10 -8 v34 l-10 8Z" fill="${dark(c, 0.7)}"/>
  <rect x="-40" y="-34" width="80" height="34" fill="${c}"/><rect x="-40" y="-24" width="80" height="12" fill="${band}"/>
  <rect x="-40" y="-34" width="80" height="34" fill="url(#vshade)"/>`);

/** Squeeze tube standing on its cap (toothpaste, cream). */
export const tube = (x, s, c, band, cap = '#ffffff', y = B, rot = 0) => g(x, y, s, `
  <rect x="-10" y="-14" width="20" height="14" rx="3" fill="${cap}"/>
  <path d="M-16 -14 h32 L22 -96 h-44Z" fill="${c}"/><rect x="-22" y="-100" width="44" height="6" rx="1" fill="${dark(c, 0.85)}"/>
  <path d="M-18 -66 h36 l1 22 h-38Z" fill="${band}"/>
  <path d="M-16 -14 h32 L22 -96 h-44Z" fill="url(#shade)"/>${hi(-14, -90, 4, 66, 0.35)}`, rot);

/** Pump bottle (hand wash, lotion, shampoo). */
export const pump = (x, s, c, band, y = B) => g(x, y, s, `
  <path d="M-4 -100 h22 v6 h-16 v12 h-6Z" fill="#e9eef2"/><rect x="-8" y="-84" width="16" height="10" rx="2" fill="#dfe6ec"/>
  <path d="M-22 -74 h44 q6 0 6 8 V-6 q0 6 -6 6 h-44 q-6 0 -6 -6 V-66 q0 -8 6 -8Z" fill="${c}"/>
  <rect x="-28" y="-52" width="56" height="28" fill="${band}"/><circle cx="0" cy="-38" r="7" fill="#fff" fill-opacity="0.9"/>
  <path d="M-22 -74 h44 q6 0 6 8 V-6 q0 6 -6 6 h-44 q-6 0 -6 -6 V-66 q0 -8 6 -8Z" fill="url(#shade)"/>${hi(-22, -68, 5, 60, 0.35)}`);

/** Spray can (deodorant). */
export const spray = (x, s, c, band, y = B) => g(x, y, s, `
  <path d="M-12 -100 h20 l6 10 h-30Z" fill="#dfe6ec"/><rect x="-16" y="-92" width="32" height="8" rx="2" fill="#c9d2da"/>
  <rect x="-16" y="-84" width="32" height="84" rx="5" fill="${c}"/><path d="M-16 -50 h32 v22 h-32Z" fill="${band}"/>
  <rect x="-16" y="-84" width="32" height="84" rx="5" fill="url(#shade)"/>${hi(-11, -78, 4, 70, 0.35)}`);

/** Small medicine/syrup bottle with a cap. */
export const syrup = (x, s, c, label, cap = '#ffffff', y = B) => g(x, y, s, `
  <rect x="-10" y="-100" width="20" height="14" rx="2" fill="${cap}"/><rect x="-7" y="-86" width="14" height="6" fill="${dark(c, 0.9)}"/>
  <path d="M-7 -80 C-7 -74 -18 -72 -18 -62 V-6 q0 6 6 6 h24 q6 0 6 -6 V-62 C18 -72 7 -74 7 -80Z" fill="${c}"/>
  <rect x="-18" y="-54" width="36" height="34" fill="${label}"/><path d="M-4 -44 h8 v5 h5 v8 h-5 v5 h-8 v-5 h-5 v-8 h5Z" fill="${c}"/>
  <path d="M-7 -80 C-7 -74 -18 -72 -18 -62 V-6 q0 6 6 6 h24 q6 0 6 -6 V-62 C18 -72 7 -74 7 -80Z" fill="url(#shade)"/>${hi(-14, -60, 4, 52, 0.35)}`);

// ---- Food ----

/** Bowl, optionally heaped with food in `fill` and decorated with `dots`. */
export const bowl = (x, s, c, fill, dots = null, y = B) => g(x, y, s, `
  <path d="M-46 -40 q-4 0 0 0 h92 Q44 0 0 0 Q-44 0 -46 -40Z" fill="${c}"/>
  ${fill ? `<path d="M-42 -40 Q-30 -64 0 -66 Q30 -64 42 -40Z" fill="${fill}"/>` : ''}
  ${dots ? [[-20, -48], [8, -56], [22, -46], [-6, -50], [-28, -43]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="3.5" fill="${dots}"/>`).join('') : ''}
  <ellipse cx="0" cy="-40" rx="46" ry="6" fill="${dark(c, 0.85)}" fill-opacity="${fill ? 0 : 1}"/>
  <path d="M-46 -40 h92 Q44 0 0 0 Q-44 0 -46 -40Z" fill="url(#shade)"/><path d="M-36 -32 q6 22 26 26" stroke="#fff" stroke-opacity="0.45" stroke-width="5" fill="none" stroke-linecap="round"/>`);

/** A round ball-like item: laddu, fruit, egg (rx, ry in design units). */
export const blob = (x, s, c, rx = 30, ry = 30, y = B) => g(x, y, s, `<ellipse cx="0" cy="${-ry}" rx="${rx}" ry="${ry}" fill="${c}"/><ellipse cx="0" cy="${-ry}" rx="${rx}" ry="${ry}" fill="url(#ball)"/>`);

export const tomato = (x, s, y = B) => g(x, y, s, `<ellipse cx="0" cy="-30" rx="34" ry="30" fill="#e53935"/><ellipse cx="0" cy="-30" rx="34" ry="30" fill="url(#ball)"/>
  <path d="M0 -60 l-12 -6 l8 8 l-12 2 l14 2 l-6 8 l8 -8 l8 8 l-6 -8 l14 -2 l-12 -2 l8 -8 Z" fill="#2e7d32"/><rect x="-2" y="-70" width="4" height="10" rx="2" fill="#2e7d32"/>`);
export const carrot = (x, s, rot = 0, y = B) => g(x, y, s, `<path d="M-14 -100 Q0 -104 14 -100 L3 -4 Q0 2 -3 -4Z" fill="#f57c00"/><path d="M-14 -100 Q0 -104 14 -100 L3 -4 Q0 2 -3 -4Z" fill="url(#shade)"/>
  <path d="M-8 -80 h8 M-6 -60 h7 M-4 -40 h6" stroke="#e65100" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M0 -100 q-14 -18 -10 -30 q8 10 10 30 q2 -22 10 -32 q4 14 -10 32" fill="#43a047"/>`, rot);
export const banana = (x, s, y = B) => g(x, y, s, `<path d="M-50 -60 Q-40 -8 30 -10 Q48 -12 52 -24 Q20 -24 -4 -40 Q-30 -56 -40 -78Z" fill="#fdd835"/><path d="M-50 -60 Q-40 -8 30 -10 Q48 -12 52 -24 Q36 -16 10 -24 Q-24 -36 -42 -64Z" fill="#f9a825"/><path d="M-44 -78 l-6 -8 l8 -2Z" fill="#6d4c41"/>`);
export const leaf = (x, s, c = '#43a047', rot = 0, y = B) => g(x, y, s, `<path d="M0 0 C-30 -30 -26 -80 0 -100 C26 -80 30 -30 0 0Z" fill="${c}"/><path d="M0 -4 V-92" stroke="${dark(c, 0.7)}" stroke-width="3"/><path d="M0 -30 l-12 -12 M0 -50 l12 -12 M0 -70 l-10 -10" stroke="${dark(c, 0.7)}" stroke-width="2.5"/>`, rot);
export const drumstick = (x, s, rot = 0, y = B) => g(x, y, s, `
  <path d="M-30 -60 Q-34 -96 0 -98 Q34 -96 30 -60 Q24 -34 8 -30 L6 -12 h-12 L-8 -30 Q-24 -34 -30 -60Z" fill="#f2b8a2"/>
  <path d="M-30 -60 Q-34 -96 0 -98 Q34 -96 30 -60 Q24 -34 8 -30 L6 -12 h-12 L-8 -30 Q-24 -34 -30 -60Z" fill="url(#shade)"/>
  <circle cx="-8" cy="-6" r="7" fill="#f5efe6"/><circle cx="8" cy="-6" r="7" fill="#f5efe6"/><rect x="-6" y="-16" width="12" height="12" fill="#f5efe6"/>
  <path d="M-16 -80 q8 -8 22 -6" stroke="#fff" stroke-opacity="0.5" stroke-width="5" fill="none" stroke-linecap="round"/>`, rot);
export const fish = (x, s, c = '#7fa7c9', rot = 0, y = B) => g(x, y, s, `
  <path d="M-56 -30 Q-20 -64 30 -30 Q-20 4 -56 -30Z" fill="${c}"/><path d="M26 -30 L56 -52 L50 -30 L56 -8Z" fill="${dark(c, 0.85)}"/>
  <path d="M-56 -30 Q-20 -64 30 -30 Q-20 4 -56 -30Z" fill="url(#vshade)"/><circle cx="-38" cy="-34" r="4" fill="#1d2b36"/><circle cx="-39" cy="-35" r="1.4" fill="#fff"/>
  <path d="M-20 -44 q6 14 0 28 M-6 -44 q6 14 0 28" stroke="${dark(c, 0.8)}" stroke-width="2" fill="none"/>`, rot);
export const meatCut = (x, s, y = B) => g(x, y, s, `
  <path d="M-48 -24 Q-52 -60 -10 -66 Q40 -70 50 -40 Q56 -8 20 -4 Q-40 4 -48 -24Z" fill="#c94c4c"/>
  <path d="M-38 -26 Q-40 -54 -8 -58 Q32 -60 40 -40 Q44 -16 16 -12 Q-30 -6 -38 -26Z" fill="#e06666"/>
  <path d="M-20 -40 q20 -10 40 0" stroke="#f6d5d5" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="24" cy="-34" r="7" fill="#f8efe4"/>`);

/** Handi pot with biryani. */
export const handi = (x, s, y = B) => g(x, y, s, `
  <path d="M-50 -60 Q-60 -8 -30 0 h60 Q60 -8 50 -60Z" fill="#a1542b"/><path d="M-50 -60 Q-60 -8 -30 0 h60 Q60 -8 50 -60Z" fill="url(#shade)"/>
  <rect x="-54" y="-66" width="108" height="10" rx="5" fill="#8d4524"/>
  <path d="M-46 -66 Q-30 -92 0 -94 Q30 -92 46 -66Z" fill="#f3c969"/>
  ${[[-22, -76], [-4, -84], [14, -78], [28, -72], [-30, -70], [4, -72]].map(([a, b], i) => `<circle cx="${a}" cy="${b}" r="4" fill="${i % 2 ? '#e8a03c' : '#fff3d6'}"/>`).join('')}
  <path d="M-10 -86 q6 -6 12 0" stroke="#4caf50" stroke-width="3" fill="none"/>`);

/** Idli / round white cakes on a plate. */
export const plate = (x, s, c = '#ffffff', y = B) => g(x, y, s, `<ellipse cx="0" cy="-8" rx="58" ry="12" fill="${c}"/><ellipse cx="0" cy="-10" rx="46" ry="8" fill="${dark(c, 0.93)}"/>`);
export const idli = (x, s, y = B) => g(x, y, s, `<path d="M-24 -10 Q-26 -32 0 -32 Q26 -32 24 -10Z" fill="#f7f1e1" stroke="#e2d6b8" stroke-width="1.5"/><path d="M-24 -10 Q-26 -32 0 -32 Q26 -32 24 -10Z" fill="url(#ball)"/>`);
export const murukku = (x, s, y = B) => g(x, y, s, `<g transform="translate(0 -40)"><circle r="38" fill="none" stroke="#d99a3f" stroke-width="9"/><circle r="24" fill="none" stroke="#e8b25a" stroke-width="9"/><circle r="10" fill="#d99a3f"/>
  ${Array.from({ length: 16 }, (_, i) => `<circle cx="${38 * Math.cos(i * Math.PI / 8)}" cy="${38 * Math.sin(i * Math.PI / 8)}" r="2" fill="#b07428"/>`).join('')}</g>`);
export const loaf = (x, s, y = B) => g(x, y, s, `
  <path d="M-46 0 v-48 q-10 -4 -10 -18 q0 -24 56 -24 q56 0 56 24 q0 14 -10 18 v48Z" fill="#d98b3a"/>
  <path d="M-40 -4 v-46 q-9 -3 -9 -15 q0 -19 49 -19 q49 0 49 19 q0 12 -9 15 v46Z" fill="#f6dfb4"/>
  <path d="M-28 -60 q28 -12 56 0 M-24 -40 q24 -8 48 0" stroke="#e8c48b" stroke-width="3.5" fill="none"/>`);
export const cup = (x, s, c = '#ffffff', drink = '#8d5a3b', y = B) => g(x, y, s, `
  <path d="M32 -54 q20 0 20 16 q0 16 -22 16" stroke="${c}" stroke-width="8" fill="none"/>
  <path d="M-36 -64 h72 l-6 54 q-2 10 -12 10 h-36 q-10 0 -12 -10Z" fill="${c}"/><ellipse cx="0" cy="-64" rx="36" ry="7" fill="${drink}"/>
  <path d="M-36 -64 h72 l-6 54 q-2 10 -12 10 h-36 q-10 0 -12 -10Z" fill="url(#shade)"/>
  <path d="M-10 -78 q-8 -12 0 -22 q8 -10 0 -20 M10 -78 q-8 -12 0 -22 q8 -10 0 -20" stroke="#ffffff" stroke-opacity="0.9" stroke-width="5" fill="none" stroke-linecap="round"/>`);
export const glass = (x, s, drink, y = B) => g(x, y, s, `
  <path d="M-26 -90 h52 l-6 86 q0 4 -4 4 h-32 q-4 0 -4 -4Z" fill="#ffffff" fill-opacity="0.65"/>
  <path d="M-23 -70 h46 l-5 64 q0 3 -3 3 h-30 q-3 0 -3 -3Z" fill="${drink}"/><path d="M14 -96 l8 -14" stroke="#f06292" stroke-width="5" stroke-linecap="round"/>
  <path d="M-16 -84 v70" stroke="#fff" stroke-opacity="0.7" stroke-width="4" stroke-linecap="round"/>`);
export const cone = (x, s, scoop = '#f8bbd0', y = B, rot = 0) => g(x, y, s, `
  <path d="M-26 -60 L0 0 L26 -60Z" fill="#e0a05a"/><path d="M-18 -50 l30 30 M-8 -60 l26 26 M18 -54 l-26 30 M8 -60 l-22 24" stroke="#c07a35" stroke-width="2.5"/>
  <circle cx="0" cy="-74" r="28" fill="${scoop}"/><circle cx="0" cy="-74" r="28" fill="url(#ball)"/>
  <path d="M-28 -66 q8 8 14 0 q8 8 14 0 q8 8 14 0 q8 8 14 0" fill="${scoop}"/>`, rot);
export const icecreamTub = (x, s, c, y = B) => g(x, y, s, `
  <path d="M-34 -50 h68 l-6 50 h-56Z" fill="${c}"/><rect x="-37" y="-58" width="74" height="10" rx="3" fill="${dark(c, 0.85)}"/>
  <path d="M-34 -50 h68 l-6 50 h-56Z" fill="url(#shade)"/><circle cx="0" cy="-26" r="9" fill="#fff" fill-opacity="0.9"/>`);
export const choco = (x, s, wrap, rot = 0, y = B) => g(x, y, s, `
  <rect x="-22" y="-100" width="44" height="100" rx="3" fill="${wrap}"/><path d="M-22 -100 h44 v34 h-44Z" fill="#d7dde3"/>
  <path d="M-22 -66 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l6 6" stroke="#b9c2ca" stroke-width="2" fill="none"/>
  <rect x="-16" y="-94" width="13" height="10" rx="1.5" fill="#6d3b1f"/><rect x="2" y="-94" width="13" height="10" rx="1.5" fill="#6d3b1f"/>
  <rect x="-16" y="-80" width="13" height="10" rx="1.5" fill="#6d3b1f"/><rect x="2" y="-80" width="13" height="10" rx="1.5" fill="#6d3b1f"/>
  <circle cx="0" cy="-34" r="9" fill="#fff" fill-opacity="0.85"/><rect x="-22" y="-100" width="44" height="100" rx="3" fill="url(#shade)"/>`, rot);
export const cookie = (x, s, c = '#d9a066', y = B) => g(x, y, s, `<ellipse cx="0" cy="-8" rx="32" ry="10" fill="${dark(c, 0.8)}"/><ellipse cx="0" cy="-12" rx="32" ry="10" fill="${c}"/>
  ${[[-14, -13], [6, -16], [14, -9], [-2, -8]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.6" fill="#7a4a22"/>`).join('')}`);
export const bar = (x, s, c, rot = 0, y = B) => g(x, y, s, `<rect x="-50" y="-22" width="100" height="22" rx="5" fill="${c}"/><rect x="-50" y="-22" width="100" height="22" rx="5" fill="url(#vshade)"/><rect x="-20" y="-20" width="40" height="18" fill="#fff" fill-opacity="0.85"/><path d="M-50 -20 l-4 -2 v20 l4 -2 M50 -20 l4 -2 v20 l-4 -2" fill="${dark(c, 0.85)}"/>`, rot);
export const noodles = (x, s, y = B) => g(x, y, s, `<rect x="-40" y="-36" width="80" height="36" rx="8" fill="#f2c56b"/>
  ${Array.from({ length: 6 }, (_, i) => `<path d="M-34 ${-30 + i * 5} q8 -6 16 0 q8 6 16 0 q8 -6 16 0 q8 6 16 0" stroke="#d99a3f" stroke-width="2.5" fill="none"/>`).join('')}`);
export const sack = (x, s, c, band, y = B) => g(x, y, s, `
  <path d="M-34 -96 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0 q8 -8 18 0 L40 -10 q0 10 -10 10 h-60 q-10 0 -10 -10Z" fill="${c}"/>
  <path d="M-38 -60 h76 v28 h-76Z" fill="${band}"/><circle cx="0" cy="-46" r="8" fill="#fff" fill-opacity="0.9"/>
  <path d="M-34 -96 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0 q8 -8 18 0 L40 -10 q0 10 -10 10 h-60 q-10 0 -10 -10Z" fill="url(#shade)"/>`);

// ---- Flowers & pooja ----
export const marigold = (x, y, r, c = '#ff9800') => `<g transform="translate(${x} ${y})">${Array.from({ length: 12 }, (_, i) => `<ellipse cx="0" cy="${-r * 0.55}" rx="${r * 0.3}" ry="${r * 0.5}" fill="${i % 2 ? c : dark(c, 0.92)}" transform="rotate(${i * 30})"/>`).join('')}<circle r="${r * 0.42}" fill="${dark(c, 0.85)}"/><circle r="${r * 0.42}" fill="url(#ball)"/></g>`;
export const garland = (cx, top, w, h, c) => {
  const pts = Array.from({ length: 11 }, (_, i) => { const t = i / 10; return [cx - w / 2 + w * t, top + h * Math.sin(Math.PI * t)]; });
  return `<path d="M${pts.map((p) => p.join(' ')).join(' L')}" stroke="#2e7d32" stroke-width="3" fill="none"/>` + pts.map(([a, b], i) => marigold(a, b, 20, i % 3 === 1 ? '#fbc02d' : c)).join('');
};
export const diya = (x, s, y = B) => g(x, y, s, `<path d="M-46 -24 Q0 -8 46 -24 Q40 0 0 0 Q-40 0 -46 -24Z" fill="#c8693a"/><path d="M-46 -24 Q0 -36 46 -24 Q0 -8 -46 -24Z" fill="#a4512a"/><path d="M-46 -24 Q40 0 0 0" fill="none"/>
  <path d="M0 -30 Q-12 -50 0 -76 Q12 -50 0 -30Z" fill="#ffb300"/><path d="M0 -34 Q-6 -46 0 -60 Q6 -46 0 -34Z" fill="#fff59d"/>
  <path d="M-46 -24 Q40 0 0 0 Q-40 0 -46 -24Z" fill="url(#shade)"/>`);
export const incense = (x, s, y = B) => g(x, y, s, `<rect x="-24" y="-16" width="48" height="16" rx="4" fill="#8d6e63"/>
  ${[-10, 0, 10].map((a) => `<path d="M${a} -16 L${a + a * 0.3} -110" stroke="#5d4037" stroke-width="3"/><circle cx="${a + a * 0.3}" cy="-110" r="2.5" fill="#ff7043"/><path d="M${a + a * 0.3} -114 q-6 -10 0 -18 q6 -8 0 -16" stroke="#9e9e9e" stroke-opacity="0.6" stroke-width="2" fill="none"/>`).join('')}`);

// ---- Stationery, sports, home ----
export const notebook = (x, s, c, rot = 0, y = B) => g(x, y, s, `<rect x="-36" y="-100" width="72" height="100" rx="4" fill="${c}"/><rect x="-36" y="-100" width="10" height="100" fill="${dark(c, 0.8)}"/>
  <rect x="-16" y="-80" width="42" height="18" rx="3" fill="#fff"/><path d="M-12 -74 h34 M-12 -68 h26" stroke="#b0bec5" stroke-width="2"/>
  ${Array.from({ length: 7 }, (_, i) => `<circle cx="-31" cy="${-90 + i * 13}" r="2.4" fill="#eceff1"/>`).join('')}<rect x="-36" y="-100" width="72" height="100" rx="4" fill="url(#vshade)"/>`, rot);
export const pencil = (x, s, c = '#fbc02d', rot = 0, y = B) => g(x, y, s, `<rect x="-6" y="-100" width="12" height="76" fill="${c}"/><rect x="-6" y="-100" width="4" height="76" fill="#fff" fill-opacity="0.35"/>
  <rect x="-6" y="-108" width="12" height="9" fill="#bdbdbd"/><rect x="-6" y="-116" width="12" height="9" rx="2" fill="#f48fb1"/>
  <path d="M-6 -24 L0 0 L6 -24Z" fill="#f5deb3"/><path d="M-2 -8 L0 0 L2 -8Z" fill="#37474f"/>`, rot);
export const pen = (x, s, c = '#1e88e5', rot = 0, y = B) => g(x, y, s, `<rect x="-6" y="-104" width="12" height="80" rx="5" fill="${c}"/><rect x="5" y="-100" width="4" height="34" rx="2" fill="${dark(c, 0.8)}"/>
  <path d="M-6 -24 h12 L2 -4 h-4Z" fill="#cfd8dc"/><path d="M-1 -4 h2 L0 0Z" fill="#263238"/><rect x="-4" y="-98" width="3" height="60" rx="1.5" fill="#fff" fill-opacity="0.4"/>`, rot);
export const ruler = (x, s, rot = 0, y = B) => g(x, y, s, `<rect x="-60" y="-18" width="120" height="18" rx="2" fill="#ffe082"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${-54 + i * 10} -18 v${i % 2 ? 6 : 10}" stroke="#8d6e63" stroke-width="2"/>`).join('')}`, rot);
export const stapler = (x, s, y = B) => g(x, y, s, `<path d="M-50 0 h100 v-10 h-100Z" fill="#455a64"/><path d="M-50 -10 h92 q10 0 10 -10 v-6 h-102Z" fill="#e53935"/><path d="M-50 -26 h98 q6 0 6 -6 v-4 h-104Z" fill="#c62828"/>`);
export const ball = (x, s, c, seam = '#ffffff', y = B) => g(x, y, s, `<circle cx="0" cy="-30" r="30" fill="${c}"/><path d="M-26 -44 q26 14 52 0 M-26 -16 q26 -14 52 0" stroke="${seam}" stroke-width="2.5" fill="none" stroke-dasharray="4 4"/><circle cx="0" cy="-30" r="30" fill="url(#ball)"/>`);
export const football = (x, s, y = B) => g(x, y, s, `<circle cx="0" cy="-34" r="34" fill="#fafafa"/><path d="M0 -48 l13 9 -5 15 h-16 l-5 -15Z" fill="#263238"/>
  <path d="M-30 -48 l10 4 -2 12 -12 4Z M30 -48 l-10 4 2 12 12 4Z M-14 -6 l6 -12 h16 l6 12 q-14 6 -28 0Z" fill="#263238"/><circle cx="0" cy="-34" r="34" fill="url(#ball)"/>`);
export const bat = (x, s, rot = 0, y = B) => g(x, y, s, `<rect x="-5" y="-150" width="10" height="44" rx="4" fill="#37474f"/><path d="M-14 -108 h28 v100 q0 8 -14 8 q-14 0 -14 -8Z" fill="#e8c38c"/><path d="M-14 -108 h28 v100 q0 8 -14 8 q-14 0 -14 -8Z" fill="url(#shade)"/><path d="M-8 -100 v86" stroke="#fff" stroke-opacity="0.45" stroke-width="4"/>`, rot);
export const shuttle = (x, s, rot = 0, y = B) => g(x, y, s, `<path d="M-22 -60 L-10 -12 h20 L22 -60Z" fill="#fafafa"/><path d="M-16 -56 L-6 -14 M0 -60 v46 M16 -56 L6 -14" stroke="#cfd8dc" stroke-width="2"/><ellipse cx="0" cy="-8" rx="11" ry="9" fill="#f5f5f5"/><path d="M-11 -10 h22" stroke="#e53935" stroke-width="3"/>`, rot);
export const umbrella = (x, s, c, y = B) => g(x, y, s, `<path d="M-64 -70 Q0 -150 64 -70 q-10 -8 -21 0 q-11 -8 -22 0 q-10 -8 -21 0 q-11 -8 -21 0 q-11 -8 -22 0 q-10 -8 -21 0Z" fill="${c}"/>
  <path d="M-22 -70 Q-10 -130 0 -112 Q10 -130 22 -70" fill="${dark(c, 0.85)}"/><path d="M0 -112 V-14 q0 14 -12 14 q-10 0 -10 -10" stroke="#37474f" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M0 -112 v-12" stroke="#37474f" stroke-width="4"/>`);
export const gift = (x, s, c, ribbon, y = B) => g(x, y, s, `<rect x="-38" y="-62" width="76" height="62" rx="3" fill="${c}"/><rect x="-42" y="-74" width="84" height="16" rx="3" fill="${dark(c, 0.9)}"/>
  <rect x="-6" y="-74" width="12" height="74" fill="${ribbon}"/><path d="M0 -74 q-28 -24 -30 -6 q2 10 30 6 q28 4 30 -6 q-2 -18 -30 6Z" fill="${ribbon}"/><rect x="-38" y="-62" width="76" height="62" rx="3" fill="url(#shade)"/>`);
export const flask = (x, s, c, y = B) => g(x, y, s, `<rect x="-14" y="-104" width="28" height="14" rx="4" fill="#90a4ae"/><rect x="-20" y="-92" width="40" height="92" rx="10" fill="${c}"/><rect x="-20" y="-60" width="40" height="18" fill="#eceff1" fill-opacity="0.7"/><rect x="-20" y="-92" width="40" height="92" rx="10" fill="url(#shade)"/>${hi(-14, -84, 5, 76, 0.45)}`);
export const lunchbox = (x, s, c, y = B) => g(x, y, s, `<rect x="-50" y="-46" width="100" height="46" rx="10" fill="${c}"/><rect x="-54" y="-58" width="108" height="16" rx="8" fill="${dark(c, 0.85)}"/><path d="M-20 -58 q20 -22 40 0" stroke="${dark(c, 0.7)}" stroke-width="6" fill="none"/><rect x="-50" y="-46" width="100" height="46" rx="10" fill="url(#vshade)"/>`);
export const blocks = (x, s, y = B) => g(x, y, s, `<rect x="-46" y="-40" width="40" height="40" rx="5" fill="#ef5350"/><rect x="2" y="-40" width="40" height="40" rx="5" fill="#42a5f5"/><rect x="-22" y="-82" width="40" height="40" rx="5" fill="#ffca28"/>
  <path d="M-34 -24 l8 -10 l8 10Z" fill="#fff" fill-opacity="0.85"/><circle cx="22" cy="-20" r="9" fill="#fff" fill-opacity="0.85"/><rect x="-10" y="-70" width="16" height="16" fill="#fff" fill-opacity="0.85"/>`);
export const paper = (x, s, rot = 0, y = B) => g(x, y, s, `<rect x="-36" y="-100" width="72" height="100" rx="3" fill="#ffffff"/><rect x="-28" y="-90" width="56" height="40" rx="3" fill="#90caf9"/><path d="M-28 -54 l16 -18 l12 12 l10 -8 l18 14Z" fill="#43a047"/><circle cx="12" cy="-78" r="6" fill="#ffeb3b"/>
  <path d="M-28 -38 h56 M-28 -28 h44 M-28 -18 h50" stroke="#cfd8dc" stroke-width="3"/><rect x="-36" y="-100" width="72" height="100" rx="3" fill="url(#vshade)"/>`, rot);
export const printer = (x, s, y = B) => g(x, y, s, `<rect x="-26" y="-92" width="52" height="30" fill="#ffffff"/><rect x="-54" y="-66" width="108" height="50" rx="10" fill="#546e7a"/><rect x="-54" y="-66" width="108" height="14" rx="7" fill="#78909c"/>
  <rect x="-38" y="-24" width="76" height="24" fill="#ffffff"/><circle cx="38" cy="-40" r="4" fill="#66bb6a"/><rect x="-54" y="-66" width="108" height="50" rx="10" fill="url(#shade)"/>`);
export const tissueBox = (x, s, c, y = B) => g(x, y, s, `<path d="M44 -64 l10 -6 v64 l-10 6Z" fill="${dark(c, 0.75)}"/><rect x="-44" y="-64" width="88" height="64" rx="3" fill="${c}"/>
  <path d="M-44 -30 q22 -14 44 0 q22 14 44 0" stroke="#fff" stroke-opacity="0.7" stroke-width="5" fill="none"/><rect x="-44" y="-64" width="88" height="64" rx="3" fill="url(#vshade)"/>
  <ellipse cx="0" cy="-64" rx="22" ry="4" fill="${dark(c, 0.8)}"/><path d="M-18 -64 q-6 -22 6 -34 q6 8 12 0 q8 10 0 18 q14 2 18 16Z" fill="#ffffff"/><path d="M-18 -64 q-6 -22 6 -34 q6 8 12 0 q8 10 0 18 q14 2 18 16Z" fill="url(#shade)"/>`);
export const paperCup = (x, s, c, y = B) => g(x, y, s, `<path d="M-30 -70 h60 l-8 70 h-44Z" fill="#ffffff"/><path d="M-27 -46 h54 l-3 22 h-48Z" fill="${c}"/><rect x="-32" y="-74" width="64" height="7" rx="3" fill="#eceff1"/><path d="M-30 -70 h60 l-8 70 h-44Z" fill="url(#shade)"/>`);
export const bulb = (x, s, y = B) => g(x, y, s, `<circle cx="0" cy="-70" r="36" fill="#fff59d"/><circle cx="0" cy="-70" r="36" fill="url(#ball)"/><path d="M-10 -66 q10 -14 20 0" stroke="#f9a825" stroke-width="3" fill="none"/><path d="M-16 -40 h32 v24 h-32Z" fill="#b0bec5"/>
  <path d="M-16 -34 h32 M-16 -26 h32" stroke="#78909c" stroke-width="3"/><path d="M-10 -16 h20 l-4 12 h-12Z" fill="#546e7a"/>`);
export const battery = (x, s, c, rot = 0, y = B) => g(x, y, s, `<rect x="-14" y="-90" width="28" height="90" rx="5" fill="#263238"/><rect x="-14" y="-90" width="28" height="44" rx="5" fill="${c}"/><rect x="-6" y="-98" width="12" height="9" rx="2" fill="#b0bec5"/><rect x="-14" y="-90" width="28" height="90" rx="5" fill="url(#shade)"/><path d="M-4 -70 h8 M0 -74 v8" stroke="#fff" stroke-width="3"/>`, rot);
export const balloon = (x, top, r, c) => `<path d="M${x} ${top + r * 2.3} q-12 30 6 60 q14 26 -4 50" stroke="#90a4ae" stroke-width="2.5" fill="none"/><ellipse cx="${x}" cy="${top + r}" rx="${r * 0.86}" ry="${r}" fill="${c}"/><ellipse cx="${x}" cy="${top + r}" rx="${r * 0.86}" ry="${r}" fill="url(#ball)"/><path d="M${x - 6} ${top + r * 2} h12 l-6 8Z" fill="${dark(c, 0.8)}"/>`;
export const rocket = (x, s, c, rot = 0, y = B) => g(x, y, s, `<path d="M0 -10 V40" stroke="#8d6e63" stroke-width="3"/><path d="M-12 -86 L0 -110 L12 -86Z" fill="#ffca28"/><rect x="-12" y="-86" width="24" height="76" fill="${c}"/><path d="M-12 -66 h24 M-12 -44 h24" stroke="#fff" stroke-width="4"/><rect x="-12" y="-86" width="24" height="76" fill="url(#shade)"/>`, rot);
export const sparkle = (x, y, r, c = '#ffca28') => `<path d="M${x} ${y - r} L${x + r * 0.22} ${y - r * 0.22} L${x + r} ${y} L${x + r * 0.22} ${y + r * 0.22} L${x} ${y + r} L${x - r * 0.22} ${y + r * 0.22} L${x - r} ${y} L${x - r * 0.22} ${y - r * 0.22}Z" fill="${c}"/>`;

// ---- Health & care ----
export const blister = (x, s, rot = 0, y = B) => g(x, y, s, `<rect x="-34" y="-100" width="68" height="100" rx="8" fill="#e3e9ee"/><rect x="-34" y="-100" width="68" height="100" rx="8" fill="url(#vshade)"/>
  ${[0, 1, 2, 3].flatMap((r) => [0, 1].map((c2) => `<ellipse cx="${-14 + c2 * 28}" cy="${-82 + r * 22}" rx="10" ry="7" fill="#ffffff"/><ellipse cx="${-14 + c2 * 28}" cy="${-82 + r * 22}" rx="7" ry="4.5" fill="#ef9a9a"/>`)).join('')}`, rot);
export const firstAid = (x, s, y = B) => g(x, y, s, `<rect x="-16" y="-84" width="32" height="14" rx="5" fill="none" stroke="#b71c1c" stroke-width="6"/><rect x="-50" y="-74" width="100" height="74" rx="10" fill="#e53935"/><path d="M-10 -56 h20 v12 h12 v20 h-12 v12 h-20 v-12 h-12 v-20 h12Z" fill="#fff"/><rect x="-50" y="-74" width="100" height="74" rx="10" fill="url(#shade)"/>`);
export const bandage = (x, s, rot = 0, y = B) => g(x, y, s, `<rect x="-58" y="-20" width="116" height="20" rx="10" fill="#e8b48a"/><rect x="-18" y="-20" width="36" height="20" fill="#f5d2b5"/>${[-46, -36, 30, 40].map((a) => `<circle cx="${a}" cy="-10" r="1.8" fill="#c58a5d"/>`).join('')}`, rot);
export const thermometer = (x, s, rot = 0, y = B) => g(x, y, s, `<rect x="-12" y="-110" width="24" height="96" rx="12" fill="#eceff1"/><rect x="-12" y="-110" width="24" height="60" rx="12" fill="#42a5f5"/><rect x="-8" y="-60" width="16" height="12" rx="2" fill="#263238"/><path d="M-4 -54 h8" stroke="#69f0ae" stroke-width="3"/><path d="M-4 -14 h8 l-4 14Z" fill="#90a4ae"/><rect x="-12" y="-110" width="24" height="96" rx="12" fill="url(#shade)"/>`, rot);
export const oximeter = (x, s, y = B) => g(x, y, s, `<rect x="-40" y="-56" width="80" height="56" rx="20" fill="#eceff1"/><rect x="-40" y="-56" width="80" height="22" rx="11" fill="#90a4ae"/><rect x="-24" y="-30" width="48" height="22" rx="4" fill="#263238"/><path d="M-20 -19 h8 l4 -8 l5 14 l4 -6 h15" stroke="#69f0ae" stroke-width="2.5" fill="none"/><rect x="-40" y="-56" width="80" height="56" rx="20" fill="url(#shade)"/>`);
export const fizzGlass = (x, s, y = B) => g(x, y, s, `<path d="M-28 -96 h56 l-6 92 q0 4 -4 4 h-36 q-4 0 -4 -4Z" fill="#ffffff" fill-opacity="0.6"/><path d="M-25 -72 h50 l-5 66 q0 3 -3 3 h-34 q-3 0 -3 -3Z" fill="#fff59d"/>
  ${[[-10, -40], [6, -56], [12, -24], [-4, -62], [-14, -18]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="3.2" fill="#ffffff"/>`).join('')}<path d="M-18 -88 v76" stroke="#fff" stroke-opacity="0.7" stroke-width="4" stroke-linecap="round"/>`);
export const sachet = (x, s, c, rot = 0, y = B) => g(x, y, s, `<path d="M-26 -84 h52 v84 h-52Z" fill="${c}"/><path d="M-26 -84 h52 v8 h-52Z M-26 -8 h52 v8 h-52Z" fill="${dark(c, 0.85)}"/><circle cx="0" cy="-44" r="12" fill="#fff" fill-opacity="0.9"/><rect x="-26" y="-84" width="52" height="84" fill="url(#shade)"/>`, rot);
export const toothbrush = (x, s, c, rot = 0, y = B) => g(x, y, s, `<rect x="-6" y="-120" width="12" height="120" rx="6" fill="${c}"/><rect x="-9" y="-150" width="18" height="34" rx="5" fill="#ffffff"/><path d="M-9 -146 h18 M-9 -138 h18 M-9 -130 h18 M-9 -122 h18" stroke="#80deea" stroke-width="3"/><rect x="-6" y="-120" width="12" height="120" rx="6" fill="url(#shade)"/>`, rot);
export const soap = (x, s, c, y = B) => g(x, y, s, `<rect x="-42" y="-30" width="84" height="30" rx="14" fill="${c}"/><rect x="-36" y="-30" width="72" height="12" rx="6" fill="#fff" fill-opacity="0.35"/><rect x="-42" y="-30" width="84" height="30" rx="14" fill="url(#vshade)"/>`);
export const bubbles = (pts) => pts.map(([a, b, r]) => `<circle cx="${a}" cy="${b}" r="${r}" fill="#ffffff" fill-opacity="0.65" stroke="#ffffff" stroke-width="2"/><circle cx="${a - r * 0.35}" cy="${b - r * 0.35}" r="${r * 0.22}" fill="#fff"/>`).join('');
export const babyBottle = (x, s, y = B) => g(x, y, s, `<path d="M-8 -110 q8 -14 16 0 v10 h-16Z" fill="#ffcc80"/><rect x="-20" y="-100" width="40" height="12" rx="3" fill="#81d4fa"/><rect x="-18" y="-88" width="36" height="88" rx="9" fill="#ffffff" fill-opacity="0.85"/><rect x="-18" y="-50" width="36" height="50" rx="9" fill="#fff8e1"/>
  <path d="M10 -78 h8 M10 -64 h8 M10 -50 h8 M10 -36 h8" stroke="#81d4fa" stroke-width="2.5"/><rect x="-18" y="-88" width="36" height="88" rx="9" fill="url(#shade)"/>`);
export const diaper = (x, s, c, y = B) => g(x, y, s, `<path d="M-50 -84 h100 v44 q-8 22 -20 40 q-10 -16 -30 -16 q-20 0 -30 16 q-12 -18 -20 -40Z" fill="#ffffff"/>
  <path d="M-50 -84 h100 v12 h-100Z" fill="${c}"/><path d="M-50 -84 h100 v3 h-100Z" fill="#fff" fill-opacity="0.5"/>
  <circle cx="0" cy="-50" r="9" fill="${c}" fill-opacity="0.55"/><path d="M-36 -64 v24 M36 -64 v24" stroke="${c}" stroke-opacity="0.35" stroke-width="3" stroke-dasharray="4 4"/>
  <path d="M-50 -84 h100 v44 q-8 22 -20 40 q-10 -16 -30 -16 q-20 0 -30 16 q-12 -18 -20 -40Z" fill="url(#shade)"/>`);
export const perfume = (x, s, c, y = B) => g(x, y, s, `<rect x="-10" y="-100" width="20" height="18" rx="3" fill="#ffd54f"/><rect x="-6" y="-84" width="12" height="8" fill="#e0e0e0"/><path d="M-30 -76 h60 q6 0 6 6 v62 q0 8 -8 8 h-56 q-8 0 -8 -8 v-62 q0 -6 6 -6Z" fill="${c}" fill-opacity="0.9"/>
  <rect x="-18" y="-50" width="36" height="20" rx="3" fill="#fff" fill-opacity="0.85"/><path d="M-30 -76 h60 q6 0 6 6 v62 q0 8 -8 8 h-56 q-8 0 -8 -8 v-62 q0 -6 6 -6Z" fill="url(#shade)"/>${hi(-26, -70, 5, 60, 0.45)}`);
export const razor = (x, s, c, rot = 0, y = B) => g(x, y, s, `<rect x="-6" y="-100" width="12" height="100" rx="6" fill="${c}"/><rect x="-26" y="-118" width="52" height="20" rx="5" fill="#eceff1"/><rect x="-24" y="-112" width="48" height="5" fill="#90a4ae"/><rect x="-6" y="-100" width="12" height="100" rx="6" fill="url(#shade)"/>`, rot);
export const comb = (x, s, c, rot = 0, y = B) => g(x, y, s, `<rect x="-60" y="-30" width="120" height="12" rx="4" fill="${c}"/>${Array.from({ length: 19 }, (_, i) => `<rect x="${-56 + i * 6}" y="-18" width="3" height="18" rx="1" fill="${c}"/>`).join('')}`, rot);
export const creamJar = (x, s, c, lid, y = B) => g(x, y, s, `<rect x="-40" y="-56" width="80" height="18" rx="6" fill="${lid}"/><path d="M-38 -40 h76 v32 q0 8 -8 8 h-60 q-8 0 -8 -8Z" fill="${c}"/><rect x="-38" y="-32" width="76" height="12" fill="#fff" fill-opacity="0.5"/><path d="M-38 -40 h76 v32 q0 8 -8 8 h-60 q-8 0 -8 -8Z" fill="url(#shade)"/>`);
export const heart = (x, y, r, c) => `<path d="M${x} ${y + r * 0.9} C${x - r * 1.6} ${y - r * 0.2} ${x - r * 0.8} ${y - r * 1.4} ${x} ${y - r * 0.5} C${x + r * 0.8} ${y - r * 1.4} ${x + r * 1.6} ${y - r * 0.2} ${x} ${y + r * 0.9}Z" fill="${c}"/>`;
export const petBowl = (x, s, c, y = B) => g(x, y, s, `<path d="M-56 -36 h112 l-10 36 h-92Z" fill="${c}"/><path d="M-48 -36 Q0 -60 48 -36Z" fill="#a0673a"/>${[[-30, -42], [-12, -48], [6, -50], [24, -44], [-20, -38], [14, -40]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="6" fill="#c58b52"/>`).join('')}
  <path d="M-56 -36 h112 l-10 36 h-92Z" fill="url(#shade)"/><path d="M-16 -18 q-6 -6 0 -10 q6 4 10 0 q6 -6 12 0 q-4 6 2 10 q-6 6 -12 0 q-6 4 -12 0Z" fill="#fff" fill-opacity="0.85"/>`);
export const bone = (x, s, rot = 0, y = B) => g(x, y, s, `<path d="M-40 -14 h80" stroke="#f5efe6" stroke-width="14" stroke-linecap="round"/>${[[-44, -20], [-44, -8], [44, -20], [44, -8]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="9" fill="#f5efe6"/>`).join('')}`, rot);
export const betel = (x, s, rot = 0, y = B) => g(x, y, s, `<path d="M0 0 C-50 -20 -56 -86 0 -100 C56 -86 50 -20 0 0Z" fill="#558b2f"/><path d="M0 -4 V-94 M0 -30 q-20 -14 -30 -30 M0 -30 q20 -14 30 -30 M0 -60 q-14 -10 -20 -24 M0 -60 q14 -10 20 -24" stroke="#33691e" stroke-width="3" fill="none"/>`, rot);
export const seeds = (x, s, c, y = B) => g(x, y, s, Array.from({ length: 14 }, (_, i) => `<ellipse cx="${-36 + (i % 7) * 12}" cy="${-6 - Math.floor(i / 7) * 9}" rx="6" ry="3" fill="${i % 3 ? c : dark(c, 0.8)}" transform="rotate(${(i * 37) % 60 - 30} ${-36 + (i % 7) * 12} ${-6 - Math.floor(i / 7) * 9})"/>`).join(''));
export const cashew = (x, y, r, rot = 0) => `<path d="M${x - r} ${y} q0 ${-r * 1.2} ${r} ${-r * 1.2} q${r * 0.8} 0 ${r * 0.6} ${r * 0.6} q-${r * 0.6} 0 -${r * 0.6} ${r * 0.6} Z" fill="#f3d9a6" transform="rotate(${rot} ${x} ${y})"/>`;
export const snowflake = (x, y, r, c = '#ffffff') => `<g transform="translate(${x} ${y})" stroke="${c}" stroke-width="${r * 0.14}" stroke-linecap="round">${[0, 60, 120].map((a) => `<path d="M0 ${-r} V${r}" transform="rotate(${a})"/>`).join('')}</g>`;
export const fries = (x, s, y = B) => g(x, y, s, `${[-20, -10, 0, 10, 20, -15, 15, 5, -5].map((a, i) => `<rect x="${a - 4}" y="${-104 + (i % 3) * 8}" width="9" height="60" rx="2" fill="${i % 2 ? '#ffd54f' : '#ffca28'}" transform="rotate(${a * 0.5} ${a} -50)"/>`).join('')}
  <path d="M-34 -64 h68 l-8 64 h-52Z" fill="#e53935"/><path d="M-34 -64 q34 16 68 0" fill="#c62828"/><path d="M-34 -64 h68 l-8 64 h-52Z" fill="url(#shade)"/><circle cx="0" cy="-30" r="10" fill="#fff" fill-opacity="0.9"/>`);
export const spray2 = (x, s, c, y = B) => g(x, y, s, `<path d="M-6 -104 h24 l6 10 h-30Z M-12 -96 h20 v16 h-20Z" fill="#eceff1"/><path d="M18 -100 l14 4" stroke="#b0bec5" stroke-width="3"/><path d="M-22 -80 h40 l4 10 v62 q0 8 -8 8 h-32 q-8 0 -8 -8 v-62Z" fill="${c}"/><rect x="-26" y="-56" width="48" height="24" fill="#fff" fill-opacity="0.85"/><path d="M-22 -80 h40 l4 10 v62 q0 8 -8 8 h-32 q-8 0 -8 -8 v-62Z" fill="url(#shade)"/>`);
export const bottleOil = (x, s, c, label, y = B) => g(x, y, s, `<rect x="-8" y="-104" width="16" height="10" rx="2" fill="${label}"/><path d="M-6 -94 h12 v8 q20 10 20 30 V-6 q0 6 -6 6 h-40 q-6 0 -6 -6 V-56 q0 -20 20 -30Z" fill="${c}"/>
  <path d="M28 -66 q14 6 10 26 q-4 12 -10 10" stroke="${dark(c, 0.85)}" stroke-width="5" fill="none"/><rect x="-26" y="-56" width="52" height="30" fill="${label}"/><circle cx="0" cy="-41" r="8" fill="#fff" fill-opacity="0.9"/>
  <path d="M-6 -94 h12 v8 q20 10 20 30 V-6 q0 6 -6 6 h-40 q-6 0 -6 -6 V-56 q0 -20 20 -30Z" fill="url(#shade)"/>${hi(-20, -50, 5, 42, 0.4)}`);

// ---- Extra items for product pictures (drawn cards, D-94) ----

/** Items only, transparent background: product pictures are framed later like the photos. */
export const art = (...items) => `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">${defs('#fff', '#fff')}${items.join('')}</svg>`;

export const gourd = (x, s, c = '#7cb342', rot = 0, y = B) => g(x, y, s, `<path d="M-14 -100 q14 -8 28 0 q6 50 -2 92 q-12 14 -24 0 q-8 -42 -2 -92Z" fill="${c}"/>
  ${[-8, 0, 8].map((a) => `<path d="M${a} -98 q${a * 0.3} 46 ${a * 0.5} 90" stroke="${dark(c, 0.7)}" stroke-width="2.5" fill="none"/>`).join('')}<path d="M-4 -100 q4 -12 10 -16" stroke="#558b2f" stroke-width="5" fill="none" stroke-linecap="round"/>`, rot);
export const brinjal = (x, s, rot = 0, y = B) => g(x, y, s, `<path d="M0 -70 q34 4 34 40 q0 30 -34 30 q-34 0 -34 -30 q0 -36 34 -40Z" fill="#6a1b9a"/><ellipse cx="0" cy="-34" rx="34" ry="34" fill="url(#ball)"/>
  <path d="M-18 -66 q18 -14 36 0 q-8 8 -18 4 q-10 4 -18 -4Z" fill="#558b2f"/><path d="M0 -76 v-20" stroke="#558b2f" stroke-width="7" stroke-linecap="round"/>`, rot);
export const spinach = (x, s, y = B) => g(x, y, s, `${[-30, -12, 8, 26].map((a, i) => `<g transform="rotate(${a * 0.6} 0 0)"><path d="M0 0 C-26 -30 -24 -78 0 -100 C24 -78 26 -30 0 0Z" fill="${i % 2 ? '#2e7d32' : '#43a047'}"/><path d="M0 -4 V-90" stroke="#1b5e20" stroke-width="2.5"/></g>`).join('')}<rect x="-10" y="-14" width="20" height="10" rx="3" fill="#e57373"/>`);
export const jasmine = (x, s, y = B) => g(x, y, s, `<path d="M-60 -20 Q0 -110 60 -20" stroke="#2e7d32" stroke-width="3" fill="none"/>${Array.from({ length: 13 }, (_, i) => { const t = i / 12; const px = -60 + 120 * t; const py = -20 - 90 * Math.sin(Math.PI * t) * 0.95; return `<g transform="translate(${px} ${py})">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-6" rx="3.5" ry="6" fill="#ffffff" stroke="#e0e0e0" stroke-width="0.8" transform="rotate(${r})"/>`).join('')}<circle r="2.5" fill="#fff59d"/></g>`; }).join('')}`);
export const mangoLeaves = (x, s, y = B) => g(x, y, s, `<path d="M-60 -100 H60" stroke="#8d6e63" stroke-width="4"/>${[-50, -25, 0, 25, 50].map((a, i) => `<g transform="translate(${a} -100) rotate(${(i - 2) * 6})"><path d="M0 0 C-12 20 -12 60 0 92 C12 60 12 20 0 0Z" fill="${i % 2 ? '#2e7d32' : '#43a047'}"/><path d="M0 4 V86" stroke="#1b5e20" stroke-width="2"/></g>`).join('')}`);
export const coconut = (x, s, y = B) => g(x, y, s, `<ellipse cx="0" cy="-40" rx="38" ry="40" fill="#8d5524"/><ellipse cx="0" cy="-40" rx="38" ry="40" fill="url(#ball)"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${-30 + i * 6} -70 q4 30 0 56" stroke="#6d3f17" stroke-width="2" fill="none" opacity="0.6"/>`).join('')}<path d="M0 -80 q-6 -16 -18 -22 M0 -80 q6 -16 18 -22" stroke="#6d3f17" stroke-width="4" stroke-linecap="round" fill="none"/>`);
export const wicks = (x, s, y = B) => g(x, y, s, `<path d="M-40 -4 h80" stroke="#e0e0e0" stroke-width="6" stroke-linecap="round"/>${[-30, -15, 0, 15, 30].map((a) => `<path d="M${a} -6 q-6 -30 0 -60 q6 -10 0 -24" stroke="#bdbdbd" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M${a} -6 q-6 -30 0 -60 q6 -10 0 -24" stroke="#fafafa" stroke-width="8" stroke-linecap="round" fill="none"/>`).join('')}`);
export const flatStack = (x, s, c, y = B) => g(x, y, s, `${[0, 1, 2, 3].map((i) => `<ellipse cx="0" cy="${-10 - i * 12}" rx="56" ry="14" fill="${dark(c, 0.86)}"/><ellipse cx="0" cy="${-14 - i * 12}" rx="56" ry="14" fill="${c}"/>`).join('')}${[[-20, -50], [10, -54], [26, -46], [-6, -44]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="4" fill="${dark(c, 0.8)}"/>`).join('')}`);
export const paneer = (x, s, y = B) => g(x, y, s, `<path d="M-50 -46 l16 -14 h70 l-16 14Z" fill="#fffde7"/><path d="M36 -46 l16 -14 v46 l-16 14Z" fill="#efe9c8"/><rect x="-50" y="-46" width="86" height="46" fill="#fffef5"/>${[[-30, -30], [0, -20], [20, -34], [-14, -12]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2" fill="#e8dfb0"/>`).join('')}`);
export const cheese = (x, s, y = B) => g(x, y, s, `<rect x="-50" y="-30" width="100" height="30" rx="4" fill="#1565c0"/><path d="M-42 -30 l10 -50 h74 l-10 50Z" fill="#ffca28"/><path d="M-36 -30 l10 -44 h64" stroke="#ffb300" stroke-width="2" fill="none"/>${[[-8, -56], [14, -46], [20, -66]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="5" fill="#ffb300"/>`).join('')}<rect x="-30" y="-24" width="60" height="16" rx="3" fill="#fff" fill-opacity="0.9"/>`);
export const kulfi = (x, s, c = '#fff3d6', y = B) => g(x, y, s, `<rect x="-4" y="-30" width="8" height="30" rx="2" fill="#d7a86e"/><path d="M-20 -100 q20 -10 40 0 l-4 70 q-16 6 -32 0Z" fill="${c}"/><path d="M-20 -100 q20 -10 40 0 l-4 70 q-16 6 -32 0Z" fill="url(#shade)"/>${[[-6, -80], [8, -64], [-4, -50]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="3" fill="#8bc34a"/>`).join('')}`);
export const roll = (x, s, c, y = B) => g(x, y, s, `<rect x="-60" y="-50" width="120" height="50" rx="25" fill="${c}"/><ellipse cx="60" cy="-25" rx="12" ry="25" fill="${dark(c, 0.8)}"/><ellipse cx="60" cy="-25" rx="5" ry="10" fill="#9e9e9e"/><rect x="-60" y="-50" width="120" height="50" rx="25" fill="url(#vshade)"/><path d="M-50 -40 h90" stroke="#fff" stroke-opacity="0.45" stroke-width="5" stroke-linecap="round"/>`);
export const earphones = (x, s, y = B) => g(x, y, s, `<path d="M-30 -80 Q-34 -20 0 -10 Q34 -20 30 -80" stroke="#263238" stroke-width="4" fill="none"/><path d="M0 -10 v10" stroke="#263238" stroke-width="5"/><rect x="-4" y="0" width="8" height="10" rx="2" fill="#90a4ae" transform="translate(0 -10)"/>
  <ellipse cx="-30" cy="-90" rx="14" ry="16" fill="#e53935"/><ellipse cx="30" cy="-90" rx="14" ry="16" fill="#e53935"/><ellipse cx="-30" cy="-90" rx="14" ry="16" fill="url(#ball)"/><ellipse cx="30" cy="-90" rx="14" ry="16" fill="url(#ball)"/>`);
export const crayons = (x, s, y = B) => g(x, y, s, `${['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'].map((c, i) => `<path d="M${-38 + i * 14} -66 l6 -16 l6 16Z" fill="${c}"/><rect x="${-38 + i * 14}" y="-66" width="12" height="30" fill="${c}"/>`).join('')}<rect x="-44" y="-50" width="88" height="50" rx="4" fill="#1e88e5"/><rect x="-44" y="-40" width="88" height="16" fill="#ffd54f"/><rect x="-44" y="-50" width="88" height="50" rx="4" fill="url(#vshade)"/>`);
export const cards = (x, s, y = B) => g(x, y, s, `<rect x="-40" y="-96" width="60" height="86" rx="6" fill="#ffffff" stroke="#cfd8dc" stroke-width="2" transform="rotate(-10)"/><rect x="-24" y="-96" width="60" height="86" rx="6" fill="#ffffff" stroke="#cfd8dc" stroke-width="2"/>${heartPath(6, -60, 14, '#e53935')}<text x="-16" y="-76" font-family="Inter, Arial" font-weight="800" font-size="16" fill="#e53935">A</text>`);
const heartPath = (x, y, r, c) => `<path d="M${x} ${y + r * 0.9} C${x - r * 1.6} ${y - r * 0.2} ${x - r * 0.8} ${y - r * 1.4} ${x} ${y - r * 0.5} C${x + r * 0.8} ${y - r * 1.4} ${x + r * 1.6} ${y - r * 0.2} ${x} ${y + r * 0.9}Z" fill="${c}"/>`;
export const wand = (x, s, y = B) => g(x, y, s, `<rect x="-5" y="-70" width="10" height="70" rx="5" fill="#ab47bc"/><circle cx="0" cy="-88" r="20" fill="none" stroke="#ab47bc" stroke-width="7"/>${[[30, -110, 14], [44, -80, 9], [22, -130, 7]].map(([a, b, r]) => `<circle cx="${a}" cy="${b}" r="${r}" fill="#e1f5fe" fill-opacity="0.7" stroke="#81d4fa" stroke-width="2"/>`).join('')}`);
export const raincoat = (x, s, c = '#fbc02d', y = B) => g(x, y, s, `<path d="M-16 -100 q16 -14 32 0 l30 30 l10 66 h-26 l-4 -50 l-2 54 h-60 l-2 -54 l-4 50 h-26 l10 -66Z" fill="${c}"/><path d="M-16 -100 q16 18 32 0" fill="${dark(c, 0.85)}"/><path d="M0 -84 v80" stroke="${dark(c, 0.75)}" stroke-width="3"/>${[-70, -50, -30].map((b) => `<circle cx="6" cy="${b}" r="3" fill="${dark(c, 0.7)}"/>`).join('')}<path d="M-16 -100 q16 -14 32 0 l30 30 l10 66 h-26 l-4 -50 l-2 54 h-60 l-2 -54 l-4 50 h-26 l10 -66Z" fill="url(#shade)"/>`);
export const rope = (x, s, y = B) => g(x, y, s, `<path d="M-40 -80 Q-60 0 0 -10 Q60 0 40 -80" stroke="#1e88e5" stroke-width="5" fill="none"/><rect x="-48" y="-112" width="16" height="40" rx="7" fill="#ef5350"/><rect x="32" y="-112" width="16" height="40" rx="7" fill="#ef5350"/>`);
export const lights = (x, s, y = B) => g(x, y, s, `<path d="M-60 -90 Q-30 -40 0 -80 Q30 -120 60 -60" stroke="#455a64" stroke-width="2.5" fill="none"/>${[[-52, -76], [-36, -60], [-18, -64], [0, -80], [18, -94], [34, -94], [50, -76]].map(([a, b], i) => `<ellipse cx="${a}" cy="${b + 10}" rx="6" ry="9" fill="${['#ffd54f', '#ffe082', '#fff59d'][i % 3]}"/><circle cx="${a}" cy="${b + 10}" r="14" fill="#ffecb3" fill-opacity="0.35"/>`).join('')}<rect x="-30" y="-20" width="60" height="20" rx="5" fill="#455a64"/>`);
export const flags = (x, s, y = B) => g(x, y, s, `<path d="M-64 -100 Q0 -70 64 -100" stroke="#8d6e63" stroke-width="2.5" fill="none"/>${[-52, -26, 0, 26, 52].map((a, i) => `<path d="M${a - 10} ${-96 + Math.abs(a) * -0.25 + 14} h20 v34 l-10 -8 l-10 8Z" fill="${['#ffca28', '#ffb300', '#ffd54f', '#ffb300', '#ffca28'][i]}"/>`).join('')}`);
export const greetingCard = (x, s, y = B) => g(x, y, s, `<path d="M0 -100 l-40 -6 v100 l40 6Z" fill="#f8bbd0"/><rect x="0" y="-100" width="44" height="100" fill="#ec407a"/>${heartPath(22, -56, 12, '#fff')}`);
export const matchbox = (x, s, y = B) => g(x, y, s, `<path d="M-44 -40 l12 -10 h76 l-12 10Z" fill="#ffd54f"/><path d="M32 -40 l12 -10 v40 l-12 10Z" fill="#c62828"/><rect x="-44" y="-40" width="76" height="40" fill="#e53935"/><path d="M-30 -30 q14 -8 22 6 l-4 14 h-20Z" fill="#fff"/><rect x="-44" y="-40" width="76" height="40" fill="url(#vshade)"/>`);
export const candy = (x, s, c = '#8bc34a', y = B) => g(x, y, s, `<ellipse cx="0" cy="-30" rx="30" ry="20" fill="${c}"/><path d="M-30 -30 l-20 -14 v28Z M30 -30 l20 -14 v28Z" fill="${dark(c, 0.85)}"/><ellipse cx="0" cy="-30" rx="30" ry="20" fill="url(#ball)"/>`);
export const chakkar = (x, s, y = B) => g(x, y, s, `<g transform="translate(0 -40)"><circle r="36" fill="none" stroke="#e53935" stroke-width="10"/><circle r="22" fill="none" stroke="#43a047" stroke-width="10"/><circle r="8" fill="#fdd835"/></g><path d="M36 -40 l18 -6" stroke="#8d6e63" stroke-width="3"/>`);
export const flowerPot = (x, s, c = '#fb8c00', y = B) => g(x, y, s, `<path d="M-26 0 L-8 -70 h16 L26 0Z" fill="${c}"/><path d="M-20 -24 h40 M-14 -46 h28" stroke="#fff" stroke-width="4"/><rect x="-3" y="-82" width="6" height="12" fill="#8d6e63"/><path d="M-26 0 L-8 -70 h16 L26 0Z" fill="url(#shade)"/>`);
export const sticks = (x, s, n, c, tip, y = B) => g(x, y, s, Array.from({ length: n }, (_, i) => { const a = (i - (n - 1) / 2) * 9; return `<path d="M${a * 0.3} 0 L${a} -100" stroke="#90a4ae" stroke-width="3"/><path d="M${a * 0.95} -96 L${a} -60" stroke="${c}" stroke-width="7" stroke-linecap="round"/>${tip ? `<circle cx="${a}" cy="-102" r="4" fill="${tip}"/>` : ''}`; }).join(''));
export const pieces = (x, s, c, n = 7, y = B) => g(x, y, s, [[-30, -16], [0, -20], [30, -14], [-16, -42], [16, -44], [0, -66], [-36, -40], [36, -38]].slice(0, n).map(([a, b], i) => `<path d="M${a - 18} ${b} q-2 -18 16 -20 q20 0 20 16 q0 16 -18 18 q-16 0 -18 -14Z" fill="${i % 2 ? c : dark(c, 0.9)}"/><path d="M${a - 6} ${b - 10} q6 -4 12 0" stroke="#fff" stroke-opacity="0.45" stroke-width="3" fill="none"/>`).join(''));
export const steaks = (x, s, y = B) => g(x, y, s, [[-26, -10], [10, -26], [-6, -50]].map(([a, b]) => `<g transform="translate(${a} ${b})"><ellipse rx="34" ry="20" fill="#90a4ae"/><ellipse rx="28" ry="15" fill="#f0c9b0"/><path d="M-20 0 q20 -10 40 0 M-14 8 q14 -6 28 0" stroke="#e8c9b4" stroke-width="2" fill="none"/><circle r="4" fill="#cfd8dc"/></g>`).join(''));
export const kebab = (x, s, y = B) => g(x, y, s, `<path d="M-64 -20 L64 -60" stroke="#9e9e9e" stroke-width="4"/>${[-40, -12, 16, 44].map((a) => `<ellipse cx="${a}" cy="${-27 - (a + 64) * 0.3125 + 12}" rx="16" ry="12" fill="#8d4a2b" transform="rotate(-17 ${a} ${-27 - (a + 64) * 0.3125 + 12})"/>`).join('')}`);
export const nuggets = (x, s, y = B) => g(x, y, s, [[-30, -14], [4, -18], [34, -12], [-12, -40], [20, -42]].map(([a, b]) => `<path d="M${a - 18} ${b} q-4 -16 12 -18 q14 -6 22 6 q8 14 -6 20 q-18 6 -28 -8Z" fill="#e0a050"/><path d="M${a - 10} ${b - 8} q6 -4 12 -2" stroke="#fff" stroke-opacity="0.5" stroke-width="3" fill="none"/>`).join(''));
export const lipTin = (x, s, c, y = B) => g(x, y, s, `<ellipse cx="0" cy="-12" rx="44" ry="12" fill="${dark(c, 0.8)}"/><rect x="-44" y="-36" width="88" height="24" fill="${c}"/><ellipse cx="0" cy="-36" rx="44" ry="12" fill="${dark(c, 1.1 > 1 ? 0.95 : 1)}"/><ellipse cx="0" cy="-36" rx="28" ry="7" fill="#fff" fill-opacity="0.6"/>`);
export const tin = (x, s, c, y = B) => g(x, y, s, `<rect x="-56" y="-36" width="112" height="36" rx="5" fill="${c}"/><rect x="-56" y="-36" width="112" height="10" rx="4" fill="${dark(c, 0.85)}"/><rect x="-30" y="-24" width="60" height="14" rx="3" fill="#fff" fill-opacity="0.85"/><rect x="-56" y="-36" width="112" height="36" rx="5" fill="url(#vshade)"/>`);
export const sharpener = (x, s, c = '#1e88e5', y = B) => g(x, y, s, `<path d="M-30 0 v-50 l10 -10 h40 l10 10 v50Z" fill="${c}"/><circle cx="0" cy="-30" r="12" fill="${dark(c, 0.7)}"/><circle cx="0" cy="-30" r="6" fill="#263238"/><rect x="-18" y="-48" width="36" height="5" fill="#cfd8dc"/><path d="M-30 0 v-50 l10 -10 h40 l10 10 v50Z" fill="url(#shade)"/>`);
export const glueStick = (x, s, y = B) => g(x, y, s, `<rect x="-18" y="-100" width="36" height="26" rx="6" fill="#e53935"/><rect x="-16" y="-76" width="32" height="76" rx="4" fill="#fafafa"/><rect x="-16" y="-56" width="32" height="26" fill="#1e88e5"/><rect x="-16" y="-76" width="32" height="76" rx="4" fill="url(#shade)"/>`);

// ---- More items (all products drawn, D-96) ----
const scatter = (pts, fn) => pts.map(([a, b, r = 0]) => fn(a, b, r)).join('');
export const onion = (x, s, y = B) => g(x, y, s, `<path d="M0 -96 q8 14 4 22 q34 10 34 42 q0 32 -38 32 q-38 0 -38 -32 q0 -32 34 -42 q-4 -8 4 -22Z" fill="#a23b5a"/><path d="M0 -70 q-20 20 -14 66 M0 -70 q20 20 14 66" stroke="#7d2340" stroke-width="2.5" fill="none"/><ellipse cx="0" cy="-32" rx="36" ry="32" fill="url(#ball)"/>`);
export const potato = (x, s, y = B) => g(x, y, s, `<path d="M-44 -30 q-4 -34 40 -38 q50 -2 48 34 q-2 34 -46 34 q-40 0 -42 -30Z" fill="#c9a26a"/><path d="M-44 -30 q-4 -34 40 -38 q50 -2 48 34 q-2 34 -46 34 q-40 0 -42 -30Z" fill="url(#ball)"/>${scatter([[-20, -40], [10, -20], [24, -46], [-8, -14]], (a, b) => `<circle cx="${a}" cy="${b}" r="2.6" fill="#8d6e3f"/>`)}`);
export const ginger = (x, s, y = B) => g(x, y, s, `<path d="M-50 -20 q-6 -24 16 -26 q4 -24 22 -18 q10 -22 26 -8 q22 -6 22 16 q20 8 8 26 q-10 14 -40 10 q-40 8 -54 0Z" fill="#d9b071"/><path d="M-50 -20 q-6 -24 16 -26 q4 -24 22 -18 q10 -22 26 -8 q22 -6 22 16 q20 8 8 26 q-10 14 -40 10 q-40 8 -54 0Z" fill="url(#vshade)"/><path d="M-30 -30 q8 4 14 -2 M8 -38 q6 6 14 0 M22 -16 q8 2 12 -4" stroke="#a9824a" stroke-width="2.5" fill="none"/>`);
export const chilli = (x, s, c = '#2e7d32', rot = 0, y = B) => g(x, y, s, `<path d="M-6 -96 q12 -2 12 12 q4 50 -10 82 q-6 8 -8 -2 q8 -40 -2 -80Z" fill="${c}"/><path d="M-4 -96 q-2 -10 6 -16" stroke="#558b2f" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-2 -84 q4 30 -2 60" stroke="#fff" stroke-opacity="0.4" stroke-width="3" fill="none"/>`, rot);
export const okra = (x, s, rot = 0, y = B) => g(x, y, s, `<path d="M-10 -96 h20 l-4 86 q-6 14 -12 0Z" fill="#7cb342"/>${[-5, 0, 5].map((a) => `<path d="M${a} -94 L${a * 0.3} -12" stroke="#558b2f" stroke-width="2"/>`).join('')}<rect x="-8" y="-106" width="16" height="12" rx="3" fill="#558b2f"/>`, rot);
export const cucumber = (x, s, rot = 0, y = B) => g(x, y, s, `<rect x="-16" y="-100" width="32" height="100" rx="16" fill="#558b2f"/><rect x="-16" y="-100" width="32" height="100" rx="16" fill="url(#shade)"/>${scatter([[-6, -80], [6, -60], [-4, -40], [6, -24]], (a, b) => `<circle cx="${a}" cy="${b}" r="2" fill="#c5e1a5"/>`)}`, rot);
export const pods = (x, s, c = '#689f38', y = B) => g(x, y, s, [-24, 0, 24].map((a, i) => `<g transform="rotate(${(i - 1) * 14} ${a} -10)"><path d="M${a - 9} -100 q9 -6 18 0 q4 50 0 90 q-9 8 -18 0 q-4 -40 0 -90Z" fill="${i % 2 ? c : dark(c, 0.88)}"/>${[-80, -56, -32].map((b) => `<ellipse cx="${a}" cy="${b}" rx="6" ry="8" fill="#fff" fill-opacity="0.18"/>`).join('')}</g>`).join(''));
export const lemon = (x, s, y = B) => g(x, y, s, `<ellipse cx="0" cy="-34" rx="40" ry="32" fill="#fdd835"/><path d="M38 -36 l8 -2 l-6 6Z M-38 -32 l-8 2 l6 -6Z" fill="#f9a825"/><ellipse cx="0" cy="-34" rx="40" ry="32" fill="url(#ball)"/>`);
export const apple = (x, s, c = '#d32f2f', y = B) => g(x, y, s, `<path d="M0 -72 q-44 -18 -44 22 q0 46 30 50 q14 -6 28 0 q30 -4 30 -50 q0 -40 -44 -22Z" fill="${c}"/><path d="M0 -72 q-44 -18 -44 22 q0 46 30 50 q14 -6 28 0 q30 -4 30 -50 q0 -40 -44 -22Z" fill="url(#ball)"/><path d="M0 -72 q2 -16 8 -22" stroke="#6d4c41" stroke-width="4" fill="none"/><path d="M6 -86 q16 -12 26 -2 q-14 10 -26 2Z" fill="#43a047"/>`);
export const pomegranate = (x, s, y = B) => g(x, y, s, `<circle cx="0" cy="-40" r="40" fill="#c2185b"/><circle cx="0" cy="-40" r="40" fill="url(#ball)"/><path d="M-10 -78 l4 -12 l6 8 l6 -8 l4 12Z" fill="#ad1457"/>`);
export const melonSlice = (x, s, y = B) => g(x, y, s, `<path d="M-60 -20 A60 60 0 0 0 60 -20Z" transform="translate(0 0)" fill="#2e7d32"/><path d="M-54 -20 A54 54 0 0 0 54 -20Z" fill="#c5e1a5"/><path d="M-48 -20 A48 48 0 0 0 48 -20Z" fill="#ef5350"/>${scatter([[-24, -8], [0, 4], [24, -8], [-12, 14], [12, 14]], (a, b) => `<ellipse cx="${a}" cy="${b - 14}" rx="2.4" ry="4" fill="#263238"/>`)}`.replace(/translate\(0 0\)/, ''), 0, y - 0);
export const coriander = (x, s, y = B) => g(x, y, s, `${[-16, -6, 4, 14].map((a) => `<path d="M0 -6 Q${a} -50 ${a * 2} -70" stroke="#558b2f" stroke-width="3" fill="none"/>`).join('')}${scatter([[-32, -72], [-12, -86], [10, -84], [30, -72], [-22, -56], [22, -58], [0, -66]], (a, b) => `<path d="M${a} ${b} q-12 -4 -10 -16 q6 6 10 2 q4 -10 10 -6 q2 12 -10 20Z" fill="#43a047"/>`)}<rect x="-8" y="-12" width="16" height="10" rx="3" fill="#e57373"/>`);
export const flowerHead = (x, y, r, c, petals = 14) => `<g transform="translate(${x} ${y})">${Array.from({ length: petals }, (_, i) => `<ellipse cx="0" cy="${-r * 0.55}" rx="${r * 0.22}" ry="${r * 0.5}" fill="${i % 2 ? c : dark(c, 0.9)}" transform="rotate(${(i * 360) / petals})"/>`).join('')}<circle r="${r * 0.3}" fill="${dark(c, 0.8)}"/></g>`;
export const lotus = (x, s, y = B) => g(x, y, s, `${[-60, -30, 0, 30, 60].map((r, i) => `<path d="M0 -10 C-18 -40 -14 -80 0 -100 C14 -80 18 -40 0 -10Z" fill="${i % 2 ? '#f48fb1' : '#f06292'}" transform="rotate(${r} 0 -10)"/>`).join('')}<path d="M-50 -6 q50 14 100 0" stroke="#43a047" stroke-width="8" fill="none" stroke-linecap="round"/>`);
export const rose = (x, s, y = B) => g(x, y, s, `<path d="M0 -40 V0" stroke="#2e7d32" stroke-width="5"/><path d="M0 -20 q-20 -4 -26 -18 q16 0 26 18Z" fill="#43a047"/><circle cx="0" cy="-66" r="30" fill="#c62828"/><path d="M-16 -70 q16 -20 32 0 q-16 14 -32 0Z M-22 -56 q22 18 44 0" stroke="#8e0000" stroke-width="3" fill="none"/><circle cx="0" cy="-66" r="30" fill="url(#ball)"/>`);
export const tulsi = (x, s, y = B) => g(x, y, s, `<path d="M0 0 V-90" stroke="#4e7d32" stroke-width="4"/>${[-80, -60, -40, -20].map((b, i) => `<ellipse cx="${i % 2 ? 16 : -16}" cy="${b}" rx="16" ry="8" fill="#43a047" transform="rotate(${i % 2 ? -24 : 24} ${i % 2 ? 16 : -16} ${b})"/>`).join('')}<path d="M0 -90 q-4 -14 0 -22 q4 8 0 22" fill="#7b1fa2"/>`);
export const nuts = (x, s, kind, y = B) => {
  const pts = [[-30, -12], [-6, -14], [18, -12], [38, -10], [-18, -32], [6, -34], [28, -30], [-4, -52], [16, -50]];
  const one = {
    almond: (a, b) => `<ellipse cx="${a}" cy="${b}" rx="13" ry="8" fill="#b97a45" transform="rotate(-20 ${a} ${b})"/><path d="M${a - 8} ${b} q8 -4 16 0" stroke="#8d5524" stroke-width="1.5" fill="none"/>`,
    cashew: (a, b) => `<path d="M${a - 12} ${b + 4} q-2 -16 12 -16 q12 0 12 8 q-8 -2 -12 4 q-4 6 -12 4Z" fill="#f3d9a6"/>`,
    raisin: (a, b) => `<ellipse cx="${a}" cy="${b}" rx="9" ry="7" fill="#c9862b"/><path d="M${a - 4} ${b - 2} q4 4 8 0" stroke="#9c5f16" stroke-width="1.5" fill="none"/>`,
    pista: (a, b) => `<ellipse cx="${a}" cy="${b}" rx="12" ry="9" fill="#e6d3a3"/><path d="M${a - 6} ${b} q6 -6 12 0" stroke="#7cb342" stroke-width="4" fill="none"/>`,
    walnut: (a, b) => `<circle cx="${a}" cy="${b}" r="11" fill="#a1754b"/><path d="M${a} ${b - 10} v20 M${a - 8} ${b - 4} q8 4 16 0 M${a - 8} ${b + 4} q8 -4 16 0" stroke="#7b5233" stroke-width="1.5" fill="none"/>`,
  }[kind];
  return g(x, y, s, pts.map(([a, b]) => one(a, b)).join(''));
};
export const kajuKatli = (x, s, y = B) => g(x, y, s, [[-30, -10], [10, -10], [-10, -34], [30, -34]].map(([a, b]) => `<path d="M${a} ${b - 14} l22 14 l-22 14 l-22 -14Z" fill="#f5ead2" stroke="#d9c7a0" stroke-width="2"/><path d="M${a - 10} ${b - 6} l10 -6" stroke="#cfd8dc" stroke-width="3"/>`).join(''));
export const prawns = (x, s, y = B) => g(x, y, s, [[-26, -10, -10], [14, -14, 10], [-6, -44, 0]].map(([a, b, r]) => `<g transform="translate(${a} ${b}) rotate(${r})"><path d="M-26 0 q0 -26 26 -26 q26 0 24 22 q-12 -12 -24 -10 q-14 2 -16 14Z" fill="#ff8a65"/>${[-14, -4, 6].map((t) => `<path d="M${t} -24 q4 8 0 16" stroke="#e64a19" stroke-width="2" fill="none"/>`).join('')}</g>`).join(''));
export const thali = (x, s, y = B) => g(x, y, s, `<ellipse cx="0" cy="-16" rx="64" ry="18" fill="#cfd8dc"/><ellipse cx="0" cy="-20" rx="58" ry="14" fill="#eceff1"/><ellipse cx="-6" cy="-24" rx="22" ry="8" fill="#fffde7"/>${[[-38, -24, '#ffb300'], [30, -26, '#8bc34a'], [38, -14, '#e53935'], [-30, -12, '#fb8c00']].map(([a, b, c]) => `<ellipse cx="${a}" cy="${b}" rx="12" ry="6" fill="#b0bec5"/><ellipse cx="${a}" cy="${b - 1}" rx="10" ry="4.5" fill="${c}"/>`).join('')}`);
export const dosa = (x, s, y = B) => g(x, y, s, `<ellipse cx="0" cy="-10" rx="64" ry="12" fill="#eceff1"/><path d="M-56 -14 Q0 -40 56 -14 Q0 -2 -56 -14Z" fill="#e0a050"/><path d="M-40 -18 Q0 -34 40 -18" stroke="#c07a35" stroke-width="2" fill="none"/>`);
export const plateFood = (x, s, c, dots, y = B) => g(x, y, s, `<ellipse cx="0" cy="-12" rx="60" ry="16" fill="#eceff1"/><path d="M-40 -16 Q-20 -44 0 -46 Q20 -44 40 -16Z" fill="${c}"/>${scatter([[-18, -26], [6, -34], [18, -22], [-4, -22]], (a, b) => `<circle cx="${a}" cy="${b}" r="4" fill="${dots}"/>`)}`);
export const tinCan = (x, s, c, band, y = B) => g(x, y, s, `<rect x="-30" y="-70" width="60" height="70" rx="5" fill="#b0bec5"/><rect x="-30" y="-60" width="60" height="50" fill="${c}"/><rect x="-30" y="-44" width="60" height="18" fill="${band}"/><ellipse cx="0" cy="-70" rx="30" ry="5" fill="#cfd8dc"/><rect x="-30" y="-70" width="60" height="70" rx="5" fill="url(#shade)"/>`);
export const water = (x, s, y = B) => bottle(x, s, '#e1f5fe', '#1e88e5', '#1e88e5', y);
export const trimmer = (x, s, c = '#37474f', y = B) => g(x, y, s, `<rect x="-16" y="-100" width="32" height="100" rx="14" fill="${c}"/><rect x="-18" y="-112" width="36" height="16" rx="3" fill="#b0bec5"/>${[-12, -6, 0, 6, 12].map((a) => `<rect x="${a - 1.5}" y="-118" width="3" height="8" fill="#78909c"/>`).join('')}<circle cx="0" cy="-50" r="6" fill="#4caf50"/><rect x="-16" y="-100" width="32" height="100" rx="14" fill="url(#shade)"/>`);
export const cable = (x, s, y = B) => g(x, y, s, `<path d="M-40 -20 q-20 -40 20 -50 q40 -10 30 30 q-10 40 -50 20 q-30 -14 10 -30" stroke="#eceff1" stroke-width="6" fill="none"/><path d="M-40 -20 q-20 -40 20 -50 q40 -10 30 30 q-10 40 -50 20 q-30 -14 10 -30" stroke="#b0bec5" stroke-width="1.5" fill="none"/><rect x="-60" y="-28" width="22" height="12" rx="3" fill="#cfd8dc"/><rect x="12" y="-44" width="14" height="22" rx="3" fill="#cfd8dc"/>`);
export const extBoard = (x, s, y = B) => g(x, y, s, `<rect x="-60" y="-30" width="120" height="30" rx="8" fill="#fafafa" stroke="#cfd8dc" stroke-width="2"/>${[-40, -14, 12].map((a) => `<rect x="${a}" y="-24" width="18" height="18" rx="4" fill="#eceff1"/><circle cx="${a + 6}" cy="-15" r="2" fill="#546e7a"/><circle cx="${a + 12}" cy="-15" r="2" fill="#546e7a"/>`).join('')}<rect x="40" y="-22" width="12" height="14" rx="2" fill="#e53935"/>`);
export const racket = (x, s, rot = 0, y = B) => g(x, y, s, `<ellipse cx="0" cy="-110" rx="30" ry="40" fill="none" stroke="#1e88e5" stroke-width="6"/>${[-20, -10, 0, 10, 20].map((a) => `<path d="M${a} -146 v72" stroke="#cfd8dc" stroke-width="1.2"/>`).join('')}${[-136, -122, -108, -94, -80].map((b) => `<path d="M-28 ${b} h56" stroke="#cfd8dc" stroke-width="1.2"/>`).join('')}<path d="M0 -70 V-24" stroke="#90a4ae" stroke-width="4"/><rect x="-5" y="-26" width="10" height="26" rx="4" fill="#263238"/>`, rot);
export const hotBag = (x, s, y = B) => g(x, y, s, `<rect x="-12" y="-100" width="24" height="16" rx="3" fill="#455a64"/><path d="M-12 -86 h24 l26 14 v60 q0 12 -12 12 h-52 q-12 0 -12 -12 v-60Z" fill="#e53935"/>${[-60, -44, -28].map((b) => `<path d="M-30 ${b} h60" stroke="#c62828" stroke-width="3"/>`).join('')}<path d="M-12 -86 h24 l26 14 v60 q0 12 -12 12 h-52 q-12 0 -12 -12 v-60Z" fill="url(#shade)"/>`);
export const bpMonitor = (x, s, y = B) => g(x, y, s, `<rect x="-50" y="-60" width="100" height="60" rx="12" fill="#fafafa" stroke="#cfd8dc" stroke-width="2"/><rect x="-36" y="-50" width="50" height="34" rx="4" fill="#263238"/><text x="-30" y="-26" font-family="Arial" font-weight="700" font-size="18" fill="#69f0ae">120</text><circle cx="32" cy="-30" r="10" fill="#1e88e5"/>`);
export const eraser = (x, s, y = B) => g(x, y, s, `<rect x="-40" y="-30" width="80" height="30" rx="5" fill="#ffffff" stroke="#cfd8dc" stroke-width="2"/><rect x="-40" y="-30" width="44" height="30" rx="5" fill="#1e88e5"/><rect x="-36" y="-22" width="34" height="12" fill="#fff" fill-opacity="0.85"/>`);
export const clay = (x, s, y = B) => g(x, y, s, ['#e53935', '#fdd835', '#1e88e5', '#43a047'].map((c, i) => `<rect x="${-48 + i * 26}" y="-60" width="22" height="60" rx="4" fill="${c}"/><ellipse cx="${-37 + i * 26}" cy="-60" rx="11" ry="4" fill="${dark(c, 0.85)}"/>`).join(''));
export const ludo = (x, s, y = B) => g(x, y, s, `<rect x="-50" y="-100" width="100" height="100" rx="6" fill="#ffffff" stroke="#cfd8dc" stroke-width="3"/><rect x="-46" y="-96" width="38" height="38" fill="#e53935"/><rect x="8" y="-96" width="38" height="38" fill="#43a047"/><rect x="-46" y="-42" width="38" height="38" fill="#1e88e5"/><rect x="8" y="-42" width="38" height="38" fill="#fdd835"/><path d="M-8 -58 L0 -50 L8 -58 L8 -42 L0 -50 L-8 -42Z" fill="#9e9e9e"/>`);
export const plates = (x, s, y = B) => g(x, y, s, [0, 1, 2, 3].map((i) => `<ellipse cx="0" cy="${-8 - i * 6}" rx="56" ry="12" fill="${i === 3 ? '#ffffff' : '#eceff1'}" stroke="#cfd8dc" stroke-width="1.5"/>`).join('') + `<ellipse cx="0" cy="-26" rx="40" ry="7" fill="none" stroke="#e0e0e0" stroke-width="2"/>`);
export const ribbon = (x, s, y = B) => g(x, y, s, ['#ec407a', '#fdd835', '#42a5f5'].map((c, i) => `<ellipse cx="${-34 + i * 34}" cy="-30" rx="16" ry="30" fill="${c}"/><ellipse cx="${-34 + i * 34}" cy="-30" rx="5" ry="10" fill="#fff" fill-opacity="0.8"/>`).join(''));
export const candles = (x, s, y = B) => g(x, y, s, [['#ec407a', -24], ['#42a5f5', 24]].map(([c, a]) => `<rect x="${a - 16}" y="-70" width="32" height="70" rx="6" fill="${c}"/><text x="${a}" y="-24" text-anchor="middle" font-family="Arial" font-weight="800" font-size="34" fill="#fff">${a < 0 ? 2 : 5}</text><path d="M${a} -70 v-8" stroke="#455a64" stroke-width="2"/><path d="M${a} -78 q-6 -10 0 -20 q6 10 0 20Z" fill="#ffb300"/>`).join(''));
export const camphor = (x, s, y = B) => g(x, y, s, [[-30, -10], [0, -10], [30, -10], [-15, -34], [15, -34]].map(([a, b]) => `<rect x="${a - 12}" y="${b - 12}" width="24" height="24" rx="4" fill="#ffffff" stroke="#cfd8dc" stroke-width="2"/>`).join(''));
export const powderHeap = (x, s, c, y = B) => g(x, y, s, `<ellipse cx="0" cy="-8" rx="60" ry="12" fill="#eceff1"/><path d="M-46 -12 Q-20 -60 0 -62 Q20 -60 46 -12Z" fill="${c}"/><path d="M-46 -12 Q-20 -60 0 -62 Q20 -60 46 -12Z" fill="url(#ball)"/>`);
export const sketchPens = (x, s, y = B) => g(x, y, s, ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'].map((c, i) => `<rect x="${-42 + i * 14}" y="-100" width="12" height="80" rx="5" fill="${c}"/><rect x="${-40 + i * 14}" y="-20" width="8" height="12" rx="2" fill="${dark(c, 0.8)}"/>`).join('') + `<rect x="-46" y="-56" width="88" height="56" rx="4" fill="#ffffff" fill-opacity="0.9"/>`);
export const dosaRoll = (x, s, c = '#e0a050', y = B) => g(x, y, s, `<ellipse cx="0" cy="-10" rx="64" ry="12" fill="#eceff1"/><g transform="rotate(-24 0 -30)"><rect x="-60" y="-46" width="120" height="30" rx="15" fill="${c}"/><rect x="-60" y="-46" width="120" height="30" rx="15" fill="url(#vshade)"/><ellipse cx="60" cy="-31" rx="8" ry="15" fill="${dark(c, 0.8)}"/><path d="M-50 -38 h96" stroke="#fff" stroke-opacity="0.35" stroke-width="4" stroke-linecap="round"/></g>`);

/** A wide scene for the home offer banners (800 × 480), same background, light and floor as the tiles (D-99). */
export const scene = (tint, ...items) => {
  const [a, b] = TINTS[tint];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">${defs(a, b)}
  <rect width="800" height="480" fill="url(#bg)"/><ellipse cx="400" cy="210" rx="380" ry="210" fill="url(#glow)"/>
  <ellipse cx="400" cy="${B + 4}" rx="330" ry="22" fill="url(#floor)"/>${items.join('')}</svg>`;
};
