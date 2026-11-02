// Built-in recipe list (D-102): the assistant's backup when Gemini can't be reached (no key, no network, free-tier
// limit). Quantities are for 4 people; lines marked `scale` grow with the number of people.
import type { Id } from '../types';

export interface Ingredient {
  productId: Id;
  variantId: Id;
  /** Smaller size used when half of `variantId` is enough (2 people instead of 4). */
  half?: Id;
  /** Words the shopper may use for it, English, Telugu and Telugu in English letters (lower case). */
  say: readonly string[];
}

const ing = (productId: Id, variantId: Id, say: string[], half?: Id): Ingredient => ({ productId, variantId, say, ...(half ? { half } : {}) });

export const ING = {
  basmati: ing('india-gate-basmati', 'india-gate-basmati-1', ['rice', 'basmati', 'బియ్యం', 'బాస్మతి', 'biyyam']),
  sonaRice: ing('sona-masoori', 'sona-masoori-1', ['rice', 'sona', 'బియ్యం', 'biyyam']),
  chickenBiryani: ing('chicken-biryani-cut', 'cbc-1kg', ['chicken', 'చికెన్', 'kodi', 'కోడి'], 'cbc-500'),
  chickenCurry: ing('chicken-curry-skinless', 'ccs-1kg', ['chicken', 'చికెన్', 'kodi', 'కోడి'], 'ccs-500'),
  chickenBoneless: ing('chicken-boneless', 'cb-500', ['chicken', 'చికెన్', 'kodi', 'కోడి', 'boneless']),
  mutton: ing('mutton-curry-cut', 'mutton-curry-cut-1', ['mutton', 'మటన్', 'mamsam', 'మాంసం'], 'mutton-curry-cut-2'),
  fish: ing('rohu-fish', 'rohu-fish-1', ['fish', 'చేప', 'chepa', 'chepalu']),
  prawns: ing('prawns-medium', 'prawns-medium-1', ['prawn', 'prawns', 'రొయ్య', 'royyalu'], 'prawns-medium-2'),
  eggs: ing('eggs-white-12', 'eggs-white-12-1', ['egg', 'eggs', 'గుడ్డు', 'గుడ్లు', 'guddu', 'gudlu']),
  paneer: ing('jersey-paneer', 'jersey-paneer-1', ['paneer', 'పనీర్']),
  onion: ing('onion', 'onion-1', ['onion', 'onions', 'ఉల్లి', 'ullipaya', 'ullipayalu', 'ulli']),
  tomato: ing('tomato', 'tomato-1', ['tomato', 'tomatoes', 'టమాటా', 'టమాట', 'tamata']),
  greenChilli: ing('green-chilli', 'green-chilli-1', ['green chilli', 'chilli', 'chillies', 'mirchi', 'పచ్చిమిర్చి', 'మిర్చి', 'mirapakaya']),
  coriander: ing('coriander', 'coriander-1', ['coriander', 'kothimeera', 'కొత్తిమీర', 'cilantro']),
  ginger: ing('allam', 'allam-500', ['ginger', 'allam', 'అల్లం']),
  lemon: ing('lemon', 'lemon-1', ['lemon', 'lemons', 'nimmakaya', 'నిమ్మ']),
  curd: ing('heritage-curd', 'hc-450', ['curd', 'yogurt', 'perugu', 'పెరుగు', 'dahi']),
  milk: ing('heritage-milk', 'heritage-milk-2', ['milk', 'palu', 'పాలు'], 'heritage-milk-1'),
  ghee: ing('heritage-ghee', 'heritage-ghee-1', ['ghee', 'neyyi', 'నెయ్యి']),
  oil: ing('freedom-sunflower', 'freedom-sunflower-1', ['oil', 'nune', 'నూనె']),
  groundnutOil: ing('vijaya-groundnut-oil', 'vgo-1l', ['oil', 'nune', 'నూనె', 'groundnut oil']),
  butter: ing('amul-butter', 'amul-100', ['butter', 'వెన్న', 'venna']),
  garam: ing('everest-garam', 'everest-garam-1', ['garam masala', 'masala', 'మసాలా']),
  chickenMasala: ing('aachi-chicken-masala', 'aachi-chicken-masala-1', ['chicken masala', 'masala', 'మసాలా']),
  chilliPowder: ing('aashirvaad-chilli', 'ac-200', ['chilli powder', 'karam', 'కారం', 'red chilli']),
  turmeric: ing('everest-turmeric', 'everest-turmeric-1', ['turmeric', 'pasupu', 'పసుపు', 'haldi']),
  jeera: ing('jeera', 'jeera-1', ['jeera', 'cumin', 'జీలకర్ర', 'jeelakarra']),
  mustard: ing('mustard-seeds', 'mustard-seeds-1', ['mustard', 'avalu', 'ఆవాలు']),
  sambarPowder: ing('priya-sambar-powder', 'priya-sambar-powder-1', ['sambar powder', 'సాంబార్ పొడి']),
  toorDal: ing('tata-toor-dal', 'tata-toor-dal-1', ['dal', 'toor', 'kandi pappu', 'కంది పప్పు', 'పప్పు']),
  chanaDal: ing('chana-dal', 'chana-dal-1', ['chana dal', 'senaga pappu', 'శనగ పప్పు']),
  rava: ing('bombay-rava', 'bombay-rava-1', ['rava', 'sooji', 'semolina', 'రవ్వ']),
  vermicelli: ing('bambino-vermicelli', 'bambino-vermicelli-1', ['vermicelli', 'semiya', 'సేమియా']),
  cashew: ing('cashew-w320', 'cashew-w320-1', ['cashew', 'kaju', 'జీడిపప్పు', 'jeedipappu']),
  raisins: ing('raisins', 'raisins-1', ['raisins', 'kismis', 'కిస్మిస్', 'draksha']),
  drumstick: ing('munakkaya', 'munakkaya-1kg', ['drumstick', 'munakkaya', 'మునక్కాయ']),
  brinjal: ing('brinjal', 'brinjal-1', ['brinjal', 'vankaya', 'వంకాయ', 'baingan']),
  bhindi: ing('bhindi', 'bhindi-1', ['bhindi', 'okra', 'lady finger', 'bendakaya', 'బెండకాయ']),
  potato: ing('potato', 'potato-1', ['potato', 'potatoes', 'aloo', 'బంగాళదుంప', 'bangaladumpa']),
  carrot: ing('carrot', 'carrot-1', ['carrot', 'carrots', 'క్యారెట్']),
  spinach: ing('spinach', 'spinach-1', ['spinach', 'palak', 'palakura', 'పాలకూర']),
  peas: ing('safal-peas', 'safal-peas-1', ['peas', 'batani', 'బఠాణీ']),
  pomegranate: ing('pomegranate', 'pomegranate-1', ['pomegranate', 'danimma', 'దానిమ్మ']),
  banana: ing('banana', 'banana-6', ['banana', 'bananas', 'arati', 'అరటి']),
  apple: ing('apple-shimla', 'apple-shimla-1', ['apple', 'apples', 'ఆపిల్']),
  idliBatter: ing('id-idli-batter', 'id-idli-batter-1', ['batter', 'pindi', 'పిండి']),
  pesarattuBatter: ing('amma-pesarattu-batter', 'amma-pesarattu-batter-1', ['batter', 'pindi', 'పిండి']),
  karamPodi: ing('amma-karam-podi', 'amma-karam-podi-1', ['podi', 'పొడి', 'karam podi']),
  bread: ing('modern-bread', 'modern-bread-1', ['bread', 'బ్రెడ్']),
  maggi: ing('maggi-masala', 'maggi-masala-2', ['maggi', 'noodles', 'నూడుల్స్']),
  fries: ing('mccain-fries', 'mccain-fries-1', ['fries']),
  ketchup: ing('kissan-ketchup', 'kissan-ketchup-1', ['ketchup', 'sauce']),
  tea: ing('red-label', 'red-label-1', ['tea powder', 'tea leaves', 'tea', 'టీ పొడి']),
  coffee: ing('narasus-coffee', 'narasus-coffee-1', ['coffee powder', 'coffee', 'కాఫీ పొడి']),
  gulabMix: ing('gits-gulab-jamun-mix', 'gits-gulab-jamun-mix-1', ['mix', 'gulab jamun mix']),
  chapati: ing('id-chapati', 'id-chapati-1', ['chapati', 'chapathi', 'roti', 'చపాతీ']),
  parota: ing('id-malabar-parota', 'id-malabar-parota-1', ['parota', 'paratha', 'పరోటా']),
  // Extras and party things
  thumsUp: ing('thums-up', 'thums-up-2', ['thums up', 'cool drink', 'coke', 'soft drink']),
  sprite: ing('sprite', 'sprite-1', ['sprite', 'cool drink', 'soft drink']),
  cucumber: ing('keera-dosakaya', 'keera-500', ['cucumber', 'keera', 'కీర']),
  gulabTin: ing('haldiram-gulab-jamun', 'haldiram-gulab-jamun-1', ['gulab jamun', 'sweet', 'sweets', 'స్వీట్']),
  avakaya: ing('priya-avakaya', 'priya-avakaya-1', ['pickle', 'avakaya', 'ఆవకాయ', 'pachadi', 'పచ్చడి']),
  buttermilk: ing('heritage-buttermilk', 'heritage-buttermilk-1', ['buttermilk', 'majjiga', 'మజ్జిగ']),
  marie: ing('marie-gold', 'marie-gold-1', ['biscuit', 'biscuits', 'బిస్కెట్']),
  goodDay: ing('good-day-cashew', 'good-day-cashew-1', ['biscuit', 'biscuits', 'బిస్కెట్']),
  bhujia: ing('haldiram-aloo-bhujia', 'haldiram-aloo-bhujia-1', ['bhujia', 'mixture', 'మిక్చర్']),
  iceCream: ing('amul-vanilla-tub', 'amul-vanilla-tub-1', ['ice cream', 'ఐస్ క్రీమ్']),
  honey: ing('dabur-honey', 'dabur-honey-1', ['honey', 'తేనె']),
  lays: ing('lays-magic-masala', 'lays-magic-masala-2', ['chips', 'lays']),
  kurkure: ing('kurkure-masala', 'kurkure-masala-2', ['kurkure']),
  plates: ing('paper-plates', 'paper-plates-1', ['plates', 'ప్లేట్లు']),
  cups: ing('paper-cups', 'paper-cups-1', ['cups', 'కప్పులు']),
  celebrations: ing('celebrations', 'celebrations-1', ['chocolates', 'celebrations']),
  laddu: ing('bikano-motichoor', 'bikano-motichoor-1', ['laddu', 'లడ్డు', 'prasadam', 'ప్రసాదం']),
  // Pooja
  marigold: ing('marigold-loose', 'marigold-loose-2', ['flowers', 'marigold', 'banthi', 'పూలు', 'బంతి']),
  garland: ing('marigold-garland', 'marigold-garland-1', ['garland', 'dandalu', 'దండ']),
  agarbatti: ing('cycle-agarbatti', 'cycle-agarbatti-1', ['agarbatti', 'agarbathi', 'incense', 'అగరబత్తి']),
  camphor: ing('camphor-tablets', 'camphor-tablets-1', ['camphor', 'karpuram', 'కర్పూరం']),
  coconut: ing('coconut-pooja', 'coconut-pooja-1', ['coconut', 'kobbari', 'కొబ్బరి']),
  kumkum: ing('kumkum', 'kumkum-1', ['kumkum', 'కుంకుమ']),
  pasupu: ing('pasupu', 'pasupu-1', ['pasupu', 'turmeric', 'పసుపు']),
  deepamOil: ing('deepam-oil', 'deepam-oil-1', ['deepam oil', 'lamp oil', 'దీపం నూనె']),
  wicks: ing('cotton-wicks', 'cotton-wicks-1', ['wicks', 'vattulu', 'వత్తులు']),
  mangoLeaves: ing('mango-leaves', 'mango-leaves-1', ['mango leaves', 'thoranam', 'మామిడి ఆకులు']),
  jasmine: ing('jasmine-string', 'jasmine-string-1', ['jasmine', 'malle', 'మల్లె']),
} as const;

