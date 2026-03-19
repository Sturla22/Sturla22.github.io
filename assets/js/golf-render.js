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

  function fmtNumber(value, decimals) {
    if (value == null || isNaN(value)) return '—';
    return Number(value).toFixed(decimals != null ? decimals : 1);
  }

  function fmtSigned(value, decimals) {
    if (value == null || isNaN(value)) return '—';
    var amount = Number(value);
    return (amount >= 0 ? '+' : '') + amount.toFixed(decimals != null ? decimals : 1);
  }

  function pct(hit, opp) {
    return opp > 0 ? Math.round(hit / opp * 100) : null;
  }

  function renderOverviewHero(snapshot) {
    var traditional = snapshot.traditional;
    var roundCount = snapshot.filteredRounds.length;
    var holeCount = traditional.holes || 0;
    var avgDiff = traditional.scoredHoles > 0 ? traditional.scoreDiff / traditional.scoredHoles : null;
    var modeLabel = snapshot.statsMode === 'indoor'
      ? 'Indoor'
      : snapshot.statsMode === 'outdoor'
        ? 'Outdoor'
        : snapshot.hasPracticeShots
          ? 'Mixed + practice'
          : 'All shots';

    var trendItems = snapshot.roundSummaries.slice(-6);
    var trendMax = trendItems.reduce(function (max, round) {
      return Math.max(max, Math.abs(round.diff || 0));
    }, 1);
    var trendHtml = trendItems.length
      ? trendItems.map(function (round) {
          var height = 20 + Math.round((Math.abs(round.diff || 0) / trendMax) * 36);
          var tone = round.diff <= 0 ? 'is-good' : 'is-bad';
          return '<div class="gt-trend-bar-wrap">' +
            '<div class="gt-trend-bar ' + tone + '" style="height:' + height + 'px"></div>' +
            '<div class="gt-trend-label">' + esc(round.date.slice(5)) + '</div>' +
          '</div>';
        }).join('')
      : '<p class="gt-muted-note">Complete a round to see trend bars.</p>';

    return '<section class="gt-stats-hero">' +
      '<div class="gt-stats-hero-main">' +
        '<div class="gt-kicker-row">' +
          '<span class="gt-kicker">Overview</span>' +
          '<span class="gt-mode-chip">' + esc(modeLabel) + '</span>' +
        '</div>' +
        '<div class="gt-hero-value">' + fmtSigned(avgDiff, 2) + '</div>' +
        '<div class="gt-hero-label">Average vs par per completed hole</div>' +
        '<div class="gt-hero-meta">' +
          '<span>' + roundCount + ' round' + (roundCount !== 1 ? 's' : '') + '</span>' +
          '<span>' + holeCount + ' completed hole' + (holeCount !== 1 ? 's' : '') + '</span>' +
          '<span>' + snapshot.filteredShots.length + ' shots</span>' +
        '</div>' +
      '</div>' +
      '<div class="gt-stats-hero-side">' +
        '<div class="gt-kicker">Recent rounds</div>' +
        '<div class="gt-trend-bars">' + trendHtml + '</div>' +
      '</div>' +
    '</section>';
  }

  function countByValue(shots, field, aliases) {
    var counts = {};
    (aliases || []).forEach(function (entry) {
      counts[entry.key] = 0;
    });
    shots.forEach(function (shot) {
      var raw = shot[field] || '';
      var matched = false;
      (aliases || []).forEach(function (entry) {
        if (entry.values.indexOf(raw) !== -1) {
          counts[entry.key] += 1;
          matched = true;
        }
      });
      if (!matched && counts.other != null) counts.other += 1;
    });
    return counts;
  }

  function renderDirectionalWidget(shots) {
    var aliases = [
      { key: 'left', values: ['Left'] },
      { key: 'center', values: ['On Target'] },
      { key: 'right', values: ['Right'] },
      { key: 'long', values: ['Long'] },
      { key: 'short', values: ['Short'] }
    ];
    var counts = countByValue(shots, 'result', aliases);
    var total = aliases.reduce(function (sum, entry) { return sum + counts[entry.key]; }, 0);
    if (!total) {
      return '<div class="gt-analysis-card"><div class="gt-kicker">Direction</div><p class="gt-muted-note">No result data yet.</p></div>';
    }

    function pctText(key) {
      return Math.round((counts[key] || 0) / total * 100) + '%';
    }

    var centerPct = Math.round((counts.center || 0) / total * 100);

    return '<div class="gt-analysis-card">' +
      '<div class="gt-kicker">Direction</div>' +
      '<div class="gt-analysis-hero-value">' + centerPct + '%</div>' +
      '<div class="gt-analysis-hero-label">On target</div>' +
      '<div class="gt-direction-grid">' +
        '<div class="gt-direction-side"><span class="gt-direction-label">Left</span><strong>' + pctText('left') + '</strong></div>' +
        '<div class="gt-direction-center">' +
          '<div class="gt-direction-ring"><div class="gt-direction-ring-core">' + total + '<span>shots</span></div></div>' +
        '</div>' +
        '<div class="gt-direction-side"><span class="gt-direction-label">Right</span><strong>' + pctText('right') + '</strong></div>' +
      '</div>' +
      '<div class="gt-direction-depth">' +
        '<span>Long ' + pctText('long') + '</span>' +
        '<span>Short ' + pctText('short') + '</span>' +
      '</div>' +
    '</div>';
  }

  function renderFinishWidget(shots) {
    var aliases = [
      { key: 'fairway', values: ['Fairway'] },
      { key: 'rough', values: ['Rough', 'Deep Rough', 'Fringe', 'Hardpan', 'Divot', 'GUR'] },
      { key: 'sand', values: ['Sand', 'Plugged'] },
      { key: 'green', values: ['Green', 'Holed'] },
      { key: 'other', values: ['Penalty area', 'OB / Lost', 'Unplayable'] }
    ];
    var counts = countByValue(shots, 'end_lie', aliases);
    var max = Math.max(1, counts.fairway, counts.rough, counts.sand, counts.green, counts.other);
    var total = counts.fairway + counts.rough + counts.sand + counts.green + counts.other;
    if (!total) {
      return '<div class="gt-analysis-card"><div class="gt-kicker">Finish lies</div><p class="gt-muted-note">No finish data yet.</p></div>';
    }

    function finishBar(label, key, tone) {
      var count = counts[key] || 0;
      var width = Math.round((count / max) * 100);
      return '<div class="gt-finish-row">' +
        '<div class="gt-finish-label">' + label + '</div>' +
        '<div class="gt-finish-track"><div class="gt-finish-fill ' + tone + '" style="width:' + width + '%"></div></div>' +
        '<div class="gt-finish-count">' + count + '</div>' +
      '</div>';
    }

    return '<div class="gt-analysis-card">' +
      '<div class="gt-kicker">Finish lies</div>' +
      '<div class="gt-analysis-hero-value">' + Math.round((counts.green || 0) / total * 100) + '%</div>' +
      '<div class="gt-analysis-hero-label">Finished on green / holed</div>' +
      '<div class="gt-finish-chart">' +
        finishBar('Fairway', 'fairway', 'tone-fairway') +
        finishBar('Rough', 'rough', 'tone-rough') +
        finishBar('Sand', 'sand', 'tone-sand') +
        finishBar('Green', 'green', 'tone-green') +
        finishBar('Other', 'other', 'tone-other') +
      '</div>' +
    '</div>';
  }

  function renderSgHero(snapshot) {
    if (snapshot.sgN === 0) {
      return '<div class="gt-analysis-card gt-analysis-card-sg">' +
        '<div class="gt-kicker">Strokes gained</div>' +
        '<div class="gt-analysis-hero-value">—</div>' +
        '<div class="gt-analysis-hero-label">Add end distance and end lie to unlock SG</div>' +
      '</div>';
    }

    var sgPerShot = snapshot.sgTotal / snapshot.sgN;
    var tone = sgPerShot >= 0 ? 'sg-pos' : 'sg-neg';
    return '<div class="gt-analysis-card gt-analysis-card-sg">' +
      '<div class="gt-kicker">Strokes gained</div>' +
      '<div class="gt-analysis-hero-value ' + tone + '">' + fmtSG(sgPerShot) + '</div>' +
      '<div class="gt-analysis-hero-label">Average SG per shot</div>' +
      '<div class="gt-analysis-meta">' + snapshot.sgN + ' shot' + (snapshot.sgN !== 1 ? 's' : '') + ' with end position logged</div>' +
    '</div>';
  }

  function renderAnalysisDeck(snapshot) {
    return '<div class="gt-analysis-deck">' +
      renderSgHero(snapshot) +
      renderDirectionalWidget(snapshot.filteredShots) +
      renderFinishWidget(snapshot.filteredShots) +
    '</div>';
  }

  function renderTraditionalSpotlights(snapshot) {
    var traditional = snapshot.traditional;
    var firPct = pct(traditional.firHit, traditional.firOpp);
    var girPct = pct(traditional.girHit, traditional.girOpp);
    var avgPutts = traditional.holes > 0 ? traditional.putts / traditional.holes : null;
    var avgDiff = traditional.scoredHoles > 0 ? traditional.scoreDiff / traditional.scoredHoles : null;
    var driveStats = snapshot.driveStats || {};

    return '<div class="gt-stats-grid gt-stats-grid-spotlight">' +
      statCard('FIR', firPct != null ? firPct + '%' : '—', traditional.firOpp > 0 ? traditional.firHit + ' / ' + traditional.firOpp + ' holes' : 'no tee-shot data') +
      statCard('GIR', girPct != null ? girPct + '%' : '—', traditional.girOpp > 0 ? traditional.girHit + ' / ' + traditional.girOpp + ' holes' : 'no completed holes') +
      statCard('Avg putts', fmtNumber(avgPutts, 2), traditional.holes > 0 ? 'per completed hole' : 'no round data') +
      statCard('Avg vs par', fmtSigned(avgDiff, 2), traditional.scoredHoles > 0 ? 'per completed hole' : 'no completed holes') +
      statCard('Tee avg', fmtNumber(driveStats.average, 1), driveStats.count > 0 ? driveStats.count + ' tee shots' : 'no tee shots') +
      statCard('Longest tee', fmtNumber(driveStats.longest, 1), driveStats.count > 0 ? 'distance gained' : 'no tee shots') +
    '</div>';
  }

  function renderScoringByPar(snapshot) {
    var items = snapshot.scoringByPar || [];
    var activeItems = items.filter(function (item) { return item.avgScore != null; });
    var chartHtml = '';
    if (!activeItems.length) {
      chartHtml = '<div class="gt-info gt-info-inline">Complete some holes to see how you score on par 3s, 4s, and 5s.</div>';
    } else {
      var maxScore = activeItems.reduce(function (max, item) { return Math.max(max, item.avgScore); }, 0);
      chartHtml = activeItems.map(function (item) {
        var height = 28 + Math.round((item.avgScore / maxScore) * 92);
        return '<div class="gt-score-by-par-item">' +
          '<div class="gt-score-by-par-value">' + item.avgScore.toFixed(1) + '</div>' +
          '<div class="gt-score-by-par-bar-wrap">' +
            '<div class="gt-score-by-par-parline">Par</div>' +
            '<div class="gt-score-by-par-bar" style="height:' + height + 'px"></div>' +
          '</div>' +
          '<div class="gt-score-by-par-label">Par ' + item.par + '</div>' +
        '</div>';
      }).join('');
    }

    return '<div class="gt-stats-split">' +
      '<div class="gt-stats-pane">' +
        '<p class="gt-section-title gt-section-title-tight">Traditional Stats (' + snapshot.traditional.holes + ' holes from ' +
          snapshot.filteredRounds.length + ' round' + (snapshot.filteredRounds.length !== 1 ? 's' : '') + ')</p>' +
        renderTraditionalSpotlights(snapshot) +
      '</div>' +
      '<div class="gt-stats-pane gt-by-par-card">' +
        '<p class="gt-section-title gt-section-title-tight">Average score by par</p>' +
        '<div class="gt-score-by-par-chart">' + chartHtml + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderTargetHcpSection(model) {
    if (!model || model.state === 'missing-target') {
      return '<div class="gt-info">Set a <strong>Target HCP</strong> in Settings to see where you need to improve to reach your goal.</div>';
    }
    if (model.state === 'mixed-filter') {
      return '<div class="gt-info">Target HCP comparison is only shown for a single mode. Filter to <strong>Outdoor</strong> or <strong>Indoor</strong> stats to compare against that handicap.</div>';
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

  function renderDistanceBucketTable(snapshot) {
    var buckets = snapshot.distanceBuckets || [];
    if (!buckets.length) {
      return '<div class="gt-info">Log shots with distance to see performance by distance bucket.</div>';
    }

    var rows = buckets.map(function (bucket) {
      return '<tr>' +
        '<td>' + esc(bucket.label) + ' m</td>' +
        '<td class="gt-muted-text">' + bucket.shots + '</td>' +
        '<td>' + bucket.onTargetRate + '%</td>' +
        '<td>' + bucket.solidRate + '%</td>' +
        '<td>' + fmtSG(bucket.sgAvg) + '</td>' +
        '<td>' + fmtSG(bucket.sgTotal, 2) + '</td>' +
      '</tr>';
    }).join('');

    return '<p class="gt-section-title">Distance buckets</p>' +
      '<div class="gt-table-wrap"><table class="gt-sg-table"><thead><tr><th>Bucket</th><th>Shots</th><th>On tgt</th><th>Solid</th><th>SG avg</th><th>SG total</th></tr></thead><tbody>' +
      rows + '</tbody></table></div>';
  }

  function renderStats(snapshot, targetHcpModel) {
    if (!snapshot.filteredShots.length) {
      return '<p class="gt-empty">No shots for this filter. Log some shots to see statistics.</p>';
    }

    var traditional = snapshot.traditional;
    var finishingCards = '';
    if (traditional.udOpp > 0 || traditional.ssOpp > 0) {
      finishingCards = '<div class="gt-stats-grid gt-stats-grid-compact">' +
        (traditional.udOpp > 0 ? statCard('Up & Down', pct(traditional.udHit, traditional.udOpp) + '%', traditional.udHit + ' / ' + traditional.udOpp + ' holes') : '') +
        (traditional.ssOpp > 0 ? statCard('Sand Save', pct(traditional.ssHit, traditional.ssOpp) + '%', traditional.ssHit + ' / ' + traditional.ssOpp + ' holes') : '') +
      '</div>';
    }
    var tradSection = traditional.holes > 0 ? renderScoringByPar(snapshot) + finishingCards : '';

    var categories = ['Off the Tee', 'Approach', 'Around the Green', 'Putting'];
    var sgCards = categories.map(function (category) {
      var data = snapshot.sgByCat[category];
      return data.n === 0 ? sgCard(category, null, 0) : sgCard(category, data.sum / data.n, data.n);
    }).join('');

    var sgClubRows = Object.keys(snapshot.sgByClub).sort().map(function (club) {
      var data = snapshot.sgByClub[club];
      var avg = data.n ? data.sum / data.n : null;
      var avgDistance = data.gainN ? data.gainSum / data.gainN : null;
      var onTarget = data.totalShots ? Math.round(data.onTargetShots / data.totalShots * 100) + '%' : '—';
      var solid = data.totalShots ? Math.round(data.solidShots / data.totalShots * 100) + '%' : '—';
      return '<tr>' +
        '<td>' + esc(club) + '</td>' +
        '<td class="gt-muted-text">' + data.totalShots + '</td>' +
        '<td>' + (avgDistance != null ? avgDistance.toFixed(1) + ' m' : '—') + '</td>' +
        '<td>' + onTarget + '</td>' +
        '<td>' + solid + '</td>' +
        '<td>' + fmtSG(avg) + '</td>' +
        '<td>' + fmtSG(data.sum, 2) + '</td>' +
      '</tr>';
    }).join('');

    var sgSection = snapshot.sgN === 0
      ? '<div class="gt-info">Strokes Gained requires <strong>End distance</strong> and <strong>End lie</strong> to be filled in when logging shots. Log a few shots with end positions to see SG stats.</div>'
      : '<div class="gt-sg-grid">' + sgCards + '</div>' +
        '<p class="gt-section-title">Club summary</p>' +
        '<div class="gt-table-wrap"><table class="gt-sg-table"><thead><tr><th>Club</th><th>Shots</th><th>Avg distance</th><th>On tgt</th><th>Solid</th><th>SG avg</th><th>SG total</th></tr></thead><tbody>' +
        sgClubRows + '</tbody></table></div>' +
        '<p class="gt-info gt-info-spaced">Baseline: scratch golfer reference. Positive = gained strokes vs baseline; negative = lost strokes.</p>';

    return renderOverviewHero(snapshot) +
      renderAnalysisDeck(snapshot) +
      '<div class="gt-stats-grid gt-stats-grid-summary">' +
      statCard('Total shots', snapshot.filteredShots.length, '') +
      statCard('SG logged', snapshot.filteredShots.length ? Math.round(snapshot.sgN / snapshot.filteredShots.length * 100) + '%' : '—', snapshot.sgN + ' shots with end position') +
      statCard('Solid strike', snapshot.pureRate + '%', snapshot.pureShots + ' shots') +
      statCard('On target', snapshot.onTargetRate + '%', snapshot.onTargetShots + ' shots') +
      '</div>' +
      tradSection +
      '<p class="gt-section-title">Strokes Gained vs Scratch</p>' +
      sgSection +
      renderDistanceBucketTable(snapshot) +
      renderTargetHcpSection(targetHcpModel) +
      '<div class="gt-stats-split gt-stats-split-bottom">' +
        '<div class="gt-stats-pane">' +
          barChart('Result distribution', 'result', snapshot.filteredShots) +
          barChart('Strike distribution', 'strike', snapshot.filteredShots) +
        '</div>' +
        '<div class="gt-stats-pane">' +
          barChart('Club usage', 'club', snapshot.filteredShots) +
          barChart('Lie distribution', 'lie', snapshot.filteredShots) +
        '</div>' +
      '</div>';
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
      var isFront = from === 1;
      var subLabel = isFront ? 'Out' : 'In';
      var showTotal = !isFront;
      var lengthRow = model.hasLengths ? '<tr class="sc-par-row gt-scorecard-length-row"><td class="sc-hole-label">Length</td>' : null;
      var parRow = '<tr class="sc-par-row"><td class="sc-hole-label">Par</td>';
      var scoreRow = '<tr><td class="sc-hole-label">Score</td>';
      var diffRow = '<tr><td class="sc-hole-label">+/−</td>';
      var sgRow = '<tr><td class="sc-hole-label">SG</td>';
      var puttsRow = '<tr><td class="sc-hole-label">Putts</td>';
      var firRow = '<tr><td class="sc-hole-label">FIR</td>';
      var girRow = '<tr><td class="sc-hole-label">GIR</td>';
      var updownRow = '<tr><td class="sc-hole-label">Up&amp;Down</td>';
      var sandSaveRow = '<tr><td class="sc-hole-label">Sand Save</td>';
      var subtotalPar = 0;
      var subtotalScore = 0;
      var subtotalLength = 0;
      var subtotalSg = 0;
      var totalParAll = model.effectivePars.reduce(function (sum, value) { return sum + value; }, 0);
      var totalScoreAll = model.totals.score || 0;
      var totalDiffAll = totalScoreAll ? totalScoreAll - totalParAll : null;
      var totalLengthAll = model.holeLengths.reduce(function (sum, value) { return sum + (value || 0); }, 0);
      var totalSgAll = model.totals.sg || 0;

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
          sgRow += '<td class="sc-na">—</td>';
          puttsRow += '<td class="sc-na">—</td>';
          firRow += '<td class="sc-na">—</td>';
          girRow += '<td class="sc-na">—</td>';
          updownRow += '<td class="sc-na">—</td>';
          sandSaveRow += '<td class="sc-na">—</td>';
        } else {
          subtotalScore += holeStats.holed ? holeStats.score : 0;
          subtotalSg += holeStats.sg || 0;
          var diffClass = scoreClass(holeStats.diff);
          scoreRow += '<td class="' + diffClass + '">' + (holeStats.holed ? holeStats.score : '—') + '</td>';
          var diffText = holeStats.diff != null
            ? (holeStats.diff > 0 ? '+' + holeStats.diff : holeStats.diff === 0 ? 'E' : holeStats.diff)
            : '—';
          diffRow += '<td class="' + diffClass + '">' + diffText + '</td>';
          sgRow += '<td>' + fmtSG(holeStats.sg, 2) + '</td>';
          puttsRow += '<td>' + holeStats.putts + (holeStats.fixedPutts != null ? '*' : '') + '</td>';
          firRow += (par >= 4 ? yesNoCell(holeStats.fir) : '<td class="sc-na">—</td>');
          girRow += yesNoCell(holeStats.gir);
          updownRow += yesNoCell(holeStats.updown);
          sandSaveRow += yesNoCell(holeStats.sandSave);
        }
      }

      if (lengthRow != null) {
        lengthRow += '<td class="sc-total gt-scorecard-length-total">' + (subtotalLength || '—') + '</td>';
        if (showTotal) lengthRow += '<td class="sc-total gt-scorecard-length-total">' + (totalLengthAll || '—') + '</td>';
        lengthRow += '</tr>';
      }
      parRow += '<td class="sc-total">' + subtotalPar + '</td>';
      if (showTotal) parRow += '<td class="sc-total">' + totalParAll + '</td>';
      parRow += '</tr>';
      scoreRow += '<td class="sc-total">' + (subtotalScore || '—') + '</td>';
      if (showTotal) scoreRow += '<td class="sc-total">' + (totalScoreAll || '—') + '</td>';
      scoreRow += '</tr>';
      var subtotalDiff = subtotalScore - subtotalPar;
      diffRow += '<td class="sc-total">' + (subtotalScore ? (subtotalDiff > 0 ? '+' + subtotalDiff : subtotalDiff === 0 ? 'E' : subtotalDiff) : '—') + '</td>';
      if (showTotal) diffRow += '<td class="sc-total">' + (totalDiffAll != null ? (totalDiffAll > 0 ? '+' + totalDiffAll : totalDiffAll === 0 ? 'E' : totalDiffAll) : '—') + '</td>';
      diffRow += '</tr>';
      sgRow += '<td class="sc-total">' + fmtSG(subtotalSg, 2) + '</td>';
      if (showTotal) sgRow += '<td class="sc-total">' + fmtSG(totalSgAll, 2) + '</td>';
      sgRow += '</tr>';
      puttsRow += '<td class="sc-total"></td>';
      if (showTotal) puttsRow += '<td class="sc-total"></td>';
      puttsRow += '</tr>';
      firRow += '<td class="sc-total"></td>';
      if (showTotal) firRow += '<td class="sc-total"></td>';
      firRow += '</tr>';
      girRow += '<td class="sc-total"></td>';
      if (showTotal) girRow += '<td class="sc-total"></td>';
      girRow += '</tr>';
      updownRow += '<td class="sc-total"></td>';
      if (showTotal) updownRow += '<td class="sc-total"></td>';
      updownRow += '</tr>';
      sandSaveRow += '<td class="sc-total"></td>';
      if (showTotal) sandSaveRow += '<td class="sc-total"></td>';
      sandSaveRow += '</tr>';

      var headers = '';
      for (hole = from; hole <= to; hole++) headers += '<th>' + hole + '</th>';
      return '<thead><tr><th></th>' + headers + '<th>' + subLabel + '</th>' + (showTotal ? '<th>Total</th>' : '') + '</tr></thead><tbody>' +
        (lengthRow || '') + parRow + scoreRow + diffRow + sgRow + puttsRow + firRow + girRow + updownRow + sandSaveRow + '</tbody>';
    }

    var totalDiff = model.totals.score ? model.totals.score - model.totals.par : null;
    var totalDiffText = totalDiff != null ? (totalDiff > 0 ? '+' + totalDiff : totalDiff === 0 ? 'E' : totalDiff) : '—';
    var roundType = model.round && model.round.type === 'indoor' ? 'Indoor' : 'Course play';
    var roundTitle = model.course ? esc(model.course.name) : 'Practice round';

    var summaryCards = [
      { label: 'Score', value: model.totals.score ? model.totals.score + ' (' + totalDiffText + ')' : '—', className: totalDiff != null && totalDiff < 0 ? 'gt-sc-stat-val-positive' : 'gt-sc-stat-val-danger' },
      { label: 'SG OTT', value: fmtSG(model.totals.sgByCat['Off the Tee'], 2), className: 'gt-sc-stat-val-neutral' },
      { label: 'SG APP', value: fmtSG(model.totals.sgByCat['Approach'], 2), className: 'gt-sc-stat-val-neutral' },
      { label: 'SG ARG', value: fmtSG(model.totals.sgByCat['Around the Green'], 2), className: 'gt-sc-stat-val-neutral' },
      { label: 'SG PUTT', value: fmtSG(model.totals.sgByCat['Putting'], 2), className: 'gt-sc-stat-val-neutral' },
      { label: 'Putts', value: model.totals.putts || '—', className: 'gt-sc-stat-val-neutral' },
      { label: 'FIR', value: model.totals.firOpp ? model.totals.firHit + '/' + model.totals.firOpp + ' (' + Math.round(model.totals.firHit / model.totals.firOpp * 100) + '%)' : '—', className: 'gt-sc-stat-val-neutral' },
      { label: 'GIR', value: model.totals.girHit + '/18 (' + Math.round(model.totals.girHit / 18 * 100) + '%)', className: 'gt-sc-stat-val-neutral' },
      { label: 'Up & Down', value: model.totals.udOpp ? model.totals.udHit + '/' + model.totals.udOpp + ' (' + Math.round(model.totals.udHit / model.totals.udOpp * 100) + '%)' : '—', className: 'gt-sc-stat-val-neutral' },
      { label: 'Sand Saves', value: model.totals.ssOpp ? model.totals.ssHit + '/' + model.totals.ssOpp + ' (' + Math.round(model.totals.ssHit / model.totals.ssOpp * 100) + '%)' : '—', className: 'gt-sc-stat-val-neutral' }
    ].map(function (card) {
      return '<div class="gt-sc-stat"><div class="gt-sc-stat-val ' + card.className + '">' + card.value + '</div><div class="gt-sc-stat-label">' + card.label + '</div></div>';
    }).join('');

    var performanceRows = [
      { label: 'Fairways hit', round: model.totals.firOpp ? Math.round(model.totals.firHit / model.totals.firOpp * 100) + '% (' + model.totals.firHit + '/' + model.totals.firOpp + ')' : '—', avg: 'Target' },
      { label: 'Greens in regulation', round: model.totals.girHit + '/18 (' + Math.round(model.totals.girHit / 18 * 100) + '%)', avg: 'Target' },
      { label: 'Putts', round: model.totals.putts || '—', avg: 'Round' },
      { label: 'SG Approach', round: fmtSG(model.totals.sgByCat['Approach'], 2), avg: 'Round' },
      { label: 'SG Putting', round: fmtSG(model.totals.sgByCat['Putting'], 2), avg: 'Round' }
    ].map(function (row) {
      return '<tr>' +
        '<td>' + row.label + '</td>' +
        '<td>' + row.round + '</td>' +
        '<td class="gt-muted-text">' + row.avg + '</td>' +
      '</tr>';
    }).join('');

    var scoreBreakdownRows = [
      { label: 'Eagles-', value: model.scoreBreakdown.eaglesMinus },
      { label: 'Birdies', value: model.scoreBreakdown.birdies },
      { label: 'Pars', value: model.scoreBreakdown.pars },
      { label: 'Bogeys', value: model.scoreBreakdown.bogeys },
      { label: 'Double bogeys+', value: model.scoreBreakdown.doublePlus }
    ].map(function (row) {
      return '<div class="gt-breakdown-row"><span>' + row.label + '</span><strong>' + row.value + '</strong></div>';
    }).join('');

    return '<div class="gt-scorecard-hero">' +
      '<div class="gt-scorecard-hero-copy">' +
        '<div class="gt-scorecard-hero-title">' + roundTitle + '</div>' +
        '<div class="gt-scorecard-hero-meta">' + esc(model.round.date || '') + ' · ' + roundType + '</div>' +
      '</div>' +
      '<div class="gt-scorecard-hero-stats">' +
        '<div class="gt-scorecard-hero-stat"><span>Holes</span><strong>' + model.holeData.filter(Boolean).length + '</strong></div>' +
        '<div class="gt-scorecard-hero-stat"><span>Strokes</span><strong>' + (model.totals.score || '—') + '</strong></div>' +
        '<div class="gt-scorecard-hero-stat"><span>Putts</span><strong>' + (model.totals.putts || '—') + '</strong></div>' +
      '</div>' +
    '</div>' +
      '<div class="gt-scorecard-summary">' + summaryCards + '</div>' +
      '<p class="gt-section-title gt-section-title-spaced-lg">Performance</p>' +
      '<p class="gt-muted-note gt-info-spaced-sm">Insights on your round performance.</p>' +
      '<div class="gt-table-wrap"><table class="gt-sg-table gt-performance-table"><thead><tr><th>Metric</th><th>Round</th><th>Context</th></tr></thead><tbody>' +
      performanceRows + '</tbody></table></div>' +
      '<p class="gt-section-title gt-section-title-spaced-lg">Front 9</p>' +
      '<div class="gt-scorecard-wrap"><table class="gt-scorecard">' + buildHalf(1, 9) + '</table></div>' +
      '<p class="gt-section-title gt-section-title-spaced">Back 9</p>' +
      '<div class="gt-scorecard-wrap"><table class="gt-scorecard">' + buildHalf(10, 18) + '</table></div>' +
      '<p class="gt-section-title gt-section-title-spaced-lg">Score Breakdown</p>' +
      '<div class="gt-breakdown-card">' + scoreBreakdownRows + '</div>' +
      (model.hasFixedPutts ? '<p class="gt-info gt-info-spaced-sm">* Fixed putting (simulator). Putts were auto-assigned based on proximity; excluded from SG Putting.</p>' : '');
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
