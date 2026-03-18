const fs = require('fs');
const { test, expect } = require('@playwright/test');

async function openTab(page, name) {
  await page.locator('.gt-tabs').getByRole('button', { name, exact: true }).click();
}

async function openGolf(page) {
  await page.goto('/golf.html');
  await expect(page.getByRole('heading', { name: 'Golf Shot Tracker' })).toBeVisible();
}

async function openLog(page) {
  await openTab(page, 'Log');
}

async function openSettings(page) {
  await openTab(page, 'Settings');
}

async function loadExampleData(page) {
  const exampleJson = fs.readFileSync('assets/data/golf-example-data.json', 'utf8');
  await openSettings(page);
  await page.locator('#gt-import-area').evaluate(function (el, value) { el.value = value; }, exampleJson);
  await page.getByRole('button', { name: 'Import from text area' }).click();
  await expect(page.locator('#gt-notice')).toContainText('Imported tracker bundle');
}

async function startNewCourseRound(page, courseName) {
  await page.selectOption('#gt-course-ctx', '__new__');
  await page.locator('#gt-new-course-inline').fill(courseName);
}

async function resetTracker(page) {
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset Tracker' }).click();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exactTextMatcher(value) {
  return new RegExp(`^${escapeRegExp(value)}$`);
}

async function clickPill(page, container, label) {
  await page.locator(container).locator('.gt-pill').filter({ hasText: exactTextMatcher(label) }).click();
}

async function clickDpad(page, value) {
  await page.locator(`.gt-dpad-btn[data-value="${value}"]`).click();
}

async function setHole(page, hole) {
  await page.locator('#gt-hole').fill(String(hole));
  await page.locator('#gt-hole').dispatchEvent('input');
}

async function setDistance(page, distance, mode) {
  await page.locator('#gt-distance').fill(String(distance));
  await page.locator('#gt-distance').dispatchEvent(mode === 'commit' ? 'change' : 'input');
}

async function saveShot(page, details) {
  if (details.hole != null) await setHole(page, details.hole);
  if (details.par != null) await page.locator('#gt-par').fill(String(details.par));
  if (details.holeLength != null) {
    await page.locator('#gt-hole-length').fill(String(details.holeLength));
    await page.locator('#gt-hole-length').dispatchEvent('change');
  }
  if (details.distance != null) {
    await setDistance(page, details.distance, details.autoSelect ? 'commit' : 'input');
  }
  if (details.club) await clickPill(page, '#gt-club-pills', details.club);
  if (details.swing) await clickPill(page, '#gt-swing-pills', details.swing);
  if (details.result) await clickDpad(page, details.result);
  if (details.endDistance != null) await page.locator('#gt-end-distance').fill(String(details.endDistance));
  if (details.endLie) await clickPill(page, '#gt-end-lie-pills', details.endLie);
  await page.getByRole('button', { name: 'Save Shot' }).click();
}

