// Every home tile, category and sub-category picture (DECISIONS D-94). Run: node tools/tiles/build.mjs
import * as k from './lib.mjs';
const { B } = k;

export const TILES = {
  // Pooja & Flowers
  flowers: k.tile('rose', k.garland(240, 150, 300, 120, '#ff9800'), k.marigold(170, 340, 46, '#ffb300'), k.marigold(250, 360, 54, '#ff8f00'), k.marigold(325, 338, 42, '#ffca28')),
  'pooja-store': k.tile('orange', k.incense(140, 2.3), k.bottleOil(335, 2.3, '#ffd54f', '#c62828'), k.diya(232, 2.4, B + 4)),
  // Food & Meat
  'fresh-meat-fish': k.tile('rose', k.drumstick(165, 2.5, -12), k.meatCut(310, 2.2, B - 40), k.fish(250, 2.1, '#8fb3d1', -4, B + 6)),
  restaurants: k.tile('orange', k.cup(345, 1.7, '#ffffff', '#c62828'), k.handi(205, 2.6)),
  sweets: k.tile('yellow', k.flatBox(320, 2.3, '#e53935', '#ffd54f', B - 30), k.plate(215, 3.0), k.blob(178, 2.0, '#ffb74d', 26, 26, B - 18), k.blob(250, 2.0, '#ffa726', 26, 26, B - 18), k.blob(214, 2.0, '#ffcc80', 26, 26, B - 84)),
  'homemade-batters': k.tile('green', k.pouch(160, 2.6, '#ffffff', '#43a047'), k.plate(300, 2.6), k.idli(275, 2.0, B - 14), k.idli(330, 2.0, B - 14), k.idli(302, 2.0, B - 52)),
  'home-made-snacks-pickles': k.tile('orange', k.jar(175, 2.6, '#c62828', '#ffb300', '#fff3e0'), k.murukku(315, 2.0)),
  // Groceries & Kitchen
  'veggies-fruits': k.tile('green', k.leaf(160, 2.6, '#43a047', -18), k.carrot(330, 2.4, 18), k.banana(285, 1.9, B - 2), k.tomato(205, 2.4)),
  'dairy-bread-eggs': k.tile('green', k.pouch(160, 2.7, '#f7fbff', '#2f74c8'), k.loaf(320, 2.6), k.blob(225, 1.6, '#e9a66a', 22, 28), k.blob(262, 1.5, '#f4f1ea', 22, 27)),
  'pet-food': k.tile('yellow', k.sack(165, 2.6, '#7e57c2', '#ffca28'), k.petBowl(318, 2.1, '#ef5350'), k.bone(250, 1.1, -12)),
  'oil-ghee': k.tile('yellow', k.bottleOil(185, 2.7, '#ffe082', '#2e7d32'), k.jar(320, 2.2, '#ffe9a8', '#c62828', '#fffde7')),
  'atta-dal-rice': k.tile('orange', k.sack(175, 2.7, '#fff8e1', '#e65100'), k.bowl(320, 2.1, '#ffffff', '#ffb74d', '#f57c00')),
  'cereals-breakfast': k.tile('yellow', k.box(170, 2.6, '#ef5350', '#ffd54f', '#ffffff'), k.bowl(320, 2.1, '#64b5f6', '#ffcc80', '#e0a050')),
  'noodles-pasta': k.tile('orange', k.packet(165, 2.6, '#ffca28', '#e53935'), k.bowl(320, 2.1, '#ef5350', '#f2c56b', '#d99a3f')),
  'tea-coffee': k.tile('orange', k.box(170, 2.5, '#2e7d32', '#ffd54f', '#c62828'), k.cup(320, 2.0, '#ffffff', '#8d5a3b')),
  'spices-masalas': k.tile('rose', k.bowl(165, 2.0, '#ffffff', '#d32f2f'), k.bowl(315, 2.0, '#ffffff', '#fbc02d'), k.bowl(240, 2.1, '#ffffff', '#8d6e63', null, B + 22)),
  'dry-fruits': k.tile('yellow', k.jar(165, 2.4, '#f3d9a6', '#8d6e63', '#fff3e0'), k.bowl(315, 2.2, '#8d6e63', '#f3d9a6', '#b5793e')),
  'frozen-food': k.tile('sky', k.box(165, 2.6, '#42a5f5', '#e3f2fd', '#ffffff'), k.snowflake(165, 215, 18, '#42a5f5'), k.fries(320, 2.3)),
  'household-essentials': k.tile('sky', k.box(165, 2.6, '#1e88e5', '#ffca28', '#ffffff'), k.spray2(320, 2.4, '#26a69a')),
  // Snacks & Drinks
  'cool-drinks': k.tile('sky', k.bottle(165, 2.8, '#5b2a1a', '#d62c2c'), k.bottle(322, 2.5, '#bfe8a2', '#1d8f3a'), k.can(245, 2.5, '#f2a516', '#c0392b')),
  juices: k.tile('yellow', k.carton(170, 2.6, '#ffffff', '#ff9800'), k.glass(320, 2.2, '#ffb74d'), k.blob(380, 1.2, '#ff9800', 26, 26)),
  'ice-cream-desserts': k.tile('rose', k.cone(180, 2.4, '#f8bbd0', B, -6), k.cone(300, 2.4, '#795548', B, 6), k.icecreamTub(240, 2.0, '#ffffff')),
  chips: k.tile('orange', k.packet(170, 2.4, '#2f6fdb', '#e63b2e', '#ffffff', -8, B - 10), k.packet(312, 2.4, '#f39a1e', '#2e9e48', '#ffffff', 7, B - 8), k.blob(200, 1.0, '#f2b632', 30, 18), k.blob(256, 1.1, '#f8cf5c', 30, 18), k.blob(310, 0.9, '#f2b632', 30, 18)),
  namkeens: k.tile('yellow', k.packet(165, 2.5, '#c62828', '#ffd54f'), k.bowl(315, 2.2, '#ffffff', '#f2a93b', '#c77a1d')),
  chocolates: k.tile('rose', k.choco(185, 2.5, '#6a1b9a', -6), k.choco(295, 2.4, '#c62828', 8)),
  'snack-sweets': k.tile('yellow', k.box(170, 2.4, '#8e24aa', '#ffd54f', '#ffffff'), k.bar(315, 1.5, '#c98b4f', 0, B), k.bar(315, 1.5, '#d9a066', 0, B - 36), k.bar(315, 1.5, '#c98b4f', 0, B - 72)),
  'sauces-spreads': k.tile('rose', k.bottle(175, 2.7, '#d32f2f', '#ffffff', '#2e7d32'), k.jar(310, 2.3, '#6d3b1f', '#ffffff', '#fffde7')),
  'biscuits-cookies': k.tile('yellow', k.box(165, 2.4, '#1565c0', '#ffd54f', '#ffffff'), k.cookie(310, 1.6, '#d9a066', B), k.cookie(310, 1.6, '#c98b4f', B - 22), k.cookie(310, 1.6, '#d9a066', B - 44)),
  'protein-bar': k.tile('violet', k.bar(240, 2.7, '#2e7d32', 0, B), k.bar(240, 2.7, '#ef6c00', 0, B - 60), k.bar(240, 2.7, '#5e35b1', 0, B - 120)),
  'paan-corner': k.tile('green', k.betel(190, 2.5, -10), k.jar(320, 2.0, '#ef9a9a', '#43a047', '#ffffff')),
  // Stationery & Sports
  stationery: k.tile('violet', k.notebook(185, 2.5, '#5c6bc0', -4), k.pencil(300, 2.3, '#fbc02d', -4), k.pen(350, 2.2, '#e53935', 8)),
  'print-zone': k.tile('sky', k.paper(260, 1.9, 8, B - 90), k.printer(230, 2.6)),
  sports: k.tile('green', k.bat(185, 1.9, -14), k.football(310, 2.4), k.ball(380, 1.2, '#c62828')),
  'tissues-disposable': k.tile('sky', k.tissueBox(195, 2.4, '#4fc3f7'), k.paperCup(330, 2.2, '#4fc3f7')),
  electronics: k.tile('yellow', k.bulb(185, 2.6), k.battery(300, 2.2, '#ff9800', 0), k.battery(350, 2.2, '#43a047', 0)),
  'decoration-kits': k.tile('rose', k.balloon(180, 90, 54, '#ec407a'), k.balloon(270, 70, 58, '#ffca28'), k.balloon(330, 130, 48, '#42a5f5'), k.sparkle(120, 330, 16), k.sparkle(380, 320, 12, '#ec407a'), k.sparkle(230, 370, 10, '#42a5f5')),
  crackers: k.tile('violet', k.rocket(190, 2.4, '#e53935', -8, B - 40), k.rocket(290, 2.4, '#43a047', 8, B - 40), k.sparkle(170, 110, 26), k.sparkle(320, 90, 20, '#ff7043'), k.sparkle(245, 150, 14, '#ffee58'), k.sparkle(370, 170, 12)),
  // Health & Wellness
  'sexual-wellness': k.tile('rose', k.box(190, 2.4, '#ad1457', '#f8bbd0', '#ffffff'), k.heart(190, 228, 16, '#ad1457'), k.tube(310, 2.2, '#ffffff', '#ec407a', '#f8bbd0')),
  'adult-diapers': k.tile('sky', k.box(180, 2.6, '#1976d2', '#bbdefb', '#ffffff'), k.diaper(320, 2.0, '#1976d2')),
  'cold-cough-fever': k.tile('teal', k.syrup(175, 2.6, '#c62828', '#ffffff', '#ffffff'), k.blister(310, 2.0, 8), k.thermometer(380, 1.6, 20)),
  'first-aid': k.tile('rose', k.firstAid(205, 2.4), k.bandage(325, 1.4, -18, B - 10)),
  'gut-care': k.tile('teal', k.fizzGlass(185, 2.4), k.sachet(300, 2.1, '#ef6c00', 8)),
  'hand-wash': k.tile('teal', k.pump(190, 2.7, '#26a69a', '#ffffff'), k.bubbles([[300, 300, 24], [340, 250, 16], [320, 350, 30], [370, 320, 12]])),
  'medical-devices': k.tile('teal', k.thermometer(170, 2.3, -10), k.oximeter(300, 2.3)),
  'oral-care': k.tile('sky', k.tube(200, 2.6, '#ffffff', '#e53935', '#e53935', B, 0), k.toothbrush(310, 2.0, '#26c6da', 10)),
  'baby-care': k.tile('sky', k.babyBottle(175, 2.5), k.diaper(310, 2.0, '#4fc3f7')),
  'bath-body': k.tile('teal', k.pump(175, 2.6, '#ab47bc', '#ffffff'), k.soap(310, 2.0, '#f48fb1'), k.bubbles([[300, 300, 18], [340, 270, 13], [270, 280, 10]])),
  'feminine-hygiene': k.tile('rose', k.box(190, 2.6, '#ec407a', '#ffffff', '#ffffff'), k.heart(190, 222, 14, '#ec407a'), k.sachet(310, 2.0, '#f8bbd0', 6)),
  fragrances: k.tile('violet', k.perfume(180, 2.6, '#9575cd'), k.spray(310, 2.6, '#37474f', '#ffca28')),
  grooming: k.tile('sky', k.razor(180, 2.2, '#1e88e5', -8), k.comb(300, 1.4, '#37474f', -10, B - 20), k.spray(330, 2.3, '#ffffff', '#1e88e5')),
  'skin-care': k.tile('rose', k.tube(175, 2.6, '#ffffff', '#ec407a', '#f8bbd0'), k.creamJar(310, 2.2, '#ffffff', '#ec407a')),
  // Sub-categories
  chicken: k.tile('rose', k.drumstick(200, 2.6, -10), k.drumstick(300, 2.4, 14)),
  mutton: k.tile('rose', k.meatCut(285, 2.4, B - 34), k.meatCut(205, 2.6), k.bone(320, 1.1, -10)),
  fish: k.tile('sky', k.fish(240, 3.2, '#8fb3d1', -6, B - 10)),
  'books-charts': k.tile('violet', k.notebook(190, 2.5, '#5c6bc0', -4), k.notebook(290, 2.4, '#ef5350', 6)),
  'pens-pencils': k.tile('violet', k.pencil(180, 2.4, '#fbc02d', -8), k.pen(240, 2.3, '#1e88e5', 4), k.pen(300, 2.3, '#e53935', 10)),
  'stationery-items': k.tile('violet', k.stapler(225, 2.3, B - 22), k.pencil(368, 2.0, '#ef5350', 12), k.ruler(235, 1.9, 0, B + 8)),
  toys: k.tile('yellow', k.blocks(210, 2.3), k.ball(330, 1.9, '#ec407a', '#ffffff')),
  'umbrellas-raincoats': k.tile('sky', k.umbrella(240, 2.4, '#1e88e5'), `<path d="M140 120 l-6 14 M180 100 l-6 14 M320 110 l-6 14 M360 140 l-6 14 M120 200 l-6 14" stroke="#64b5f6" stroke-width="4" stroke-linecap="round"/>`),
  'gift-wrap': k.tile('rose', k.gift(200, 2.4, '#ec407a', '#ffd54f'), k.gift(320, 1.7, '#42a5f5', '#ffffff')),
  'lunch-hydration': k.tile('green', k.flask(175, 2.6, '#26a69a'), k.lunchbox(310, 2.1, '#ef5350')),
};

/** Top-strip categories use the picture of their most typical tile. */
export const CATEGORY_TILE = {
  'pooja-flowers': 'flowers',
  'food-meat': 'fresh-meat-fish',
  'groceries-kitchen': 'veggies-fruits',
  'snacks-drinks': 'chips',
  'stationery-sports': 'stationery',
  'health-wellness': 'cold-cough-fever',
  'beauty-personal-care': 'skin-care',
};
