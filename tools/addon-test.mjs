// "Forgot something?" (iteration 2, DECISIONS D-105) on the web export in sample-data mode (port 5055):
// for 40 seconds after ordering, items can be added to the same order with no extra fees.
//   node tools/addon-test.mjs [width]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
const S = process.env.E2E_OUT ?? '/tmp/littlekart-addon';
mkdirSync(S, { recursive: true });
const W = Number(process.argv[2] || 400);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const ctx = await b.newContext({ viewport: { width: W, height: 860 }, timezoneId: 'Asia/Kolkata' });
const p = await ctx.newPage();
await p.clock.install({ time: new Date('2026-11-04T12:30:00+05:30') });
await p.clock.resume();
const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
const results = [];
let n = 0;
const shot = (name) => p.screenshot({ path: `${S}/${W}-${String(++n).padStart(2, '0')}-${name}.png` });
const vis = (t) => p.locator(`text=${t} >> visible=true`).first();
const step = async (name, fn) => {
  try { await fn(); results.push(['PASS', name]); } catch (e) { results.push(['FAIL', name, String(e).split('\n')[0]]); await shot('FAIL-' + name.replace(/\W+/g, '_')); }
};
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const cart = () => p.evaluate(() => JSON.parse(localStorage.getItem('lk-cart') || '{"state":{"lines":[]}}').state.lines);
const body = () => p.evaluate(() => document.body.innerText);
/** Taps an ADD button in the middle of the screen (the dock covers the bottom). */
const tapAdd = async () => {
  await p.mouse.move(W / 2, 400); await p.mouse.wheel(0, 450); await p.waitForTimeout(600);
  const adds = p.locator('[aria-label="ADD"] >> visible=true');
  for (let i = 0; i < (await adds.count()); i++) {
    const r = await adds.nth(i).boundingBox();
    if (r && r.y > 120 && r.y < 600) { await adds.nth(i).click(); return; }
  }
  throw new Error('no ADD button in view');
};

await p.goto('http://localhost:5055/', { waitUntil: 'networkidle' });
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('lk-location', JSON.stringify({ state: { selected: { label: '', text: 'Nalgonda Bus Stand, Rahamath Nagar, Nalgonda, Telangana 508001', lat: 17.0557, lng: 79.2745 } }, version: 1 }));
});
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);

await step('login', async () => {
  await vis('Login').click(); await p.waitForTimeout(800);
  await p.locator('input >> visible=true').first().fill('9876543210');
  await vis('Continue').click(); await p.waitForTimeout(1200);
  const nameBox = p.locator('input[placeholder="Full Name"] >> visible=true');
  if (await nameBox.count()) await nameBox.first().fill('Test User');
  const send = p.locator('text=/^(Send OTP|Continue)$/ >> visible=true');
  if (await send.count()) { await send.first().click(); await p.waitForTimeout(1200); }
  await p.locator('input >> visible=true').first().click(); await p.keyboard.type('1234'); await p.waitForTimeout(3500);
});
await step('place a Cash on Delivery order', async () => {
  await p.evaluate(() => localStorage.setItem('lk-cart', JSON.stringify({ state: { lines: [{ productId: 'amul-butter', variantId: 'amul-100', qty: 2, addedAt: Date.now() }] }, version: 1 })));
  await p.goto('http://localhost:5055/cart', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
  await vis('Proceed To Pay').click(); await p.waitForTimeout(1500);
  await p.mouse.move(W / 2, 500); await p.mouse.wheel(0, 1500); await p.waitForTimeout(500);
  await vis('Cash on Delivery').click();
  await vis('Submit Order').click(); await p.waitForTimeout(2500);
  await vis('View Tracking').click(); await p.waitForTimeout(1500);
  check(p.url().includes('/tracking/'), p.url());
});
await step('tracking: "Forgot something?" with a 40-second countdown', async () => {
  await vis('Forgot something?').waitFor({ timeout: 4000 });
  const t = (await body()).match(/next 0:(\d\d)/);
  check(t && Number(t[1]) <= 40 && Number(t[1]) >= 25, `countdown ${t?.[0]}`);
  await shot('tracking-banner');
});
await step('Add items → Home; strip and cart bar count down', async () => {
  await p.getByRole('button', { name: 'Add items', exact: true }).click(); await p.waitForTimeout(1200);
  await vis('Add items to your order').waitFor({ timeout: 4000 });
  await tapAdd(); await p.waitForTimeout(800);
  await vis('Add to order ·').waitFor({ timeout: 4000 });
  await shot('home-countdown');
});
await step('sheet: items, no extra fees, pay options; Add to order', async () => {
  const lines = await cart();
  check(lines.length === 1, `cart has ${lines.length}`);
  await vis('Add to order ·').click(); await p.waitForTimeout(800);
  await vis('Add to your order').waitFor(); await vis('No extra delivery or other fees').waitFor();
  await vis('UPI / Card').waitFor();
  await shot('sheet');
  await p.locator('text=/^Add to order · ₹/ >> visible=true').first().click(); await p.waitForTimeout(1800);
  check(p.url().includes('/tracking/'), p.url());
  check((await cart()).length === 0, 'cart not emptied');
});
await step('the same order now holds both items; details mark the added one', async () => {
  const text = await body();
  check(/2 items/i.test(text), 'tracking summary does not show 2 items');
  await p.mouse.move(W / 2, 500); await p.mouse.wheel(0, 2500); await p.waitForTimeout(600);
  await p.locator('text=/2 items/i >> visible=true').first().click(); await p.waitForTimeout(1500);
  await vis('Added later').waitFor({ timeout: 4000 });
  await shot('details');
});
await step('after 40 seconds: banner gone, the bar is "View Cart" again', async () => {
  await p.clock.fastForward(46_000); await p.waitForTimeout(1500);
  check(!(await body()).includes('Forgot something?'), 'banner still shown');
  await p.locator('[aria-label="Back"] >> visible=true').first().click().catch(() => {}); await p.waitForTimeout(1200);
  await p.goto('http://localhost:5055/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await tapAdd(); await p.waitForTimeout(800);
  await vis('View Cart').waitFor({ timeout: 4000 });
  check(!(await body()).includes('Add items to your order'), 'strip still counting');
});

for (const r of results) console.log(r.join(' | '));
console.log(`${results.filter((r) => r[0] === 'PASS').length}/${results.length} passed at ${W}px; page errors: ${errs.length}`);
if (errs.length) console.log(errs.slice(0, 5).join('\n'));
await b.close();
