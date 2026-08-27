const path = require('path');
const fs = require('fs');
const puppeteer = require(path.join(__dirname, '..', 'backend', 'node_modules', 'puppeteer'));
const jwt = require(path.join(__dirname, '..', 'backend', 'node_modules', 'jsonwebtoken'));

// Capture the current application build for the TOR. Override with
// TOR_CAPTURE_BASE when the frontend is served on another port.
const BASE = process.env.TOR_CAPTURE_BASE || 'http://127.0.0.1:8090';
const OUT = path.join(__dirname, '..', 'docs', 'tor', 'captures-v2');
const SECRET = 'jwt-secret-key-change-this-in-production';
const ID = {
  admin: '6a351d6ef794b013802b62eb',
  artist: '6a3a0974253bcd3d80886e50',
  customer: '6a38fa6edd960f514022c4d9',
  artwork: '6a38e66f8a3d1a8dcce2f4ef',
  news: '6a38d6c98a3d1a8dcce2eeff',
  submission: '6a3a4e41598dff688ce5420b',
};

const tokenFor = (userId, role) => jwt.sign({ userId, role }, SECRET, { expiresIn: 3600 });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function setAuth(page, userId, role) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate((o) => {
    localStorage.setItem('objs', JSON.stringify(o));
    localStorage.setItem('lang', 'th');
  }, { xAccessToken: tokenFor(userId, role), accounts: userId, role });
}

async function clearAuth(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.removeItem('objs');
    localStorage.setItem('lang', 'th');
  });
}

async function capture(page, name, url, wait = 3500) {
  await page.goto(BASE + url, { waitUntil: 'networkidle2', timeout: 45000 });
  await delay(wait);
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log(`captured ${name}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'th-TH,th' });

  // Public pages
  await clearAuth(page);
  await capture(page, 'pub_01_home_a.png', '/');
  await capture(page, 'pub_02_artworks_a.png', '/artworks');
  await capture(page, 'pub_03_artwork_detail_a.png', `/artwork/${ID.artwork}`);
  await capture(page, 'pub_04_news.png', '/news');
  await capture(page, 'pub_08_payment.png', '/payment');
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 45000 });
  await delay(1200);
  const loginTrigger = await page.$('.user-login-trigger');
  if (loginTrigger) {
    await loginTrigger.click();
    await delay(800);
  }
  await page.screenshot({ path: path.join(OUT, 'pub_09_login_dialog.png'), fullPage: true });
  console.log('captured pub_09_login_dialog.png');

  // Admin pages, including the new post-term-sale queue.
  await setAuth(page, ID.admin, 'Admin');
  await capture(page, '08_admin_submissions.png', '/admin/submissions');
  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.section-tab')];
    const button = tabs[1] || [...document.querySelectorAll('button')]
      .find(el => (el.textContent || '').includes('ครบ 1 ปี'));
    if (button) button.click();
  });
  await delay(1600);
  await page.screenshot({ path: path.join(OUT, 'admin_post_term_queue.png'), fullPage: true });
  console.log('captured admin_post_term_queue.png');
  await capture(page, 'admin_02_artworks.png', '/admin/artworks');
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')]
      .find(el => (el.textContent || '').includes('เพิ่มผลงาน'));
    if (button) button.click();
  });
  await delay(900);
  await page.screenshot({ path: path.join(OUT, 'admin_08_artwork_create_modal.png'), fullPage: true });
  console.log('captured admin_08_artwork_create_modal.png');
  await capture(page, 'admin_01_overview_a.png', '/admin');
  await capture(page, 'admin_04_submission_detail.png', `/admin/submissions/${ID.submission}`);
  await capture(page, 'admin_05_orders.png', '/admin/orders');
  await capture(page, 'admin_06_users.png', '/admin/users-management');
  await capture(page, 'admin_07_news.png', '/admin/news');

  // Artist pages
  await setAuth(page, ID.artist, 'Artist');
  await capture(page, 'artist_01_profile_a.png', '/artist/profile');
  await capture(page, 'artist_02_submissions.png', '/artist/submissions');
  await capture(page, 'artist_03_submission_detail.png', `/artist/submissions/${ID.submission}`);

  // Customer page
  await setAuth(page, ID.customer, 'Customer');
  await capture(page, 'cust_02_orders.png', '/user/order');

  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
