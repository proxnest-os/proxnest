#!/usr/bin/env node
/**
 * Take anonymized dashboard screenshots using Playwright.
 * Replaces real name and IPs with demo values.
 */
import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, '..', 'landing', 'public', 'screenshots');

const CLOUD_URL = 'https://cloud.proxnest.com';
const LOGIN_EMAIL = 'graysonmeyerstudio@icloud.com';
const LOGIN_PASSWORD = 'ProxNest2026!';

// Anonymization replacements
const REPLACEMENTS = [
  // Name variations
  ['Grayson Meyer', 'Alex Demo'],
  ['grayson meyer', 'Alex Demo'],
  ['graysonmeyerstudio@icloud.com', 'alex@example.com'],
  ['graysonmeyerstudio', 'alex'],
  ['Grayson', 'Alex'],
  ['Meyer', 'Demo'],
  // IP replacements
  [/192\.168\.50\.\d+/g, (match) => match.replace('192.168.50.', '10.0.1.')],
];

async function anonymizePage(page) {
  await page.evaluate((replacements) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      let text = node.textContent;
      // Replace IPs
      text = text.replace(/192\.168\.50\.(\d+)/g, '10.0.1.$1');
      // Replace names
      text = text.replace(/Grayson Meyer/gi, 'Alex Demo');
      text = text.replace(/graysonmeyerstudio@icloud\.com/g, 'alex@example.com');
      text = text.replace(/graysonmeyerstudio/g, 'alex');
      text = text.replace(/Grayson/g, 'Alex');
      text = text.replace(/Meyer/g, 'Demo');
      if (text !== node.textContent) node.textContent = text;
    }
    // Also check input values
    document.querySelectorAll('input, textarea').forEach(el => {
      if (el.value) {
        el.value = el.value.replace(/192\.168\.50\.(\d+)/g, '10.0.1.$1')
          .replace(/Grayson Meyer/gi, 'Alex Demo')
          .replace(/graysonmeyerstudio/g, 'alex');
      }
    });
  }, []);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login
  console.log('Logging in...');
  await page.goto(`${CLOUD_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', LOGIN_EMAIL);
  await page.fill('input[type="password"]', LOGIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // Navigate to server dashboard
  console.log('Navigating to server...');
  // Click "Open Dashboard" button
  const openDash = page.locator('text="Open Dashboard"').first();
  if (await openDash.isVisible().catch(() => false)) {
    await openDash.click();
    await page.waitForTimeout(4000);
  } else {
    // Try clicking the server name/card
    const serverLink = page.locator('a[href*="server"], [class*="server"]').first();
    if (await serverLink.isVisible().catch(() => false)) {
      await serverLink.click();
      await page.waitForTimeout(4000);
    }
  }
  
  // Debug: check current URL and available elements
  console.log('Current URL:', page.url());
  const pageTexts = await page.evaluate(() => {
    const els = document.querySelectorAll('button, [role="tab"], a, span');
    return Array.from(els).map(e => e.textContent?.trim()).filter(t => t && t.length < 30).slice(0, 40);
  });
  console.log('Page elements:', pageTexts);

  // Overview screenshot
  console.log('Taking Overview screenshot...');
  await anonymizePage(page);
  await page.screenshot({ path: join(SCREENSHOTS_DIR, 'ss-overview.png'), fullPage: false });
  await page.screenshot({ path: join(SCREENSHOTS_DIR, 'overview.png'), fullPage: false });
  console.log('✅ Overview');

  // Try clicking Fleet/Guests tab
  for (const tabName of ['Fleet', 'Guests', 'Containers']) {
    const tab = page.locator(`text="${tabName}"`).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(2000);
      await anonymizePage(page);
      await page.screenshot({ path: join(SCREENSHOTS_DIR, 'ss-fleet.png'), fullPage: false });
      console.log('✅ Fleet');
      break;
    }
  }

  // Debug: list all clickable elements
  const allTexts = await page.evaluate(() => {
    const els = document.querySelectorAll('button, [role="tab"], a, div[class*="tab"]');
    return Array.from(els).map(e => e.textContent?.trim()).filter(Boolean).slice(0, 30);
  });
  console.log('Available tabs/buttons:', allTexts);

  // Try all tabs by clicking them  
  const allTabs = await page.locator('button, [role="tab"], a').all();
  for (const tab of allTabs) {
    const text = await tab.textContent().catch(() => '');
    const lower = (text || '').toLowerCase().trim();
    
    if (lower.includes('system') || lower.includes('hardware') || lower.includes('resource')) {
      await tab.click().catch(() => {});
      await page.waitForTimeout(2000);
      await anonymizePage(page);
      await page.screenshot({ path: join(SCREENSHOTS_DIR, 'ss-system.png'), fullPage: false });
      console.log('✅ System');
    }
    
    if (lower.includes('storage') || lower.includes('disk')) {
      await tab.click().catch(() => {});
      await page.waitForTimeout(2000);
      await anonymizePage(page);
      await page.screenshot({ path: join(SCREENSHOTS_DIR, 'ss-storage.png'), fullPage: false });
      console.log('✅ Storage');
    }

    if (lower.includes('app') && lower.includes('store') || lower.includes('marketplace')) {
      await tab.click().catch(() => {});
      await page.waitForTimeout(2000);
      await anonymizePage(page);
      await page.screenshot({ path: join(SCREENSHOTS_DIR, 'ss-apps.png'), fullPage: false });
      console.log('✅ Apps');
    }
  }

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
