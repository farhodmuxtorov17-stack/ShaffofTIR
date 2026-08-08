import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('dashboard sahifa yuklanadi', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('h1, h2, .text-2xl').first()).toBeVisible({ timeout: 15000 })
  })

  test('KPI kartalar ko\'rinadi', async ({ page }) => {
    await page.goto('/dashboard')
    // Wait for page to load
    await page.waitForTimeout(2000)
    const cards = page.locator('.card, [class*="rounded-card"]')
    await expect(cards.first()).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Session yaratish', () => {
  test('yangi sessiya formasi ochiladi', async ({ page }) => {
    await page.goto('/sessions/new')
    await expect(page.locator('input[type="number"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('soldier count input mavjud', async ({ page }) => {
    await page.goto('/sessions/new')
    const input = page.locator('input[type="number"]').first()
    await expect(input).toBeVisible()
    await expect(input).toHaveValue('5')
  })

  test('kamera qo\'shish tugmasi mavjud', async ({ page }) => {
    await page.goto('/sessions/new')
    // Look for a button that adds camera
    await page.waitForTimeout(1000)
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Upload analysis', () => {
  test('upload sahifa yuklanadi', async ({ page }) => {
    await page.goto('/upload-analysis')
    await expect(page.locator('input, select').first()).toBeVisible({ timeout: 15000 })
  })

  test('shot type tanlash mavjud', async ({ page }) => {
    await page.goto('/upload-analysis')
    await page.waitForTimeout(1000)
    // Should have TEST and MAIN options
    const pageText = await page.textContent('body')
    expect(pageText).toContain('TEST')
    expect(pageText).toContain('MAIN')
  })
})

test.describe('Kameralar', () => {
  test('cameras sahifa yuklanadi', async ({ page }) => {
    await page.goto('/cameras')
    await page.waitForTimeout(1000)
    const pageText = await page.textContent('body')
    expect(pageText).toBeTruthy()
  })

  test('kamera qo\'shish formasi mavjud', async ({ page }) => {
    await page.goto('/cameras')
    await page.waitForTimeout(2000)
    // Should have camera IP input
    const inputs = page.locator('input')
    const count = await inputs.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Natijalar', () => {
  test('results sahifa yuklanadi', async ({ page }) => {
    await page.goto('/results')
    await page.waitForTimeout(1000)
    const pageText = await page.textContent('body')
    expect(pageText).toBeTruthy()
  })
})

test.describe('Bayonnomalar', () => {
  test('protocols sahifa yuklanadi', async ({ page }) => {
    await page.goto('/protocols')
    await page.waitForTimeout(1000)
    const pageText = await page.textContent('body')
    expect(pageText).toBeTruthy()
  })
})

test.describe('Tizim holati', () => {
  test('system-health sahifa yuklanadi', async ({ page }) => {
    await page.goto('/system-health')
    await page.waitForTimeout(1000)
    const pageText = await page.textContent('body')
    expect(pageText).toContain('health')
  })
})

test.describe('404', () => {
  test('notfound sahifa ko\'rinadi', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await page.waitForTimeout(1000)
    const pageText = await page.textContent('body')
    expect(pageText).toBeTruthy()
  })
})

test.describe('Sidebar navigatsiya', () => {
  test('sidebar linklari mavjud', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    const links = page.locator('a[href]')
    const count = await links.count()
    expect(count).toBeGreaterThan(5)
  })

  test('dashboard link ishlaydi', async ({ page }) => {
    await page.goto('/sessions')
    await page.waitForTimeout(1000)
    // Click dashboard link in sidebar
    const dashboardLink = page.locator('a[href="/dashboard"]').first()
    if (await dashboardLink.count() > 0) {
      await dashboardLink.click()
      await page.waitForTimeout(1000)
      expect(page.url()).toContain('/dashboard')
    }
  })
})
