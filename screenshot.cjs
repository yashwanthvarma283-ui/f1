const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const widths = [390, 768, 1280, 1920];
  const url = 'http://127.0.0.1:4173/test/dashboard/v2';
  
  if (!fs.existsSync('F:/F1/screenshots/dashboard-v2-b')) {
    fs.mkdirSync('F:/F1/screenshots/dashboard-v2-b', { recursive: true });
  }

  for (const width of widths) {
    await page.setViewport({ width, height: 1080 });
    
    // Light mode
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pitwall_theme_mode', '"light"');
    });
    // Wait for animations
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `F:/F1/screenshots/dashboard-v2-b/v2-light-${width}.png`, fullPage: true });

    // Dark mode
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pitwall_theme_mode', '"dark"');
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: `F:/F1/screenshots/dashboard-v2-b/v2-dark-${width}.png`, fullPage: true });
  }

  await browser.close();
})();
