const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:5173/test/dashboard');
  await page.waitForTimeout(2000); // let it load
  
  // Dump all grid classes and their texts
  const grids = await page.locator('.grid.grid-cols-\\[20px_1fr\\]').all();
  for (let i=0; i<grids.length; i++) {
    const children = await grids[i].locator('>*').all();
    console.log(`Grid ${i} (default):`);
    for (let j=0; j<children.length; j++) {
      const cbox = await children[j].boundingBox();
      const text = await children[j].innerText();
      console.log(`  y: ${cbox?.y} h: ${cbox?.height} text: ${text.replace(/\n/g, ' ')}`);
    }
  }
  
  // Click constructors!
  // Find the button with exact text "constructors"
  const btns = await page.locator('button').all();
  for (let b of btns) {
    if ((await b.innerText()).trim().toLowerCase() === 'constructors') {
      await b.click();
      break;
    }
  }
  await page.waitForTimeout(2000);
  
  const cgrids = await page.locator('.grid.grid-cols-\\[20px_1fr\\]').all();
  for (let i=0; i<3; i++) { // just first 3
    const children = await cgrids[i].locator('>*').all();
    console.log(`Grid ${i} (constructors):`);
    for (let j=0; j<children.length; j++) {
      const cbox = await children[j].boundingBox();
      const text = await children[j].innerText();
      console.log(`  y: ${cbox?.y} h: ${cbox?.height} text: ${text.replace(/\n/g, ' ')}`);
    }
  }
  
  await browser.close();
})();
