// Location pop-up test (iteration 2, DECISIONS D-100): opens the delivery-location dialogs at several phone
// widths and checks their alignment by measuring the page, then picks a location by search and by GPS.
// Run against the web export in sample-data mode on port 5055: node tools/location-test.mjs
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
const OUT = process.env.E2E_OUT ?? '/tmp/littlekart-location';
mkdirSync(OUT, { recursive: true });
const WIDTHS = [320, 360, 393, 412];
const H = 860;
const LOC = { label: '', text: 'Nalgonda Bus Stand, Rahamath Nagar, Nalgonda, Telangana 508001', lat: 17.0557, lng: 79.2745 };
const USER = { id: 'u-9876543210', name: 'SV', phone: '9876543210' };
const results = [];
/** True when the search field's hint fits on one line (input text is clipped silently, not wrapped). */
const hintFits = (p) => p.evaluate(() => { const f = document.querySelector('input[placeholder="Search delivery location"]'); if (!f) return false; const c = document.createElement('canvas').getContext('2d'); const st = getComputedStyle(f); c.font = `${st.fontWeight} ${st.fontSize} ${st.fontFamily}`; return c.measureText(f.placeholder).width <= f.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight) + 0.5; });

/** Rectangles of the dialog card (white, radius 24 around `title`) and of named parts inside it. */
async function measure(p, title, parts) {
  return p.evaluate(({ title, parts }) => {
    const byText = (t) => [...document.querySelectorAll('div, span, input')].find((e) => e.offsetParent && (e.textContent === t || e.getAttribute('placeholder') === t) && e.children.length === 0);
    const head = byText(title);
    if (!head) return { error: 'title not found' };
    let paper = head;
    while (paper && getComputedStyle(paper).borderTopLeftRadius !== '24px') paper = paper.parentElement;
    if (!paper) return { error: 'card not found' };
    const r = (e) => { const b = e.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height }; };
    // Text boxes are as wide as their column; measure the words themselves.
    const textBox = (e) => { const range = document.createRange(); range.selectNodeContents(e); const b = range.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height }; };
    const out = { paper: r(paper), title: textBox(head), parts: {}, overflow: [], truncated: [] };
    for (const e of paper.querySelectorAll('div')) {
      if (e.children.length === 0 && e.textContent && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).textOverflow === 'ellipsis') out.truncated.push(e.textContent.slice(0, 30));
    }
    for (const [key, t] of Object.entries(parts)) {
      let e = byText(t);
      // climb to the control's own box (button / field), not the text inside it
      while (e && e !== paper && e.parentElement && e.getBoundingClientRect().width < 60 && e.parentElement !== paper) e = e.parentElement;
      if (e && (key === 'saved' || key === 'addNew')) { out.parts[key] = textBox(byText(t)); continue; }
      if (e) {
        let box = e;
        if (key.endsWith('Button') || key === 'info') while (box.parentElement && box.parentElement !== paper && getComputedStyle(box).borderTopLeftRadius === '0px') box = box.parentElement;
        out.parts[key] = r(box);
      }
    }
    for (const e of paper.querySelectorAll('*')) {
      const b = e.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      if (b.left < out.paper.left - 0.5 || b.right > out.paper.right + 0.5) out.overflow.push((e.textContent || e.tagName).slice(0, 30));
    }
    const close = document.querySelector('[aria-label="Close location dialog"]');
    if (close && close.offsetParent) out.close = r(close);
    return out;
  }, { title, parts });
}

