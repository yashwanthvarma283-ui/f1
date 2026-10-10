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
      
      // Force theme by overriding prefers-color-scheme or localStorage if needed
      await page.emulateMedia({ colorScheme: theme })
      await page.goto('http://localhost:5175/test/dashboard/v2')
      await page.waitForLoadState('load')
      // Wait a bit for animations
      await page.waitForTimeout(2000)

      // Podium
      try {
        const podium = page.locator('#results')
        await podium.screenshot({ path: `screenshots/batch1/podium_${theme}_${vp.name}.png` })
      } catch (e) {
        console.log('Could not capture podium')
      }

      // Standings
      try {
        const standings = page.locator('#standings')
        await standings.screenshot({ path: `screenshots/batch1/standings_${theme}_${vp.name}.png` })
      } catch (e) {
        console.log('Could not capture standings')
      }

      // Footer
      try {
        const footer = page.locator('footer')
        await footer.screenshot({ path: `screenshots/batch1/footer_${theme}_${vp.name}.png` })
      } catch (e) {
        console.log('Could not capture footer')
      }

      await context.close()
    }
  }
  await browser.close()
}

run().catch(console.error)
