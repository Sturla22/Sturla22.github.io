const { test, expect } = require('@playwright/test');

async function openTab(page, name) {
  await page.locator('.gt-tabs').getByRole('button', { name, exact: true }).click();
}

async function openGolf(page) {
  await page.goto('/golf.html');
  await expect(page.getByRole('heading', { name: 'Golf Shot Tracker' })).toBeVisible();
}

test.describe('Golf tracker', () => {
  test('renders with empty-state content', async ({ page }) => {
    await openGolf(page);

    await openTab(page, 'Settings');
    await expect(page.getByRole('button', { name: 'Load Example Data' })).toBeVisible();
    await expect(page.getByText('No rounds yet')).toBeHidden();

    await openTab(page, 'Rounds');
    await expect(page.getByText('No rounds yet')).toBeVisible();
  });

  test('loads example data and populates key views', async ({ page }) => {
    await openGolf(page);

    await openTab(page, 'Settings');
    await page.getByRole('button', { name: 'Load Example Data' }).click();

    await expect(page.locator('#gt-courses-list')).toContainText('Riverbend Parkland');
    await expect(page.locator('#gt-courses-list')).toContainText('Studio Sim Championship');

    await openTab(page, 'Rounds');
    await expect(page.locator('#gt-rounds-list')).toContainText('2026-03-12');
    await expect(page.locator('#gt-rounds-list')).toContainText('2026-03-16');

    await openTab(page, 'History');
    await expect(page.locator('#gt-history-count')).toContainText('Showing');
    await expect(page.locator('#gt-history-body')).toContainText('Indoor session opener');

    await openTab(page, 'Stats');
    await expect(page.locator('#gt-stats-content')).toContainText('Total shots');
    await expect(page.locator('#gt-stats-content')).toContainText('Strokes Gained vs Scratch');
    await expect(page.locator('#gt-stats-content')).toContainText('SG vs Target HCP 10');
  });

  test('resets tracker after loading example data', async ({ page }) => {
    await openGolf(page);

    await openTab(page, 'Settings');
    await page.getByRole('button', { name: 'Load Example Data' }).click();
    await expect(page.locator('#gt-courses-list')).toContainText('Riverbend Parkland');

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Reset Tracker' }).click();

    await expect(page.locator('#gt-courses-list')).toContainText('No courses added yet.');
    await expect(page.locator('#gt-hcp')).toHaveValue('');
    await expect(page.locator('#gt-fixed-putting')).not.toBeChecked();

    await openTab(page, 'Rounds');
    await expect(page.getByText('No rounds yet')).toBeVisible();
  });
});
