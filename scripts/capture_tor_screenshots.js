const path = require('path');
const fs = require('fs');
const puppeteer = require(path.join(__dirname, '..', 'backend', 'node_modules', 'puppeteer'));
const jwt = require(path.join(__dirname, '..', 'backend', 'node_modules', 'jsonwebtoken'));

const BASE = 'http://127.0.0.1:8080';
const OUT = path.join(__dirname, '..', 'docs', 'tor', 'screenshots');
const SECRET = 'jwt-secret-key-change-this-in-production';
const ID = {
  admin: '6a351d6ef794b013802b62eb',
  artist: '6a3a0974253bcd3d80886e50',
  customer: '6a38fa6edd960f514022c4d9',
  artwork: '6a38e66f8a3d1a8dcce2f4ef',
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

async function capture(page, name, url, wait = 3500) {
  await page.goto(BASE + url, { waitUntil: 'networkidle2', timeout: 45000 });
  await delay(wait);
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log(`captured ${name}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'], defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 } });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'th-TH,th' });
  await setAuth(page, ID.admin, 'Admin');
  await capture(page, 'current_admin_submissions.png', '/admin/submissions');
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').includes('จัดการการขายหลังครบ'));
    if (button) button.click();
  });
  await delay(1600);
  await page.screenshot({ path: path.join(OUT, 'current_admin_post_term_queue.png'), fullPage: true });
  console.log('captured current_admin_post_term_queue.png');
  await capture(page, 'current_admin_artworks.png', '/admin/artworks');
  await setAuth(page, ID.artist, 'Artist');
  await capture(page, 'current_artist_profile.png', '/artist/profile');
  await capture(page, 'current_artist_submissions.png', '/artist/submissions');
  await setAuth(page, ID.customer, 'Customer');
  await capture(page, 'current_artwork_detail.png', `/artwork/${ID.artwork}`);
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
