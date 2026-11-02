// Drawn product pictures (DECISIONS D-94): products with no clean photo, in the home-tile style.
// Each is drawn on a transparent canvas, then framed exactly like the photos (tools/tiles/frame.py).
import * as k from './lib.mjs';
const { B, art } = k;
const X = 240;
const S = 2.6;

export const PRODUCTS = {
  // adult diapers / baby care
  'friends-adult-l': art(k.box(X, S, '#00897b', '#b2dfdb', '#ffffff')),
  'lifree-pants': art(k.box(X, S, '#5e35b1', '#d1c4e9', '#ffffff')),
  underpads: art(k.flatBox(X, S, '#0288d1', '#b3e5fc')),
  'himalaya-baby-wipes': art(k.flatBox(X, S, '#81c784', '#ffffff')),
  'huggies-pants-l': art(k.box(X - 50, S, '#e53935', '#ffcdd2', '#ffffff'), k.diaper(X + 60, 1.6, '#e53935')),
  // atta, dal, rice
  'pillsbury-atta': art(k.sack(X, S, '#1565c0', '#ffffff')),
  'sona-masoori': art(k.sack(X, S, '#fff8e1', '#2e7d32')),
  'tata-moong-dal': art(k.pouch(X - 40, S, '#43a047', '#fff9c4'), k.bowl(X + 60, 1.6, '#ffffff', '#c5e1a5', '#8bc34a')),
  'tata-toor-dal': art(k.pouch(X - 40, S, '#f57c00', '#fff9c4'), k.bowl(X + 60, 1.6, '#ffffff', '#ffd54f', '#f9a825')),
  // bath & body
  'clinic-plus': art(k.pump(X, S, '#ec407a', '#ffffff')),
  'dove-soap': art(k.soap(X, S, '#bbdefb')),
  'head-shoulders': art(k.pump(X, S, '#1e88e5', '#ffffff')),
  'parachute-oil': art(k.bottle(X, S, '#e3f2fd', '#1565c0', '#1565c0')),
  'santoor-soap': art(k.flatBox(X, S, '#f57c00', '#fff3e0')),
  // biscuits
  'parle-g': art(k.flatBox(X - 20, S, '#fdd835', '#e53935'), k.cookie(X + 80, 1.3, '#e8b46a')),
  // books & charts
  'chart-paper': art(k.paper(X, S, 0)),
  'classmate-172': art(k.notebook(X, S, '#1e88e5')),
  'classmate-256': art(k.notebook(X, S, '#43a047')),
  'classmate-notebook': art(k.notebook(X, S, '#ef5350')),
  'classmate-300': art(k.notebook(X, S, '#8e24aa')),
  'mtr-rava-idli': art(k.box(X - 30, S, '#c62828', '#ffd54f', '#ffffff'), k.idli(X + 70, 1.6)),
  // chicken / mutton / fish
  'chicken-biryani-cut': art(k.pieces(X, S, '#f2b8a2', 8)),
  'chicken-drumsticks': art(k.drumstick(X - 40, S, -12), k.drumstick(X + 40, S, 12)),
  'mutton-curry-cut': art(k.pieces(X, S, '#c94c4c', 8)),
  'mutton-liver': art(k.pieces(X, S, '#7b1f1f', 5)),
  'mutton-paya': art(k.pieces(X, S, '#d99a85', 6)),
  'seer-fish': art(k.steaks(X, S)),
  // chips & chocolates
  'lays-classic': art(k.packet(X, S, '#fdd835', '#e53935')),
  'amul-dark': art(k.choco(X, S, '#3e2723')),
  'five-star': art(k.bar(X, 2.2, '#fbc02d', -8)),
  perk: art(k.bar(X, 2.2, '#ffca28', 8)),
  munch: art(k.bar(X, 2.2, '#e53935', -6)),
  // cold, cough, fever
  amrutanjan: art(k.lipTin(X, S, '#fbc02d')),
  'halls-mentho': art(k.bar(X, 2.2, '#2e7d32', 0)),
  'vicks-inhaler': art(k.spray(X, S, '#1565c0', '#ffffff')),
  'zandu-balm': art(k.lipTin(X, S, '#e53935')),
  // cool drinks
  'fanta-orange': art(k.bottle(X, S, '#ff9800', '#1565c0', '#1565c0')),
  'paper-boat-aamras': art(k.pouch(X, S, '#ffb300', '#ffffff')),
  // crackers
  'pencil-crackers': art(k.sticks(X, S, 7, '#e53935', '#ffd54f')),
  'flower-pots': art(k.flowerPot(X - 50, 2.2, '#fb8c00'), k.flowerPot(X + 10, 2.4, '#e53935'), k.flowerPot(X + 70, 2.2, '#43a047')),
  'ground-chakkar': art(k.chakkar(X, S)),
  sparklers: art(k.sticks(X, S, 6, '#78909c', null), k.sparkle(X - 20, 120, 30), k.sparkle(X + 30, 150, 20, '#ff7043')),
  // dairy
  'amul-cheese-slices': art(k.cheese(X, S)),
  'britannia-brown-bread': art(k.loaf(X, S)),
  'heritage-buttermilk': art(k.pouch(X, S, '#f1f8e9', '#2e7d32')),
  'heritage-milk': art(k.pouch(X, S, '#f7fbff', '#1565c0')),
  'heritage-curd': art(k.icecreamTub(X, S, '#e3f2fd')),
  'jersey-paneer': art(k.paneer(X, S)),
  'vijaya-milk': art(k.pouch(X, S, '#f7fbff', '#00897b')),
  // decoration
  'diyas-clay': art(k.diya(X - 50, 1.8), k.diya(X + 50, 1.8), k.diya(X, 2.0, B - 50)),
  'happy-birthday-banner': art(k.flags(X, S)),
  'led-string-lights': art(k.lights(X, S)),
  'rangoli-colours': art(k.bowl(X - 70, 1.3, '#ffffff', '#e53935'), k.bowl(X, 1.3, '#ffffff', '#fdd835'), k.bowl(X + 70, 1.3, '#ffffff', '#43a047'), k.bowl(X - 35, 1.3, '#ffffff', '#ec407a', null, B - 60), k.bowl(X + 35, 1.3, '#ffffff', '#1e88e5', null, B - 60)),
  'dates-lion': art(k.box(X, S, '#6d4c41', '#ffca28', '#ffffff')),
  'boat-earphones': art(k.earphones(X, S)),
  // feminine hygiene
  'sofy-antibacteria': art(k.box(X, S, '#00acc1', '#e0f7fa', '#ffffff')),
  'stayfree-secure': art(k.box(X, S, '#d81b60', '#fce4ec', '#ffffff')),
  'whisper-ultra': art(k.box(X, S, '#283593', '#e8eaf6', '#ffffff')),
  // first aid
  'cotton-roll': art(k.roll(X, S, '#eceff1')),
  'crepe-bandage': art(k.roll(X, 2.0, '#f5d2b5')),
  'dettol-antiseptic': art(k.syrup(X, S, '#f9a825', '#ffffff', '#2e7d32')),
  soframycin: art(k.tube(X, S, '#ffffff', '#c62828', '#c62828')),
  // flowers & pooja
  'jasmine-string': art(k.jasmine(X, S)),
  'mango-leaves': art(k.mangoLeaves(X, S)),
  'coconut-pooja': art(k.coconut(X, S)),
  'cycle-agarbatti': art(k.box(X - 30, S, '#f57c00', '#ffffff', '#ffffff'), k.incense(X + 70, 1.6)),
  'deepam-oil': art(k.bottleOil(X, S, '#ffe082', '#c62828')),
  'cotton-wicks': art(k.wicks(X, S)),
  // fragrances & grooming
  'wild-stone-edge': art(k.spray(X, S, '#263238', '#9e9e9e')),
  'beardo-oil': art(k.syrup(X, S, '#4e342e', '#ffffff', '#212121')),
  'bombay-shaving-blade': art(k.razor(X, S, '#37474f', 0)),
  'gillette-foam': art(k.spray(X, S, '#1565c0', '#ffffff')),
  'set-wet-gel': art(k.tube(X, S, '#1e88e5', '#ffffff', '#1565c0')),
  // frozen
  'godrej-yummiez-kebab': art(k.kebab(X, S)),
  'itc-masterchef-nuggets': art(k.nuggets(X, S)),
  'safal-peas': art(k.pouch(X, S, '#43a047', '#e8f5e9')),
  'sumeru-paratha': art(k.flatStack(X, S, '#f3d39b')),
  // gift wrap
  'greeting-card': art(k.greetingCard(X, S)),
  'gift-wrap-sheets': art(k.gift(X, S, '#8e24aa', '#ffd54f')),
  // gut care
  'pudin-hara': art(k.blister(X, S, 0)),
  digene: art(k.syrup(X, S, '#26a69a', '#ffffff', '#ffffff')),
  // hand wash
  'himalaya-handwash': art(k.pump(X, S, '#43a047', '#ffffff')),
  'lifebuoy-handwash-refill': art(k.pouch(X, S, '#e53935', '#ffffff')),
  'palmolive-handwash': art(k.pump(X, S, '#7b1fa2', '#ffffff')),
  'savlon-sanitizer': art(k.syrup(X, S, '#e1f5fe', '#ef6c00', '#ef6c00')),
  // pickles
  'priya-avakaya': art(k.jar(X, S, '#c62828', '#ffb300', '#fff3e0')),
  'priya-gongura': art(k.jar(X, S, '#4e342e', '#43a047', '#fff3e0')),
  'ruchi-lemon': art(k.jar(X, S, '#fdd835', '#2e7d32', '#ffffff')),
  // batters & breads
  'id-malabar-parota': art(k.flatStack(X, S, '#f0c27b')),
  'id-ragi-batter': art(k.pouch(X, S, '#ffffff', '#6d4c41')),
  'id-chapati': art(k.flatStack(X, S, '#e8c48b')),
  // household
  'ariel-matic': art(k.box(X, S, '#1b5e20', '#ffffff', '#ffffff')),
  'rin-bar': art(k.soap(X, S, '#1e88e5')),
  'vim-bar': art(k.soap(X, S, '#cddc39')),
  'vim-gel': art(k.spray2(X, S, '#9ccc65')),
  // ice cream
  'amul-choco-cone': art(k.cone(X, S, '#6d4c41')),
  'amul-kulfi': art(k.kulfi(X, S)),
  'amul-vanilla-tub': art(k.icecreamTub(X, S, '#fff8e1')),
  'havmor-butterscotch': art(k.icecreamTub(X, S, '#ffb74d')),
  'kwality-cornetto': art(k.cone(X, S, '#5d4037')),
  'vadilal-mango': art(k.icecreamTub(X, S, '#ffca28')),
  // lunch & hydration
  'milton-lunch-box': art(k.lunchbox(X, S, '#90a4ae')),
  'signoraware-tiffin': art(k.lunchbox(X, S, '#42a5f5')),
  // medical devices
  'accu-chek-strips': art(k.box(X, S, '#1565c0', '#ffffff', '#ffffff')),
  'pulse-oximeter': art(k.oximeter(X, S)),
  // oil & ghee
  'fortune-ricebran': art(k.bottleOil(X, S, '#ffe082', '#e53935')),
  'fortune-sunflower': art(k.bottleOil(X, S, '#fff176', '#1e88e5')),
  'heritage-ghee': art(k.jar(X, S, '#ffe9a8', '#1565c0', '#ffffff')),
  'vijaya-groundnut-oil': art(k.bottleOil(X, S, '#ffd54f', '#2e7d32')),
  // oral care
  'colgate-strong': art(k.tube(X, S, '#e53935', '#ffffff', '#ffffff')),
  'oral-b-brush': art(k.toothbrush(X - 25, S, '#1e88e5', -6), k.toothbrush(X + 25, S, '#e53935', 6)),
  // paan corner
  'pulse-candy': art(k.candy(X, S, '#8bc34a')),
  'matches-ship': art(k.matchbox(X, S)),
  // pens
  'cello-gripper': art(...[-30, -10, 10, 30].map((a, i) => k.pen(X + a, S, '#1e88e5', (i - 1.5) * 5))),
  'pilot-v5': art(k.pen(X - 15, S, '#263238', -6), k.pen(X + 15, S, '#263238', 6)),
  'reynolds-045': art(...[-20, 0, 20].map((a, i) => k.pen(X + a, S, '#1565c0', (i - 1) * 6))),
  // pet food
  'drools-adult': art(k.sack(X, S, '#f57c00', '#ffffff')),
  'purepet-biscuits': art(k.jar(X - 30, S, '#c58b52', '#e53935', '#ffffff'), k.bone(X + 70, 1.2, -16)),
  'whiskas-ocean': art(k.sack(X, S, '#7e57c2', '#e1f5fe')),
  // print zone
  'print-bw': art(k.paper(X, S, 0)),
  'print-photo': art(k.paper(X, S, -6)),
  'print-spiral': art(k.notebook(X, S, '#90a4ae')),
  // protein
  'ritebite-choco-almond': art(k.bar(X, 2.2, '#5d4037', -6)),
  'max-protein-pack': art(k.flatBox(X, S, '#4e342e', '#ec407a')),
  'res-idli': art(k.idli(X - 44, 3.0, B), k.idli(X + 44, 3.0, B), k.idli(X, 3.0, B - 60), k.bowl(X + 120, 1.0, '#ffffff', '#f1f8e9', '#81c784')),
  // sauces & spreads
  'dabur-honey': art(k.jar(X, S, '#ffb300', '#e53935', '#fff8e1')),
  'sundrop-peanut-butter': art(k.jar(X, S, '#a1662f', '#1565c0', '#fff8e1')),
  // sexual wellness
  'manforce-pack': art(k.flatBox(X, S, '#212121', '#ec407a')),
  'skore-pack': art(k.flatBox(X, S, '#1565c0', '#ffffff')),
  // skin care
  'nivea-soft': art(k.creamJar(X, S, '#ffffff', '#1e88e5')),
  'vaseline-lip': art(k.lipTin(X, S, '#f48fb1')),
  // snack sweets
  'bikano-soan-cake': art(k.flatBox(X, S, '#f57c00', '#fff3e0')),
  'gits-gulab-jamun-mix': art(k.box(X - 30, S, '#c62828', '#ffd54f', '#ffffff'), k.blob(X + 70, 1.4, '#8d4a2b', 24, 22)),
  'mtr-payasam-mix': art(k.box(X - 30, S, '#6a1b9a', '#ffd54f', '#ffffff'), k.bowl(X + 70, 1.3, '#ffffff', '#fff3d6', '#d7a86e')),
  // spices
  'aachi-chicken-masala': art(k.pouch(X, S, '#c62828', '#fdd835')),
  'everest-turmeric': art(k.box(X - 30, S, '#fbc02d', '#c62828', '#ffffff'), k.bowl(X + 70, 1.3, '#ffffff', '#fbc02d')),
  'aashirvaad-chilli': art(k.pouch(X - 30, S, '#e53935', '#ffffff'), k.bowl(X + 70, 1.3, '#ffffff', '#d32f2f')),
  'mdh-chana': art(k.box(X, S, '#e53935', '#fdd835', '#ffffff')),
  'priya-sambar-powder': art(k.box(X, S, '#ef6c00', '#ffffff', '#ffffff')),
  // sports & stationery
  'skipping-rope': art(k.rope(X, S)),
  'camlin-geometry': art(k.tin(X, S, '#1e88e5')),
  'camlin-crayons': art(k.crayons(X, S)),
  'natraj-sharpener': art(k.sharpener(X - 40, 1.8, '#e53935'), k.sharpener(X + 40, 1.8, '#1e88e5')),
  fevistick: art(k.glueStick(X, S)),
  // sweets & tea
  'kaja-tapeswaram': art(k.pieces(X, S, '#e0a050', 6)),
  'narasus-coffee': art(k.pouch(X - 30, S, '#4e342e', '#ffca28'), k.cup(X + 80, 1.3, '#ffffff', '#6d4c41')),
  // tissues
  'garbage-bags': art(k.roll(X, S, '#263238')),
  'aluminium-foil': art(k.roll(X, S, '#cfd8dc')),
  // toys & rain
  'bubble-gun': art(k.wand(X, S)),
  'playing-cards': art(k.cards(X, S)),
  'raincoat-adult': art(k.raincoat(X, S, '#fbc02d')),
  'kids-umbrella': art(k.umbrella(X, S, '#ec407a')),
  // veggies
  beerakaya: art(k.gourd(X - 30, S, '#7cb342', -10), k.gourd(X + 30, S, '#689f38', 10)),
  brinjal: art(k.brinjal(X - 40, 2.2, -12), k.brinjal(X + 40, 2.2, 12)),
  spinach: art(k.spinach(X, S)),
};
