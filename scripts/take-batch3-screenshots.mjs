import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function takeScreenshots() {
  const outDir = path.join(__dirname, '..', 'screenshots', 'batch3');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch();
  
  // Wait for the server to be up
  console.log('Taking screenshots of /test/dashboard...');
  
  const viewports = [
    { width: 390, height: 844, name: '390' },
    { width: 1280, height: 800, name: '1280' }
  ];
  
  const themes = ['light', 'dark'];

  for (const theme of themes) {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme
      });
      
      const page = await context.newPage();
      
      // Inject theme class on documentElement directly if needed, or rely on colorScheme
      await page.goto('http://localhost:5173/test/dashboard', { waitUntil: 'networkidle' });
      
      // Force theme by evaluating
      await page.evaluate((t) => {
        if (t === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, theme);
      
      // Wait for animations to finish
      await page.waitForTimeout(1500); 
      
      const file = path.join(outDir, `dashboard-${vp.name}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`Saved ${file}`);
      
      await context.close();
    }
  }

  await browser.close();
  console.log('Screenshots complete.');
}

takeScreenshots().catch(console.error);
