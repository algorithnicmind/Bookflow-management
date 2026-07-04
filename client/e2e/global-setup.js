const { chromium } = require('@playwright/test')
const path = require('path')

const AUTH_FILE = path.resolve(__dirname, '.auth/user.json')

async function globalSetup() {
  const email = process.env.E2E_ADMIN_EMAIL || 'admin@demo.com'
  const password = process.env.E2E_ADMIN_PASSWORD || 'admin123'

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/login')
  await page.fill('input[type="email"], input[name="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('http://localhost:3000/dashboard', { timeout: 15000 })
  await page.context().storageState({ path: AUTH_FILE })
  await browser.close()
}

module.exports = globalSetup
