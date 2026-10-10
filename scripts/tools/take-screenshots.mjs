import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const outDir = path.resolve('screenshots/batch2b');
  fs.mkdirSync(outDir, { recursive: true });

  const capture = async (filename) => {
    // wait for animations to settle
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, filename), fullPage: true });
  };

  const captureHaas = async (filename) => {
    // Find Haas row in standings and screenshot it
    await page.waitForTimeout(2000);
    const haasRow = page.locator('text=Hulkenberg').locator('xpath=./ancestor::div[contains(@class, "group relative")]').first();
    if (await haasRow.isVisible()) {
      await haasRow.screenshot({ path: path.join(outDir, filename) });
    } else {
      console.log('Haas row not found for', filename);
    }
  };

  const captureHero = async (filename) => {
    await page.waitForTimeout(1000);
    const hero = page.locator('#hero').first();
    if (await hero.isVisible()) {
      await hero.screenshot({ path: path.join(outDir, filename) });
    }
  };

  // Dark theme
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('http://localhost:5173/test/dashboard');
  await page.waitForSelector('section');
  await page.waitForTimeout(2000); // Give fonts and images time to load
  
  await page.setViewportSize({ width: 1280, height: 720 });
  await capture('desktop_1280_dark.png');
  await captureHaas('haas_row_dark.png');
  await captureHero('hero_24h_dark.png'); // Default is 24h

  // Click timezone toggle to switch to 12h
  const tzButton = page.locator('button[aria-label^="Change timezone"]').first();
  if (await tzButton.isVisible()) {
    await tzButton.click();
    await page.waitForTimeout(500);
    const btn12h = page.locator('button:has-text("12h")').first();
    if (await btn12h.isVisible()) {
      await btn12h.click();
      await page.waitForTimeout(500);
      // click close or press escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await captureHero('hero_12h_dark.png');
    }
  }

  // Switch to light theme
  // We can just use the theme toggle in the UI
  const themeToggle = page.locator('button[aria-label="Toggle theme"]').first();
  if (await themeToggle.isVisible()) {
    await themeToggle.click();
  } else {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload({ waitUntil: 'networkidle' });
  }

  await capture('desktop_1280_light.png');
  await captureHaas('haas_row_light.png');

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await capture('mobile_390_light.png');
  
  // switch back to dark on mobile
  if (await themeToggle.isVisible()) {
    await themeToggle.click();
  }
  await capture('mobile_390_dark.png');

  await browser.close();
  console.log('Screenshots captured successfully.');
})();
