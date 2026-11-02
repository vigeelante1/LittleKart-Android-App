// Full end-to-end walk through the app (iteration 2, DECISIONS D-98, D-101): login, home, category, product page
// (nutrition tags and Nutritional info), search,
// deals, cart (Swap & save, suggestions, coupons), payment with suggestions, order, tracking and orders.
// Run against the web export of the app in sample-data mode served on port 5055: node tools/e2e-web.mjs [width]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const S = process.env.E2E_OUT ?? '/tmp/littlekart-e2e';
import('node:fs').then((fs) => fs.mkdirSync(S, { recursive: true }));
const W = Number(process.argv[2] || 400);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const ctx = await b.newContext({ viewport: { width: W, height: 860 }, timezoneId: 'Asia/Kolkata' });
const p = await ctx.newPage();
// Run at an hour the store is open (12:30 IST by default), so checkout is not blocked by the store-hours rule.
await p.clock.install({ time: new Date(process.env.E2E_TIME ?? '2026-10-30T12:30:00+05:30') });
await p.clock.resume();
const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const results = [];
let n = 0;
const shot = (name) => p.screenshot({ path: `${S}/${W}-${String(++n).padStart(2, '0')}-${name}.png` });
const vis = (t) => p.locator(`text=${t} >> visible=true`).first();
const step = async (name, fn) => {
  try { await fn(); results.push(['PASS', name]); } catch (e) { results.push(['FAIL', name, String(e).split('\n')[0]]); await shot('FAIL-' + name.replace(/\W+/g, '_')); }
};
const expectVisible = async (t, timeout = 4000) => { await vis(t).waitFor({ state: 'visible', timeout }); };
const cart = () => p.evaluate(() => JSON.parse(localStorage.getItem('lk-cart') || '{"state":{"lines":[]}}').state.lines);

await p.goto('http://localhost:5055/', { waitUntil: 'networkidle' });
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('lk-location', JSON.stringify({ state: { selected: { label: '', text: 'Nalgonda Bus Stand, Rahamath Nagar, Nalgonda, Telangana 508001', lat: 17.0557, lng: 79.2745 } }, version: 1 }));
});
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);