type Key = keyof typeof ING;
/** An ingredient key, or [key, packs for 4 people, grows with people?]. */
type Line = Key | [Key, number, boolean?];

export interface Recipe {
  key: string;
  en: string;
  te: string;
  match: RegExp;
  items: readonly Line[];
  extras: readonly Line[];
  missing: { en: readonly string[]; te: readonly string[] };
  /** Pooja and the like: the number of people doesn't change the list, so it isn't asked. */
  noServings?: boolean;
}

const r = (key: string, en: string, te: string, match: RegExp, items: Line[], extras: Line[], missingEn: string[] = [], missingTe: string[] = [], noServings = false): Recipe => ({
  key, en, te, match, items, extras, missing: { en: missingEn, te: missingTe }, ...(noServings ? { noServings } : {}),
});

const MAIN = (k: Key, n = 1): Line => [k, n, true];
const BIRYANI_SPICES: Line[] = ['onion', 'tomato', 'greenChilli', 'coriander', 'ginger', 'curd', 'ghee', 'oil', 'garam', 'chilliPowder', 'turmeric', 'lemon'];
const CURRY_BASE: Line[] = ['onion', 'tomato', 'greenChilli', 'ginger', 'coriander', 'chilliPowder', 'turmeric', 'oil'];
const GARLIC = ['garlic'];
const GARLIC_TE = ['వెల్లుల్లి'];

