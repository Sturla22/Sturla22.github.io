(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./golf-core.js'));
  } else {
    root.GolfTrackerDomain = factory(root.GolfTrackerCore);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core) {
  'use strict';

  if (!core) throw new Error('GolfTrackerCore is required for GolfTrackerDomain');

  /*
   * Pure golf tracker domain logic: hole/round scoring, stats aggregation,
   * target-HCP comparison, and autofill inference.
   */
  function inferEndLieValue(endDistance) {
    if (endDistance == null || isNaN(endDistance) || endDistance < 0) return '';
    if (endDistance === 0) return 'Holed';
    if (endDistance <= 30) return 'Green';
    return 'Fairway';
  }

  function defaultPars() {
    return [4, 4, 3, 4, 5, 4, 3, 4, 4, 4, 3, 4, 5, 4, 3, 4, 4, 4];
  }

  function roundShotCount(shots, roundId) {
    return shots.filter(function (shot) { return shot.roundId === roundId; }).length;
  }

  function roundScore(round, shots, courses) {
    var roundShots = shots.filter(function (shot) { return shot.roundId === round.id; });
    if (roundShots.length === 0) return null;

    var holesPlayed = {};
    roundShots.forEach(function (shot) {
      if (shot.hole != null) holesPlayed[shot.hole] = (holesPlayed[shot.hole] || 0) + 1;
    });

    var totalStrokes = 0;
    Object.keys(holesPlayed).forEach(function (hole) {
      totalStrokes += holesPlayed[hole];
    });

    var course = round.courseId ? courses.find(function (item) { return item.id === round.courseId; }) : null;
    var holesCount = Object.keys(holesPlayed).length;
    var totalPar = 0;
    if (course) {
      Object.keys(holesPlayed).forEach(function (hole) {
        totalPar += course.pars[parseInt(hole, 10) - 1] || 4;
      });
    } else {
      totalPar = holesCount * 4;
    }

    return {
      strokes: totalStrokes,
      par: totalPar,
      holes: holesCount,
      diff: totalStrokes - totalPar
    };
  }

  function computeHoleStats(holeShots, par) {
    if (!holeShots || holeShots.length === 0) return null;

    var realShots = holeShots.filter(function (shot) { return !shot.synthetic; });
    var syntheticShots = holeShots.filter(function (shot) { return shot.synthetic; });
    var hasSynthetic = syntheticShots.length > 0;
    var fixedPutts = syntheticShots.reduce(function (sum, shot) {
      return sum + (shot.fixedPutts || 0);
    }, 0);

    var score = hasSynthetic ? realShots.length + fixedPutts : holeShots.length;
    var lastShot = holeShots[holeShots.length - 1];
    var holed = hasSynthetic || lastShot.end_lie === 'Holed' || lastShot.end_distance === 0;

    var putts = hasSynthetic
      ? fixedPutts
      : holeShots.filter(function (shot) {
          return shot.lie === 'Green' || shot.club === 'Putter';
        }).length;

    var fir = null;
    if (par >= 4 && realShots.length > 0 && realShots[0].lie === 'Tee') {
      fir = realShots[0].end_lie === 'Fairway';
    }

    var girAllowed = par - 2;
    var gir = false;
    for (var i = 0; i < Math.min(girAllowed, realShots.length); i++) {
      var shot = realShots[i];
      if (shot.end_lie === 'Green' || shot.end_lie === 'Holed' || shot.end_distance === 0) {
        gir = true;
        break;
      }
    }
    if (!gir && hasSynthetic && realShots.length <= girAllowed && realShots.length > 0) {
      if (realShots[realShots.length - 1].end_lie === 'Green') gir = true;
    }

    var updown = null;
    var sandSave = null;
    if (!gir) {
      var hadSand = realShots.some(function (shot) { return shot.lie === 'Sand'; });
      var aroundGreenIndex = -1;
      for (i = 0; i < realShots.length; i++) {
        shot = realShots[i];
        if (shot.lie !== 'Tee' && (
          (shot.distance != null && shot.distance <= 30) ||
          shot.lie === 'Sand' ||
          shot.lie === 'Fringe' ||
          shot.lie === 'Green'
        )) {
          aroundGreenIndex = i;
          break;
        }
      }
      if (aroundGreenIndex >= 0) {
        if (holed) {
          var shotsFromAtg = hasSynthetic
            ? (realShots.length - aroundGreenIndex) + fixedPutts
            : holeShots.length - aroundGreenIndex;
          updown = shotsFromAtg <= 2;
        } else {
          updown = false;
        }
        if (hadSand) sandSave = updown;
      }
    }

    var sgByCat = {
      'Off the Tee': 0,
      'Approach': 0,
      'Around the Green': 0,
      'Putting': 0
    };
    var sg = realShots.reduce(function (sum, shot) {
      var value = shot.sg != null ? shot.sg : core.calcSG(shot);
      if (value != null) {
        sgByCat[core.sgCategory(shot)] += value;
      }
      return sum + (value != null ? value : 0);
    }, 0);

    return {
      score: score,
      par: par,
      diff: holed ? score - par : null,
      putts: putts,
      fir: fir,
      gir: gir,
      updown: updown,
      sandSave: sandSave,
      holed: holed,
      sg: sg,
      sgByCat: sgByCat,
      fixedPutts: hasSynthetic ? fixedPutts : null
    };
  }

  function buildScorecardModel(round, course, shots) {
    var coursePars = course ? course.pars : defaultPars();
    var tee = null;
    if (course && course.tees && course.tees.length > 0) {
      tee = course.tees.find(function (item) { return item.name === round.teeName; }) || null;
    }

    var roundShots = shots.filter(function (shot) { return shot.roundId === round.id; });
    var holeData = [];
    var effectivePars = [];
    var holeLengths = [];

    for (var hole = 1; hole <= 18; hole++) {
      var holeShots = roundShots.filter(function (shot) { return shot.hole === hole; });
      var shotWithPar = holeShots.find(function (shot) { return shot.par != null && !shot.synthetic; });
      var par = shotWithPar ? shotWithPar.par : coursePars[hole - 1];
      var holeStats = computeHoleStats(holeShots, par);
      holeData.push(holeStats);
      effectivePars.push(holeStats ? holeStats.par : coursePars[hole - 1]);

      var length = null;
      if (tee && tee.lengths && tee.lengths[hole - 1]) length = tee.lengths[hole - 1];
      if (length == null) {
        var shotWithLength = holeShots.find(function (shot) {
          return !shot.synthetic && shot.holeLength != null;
        });
        if (shotWithLength) length = shotWithLength.holeLength;
      }
      holeLengths.push(length);
    }

    var totals = {
      score: 0,
      par: 0,
      putts: 0,
      firOpp: 0,
      firHit: 0,
      girHit: 0,
      udOpp: 0,
      udHit: 0,
      ssOpp: 0,
      ssHit: 0,
      sg: 0,
      sgByCat: {
        'Off the Tee': 0,
        'Approach': 0,
        'Around the Green': 0,
        'Putting': 0
      }
    };

    var scoreBreakdown = {
      eaglesMinus: 0,
      birdies: 0,
      pars: 0,
      bogeys: 0,
      doublePlus: 0
    };

    holeData.forEach(function (holeStats, index) {
      totals.par += effectivePars[index];
      if (!holeStats) return;
      if (holeStats.holed) totals.score += holeStats.score;
      totals.putts += holeStats.putts;
      if (holeStats.fir !== null) {
        totals.firOpp++;
        if (holeStats.fir) totals.firHit++;
      }
      if (holeStats.gir) totals.girHit++;
      if (holeStats.updown !== null) {
        totals.udOpp++;
        if (holeStats.updown) totals.udHit++;
      }
      if (holeStats.sandSave !== null) {
        totals.ssOpp++;
        if (holeStats.sandSave) totals.ssHit++;
      }
      totals.sg += holeStats.sg;
      Object.keys(totals.sgByCat).forEach(function (category) {
        totals.sgByCat[category] += holeStats.sgByCat ? holeStats.sgByCat[category] || 0 : 0;
      });
      if (holeStats.diff != null) {
        if (holeStats.diff <= -2) scoreBreakdown.eaglesMinus++;
        else if (holeStats.diff === -1) scoreBreakdown.birdies++;
        else if (holeStats.diff === 0) scoreBreakdown.pars++;
        else if (holeStats.diff === 1) scoreBreakdown.bogeys++;
        else scoreBreakdown.doublePlus++;
      }
    });

    return {
      round: round,
      course: course,
      holeData: holeData,
      effectivePars: effectivePars,
      holeLengths: holeLengths,
      hasLengths: holeLengths.some(function (length) { return length != null; }),
      hasFixedPutts: holeData.some(function (holeStats) { return holeStats && holeStats.fixedPutts != null; }),
      totals: totals,
      scoreBreakdown: scoreBreakdown
    };
  }

  function buildTraditionalStats(filteredRounds, shots, courses) {
    var trad = {
      girOpp: 0,
      girHit: 0,
      firOpp: 0,
      firHit: 0,
      putts: 0,
      holes: 0,
      udOpp: 0,
      udHit: 0,
      ssOpp: 0,
      ssHit: 0,
      scoreDiff: 0,
      scoredHoles: 0
    };

    filteredRounds.forEach(function (round) {
      var course = courses.find(function (item) { return item.id === round.courseId; });
      var coursePars = course ? course.pars : defaultPars();
      var roundShots = shots.filter(function (shot) { return shot.roundId === round.id; });
      for (var hole = 1; hole <= 18; hole++) {
        var holeShots = roundShots.filter(function (shot) { return shot.hole === hole; });
        if (holeShots.length === 0) continue;
        var shotWithPar = holeShots.find(function (shot) { return shot.par != null && !shot.synthetic; });
        var par = shotWithPar ? shotWithPar.par : coursePars[hole - 1];
        var holeStats = computeHoleStats(holeShots, par);
        if (!holeStats || !holeStats.holed) continue;
        trad.holes++;
        trad.girOpp++;
        if (holeStats.gir) trad.girHit++;
        trad.putts += holeStats.putts;
        if (holeStats.fir !== null) {
          trad.firOpp++;
          if (holeStats.fir) trad.firHit++;
        }
        if (holeStats.updown !== null) {
          trad.udOpp++;
          if (holeStats.updown) trad.udHit++;
        }
        if (holeStats.sandSave !== null) {
          trad.ssOpp++;
          if (holeStats.sandSave) trad.ssHit++;
        }
        if (holeStats.diff !== null) {
          trad.scoreDiff += holeStats.diff;
          trad.scoredHoles++;
        }
      }
    });

    return trad;
  }

  function buildRoundSummaries(filteredRounds, shots, courses) {
    return filteredRounds.map(function (round) {
      var summary = roundScore(round, shots, courses);
      if (!summary) return null;
      return {
        id: round.id,
        date: round.date || '',
        type: round.type || 'outdoor',
        diff: summary.diff,
        strokes: summary.strokes,
        par: summary.par,
        holes: summary.holes
      };
    }).filter(Boolean).sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });
  }

  function buildScoringByPar(filteredRounds, shots, courses) {
    var stats = {
      3: { par: 3, totalScore: 0, totalDiff: 0, holes: 0 },
      4: { par: 4, totalScore: 0, totalDiff: 0, holes: 0 },
      5: { par: 5, totalScore: 0, totalDiff: 0, holes: 0 }
    };

    filteredRounds.forEach(function (round) {
      var course = courses.find(function (item) { return item.id === round.courseId; });
      var coursePars = course ? course.pars : defaultPars();
      var roundShots = shots.filter(function (shot) { return shot.roundId === round.id; });
      for (var hole = 1; hole <= 18; hole++) {
        var holeShots = roundShots.filter(function (shot) { return shot.hole === hole; });
        if (!holeShots.length) continue;
        var shotWithPar = holeShots.find(function (shot) { return shot.par != null && !shot.synthetic; });
        var par = shotWithPar ? shotWithPar.par : coursePars[hole - 1];
        var holeStats = computeHoleStats(holeShots, par);
        if (!holeStats || !holeStats.holed || !stats[par]) continue;
        stats[par].totalScore += holeStats.score;
        stats[par].totalDiff += holeStats.diff;
        stats[par].holes++;
      }
    });

    return [3, 4, 5].map(function (par) {
      var item = stats[par];
      return {
        par: par,
        holes: item.holes,
        avgScore: item.holes ? item.totalScore / item.holes : null,
        avgDiff: item.holes ? item.totalDiff / item.holes : null
      };
    });
  }

  function buildDriveStats(shots) {
    var teeShots = shots.filter(function (shot) {
      return shot.lie === 'Tee' && shot.distance != null && shot.end_distance != null;
    }).map(function (shot) {
      return Math.max(0, shot.distance - shot.end_distance);
    }).filter(function (gain) {
      return gain > 0;
    });

    return {
      count: teeShots.length,
      average: teeShots.length ? teeShots.reduce(function (sum, gain) { return sum + gain; }, 0) / teeShots.length : null,
      longest: teeShots.length ? teeShots.reduce(function (max, gain) { return Math.max(max, gain); }, 0) : null
    };
  }

  function buildDistanceBuckets(shots) {
    var ranges = [
      { min: 0, max: 25, label: '0-25' },
      { min: 25, max: 50, label: '25-50' },
      { min: 50, max: 75, label: '50-75' },
      { min: 75, max: 100, label: '75-100' },
      { min: 100, max: 125, label: '100-125' },
      { min: 125, max: 150, label: '125-150' },
      { min: 150, max: 175, label: '150-175' },
      { min: 175, max: 200, label: '175-200' },
      { min: 200, max: 225, label: '200-225' },
      { min: 225, max: Infinity, label: '225+' }
    ];

    var buckets = ranges.map(function (range) {
      return {
        label: range.label,
        min: range.min,
        max: range.max,
        shots: 0,
        solidShots: 0,
        onTargetShots: 0,
        sgSum: 0,
        sgN: 0
      };
    });

    shots.forEach(function (shot) {
      if (shot.distance == null) return;
      var bucket = buckets.find(function (entry) {
        return shot.distance >= entry.min && shot.distance < entry.max;
      });
      if (!bucket) return;
      bucket.shots++;
      if (shot.strike === 'Pure / Solid') bucket.solidShots++;
      if (shot.result === 'On Target') bucket.onTargetShots++;
      var sg = shot.sg != null ? shot.sg : core.calcSG(shot);
      if (sg != null) {
        bucket.sgSum += sg;
        bucket.sgN++;
      }
    });

    return buckets.filter(function (bucket) { return bucket.shots > 0; }).map(function (bucket) {
      return {
        label: bucket.label,
        shots: bucket.shots,
        solidRate: Math.round(bucket.solidShots / bucket.shots * 100),
        onTargetRate: Math.round(bucket.onTargetShots / bucket.shots * 100),
        sgAvg: bucket.sgN ? bucket.sgSum / bucket.sgN : null,
        sgTotal: bucket.sgN ? bucket.sgSum : null
      };
    });
  }

  function buildStatsSnapshot(options) {
    var rounds = options.rounds || [];
    var shots = options.shots || [];
    var courses = options.courses || [];
    var statsFilter = options.statsFilter || 'all';
    var statsDateFrom = options.statsDateFrom || '';
    var statsDateTo = options.statsDateTo || '';
    var roundById = {};
    rounds.forEach(function (round) {
      roundById[round.id] = round;
    });

    var filteredShots = shots.filter(function (shot) {
      if (shot.synthetic) return false;
      if (shot.roundId) {
        var round = roundById[shot.roundId];
        if (!round) return false;
        if (statsFilter !== 'all') {
          var type = round.type || 'outdoor';
          if (type !== statsFilter) return false;
        }
        var shotDate = shot.date || round.date || '';
        if (statsDateFrom && shotDate < statsDateFrom) return false;
        if (statsDateTo && shotDate > statsDateTo) return false;
        return true;
      }
      if (statsFilter !== 'all') return false;
      var date = shot.date || '';
      if (statsDateFrom && date < statsDateFrom) return false;
      if (statsDateTo && date > statsDateTo) return false;
      return true;
    });

    var filteredRoundIds = {};
    filteredShots.forEach(function (shot) {
      if (shot.roundId) filteredRoundIds[shot.roundId] = true;
    });
    var filteredRounds = rounds.filter(function (round) {
      return !!filteredRoundIds[round.id];
    });
    var traditionalShots = shots.filter(function (shot) {
      if (!shot.roundId || !filteredRoundIds[shot.roundId]) return false;
      var round = roundById[shot.roundId];
      var shotDate = shot.date || (round ? round.date : '') || '';
      if (statsDateFrom && shotDate < statsDateFrom) return false;
      if (statsDateTo && shotDate > statsDateTo) return false;
      return true;
    });

    var statsModes = {};
    filteredShots.forEach(function (shot) {
      if (!shot.roundId) {
        statsModes.practice = true;
        return;
      }
      var round = roundById[shot.roundId];
      var type = round && round.type ? round.type : 'outdoor';
      statsModes[type] = true;
    });
    var statsModeKeys = Object.keys(statsModes);
    var statsMode = statsModeKeys.length === 1 ? statsModeKeys[0] : (statsModeKeys.length ? 'mixed' : 'none');
    var hasPracticeShots = !!statsModes.practice;

    var withDistance = filteredShots.filter(function (shot) { return shot.distance != null; });
    var avgDistance = withDistance.length
      ? (withDistance.reduce(function (sum, shot) { return sum + shot.distance; }, 0) / withDistance.length).toFixed(1)
      : '—';
    var pureShots = filteredShots.filter(function (shot) { return shot.strike === 'Pure / Solid'; }).length;
    var onTargetShots = filteredShots.filter(function (shot) { return shot.result === 'On Target'; }).length;

    var sgByCat = {};
    ['Off the Tee', 'Approach', 'Around the Green', 'Putting'].forEach(function (category) {
      sgByCat[category] = { sum: 0, n: 0 };
    });
    var sgByClub = {};
    var sgTotal = 0;
    var sgN = 0;
    filteredShots.forEach(function (shot) {
      var club = shot.club || '(no club)';
      if (!sgByClub[club]) {
        sgByClub[club] = {
          totalShots: 0,
          solidShots: 0,
          onTargetShots: 0,
          gainSum: 0,
          gainN: 0,
          sum: 0,
          n: 0
        };
      }
      sgByClub[club].totalShots++;
      if (shot.strike === 'Pure / Solid') sgByClub[club].solidShots++;
      if (shot.result === 'On Target') sgByClub[club].onTargetShots++;
      if (shot.distance != null && shot.end_distance != null) {
        sgByClub[club].gainSum += (shot.distance - shot.end_distance);
        sgByClub[club].gainN++;
      }

      var sg = shot.sg != null ? shot.sg : core.calcSG(shot);
      if (sg == null) return;
      sgTotal += sg;
      sgN++;
      var category = core.sgCategory(shot);
      sgByCat[category].sum += sg;
      sgByCat[category].n++;
      sgByClub[club].sum += sg;
      sgByClub[club].n++;
    });

    var roundSummaries = buildRoundSummaries(filteredRounds, filteredShots, courses);
    var scoringByPar = buildScoringByPar(filteredRounds, filteredShots, courses);
    var driveStats = buildDriveStats(filteredShots);
    var distanceBuckets = buildDistanceBuckets(filteredShots);

    return {
      filteredRounds: filteredRounds,
      filteredShots: filteredShots,
      statsMode: statsMode,
      hasPracticeShots: hasPracticeShots,
      roundSummaries: roundSummaries,
      scoringByPar: scoringByPar,
      driveStats: driveStats,
      distanceBuckets: distanceBuckets,
      avgDistance: avgDistance,
      pureShots: pureShots,
      pureRate: filteredShots.length ? Math.round(pureShots / filteredShots.length * 100) : 0,
      onTargetShots: onTargetShots,
      onTargetRate: filteredShots.length ? Math.round(onTargetShots / filteredShots.length * 100) : 0,
      traditional: buildTraditionalStats(filteredRounds, traditionalShots, courses),
      sgByCat: sgByCat,
      sgByClub: sgByClub,
      sgTotal: sgTotal,
      sgN: sgN
    };
  }

  function buildTargetHcpModel(sgByCat, sgN, settings) {
    var targetHcp = settings.targetHcp;
    var currentHcp = settings.hcp;
    if (targetHcp == null) {
      return { state: 'missing-target' };
    }
    if (sgN === 0) {
      return { state: 'missing-sg' };
    }

    var categories = ['Off the Tee', 'Approach', 'Around the Green', 'Putting'];
    var gapData = categories.map(function (category) {
      var data = sgByCat[category];
      if (!data || data.n === 0) {
        return {
          cat: category,
          current: null,
          target: core.sgTargetPerShot(targetHcp, category),
          baseline: core.sgTargetPerShot(currentHcp, category),
          gap: null,
          gapPerRound: null,
          n: 0
        };
      }

      var current = data.sum / data.n;
      var target = core.sgTargetPerShot(targetHcp, category);
      var gap = current - target;
      return {
        cat: category,
        current: current,
        target: target,
        baseline: core.sgTargetPerShot(currentHcp, category),
        gap: gap,
        gapPerRound: gap * core.SG_HCP_REF_SHOTS[category],
        n: data.n
      };
    });

    var ranked = gapData.filter(function (entry) { return entry.gap != null; })
      .slice()
      .sort(function (a, b) { return a.gap - b.gap; });
    var priorityMap = {};
    ranked.forEach(function (entry, index) {
      priorityMap[entry.cat] = entry.gap < -0.05 ? index + 1 : 0;
    });

    return {
      state: 'ready',
      targetHcp: targetHcp,
      currentHcp: currentHcp,
      categories: categories,
      gapData: gapData,
      priorityMap: priorityMap
    };
  }

  return {
    inferEndLieValue: inferEndLieValue,
    defaultPars: defaultPars,
    roundShotCount: roundShotCount,
    roundScore: roundScore,
    computeHoleStats: computeHoleStats,
    buildScorecardModel: buildScorecardModel,
    buildTraditionalStats: buildTraditionalStats,
    buildStatsSnapshot: buildStatsSnapshot,
    buildTargetHcpModel: buildTargetHcpModel
  };
});