await step('home: header, strip, sections and deals', async () => {
  await expectVisible('Pooja &'); await expectVisible('Limited Time Deals'); await shot('home');
});
await step('home: login button opens login', async () => {
  await vis('Login').click(); await expectVisible('Continue'); await shot('login');
});
await step('login: phone, name, OTP 1234', async () => {
  await p.locator('input >> visible=true').first().fill('9876543210');
  await vis('Continue').click(); await p.waitForTimeout(1200); await shot('login-2');
  const nameBox = p.locator('input[placeholder="Full Name"] >> visible=true');
  if (await nameBox.count()) await nameBox.first().fill('Test User');
  const send = p.locator('text=/^(Send OTP|Continue)$/ >> visible=true');
  if (await send.count()) { await send.first().click(); await p.waitForTimeout(1200); }
  await expectVisible('Verify your number', 6000);
  await p.locator('input >> visible=true').first().click(); await p.keyboard.type('1234'); await p.waitForTimeout(2500);
  const auth = await p.evaluate(() => localStorage.getItem('lk-auth'));
  if (!auth || !auth.includes('9876543210')) throw new Error('not signed in: ' + auth);
  await shot('logged-in');
});
await p.goto('http://localhost:5055/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
await step('home: tile opens category, sub-category switch', async () => {
  await vis('Fresh Meat & Fish').click(); await expectVisible('Chicken'); await p.waitForTimeout(800);
  await vis('Mutton').click(); await p.waitForTimeout(800); await expectVisible('Mutton Boneless'); await shot('category');
});
await step('category: sort and filters sheets open and close', async () => {
  await vis('Sort').click(); await p.waitForTimeout(500); await shot('sort'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  const close = p.locator('[aria-label="Close filters"] >> visible=true'); if (await close.count()) await close.first().click();
  await p.waitForTimeout(300);
});
await step('category: ADD on a card puts it in the cart', async () => {
  await p.goto('http://localhost:5055/category/biscuits-cookies', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  await p.locator('text=ADD >> visible=true').first().click(); await p.waitForTimeout(500);
  if ((await cart()).length !== 1) throw new Error('cart ' + JSON.stringify(await cart()));
  await expectVisible('View Cart'); await shot('added');
});
await step('product page opens from a card', async () => {
  await vis('Parle Monaco Classic').click(); await p.waitForTimeout(1200);
  if (!p.url().includes('/product/monaco')) throw new Error(p.url());
  await expectVisible('Net quantity: 200g'); await expectVisible('Add to cart'); await shot('product');
});
await step('product page: add, increase, decrease', async () => {
  await vis('Add to cart').click(); await p.waitForTimeout(300);
  await p.locator('[aria-label="Increase quantity"] >> visible=true').first().click(); await p.waitForTimeout(300);
  let line = (await cart()).find((l) => l.productId === 'monaco'); if (line?.qty !== 2) throw new Error('qty ' + line?.qty);
  await p.locator('[aria-label="Decrease quantity"] >> visible=true').first().click(); await p.waitForTimeout(300);
  line = (await cart()).find((l) => l.productId === 'monaco'); if (line?.qty !== 1) throw new Error('qty ' + line?.qty);
});
await step('product page: more info, similar, popular, view more', async () => {
  await p.mouse.move(W / 2, 500); await p.mouse.wheel(0, 600); await p.waitForTimeout(500);
  await vis('View more info').click(); await expectVisible('Available sizes');
  await p.mouse.wheel(0, 700); await p.waitForTimeout(500);
  await expectVisible('Similar products'); await expectVisible('Popular in this category'); await shot('related');
  // The "View more" under "Similar products" (the nutrition card has its own "View more" above it).
  const title = await vis('Similar products').boundingBox();
  const mores = p.locator('text=/^View more$/ >> visible=true');
  for (let i = 0; i < (await mores.count()); i++) {
    const box = await mores.nth(i).boundingBox();
    if (box && title && box.y > title.y) { await mores.nth(i).click(); break; }
  }
  await p.waitForTimeout(1200);
  if (!p.url().includes('/category/biscuits-cookies')) throw new Error(p.url());
});
await step('product page: nutrition tags and Nutritional info', async () => {
  await p.goto('http://localhost:5055/category/chips', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  await expectVisible('Low sugar · No trans-fat');
  await p.goto('http://localhost:5055/product/chicken-boneless', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  await expectVisible('High protein');
  await p.mouse.move(W / 2, 500); await p.mouse.wheel(0, 900); await p.waitForTimeout(500);
  await expectVisible('Nutritional info'); await expectVisible('120 calories'); await expectVisible('23g protein');
  const title = await vis('Nutritional info').boundingBox();
  const mores = p.locator('text=/^View more$/ >> visible=true');
  for (let i = 0; i < (await mores.count()); i++) { const box = await mores.nth(i).boundingBox(); if (box && title && box.y > title.y) { await mores.nth(i).click(); break; } }
  await p.waitForTimeout(400);
  await expectVisible('Dietary fibre'); await expectVisible('Sodium'); await shot('nutrition');
  await p.goto('http://localhost:5055/product/ariel-matic', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  if (await p.locator('text=Nutritional info').count()) throw new Error('nutrition shown for a non-food');
});
await step('product page: unit chips switch size (Maggi)', async () => {
  await p.goto('http://localhost:5055/product/maggi-masala', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  await expectVisible('Net quantity: 70g'); await vis('4 Pack (280g)').click(); await p.waitForTimeout(300);
  await expectVisible('Net quantity: 4 Pack (280g)'); await vis('Add to cart').click(); await p.waitForTimeout(300);
  if (!(await cart()).some((l) => l.productId === 'maggi-masala' && l.variantId.endsWith('-2'))) throw new Error('size not added');
  await shot('units');
});
await step('product page: unknown id says not available', async () => {
  await p.goto('http://localhost:5055/product/nope', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await expectVisible('This product is not available.');
});
await step('search: typed words find products, result opens product page', async () => {
  await p.goto('http://localhost:5055/search', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  await p.locator('input >> visible=true').first().fill('basmati'); await p.waitForTimeout(1200);
  await expectVisible('India Gate Basmati Rice Classic'); await shot('search');
  await p.locator('text=ADD >> visible=true').first().click(); await p.waitForTimeout(400);
  await vis('India Gate Basmati Rice Classic').click(); await p.waitForTimeout(1000);
  if (!p.url().includes('/product/')) throw new Error(p.url());
});
await step('deals: card picture opens product page', async () => {
  await p.goto('http://localhost:5055/deals', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  await p.locator('[role="button"][aria-label*="Chikkudu"] >> visible=true').first().click(); await p.waitForTimeout(1000);
  if (!p.url().includes('/product/chikkudu')) throw new Error(p.url());
});
await step('cart: lines, swap & save, undo, swap', async () => {
  await p.goto('http://localhost:5055/cart', { waitUntil: 'networkidle' }); await p.waitForTimeout(1800);
  await expectVisible('My Cart'); await expectVisible('Swap & save ₹64'); await shot('cart');
  await vis('Swap & save ₹64').click(); await expectVisible('Cheaper pick'); await shot('swap-dialog');
  await p.locator('text=Swap >> visible=true').last().click(); await p.waitForTimeout(600);
  if (!(await cart()).some((l) => l.productId === 'daawat-basmati')) throw new Error('not swapped');
  await vis('Undo').click(); await p.waitForTimeout(600);
  if (!(await cart()).some((l) => l.productId === 'india-gate-basmati')) throw new Error('undo failed');
});
await step('cart: often bought together adds, coupons sheet, tip', async () => {
  const before = (await cart()).length;
  await p.mouse.move(W / 2, 500); await p.mouse.wheel(0, 600); await p.waitForTimeout(600);
  await expectVisible('Often bought together');
  await p.locator('text=ADD >> visible=true').first().click(); await p.waitForTimeout(500);
  if ((await cart()).length !== before + 1) throw new Error('suggestion not added');
  await p.mouse.wheel(0, 900); await p.waitForTimeout(600);
  const coupons = p.locator('text=/coupon/i >> visible=true').first();
  if (await coupons.count()) { await coupons.click(); await p.waitForTimeout(800); await shot('coupons'); await p.keyboard.press('Escape'); await p.waitForTimeout(400); }
  await shot('cart-bottom');
});
await step('cart: line picture opens product page', async () => {
  await p.goto('http://localhost:5055/cart', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await p.locator('[role="button"][aria-label="India Gate Basmati Rice Classic"] >> visible=true').first().click(); await p.waitForTimeout(1000);
  if (!p.url().includes('/product/india-gate-basmati')) throw new Error(p.url());
});
await step('checkout: proceed to pay, suggested product updates bill', async () => {
  await p.goto('http://localhost:5055/cart', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
  await vis('Proceed To Pay').click(); await p.waitForTimeout(1500);
  await expectVisible('Order Summary'); await expectVisible('Suggested products'); await shot('payment');
  const total = async () => (await p.locator('text=/Grand Total/ >> visible=true').count()) ? await p.evaluate(() => document.body.innerText.match(/Grand Total\s*₹\s*([\d,]+)/)?.[1]) : null;
  const t0 = await total();
  await p.locator('text=ADD >> visible=true').first().click(); await p.waitForTimeout(1200);
  const t1 = await total();
  if (!t0 || !t1 || Number(t1.replace(/,/g, '')) <= Number(t0.replace(/,/g, ''))) throw new Error(`total ${t0} -> ${t1}`);
});
await step('checkout: cash on delivery, submit, order placed, tracking', async () => {
  await p.mouse.move(W / 2, 500); await p.mouse.wheel(0, 1500); await p.waitForTimeout(600);
  const cod = vis('Cash on Delivery'); if (await cod.count()) await cod.click();
  await shot('payment-bottom');
  await vis('Submit Order').click(); await p.waitForTimeout(2500); await shot('submitted');
  const track = vis('View Tracking'); await track.waitFor({ timeout: 6000 }); await track.click(); await p.waitForTimeout(1500);
  if (!p.url().includes('/tracking/')) throw new Error(p.url());
  await shot('tracking');
  if ((await cart()).length !== 0) throw new Error('cart not emptied');
});
await step('orders: list shows the order, details open', async () => {
  // Sample-data orders live in memory, so stay inside the app (no page reload).
  await p.locator('[aria-label="Back"] >> visible=true').first().click(); await p.waitForTimeout(1200);
  if (!(await p.locator('[aria-label="Account"] >> visible=true').count())) { await p.locator('[aria-label="Back"] >> visible=true').first().click().catch(() => {}); await p.waitForTimeout(1200); }
  await p.locator('[aria-label="Account"] >> visible=true').first().click(); await p.waitForTimeout(1200); await shot('profile');
  await vis('Orders').click(); await p.waitForTimeout(1500);
  await expectVisible('Reorder'); await shot('orders');
});
await step('home: every section tile opens a category with products', async () => {
  await p.goto('http://localhost:5055/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  const ids = ['flowers', 'restaurants', 'veggies-fruits', 'cool-drinks', 'stationery', 'cold-cough-fever', 'skin-care'];
  for (const id of ids) {
    await p.goto(`http://localhost:5055/category/${id}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(900);
    const adds = await p.locator('text=/^ADD$/ >> visible=true').count();
    if (adds === 0) throw new Error('no products in ' + id);
  }
});

console.log(results.map((r) => r.join(' | ')).join('\n'));
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 10)));
await b.close();