test.describe('Golf tracker', () => {
  test.describe('Setup and empty state', () => {
    test('renders with empty-state content', async ({ page }) => {
      await openGolf(page);

      await openSettings(page);
      await expect(page.locator('a[href="/assets/data/golf-example-data.json"]')).toBeVisible();
      await expect(page.locator('#gt-bag-pills .gt-pill.selected')).toHaveCount(16);
      await expect(page.getByText('No rounds yet')).toBeHidden();

      await openTab(page, 'Rounds');
      await expect(page.getByText('No rounds yet')).toBeVisible();
    });

    test('falls back to all clubs when stored settings have an empty bag', async ({ page }) => {
      await page.addInitScript(function () {
        localStorage.setItem('gt_settings_v1', JSON.stringify({ bag: [] }));
      });

      await openGolf(page);
      await openSettings(page);
      await expect(page.locator('#gt-bag-pills .gt-pill.selected')).toHaveCount(16);
    });
  });

  test.describe('Logger autofill and defaults', () => {
    test('autofills distance from hole length for a new hole without overwriting manual edits', async ({ page }) => {
      await openGolf(page);

      await setHole(page, 1);
      await page.locator('#gt-hole-length').fill('375');
      await page.locator('#gt-hole-length').dispatchEvent('input');
      await expect(page.locator('#gt-distance')).toHaveValue('375');

      await page.locator('#gt-distance').fill('360');
      await page.locator('#gt-hole-length').fill('390');
      await page.locator('#gt-hole-length').dispatchEvent('input');
      await expect(page.locator('#gt-distance')).toHaveValue('360');
    });

    test('autofills distance from hole length when mobile browsers only commit on change', async ({ page }) => {
      await openGolf(page);

      await setHole(page, 1);
      await page.locator('#gt-hole-length').evaluate(function (el) { el.value = '375'; });
      await page.locator('#gt-hole-length').dispatchEvent('change');
      await expect(page.locator('#gt-distance')).toHaveValue('375');
    });

    test('committed hole length picks a long club instead of a wedge from partial typing', async ({ page }) => {
      await openGolf(page);
      await loadExampleData(page);

      await openLog(page);
      await setHole(page, 1);
      await page.locator('#gt-hole-length').fill('433');
      await page.locator('#gt-hole-length').dispatchEvent('change');

      await expect(page.locator('#gt-distance')).toHaveValue('433');
      await expect(page.locator('#gt-club-pills .gt-pill.selected')).toHaveText('Driver');
      await expect(page.locator('#gt-dist-hint')).toContainText('Driver');
    });

    test('autofills end distance and end lie from the selected club stock distance', async ({ page }) => {
      await openGolf(page);
      await loadExampleData(page);

      await openLog(page);
      await setHole(page, 1);
      await setDistance(page, 410, 'input');
      await clickPill(page, '#gt-club-pills', 'Driver');
      await expect(page.locator('#gt-end-distance')).toHaveValue('182');
      await expect(page.locator('#gt-endLie')).toHaveValue('Fairway');

      await setDistance(page, 150, 'input');
      await clickPill(page, '#gt-club-pills', '7I');
      await expect(page.locator('#gt-end-distance')).toHaveValue('9');
      await expect(page.locator('#gt-endLie')).toHaveValue('Green');
    });

    test('autoselected club also autofills end distance and end lie', async ({ page }) => {
      await openGolf(page);
      await loadExampleData(page);

      await openLog(page);
      await setHole(page, 1);
      await setDistance(page, 150, 'commit');

      await expect(page.locator('#gt-club-pills .gt-pill.selected')).toHaveText('6I');
      await expect(page.locator('#gt-end-distance')).toHaveValue('1');
      await expect(page.locator('#gt-endLie')).toHaveValue('Green');
    });

    test('defaults result to on target unless a direction is explicitly selected', async ({ page }) => {
      await openGolf(page);
      await expect(page.locator('.gt-dpad-btn.selected')).toContainText('On Target');

      await setHole(page, 1);
      await setDistance(page, 150, 'input');
      await clickPill(page, '#gt-club-pills', '7I');
      await page.locator('#gt-end-distance').fill('12');
      await clickPill(page, '#gt-end-lie-pills', 'Green');
      await page.getByRole('button', { name: 'Save Shot' }).click();

      await openTab(page, 'History');
      await expect(page.locator('#gt-history-body')).toContainText('On Target');

      await openLog(page);
      await page.locator('#gt-end-distance').fill('8');
      await clickPill(page, '#gt-end-lie-pills', 'Green');
      await clickDpad(page, 'Right');
      await page.getByRole('button', { name: 'Save Shot' }).click();

      await openTab(page, 'History');
      await expect(page.locator('#gt-history-body')).toContainText('Right');
    });

    test('quick actions fill common finish states and undo removes the last saved shot', async ({ page }) => {
      await openGolf(page);

      await setHole(page, 1);
      await setDistance(page, 135, 'input');
      await clickPill(page, '#gt-club-pills', '8I');
      await page.getByRole('button', { name: 'Green Hit' }).click();

      await expect(page.locator('#gt-end-distance')).toHaveValue('8');
      await expect(page.locator('#gt-endLie')).toHaveValue('Green');
      await expect(page.locator('#gt-result')).toHaveValue('On Target');

      await page.getByRole('button', { name: 'Save Shot' }).click();
      await openTab(page, 'History');
      await expect(page.locator('#gt-history-count')).toContainText('1 shot');

      await openLog(page);
      await page.getByRole('button', { name: 'Undo' }).click();
      await expect(page.locator('#gt-notice')).toContainText('Last shot removed.');
      await expect(page.locator('#gt-history-body')).toContainText('No shots match the filters.');
    });

    test('scrolls back to the current-shot context after saving', async ({ page }) => {
      await openGolf(page);

      await page.locator('#gt-more-btn').scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const before = await page.evaluate(() => window.scrollY);

      await setHole(page, 1);
      await page.locator('#gt-par').fill('4');
      await page.locator('#gt-hole-length').fill('380');
      await clickPill(page, '#gt-club-pills', 'Driver');
      await page.locator('#gt-end-distance').fill('140');
      await clickPill(page, '#gt-end-lie-pills', 'Fairway');
      await page.getByRole('button', { name: 'Save Shot' }).click();

      await expect(page.locator('#gt-shot-progress-card')).toBeInViewport();
      const after = await page.evaluate(() => window.scrollY);
      expect(after).toBeLessThan(before);
    });
  });

  test.describe('Round creation and progression', () => {
    test('creates a course and round from the log flow, then prefills the next shot', async ({ page }) => {
      await openGolf(page);
      await startNewCourseRound(page, 'North Test Links');

      await setHole(page, 1);
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

      await openSettings(page);
      await expect(page.locator('#gt-courses-list')).toContainText('North Test Links');
    });

    test('moves to the next hole with a tee lie after a holed shot', async ({ page }) => {
      await openGolf(page);

      await setHole(page, 1);
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

    test('plays several holes through the shot logger and builds a scorecard', async ({ page }) => {
      await openGolf(page);
      await startNewCourseRound(page, 'Logger Test Club');

      await saveShot(page, { hole: 1, par: 4, holeLength: 380, distance: 380, club: 'Driver', result: 'On Target', endDistance: 135, endLie: 'Fairway' });
      await expect(page.locator('#gt-distance')).toHaveValue('135');

      await saveShot(page, { distance: 135, club: '8I', result: 'On Target', endDistance: 6, endLie: 'Green' });
      await expect(page.locator('#gt-distance')).toHaveValue('6');
      await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Green');

      await saveShot(page, { distance: 6, club: 'Putter', result: 'On Target', endDistance: 0, endLie: 'Holed' });
      await expect(page.locator('#gt-hole')).toHaveValue('2');
      await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Tee');

      await saveShot(page, { hole: 2, par: 3, holeLength: 155, distance: 155, club: '7I', result: 'On Target', endDistance: 0, endLie: 'Holed' });
      await expect(page.locator('#gt-hole')).toHaveValue('3');

      await saveShot(page, { hole: 3, par: 5, holeLength: 470, distance: 470, club: 'Driver', result: 'Right', endDistance: 210, endLie: 'Rough' });
      await saveShot(page, { distance: 210, club: '5W', result: 'On Target', endDistance: 35, endLie: 'Fringe' });
      await saveShot(page, { distance: 35, club: 'SW', swing: '½', result: 'On Target', endDistance: 4, endLie: 'Green' });
      await saveShot(page, { distance: 4, club: 'Putter', result: 'On Target', endDistance: 0, endLie: 'Holed' });

      await openTab(page, 'Rounds');
      await expect(page.locator('#gt-rounds-list')).toContainText('Logger Test Club');
      await expect(page.locator('#gt-rounds-list')).toContainText('8 shots');

      await page.getByRole('button', { name: 'Scorecard' }).click();
      await expect(page.locator('#gt-scorecard-content')).toContainText('Front 9');
      await expect(page.locator('#gt-scorecard-content')).toContainText('Par');
      await expect(page.locator('#gt-scorecard-content')).toContainText('Score');
      await expect(page.locator('#gt-scorecard-content')).toContainText('Putts');
      await expect(page.locator('#gt-scorecard-content')).toContainText('FIR');
      await expect(page.locator('#gt-scorecard-content')).toContainText('GIR');
      await expect(page.locator('#gt-scorecard-content')).toContainText('3');
      await expect(page.locator('#gt-scorecard-content')).toContainText('1');
      await expect(page.locator('#gt-scorecard-content')).toContainText('4');
    });

    test('shortens logger flow by inferring end lie from end distance', async ({ page }) => {
      await openGolf(page);
      await startNewCourseRound(page, 'Fast Flow Club');

      await saveShot(page, { hole: 1, par: 4, holeLength: 390, distance: 390, club: 'Driver', endDistance: 145 });
      await expect(page.locator('#gt-distance')).toHaveValue('145');
      await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Fairway');

      await saveShot(page, { distance: 145, club: '8I', endDistance: 5 });
      await expect(page.locator('#gt-distance')).toHaveValue('5');
      await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Green');

      await saveShot(page, { distance: 5, club: 'Putter', endDistance: 0 });
      await expect(page.locator('#gt-hole')).toHaveValue('2');
      await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Tee');

      await openTab(page, 'Rounds');
      await expect(page.locator('#gt-rounds-list')).toContainText('Fast Flow Club');
      await expect(page.locator('#gt-rounds-list')).toContainText('3 shots');
    });
  });

  test.describe('Tricky on-course scenarios', () => {
    test('carries penalty-area and unplayable lies into the next shot on the same hole', async ({ page }) => {
      await openGolf(page);
      await startNewCourseRound(page, 'Trouble Test');

      await saveShot(page, { hole: 1, par: 4, holeLength: 400, distance: 400, club: 'Driver', result: 'Right', endDistance: 175, endLie: 'Penalty area' });
      await expect(page.locator('#gt-hole')).toHaveValue('1');
      await expect(page.locator('#gt-distance')).toHaveValue('175');
      await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Penalty area');

      await saveShot(page, { distance: 175, club: '7I', result: 'Left', endDistance: 60, endLie: 'Unplayable' });
      await expect(page.locator('#gt-distance')).toHaveValue('60');
      await expect(page.locator('#gt-lie-pills .gt-pill.selected')).toHaveText('Unplayable');

      await openTab(page, 'History');
      await expect(page.locator('#gt-history-body')).toContainText('Driver');
      await expect(page.locator('#gt-history-body')).toContainText('7I');
    });

    test('records an up-and-down sand save in the scorecard and stats', async ({ page }) => {
      await openGolf(page);
      await startNewCourseRound(page, 'Bunker Test');

      await saveShot(page, { hole: 1, par: 4, holeLength: 360, distance: 360, club: 'Driver', endDistance: 118 });
      await saveShot(page, { distance: 118, club: '9I', result: 'Right', endDistance: 12, endLie: 'Sand' });
      await saveShot(page, { distance: 12, club: 'SW', swing: '½', endDistance: 1, endLie: 'Green' });
      await saveShot(page, { distance: 1, club: 'Putter', endDistance: 0 });

      await openTab(page, 'Rounds');
      await page.getByRole('button', { name: 'Scorecard' }).click();
      await expect(page.locator('#gt-scorecard-content')).toContainText('Sand Save');
      await expect(page.locator('#gt-scorecard-content')).toContainText('Up&Down');
      await expect(page.locator('#gt-scorecard-content')).toContainText('1/1 (100%)');

      await openTab(page, 'Stats');
      await expect(page.locator('#gt-stats-content')).toContainText('Sand Save');
      await expect(page.locator('#gt-stats-content')).toContainText('Up & Down');
      await expect(page.locator('#gt-stats-content')).toContainText('100%');
      await expect(page.locator('#gt-stats-content')).toContainText('1 / 1 holes');
    });
  });

  test.describe('Course and club data', () => {
    test('autofills par and tee length from the selected course and tee', async ({ page }) => {
      await openGolf(page);
      await loadExampleData(page);

      await openLog(page);
      await page.selectOption('#gt-course-ctx', { label: 'Riverbend Parkland' });
      await page.selectOption('#gt-tee-ctx', 'White');
      await setHole(page, 1);

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

      await openLog(page);
      await setDistance(page, 228, 'commit');
      await expect(page.locator('#gt-club-pills .gt-pill.selected')).toHaveText('Driver');
      await expect(page.locator('#gt-dist-hint')).toContainText('Driver');

      await setDistance(page, 67, 'commit');
      await expect(page.locator('#gt-club-pills .gt-pill.selected')).toHaveText('SW');
      await expect(page.locator('#gt-swing-pills .gt-pill.selected')).toHaveText('¾');
      await expect(page.locator('#gt-dist-hint')).toContainText('SW ¾');
    });
  });

  test.describe('Import, export, and bundle flows', () => {
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

      await setHole(page, 1);
      await page.locator('#gt-par').fill('4');
      await page.locator('#gt-hole-length').fill('380');
      await clickPill(page, '#gt-club-pills', 'Driver');
      await clickDpad(page, 'Right');
      await page.locator('#gt-end-distance').fill('140');
      await clickPill(page, '#gt-end-lie-pills', 'Rough');
      await page.getByRole('button', { name: 'Save Shot' }).click();

      await openSettings(page);
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download JSON' }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('golf-shots.json');
      const downloadPath = await download.path();
      const json = fs.readFileSync(downloadPath, 'utf8');

      await resetTracker(page);
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
      await resetTracker(page);

      await expect(page.locator('#gt-courses-list')).toContainText('No courses added yet.');
      await expect(page.locator('#gt-hcp')).toHaveValue('');
      await expect(page.locator('#gt-fixed-putting')).not.toBeChecked();

      await openTab(page, 'Rounds');
      await expect(page.getByText('No rounds yet')).toBeVisible();
    });
  });
});
