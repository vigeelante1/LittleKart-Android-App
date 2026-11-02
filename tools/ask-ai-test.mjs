// Ask AI walk-through (iteration 2, DECISIONS D-102) on the web export in sample-data mode (port 5055).
// Without a Gemini key the built-in recipe list answers, so the run is the same every time.
//   node tools/ask-ai-test.mjs [width]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
const S = process.env.E2E_OUT ?? '/tmp/littlekart-askai';
mkdirSync(S, { recursive: true });
const W = Number(process.argv[2] || 400);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const ctx = await b.newContext({ viewport: { width: W, height: 860 }, timezoneId: 'Asia/Kolkata' });
const p = await ctx.newPage();
await p.clock.install({ time: new Date('2026-10-30T12:30:00+05:30') });
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
const input = () => p.getByPlaceholder('Type a dish…');
let sawTyping = false;
/** Sends a message and waits until the answer has typed out and its list has slid in. */
const say = async (text) => {
  await input().fill(text); await p.getByRole('button', { name: 'Send', exact: true }).click();
  for (let t = 0; t < 80; t++) {
    await p.waitForTimeout(100);
    const caret = await p.locator('text=▍ >> visible=true').count();
    if (caret) sawTyping = true;
    if (t > 3 && !caret && !(await p.locator('text=Thinking… >> visible=true').count())) break;
  }
  await p.waitForTimeout(1500);
};
const ticked = (name) => p.getByRole('checkbox', { name, exact: false }).first().getAttribute('aria-checked');
const box = (loc) => loc.boundingBox();

await p.goto('http://localhost:5055/', { waitUntil: 'networkidle' });
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('lk-location', JSON.stringify({ state: { selected: { label: '', text: 'Nalgonda Bus Stand, Rahamath Nagar, Nalgonda, Telangana 508001', lat: 17.0557, lng: 79.2745 } }, version: 1 }));
});
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
const fab = () => p.getByRole('button', { name: /^Ask Little: plan a dish/ });

