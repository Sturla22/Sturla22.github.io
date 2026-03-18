(function () {
  var core = window.GolfTrackerCore;
  var selectors = window.GolfTrackerSelectors;
  var storage = window.GolfTrackerStorage;
  var domain = window.GolfTrackerDomain;
  var render = window.GolfTrackerRender;
  if (!core) throw new Error('GolfTrackerCore failed to load');
  if (!selectors) throw new Error('GolfTrackerSelectors failed to load');
  if (!storage) throw new Error('GolfTrackerStorage failed to load');
  if (!domain) throw new Error('GolfTrackerDomain failed to load');
  if (!render) throw new Error('GolfTrackerRender failed to load');

  /*
   * GolfTrackerController coordinates DOM events and browser state. Persistence,
   * scoring/stats, and HTML generation live in dedicated modules so this file
   * can focus on page orchestration and form flow.
   */

  var ALL_CLUBS = core.ALL_CLUBS;
  var WEDGES = core.WEDGES;
  var SWINGS = core.SWINGS;
  var defaultSettings = core.defaultSettings;
  var calcSG = core.calcSG;
  var byId = selectors.byId;
  var query = selectors.query;
  var queryAll = selectors.queryAll;
  var load = storage.loadShots;
  var save = storage.saveShots;
  var loadSettings = storage.loadSettings;
  var saveSettings = storage.saveSettings;
  var loadRounds = storage.loadRounds;
  var saveRounds = storage.saveRounds;
  var loadCourses = storage.loadCourses;
  var saveCourses = storage.saveCourses;
  var normalizeImportId = storage.normalizeImportId;
  var fmtSG = render.fmtSG;
  var esc = render.esc;
  var escAttr = render.escAttr;
  var inferEndLieValue = domain.inferEndLieValue;
  var roundScore = domain.roundScore;
  var computeHoleStats = domain.computeHoleStats;

  function gtApplySettingsToUI() {
    var settings = loadSettings();
    byId('hcp').value = settings.hcp != null ? settings.hcp : '';
    byId('targetHcp').value = settings.targetHcp != null ? settings.targetHcp : '';
    byId('hcpIndoor').value = settings.hcpIndoor != null ? settings.hcpIndoor : '';
    byId('targetHcpIndoor').value = settings.targetHcpIndoor != null ? settings.targetHcpIndoor : '';
    byId('fixedPutting').checked = !!settings.fixedPutting;
    queryAll('bagPillButtons').forEach(function (p) {
      p.classList.remove('selected');
      if ((settings.bag || ALL_CLUBS).indexOf(p.textContent.trim()) !== -1) p.classList.add('selected');
    });
    applyBag(settings.bag || ALL_CLUBS.slice());
    gtRenderClubDistTables();
    gtUpdateProximityRow();
    return settings;
  }

  function gtShowSettingsNotice(msg) {
    var notice = byId('settingsNotice');
    notice.textContent = msg;
    setVisible(notice, true, 'block');
    clearTimeout(notice._t);
    notice._t = setTimeout(function () { setVisible(notice, false); }, 2500);
  }

  function gtResetFormUI() {
    clearForm();
    byId('date').value = today();
    setVisible(byId('moreSection'), false);
    byId('moreButton').textContent = '▸ Strike, shape & notes';
    gtUpdateShotProgress();
  }

  function gtRefreshTrackerUI() {
    populateClubFilter();
    gtRenderHistory();
    gtRenderCoursesList();
    gtShowRoundsList();
    gtRenderRoundsList();
    gtApplySettingsToUI();
    populateCourseCtxDropdown();
    populateTeeDropdown(currentCourseId());
    gtUpdateRoundCtxLabel();
    gtRenderStats();
    gtResetFormUI();
    gtHoleChanged();
  }

  function gtHasStoredData() {
    return storage.hasStoredData({
      shots: shots,
      rounds: rounds,
      courses: courses,
      settings: loadSettings()
    });
  }

  function findRoundById(id) {
    return rounds.find(function (r) { return r.id === id; }) || null;
  }

  function currentShotDate() {
    var el = byId('date');
    return (el && el.value) ? el.value : today();
  }

  function setVisible(el, visible, displayValue) {
    if (!el) return;
    el.style.display = visible ? (displayValue || '') : 'none';
    el.classList.toggle('gt-hidden', !visible);
  }

  function shotsForCurrentHole(holeNum) {
    var shotDate = currentShotDate();
    var courseId = currentCourseId();
    return shots.filter(function (s) {
      if (s.hole !== holeNum || s.synthetic) return false;
      if (activeRoundId) return s.roundId === activeRoundId;

      var shotRound = s.roundId ? findRoundById(s.roundId) : null;
      if (courseId != null) {
        return !!shotRound && shotRound.date === shotDate && shotRound.courseId === courseId;
      }

      if (shotRound) return shotRound.date === shotDate && shotRound.courseId == null;
      return s.date === shotDate && !s.roundId;
    });
  }

  function syncDistanceFromHoleLength(rawLength, options) {
    options = options || {};
    var holeNum = parseInt(byId('hole').value, 10);
    var distEl = byId('distance');
    if (!distEl || isNaN(holeNum) || holeNum < 1 || holeNum > 18) return;

    var isStartingHole = shotsForCurrentHole(holeNum).length === 0;
    if (!isStartingHole) return;

    var lie = pillState.lie || '';
    if (lie && lie !== 'Tee') return;

    var nextVal = rawLength != null ? String(rawLength).trim() : '';
    var currentVal = distEl.value.trim();
    var lastAutoVal = distEl.dataset.gtHoleLengthAutofillValue || '';
    var canReplace = currentVal === '' || currentVal === lastAutoVal;
    if (!canReplace) return;

    distEl.value = nextVal;
    distEl.dataset.gtHoleLengthAutofillValue = nextVal;
    setSuggestedState(distEl, !!nextVal);
    if (options.autoSelectClub) gtAutoSelectClub(nextVal);
    gtUpdateShotProgress();
  }

  function selectedClubStockDistance() {
    var club = pillState.club || '';
    if (!club || club === 'Putter') return null;

    var settings = loadSettings();
    var cd = settings.clubDistances || {};
    var clubDist = cd[club];
    if (WEDGES.indexOf(club) !== -1 && clubDist && typeof clubDist === 'object') {
      var swing = pillState.swing || '';
      if (!swing || clubDist[swing] == null || clubDist[swing] <= 0) return null;
      return clubDist[swing];
    }
    if (typeof clubDist === 'number' && clubDist > 0) return clubDist;
    return null;
  }

  function inferEndLieValue(endDistance) {
    if (endDistance == null || isNaN(endDistance) || endDistance < 0) return '';
    if (endDistance === 0) return 'Holed';
    if (endDistance <= 30) return 'Green';
    return 'Fairway';
  }

  function syncEndLieFromEndDistance(rawValue) {
    var endDistEl = byId('endDistance');
    if (!endDistEl) return;

    var parsed = rawValue === '' || rawValue == null ? null : parseFloat(rawValue);
    var suggestedLie = inferEndLieValue(parsed);
    if (!suggestedLie) return;

    var currentEndLie = pillState.endLie || '';
    var lastAutoEndLie = endDistEl.dataset.gtClubAutofillLie || '';
    var canReplaceEndLie = currentEndLie === '' || currentEndLie === lastAutoEndLie;
      if (!canReplaceEndLie) return;

      selectPill('gt-end-lie-pills', 'endLie', suggestedLie);
      endDistEl.dataset.gtClubAutofillLie = suggestedLie;
      setSuggestedPill('gt-end-lie-pills', suggestedLie, true);
  }

  function syncEndFromSelectedClub() {
    var stock = selectedClubStockDistance();
    var startDist = parseFloat(document.getElementById('gt-distance').value);
    var endDistEl = document.getElementById('gt-end-distance');
    if (!endDistEl || stock == null || isNaN(startDist) || startDist <= 0) return;

    var remaining = Math.abs(startDist - stock);
    var roundedRemaining = Math.round(remaining * 10) / 10;
    var suggestedLie = roundedRemaining <= 30 ? 'Green' : 'Fairway';
    var nextEndDist = String(roundedRemaining);
    if (nextEndDist.indexOf('.') !== -1) nextEndDist = nextEndDist.replace(/\.0$/, '');

    var currentEndDist = endDistEl.value.trim();
    var lastAutoEndDist = endDistEl.dataset.gtClubAutofillValue || '';
    var canReplaceEndDist = currentEndDist === '' || currentEndDist === lastAutoEndDist;
    if (canReplaceEndDist) {
      endDistEl.value = nextEndDist;
      endDistEl.dataset.gtClubAutofillValue = nextEndDist;
      setSuggestedState(endDistEl, true);
    }

    var currentEndLie = pillState.endLie || '';
    var lastAutoEndLie = endDistEl.dataset.gtClubAutofillLie || '';
    var canReplaceEndLie = currentEndLie === '' || currentEndLie === lastAutoEndLie;
    if (canReplaceEndLie) {
      selectPill('gt-end-lie-pills', 'endLie', suggestedLie);
      endDistEl.dataset.gtClubAutofillLie = suggestedLie;
      setSuggestedPill('gt-end-lie-pills', suggestedLie, true);
    }
  }

  // Show only bag clubs in the shot-logger club grid
  function applyBag(bag) {
    document.querySelectorAll('#gt-club-pills .gt-pill').forEach(function (p) {
      p.style.display = bag.indexOf(p.textContent.trim()) !== -1 ? '' : 'none';
    });
  }

  // Render club distance inputs and wedge matrix in Settings
  function gtRenderClubDistTables() {
    var settings = loadSettings();
    var tables = render.renderClubDistanceTables(settings);
    var clubTable = byId('clubDistTable');
    var wedgeTable = byId('wedgeMatrixTable');
    if (clubTable) clubTable.innerHTML = tables.clubTableHtml;
    if (wedgeTable) wedgeTable.innerHTML = tables.wedgeTableHtml;
  }

  window.gtSaveSettings = function () {
    var hcpVal           = document.getElementById('gt-hcp').value;
    var targetHcpVal     = document.getElementById('gt-target-hcp').value;
    var hcpIndoorVal     = document.getElementById('gt-hcp-indoor').value;
    var targetHcpIndoorVal = document.getElementById('gt-target-hcp-indoor').value;
    var fixedPutting     = document.getElementById('gt-fixed-putting').checked;
    var bag = [];
    document.querySelectorAll('#gt-bag-pills .gt-pill.selected').forEach(function (p) {
      bag.push(p.textContent.trim());
    });
    if (bag.length === 0) bag = ALL_CLUBS.slice();

    // Collect club distances from the rendered table inputs
    var cd = {};
    document.querySelectorAll('.gt-cdist-inp').forEach(function (inp) {
      var club = inp.dataset.club;
      var val  = parseFloat(inp.value);
      if (club && !isNaN(val) && val > 0) {
        if (WEDGES.indexOf(club) !== -1) {
          // handled by wedge matrix inputs
        } else {
          cd[club] = val;
        }
      }
    });
    // Collect wedge matrix distances
    document.querySelectorAll('.gt-wdist-inp').forEach(function (inp) {
      var club  = inp.dataset.club;
      var swing = inp.dataset.swing;
      var val   = parseFloat(inp.value);
      if (club && swing && !isNaN(val) && val > 0) {
        if (!cd[club]) cd[club] = {};
        cd[club][swing] = val;
      }
    });

    var settings = {
      hcp:             hcpVal             !== '' ? parseFloat(hcpVal)             : null,
      targetHcp:       targetHcpVal       !== '' ? parseFloat(targetHcpVal)       : null,
      hcpIndoor:       hcpIndoorVal       !== '' ? parseFloat(hcpIndoorVal)       : null,
      targetHcpIndoor: targetHcpIndoorVal !== '' ? parseFloat(targetHcpIndoorVal) : null,
      fixedPutting:    fixedPutting,
      bag:             bag,
      clubDistances:   cd
    };
    saveSettings(settings);
    applyBag(bag);
    gtRenderClubDistTables(); // refresh so new bag clubs appear
    gtShowSettingsNotice('Settings saved.');
  };

  // ─── State ───────────────────────────────────────────────────────────────────
  var shots = load();
  var rounds = loadRounds();
  var courses = loadCourses();
  var activeRoundId = null; // set when a round is started
  var activeRoundType = 'outdoor'; // 'outdoor' | 'indoor'
  var statsFilter = 'all'; // 'all' | 'outdoor' | 'indoor'
  var statsDateFrom = '';
  var statsDateTo   = '';
  var sortKey = 'date';
  var sortDir = -1; // -1 = desc, 1 = asc
  var pillState = { lie: '', result: '', strike: '', endLie: '', club: '', shape: '', swing: '' };
  var lastSavedShotIds = [];

  function setSuggestedState(el, isSuggested) {
    if (!el) return;
    el.classList.toggle('gt-suggested', !!isSuggested);
  }

  function setSuggestedPill(containerId, value, isSuggested) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.gt-pill').forEach(function (p) {
      p.classList.toggle('gt-suggested', !!isSuggested && p.textContent.trim() === value);
    });
  }

  function setSuggestedDpad(value, isSuggested) {
    var pad = document.querySelector('.gt-dpad');
    if (!pad) return;
    pad.querySelectorAll('.gt-dpad-btn').forEach(function (b) {
      b.classList.toggle('gt-suggested', !!isSuggested && b.dataset.value === value);
    });
  }

  function gtUpdateShotProgress() {
    var hole = document.getElementById('gt-hole').value.trim();
    var dist = document.getElementById('gt-distance').value.trim();
    var lie = pillState.lie || '';
    var shotsOnHole = hole ? shotsForCurrentHole(parseInt(hole, 10)).length : 0;
    var main = 'Start a hole to begin logging.';
    if (hole) {
      main = 'Hole ' + hole + ' · Shot ' + (shotsOnHole + 1);
      if (dist) main += ' · ' + dist + ' m';
      if (lie) main += ' · ' + lie;
    }
    document.getElementById('gt-shot-progress-main').textContent = main;
  }

  // ─── Init ────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('gt-date').value = today();

    var tabs = document.querySelector('.gt-tabs');
    if (tabs) {
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('.gt-tab[data-gt-tab]');
        if (!btn) return;
        gtShowTab(btn.dataset.gtTab, btn);
      });
    }

    var historyBody = document.getElementById('gt-history-body');
    if (historyBody) {
      historyBody.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-gt-action="delete-shot"]');
        if (!btn) return;
        gtDeleteShot(btn.dataset.id);
      });
    }

    var coursesList = document.getElementById('gt-courses-list');
    if (coursesList) {
      coursesList.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-gt-action]');
        if (!btn) return;
        if (btn.dataset.gtAction === 'edit-course') gtEditCourse(btn.dataset.id);
        if (btn.dataset.gtAction === 'delete-course') gtDeleteCourse(btn.dataset.id);
      });
    }

    var roundsList = document.getElementById('gt-rounds-list');
    if (roundsList) {
      roundsList.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-gt-action]');
        if (!btn) return;
        if (btn.dataset.gtAction === 'view-scorecard') gtViewScorecard(btn.dataset.id);
        if (btn.dataset.gtAction === 'delete-round') gtDeleteRound(btn.dataset.id);
      });
    }

    var holeLengthInput = document.getElementById('gt-hole-length');
    if (holeLengthInput) {
      var syncHoleLengthLive = function () {
        syncDistanceFromHoleLength(holeLengthInput.value);
      };
      var syncHoleLengthCommit = function () {
        syncDistanceFromHoleLength(holeLengthInput.value, { autoSelectClub: true });
      };
      holeLengthInput.addEventListener('input', syncHoleLengthLive);
      holeLengthInput.addEventListener('keyup', syncHoleLengthLive);
      holeLengthInput.addEventListener('change', syncHoleLengthCommit);
      holeLengthInput.addEventListener('blur', syncHoleLengthCommit);
    }

    var distanceInput = document.getElementById('gt-distance');
    if (distanceInput) {
      distanceInput.addEventListener('input', function () {
        var currentVal = this.value.trim();
        if (currentVal === '' || currentVal !== (this.dataset.gtHoleLengthAutofillValue || '')) {
          this.dataset.gtHoleLengthAutofillValue = '';
          setSuggestedState(this, false);
        }
        syncEndFromSelectedClub();
        gtUpdateShotProgress();
      });
      distanceInput.addEventListener('change', function () {
        gtAutoSelectClub(this.value);
        syncEndFromSelectedClub();
        gtUpdateShotProgress();
      });
    }

    var endDistanceInput = document.getElementById('gt-end-distance');
    if (endDistanceInput) {
      endDistanceInput.addEventListener('input', function () {
        var currentVal = this.value.trim();
        if (currentVal === '' || currentVal !== (this.dataset.gtClubAutofillValue || '')) {
          this.dataset.gtClubAutofillValue = '';
          setSuggestedState(this, false);
        }
        syncEndLieFromEndDistance(currentVal);
      });
      endDistanceInput.addEventListener('change', function () {
        syncEndLieFromEndDistance(this.value.trim());
      });
    }

    gtRefreshTrackerUI();
  });

  window.gtAdjNum = function (id, delta, min, max) {
    var el = document.getElementById(id);
    var val = parseInt(el.value) || (delta > 0 ? min - 1 : max + 1);
    el.value = Math.max(min, Math.min(max, val + delta));
  };

  // Auto-fill par + hole length when hole number changes
  window.gtHoleChanged = function () {
    var holeNum = parseInt(document.getElementById('gt-hole').value);
    if (isNaN(holeNum) || holeNum < 1 || holeNum > 18) return;

    var par = null;
    var length = null;

    // 1. Course data (authoritative when available)
    var courseId = currentCourseId();
    var course = courseId ? courses.find(function (c) { return c.id === courseId; }) : null;
    if (course) {
      if (course.pars && course.pars[holeNum - 1]) par = course.pars[holeNum - 1];
      // Tee lengths — use the currently selected tee (or active round's tee)
      var teeName = currentTeeName();
      if (course.tees && course.tees.length > 0) {
        var tee = course.tees.find(function (t) { return t.name === teeName; }) || course.tees[0];
        if (tee && tee.lengths && tee.lengths[holeNum - 1]) length = tee.lengths[holeNum - 1];
      }
    }

    // 2. Previously logged shots for this hole (fallback when no course)
    if (par == null || length == null) {
      var teeName = currentTeeName();
      var shotDate = currentShotDate();
      var existing = shots.find(function (s) {
        if (s.hole !== holeNum || s.synthetic) return false;
        if (activeRoundId) return s.roundId === activeRoundId;

        var shotRound = s.roundId ? findRoundById(s.roundId) : null;
        if (courseId != null) {
          if (!shotRound || shotRound.courseId !== courseId) return false;
          if (teeName && shotRound.teeName && shotRound.teeName !== teeName) return false;
          return true;
        }

        if (shotRound) return shotRound.date === shotDate && shotRound.courseId == null;
        return s.date === shotDate && !s.roundId;
      });
      if (existing) {
        if (par == null && existing.par != null) par = existing.par;
        if (length == null && existing.holeLength != null) length = existing.holeLength;
      }
    }

    if (par != null) document.getElementById('gt-par').value = par;
    var hl = document.getElementById('gt-hole-length');
    if (hl) hl.value = length != null ? length : '';

    // Default lie to Tee when no shots have been logged for this hole yet
    var roundShots = shotsForCurrentHole(holeNum);
    if (roundShots.length === 0 && !pillState.lie) {
      selectPill('gt-lie-pills', 'lie', 'Tee');
    }
    syncDistanceFromHoleLength(length != null ? String(length) : (hl ? hl.value : ''), { autoSelectClub: true });
    gtUpdateShotProgress();
  };

  function selectDpadValue(group, value) {
    var input = document.getElementById('gt-' + group);
    if (!input) return;
    var pad = input.parentElement.querySelector('.gt-dpad');
    if (!pad) return;
    var matched = false;
    pad.querySelectorAll('.gt-dpad-btn').forEach(function (b) {
      var isMatch = b.dataset.value === value;
      b.classList.toggle('selected', isMatch);
      if (!isMatch) b.classList.remove('gt-suggested');
      if (isMatch) matched = true;
    });
    pillState[group] = matched ? value : '';
    input.value = pillState[group];
  }

  window.gtToggleDpad = function (el, group) {
    var val = el.dataset.value;
    if (pillState[group] === val) {
      selectDpadValue(group, '');
    } else {
      selectDpadValue(group, val);
    }
  };

  window.gtApplyQuickAction = function (action) {
    if (action === 'green-hit') {
      selectPill('gt-end-lie-pills', 'endLie', 'Green');
      setSuggestedPill('gt-end-lie-pills', 'Green', true);
      if (!document.getElementById('gt-end-distance').value.trim()) {
        document.getElementById('gt-end-distance').value = '8';
        document.getElementById('gt-end-distance').dataset.gtClubAutofillValue = '8';
        setSuggestedState(document.getElementById('gt-end-distance'), true);
      }
      selectDpadValue('result', 'On Target');
      setSuggestedDpad('On Target', true);
    } else if (action === 'holed') {
      document.getElementById('gt-end-distance').value = '0';
      document.getElementById('gt-end-distance').dataset.gtClubAutofillValue = '0';
      setSuggestedState(document.getElementById('gt-end-distance'), true);
      selectPill('gt-end-lie-pills', 'endLie', 'Holed');
      setSuggestedPill('gt-end-lie-pills', 'Holed', true);
      selectDpadValue('result', 'On Target');
      setSuggestedDpad('On Target', true);
    } else if (action === 'penalty') {
      selectPill('gt-end-lie-pills', 'endLie', 'Penalty area');
      selectDpadValue('result', 'Right');
    } else if (action === 'recovery') {
      if (!pillState.lie) selectPill('gt-lie-pills', 'lie', 'Rough');
      setVisible(document.getElementById('gt-more-section'), true, 'block');
      document.getElementById('gt-more-btn').textContent = '▾ Hide strike, shape & notes';
      selectPill('gt-shape-pills', 'shape', 'Punch');
    }
    gtUpdateShotProgress();
  };

  window.gtToggleMore = function () {
    var sec = document.getElementById('gt-more-section');
    var btn = document.getElementById('gt-more-btn');
    var open = !sec.classList.contains('gt-hidden');
    setVisible(sec, !open, 'block');
    btn.textContent = open ? '▸ Strike, shape & notes' : '▾ Hide strike, shape & notes';
  };

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  // ─── Tabs ────────────────────────────────────────────────────────────────────
  function activateTab(name, tabEl) {
    document.querySelectorAll('.gt-tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.gt-tab').forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
    document.querySelectorAll('.gt-panel').forEach(function (p) { p.classList.remove('active'); });
    if (tabEl) {
      tabEl.classList.add('active');
      tabEl.setAttribute('aria-pressed', 'true');
    }
    document.getElementById('gt-panel-' + name).classList.add('active');
    if (name === 'stats') gtRenderStats();
    if (name === 'history') gtRenderHistory();
    if (name === 'rounds') { gtShowRoundsList(); gtRenderRoundsList(); }
  }

  window.gtShowTab = function (name, tabEl) {
    if (!tabEl) tabEl = document.querySelector('.gt-tab[data-gt-tab="' + name + '"]');
    activateTab(name, tabEl || null);
  };

  // ─── Pills ───────────────────────────────────────────────────────────────────
  window.gtTogglePill = function (el, group) {
    var pills = el.parentElement.querySelectorAll('.gt-pill');
    pills.forEach(function (p) {
      p.classList.remove('selected');
      p.classList.remove('gt-suggested');
    });
    if (pillState[group] === el.textContent) {
      pillState[group] = '';
    } else {
      pillState[group] = el.textContent;
      el.classList.add('selected');
    }
    document.getElementById('gt-' + group).value = pillState[group];
    if (group === 'club') gtOnClubSelected(pillState[group]);
    if (group === 'club' || group === 'swing') syncEndFromSelectedClub();
    if (group === 'endLie' && pillState[group] !== (document.getElementById('gt-end-distance').dataset.gtClubAutofillLie || '')) {
      document.getElementById('gt-end-distance').dataset.gtClubAutofillLie = '';
    }
    if (group === 'lie' || group === 'endLie' || group === 'club' || group === 'swing') gtUpdateShotProgress();
  };

  // Show/hide swing selector based on selected club
  function gtOnClubSelected(club) {
    var row = document.getElementById('gt-swing-row');
    if (!row) return;
    var isWedge = WEDGES.indexOf(club) !== -1;
    if (isWedge) {
      row.classList.add('visible');
    } else {
      row.classList.remove('visible');
      // clear swing state
      document.querySelectorAll('#gt-swing-pills .gt-pill').forEach(function (p) { p.classList.remove('selected'); });
      pillState.swing = '';
      var sw = document.getElementById('gt-swing');
      if (sw) sw.value = '';
    }
  }

  // Auto-select closest club (+swing for wedges) based on distance typed
  window.gtAutoSelectClub = function (distStr) {
    var dist = parseFloat(distStr);
    var hint = document.getElementById('gt-dist-hint');
    if (!dist || isNaN(dist) || dist <= 0) { if (hint) hint.textContent = ''; return; }

    var settings = loadSettings();
    var cd = settings.clubDistances;
    if (!cd || Object.keys(cd).length === 0) { if (hint) hint.textContent = ''; return; }

    var bag = settings.bag || ALL_CLUBS;
    var best = null, bestDiff = Infinity;
    var longest = null;

    bag.forEach(function (club) {
      if (club === 'Putter') return;
      var d = cd[club];
      if (!d) return;
      if (WEDGES.indexOf(club) !== -1 && typeof d === 'object') {
        SWINGS.forEach(function (swing) {
          var dv = d[swing];
          if (dv == null || dv <= 0) return;
          if (!longest || dv > longest.distance) longest = { club: club, swing: swing, distance: dv };
          var diff = Math.abs(dist - dv);
          if (diff < bestDiff) { bestDiff = diff; best = { club: club, swing: swing }; }
        });
      } else if (typeof d === 'number' && d > 0) {
        if (!longest || d > longest.distance) longest = { club: club, swing: null, distance: d };
        var diff = Math.abs(dist - d);
        if (diff < bestDiff) { bestDiff = diff; best = { club: club, swing: null }; }
      }
    });

    if (!best) { if (hint) hint.textContent = ''; return; }

    // Only auto-select if within 25% of club distance (avoids wild suggestions)
    var refDist = best.swing ? cd[best.club][best.swing] : cd[best.club];
    if (refDist && bestDiff / refDist > 0.25) {
      var teeLie = (pillState.lie || '') === 'Tee';
      if (teeLie && longest && dist >= longest.distance) {
        best = { club: longest.club, swing: longest.swing };
        refDist = longest.distance;
      } else {
        if (hint) hint.textContent = '';
        // Clear any stale auto-selection so a bad intermediate value doesn't stick
        document.querySelectorAll('#gt-club-pills .gt-pill.selected').forEach(function (p) {
          p.classList.remove('selected');
        });
        pillState.club = '';
        return;
      }
    }

    if (!refDist) {
      if (hint) hint.textContent = '';
      pillState.club = '';
      return;
    }

    // Apply selection
    selectPill('gt-club-pills', 'club', best.club);
    gtOnClubSelected(best.club);
    if (best.swing) {
      selectPill('gt-swing-pills', 'swing', best.swing);
      pillState.swing = best.swing;
      var sw = document.getElementById('gt-swing');
      if (sw) sw.value = best.swing;
    }

    // Show hint
    if (hint) {
      var label = best.club + (best.swing ? ' ' + best.swing : '');
      hint.textContent = '↑ ' + label + ' (' + refDist + ' m stock)';
    }

    setSuggestedPill('gt-club-pills', best.club, true);
    if (best.swing) setSuggestedPill('gt-swing-pills', best.swing, true);

    syncEndFromSelectedClub();
  };

  // ─── Save shot ───────────────────────────────────────────────────────────────
  window.gtSaveShot = function (e) {
    e.preventDefault();

    // ── Inline new course: create it now if the user typed a name ──────────────
    var courseCtxSel   = document.getElementById('gt-course-ctx');
    var newCourseInput = document.getElementById('gt-new-course-inline');
    if (courseCtxSel.value === '__new__') {
      var newName = (newCourseInput.value || '').trim();
      if (newName) {
        // Check for exact match first
        var existing = courses.find(function (c) { return c.name.toLowerCase() === newName.toLowerCase(); });
        if (existing) {
          activeRoundId = null; // will be found/created below
          populateCourseCtxDropdown(existing.id);
        } else {
          var defPars = [4,4,3,4,5,4,3,4,4, 4,3,4,5,4,3,4,4,4];
          var nc = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: newName, pars: defPars };
          courses.push(nc);
          saveCourses(courses);
          gtRenderCoursesList();
          populateCourseCtxDropdown(nc.id);
          gtNotice('Course "' + newName + '" created. Set exact pars in Settings.', 'success');
        }
        setVisible(newCourseInput, false);
        newCourseInput.value = '';
      } else {
        // Nothing typed → fall back to Practice
        populateCourseCtxDropdown('');
        setVisible(newCourseInput, false);
      }
    }

    var shotDate   = v('gt-date') || today();
    var holeNum    = v('gt-hole') ? parseInt(v('gt-hole')) : null;
    var courseId   = currentCourseId();

    // ── Auto-create round when starting hole 1 ────────────────────────────────
    if (holeNum === 1 && courseId !== null) {
      // Look for existing round for today + this course
      var existingRound = rounds.find(function (r) { return r.date === shotDate && r.courseId === courseId; });
      if (existingRound) {
        activeRoundId = existingRound.id;
        activeRoundType = existingRound.type || 'outdoor';
        gtUpdateIndoorToggle();
      } else {
        var newRound = gtAutoCreateRound(courseId, shotDate, activeRoundType);
        gtNotice('Round started at ' + (courses.find(function(c){return c.id===courseId;})||{name:'?'}).name +
          (activeRoundType === 'indoor' ? ' (indoor)' : '') + '!', 'success');
      }
    } else if (holeNum === 1 && courseId === null) {
      // Hole 1, no course selected → still create a round (no course)
      var existingRound = rounds.find(function (r) { return r.date === shotDate && r.courseId === null; });
      if (!existingRound) {
        gtAutoCreateRound(null, shotDate, activeRoundType);
      } else {
        activeRoundId = existingRound.id;
        activeRoundType = existingRound.type || 'outdoor';
        gtUpdateIndoorToggle();
      }
    }
    gtUpdateProximityRow();

    var endDistRaw = v('gt-end-distance');
    var endDistVal = endDistRaw !== '' ? parseFloat(endDistRaw) : null;
    var endLieVal = pillState.endLie || inferEndLieValue(endDistVal) || '';
    var shot = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: shotDate,
      hole: holeNum,
      par:        v('gt-par')         ? parseInt(v('gt-par'))         : null,
      holeLength: v('gt-hole-length') ? parseInt(v('gt-hole-length')) : null,
      distance:   v('gt-distance')    ? parseFloat(v('gt-distance'))  : null,
      club: pillState.club,
      swing: pillState.swing || null,
      lie: pillState.lie,
      result: pillState.result || 'On Target',
      strike: pillState.strike,
      shape: pillState.shape,
      end_distance: endDistVal,
      end_lie: endLieVal,
      notes: v('gt-notes'),
      roundId: activeRoundId || null,
    };
    shot.sg = calcSG(shot);
    shots.push(shot);
    lastSavedShotIds = [shot.id];
    save(shots);
    populateClubFilter();
    gtUpdateRoundCtxLabel();

    // ── Fixed putting (indoor / simulator) ───────────────────────────────────
    var activeRound = rounds.find(function (r) { return r.id === activeRoundId; });
    if (activeRound && (activeRound.type === 'indoor') && shot.end_lie === 'Green') {
      var settings = loadSettings();
      if (settings.fixedPutting) {
        var proxRaw = document.getElementById('gt-proximity').value.trim();
        var prox    = proxRaw !== '' ? parseFloat(proxRaw) : null;
        if (prox != null && !isNaN(prox)) {
          var fp = prox <= 3 ? 1 : prox <= 20 ? 2 : 3;
          var synShot = {
            id:           Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            date:         shotDate,
            hole:         holeNum,
            distance:     prox,
            club:         'Putter',
            swing:        null,
            lie:          'Green',
            result:       null,
            strike:       null,
            shape:        null,
            end_distance: 0,
            end_lie:      'Holed',
            notes:        fp + ' fixed putt' + (fp !== 1 ? 's' : '') + ' (' + prox + ' m)',
            roundId:      activeRoundId || null,
            synthetic:    true,
            fixedPutts:   fp
          };
          synShot.sg = null;
          shots.push(synShot);
          lastSavedShotIds = [shot.id, synShot.id];
          save(shots);
          gtNotice(fp + ' putt' + (fp !== 1 ? 's' : '') + ' assigned (' + prox + ' m proximity).', 'success');
          gtPrefillNext(synShot);
          return;
        }
      }
    }

    gtNotice('Shot saved!', 'success');
    gtPrefillNext(shot);
  };

  function v(id) { return document.getElementById(id).value.trim(); }

  function clearForm() {
    document.getElementById('gt-shot-form').reset();
    document.querySelectorAll(
      '#gt-lie-pills .gt-pill.selected, ' +
      '#gt-end-lie-pills .gt-pill.selected, ' +
      '#gt-club-pills .gt-pill.selected, ' +
      '#gt-swing-pills .gt-pill.selected, ' +
      '#gt-strike-pills .gt-pill.selected, ' +
      '#gt-shape-pills .gt-pill.selected, ' +
      '.gt-dpad-btn.selected'
    ).forEach(function (p) { p.classList.remove('selected'); });
    pillState = { lie: '', result: '', strike: '', endLie: '', club: '', shape: '', swing: '' };
    gtOnClubSelected(''); // hide swing row
    document.getElementById('gt-dist-hint').textContent = '';
    document.getElementById('gt-proximity').value = '';
    document.getElementById('gt-proximity-hint').textContent = '';
    document.getElementById('gt-distance').dataset.gtHoleLengthAutofillValue = '';
    document.getElementById('gt-end-distance').dataset.gtClubAutofillValue = '';
    document.getElementById('gt-end-distance').dataset.gtClubAutofillLie = '';
    setSuggestedState(document.getElementById('gt-distance'), false);
    setSuggestedState(document.getElementById('gt-end-distance'), false);
    setSuggestedDpad('On Target', false);
    var hl = document.getElementById('gt-hole-length');
    if (hl) hl.value = '';
    selectDpadValue('result', 'On Target');
    gtUpdateShotProgress();
  }

  // Called by the Clear button — wipes everything
  window.gtResetForm = function () {
    gtResetFormUI();
  };

  window.gtUndoLastShot = function () {
    if (!lastSavedShotIds.length) {
      gtNotice('No recent shot to undo.', 'error');
      return;
    }
    var before = shots.length;
    shots = shots.filter(function (s) { return lastSavedShotIds.indexOf(s.id) === -1; });
    if (shots.length === before) {
      gtNotice('No recent shot to undo.', 'error');
      return;
    }
    save(shots);
    populateClubFilter();
    gtRenderHistory();
    gtRenderRoundsList();
    gtRenderStats();
    lastSavedShotIds = [];
    gtResetFormUI();
    gtNotice('Last shot removed.', 'success');
  };

  // Called after a save — resets then pre-fills from the shot just saved
  function gtPrefillNext(shot) {
    clearForm();

    var holed = shot.end_lie === 'Holed' || shot.end_distance === 0;

    // Always keep the date sticky
    document.getElementById('gt-date').value = shot.date || today();

    if (holed) {
      // Advance to next hole
      if (shot.hole != null && shot.hole < 18) {
        document.getElementById('gt-hole').value = shot.hole + 1;
        gtHoleChanged();
        selectPill('gt-lie-pills', 'lie', 'Tee');
      }
      var holeShots = shots.filter(function (s) { return s.date === shot.date && s.hole === shot.hole; }).length;
      updateShotStatus(null, 'Hole ' + shot.hole + ' complete in ' + holeShots + ' shot' + (holeShots !== 1 ? 's' : '') +
        (shot.hole < 18 ? ' — moving to hole ' + (shot.hole + 1) : ' — round done!'));
    } else {
      // Keep same hole
      if (shot.hole != null) {
        document.getElementById('gt-hole').value = shot.hole;
        // Carry forward par + hole length (or refill from course)
        if (shot.par != null) document.getElementById('gt-par').value = shot.par;
        var hl = document.getElementById('gt-hole-length');
        if (hl && shot.holeLength != null) hl.value = shot.holeLength;
        if (shot.par == null && shot.holeLength == null) gtHoleChanged();
      }

      // Pre-fill start position from previous end position
      if (shot.end_distance != null) {
        document.getElementById('gt-distance').value = shot.end_distance;
      }
      if (shot.end_lie) {
        selectPill('gt-lie-pills', 'lie', shot.end_lie);
      }

      // Auto-select Putter when arriving on green
      if (shot.end_lie === 'Green') {
        selectPill('gt-club-pills', 'club', 'Putter');
        gtOnClubSelected('Putter');
      }

      var holeShots = shots.filter(function (s) { return s.date === shot.date && s.hole === shot.hole; }).length;
      var ctx = shot.end_distance != null
        ? 'from ' + shot.end_distance + 'm' + (shot.end_lie ? ' (' + shot.end_lie + ')' : '')
        : '';
      updateShotStatus(null, 'Hole ' + (shot.hole || '?') + ' · Shot ' + (holeShots + 1) +
        (ctx ? ' — ' + ctx : '') + (shot.end_lie === 'Green' ? ' · Putter selected' : ''));
    }

    gtScrollLoggerContextIntoView();
  }

  // Programmatically select a pill and update pillState
  function selectPill(containerId, group, value) {
    var container = document.getElementById(containerId);
    if (!container || !value) return;
    pillState[group] = '';
    container.querySelectorAll('.gt-pill').forEach(function (p) {
      p.classList.remove('selected');
      p.classList.remove('gt-suggested');
      if (p.textContent.trim() === value) {
        p.classList.add('selected');
        pillState[group] = value;
      }
    });
    var input = document.getElementById('gt-' + group);
    if (input) input.value = pillState[group] || '';
    if (group === 'club') gtOnClubSelected(pillState[group] || '');
    if (group === 'lie' || group === 'endLie' || group === 'club' || group === 'swing') gtUpdateShotProgress();
  }

  function updateShotStatus(el, msg) {
    var bar = document.getElementById('gt-shot-status');
    if (!msg) { setVisible(bar, false); gtUpdateShotProgress(); return; }
    bar.textContent = msg;
    setVisible(bar, true, 'block');
    gtUpdateShotProgress();
  }

  function gtScrollLoggerContextIntoView() {
    var card = document.getElementById('gt-shot-progress-card');
    if (!card) return;
    function scrollNow() {
      var top = card.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo(0, Math.max(0, top));
    }
    requestAnimationFrame(scrollNow);
    setTimeout(scrollNow, 80);
  }


  // ─── History ─────────────────────────────────────────────────────────────────
  var filteredShots = [];

  window.gtRenderHistory = function () {
    var fc = byId('filterClub').value;
    var fr = byId('filterResult').value;
    var fs = byId('filterStrike').value;
    var fq = (byId('filterSearch').value || '').toLowerCase();

    filteredShots = shots.filter(function (s) {
      if (fc && s.club !== fc) return false;
      if (fr && s.result !== fr) return false;
      if (fs && s.strike !== fs) return false;
      if (fq && !((s.notes || '').toLowerCase().includes(fq))) return false;
      return true;
    });

    filteredShots.sort(function (a, b) {
      var av = a[sortKey] || '', bv = b[sortKey] || '';
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });

    var tbody = byId('historyBody');
    var history = render.renderHistory(filteredShots);
    tbody.innerHTML = history.bodyHtml;
    if (!filteredShots.length) {
      byId('historyCount').textContent = '';
      return;
    }

    var total = filteredShots.length;
    var all = shots.length;
    byId('historyCount').textContent =
      'Showing ' + total + (all !== total ? ' of ' + all : '') + ' shot' + (total !== 1 ? 's' : '');
  };

  window.gtDeleteShot = function (id) {
    if (!confirm('Delete this shot?')) return;
    shots = shots.filter(function (s) { return s.id !== id; });
    save(shots);
    populateClubFilter();
    gtRenderHistory();
    gtNotice('Shot deleted.', 'success');
  };

  // ─── Sorting ──────────────────────────────────────────────────────────────────
  window.gtSort = function (key) {
    if (sortKey === key) {
      sortDir *= -1;
    } else {
      sortKey = key;
      sortDir = 1;
    }
    document.querySelectorAll('.gt-table th').forEach(function (th) {
      th.classList.remove('sort-asc', 'sort-desc');
    });
    var th = document.getElementById('gt-th-' + key);
    if (th) th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
    gtRenderHistory();
  };

  // ─── Stats ───────────────────────────────────────────────────────────────────
  window.gtSetStatsFilter = function (filter, btn) {
    statsFilter = filter;
    document.querySelectorAll('.gt-stats-filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    gtRenderStats();
  };

  window.gtSetStatsDates = function () {
    statsDateFrom = document.getElementById('gt-stats-from').value || '';
    statsDateTo   = document.getElementById('gt-stats-to').value   || '';
    gtRenderStats();
  };

  window.gtClearStatsDates = function () {
    statsDateFrom = '';
    statsDateTo   = '';
    document.getElementById('gt-stats-from').value = '';
    document.getElementById('gt-stats-to').value   = '';
    gtRenderStats();
  };

  window.gtRenderStats = function () {
    var el = byId('statsContent');
    var snapshot = domain.buildStatsSnapshot({
      rounds: rounds,
      shots: shots,
      courses: courses,
      statsFilter: statsFilter,
      statsDateFrom: statsDateFrom,
      statsDateTo: statsDateTo
    });
    var settings = loadSettings();
    var statsSettings = { hcp: settings.hcp, targetHcp: settings.targetHcp };
    if (statsFilter === 'indoor') {
      statsSettings.hcp = settings.hcpIndoor;
      statsSettings.targetHcp = settings.targetHcpIndoor;
    }
    var targetHcpModel = domain.buildTargetHcpModel(snapshot.sgByCat, snapshot.sgN, statsSettings);
    el.innerHTML = render.renderStats(snapshot, targetHcpModel);
  };

  // ─── Club filter populate ─────────────────────────────────────────────────────
  function populateClubFilter() {
    var sel = document.getElementById('gt-filter-club');
    var current = sel.value;
    var clubs = Array.from(new Set(shots.map(function (s) { return s.club; }).filter(Boolean))).sort();
    sel.innerHTML = '<option value="">All</option>' +
      clubs.map(function (c) { return '<option' + (c === current ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
  }

  // ─── Export ───────────────────────────────────────────────────────────────────
  window.gtExportJSON = function () {
    download('golf-shots.json', JSON.stringify(shots, null, 2), 'application/json');
  };

  window.gtExportCSV = function () {
    var cols = ['date', 'hole', 'club', 'swing', 'distance', 'lie', 'end_distance', 'end_lie', 'result', 'strike', 'shape', 'sg', 'notes'];
    var rows = [cols.join(',')].concat(shots.map(function (s) {
      return cols.map(function (c) {
        var val = s[c] == null ? '' : String(s[c]);
        return '"' + val.replace(/"/g, '""') + '"';
      }).join(',');
    }));
    download('golf-shots.csv', rows.join('\r\n'), 'text/csv');
  };

  function download(filename, content, mime) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  // ─── Import ───────────────────────────────────────────────────────────────────
  window.gtImportFile = function (event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('gt-import-area').value = e.target.result;
    };
    reader.readAsText(file);
  };

  window.gtImportJSON = function () {
    var raw = document.getElementById('gt-import-area').value.trim();
    if (!raw) { gtNotice('Nothing to import.', 'error'); return; }
    var imported;
    try { imported = JSON.parse(raw); } catch (err) {
      gtNotice('Invalid JSON: ' + err.message, 'error'); return;
    }
    if (Array.isArray(imported)) {
      var existingIds = new Set(shots.map(function (s) { return s.id; }));
      var added = 0;
      imported.forEach(function (s, idx) {
        if (!s || typeof s !== 'object') return;
        var next = Object.assign({}, s);
        next.id = normalizeImportId(next.id, idx);
        if (existingIds.has(next.id)) return;
        shots.push(next);
        existingIds.add(next.id);
        added++;
      });
      save(shots);
      populateClubFilter();
      gtRenderHistory();
      document.getElementById('gt-import-area').value = '';
      gtNotice('Imported ' + added + ' shot' + (added !== 1 ? 's' : '') + '. ' +
        (imported.length - added) + ' duplicate(s) skipped.', 'success');
      return;
    }

    if (!imported || typeof imported !== 'object' || !Array.isArray(imported.shots)) {
      gtNotice('Expected either a JSON array of shots or a tracker bundle object.', 'error');
      return;
    }

    if (gtHasStoredData() && !confirm('Replace current tracker data in this browser with the imported tracker bundle?')) return;

    var bundleShots = [];
    var seenShotIds = new Set();
    imported.shots.forEach(function (s, idx) {
      if (!s || typeof s !== 'object') return;
      var next = Object.assign({}, s);
      next.id = normalizeImportId(next.id, idx);
      if (seenShotIds.has(next.id)) return;
      seenShotIds.add(next.id);
      bundleShots.push(next);
    });

    shots = bundleShots;
    rounds = Array.isArray(imported.rounds) ? imported.rounds.filter(function (r) { return r && typeof r === 'object'; }).map(function (r) { return Object.assign({}, r); }) : [];
    courses = Array.isArray(imported.courses) ? imported.courses.filter(function (c) { return c && typeof c === 'object'; }).map(function (c) { return Object.assign({}, c); }) : [];
    activeRoundId = null;
    activeRoundType = 'outdoor';

    save(shots);
    saveRounds(rounds);
    saveCourses(courses);
    saveSettings(imported.settings);

    gtRefreshTrackerUI();
    document.getElementById('gt-import-area').value = '';
    gtNotice('Imported tracker bundle: ' + rounds.length + ' rounds, ' + shots.length + ' shots, ' + courses.length + ' courses.', 'success');
  };

  window.gtClearAll = function () {
    if (!confirm('Delete ALL ' + shots.length + ' shots? This cannot be undone.')) return;
    shots = [];
    save(shots);
    populateClubFilter();
    gtRenderHistory();
    gtNotice('All shots deleted.', 'success');
  };

  window.gtResetAllData = function () {
    if (!confirm('Reset the tracker? This clears shots, rounds, courses, and settings in this browser.')) return;
    shots = [];
    rounds = [];
    courses = [];
    activeRoundId = null;
    activeRoundType = 'outdoor';
    save(shots);
    saveRounds(rounds);
    saveCourses(courses);
    saveSettings(defaultSettings());
    gtRefreshTrackerUI();
    gtNotice('Tracker reset.', 'success');
    gtShowSettingsNotice('Tracker reset.');
  };

  function gtNotice(msg, type) {
    var el = document.getElementById('gt-notice');
    el.textContent = msg;
    el.className = 'gt-notice ' + type;
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.className = 'gt-notice'; }, 3500);
  }

  window.gtNotice = gtNotice;

  // ─── Courses ─────────────────────────────────────────────────────────────────
  // ─── Course context dropdown (Log Shot panel) ────────────────────────────────
  // Populates the "Playing at" dropdown with existing courses + "+ New course"
  function populateCourseCtxDropdown(keepValue) {
    var sel = document.getElementById('gt-course-ctx');
    if (!sel) return;
    var cur = keepValue != null ? keepValue : sel.value;
    sel.innerHTML =
      '<option value="">Practice (no round)</option>' +
      courses.map(function (c) {
        return '<option value="' + c.id + '"' + (c.id === cur ? ' selected' : '') + '>' + esc(c.name) + '</option>';
      }).join('') +
      '<option value="__new__">+ New course…</option>';
    populateTeeDropdown(cur || null);
  }

  // Called when the "Playing at" dropdown changes
  window.gtCourseCtxChange = function () {
    var sel   = document.getElementById('gt-course-ctx');
    var input = document.getElementById('gt-new-course-inline');
    if (sel.value === '__new__') {
      setVisible(input, true);
      input.value = '';
      input.focus();
    } else {
      setVisible(input, false);
      // Sync active round to match the selected course for today
      gtSyncActiveRound();
      gtUpdateRoundCtxLabel();
      populateTeeDropdown(currentCourseId());
      // Re-fill par + length for the currently-shown hole from the new course's data
      gtHoleChanged();
    }
  };

  // Called as user types a new course name inline
  window.gtNewCourseInlineChange = function () {};  // typing is handled at save time

  // Return the current courseId from the context bar (null for Practice, or a real id)
  function currentCourseId() {
    var sel = document.getElementById('gt-course-ctx');
    var v = sel ? sel.value : '';
    if (!v || v === '__new__') return null;
    return v;
  }

  // Ensure or re-use a round for today + courseId; sets activeRoundId
  function gtSyncActiveRound() {
    var courseId = currentCourseId();
    var t = today();
    // If active round already matches today + course, keep it
    if (activeRoundId) {
      var ar = rounds.find(function (r) { return r.id === activeRoundId; });
      if (ar && ar.date === t && ar.courseId === courseId) return;
    }
    // Find an existing round for today + course
    var existing = rounds.find(function (r) { return r.date === t && r.courseId === courseId; });
    if (existing) {
      activeRoundId = existing.id;
    } else {
      activeRoundId = null; // will be created on first hole-1 shot
    }
  }

  // Update the small label next to the "Playing at" bar
  function gtUpdateRoundCtxLabel() {
    var lbl = document.getElementById('gt-round-ctx-label');
    if (!lbl) return;
    if (!activeRoundId) { lbl.textContent = ''; return; }
    var r = rounds.find(function (x) { return x.id === activeRoundId; });
    if (!r) { lbl.textContent = ''; return; }
    // Sync indoor toggle and tee to the active round's type/tee
    activeRoundType = r.type || 'outdoor';
    gtUpdateIndoorToggle();
    gtUpdateProximityRow();
    populateTeeDropdown(r.courseId);
    if (r.teeName) {
      var teeSel = document.getElementById('gt-tee-ctx');
      if (teeSel) teeSel.value = r.teeName;
    }
    var cnt = shots.filter(function (s) { return s.roundId === activeRoundId && !s.synthetic; }).length;
    lbl.textContent = cnt + ' shot' + (cnt !== 1 ? 's' : '') + ' this round';
  }

  // ── Indoor toggle helpers ─────────────────────────────────────────────────
  window.gtToggleIndoor = function (btn) {
    activeRoundType = activeRoundType === 'indoor' ? 'outdoor' : 'indoor';
    gtUpdateIndoorToggle();
    gtUpdateProximityRow();
  };

  function gtUpdateIndoorToggle() {
    var btn = document.getElementById('gt-indoor-toggle');
    if (!btn) return;
    if (activeRoundType === 'indoor') {
      btn.textContent = 'Indoor';
      btn.classList.add('indoor');
    } else {
      btn.textContent = 'Outdoor';
      btn.classList.remove('indoor');
    }
  }

  function gtUpdateProximityRow() {
    var proxRow = document.getElementById('gt-proximity-row');
    if (!proxRow) return;
    var isIndoor = activeRoundType === 'indoor';
    var settings = loadSettings();
    setVisible(proxRow, isIndoor && settings.fixedPutting);
  }

  window.gtProximityHint = function (val) {
    var hint = document.getElementById('gt-proximity-hint');
    if (!hint) return;
    var prox = parseFloat(val);
    if (isNaN(prox) || val === '') { hint.textContent = ''; return; }
    var fp = prox <= 3 ? 1 : prox <= 20 ? 2 : 3;
    hint.textContent = '→ ' + fp + ' putt' + (fp !== 1 ? 's' : '') + ' will be assigned';
  };

  // Create a round immediately (used auto on hole-1 save)
  function gtAutoCreateRound(courseId, date, type) {
    var teeSel = document.getElementById('gt-tee-ctx');
    var teeName = (teeSel && !teeSel.classList.contains('gt-hidden') && teeSel.value) ? teeSel.value : null;
    var round = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: date,
      courseId: courseId,
      type: type || 'outdoor',
      teeName: teeName,
      notes: ''
    };
    rounds.push(round);
    saveRounds(rounds);
    activeRoundId = round.id;
    return round;
  }

  // ─── Courses ─────────────────────────────────────────────────────────────────
  // ── Tee row builder ─────────────────────────────────────────────────────────
  window.gtAddTeeRow = function (tee) {
    var container = document.getElementById('gt-tee-rows');
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'gt-tee-row';
    var frontInputs = '', backInputs = '';
    for (var i = 0; i < 9; i++) {
      var frontVal = (tee && tee.lengths && tee.lengths[i]) ? tee.lengths[i] : '';
      var backVal  = (tee && tee.lengths && tee.lengths[9 + i]) ? tee.lengths[9 + i] : '';
      frontInputs += '<input type="number" class="gt-tee-len-inp" min="0" max="999" step="1" inputmode="numeric" placeholder="—" value="' + frontVal + '">';
      backInputs  += '<input type="number" class="gt-tee-len-inp" min="0" max="999" step="1" inputmode="numeric" placeholder="—" value="' + backVal  + '">';
    }
    div.innerHTML =
      '<div class="gt-tee-row-head">' +
        '<input type="text" class="gt-tee-name-inp gt-tee-name-field" placeholder="Tee colour (e.g. White)" value="' + esc(tee ? tee.name : '') + '">' +
        '<button type="button" onclick="this.closest(\'.gt-tee-row\').remove()" class="gt-tee-remove-btn" title="Remove tee">✕</button>' +
      '</div>' +
      '<div class="gt-tee-row-label">Front 9 (m): holes 1–9</div>' +
      '<div class="gt-par-inputs gt-tee-row-grid">' + frontInputs + '</div>' +
      '<div class="gt-tee-row-label">Back 9 (m): holes 10–18</div>' +
      '<div class="gt-par-inputs">' + backInputs + '</div>';
    container.appendChild(div);
  };

  // ── Open course form (create or edit) ────────────────────────────────────────
  function gtOpenCourseForm(course) {
    document.getElementById('gt-new-course-form').classList.add('open');
    setVisible(document.getElementById('gt-add-course-btn'), false);
    document.getElementById('gt-editing-course-id').value = course ? course.id : '';
    document.getElementById('gt-save-course-btn').textContent = course ? 'Update Course' : 'Save Course';
    document.getElementById('gt-course-name').value = course ? course.name : '';
    var defPars = [4,4,3,4,5,4,3,4,4, 4,3,4,5,4,3,4,4,4];
    var pars = course ? course.pars : defPars;
    document.querySelectorAll('#gt-par-front .gt-par-inp').forEach(function (inp, i) { inp.value = pars[i]; });
    document.querySelectorAll('#gt-par-back .gt-par-inp').forEach(function (inp, i) { inp.value = pars[9 + i]; });
    // Clear and re-populate tee rows
    document.getElementById('gt-tee-rows').innerHTML = '';
    if (course && course.tees) {
      course.tees.forEach(function (t) { gtAddTeeRow(t); });
    }
  }

  window.gtShowNewCourseForm = function () { gtOpenCourseForm(null); };

  window.gtEditCourse = function (id) {
    var c = courses.find(function (c) { return c.id === id; });
    if (c) gtOpenCourseForm(c);
  };

  window.gtCancelCourse = function () {
    document.getElementById('gt-new-course-form').classList.remove('open');
    setVisible(document.getElementById('gt-add-course-btn'), true);
    document.getElementById('gt-tee-rows').innerHTML = '';
    document.getElementById('gt-editing-course-id').value = '';
  };

  window.gtSaveCourse = function () {
    var name = document.getElementById('gt-course-name').value.trim();
    if (!name) { gtNotice('Enter a course name.', 'error'); return; }
    var pars = [];
    document.querySelectorAll('#gt-par-front .gt-par-inp').forEach(function (inp) { pars.push(parseInt(inp.value) || 4); });
    document.querySelectorAll('#gt-par-back .gt-par-inp').forEach(function  (inp) { pars.push(parseInt(inp.value) || 4); });

    // Collect tee sets
    var tees = [];
    document.querySelectorAll('#gt-tee-rows .gt-tee-row').forEach(function (row) {
      var teeName = row.querySelector('.gt-tee-name-inp').value.trim();
      if (!teeName) return;
      var lengths = [];
      row.querySelectorAll('.gt-tee-len-inp').forEach(function (inp) {
        lengths.push(parseInt(inp.value) || 0);
      });
      if (lengths.some(function (l) { return l > 0; })) tees.push({ name: teeName, lengths: lengths });
    });

    var editingId = document.getElementById('gt-editing-course-id').value;
    if (editingId) {
      // Update existing course
      var idx = courses.findIndex(function (c) { return c.id === editingId; });
      if (idx !== -1) { courses[idx] = Object.assign(courses[idx], { name: name, pars: pars, tees: tees }); }
    } else {
      // Create new course
      var c = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name, pars: pars, tees: tees };
      courses.push(c);
      populateCourseCtxDropdown(c.id);
    }
    saveCourses(courses);
    gtRenderCoursesList();
    gtCancelCourse();
    gtNotice(editingId ? 'Course updated.' : 'Course saved.', 'success');
    // Refresh tee dropdown in case selected course was edited
    populateTeeDropdown(currentCourseId());
  };

  window.gtDeleteCourse = function (id) {
    if (!confirm('Delete this course?')) return;
    courses = courses.filter(function (c) { return c.id !== id; });
    saveCourses(courses);
    gtRenderCoursesList();
    populateCourseCtxDropdown();
  };

  function gtRenderCoursesList() {
    var el = byId('coursesList');
    if (!el) return;
    el.innerHTML = render.renderCoursesList(courses);
  }

  // ── Tee selector helpers ─────────────────────────────────────────────────────
  function currentTeeName() {
    var sel = document.getElementById('gt-tee-ctx');
    return (sel && !sel.classList.contains('gt-hidden') && sel.value) ? sel.value : null;
  }

  function populateTeeDropdown(courseId) {
    var sel = document.getElementById('gt-tee-ctx');
    if (!sel) return;
    var course = courseId ? courses.find(function (c) { return c.id === courseId; }) : null;
    if (!course || !course.tees || course.tees.length === 0) {
      setVisible(sel, false);
      sel.innerHTML = '';
      return;
    }
    var prevVal = sel.value;
    sel.innerHTML = course.tees.map(function (t) {
      return '<option value="' + esc(t.name) + '">' + esc(t.name) + '</option>';
    }).join('');
    // Restore previous selection if still valid
    if (prevVal && sel.querySelector('option[value="' + prevVal.replace(/"/g, '\\"') + '"]')) sel.value = prevVal;
    // Sync to active round's tee if one exists
    if (activeRoundId) {
      var ar = rounds.find(function (r) { return r.id === activeRoundId; });
      if (ar && ar.teeName) sel.value = ar.teeName;
    }
    setVisible(sel, true);
  }

  window.gtTeeCtxChange = function () {
    // If a round is already active, update its stored tee name
    if (activeRoundId) {
      var ar = rounds.find(function (r) { return r.id === activeRoundId; });
      if (ar) {
        ar.teeName = currentTeeName();
        saveRounds(rounds);
      }
    }
    gtHoleChanged(); // re-fill length for current hole with new tee
  };

  // ─── Rounds ──────────────────────────────────────────────────────────────────
  window.gtShowRoundsList = function () {
    setVisible(document.getElementById('gt-rounds-list-view'), true);
    setVisible(document.getElementById('gt-scorecard-view'), false);
  };

  function gtRenderRoundsList() {
    var el = byId('roundsList');
    if (!el) return;
    el.innerHTML = render.renderRoundsList(rounds, courses, shots, activeRoundId);
  }

  window.gtDeleteRound = function (id) {
    if (!confirm('Delete this round? Shots will be kept as practice shots.')) return;
    shots.forEach(function (s) { if (s.roundId === id) s.roundId = null; });
    save(shots);
    rounds = rounds.filter(function (r) { return r.id !== id; });
    saveRounds(rounds);
    if (activeRoundId === id) { activeRoundId = null; gtUpdateRoundCtxLabel(); }
    gtRenderRoundsList();
    gtNotice('Round deleted.', 'success');
  };

  // ─── Scorecard ───────────────────────────────────────────────────────────────
  window.gtViewScorecard = function (roundId) {
    var round  = rounds.find(function (r) { return r.id === roundId; });
    if (!round) return;
    var course = round.courseId ? courses.find(function (c) { return c.id === round.courseId; }) : null;
    setVisible(byId('roundsListView'), false);
    setVisible(byId('scorecardView'), true);
    var title = round.date + (course ? ' — ' + course.name : '') +
      (round.teeName ? ' · ' + round.teeName + ' tees' : '') +
      (round.notes ? ' (' + round.notes + ')' : '');
    byId('scorecardTitle').textContent = title;
    byId('scorecardContent').innerHTML = render.renderScorecard(domain.buildScorecardModel(round, course, shots));
  };


})();
