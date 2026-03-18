(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GolfTrackerCore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var SG_GREEN = [
    [0,0],[0.3,1.00],[0.6,1.00],[0.9,1.01],[1.2,1.03],[1.5,1.05],
    [1.8,1.08],[2.5,1.13],[3,1.20],[4.5,1.30],[6,1.40],[7.5,1.48],
    [9,1.55],[12,1.63],[15,1.69],[18,1.74],[23,1.79],[30,1.86]
  ];

  var SG_FAIRWAY = [
    [0,0],[1,1.20],[5,2.40],[10,2.50],[20,2.60],[30,2.65],
    [50,2.72],[75,2.78],[100,2.84],[125,2.91],[150,2.98],
    [175,3.06],[200,3.14],[250,3.27],[300,3.38],[350,3.50],[400,3.62]
  ];

  var SG_OFFSETS = {
    'Tee':           0,
    'Fairway':       0,
    'GUR':           0,
    'Fringe':        0.05,
    'Hardpan':       0.12,
    'Rough':         0.18,
    'Divot':         0.22,
    'Deep Rough':    0.32,
    'Plugged':       0.50,
    'Sand':          0.38,
    'Green':         null,
    'Holed':         null,
    'Penalty area':  1.5,
    'OB / Lost':     2.0,
    'Unplayable':    1.0
  };

  var ALL_CLUBS = ['Driver','3W','5W','7W','H','4I','5I','6I','7I','8I','9I','PW','GW','SW','LW','Putter'];
  var WEDGES = ['PW','GW','SW','LW'];
  var SWINGS = ['¼','½','¾','Full'];

  var SG_HCP_WEIGHTS = {
    'Off the Tee':      0.22,
    'Approach':         0.35,
    'Around the Green': 0.22,
    'Putting':          0.21
  };

  var SG_HCP_REF_SHOTS = {
    'Off the Tee':      14,
    'Approach':         14,
    'Around the Green':  5,
    'Putting':          32
  };

  function lerp(table, dist) {
    if (dist <= 0) return 0;
    if (dist <= table[0][0]) return table[0][1];
    if (dist >= table[table.length - 1][0]) {
      var n = table.length;
      var d0 = table[n - 2][0], v0 = table[n - 2][1];
      var d1 = table[n - 1][0], v1 = table[n - 1][1];
      return v1 + (dist - d1) * (v1 - v0) / (d1 - d0);
    }
    for (var i = 1; i < table.length; i++) {
      if (dist <= table[i][0]) {
        var t = (dist - table[i - 1][0]) / (table[i][0] - table[i - 1][0]);
        return table[i - 1][1] + t * (table[i][1] - table[i - 1][1]);
      }
    }
    return table[table.length - 1][1];
  }

  function sgExpected(dist, lie) {
    if (dist == null || dist < 0) return null;
    if (dist === 0 || lie === 'Holed') return 0;
    if (lie === 'Green') return lerp(SG_GREEN, dist);
    if (lie === 'OB / Lost') return lerp(SG_FAIRWAY, dist) + 2.0;
    if (lie === 'Penalty area' || lie === 'Water') return lerp(SG_FAIRWAY, dist) + 1.5;
    if (lie === 'Unplayable') return lerp(SG_FAIRWAY, dist) + 1.0;
    var offset = (SG_OFFSETS[lie] != null) ? SG_OFFSETS[lie] : 0.18;
    return lerp(SG_FAIRWAY, dist) + offset;
  }

  function calcSG(shot) {
    if (shot.distance == null || shot.end_distance == null) return null;
    var expStart = sgExpected(shot.distance, shot.lie || 'Fairway');
    var expEnd = sgExpected(shot.end_distance, shot.end_lie || 'Fairway');
    if (expStart == null || expEnd == null) return null;
    return expStart - expEnd - 1;
  }

  function sgCategory(shot) {
    var lie = shot.lie || '';
    var dist = shot.distance;
    var club = shot.club || '';
    if (lie === 'Green' || club === 'Putter') return 'Putting';
    if (lie === 'Tee' && dist != null && dist >= 100) return 'Off the Tee';
    if (dist != null && dist < 30) return 'Around the Green';
    return 'Approach';
  }

  function defaultSettings() {
    return { hcp: null, targetHcp: null, hcpIndoor: null, targetHcpIndoor: null, fixedPutting: false, bag: ALL_CLUBS.slice(), clubDistances: {} };
  }

  function teeLengths(course, teeName) {
    if (!course || !course.tees || course.tees.length === 0) return [];
    var tee = course.tees.find(function (t) { return t.name === teeName; }) || course.tees[0];
    return tee && tee.lengths ? tee.lengths : [];
  }

  function buildExampleSettings() {
    return {
      hcp: 14.2,
      targetHcp: 10,
      hcpIndoor: 11.5,
      targetHcpIndoor: 8,
      fixedPutting: true,
      bag: ALL_CLUBS.slice(),
      clubDistances: {
        'Driver': 228,
        '3W': 210,
        '5W': 196,
        '7W': 182,
        'H': 172,
        '4I': 166,
        '5I': 158,
        '6I': 149,
        '7I': 141,
        '8I': 132,
        '9I': 122,
        'PW': { '¼': 42, '½': 68, '¾': 92, 'Full': 112 },
        'GW': { '¼': 36, '½': 58, '¾': 81, 'Full': 101 },
        'SW': { '¼': 28, '½': 47, '¾': 67, 'Full': 84 },
        'LW': { '¼': 20, '½': 36, '¾': 54, 'Full': 70 }
      }
    };
  }

  function buildExampleCourses() {
    return [
      {
        id: 'demo_course_outdoor',
        name: 'Riverbend Parkland',
        pars: [4,5,3,4,4,5,3,4,4,4,4,3,5,4,3,4,5,4],
        tees: [
          { name: 'White', lengths: [342,478,156,364,388,494,168,351,402,372,389,162,512,401,174,358,523,411] },
          { name: 'Blue', lengths: [364,512,172,387,414,531,182,373,429,396,412,176,545,423,188,381,552,438] }
        ]
      },
      {
        id: 'demo_course_indoor',
        name: 'Studio Sim Championship',
        pars: [4,4,3,5,4,3,4,5,4,4,4,3,5,4,3,4,5,4],
        tees: [
          { name: 'Sim', lengths: [331,362,149,503,381,162,347,492,396,354,387,171,515,404,163,368,527,409] }
        ]
      }
    ];
  }

  function buildExampleRounds(courses) {
    return [
      { id: 'demo_round_outdoor_2026_03_12', date: '2026-03-12', courseId: courses[0].id, type: 'outdoor', teeName: 'White', notes: 'Evening league round' },
      { id: 'demo_round_outdoor_2026_03_15', date: '2026-03-15', courseId: courses[0].id, type: 'outdoor', teeName: 'Blue', notes: 'Windy weekend nine' },
      { id: 'demo_round_indoor_2026_03_16', date: '2026-03-16', courseId: courses[1].id, type: 'indoor', teeName: 'Sim', notes: 'TrackMan practice match' }
    ];
  }

  function buildExampleShots(rounds, courses) {
    var shotsOut = [];
    var shotNo = 1;
    var roundById = {};
    var courseById = {};
    rounds.forEach(function (r) { roundById[r.id] = r; });
    courses.forEach(function (c) { courseById[c.id] = c; });

    function pushShot(roundId, hole, spec, extra) {
      var round = roundById[roundId];
      var course = round && round.courseId ? courseById[round.courseId] : null;
      var lengths = teeLengths(course, round ? round.teeName : null);
      var shot = {
        id: 'demo_shot_' + String(shotNo++).padStart(3, '0'),
        date: round ? round.date : '2026-03-12',
        hole: hole,
        par: course && course.pars ? course.pars[hole - 1] : null,
        holeLength: lengths[hole - 1] || null,
        distance: spec[0],
        club: spec[1],
        swing: spec[9] || null,
        lie: spec[2],
        result: spec[5] || null,
        strike: spec[6] || null,
        shape: spec[7] || null,
        end_distance: spec[3],
        end_lie: spec[4],
        notes: spec[8] || '',
        roundId: roundId
      };
      if (extra) {
        Object.keys(extra).forEach(function (k) { shot[k] = extra[k]; });
      }
      shot.sg = shot.synthetic ? null : calcSG(shot);
      shotsOut.push(shot);
    }

    function addHole(roundId, hole, specs) {
      specs.forEach(function (spec) { pushShot(roundId, hole, spec); });
    }

    function addSynthetic(roundId, hole, prox, putts, note) {
      pushShot(roundId, hole, [prox, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', note || '', null], {
        synthetic: true,
        fixedPutts: putts
      });
    }

    addHole('demo_round_outdoor_2026_03_12', 1, [
      [342, 'Driver', 'Tee', 118, 'Fairway', 'On Target', 'Pure / Solid', 'Fade', 'Opening tee ball held the left center'],
      [118, '8I', 'Fairway', 9, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Solid mid-iron to the heart of the green'],
      [9, 'Putter', 'Green', 1.1, 'Green', 'Short Right', null, 'Straight', 'Left the birdie try on a safe line'],
      [1.1, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Tap-in par']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 2, [
      [478, 'Driver', 'Tee', 244, 'Fairway', 'On Target', 'Pure / Solid', 'Draw', 'Turning tee shot with the breeze'],
      [244, '5W', 'Fairway', 62, 'Fairway', 'On Target', 'Pure / Solid', 'Straight', 'Laid up to a preferred wedge yardage'],
      [62, 'SW', 'Fairway', 4.5, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Flighted wedge', '¾'],
      [4.5, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Holed the birdie putt']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 3, [
      [156, '7I', 'Tee', 7, 'Green', 'Short Left', 'Pure / Solid', 'Draw', 'Pulled slightly but pin high'],
      [7, 'Putter', 'Green', 0.6, 'Green', 'On Target', null, 'Straight', 'Speed was good'],
      [0.6, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Clean par save']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 4, [
      [364, 'Driver', 'Tee', 132, 'Rough', 'Right', 'Mis-hit', 'Fade', 'Leaked into the first cut'],
      [132, '8I', 'Rough', 18, 'Fringe', 'Short', 'Thin', 'Straight', 'Came out flyer-flat'],
      [18, 'PW', 'Fringe', 2.4, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Good bump-and-run', '½'],
      [2.4, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Converted for bogey']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 5, [
      [388, 'Driver', 'Tee', 152, 'Fairway', 'On Target', 'Pure / Solid', 'Fade', 'Fairway found'],
      [152, '6I', 'Fairway', 28, 'Sand', 'Short Right', 'Thin', 'Straight', 'Caught the front bunker'],
      [28, 'SW', 'Sand', 3.2, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Splash out to makeable range', '½'],
      [3.2, 'Putter', 'Green', 0.4, 'Green', 'On Target', null, 'Straight', 'Aggressive look'],
      [0.4, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Sand-save par']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 6, [
      [494, 'Driver', 'Tee', 256, 'Fairway', 'On Target', 'Pure / Solid', 'Draw', 'Best drive of the day'],
      [256, '5W', 'Fairway', 54, 'Fairway', 'On Target', 'Pure / Solid', 'Straight', 'Smart layup'],
      [54, 'GW', 'Fairway', 6.3, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Controlled wedge to upper tier', '¾'],
      [6.3, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Rolled in the birdie']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 7, [
      [168, '6I', 'Tee', 14, 'Fringe', 'Short', 'Pure / Solid', 'Fade', 'Front edge only'],
      [14, 'PW', 'Fringe', 1.5, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Neat chip to kick-in range', '¼'],
      [1.5, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Par']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 8, [
      [351, '3W', 'Tee', 121, 'Fairway', 'On Target', 'Pure / Solid', 'Straight', 'Played position off the tee'],
      [121, '9I', 'Fairway', 5.1, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Knocked it inside ten feet'],
      [5.1, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Birdie from the low side']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 9, [
      [402, 'Driver', 'Tee', 176, 'Deep Rough', 'Left', 'Mis-hit', 'Hook', 'Heavy pull into thick rough'],
      [176, '5I', 'Deep Rough', 42, 'Fairway', 'On Target', 'Pure / Solid', 'Punch', 'Advanced it back in play'],
      [42, 'GW', 'Fairway', 11, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Safe wedge to the middle', '½'],
      [11, 'Putter', 'Green', 1.2, 'Green', 'On Target', null, 'Straight', 'Left the first putt short'],
      [1.2, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Closed the side with bogey']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 10, [
      [372, 'Driver', 'Tee', 146, 'Fairway', 'On Target', 'Pure / Solid', 'Fade', 'Found the speed slot'],
      [146, '7I', 'Fairway', 24, 'Fringe', 'Short', 'Thin', 'Straight', 'Came up on the upslope'],
      [24, 'PW', 'Fringe', 2.1, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Good check-and-release', '¼'],
      [2.1, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Stress-free par']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 11, [
      [389, 'Driver', 'Tee', 162, 'Fairway', 'On Target', 'Pure / Solid', 'Draw', 'Started down the right edge'],
      [162, '6I', 'Fairway', 7.6, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'High draw to the center tier'],
      [7.6, 'Putter', 'Green', 0.9, 'Green', 'On Target', null, 'Straight', 'Good lag'],
      [0.9, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Par']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 12, [
      [162, '7I', 'Tee', 19, 'Fringe', 'Short Right', 'Thin', 'Fade', 'Missed the green on the open side'],
      [19, 'PW', 'Fringe', 3.6, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Left the chip below the hole', '¼'],
      [3.6, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Saved par']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 13, [
      [512, 'Driver', 'Tee', 272, 'Fairway', 'On Target', 'Pure / Solid', 'Draw', 'Long tee ball downwind'],
      [272, '5W', 'Fairway', 88, 'Rough', 'Right', 'Pure / Solid', 'Fade', 'Aggressive line just missed the fairway'],
      [88, 'PW', 'Rough', 16, 'Green', 'Short', 'Fat / Chunked', 'Straight', 'Did not quite cover the ridge', '¾'],
      [16, 'Putter', 'Green', 1.4, 'Green', 'On Target', null, 'Straight', 'Good first putt from distance'],
      [1.4, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Par']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 14, [
      [401, 'Driver', 'Tee', 165, 'Rough', 'Right', 'Pure / Solid', 'Fade', 'Ran through the fairway into semi-rough'],
      [165, '5I', 'Rough', 0, 'Holed', 'On Target', 'Pure / Solid', 'Draw', 'Holed out from the rough']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 15, [
      [174, '6I', 'Tee', 12, 'Green', 'Long Left', 'Pure / Solid', 'Draw', 'Big bounce over the flag'],
      [12, 'Putter', 'Green', 1.8, 'Green', 'On Target', null, 'Straight', 'Lagged it close'],
      [1.8, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Par']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 16, [
      [358, '3W', 'Tee', 114, 'Fairway', 'On Target', 'Pure / Solid', 'Straight', 'Chose position over distance'],
      [114, '9I', 'Fairway', 31, 'Sand', 'Short Right', 'Thin', 'Fade', 'Caught the bunker lip'],
      [31, 'SW', 'Sand', 5.2, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Good bunker shot', '½'],
      [5.2, 'Putter', 'Green', 0.7, 'Green', 'On Target', null, 'Straight', 'Looked good all the way'],
      [0.7, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Bogey']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 17, [
      [523, 'Driver', 'Tee', 281, 'Fairway', 'On Target', 'Pure / Solid', 'Draw', 'Set up a chance to attack'],
      [281, '5W', 'Fairway', 64, 'Fairway', 'On Target', 'Pure / Solid', 'Straight', 'Laid back to a full wedge'],
      [64, 'SW', 'Fairway', 8.7, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Good distance control', '¾'],
      [8.7, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Birdie to move under target']
    ]);
    addHole('demo_round_outdoor_2026_03_12', 18, [
      [411, 'Driver', 'Tee', 169, 'Fairway', 'On Target', 'Pure / Solid', 'Fade', 'Fairway finder on the closer'],
      [169, '5I', 'Fairway', 20, 'Fringe', 'Short', 'Thin', 'Straight', 'Came up just short of the dance floor'],
      [20, 'PW', 'Fringe', 1.1, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Clipped pitch under the hole', '¼'],
      [1.1, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Up-and-down par finish']
    ]);

    addHole('demo_round_outdoor_2026_03_15', 1, [
      [364, 'Driver', 'Tee', 146, 'Rough', 'Right', 'Pure / Solid', 'Fade', 'Crosswind pushed it into the rough'],
      [146, '7I', 'Rough', 11, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Held the green against the wind'],
      [11, 'Putter', 'Green', 2.2, 'Green', 'On Target', null, 'Straight', 'Good pace in gusts'],
      [2.2, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Par save']
    ]);
    addHole('demo_round_outdoor_2026_03_15', 2, [
      [512, 'Driver', 'Tee', 294, 'Fairway', 'On Target', 'Pure / Solid', 'Draw', 'Used the helping breeze'],
      [294, '5W', 'Fairway', 88, 'Fairway', 'On Target', 'Pure / Solid', 'Straight', 'Laid up short of the cross bunker'],
      [88, 'PW', 'Fairway', 6, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Pinned wedge', '¾'],
      [6, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Birdie']
    ]);
    addHole('demo_round_outdoor_2026_03_15', 3, [
      [172, '6I', 'Tee', 24, 'Sand', 'Short Right', 'Fat / Chunked', 'Fade', 'Wind held it in the bunker'],
      [24, 'SW', 'Sand', 2.8, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Exploded it out nicely', '½'],
      [2.8, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Saved par']
    ]);
    addHole('demo_round_outdoor_2026_03_15', 4, [
      [387, 'Driver', 'Tee', 171, 'Deep Rough', 'Left', 'Mis-hit', 'Hook', 'Turned over too hard into the trees'],
      [171, '6I', 'Deep Rough', 62, 'Fairway', 'On Target', 'Pure / Solid', 'Punch', 'Took medicine back to the fairway'],
      [62, 'GW', 'Fairway', 18, 'Green', 'Short', 'Thin', 'Straight', 'Left a long two-putt', '¾'],
      [18, 'Putter', 'Green', 1.6, 'Green', 'On Target', null, 'Straight', 'Handled the tier well'],
      [1.6, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Bogey']
    ]);
    addHole('demo_round_outdoor_2026_03_15', 5, [
      [414, 'Driver', 'Tee', 192, 'Penalty area', 'Right', 'Mis-hit', 'Slice', 'Started right and never came back'],
      [192, '7I', 'Fairway', 34, 'Fringe', 'Short', 'Pure / Solid', 'Straight', 'Drop and advance'],
      [34, 'SW', 'Fringe', 4.4, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Nice pitch after the penalty', '½'],
      [4.4, 'Putter', 'Green', 0, 'Holed', 'On Target', null, 'Straight', 'Good putt for double']
    ]);

    addHole('demo_round_indoor_2026_03_16', 1, [
      [331, 'Driver', 'Tee', 108, 'Fairway', 'On Target', 'Pure / Solid', 'Draw', 'Indoor session opener'],
      [108, 'PW', 'Fairway', 8, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Start line was perfect', 'Full']
    ]);
    addSynthetic('demo_round_indoor_2026_03_16', 1, 8, 2, '2 fixed putts (8 m)');
    addHole('demo_round_indoor_2026_03_16', 2, [
      [362, '3W', 'Tee', 124, 'Fairway', 'On Target', 'Pure / Solid', 'Straight', 'Chose three wood for control'],
      [124, '9I', 'Fairway', 2.4, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Flighted one under the fan', 'Full']
    ]);
    addSynthetic('demo_round_indoor_2026_03_16', 2, 2.4, 1, '1 fixed putt (2.4 m)');
    addHole('demo_round_indoor_2026_03_16', 3, [
      [149, '8I', 'Tee', 16, 'Fringe', 'Short', 'Thin', 'Straight', 'Caught low on the face'],
      [16, 'PW', 'Fringe', 3.8, 'Green', 'On Target', 'Pure / Solid', 'Straight', 'Recovered with a tidy pitch', '¼']
    ]);
    addSynthetic('demo_round_indoor_2026_03_16', 3, 3.8, 2, '2 fixed putts (3.8 m)');

    return shotsOut;
  }

  function sgTargetPerShot(hcp, category) {
    if (hcp == null) return null;
    return -(hcp * SG_HCP_WEIGHTS[category]) / SG_HCP_REF_SHOTS[category];
  }

  return {
    SG_GREEN: SG_GREEN,
    SG_FAIRWAY: SG_FAIRWAY,
    SG_OFFSETS: SG_OFFSETS,
    ALL_CLUBS: ALL_CLUBS,
    WEDGES: WEDGES,
    SWINGS: SWINGS,
    SG_HCP_WEIGHTS: SG_HCP_WEIGHTS,
    SG_HCP_REF_SHOTS: SG_HCP_REF_SHOTS,
    defaultSettings: defaultSettings,
    lerp: lerp,
    sgExpected: sgExpected,
    calcSG: calcSG,
    sgCategory: sgCategory,
    teeLengths: teeLengths,
    buildExampleSettings: buildExampleSettings,
    buildExampleCourses: buildExampleCourses,
    buildExampleRounds: buildExampleRounds,
    buildExampleShots: buildExampleShots,
    sgTargetPerShot: sgTargetPerShot
  };
});
