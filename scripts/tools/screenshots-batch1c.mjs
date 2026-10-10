import { chromium } from 'playwright'

const themes = ['dark', 'light']
const viewports = [
  { width: 390, height: 844, name: '390' },
  { width: 1280, height: 800, name: '1280' }
]

async function run() {
  const browser = await chromium.launch()
  for (const theme of themes) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
      const page = await context.newPage()
      
      await page.emulateMedia({ colorScheme: theme })
      await page.goto('http://localhost:5173/test/dashboard/v2')
      await page.waitForLoadState('load')
      // Wait for all animations
      await page.waitForTimeout(4000)

      try {
        const podium = page.locator('#results')
        await podium.screenshot({ path: `reviews/batch1c/podium_${theme}_${vp.name}.png` })
      } catch (e) {
        console.log('Could not capture podium')
      }

      try {
        const standings = page.locator('#standings')
        await standings.screenshot({ path: `reviews/batch1c/standings_${theme}_${vp.name}.png` })
      } catch (e) {
        console.log('Could not capture standings')
      }

      if (vp.name === '1280') {
        try {
          const logos = page.locator('#logo-row-test')
          await logos.screenshot({ path: `reviews/batch1c/all_logos_${theme}_${vp.name}.png` })
        } catch (e) {
          console.log('Could not capture logos')
        }
      }

      await context.close()
    }
  }
  await browser.close()
}

run().catch(console.error)
