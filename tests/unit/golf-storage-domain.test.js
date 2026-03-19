const assert = require('node:assert/strict');

const core = require('../../assets/js/golf-core.js');
const storage = require('../../assets/js/golf-storage.js');
const domain = require('../../assets/js/golf-domain.js');

function run(name, fn) {
  try {
    fn();
    console.log('PASS', name);
  } catch (err) {
    console.error('FAIL', name);
    throw err;
  }
}

function withLocalStorage(fn) {
  const original = global.localStorage;
  const store = new Map();
  global.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  };

  try {
    fn(store);
  } finally {
    global.localStorage = original;
  }
}

run('normalizeImportId strips unsafe characters and creates a fallback id', () => {
  assert.equal(storage.normalizeImportId('bad "id"', 0), 'bad_id');
  assert.equal(storage.normalizeImportId('', 2), 'imported_shot_3');
});

run('storage load/save helpers preserve settings normalization', () => {
  withLocalStorage(() => {
    storage.saveSettings({ bag: [], fixedPutting: 1 });
    const loaded = storage.loadSettings();

    assert.deepEqual(loaded.bag, core.ALL_CLUBS);
    assert.equal(loaded.fixedPutting, true);

    storage.saveShots([{ id: 's1' }]);
    storage.saveRounds([{ id: 'r1' }]);
    storage.saveCourses([{ id: 'c1' }]);

    assert.deepEqual(storage.loadShots(), [{ id: 's1' }]);
    assert.deepEqual(storage.loadRounds(), [{ id: 'r1' }]);
    assert.deepEqual(storage.loadCourses(), [{ id: 'c1' }]);
    assert.equal(storage.hasStoredData({ shots: [{ id: 's1' }], rounds: [], courses: [], settings: loaded }), true);
  });
});

run('inferEndLieValue maps common leave distances to holed, green, and fairway', () => {
  assert.equal(domain.inferEndLieValue(0), 'Holed');
  assert.equal(domain.inferEndLieValue(12), 'Green');
  assert.equal(domain.inferEndLieValue(120), 'Fairway');
  assert.equal(domain.inferEndLieValue(null), '');
});

run('roundScore totals strokes and par across played holes', () => {
  const courses = [{ id: 'course-1', pars: [4, 3, 5] }];
  const round = { id: 'round-1', courseId: 'course-1' };
  const shots = [
    { roundId: 'round-1', hole: 1 },
    { roundId: 'round-1', hole: 1 },
    { roundId: 'round-1', hole: 1 },
    { roundId: 'round-1', hole: 2 },
    { roundId: 'round-1', hole: 2 }
  ];

  assert.deepEqual(domain.roundScore(round, shots, courses), {
    strokes: 5,
    par: 7,
    holes: 2,
    diff: -2
  });
});

run('computeHoleStats handles sand saves and fixed-putting synthetic putts', () => {
  const sandSaveHole = [
    { lie: 'Tee', end_lie: 'Fairway', end_distance: 110, distance: 360, club: 'Driver', synthetic: false, sg: 0.2 },
    { lie: 'Fairway', end_lie: 'Sand', end_distance: 10, distance: 110, club: '9I', synthetic: false, sg: -0.4 },
    { lie: 'Sand', end_lie: 'Green', end_distance: 1, distance: 10, club: 'SW', synthetic: false, sg: 0.5 },
    { lie: 'Green', end_lie: 'Holed', end_distance: 0, distance: 1, club: 'Putter', synthetic: false, sg: 0.1 }
  ];
  const fixedPuttingHole = [
    { lie: 'Tee', end_lie: 'Fairway', end_distance: 150, distance: 400, club: 'Driver', synthetic: false, sg: 0.1 },
    { lie: 'Fairway', end_lie: 'Green', end_distance: 8, distance: 150, club: '8I', synthetic: false, sg: 0.2 },
    { synthetic: true, fixedPutts: 2, end_lie: 'Holed', end_distance: 0 }
  ];

  const sandStats = domain.computeHoleStats(sandSaveHole, 4);
  const fixedStats = domain.computeHoleStats(fixedPuttingHole, 4);

  assert.equal(sandStats.updown, true);
  assert.equal(sandStats.sandSave, true);
  assert.equal(sandStats.putts, 1);

  assert.equal(fixedStats.putts, 2);
  assert.equal(fixedStats.fixedPutts, 2);
  assert.equal(fixedStats.score, 4);
});

