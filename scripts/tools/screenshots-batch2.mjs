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
      
      // Navigate to the test page and apply theme
      // 5173 is the port where dev server is running currently in background
      await page.goto('http://localhost:5173/test/dashboard/v2')
      await page.waitForLoadState('load')
      
      // Ensure theme is set correctly by clicking theme toggle if needed, or by setting localStorage
      await page.evaluate((t) => {
        localStorage.setItem('pitwall_theme_mode', t)
        if (t === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      }, theme)

      // Wait for all animations
      await page.waitForTimeout(2000)

      try {
        const hero = page.locator('#next-race')
        await hero.screenshot({ path: `reviews/batch2/hero_${theme}_${vp.name}.png` })
      } catch (e) {
        console.log('Could not capture hero')
      }

      try {
        const podium = page.locator('#results')
        await podium.screenshot({ path: `reviews/batch2/podium_${theme}_${vp.name}.png` })
      } catch (e) {
        console.log('Could not capture podium')
      }

      try {
        const standings = page.locator('#standings')
        await standings.screenshot({ path: `reviews/batch2/standings_${theme}_${vp.name}.png` })
      } catch (e) {
        console.log('Could not capture standings')
      }

      await context.close()
    }
  }
  await browser.close()
}

run().catch(console.error)
