(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./golf-core.js'), require('./golf-domain.js'));
  } else {
    root.GolfTrackerRender = factory(root.GolfTrackerCore, root.GolfTrackerDomain);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, domain) {
  'use strict';

  if (!core) throw new Error('GolfTrackerCore is required for GolfTrackerRender');
  if (!domain) throw new Error('GolfTrackerDomain is required for GolfTrackerRender');

  /*
   * Presentation helpers for the golf tracker. Rendering stays string-based for
   * compatibility, but the HTML generation is isolated from the controller.
   */
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escAttr(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function fmtSG(val, decimals) {
    if (val == null) return '<span class="sg-zero">—</span>';
    var d = decimals != null ? decimals : 2;
    var text = (val >= 0 ? '+' : '') + val.toFixed(d);
    var className = val > 0.01 ? 'sg-pos' : val < -0.01 ? 'sg-neg' : 'sg-zero';
    return '<span class="' + className + '">' + text + '</span>';
  }

  function renderClubDistanceTables(settings) {
    var bag = settings.bag || core.ALL_CLUBS;
    var clubDistances = settings.clubDistances || {};
    var nonWedgeClubs = bag.filter(function (club) {
      return core.WEDGES.indexOf(club) === -1 && club !== 'Putter';
    });

    var clubTableHtml = '';
    if (nonWedgeClubs.length) {
      var headers = nonWedgeClubs.map(function (club) {
        return '<th>' + esc(club) + '</th>';
      }).join('');
      var inputs = nonWedgeClubs.map(function (club) {
        var value = typeof clubDistances[club] === 'number' && clubDistances[club] > 0 ? clubDistances[club] : '';
        return '<td><input class="gt-cdist-inp" type="number" min="1" max="400" step="1" data-club="' +
          escAttr(club) + '" value="' + escAttr(value) + '" placeholder="—" inputmode="decimal"></td>';
      }).join('');
      clubTableHtml = '<thead><tr><th class="gt-club-table-label">Club</th>' + headers + '</tr></thead>' +
        '<tbody><tr><td class="gt-club-table-meta">Distance (m)</td>' + inputs + '</tr></tbody>';
    }

    var bagWedges = core.WEDGES.filter(function (club) { return bag.indexOf(club) !== -1; });
    var wedgeTableHtml = '';
    if (!bagWedges.length) {
      wedgeTableHtml = '<tr><td class="gt-table-empty-note">No wedges in bag.</td></tr>';
    } else {
      var wedgeHeader = '<thead><tr><th class="gt-club-table-label">Club</th>' +
        core.SWINGS.map(function (swing) { return '<th class="gt-wedge-hdr">' + swing + '</th>'; }).join('') +
        '</tr></thead>';
      var wedgeBody = '<tbody>' + bagWedges.map(function (club) {
        var wedgeDistances = typeof clubDistances[club] === 'object' && clubDistances[club] !== null
          ? clubDistances[club]
          : {};
        var cells = core.SWINGS.map(function (swing) {
          var value = wedgeDistances[swing] > 0 ? wedgeDistances[swing] : '';
          return '<td><input class="gt-wdist-inp" type="number" min="1" max="200" step="1" data-club="' +
            escAttr(club) + '" data-swing="' + escAttr(swing) + '" value="' + escAttr(value) + '" placeholder="—" inputmode="decimal"></td>';
        }).join('');
        return '<tr><td class="gt-wedge-row-label">' + esc(club) + '</td>' + cells + '</tr>';
      }).join('') + '</tbody>';
      wedgeTableHtml = wedgeHeader + wedgeBody;
    }

    return {
      clubTableHtml: clubTableHtml,
      wedgeTableHtml: wedgeTableHtml
    };
  }

  function renderHistory(filteredShots) {
    if (!filteredShots.length) {
      return {
        bodyHtml: '<tr><td colspan="12" class="gt-empty">No shots match the filters.</td></tr>',
        countText: ''
      };
    }

    return {
      bodyHtml: filteredShots.map(function (shot) {
        var sg = shot.sg != null ? shot.sg : core.calcSG(shot);
        return '<tr>' +
          '<td>' + esc(shot.date || '') + '</td>' +
          '<td>' + (shot.hole != null ? shot.hole : '') + '</td>' +
          '<td>' + esc(shot.club) + '</td>' +
          '<td>' + esc(shot.swing || '') + '</td>' +
          '<td>' + (shot.distance != null ? shot.distance : '') + '</td>' +
          '<td>' + esc(shot.lie) + '</td>' +
          '<td>' + esc(shot.result) + '</td>' +
          '<td>' + esc(shot.strike) + '</td>' +
          '<td>' + esc(shot.shape) + '</td>' +
          '<td class="gt-history-cell-sg">' + fmtSG(sg) + '</td>' +
          '<td class="gt-history-cell-notes">' + esc(shot.notes) + '</td>' +
          '<td><button class="gt-delete-btn" data-gt-action="delete-shot" data-id="' + escAttr(shot.id) + '" title="Delete">✕</button></td>' +
          '</tr>';
      }).join('')
    };
  }

  function statCard(label, value, sub) {
    return '<div class="gt-stat-card"><h4>' + label + '</h4>' +
      '<div class="gt-stat-val">' + value + '</div>' +
      '<div class="gt-stat-sub">' + sub + '</div></div>';
  }

  function sgCard(label, average, shots) {
    var valueHtml = average != null ? fmtSG(average) : '<span class="sg-zero">—</span>';
    return '<div class="gt-sg-card"><h4>' + label + '</h4>' +
      '<div class="gt-sg-val">' + valueHtml + '</div>' +
      '<div class="gt-sg-sub">' + (shots > 0 ? shots + ' shot' + (shots !== 1 ? 's' : '') : 'no data') + '</div></div>';
  }

  function barChart(title, field, shots) {
    var counts = {};
    shots.forEach(function (shot) {
      var value = shot[field] || '(not set)';
      counts[value] = (counts[value] || 0) + 1;
    });
    var entries = Object.keys(counts).map(function (key) { return [key, counts[key]]; });
    entries.sort(function (a, b) { return b[1] - a[1]; });
    var max = entries.length ? entries[0][1] : 1;

    var rows = entries.map(function (entry) {
      var pct = Math.round(entry[1] / max * 100);
      return '<div class="gt-bar-row">' +
        '<div class="gt-bar-label">' + esc(entry[0]) + '</div>' +
        '<div class="gt-bar-track"><div class="gt-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="gt-bar-count">' + entry[1] + '</div></div>';
    }).join('');

    return '<p class="gt-section-title">' + title + '</p><div class="gt-bar-chart">' + rows + '</div>';
  }

  function renderTargetHcpSection(model) {
    if (!model || model.state === 'missing-target') {
      return '<div class="gt-info">Set a <strong>Target HCP</strong> in Settings to see where you need to improve to reach your goal.</div>';
    }
    if (model.state === 'missing-sg') {
      return '<div class="gt-info">Log shots with end positions to see your SG vs target HCP comparison.</div>';
    }

    var cards = model.categories.map(function (category) {
      var gapData = model.gapData.find(function (entry) { return entry.cat === category; });
      if (!gapData) return '';

      var worstTarget = core.sgTargetPerShot(36, category);
      var range = 0 - worstTarget;
      var currentPct = gapData.current != null
        ? Math.max(0, Math.min(100, ((gapData.current - worstTarget) / range) * 100))
        : null;
      var targetPct = gapData.target != null
        ? Math.max(0, Math.min(100, ((gapData.target - worstTarget) / range) * 100))
        : 50;

      var toneClass = 'gt-hcp-tone-muted';
      if (gapData.gap != null) {
        toneClass = gapData.gap >= -0.01
          ? 'gt-hcp-tone-ok'
          : gapData.gap > -0.05 ? 'gt-hcp-tone-warn' : 'gt-hcp-tone-danger';
      }

      var currentLabel = gapData.current != null
        ? (gapData.current >= 0 ? '+' : '') + gapData.current.toFixed(3) + ' / shot'
        : '—';
      var targetLabel = gapData.target != null
        ? (gapData.target >= 0 ? '+' : '') + gapData.target.toFixed(3) + ' / shot'
        : '—';

      var gapHtml = '';
      if (gapData.gap != null) {
        if (gapData.gap >= -0.01) {
          gapHtml = '<div class="gt-hcp-gap gap-ahead">On track (' +
            (gapData.gapPerRound >= 0 ? '+' : '') + gapData.gapPerRound.toFixed(1) + ' / round)</div>';
        } else {
          gapHtml = '<div class="gt-hcp-gap gap-behind">Need +' + Math.abs(gapData.gapPerRound).toFixed(1) + ' strokes/round</div>';
        }
      }

      var priority = model.priorityMap[category];
      var badgeHtml = '';
      if (priority === 0) {
        badgeHtml = '<span class="gt-priority-badge priority-ok">On track</span>';
      } else if (priority === 1) {
        badgeHtml = '<span class="gt-priority-badge priority-1">#1 Priority</span>';
      } else if (priority === 2) {
        badgeHtml = '<span class="gt-priority-badge priority-2">#2 Priority</span>';
      } else if (priority === 3) {
        badgeHtml = '<span class="gt-priority-badge priority-3">#3 Priority</span>';
      }

      return '<div class="gt-hcp-card">' +
        '<h4>' + category + '</h4>' +
        '<div class="gt-hcp-card-vals">' +
          '<div class="gt-hcp-current ' + toneClass + '">' + currentLabel + '</div>' +
          '<div class="gt-hcp-target-val">Target: ' + targetLabel + '</div>' +
        '</div>' +
        '<div class="gt-hcp-bar-wrap">' +
          (currentPct != null ? '<div class="gt-hcp-bar-fill ' + toneClass + '" style="width:' + currentPct + '%"></div>' : '') +
          '<div class="gt-hcp-bar-marker" style="left:' + targetPct + '%"></div>' +
        '</div>' +
        gapHtml +
        badgeHtml +
      '</div>';
    }).join('');

    var heading = 'SG vs Target HCP ' + model.targetHcp +
      (model.currentHcp != null ? ' (current: ' + model.currentHcp + ')' : '');
    var note = 'Bar shows your current SG/shot vs the target HCP benchmark. ' +
      'Gap is shown as strokes per round using reference shot counts.';

    return '<p class="gt-section-title">' + heading + '</p>' +
      '<div class="gt-hcp-compare-grid">' + cards + '</div>' +
      '<p class="gt-info">' + note + '</p>';
  }

  function renderStats(snapshot, targetHcpModel) {
    if (!snapshot.filteredShots.length) {
      return '<p class="gt-empty">No shots for this filter. Log some shots to see statistics.</p>';
    }

    function pct(hit, opp) {
      return opp > 0 ? Math.round(hit / opp * 100) + '%' : '—';
    }

    function sub(hit, opp) {
      return opp > 0 ? hit + ' / ' + opp + ' holes' : 'no round data';
    }

    var traditional = snapshot.traditional;
    var tradSection = '';
    if (traditional.holes > 0) {
      var avgPutts = traditional.holes > 0 ? (traditional.putts / traditional.holes).toFixed(2) : '—';
      var avgScore = traditional.scoredHoles > 0
        ? (traditional.scoreDiff >= 0 ? '+' : '') + (traditional.scoreDiff / traditional.scoredHoles).toFixed(2)
        : '—';
      tradSection = '<p class="gt-section-title">Traditional Stats (' + traditional.holes + ' holes from ' +
        snapshot.filteredRounds.length + ' round' + (snapshot.filteredRounds.length !== 1 ? 's' : '') + ')</p>' +
        '<div class="gt-stats-grid">' +
          statCard('GIR', pct(traditional.girHit, traditional.girOpp), sub(traditional.girHit, traditional.girOpp)) +
          statCard('FIR', pct(traditional.firHit, traditional.firOpp), sub(traditional.firHit, traditional.firOpp)) +
          statCard('Avg putts', avgPutts, 'per hole') +
          statCard('Avg score', avgScore, 'vs par per hole') +
          (traditional.udOpp > 0 ? statCard('Up & Down', pct(traditional.udHit, traditional.udOpp), sub(traditional.udHit, traditional.udOpp)) : '') +
          (traditional.ssOpp > 0 ? statCard('Sand Save', pct(traditional.ssHit, traditional.ssOpp), sub(traditional.ssHit, traditional.ssOpp)) : '') +
        '</div>';
    }

    var categories = ['Off the Tee', 'Approach', 'Around the Green', 'Putting'];
    var sgCards = categories.map(function (category) {
      var data = snapshot.sgByCat[category];
      return data.n === 0 ? sgCard(category, null, 0) : sgCard(category, data.sum / data.n, data.n);
    }).join('');

    var sgClubRows = Object.keys(snapshot.sgByClub).sort().map(function (club) {
      var data = snapshot.sgByClub[club];
      var avg = data.sum / data.n;
      return '<tr><td>' + esc(club) + '</td><td>' + fmtSG(avg) + '</td><td class="gt-muted-text">' + data.n + '</td><td>' + fmtSG(data.sum, 2) + '</td></tr>';
    }).join('');

    var sgSummaryClass = snapshot.sgN > 0 && snapshot.sgTotal / snapshot.sgN >= 0
      ? 'gt-sg-summary-positive'
      : 'gt-sg-summary-negative';
    var sgSummaryCard = '<div class="gt-sg-card ' + sgSummaryClass + '">' +
      '<h4>Total SG (avg / shot)</h4>' +
      '<div class="gt-sg-val">' + (snapshot.sgN > 0 ? fmtSG(snapshot.sgTotal / snapshot.sgN) : '<span class="sg-zero">—</span>') + '</div>' +
      '<div class="gt-sg-sub">' + snapshot.sgN + ' shot' + (snapshot.sgN !== 1 ? 's' : '') + ' with end position logged</div></div>';

    var sgSection = snapshot.sgN === 0
      ? '<div class="gt-info">Strokes Gained requires <strong>End distance</strong> and <strong>End lie</strong> to be filled in when logging shots. Log a few shots with end positions to see SG stats.</div>'
      : '<div class="gt-sg-grid">' + sgSummaryCard + sgCards + '</div>' +
        '<p class="gt-section-title">SG by Club (avg per shot)</p>' +
        '<div class="gt-table-wrap"><table class="gt-sg-table"><thead><tr><th>Club</th><th>SG avg</th><th>Shots</th><th>SG total</th></tr></thead><tbody>' +
        sgClubRows + '</tbody></table></div>' +
        '<p class="gt-info gt-info-spaced">Baseline: scratch golfer reference. Positive = gained strokes vs baseline; negative = lost strokes.</p>';

    return '<div class="gt-stats-grid">' +
      statCard('Total shots', snapshot.filteredShots.length, '') +
      statCard('Avg distance', snapshot.avgDistance, 'm') +
      statCard('Solid strike', snapshot.pureRate + '%', snapshot.pureShots + ' shots') +
      statCard('On target', snapshot.onTargetRate + '%', snapshot.onTargetShots + ' shots') +
      '</div>' +
      tradSection +
      '<p class="gt-section-title">Strokes Gained vs Scratch</p>' +
      sgSection +
      renderTargetHcpSection(targetHcpModel) +
      barChart('Result distribution', 'result', snapshot.filteredShots) +
      barChart('Strike distribution', 'strike', snapshot.filteredShots) +
      barChart('Club usage', 'club', snapshot.filteredShots) +
      barChart('Lie distribution', 'lie', snapshot.filteredShots);
  }

  function renderCoursesList(courses) {
    if (!courses.length) {
      return '<p class="gt-empty-meta">No courses added yet.</p>';
    }

    return courses.map(function (course) {
      var totalPar = course.pars.reduce(function (sum, par) { return sum + par; }, 0);
      var teeSub = course.tees && course.tees.length
        ? ' · ' + course.tees.map(function (tee) { return esc(tee.name); }).join(', ')
        : '';
      return '<div class="gt-course-card">' +
        '<div><strong>' + esc(course.name) + '</strong><span class="gt-course-card-meta">Par ' + totalPar + teeSub + '</span></div>' +
        '<div class="gt-course-card-actions">' +
          '<button class="gt-btn gt-btn-outline gt-btn-small" data-gt-action="edit-course" data-id="' + escAttr(course.id) + '">Edit</button>' +
          '<button class="gt-delete-btn" data-gt-action="delete-course" data-id="' + escAttr(course.id) + '" title="Delete">✕</button>' +
        '</div></div>';
    }).join('');
  }

  function renderRoundsList(rounds, courses, shots, activeRoundId) {
    if (!rounds.length) {
      return '<p class="gt-empty">No rounds yet — log a shot on hole 1 to start one.</p>';
    }

    var sortedRounds = rounds.slice().sort(function (a, b) {
      return b.date < a.date ? -1 : 1;
    });

    return sortedRounds.map(function (round) {
      var course = round.courseId ? courses.find(function (item) { return item.id === round.courseId; }) : null;
      var score = domain.roundScore(round, shots, courses);
      var isActive = round.id === activeRoundId;
      var diffHtml = '';
      var strokesText = '—';
      if (score) {
        strokesText = score.strokes;
        var diffClass = score.diff < 0 ? 'gt-round-score-diff-pos' : score.diff === 0 ? 'gt-round-score-diff-even' : 'gt-round-score-diff-neg';
        diffHtml = '<div class="gt-round-score-diff ' + diffClass + '">' +
          (score.diff >= 0 ? '+' : '') + score.diff + ' (' + score.holes + ' holes)</div>';
      }
      var activeBadge = isActive ? ' <span class="gt-round-badge gt-round-badge-active">ACTIVE</span>' : '';
      var indoorBadge = round.type === 'indoor' ? ' <span class="gt-round-badge gt-round-badge-indoor">INDOOR</span>' : '';
      return '<div class="gt-round-card' + (isActive ? ' active-round' : '') + '">' +
        '<div class="gt-round-card-info">' +
          '<div class="gt-round-card-title">' + round.date + (course ? ' · ' + esc(course.name) : '') + activeBadge + indoorBadge + '</div>' +
          '<div class="gt-round-card-sub">' + (round.notes ? esc(round.notes) + ' · ' : '') + (round.teeName ? esc(round.teeName) + ' tees · ' : '') +
            domain.roundShotCount(shots, round.id) + ' shots</div>' +
        '</div>' +
        '<div><div class="gt-round-score">' + strokesText + '</div>' + diffHtml + '</div>' +
        '<div class="gt-round-card-actions">' +
          '<button class="gt-btn gt-btn-outline gt-btn-small" data-gt-action="view-scorecard" data-id="' + escAttr(round.id) + '">Scorecard</button>' +
          '<button class="gt-delete-btn" data-gt-action="delete-round" data-id="' + escAttr(round.id) + '" title="Delete">✕</button>' +
        '</div></div>';
    }).join('');
  }

  function scoreClass(diff) {
    if (diff == null) return '';
    if (diff <= -2) return 'sc-eagle';
    if (diff === -1) return 'sc-birdie';
    if (diff === 0) return 'sc-par';
    if (diff === 1) return 'sc-bogey';
    if (diff === 2) return 'sc-double';
    return 'sc-triple';
  }

  function yesNoCell(value) {
    if (value === null || value === undefined) return '<td class="sc-na">—</td>';
    return value ? '<td class="sc-yes">✓</td>' : '<td class="sc-no">✗</td>';
  }

  function renderScorecard(model) {
    function buildHalf(from, to) {
      var lengthRow = model.hasLengths ? '<tr class="sc-par-row gt-scorecard-length-row"><td class="sc-hole-label">Length</td>' : null;
      var parRow = '<tr class="sc-par-row"><td class="sc-hole-label">Par</td>';
      var scoreRow = '<tr><td class="sc-hole-label">Score</td>';
      var diffRow = '<tr><td class="sc-hole-label">+/−</td>';
      var puttsRow = '<tr><td class="sc-hole-label">Putts</td>';
      var firRow = '<tr><td class="sc-hole-label">FIR</td>';
      var girRow = '<tr><td class="sc-hole-label">GIR</td>';
      var updownRow = '<tr><td class="sc-hole-label">Up&amp;Down</td>';
      var sandSaveRow = '<tr><td class="sc-hole-label">Sand Save</td>';
      var subtotalPar = 0;
      var subtotalScore = 0;
      var subtotalLength = 0;

      for (var hole = from; hole <= to; hole++) {
        var holeStats = model.holeData[hole - 1];
        var par = model.effectivePars[hole - 1];
        if (lengthRow != null) {
          var length = model.holeLengths[hole - 1];
          lengthRow += '<td>' + (length != null ? length : '—') + '</td>';
          if (length != null) subtotalLength += length;
        }
        parRow += '<td>' + par + '</td>';
        subtotalPar += par;
        if (!holeStats) {
          scoreRow += '<td class="sc-na">—</td>';
          diffRow += '<td class="sc-na">—</td>';
          puttsRow += '<td class="sc-na">—</td>';
          firRow += '<td class="sc-na">—</td>';
          girRow += '<td class="sc-na">—</td>';
          updownRow += '<td class="sc-na">—</td>';
          sandSaveRow += '<td class="sc-na">—</td>';
        } else {
          subtotalScore += holeStats.holed ? holeStats.score : 0;
          var diffClass = scoreClass(holeStats.diff);
          scoreRow += '<td class="' + diffClass + '">' + (holeStats.holed ? holeStats.score : '—') + '</td>';
          var diffText = holeStats.diff != null
            ? (holeStats.diff > 0 ? '+' + holeStats.diff : holeStats.diff === 0 ? 'E' : holeStats.diff)
            : '—';
          diffRow += '<td class="' + diffClass + '">' + diffText + '</td>';
          puttsRow += '<td>' + holeStats.putts + (holeStats.fixedPutts != null ? '*' : '') + '</td>';
          firRow += (par >= 4 ? yesNoCell(holeStats.fir) : '<td class="sc-na">—</td>');
          girRow += yesNoCell(holeStats.gir);
          updownRow += yesNoCell(holeStats.updown);
          sandSaveRow += yesNoCell(holeStats.sandSave);
        }
      }

      if (lengthRow != null) {
        lengthRow += '<td class="sc-total gt-scorecard-length-total">' + (subtotalLength || '—') + '</td></tr>';
      }
      parRow += '<td class="sc-total">' + subtotalPar + '</td></tr>';
      scoreRow += '<td class="sc-total">' + (subtotalScore || '—') + '</td></tr>';
      var subtotalDiff = subtotalScore - subtotalPar;
      diffRow += '<td class="sc-total">' + (subtotalScore ? (subtotalDiff > 0 ? '+' + subtotalDiff : subtotalDiff === 0 ? 'E' : subtotalDiff) : '—') + '</td></tr>';
      puttsRow += '<td class="sc-total"></td></tr>';
      firRow += '<td class="sc-total"></td></tr>';
      girRow += '<td class="sc-total"></td></tr>';
      updownRow += '<td class="sc-total"></td></tr>';
      sandSaveRow += '<td class="sc-total"></td></tr>';

      var headers = '';
      for (hole = from; hole <= to; hole++) headers += '<th>' + hole + '</th>';
      return '<thead><tr><th></th>' + headers + '<th>Sub</th></tr></thead><tbody>' +
        (lengthRow || '') + parRow + scoreRow + diffRow + puttsRow + firRow + girRow + updownRow + sandSaveRow + '</tbody>';
    }

    var totalDiff = model.totals.score ? model.totals.score - model.totals.par : null;
    var totalDiffText = totalDiff != null ? (totalDiff > 0 ? '+' + totalDiff : totalDiff === 0 ? 'E' : totalDiff) : '—';

    var summaryCards = [
      { label: 'Score', value: model.totals.score ? model.totals.score + ' (' + totalDiffText + ')' : '—', className: totalDiff != null && totalDiff < 0 ? 'gt-sc-stat-val-positive' : 'gt-sc-stat-val-danger' },
      { label: 'Putts', value: model.totals.putts || '—', className: 'gt-sc-stat-val-neutral' },
      { label: 'FIR', value: model.totals.firOpp ? model.totals.firHit + '/' + model.totals.firOpp + ' (' + Math.round(model.totals.firHit / model.totals.firOpp * 100) + '%)' : '—', className: 'gt-sc-stat-val-neutral' },
      { label: 'GIR', value: model.totals.girHit + '/18 (' + Math.round(model.totals.girHit / 18 * 100) + '%)', className: 'gt-sc-stat-val-neutral' },
      { label: 'Up & Down', value: model.totals.udOpp ? model.totals.udHit + '/' + model.totals.udOpp + ' (' + Math.round(model.totals.udHit / model.totals.udOpp * 100) + '%)' : '—', className: 'gt-sc-stat-val-neutral' },
      { label: 'Sand Saves', value: model.totals.ssOpp ? model.totals.ssHit + '/' + model.totals.ssOpp + ' (' + Math.round(model.totals.ssHit / model.totals.ssOpp * 100) + '%)' : '—', className: 'gt-sc-stat-val-neutral' }
    ].map(function (card) {
      return '<div class="gt-sc-stat"><div class="gt-sc-stat-val ' + card.className + '">' + card.value + '</div><div class="gt-sc-stat-label">' + card.label + '</div></div>';
    }).join('');

    return '<div class="gt-scorecard-summary">' + summaryCards + '</div>' +
      '<p class="gt-section-title gt-section-title-spaced-lg">Front 9</p>' +
      '<div class="gt-scorecard-wrap"><table class="gt-scorecard">' + buildHalf(1, 9) + '</table></div>' +
      '<p class="gt-section-title gt-section-title-spaced">Back 9</p>' +
      '<div class="gt-scorecard-wrap"><table class="gt-scorecard">' + buildHalf(10, 18) + '</table></div>' +
      (model.hasFixedPutts ? '<p class="gt-info gt-info-spaced-sm">* Fixed putting (simulator). Putts were auto-assigned based on proximity; excluded from SG Putting.</p>' : '') +
      (model.totals.sg !== 0 ? '<p class="gt-info gt-info-spaced">Round SG: ' + fmtSG(model.totals.sg, 2) + '</p>' : '');
  }

  return {
    esc: esc,
    escAttr: escAttr,
    fmtSG: fmtSG,
    renderClubDistanceTables: renderClubDistanceTables,
    renderHistory: renderHistory,
    renderStats: renderStats,
    renderTargetHcpSection: renderTargetHcpSection,
    renderCoursesList: renderCoursesList,
    renderRoundsList: renderRoundsList,
    renderScorecard: renderScorecard
  };
});
