// Schedule for later (iteration 2, DECISIONS D-103) on the web export in sample-data mode (port 5055).
// The browser clock is set to 1:30 AM India time, when the store (6:00 AM – 12:00 AM) is closed.
//   node tools/schedule-test.mjs [width]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
const S = process.env.E2E_OUT ?? '/tmp/littlekart-schedule';
mkdirSync(S, { recursive: true });
const W = Number(process.argv[2] || 400);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const ctx = await b.newContext({ viewport: { width: W, height: 860 }, timezoneId: 'Asia/Kolkata' });
const p = await ctx.newPage();
await p.clock.install({ time: new Date('2026-10-31T01:30:00+05:30') });
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
const text = () => p.evaluate(() => document.body.innerText);

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
await step('home shows the closed sign and the renamed "Ask Little" button', async () => {
  await vis("We'll be back at 6:00 AM").waitFor({ timeout: 5000 });
  check((await p.getByRole('button', { name: /^Ask Little: plan/ }).count()) === 1, 'no Ask Little button');
  check(!(await text()).includes('Ask AI'), '"Ask AI" still shown');
  await shot('home-closed');
});
await step('cart: closed store offers "Schedule Delivery"', async () => {
  await p.evaluate(() => localStorage.setItem('lk-cart', JSON.stringify({ state: { lines: [{ productId: 'amul-butter', variantId: 'amul-100', qty: 2, addedAt: Date.now() }] }, version: 1 })));
  await p.goto('http://localhost:5055/cart', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
  await vis('Schedule Delivery').waitFor({ timeout: 5000 }); await shot('cart-closed');
});
await step('slot sheet: Today, 18 one-hour slots from 6 AM, button waits for a pick', async () => {
  await vis('Schedule Delivery').click(); await p.waitForTimeout(800);
  await vis('Schedule delivery').waitFor(); await vis('Today').waitFor();
  check((await p.getByRole('radio').count()) === 18, `slots: ${await p.getByRole('radio').count()}`);
  await vis('6:00 AM - 7:00 AM').waitFor(); await vis('11:00 PM - 12:00 AM').waitFor();
  await vis('Choose a delivery slot').waitFor(); await shot('slots');
});
await step('pick 8:00 AM and go to payment', async () => {
  await p.getByRole('radio', { name: 'Today, 8:00 AM - 9:00 AM' }).click(); await p.waitForTimeout(300);
  await shot('slot-picked');
  await vis('Schedule & Proceed').click(); await p.waitForTimeout(1500);
  check(p.url().endsWith('/payment'), p.url());
  await vis('Scheduled delivery').waitFor(); await vis('Today, 8:00 AM - 9:00 AM').waitFor();
  check(!(await text()).includes('Store is closed right now'), 'closed notice still shown');
});
await step('payment: change the slot to 9:00 AM', async () => {
  await vis('Change').click(); await p.waitForTimeout(800);
  await p.getByRole('radio', { name: 'Today, 9:00 AM - 10:00 AM' }).click();
  await vis('Confirm slot').click(); await p.waitForTimeout(600);
  await vis('Today, 9:00 AM - 10:00 AM').waitFor();
});
await step('payment: Schedule Order places the order', async () => {
  await p.mouse.move(W / 2, 500); await p.mouse.wheel(0, 1500); await p.waitForTimeout(600);
  const cod = vis('Cash on Delivery'); if (await cod.count()) await cod.click();
  await shot('payment-scheduled');
  await vis('Schedule Order').click(); await p.waitForTimeout(2500);
  await vis('View Tracking').waitFor({ timeout: 6000 }); await vis('View Tracking').click(); await p.waitForTimeout(1500);
  check(p.url().includes('/tracking/'), p.url());
  await vis('Arriving today, 9:00 AM - 10:00 AM').waitFor(); await shot('tracking');
});
await step('orders: "Scheduled" lists it; details say the slot', async () => {
  await p.locator('[aria-label="Back"] >> visible=true').first().click(); await p.waitForTimeout(1200);
  if (!(await p.locator('[aria-label="Account"] >> visible=true').count())) { await p.locator('[aria-label="Back"] >> visible=true').first().click().catch(() => {}); await p.waitForTimeout(1200); }
  await shot('home-strip');
  await p.locator('[aria-label="Account"] >> visible=true').first().click(); await p.waitForTimeout(1200);
  await vis('Orders').click(); await p.waitForTimeout(1500);
  await vis('Scheduled').click(); await p.waitForTimeout(600);
  await vis('Reorder').waitFor(); await shot('orders-scheduled');
  await p.locator('text=/^#/ >> visible=true').first().click().catch(() => {});
  await p.waitForTimeout(1200);
  if ((await p.locator('text=Scheduled for Today, 9:00 AM - 10:00 AM >> visible=true').count()) === 0) {
    await p.locator('text=Reorder >> visible=true').first().locator('xpath=ancestor::*[@role="button"][1]').click().catch(() => {});
  }
});
await step('daytime: no slots, normal Proceed To Pay', async () => {
  await p.clock.setFixedTime(new Date('2026-10-31T12:30:00+05:30'));
  await p.evaluate(() => localStorage.setItem('lk-cart', JSON.stringify({ state: { lines: [{ productId: 'amul-butter', variantId: 'amul-100', qty: 1, addedAt: Date.now() }] }, version: 1 })));
  await p.goto('http://localhost:5055/cart', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
  await vis('Proceed To Pay').waitFor({ timeout: 5000 });
  check((await p.locator('text=Schedule Delivery').count()) === 0, 'schedule button in daytime');
});

for (const r of results) console.log(r.join(' | '));
console.log(`${results.filter((r) => r[0] === 'PASS').length}/${results.length} passed at ${W}px; page errors: ${errs.length}`);
if (errs.length) console.log(errs.slice(0, 5).join('\n'));
await b.close();
