const fs = require('fs');
const { test, expect } = require('@playwright/test');

async function openTab(page, name) {
  await page.locator('.gt-tabs').getByRole('button', { name, exact: true }).click();
}

async function openGolf(page) {
  await page.goto('/golf.html');
  await expect(page.getByRole('heading', { name: 'Golf Shot Tracker' })).toBeVisible();
}

async function loadExampleData(page) {
  await openTab(page, 'Settings');
  await page.getByRole('button', { name: 'Load Example Data' }).click();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function clickPill(page, container, label) {
  await page.locator(container).locator('.gt-pill').filter({ hasText: new RegExp(`^${escapeRegExp(label)}$`) }).click();
}

async function clickDpad(page, value) {
  await page.locator(`.gt-dpad-btn[data-value="${value}"]`).click();
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

  test('autofills distance from hole length for a new hole without overwriting manual edits', async ({ page }) => {
    await openGolf(page);

    await page.locator('#gt-hole').fill('1');
    await page.locator('#gt-hole').dispatchEvent('input');
    await page.locator('#gt-hole-length').fill('375');
    await page.locator('#gt-hole-length').dispatchEvent('input');
    await expect(page.locator('#gt-distance')).toHaveValue('375');

    await page.locator('#gt-distance').fill('360');
    await page.locator('#gt-hole-length').fill('390');
    await page.locator('#gt-hole-length').dispatchEvent('input');
    await expect(page.locator('#gt-distance')).toHaveValue('360');
  });

  test('committed hole length picks a long club instead of a wedge from partial typing', async ({ page }) => {
    await openGolf(page);
    await loadExampleData(page);

    await openTab(page, 'Log');
    await page.locator('#gt-hole').fill('1');
    await page.locator('#gt-hole').dispatchEvent('input');
    await page.locator('#gt-hole-length').fill('433');
    await page.locator('#gt-hole-length').dispatchEvent('change');

    await expect(page.locator('#gt-distance')).toHaveValue('433');
    await expect(page.locator('#gt-club-pills .gt-pill.selected')).toHaveText('Driver');
    await expect(page.locator('#gt-dist-hint')).toContainText('Driver');
  });

  test('autofills end distance and end lie from the selected club stock distance', async ({ page }) => {
    await openGolf(page);
    await loadExampleData(page);

    await openTab(page, 'Log');
    await page.locator('#gt-hole').fill('1');
    await page.locator('#gt-hole').dispatchEvent('input');
    await page.locator('#gt-distance').fill('410');
    await page.locator('#gt-distance').dispatchEvent('input');
    await clickPill(page, '#gt-club-pills', 'Driver');
    await expect(page.locator('#gt-end-distance')).toHaveValue('182');
    await expect(page.locator('#gt-endLie')).toHaveValue('Fairway');

    await page.locator('#gt-distance').fill('150');
    await page.locator('#gt-distance').dispatchEvent('input');
    await clickPill(page, '#gt-club-pills', '7I');
    await expect(page.locator('#gt-end-distance')).toHaveValue('9');
    await expect(page.locator('#gt-endLie')).toHaveValue('Green');
  });

  test('autoselected club also autofills end distance and end lie', async ({ page }) => {
    await openGolf(page);
    await loadExampleData(page);

    await openTab(page, 'Log');
    await page.locator('#gt-hole').fill('1');
    await page.locator('#gt-hole').dispatchEvent('input');
    await page.locator('#gt-distance').fill('150');
    await page.locator('#gt-distance').dispatchEvent('change');

    await expect(page.locator('#gt-club-pills .gt-pill.selected')).toHaveText('6I');
    await expect(page.locator('#gt-end-distance')).toHaveValue('1');
    await expect(page.locator('#gt-endLie')).toHaveValue('Green');
  });

  test('defaults result to on target unless a direction is explicitly selected', async ({ page }) => {
    await openGolf(page);
    await expect(page.locator('.gt-dpad-btn.selected')).toContainText('On Target');

    await page.locator('#gt-hole').fill('1');
    await page.locator('#gt-hole').dispatchEvent('input');
    await page.locator('#gt-distance').fill('150');
    await clickPill(page, '#gt-club-pills', '7I');
    await page.locator('#gt-end-distance').fill('12');
    await clickPill(page, '#gt-end-lie-pills', 'Green');
    await page.getByRole('button', { name: 'Save Shot' }).click();

    await openTab(page, 'History');
    await expect(page.locator('#gt-history-body')).toContainText('On Target');

    await openTab(page, 'Log');
    await page.locator('#gt-end-distance').fill('8');
    await clickPill(page, '#gt-end-lie-pills', 'Green');
    await clickDpad(page, 'Right');
    await page.getByRole('button', { name: 'Save Shot' }).click();

    await openTab(page, 'History');
    await expect(page.locator('#gt-history-body')).toContainText('Right');
  });

  test('creates a course and round from the log flow, then prefills the next shot', async ({ page }) => {
    await openGolf(page);

    await page.selectOption('#gt-course-ctx', '__new__');
    await page.locator('#gt-new-course-inline').fill('North Test Links');
    await page.locator('#gt-hole').fill('1');
    await page.locator('#gt-hole').dispatchEvent('input');
    await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Tee');

    await page.locator('#gt-par').fill('4');
    await page.locator('#gt-hole-length').fill('410');
    await clickPill(page, '#gt-club-pills', 'Driver');
    await clickDpad(page, 'On Target');
    await page.locator('#gt-end-distance').fill('155');
    await clickPill(page, '#gt-end-lie-pills', 'Fairway');
    await page.getByRole('button', { name: 'Save Shot' }).click();

    await expect(page.locator('#gt-notice')).toContainText('Shot saved!');
    await expect(page.locator('#gt-round-ctx-label')).toContainText('1 shot this round');
    await expect(page.locator('#gt-hole')).toHaveValue('1');
    await expect(page.locator('#gt-distance')).toHaveValue('155');
    await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Fairway');
    await expect(page.locator('#gt-shot-status')).toContainText('Shot 2');

    await openTab(page, 'Rounds');
    await expect(page.locator('#gt-rounds-list')).toContainText('North Test Links');

    await openTab(page, 'Settings');
    await expect(page.locator('#gt-courses-list')).toContainText('North Test Links');
  });

  test('moves to the next hole with a tee lie after a holed shot', async ({ page }) => {
    await openGolf(page);

    await page.locator('#gt-hole').fill('1');
    await page.locator('#gt-hole').dispatchEvent('input');
    await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Tee');

    await page.locator('#gt-par').fill('3');
    await page.locator('#gt-hole-length').fill('150');
    await clickPill(page, '#gt-club-pills', '7I');
    await clickDpad(page, 'On Target');
    await page.locator('#gt-end-distance').fill('0');
    await clickPill(page, '#gt-end-lie-pills', 'Holed');
    await page.getByRole('button', { name: 'Save Shot' }).click();

    await expect(page.locator('#gt-hole')).toHaveValue('2');
    await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Tee');
    await expect(page.locator('#gt-shot-status')).toContainText('moving to hole 2');
  });

  test('autofills par and tee length from the selected course and tee', async ({ page }) => {
    await openGolf(page);
    await loadExampleData(page);

    await openTab(page, 'Log');
    await page.selectOption('#gt-course-ctx', { label: 'Riverbend Parkland' });
    await page.selectOption('#gt-tee-ctx', 'White');
    await page.locator('#gt-hole').fill('1');
    await page.locator('#gt-hole').dispatchEvent('input');

    await expect(page.locator('#gt-par')).toHaveValue('4');
    await expect(page.locator('#gt-hole-length')).toHaveValue('342');
    await expect(page.locator('#gt-distance')).toHaveValue('342');
    await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Tee');

    await page.selectOption('#gt-tee-ctx', 'Blue');
    await expect(page.locator('#gt-hole-length')).toHaveValue('364');
    await expect(page.locator('#gt-distance')).toHaveValue('364');
  });

  test('uses saved stock distances and the wedge matrix to auto-select clubs', async ({ page }) => {
    await openGolf(page);
    await loadExampleData(page);

    await openTab(page, 'Log');

    await page.locator('#gt-distance').fill('228');
    await page.locator('#gt-distance').dispatchEvent('change');
    await expect(page.locator('#gt-club-pills .gt-pill.selected')).toHaveText('Driver');
    await expect(page.locator('#gt-dist-hint')).toContainText('Driver');

    await page.locator('#gt-distance').fill('67');
    await page.locator('#gt-distance').dispatchEvent('change');
    await expect(page.locator('#gt-club-pills .gt-pill.selected')).toHaveText('SW');
    await expect(page.locator('#gt-swing-pills .gt-pill.selected')).toHaveText('¾');
    await expect(page.locator('#gt-dist-hint')).toContainText('SW ¾');
  });

  test('loads example data and populates key views', async ({ page }) => {
    await openGolf(page);

    await loadExampleData(page);

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

  test('shows indoor fixed-putting rounds and supports stats date filtering', async ({ page }) => {
    await openGolf(page);
    await loadExampleData(page);

    await openTab(page, 'Rounds');
    const indoorRound = page.locator('#gt-rounds-list .gt-round-card').filter({ hasText: '2026-03-16' });
    await expect(indoorRound).toContainText('INDOOR');
    await indoorRound.getByRole('button', { name: 'Scorecard' }).click();
    await expect(page.locator('#gt-scorecard-content')).toContainText('Fixed putting (simulator)');

    await openTab(page, 'Stats');
    await page.getByRole('button', { name: 'Indoor' }).click();
    await expect(page.locator('#gt-stats-content')).toContainText('Traditional Stats (3 holes from 1 round)');
    await expect(page.locator('#gt-stats-content')).toContainText('SG vs Target HCP 8');

    await page.locator('#gt-stats-from').fill('2026-03-17');
    await page.locator('#gt-stats-to').fill('2026-03-17');
    await expect(page.locator('#gt-stats-content')).toContainText('No shots for this filter');
  });

  test('exports JSON and imports it back from settings', async ({ page }) => {
    await openGolf(page);

    await page.locator('#gt-hole').fill('1');
    await page.locator('#gt-hole').dispatchEvent('input');
    await page.locator('#gt-par').fill('4');
    await page.locator('#gt-hole-length').fill('380');
    await clickPill(page, '#gt-club-pills', 'Driver');
    await clickDpad(page, 'Right');
    await page.locator('#gt-end-distance').fill('140');
    await clickPill(page, '#gt-end-lie-pills', 'Rough');
    await page.getByRole('button', { name: 'Save Shot' }).click();

    await openTab(page, 'Settings');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download JSON' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('golf-shots.json');
    const downloadPath = await download.path();
    const json = fs.readFileSync(downloadPath, 'utf8');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Reset Tracker' }).click();
    await expect(page.locator('#gt-courses-list')).toContainText('No courses added yet.');

    await page.locator('#gt-import-area').fill(json);
    await page.getByRole('button', { name: 'Import from text area' }).click();

    await openTab(page, 'History');
    await expect(page.locator('#gt-history-body')).toContainText('Driver');
    await expect(page.locator('#gt-history-body')).toContainText('Right');
  });

  test('resets tracker after loading example data', async ({ page }) => {
    await openGolf(page);

    await loadExampleData(page);
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
