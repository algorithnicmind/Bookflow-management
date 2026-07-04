const { test, expect } = require('@playwright/test')

test.describe('Smoke Tests', () => {

  test('1. Login page loads and accepts credentials', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1, .page-title').first()).toBeVisible({ timeout: 10000 })
    await page.fill('input[type="email"], input[name="email"]', process.env.E2E_ADMIN_EMAIL || 'admin@demo.com')
    await page.fill('input[type="password"]', process.env.E2E_ADMIN_PASSWORD || 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await expect(page.locator('.page-container')).toBeVisible()
  })

  test('2. Apply leave flow', async ({ page }) => {
    await page.goto('/apply-leave')
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 })
    await page.selectOption('select', 'casual')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)
    const fmt = (d) => d.toISOString().split('T')[0]
    await page.fill('input[type="date"]', fmt(tomorrow))
    const dateInputs = page.locator('input[type="date"]')
    await dateInputs.nth(1).fill(fmt(dayAfter))
    await page.fill('textarea', 'E2E test leave request')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=successfully')).toBeVisible({ timeout: 10000 })
  })

  test('3. View pending approvals', async ({ page }) => {
    await page.goto('/pending-requests')
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 })
    const table = page.locator('table, .empty-state')
    await expect(table.first()).toBeVisible({ timeout: 10000 })
  })

  test('4. View audit logs', async ({ page }) => {
    await page.goto('/audit-logs')
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 })
    const table = page.locator('table, .empty-state')
    await expect(table.first()).toBeVisible({ timeout: 10000 })
  })

  test('5. Org reports page loads', async ({ page }) => {
    await page.goto('/organization-reports')
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.loading-screen, .page-container')).toBeVisible({ timeout: 15000 })
  })
})
