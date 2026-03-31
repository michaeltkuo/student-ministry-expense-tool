import { expect, test } from '@playwright/test'

test('admin can log in and manage ministries', async ({ page }) => {
  await page.goto('/admin/login')

  await page.getByPlaceholder('Enter admin password').fill('changeme')
  await page.getByRole('button', { name: 'Sign In' }).click()

  await expect(page.getByRole('heading', { name: 'Expense Submissions' })).toBeVisible()

  await page.getByRole('link', { name: 'Ministries' }).click()
  await expect(page.getByRole('heading', { name: 'Ministries' })).toBeVisible()

  const uniqueName = `Playwright Ministry ${Date.now()}`
  await page.getByPlaceholder('Ministry name').fill(uniqueName)
  await page.getByRole('button', { name: 'Add' }).click()

  await expect(page.getByText(uniqueName)).toBeVisible()
})
