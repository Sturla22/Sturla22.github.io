const assert = require('node:assert/strict');

const core = require('../../assets/js/golf-core.js');

function run(name, fn) {
  try {
    fn();
    console.log('PASS', name);
  } catch (err) {
    console.error('FAIL', name);
    throw err;
  }
}

run('defaultSettings returns a fresh default settings object', () => {
  const a = core.defaultSettings();
  const b = core.defaultSettings();

  assert.deepEqual(a, {
    hcp: null,
    targetHcp: null,
    hcpIndoor: null,
    targetHcpIndoor: null,
    fixedPutting: false,
    bag: core.ALL_CLUBS,
    clubDistances: {}
  });
  assert.notStrictEqual(a, b);
  assert.notStrictEqual(a.bag, b.bag);
});

run('normalizeSettings restores the full bag when bag is missing or empty', () => {
  const missingBag = core.normalizeSettings({ hcp: 12.4 });
  const emptyBag = core.normalizeSettings({ bag: [] });
  const partialBag = core.normalizeSettings({ bag: ['Driver', '7I', 'Nope'] });

  assert.deepEqual(missingBag.bag, core.ALL_CLUBS);
  assert.deepEqual(emptyBag.bag, core.ALL_CLUBS);
  assert.deepEqual(partialBag.bag, ['Driver', '7I']);
});

run('sgExpected handles green, fairway-like, and penalty lies', () => {
  assert.equal(core.sgExpected(0, 'Holed'), 0);
  assert.equal(core.sgExpected(-1, 'Fairway'), null);
  assert.ok(Math.abs(core.sgExpected(9, 'Green') - 1.55) < 1e-9);
  assert.ok(core.sgExpected(100, 'Penalty area') > core.sgExpected(100, 'Fairway'));
  assert.ok(core.sgExpected(100, 'OB / Lost') > core.sgExpected(100, 'Penalty area'));
});

run('calcSG and sgCategory classify shots consistently', () => {
  const teeShot = {
    distance: 150,
    lie: 'Tee',
    club: 'Driver',
    end_distance: 20,
    end_lie: 'Fairway'
  };
  const putt = {
    distance: 6,
    lie: 'Green',
    club: 'Putter',
    end_distance: 0,
    end_lie: 'Holed'
  };

  assert.equal(core.sgCategory(teeShot), 'Off the Tee');
  assert.equal(core.sgCategory(putt), 'Putting');
  assert.ok(typeof core.calcSG(teeShot) === 'number');
  assert.ok(core.calcSG(putt) > 0);
});

run('teeLengths resolves requested tee and falls back to first tee', () => {
  const course = {
    tees: [
      { name: 'White', lengths: [100, 101] },
      { name: 'Blue', lengths: [110, 111] }
    ]
  };

  assert.deepEqual(core.teeLengths(course, 'Blue'), [110, 111]);
  assert.deepEqual(core.teeLengths(course, 'Nope'), [100, 101]);
  assert.deepEqual(core.teeLengths(null, 'Blue'), []);
});

run('example data builders produce linked courses, rounds, and shots', () => {
  const courses = core.buildExampleCourses();
  const rounds = core.buildExampleRounds(courses);
  const shots = core.buildExampleShots(rounds, courses);

  assert.equal(courses.length, 2);
  assert.equal(rounds.length, 3);
  assert.ok(shots.length > 40);

  const courseIds = new Set(courses.map((c) => c.id));
  const roundIds = new Set(rounds.map((r) => r.id));

  rounds.forEach((round) => {
    assert.ok(courseIds.has(round.courseId));
  });

  shots.forEach((shot) => {
    assert.ok(roundIds.has(shot.roundId));
    assert.ok(shot.id.startsWith('demo_shot_'));
    assert.ok(shot.date);
    assert.ok(shot.club);
    assert.ok(shot.lie);
  });

  const indoorSynthetic = shots.filter((shot) => shot.synthetic);
  assert.ok(indoorSynthetic.length > 0);
  assert.ok(indoorSynthetic.every((shot) => shot.fixedPutts > 0));
});

run('sgTargetPerShot gets more demanding as target handicap improves', () => {
  const offTee10 = core.sgTargetPerShot(10, 'Off the Tee');
  const offTee20 = core.sgTargetPerShot(20, 'Off the Tee');
  const roundApproach10 = core.sgTargetPerRound(10, 'Approach');
  const roundTee10 = core.sgTargetPerRound(10, 'Off the Tee');
  const roundPutting10 = core.sgTargetPerRound(10, 'Putting');
  const roundShortGame10 = core.sgTargetPerRound(10, 'Around the Green');

  assert.equal(core.sgTargetPerShot(null, 'Putting'), null);
  assert.equal(core.sgTargetPerRound(null, 'Putting'), null);
  assert.ok(offTee10 > offTee20);
  assert.ok(roundApproach10 < roundTee10);
  assert.ok(roundTee10 < roundPutting10);
  assert.ok(roundPutting10 < roundShortGame10);
});

console.log('All unit tests passed.');
