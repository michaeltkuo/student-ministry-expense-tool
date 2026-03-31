import { expect, test } from '@playwright/test'

test('student can submit a receipt end-to-end', async ({ page }) => {
  await page.route('**/api/process-receipt', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        vendor: 'Mock Vendor',
        date: '2026-03-31',
        amount: 18.5,
        currency: 'USD',
        category: 'Supplies & Materials',
        description: 'Mock extracted receipt',
      }),
    })
  })

  await page.goto('/')

  await page.locator('select').first().selectOption({ index: 1 })
  await page.getByPlaceholder('Enter your full name').fill('Playwright Student')
  await page.getByRole('button', { name: 'Next' }).click()

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'receipt.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
  })

  await page.getByRole('button', { name: 'Process Receipt' }).click()
  await expect(page.getByText('Review and edit the extracted information below:')).toBeVisible()

  await page.getByPlaceholder('Store or restaurant name').fill('E2E Vendor')
  await page.getByPlaceholder('0.00').fill('18.50')
  await page.getByPlaceholder('Brief description of the purchase').fill('E2E test receipt')

  await page.getByRole('button', { name: 'Submit Receipt' }).click()

  await expect(page.getByText('Receipt Submitted!')).toBeVisible()
})
