import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const viewports = [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 }
  ];

  await page.goto('http://localhost:5173/test/dashboard');
  await page.waitForSelector('section');
  await page.waitForTimeout(1000);

  for (const vp of viewports) {
    await page.setViewportSize(vp);
    await page.waitForTimeout(500);

    const measurements = await page.evaluate(() => {
      const getBottomEdge = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom;
      };
      
      const getTopEdge = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.top;
      };

      const sections = Array.from(document.querySelectorAll('section'));
      const footer = document.querySelector('footer');
      
      const results = [];
      for (let i = 0; i < sections.length - 1; i++) {
        const current = sections[i];
        const next = sections[i + 1];
        
        // Find last content element of current section (ignoring paddings)
        // A simple way is to find the bottom-most child
        const currentChildren = Array.from(current.querySelectorAll('*')).filter(el => el.getBoundingClientRect().height > 0);
        let maxBottom = getBottomEdge(current);
        if (currentChildren.length > 0) {
          maxBottom = Math.max(...currentChildren.map(getBottomEdge));
        }

        // Find heading of next section
        const nextHeading = next.querySelector('h1, h2, h3, h4, h5, h6, .dv2-heading, [class*="text-["]'); // approximate
        let nextTop = getTopEdge(next);
        if (nextHeading) {
          nextTop = getTopEdge(nextHeading);
        } else {
          const nextChildren = Array.from(next.querySelectorAll('*')).filter(el => el.getBoundingClientRect().height > 0);
          if (nextChildren.length > 0) {
            nextTop = Math.min(...nextChildren.map(getTopEdge));
          }
        }

        results.push({
          from: current.id || `Section ${i+1}`,
          to: next.id || `Section ${i+2}`,
          distance: Math.round(nextTop - maxBottom)
        });
      }

      if (sections.length > 0 && footer) {
        const lastSection = sections[sections.length - 1];
        const currentChildren = Array.from(lastSection.querySelectorAll('*')).filter(el => el.getBoundingClientRect().height > 0);
        let maxBottom = getBottomEdge(lastSection);
        if (currentChildren.length > 0) {
          maxBottom = Math.max(...currentChildren.map(getBottomEdge));
        }
        
        // first visible child of footer
        const footerChildren = Array.from(footer.querySelectorAll('*')).filter(el => el.getBoundingClientRect().height > 0);
        let footerTop = getTopEdge(footer);
        if (footerChildren.length > 0) {
          footerTop = Math.min(...footerChildren.map(getTopEdge));
        }

        results.push({
          from: lastSection.id || 'Last Section',
          to: 'Footer',
          distance: Math.round(footerTop - maxBottom)
        });
      }

      return results;
    });

    console.log(`\nViewport: ${vp.width}x${vp.height}`);
    console.table(measurements);
  }

  await browser.close();
})();