/** Checked in order: the first match wins, so "mutton biryani" comes before "biryani" and "mutton". */
export const RECIPES: readonly Recipe[] = [
  r('mutton-biryani', 'mutton biryani', 'మటన్ బిర్యానీ', /(mutton|మటన్)\s*(biry|బిర్యా)/i, [MAIN('mutton'), MAIN('basmati'), ...BIRYANI_SPICES], ['thumsUp', 'cucumber', 'gulabTin'],
    ['garlic', 'mint', 'bay leaves and whole spices'], ['వెల్లుల్లి', 'పుదీనా', 'బిర్యానీ ఆకు, మసాలా దినుసులు']),
  r('veg-biryani', 'veg pulao', 'వెజ్ పులావ్', /veg\w*\s*(biry|pula)|pula[ov]|పులావ్|వెజ్\s*బిర్యా/i,
    [MAIN('basmati'), 'carrot', 'peas', 'onion', 'tomato', 'greenChilli', 'ginger', 'coriander', 'ghee', 'garam', 'cashew'], ['cucumber', 'curd', 'avakaya'],
    ['garlic', 'mint', 'beans'], ['వెల్లుల్లి', 'పుదీనా', 'బీన్స్']),
  r('chicken-biryani', 'chicken biryani', 'చికెన్ బిర్యానీ', /biry|బిర్యా/i, [MAIN('chickenBiryani'), MAIN('basmati'), ...BIRYANI_SPICES], ['thumsUp', 'cucumber', 'gulabTin'],
    ['garlic', 'mint', 'bay leaves and whole spices'], ['వెల్లుల్లి', 'పుదీనా', 'బిర్యానీ ఆకు, మసాలా దినుసులు']),
  r('chicken-fry', 'chicken fry', 'చికెన్ వేపుడు', /(chicken|kodi|చికెన్|కోడి)\s*(fry|65|vepudu|ఫ్రై|వేపుడు)|chicken\s*65/i,
    [MAIN('chickenBoneless', 2), 'curd', 'ginger', 'lemon', 'greenChilli', 'chilliPowder', 'turmeric', 'garam', 'oil'], ['thumsUp', 'ketchup', 'onion'],
    ['garlic', 'cornflour', 'curry leaves'], ['వెల్లుల్లి', 'కార్న్‌ఫ్లోర్', 'కరివేపాకు']),
  r('chicken-curry', 'chicken curry', 'చికెన్ కూర', /chicken|kodi|చికెన్|కోడి/i, [MAIN('chickenCurry'), ...CURRY_BASE, 'chickenMasala'], ['chapati', 'thumsUp'],
    ['garlic', 'curry leaves'], ['వెల్లుల్లి', 'కరివేపాకు']),
  r('mutton-curry', 'mutton curry', 'మటన్ కూర', /mutton|మటన్|mamsam|మాంసం/i, [MAIN('mutton'), ...CURRY_BASE, 'garam', 'curd'], ['parota', 'thumsUp'],
    ['garlic', 'curry leaves'], ['వెల్లుల్లి', 'కరివేపాకు']),
  r('fish-curry', 'fish curry', 'చేపల పులుసు', /fish|చేప|chepa/i, [MAIN('fish'), 'onion', 'tomato', 'greenChilli', 'coriander', 'chilliPowder', 'turmeric', 'mustard', 'groundnutOil'], ['buttermilk'],
    ['tamarind', 'garlic', 'curry leaves'], ['చింతపండు', 'వెల్లుల్లి', 'కరివేపాకు']),
  r('prawns-curry', 'prawns curry', 'రొయ్యల కూర', /prawn|royya|రొయ్య/i, [MAIN('prawns'), ...CURRY_BASE, 'garam'], ['thumsUp'], GARLIC, GARLIC_TE),
  r('egg-curry', 'egg curry', 'గుడ్డు కూర', /egg\s*(curry|masala|pulusu|kura)|guddu|gudla|గుడ్డు|గుడ్ల/i, [MAIN('eggs'), ...CURRY_BASE, 'garam'], ['chapati'], GARLIC, GARLIC_TE),
  r('sambar', 'sambar', 'సాంబార్', /sambar|సాంబార్/i, ['toorDal', 'sambarPowder', 'drumstick', 'brinjal', 'tomato', 'onion', 'greenChilli', 'mustard', 'coriander', 'oil'], ['avakaya', 'idliBatter'],
    ['tamarind', 'curry leaves', 'asafoetida'], ['చింతపండు', 'కరివేపాకు', 'ఇంగువ']),
  r('palakura-pappu', 'palakura pappu', 'పాలకూర పప్పు', /(palak|palakura|పాలకూర)\s*(pappu|dal|పప్పు)/i,
    [MAIN('toorDal'), MAIN('spinach', 2), 'tomato', 'greenChilli', 'onion', 'mustard', 'jeera', 'ghee'], ['avakaya', 'curd'], ['garlic', 'curry leaves'], ['వెల్లుల్లి', 'కరివేపాకు']),
  r('palak-paneer', 'palak paneer', 'పాలక్ పనీర్', /(palak|పాలక్)\s*(paneer|పనీర్)/i, [MAIN('paneer', 2), MAIN('spinach', 3), 'onion', 'tomato', 'greenChilli', 'ginger', 'garam', 'butter'], ['chapati', 'parota'],
    ['garlic', 'fresh cream'], ['వెల్లుల్లి', 'ఫ్రెష్ క్రీమ్']),
  r('paneer-butter-masala', 'paneer butter masala', 'పనీర్ బటర్ మసాలా', /paneer|పనీర్/i,
    [MAIN('paneer', 2), MAIN('tomato', 2), 'onion', 'butter', 'ginger', 'greenChilli', 'garam', 'chilliPowder', 'cashew', 'oil'], ['chapati', 'parota', 'sprite'],
    ['fresh cream', 'kasuri methi', 'garlic'], ['ఫ్రెష్ క్రీమ్', 'కసూరి మేతి', 'వెల్లుల్లి']),
  r('pappu', 'tomato pappu', 'టమాటా పప్పు', /pappu|\bdal\b|\bdhal\b|పప్పు/i, [MAIN('toorDal'), 'tomato', 'greenChilli', 'onion', 'mustard', 'jeera', 'ghee', 'coriander'], ['avakaya', 'curd'],
    ['garlic', 'curry leaves', 'tamarind'], ['వెల్లుల్లి', 'కరివేపాకు', 'చింతపండు']),
  r('pesarattu', 'pesarattu', 'పెసరట్టు', /pesarattu|పెసరట్టు/i, [MAIN('pesarattuBatter', 2), 'onion', 'greenChilli', 'ginger', 'oil'], ['rava', 'karamPodi']),
  r('idli-dosa', 'idli and dosa', 'ఇడ్లీ, దోస', /idl[iy]|dos[ae]|dosha|ఇడ్లీ|దోస/i, [MAIN('idliBatter'), 'karamPodi', 'oil'], ['coffee', 'milk'],
    ['coconut for chutney'], ['చట్నీ కోసం కొబ్బరి']),
  r('upma', 'upma', 'ఉప్మా', /upma|ఉప్మా/i, [MAIN('rava'), 'onion', 'greenChilli', 'ginger', 'carrot', 'mustard', 'ghee', 'cashew'], ['banana'],
    ['curry leaves'], ['కరివేపాకు']),
  r('lemon-rice', 'lemon rice', 'నిమ్మకాయ పులిహోర', /lemon\s*rice|nimmakaya\s*(pulihora|annam)|నిమ్మకాయ\s*(పులిహోర|అన్నం)/i,
    [MAIN('lemon', 2), 'sonaRice', 'chanaDal', 'mustard', 'greenChilli', 'ginger', 'turmeric', 'oil', 'cashew'], ['curd'], ['curry leaves', 'peanuts'], ['కరివేపాకు', 'పల్లీలు']),
  r('curd-rice', 'curd rice', 'పెరుగు అన్నం', /curd\s*rice|perugu\s*annam|daddojanam|పెరుగు\s*అన్నం|దద్దోజనం/i,
    [MAIN('curd', 2), 'sonaRice', 'mustard', 'greenChilli', 'ginger', 'coriander', 'pomegranate'], ['avakaya'], ['curry leaves'], ['కరివేపాకు']),
  r('aloo-fry', 'aloo fry', 'బంగాళదుంప వేపుడు', /aloo|alu\b|potato|బంగాళ/i, [MAIN('potato'), 'onion', 'chilliPowder', 'turmeric', 'mustard', 'jeera', 'oil', 'coriander'], ['chapati']),
  r('bhindi-fry', 'bhindi fry', 'బెండకాయ వేపుడు', /bhindi|okra|lady\s*finger|bendakaya|బెండ/i, [MAIN('bhindi', 2), 'onion', 'chilliPowder', 'turmeric', 'jeera', 'oil'], ['curd']),
  r('brinjal-curry', 'brinjal curry', 'వంకాయ కూర', /brinjal|vankaya|baingan|వంకాయ/i, [MAIN('brinjal', 2), 'onion', 'tomato', 'greenChilli', 'chilliPowder', 'turmeric', 'mustard', 'jeera', 'oil'], ['curd'],
    ['peanuts'], ['పల్లీలు']),
  r('payasam', 'semiya payasam', 'సేమియా పాయసం', /payasam|kheer|semiya|పాయసం|సేమియా/i, ['vermicelli', MAIN('milk'), 'cashew', 'raisins', 'ghee'], [],
    ['sugar', 'cardamom'], ['చక్కెర', 'యాలకులు']),
  r('gulab-jamun', 'gulab jamun', 'గులాబ్ జామూన్', /gulab|jamun|జామూన్|జామున్/i, [MAIN('gulabMix'), 'oil'], ['iceCream'], ['sugar', 'cardamom'], ['చక్కెర', 'యాలకులు']),
  r('noodles', 'masala noodles', 'మసాలా నూడుల్స్', /maggi|noodle|నూడుల్/i, [MAIN('maggi'), 'onion', 'tomato', 'greenChilli', 'carrot'], ['ketchup']),
  r('omelette', 'bread omelette', 'బ్రెడ్ ఆమ్లెట్', /omelet|bread|ఆమ్లెట్|బ్రెడ్|\beggs?\b/i, [MAIN('eggs'), MAIN('bread'), 'butter', 'onion', 'greenChilli', 'coriander'], ['ketchup', 'tea']),
  r('fries', 'french fries', 'ఫ్రెంచ్ ఫ్రైస్', /fries|ఫ్రైస్/i, [MAIN('fries'), 'oil', 'ketchup'], ['thumsUp']),
  r('fruit-salad', 'fruit salad', 'ఫ్రూట్ సలాడ్', /fruit|ఫ్రూట్|పండ్లు/i, [MAIN('banana'), MAIN('apple'), MAIN('pomegranate')], ['iceCream', 'honey']),
  r('tea', 'tea', 'టీ', /\btea\b|chai|టీ|చాయ్/i, ['tea', MAIN('milk')], ['marie', 'bhujia'], ['sugar'], ['చక్కెర']),
  r('coffee', 'filter coffee', 'ఫిల్టర్ కాఫీ', /coffee|కాఫీ/i, ['coffee', MAIN('milk')], ['marie', 'goodDay'], ['sugar'], ['చక్కెర']),
  r('party', 'party snacks', 'పార్టీ స్నాక్స్', /birthday|party|celebration|పార్టీ|పుట్టినరోజు|బర్త్‌?డే/i,
    [MAIN('lays', 2), MAIN('kurkure', 2), MAIN('thumsUp'), MAIN('bhujia'), 'plates', 'cups'], ['celebrations', 'iceCream', 'gulabTin'],
    ['cake', 'candles'], ['కేక్', 'కొవ్వొత్తులు']),
  r('pooja', 'pooja', 'పూజ', /pooja|puja|vrat|ganesh|ganapati|vinayaka|satyanarayana|lakshmi|పూజ|వ్రతం|వినాయక|గణపతి|సత్యనారాయణ/i,
    ['marigold', ['garland', 2], 'agarbatti', 'camphor', ['coconut', 2], 'kumkum', 'pasupu', 'deepamOil', 'wicks', 'mangoLeaves', 'banana'], ['jasmine', 'laddu'],
    ['betel leaves', 'rice for akshinthalu'], ['తమలపాకులు', 'అక్షింతల బియ్యం'], true),
];

export const lineOf = (l: Line): { key: Key; qty: number; scale: boolean } =>
  typeof l === 'string' ? { key: l, qty: 1, scale: false } : { key: l[0], qty: l[1], scale: l[2] ?? false };