run('buildStatsSnapshot keeps practice shots in all-round stats and filters indoor rounds', () => {
  const rounds = [
    { id: 'out-1', date: '2026-03-10', type: 'outdoor', courseId: null },
    { id: 'in-1', date: '2026-03-11', type: 'indoor', courseId: null }
  ];
  const shots = [
    { id: 'a', roundId: 'out-1', distance: 100, lie: 'Fairway', club: '8I', strike: 'Pure / Solid', result: 'On Target', end_distance: 10, end_lie: 'Green' },
    { id: 'b', roundId: 'in-1', distance: 12, lie: 'Green', club: 'Putter', strike: 'Pure / Solid', result: 'On Target', end_distance: 0, end_lie: 'Holed' },
    { id: 'c', roundId: null, date: '2026-03-12', distance: 30, lie: 'Fringe', club: 'PW', strike: 'Thin', result: 'Short', end_distance: 3, end_lie: 'Green' }
  ];

  const allSnapshot = domain.buildStatsSnapshot({
    rounds,
    shots,
    courses: [],
    statsFilter: 'all',
    statsDateFrom: '',
    statsDateTo: ''
  });
  const indoorSnapshot = domain.buildStatsSnapshot({
    rounds,
    shots,
    courses: [],
    statsFilter: 'indoor',
    statsDateFrom: '',
    statsDateTo: ''
  });

  assert.equal(allSnapshot.filteredShots.length, 3);
  assert.equal(allSnapshot.statsMode, 'mixed');
  assert.equal(allSnapshot.hasPracticeShots, true);
  assert.equal(indoorSnapshot.filteredShots.length, 1);
  assert.equal(indoorSnapshot.filteredRounds.length, 1);
  assert.equal(indoorSnapshot.statsMode, 'indoor');
});

run('buildStatsSnapshot respects shot dates for round-linked date filtering', () => {
  const rounds = [
    { id: 'out-1', date: '2026-03-10', type: 'outdoor', courseId: null }
  ];
  const shots = [
    { id: 'a', roundId: 'out-1', date: '2026-03-10', distance: 100, lie: 'Fairway', club: '8I', end_distance: 10, end_lie: 'Green' },
    { id: 'b', roundId: 'out-1', date: '2026-03-12', distance: 8, lie: 'Green', club: 'Putter', end_distance: 0, end_lie: 'Holed' }
  ];

  const snapshot = domain.buildStatsSnapshot({
    rounds,
    shots,
    courses: [],
    statsFilter: 'all',
    statsDateFrom: '2026-03-12',
    statsDateTo: '2026-03-12'
  });

  assert.equal(snapshot.filteredShots.length, 1);
  assert.equal(snapshot.filteredShots[0].id, 'b');
});

run('buildTargetHcpModel ranks improvement priorities by SG gap', () => {
  const model = domain.buildTargetHcpModel({
    'Off the Tee': { sum: -3.0, n: 10 },
    'Approach': { sum: -4.5, n: 10 },
    'Around the Green': { sum: 0.1, n: 10 },
    'Putting': { sum: -0.2, n: 10 }
  }, 40, { hcp: 14, targetHcp: 8 });

  assert.equal(model.state, 'ready');
  assert.equal(model.priorityMap['Approach'], 1);
  assert.ok(model.priorityMap['Off the Tee'] > 0);
  assert.notEqual(model.gapData.find((entry) => entry.cat === 'Approach').gap, null);
});

console.log('All storage/domain unit tests passed.');