await step('home: Ask AI button bottom-right, inside the screen', async () => {
  const r = await box(fab()); check(r, 'no button');
  check(r.x + r.width <= W - 8 && r.x + r.width >= W - 16, `right edge ${r.x + r.width}`);
  check(r.y + r.height <= 860 - 8, `bottom ${r.y + r.height}`);
  await shot('home-fab');
});
await step('chat opens with the greeting, Telugu hint and quick prompts', async () => {
  await fab().click(); await vis('What are you preparing today?').waitFor({ timeout: 4000 });
  await vis('తెలుగులో కూడా అడగొచ్చు').waitFor(); await vis('Chicken biryani for 4').waitFor(); await shot('chat-open');
});
await step('asks how many people when only the dish is given', async () => {
  await say('chicken biryani'); await vis('How many people are you cooking for?').waitFor({ timeout: 6000 });
});
await step('the answer types out word by word', async () => { check(sawTyping, 'no typing caret seen'); });
await step('list with tick boxes: ingredients ticked, extras not, nothing about unsold items', async () => {
  await say('4'); await vis('Ingredients').waitFor({ timeout: 6000 });
  check((await ticked('Sneha Chicken Biryani Cut')) === 'true', 'chicken not ticked');
  check((await ticked('Thums Up')) === 'false', 'extra was ticked');
  check((await p.locator('text=Not sold here').count()) === 0, '"Not sold here" shown'); await vis('Goes well with (optional)').waitFor();
  await vis(/Add \d+ items to cart/).waitFor();
  await shot('list');
});
await step('"I already have rice and curd" removes them', async () => {
  await say('I already have rice and curd'); await p.waitForTimeout(400);
  check((await p.getByRole('checkbox', { name: 'India Gate Basmati' }).count()) === 0, 'rice still listed');
  check((await p.getByRole('checkbox', { name: 'Heritage Total Curd' }).count()) === 0, 'curd still listed');
  check((await p.getByRole('checkbox', { name: 'Sneha Chicken Biryani Cut' }).count()) === 1, 'chicken gone');
});
await step('untick, quantity +, and the button count follows', async () => {
  await p.getByRole('checkbox', { name: 'Onion' }).first().click();
  check((await ticked('Onion')) === 'false', 'onion still ticked');
  const row = p.getByRole('checkbox', { name: 'Sneha Chicken Biryani Cut' }).first().locator('xpath=..');
  await row.getByRole('button', { name: 'Increase quantity' }).click();
  await vis('2').waitFor(); await vis(/Add \d+ items to cart/).waitFor(); await shot('edited');
  const box1 = await box(input()); check(box1 && box1.height <= 48, `text box ${box1?.height}px tall`);
});
await step('"no suggestions" removes the extras; onion stays unticked', async () => {
  await say('no suggestions please');
  check((await p.getByRole('checkbox', { name: 'Thums Up' }).count()) === 0, 'extras still shown');
  check((await ticked('Onion')) === 'false', 'onion re-ticked');
});
await step('nothing reaches the cart before the button', async () => {
  check((await cart()).length === 0, 'cart not empty');
});
await step('guest: Add → items in cart, then login page', async () => {
  const label = await p.getByRole('button', { name: /Add \d+ items to cart/ }).innerText();
  const want = Number(/Add (\d+)/.exec(label)[1]);
  await p.getByRole('button', { name: /Add \d+ items to cart/ }).click(); await p.waitForTimeout(1200);
  check(p.url().includes('/login'), `url ${p.url()}`);
  const lines = await cart();
  check(lines.length === want, `cart has ${lines.length}, button said ${want}`);
  check(lines.some((l) => l.productId === 'chicken-biryani-cut' && l.qty === 2), 'chicken qty 2 missing');
  check(!lines.some((l) => ['onion', 'thums-up', 'india-gate-basmati', 'heritage-curd'].includes(l.productId)), 'unwanted line added');
  await shot('login-after-add');
});
await step('after login the shopper lands on the cart', async () => {
  await p.locator('input >> visible=true').first().fill('9876543210');
  await vis('Continue').click(); await p.waitForTimeout(1200);
  const nameBox = p.locator('input[placeholder="Full Name"] >> visible=true');
  if (await nameBox.count()) await nameBox.first().fill('Test User');
  const send = p.locator('text=/^(Send OTP|Continue)$/ >> visible=true');
  if (await send.count()) { await send.first().click(); await p.waitForTimeout(1200); }
  await vis('Verify your number').waitFor({ timeout: 6000 });
  await p.locator('input >> visible=true').first().click(); await p.keyboard.type('1234');
  await p.waitForURL(/\/cart$/, { timeout: 8000 });
  await p.waitForTimeout(800); await shot('cart');
});
await step('Telugu: reply in Telugu with "not sold" in Telugu', async () => {
  await p.goto('http://localhost:5055/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  const saved = p.locator('[aria-label="Close"] >> visible=true').first();
  if (await p.locator('text=You have a saved existing cart >> visible=true').count()) await saved.click();
  await p.waitForTimeout(800);
  // Closing the saved-cart prompt opens the cart, as in the live app; come back to Home.
  if (p.url().endsWith('/cart')) { await p.locator('text=Back >> visible=true').first().click(); await p.waitForTimeout(800); }
  const r = await box(fab()); const barLoc = p.locator('text=View Cart >> visible=true').first();
  const bar = (await barLoc.count()) ? await box(barLoc) : null;
  if (bar) check(r.y + r.height <= bar.y - 4, 'button overlaps the cart bar');
  await fab().click(); await say('సాంబార్ 6 మందికి'); await vis('6 మందికి సాంబార్').waitFor({ timeout: 6000 });
  check((await p.locator('text=చింతపండు').count()) === 0, 'missing item named');
  await shot('telugu');
});
await step('logged in: Add goes straight to the cart', async () => {
  await p.getByRole('button', { name: /Add \d+ items to cart/ }).click(); await p.waitForTimeout(1200);
  check(p.url().endsWith('/cart'), `url ${p.url()}`);
  check((await cart()).some((l) => l.productId === 'tata-toor-dal'), 'dal not added');
});
await step('category screen shows the button too; product page does not', async () => {
  await p.goto('http://localhost:5055/category/chips', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  check((await fab().count()) === 1, 'no button on category'); await shot('category');
  await p.goto('http://localhost:5055/product/lays-classic', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  check((await fab().count()) === 0, 'button on product page');
});

for (const r of results) console.log(r.join(' | '));
console.log(`${results.filter((r) => r[0] === 'PASS').length}/${results.length} passed at ${W}px; page errors: ${errs.length}`);
if (errs.length) console.log(errs.slice(0, 5).join('\n'));
await b.close();