const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;
/** Side margin of the dialog card: 32 px, or 20 px on phones narrower than 350 px. */
const edge = (W) => (W < 350 ? 20 : 32);
function check(name, W, cond, detail = '') { results.push([cond ? 'PASS' : 'FAIL', `${W}px`, name, cond ? '' : detail]); }

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
for (const W of WIDTHS) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, timezoneId: 'Asia/Kolkata', geolocation: { latitude: 17.0557, longitude: 79.2745 }, permissions: ['geolocation'] });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));

  // A. First visit: "Welcome to Littlekart", cannot be closed until a location is chosen.
  await p.goto('http://localhost:5055/', { waitUntil: 'networkidle' });
  await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  let m = await measure(p, 'Welcome to Littlekart', { info: 'Please provide your delivery location to start shopping.', currentButton: 'Use Current Location', field: 'Search delivery location' });
  await p.screenshot({ path: `${OUT}/${W}-1-welcome.png` });
  if (m.error) { check('welcome dialog opens', W, false, m.error); } else {
    const pad = m.paper.left;
    check('welcome: card the same distance from both screen edges (32 px, 20 px under 350)', W, near(m.paper.left, edge(W)) && near(W - m.paper.right, edge(W)), `${m.paper.left.toFixed(1)} / ${(W - m.paper.right).toFixed(1)}`);
    check('welcome: card centred top to bottom', W, near(m.paper.top, H - m.paper.bottom, 2), `${m.paper.top.toFixed(1)} / ${(H - m.paper.bottom).toFixed(1)}`);
    for (const k of ['info', 'currentButton', 'field']) {
      const e = m.parts[k];
      check(`welcome: ${k} lines up with the card's 24 px padding`, W, !!e && near(e.left, m.paper.left + 24) && near(e.right, m.paper.right - 24), e ? `${(e.left - m.paper.left).toFixed(1)} / ${(m.paper.right - e.right).toFixed(1)}` : 'missing');
    }
    check('welcome: title starts at the same 24 px edge', W, near(m.title.left, m.paper.left + 24));
    check('welcome: nothing sticks out of the card', W, m.overflow.length === 0, m.overflow.join(', '));
    check('welcome: no close button (location required)', W, !m.close);
    check('welcome: "Use Current Location" on one line', W, !!m.parts.currentButton && m.parts.currentButton.height <= 57, String(m.parts.currentButton?.height));
    check('welcome: no text cut off with "…"', W, m.truncated.length === 0, m.truncated.join(', '));
    void pad;
  }
  check('welcome: search hint fits the field', W, await hintFits(p));
  // Search, pick the suggestion.
  await p.locator('input[placeholder="Search delivery location"] >> visible=true').first().fill('nalgonda');
  await p.waitForTimeout(1200);
  const sug = await p.evaluate(() => {
    const t = [...document.querySelectorAll('div')].find((e) => e.offsetParent && e.children.length === 0 && e.textContent?.startsWith('Nalgonda Bus Stand'));
    const f = document.querySelector('input[placeholder="Search delivery location"]');
    if (!t || !f) return null;
    let box = t; while (box.parentElement && getComputedStyle(box).borderTopWidth !== '1px') box = box.parentElement;
    const a = box.getBoundingClientRect(), c = f.getBoundingClientRect();
    return { left: a.left - c.left, right: c.right - a.right };
  });
  await p.screenshot({ path: `${OUT}/${W}-2-suggestions.png` });
  check('welcome: suggestion list lines up with the search field', W, !!sug && near(sug.left, 0) && near(sug.right, 0), JSON.stringify(sug));
  await p.locator('text=/^Nalgonda Bus Stand/ >> visible=true').first().click(); await p.waitForTimeout(1500);
  const loc1 = await p.evaluate(() => localStorage.getItem('lk-location'));
  check('welcome: choosing a suggestion saves it and closes the dialog', W, !!loc1 && loc1.includes('17.05') && !(await p.locator('text=Welcome to Littlekart >> visible=true').count()));
  await p.screenshot({ path: `${OUT}/${W}-3-after-search.png` });

  // GPS: "Use Current Location" on a fresh visit.
  await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await p.locator('text=Use Current Location >> visible=true').first().click(); await p.waitForTimeout(2500);
  const loc2 = await p.evaluate(() => localStorage.getItem('lk-location'));
  check('welcome: Use Current Location saves the address and closes', W, !!loc2 && loc2.includes('Nalgonda') && !(await p.locator('text=Welcome to Littlekart >> visible=true').count()), String(loc2).slice(0, 80));

  // B. Signed in: header address opens "Change Location".
  await p.evaluate(({ LOC, USER }) => {
    localStorage.setItem('lk-location', JSON.stringify({ state: { selected: LOC }, version: 1 }));
    localStorage.setItem('lk-auth', JSON.stringify({ state: { user: USER, token: '' }, version: 1 }));
  }, { LOC, USER });
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await p.locator('text=/^Nalgonda Bus Stand/ >> visible=true').first().click(); await p.waitForTimeout(1500);
  m = await measure(p, 'Change Location', { currentButton: 'Use Current Location', field: 'Search delivery location', saved: 'Saved Addresses', addNew: '+ Add New Address' });
  await p.screenshot({ path: `${OUT}/${W}-4-change.png` });
  check('change: search hint fits the field', W, await hintFits(p));
  if (m.error) { check('change dialog opens from the header', W, false, m.error); } else {
    check('change: card the same distance from both screen edges (32 px, 20 px under 350)', W, near(m.paper.left, edge(W)) && near(W - m.paper.right, edge(W)), `${m.paper.left.toFixed(1)} / ${(W - m.paper.right).toFixed(1)}`);
    check('change: card centred top to bottom', W, near(m.paper.top, H - m.paper.bottom, 2), `${m.paper.top.toFixed(1)} / ${(H - m.paper.bottom).toFixed(1)}`);
    check('change: close button inside the top-right corner (16 px)', W, !!m.close && near(m.close.top - m.paper.top, 16) && near(m.paper.right - m.close.right, 16), m.close ? `${(m.close.top - m.paper.top).toFixed(1)} / ${(m.paper.right - m.close.right).toFixed(1)}` : 'missing');
    check('change: title clear of the close button', W, !!m.close && m.title.right <= m.close.left);
    const btn = m.parts.currentButton;
    check('change: Use Current Location centred', W, !!btn && near((btn.left + btn.right) / 2, (m.paper.left + m.paper.right) / 2), btn ? `${((btn.left + btn.right) / 2 - (m.paper.left + m.paper.right) / 2).toFixed(1)}` : 'missing');
    const f = m.parts.field;
    check('change: search field lines up with the 24 px padding', W, !!f && near(f.left, m.paper.left + 24) && near(f.right, m.paper.right - 24), f ? `${(f.left - m.paper.left).toFixed(1)} / ${(m.paper.right - f.right).toFixed(1)}` : 'missing');
    const s = m.parts.saved, a = m.parts.addNew;
    check('change: "Saved Addresses" and "+ Add New Address" each on one line', W, !!s && !!a && s.height < 30 && a.height < 30, s && a ? `${s.height}/${a.height}` : 'missing');
    check('change: no label cut off with "…"', W, m.truncated.length === 0, m.truncated.join(', '));
    const sameRow = !!s && !!a && near((s.top + s.bottom) / 2, (a.top + a.bottom) / 2, 2);
    check('change: saved labels line up with the 24 px padding', W, !!s && !!a && near(s.left, m.paper.left + 24) && (sameRow ? near(a.right, m.paper.right - 24, 1.5) : near(a.left, m.paper.left + 24, 1.5)), s && a ? `${(s.left - m.paper.left).toFixed(1)} / ${sameRow ? (m.paper.right - a.right).toFixed(1) : (a.left - m.paper.left).toFixed(1)} ${sameRow ? 'same row' : 'below'}` : 'missing');
    check('change: nothing sticks out of the card', W, m.overflow.length === 0, m.overflow.join(', '));
  }
  // Close with ×, then reopen from the cart's Change.
  await p.locator('[aria-label="Close location dialog"] >> visible=true').first().click(); await p.waitForTimeout(600);
  check('change: × closes the dialog', W, !(await p.locator('text=Change Location >> visible=true').count()));
  await p.evaluate(() => localStorage.setItem('lk-cart', JSON.stringify({ state: { lines: [{ productId: 'india-gate-basmati', variantId: 'india-gate-basmati-1', qty: 1, addedAt: Date.now() }] }, version: 1 })));
  await p.goto('http://localhost:5055/cart', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  const changeBtn = p.locator('text=/^Change$/ >> visible=true');
  if (await changeBtn.count()) {
    await changeBtn.first().click(); await p.waitForTimeout(1200);
    m = await measure(p, 'Change Location', { field: 'Search delivery location' });
    await p.screenshot({ path: `${OUT}/${W}-5-cart-change.png` });
    check('cart: Change opens the same centred dialog', W, !m.error && near(m.paper.left, edge(W)) && near(W - m.paper.right, edge(W)), m.error ?? '');
    // Add New Address page.
    await p.locator('text=+ Add New Address >> visible=true').first().click(); await p.waitForTimeout(1800);
    await p.screenshot({ path: `${OUT}/${W}-6-add-address.png` });
    const overflowX = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check('Add New Address page opens with no sideways overflow', W, p.url().includes('/add-address') && overflowX <= 0, `${p.url()} ${overflowX}`);
  } else check('cart: Change button present', W, false);
  check('no page errors', W, errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await b.close();
const fails = results.filter((r) => r[0] === 'FAIL');
console.log(results.map((r) => r.filter(Boolean).join(' | ')).join('\n'));
console.log(`\n${results.length - fails.length}/${results.length} passed`);
