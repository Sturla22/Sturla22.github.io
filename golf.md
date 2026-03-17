---
title: Golf Shot Tracker
layout: page
description: Track your golf shots - distance, lie, result, strike quality, and club selection.
sitemap: true
---

<style>
  .golf-tracker {
    font-family: inherit;
    max-width: 900px;
    margin: 0 auto;
  }

  .gt-tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid #ccc;
    margin-bottom: 1.5rem;
  }

  .gt-tab {
    padding: 0.6rem 1.2rem;
    cursor: pointer;
    border: 1px solid transparent;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    background: #f5f5f5;
    font-size: 0.95rem;
    color: #555;
    transition: background 0.15s;
  }

  .gt-tab:hover { background: #e8e8e8; }

  .gt-tab.active {
    background: #fff;
    border-color: #ccc;
    border-bottom-color: #fff;
    margin-bottom: -2px;
    color: #222;
    font-weight: 600;
  }

  .gt-panel { display: none; }
  .gt-panel.active { display: block; }

  /* Form */
  .gt-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 600px) {
    .gt-form { grid-template-columns: 1fr; }
    .gt-form .full-width { grid-column: 1; }
  }

  .gt-form .full-width { grid-column: 1 / -1; }

  .gt-field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .gt-field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .gt-field input,
  .gt-field select,
  .gt-field textarea {
    padding: 0.5rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.95rem;
    width: 100%;
    box-sizing: border-box;
    background: #fff;
  }

  .gt-field textarea { resize: vertical; min-height: 70px; }

  .gt-btn {
    padding: 0.55rem 1.2rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    transition: opacity 0.15s;
  }

  .gt-btn:hover { opacity: 0.85; }
  .gt-btn-primary { background: #2a7a2a; color: #fff; }
  .gt-btn-secondary { background: #555; color: #fff; }
  .gt-btn-danger { background: #c0392b; color: #fff; }
  .gt-btn-outline { background: transparent; border: 1px solid #555; color: #555; }

  .gt-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  /* Pill selects */
  .gt-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .gt-pill {
    padding: 0.35rem 0.8rem;
    border: 1px solid #ccc;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.85rem;
    background: #f9f9f9;
    transition: all 0.15s;
    user-select: none;
  }

  .gt-pill:hover { border-color: #888; background: #eee; }
  .gt-pill.selected { background: #2a7a2a; border-color: #2a7a2a; color: #fff; }

  /* Table */
  .gt-table-wrap { overflow-x: auto; }

  .gt-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;
  }

  .gt-table th {
    background: #f0f0f0;
    padding: 0.5rem 0.6rem;
    text-align: left;
    border-bottom: 2px solid #ccc;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
  }

  .gt-table th:hover { background: #e4e4e4; }

  .gt-table td {
    padding: 0.45rem 0.6rem;
    border-bottom: 1px solid #eee;
    vertical-align: top;
  }

  .gt-table tr:hover td { background: #fafafa; }

  .gt-delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #c0392b;
    font-size: 1rem;
    padding: 0 0.2rem;
  }

  .gt-empty {
    text-align: center;
    color: #888;
    padding: 2rem;
    font-style: italic;
  }

  /* Stats */
  .gt-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .gt-stat-card {
    background: #f7f7f7;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 1rem;
  }

  .gt-stat-card h4 {
    margin: 0 0 0.5rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
  }

  .gt-stat-val {
    font-size: 1.6rem;
    font-weight: 700;
    color: #2a7a2a;
  }

  .gt-stat-sub {
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.2rem;
  }

  .gt-bar-chart { margin-top: 1rem; }

  .gt-bar-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
  }

  .gt-bar-label { width: 90px; flex-shrink: 0; text-align: right; color: #555; }

  .gt-bar-track {
    flex: 1;
    background: #eee;
    border-radius: 3px;
    height: 18px;
    overflow: hidden;
  }

  .gt-bar-fill {
    height: 100%;
    background: #2a7a2a;
    border-radius: 3px;
    transition: width 0.4s;
  }

  .gt-bar-count { width: 30px; color: #555; }

  /* IO area */
  .gt-io textarea {
    width: 100%;
    height: 200px;
    font-family: monospace;
    font-size: 0.8rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.5rem;
    box-sizing: border-box;
    resize: vertical;
  }

  .gt-notice {
    padding: 0.6rem 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    display: none;
  }

  .gt-notice.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; display: block; }
  .gt-notice.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; display: block; }

  .gt-section-title {
    font-size: 1rem;
    font-weight: 700;
    color: #333;
    margin: 1.5rem 0 0.75rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid #eee;
  }

  .sort-asc::after { content: " ▲"; font-size: 0.7rem; }
  .sort-desc::after { content: " ▼"; font-size: 0.7rem; }

  /* Filters */
  .gt-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 4px;
  }

  .gt-filters label { font-size: 0.85rem; font-weight: 600; color: #444; }
  .gt-filters select, .gt-filters input {
    padding: 0.35rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.85rem;
  }
</style>

<div class="golf-tracker">

  <div id="gt-notice" class="gt-notice"></div>

  <div class="gt-tabs">
    <div class="gt-tab active" onclick="gtShowTab('log')">Log Shot</div>
    <div class="gt-tab" onclick="gtShowTab('history')">History</div>
    <div class="gt-tab" onclick="gtShowTab('stats')">Stats</div>
    <div class="gt-tab" onclick="gtShowTab('io')">Import / Export</div>
  </div>

  <!-- LOG SHOT -->
  <div id="gt-panel-log" class="gt-panel active">
    <form id="gt-shot-form" onsubmit="gtSaveShot(event)">
      <div class="gt-form">

        <div class="gt-field">
          <label>Date</label>
          <input type="date" id="gt-date" required>
        </div>

        <div class="gt-field">
          <label>Hole</label>
          <input type="number" id="gt-hole" min="1" max="18" placeholder="1–18">
        </div>

        <div class="gt-field">
          <label>Distance from hole (m)</label>
          <input type="number" id="gt-distance" min="0" step="0.5" placeholder="e.g. 150">
        </div>

        <div class="gt-field">
          <label>Club</label>
          <select id="gt-club">
            <option value="">— select —</option>
            <optgroup label="Woods">
              <option>Driver</option>
              <option>3-Wood</option>
              <option>5-Wood</option>
              <option>7-Wood</option>
            </optgroup>
            <optgroup label="Hybrids / Long Irons">
              <option>Hybrid / Rescue</option>
              <option>2-Iron</option>
              <option>3-Iron</option>
              <option>4-Iron</option>
            </optgroup>
            <optgroup label="Mid Irons">
              <option>5-Iron</option>
              <option>6-Iron</option>
              <option>7-Iron</option>
            </optgroup>
            <optgroup label="Short Irons">
              <option>8-Iron</option>
              <option>9-Iron</option>
            </optgroup>
            <optgroup label="Wedges">
              <option>Pitching Wedge (PW)</option>
              <option>Gap Wedge (GW)</option>
              <option>Sand Wedge (SW)</option>
              <option>Lob Wedge (LW)</option>
            </optgroup>
            <optgroup label="Putter">
              <option>Putter</option>
            </optgroup>
          </select>
        </div>

        <div class="gt-field full-width">
          <label>Lie</label>
          <div class="gt-pills" id="gt-lie-pills">
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Tee</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Fairway</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Rough</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Deep Rough</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Sand</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Hardpan</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Fringe</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Green</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Divot</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Uphill</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Downhill</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Sidehill</span>
          </div>
          <input type="hidden" id="gt-lie">
        </div>

        <div class="gt-field full-width">
          <label>Result (where it landed relative to target)</label>
          <div class="gt-pills" id="gt-result-pills">
            <span class="gt-pill" onclick="gtTogglePill(this,'result')">On Target</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'result')">Short</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'result')">Long</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'result')">Left</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'result')">Right</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'result')">Short Left</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'result')">Short Right</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'result')">Long Left</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'result')">Long Right</span>
          </div>
          <input type="hidden" id="gt-result">
        </div>

        <div class="gt-field full-width">
          <label>Strike</label>
          <div class="gt-pills" id="gt-strike-pills">
            <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Pure / Solid</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Thin</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Fat / Chunked</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Toe</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Heel</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Shank</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Top</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Pop-up</span>
          </div>
          <input type="hidden" id="gt-strike">
        </div>

        <div class="gt-field">
          <label>Shot shape</label>
          <select id="gt-shape">
            <option value="">— select —</option>
            <option>Straight</option>
            <option>Draw</option>
            <option>Fade</option>
            <option>Hook</option>
            <option>Slice</option>
            <option>Push</option>
            <option>Pull</option>
            <option>Punch</option>
            <option>Flop</option>
            <option>Chip</option>
          </select>
        </div>

        <div class="gt-field">
          <label>Outcome</label>
          <select id="gt-outcome">
            <option value="">— select —</option>
            <option>On the green</option>
            <option>GIR (flagstick)</option>
            <option>Birdie putt ≤ 5 m</option>
            <option>Par putt</option>
            <option>Missed green</option>
            <option>In bunker</option>
            <option>OB / Lost ball</option>
            <option>Water hazard</option>
          </select>
        </div>

        <div class="gt-field full-width">
          <label>Notes</label>
          <textarea id="gt-notes" placeholder="Wind, slope, intent, swing thoughts…"></textarea>
        </div>

      </div><!-- gt-form -->

      <div class="gt-actions">
        <button type="submit" class="gt-btn gt-btn-primary">Save Shot</button>
        <button type="button" class="gt-btn gt-btn-outline" onclick="gtResetForm()">Clear</button>
      </div>

    </form>
  </div><!-- panel-log -->

  <!-- HISTORY -->
  <div id="gt-panel-history" class="gt-panel">
    <div class="gt-filters">
      <label>Club:</label>
      <select id="gt-filter-club" onchange="gtRenderHistory()">
        <option value="">All</option>
      </select>
      <label>Result:</label>
      <select id="gt-filter-result" onchange="gtRenderHistory()">
        <option value="">All</option>
        <option>On Target</option>
        <option>Short</option><option>Long</option>
        <option>Left</option><option>Right</option>
        <option>Short Left</option><option>Short Right</option>
        <option>Long Left</option><option>Long Right</option>
      </select>
      <label>Strike:</label>
      <select id="gt-filter-strike" onchange="gtRenderHistory()">
        <option value="">All</option>
        <option>Pure / Solid</option><option>Thin</option><option>Fat / Chunked</option>
        <option>Toe</option><option>Heel</option><option>Shank</option>
        <option>Top</option><option>Pop-up</option>
      </select>
      <input type="text" id="gt-filter-search" placeholder="Search notes…" oninput="gtRenderHistory()" style="flex:1;min-width:120px;">
    </div>
    <div class="gt-table-wrap">
      <table class="gt-table" id="gt-history-table">
        <thead>
          <tr>
            <th onclick="gtSort('date')" id="gt-th-date">Date</th>
            <th onclick="gtSort('hole')" id="gt-th-hole">Hole</th>
            <th onclick="gtSort('club')" id="gt-th-club">Club</th>
            <th onclick="gtSort('distance')" id="gt-th-distance">Dist (m)</th>
            <th onclick="gtSort('lie')" id="gt-th-lie">Lie</th>
            <th onclick="gtSort('result')" id="gt-th-result">Result</th>
            <th onclick="gtSort('strike')" id="gt-th-strike">Strike</th>
            <th>Shape</th>
            <th>Outcome</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="gt-history-body">
          <tr><td colspan="11" class="gt-empty">No shots logged yet.</td></tr>
        </tbody>
      </table>
    </div>
    <p id="gt-history-count" style="font-size:0.85rem;color:#888;margin-top:0.5rem;"></p>
  </div><!-- panel-history -->

  <!-- STATS -->
  <div id="gt-panel-stats" class="gt-panel">
    <div id="gt-stats-content">
      <p class="gt-empty">Log some shots to see statistics.</p>
    </div>
  </div>

  <!-- IMPORT / EXPORT -->
  <div id="gt-panel-io" class="gt-panel">
    <p class="gt-section-title">Export</p>
    <p style="font-size:0.9rem;color:#555;">Download all your shots as a JSON or CSV file. All data is stored only in this browser.</p>
    <div class="gt-actions">
      <button class="gt-btn gt-btn-primary" onclick="gtExportJSON()">Download JSON</button>
      <button class="gt-btn gt-btn-secondary" onclick="gtExportCSV()">Download CSV</button>
    </div>

    <p class="gt-section-title">Import</p>
    <p style="font-size:0.9rem;color:#555;">Import shots from a previously exported JSON file. Existing shots are kept; duplicates are skipped.</p>
    <div class="gt-io">
      <textarea id="gt-import-area" placeholder='Paste JSON here, or use the file picker below…'></textarea>
    </div>
    <div class="gt-actions" style="margin-top:0.5rem;">
      <label class="gt-btn gt-btn-outline" style="cursor:pointer;">
        Choose file
        <input type="file" accept=".json" style="display:none" onchange="gtImportFile(event)">
      </label>
      <button class="gt-btn gt-btn-primary" onclick="gtImportJSON()">Import from text area</button>
    </div>

    <p class="gt-section-title" style="color:#c0392b;">Danger Zone</p>
    <button class="gt-btn gt-btn-danger" onclick="gtClearAll()">Delete all shots</button>
  </div>

</div><!-- golf-tracker -->

<script>
(function () {
  // ─── Storage ────────────────────────────────────────────────────────────────
  var STORE_KEY = 'gt_shots_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function save(shots) {
    localStorage.setItem(STORE_KEY, JSON.stringify(shots));
  }

  // ─── State ───────────────────────────────────────────────────────────────────
  var shots = load();
  var sortKey = 'date';
  var sortDir = -1; // -1 = desc, 1 = asc
  var pillState = { lie: '', result: '', strike: '' };

  // ─── Init ────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('gt-date').value = today();
    populateClubFilter();
    gtRenderHistory();
  });

  function today() {
    var d = new Date();
    return d.toISOString().slice(0, 10);
  }

  // ─── Tabs ────────────────────────────────────────────────────────────────────
  window.gtShowTab = function (name) {
    document.querySelectorAll('.gt-tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.gt-panel').forEach(function (p) { p.classList.remove('active'); });
    event.target.classList.add('active');
    document.getElementById('gt-panel-' + name).classList.add('active');
    if (name === 'stats') gtRenderStats();
    if (name === 'history') gtRenderHistory();
  };

  // ─── Pills ───────────────────────────────────────────────────────────────────
  window.gtTogglePill = function (el, group) {
    var pills = el.parentElement.querySelectorAll('.gt-pill');
    pills.forEach(function (p) { p.classList.remove('selected'); });
    if (pillState[group] === el.textContent) {
      pillState[group] = '';
    } else {
      pillState[group] = el.textContent;
      el.classList.add('selected');
    }
    document.getElementById('gt-' + group).value = pillState[group];
  };

  // ─── Save shot ───────────────────────────────────────────────────────────────
  window.gtSaveShot = function (e) {
    e.preventDefault();
    var shot = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: v('gt-date'),
      hole: v('gt-hole') ? parseInt(v('gt-hole')) : null,
      distance: v('gt-distance') ? parseFloat(v('gt-distance')) : null,
      club: v('gt-club'),
      lie: pillState.lie,
      result: pillState.result,
      strike: pillState.strike,
      shape: v('gt-shape'),
      outcome: v('gt-outcome'),
      notes: v('gt-notes'),
    };
    shots.push(shot);
    save(shots);
    populateClubFilter();
    gtNotice('Shot saved!', 'success');
    gtResetForm();
  };

  function v(id) { return document.getElementById(id).value.trim(); }

  window.gtResetForm = function () {
    document.getElementById('gt-shot-form').reset();
    document.getElementById('gt-date').value = today();
    document.querySelectorAll('.gt-pill.selected').forEach(function (p) { p.classList.remove('selected'); });
    pillState = { lie: '', result: '', strike: '' };
  };

  // ─── History ─────────────────────────────────────────────────────────────────
  var filteredShots = [];

  window.gtRenderHistory = function () {
    var fc = document.getElementById('gt-filter-club').value;
    var fr = document.getElementById('gt-filter-result').value;
    var fs = document.getElementById('gt-filter-strike').value;
    var fq = (document.getElementById('gt-filter-search').value || '').toLowerCase();

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

    var tbody = document.getElementById('gt-history-body');
    if (filteredShots.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" class="gt-empty">No shots match the filters.</td></tr>';
      document.getElementById('gt-history-count').textContent = '';
      return;
    }

    tbody.innerHTML = filteredShots.map(function (s, i) {
      return '<tr>' +
        '<td>' + (s.date || '') + '</td>' +
        '<td>' + (s.hole != null ? s.hole : '') + '</td>' +
        '<td>' + esc(s.club) + '</td>' +
        '<td>' + (s.distance != null ? s.distance : '') + '</td>' +
        '<td>' + esc(s.lie) + '</td>' +
        '<td>' + esc(s.result) + '</td>' +
        '<td>' + esc(s.strike) + '</td>' +
        '<td>' + esc(s.shape) + '</td>' +
        '<td>' + esc(s.outcome) + '</td>' +
        '<td style="max-width:180px;word-break:break-word">' + esc(s.notes) + '</td>' +
        '<td><button class="gt-delete-btn" onclick="gtDeleteShot(\'' + s.id + '\')" title="Delete">✕</button></td>' +
        '</tr>';
    }).join('');

    var total = filteredShots.length;
    var all = shots.length;
    document.getElementById('gt-history-count').textContent =
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
  window.gtRenderStats = function () {
    var el = document.getElementById('gt-stats-content');
    if (shots.length === 0) {
      el.innerHTML = '<p class="gt-empty">Log some shots to see statistics.</p>';
      return;
    }

    var withDist = shots.filter(function (s) { return s.distance != null; });
    var avgDist = withDist.length
      ? (withDist.reduce(function (a, s) { return a + s.distance; }, 0) / withDist.length).toFixed(1)
      : '—';

    var pure = shots.filter(function (s) { return s.strike === 'Pure / Solid'; }).length;
    var pureRate = shots.length ? Math.round(pure / shots.length * 100) : 0;

    var onTarget = shots.filter(function (s) { return s.result === 'On Target'; }).length;
    var onTargetRate = shots.length ? Math.round(onTarget / shots.length * 100) : 0;

    el.innerHTML =
      '<div class="gt-stats-grid">' +
        stat('Total shots', shots.length, '') +
        stat('Avg distance', avgDist, 'm') +
        stat('Solid strike', pureRate + '%', pure + ' shots') +
        stat('On target', onTargetRate + '%', onTarget + ' shots') +
      '</div>' +
      barChart('Result distribution', 'result') +
      barChart('Strike distribution', 'strike') +
      barChart('Club usage', 'club') +
      barChart('Lie distribution', 'lie');
  };

  function stat(label, val, sub) {
    return '<div class="gt-stat-card"><h4>' + label + '</h4>' +
      '<div class="gt-stat-val">' + val + '</div>' +
      '<div class="gt-stat-sub">' + sub + '</div></div>';
  }

  function barChart(title, field) {
    var counts = {};
    shots.forEach(function (s) {
      var v = s[field] || '(not set)';
      counts[v] = (counts[v] || 0) + 1;
    });
    var entries = Object.keys(counts).map(function (k) { return [k, counts[k]]; });
    entries.sort(function (a, b) { return b[1] - a[1]; });
    var max = entries.length ? entries[0][1] : 1;

    var rows = entries.map(function (e) {
      var pct = Math.round(e[1] / max * 100);
      return '<div class="gt-bar-row">' +
        '<div class="gt-bar-label">' + esc(e[0]) + '</div>' +
        '<div class="gt-bar-track"><div class="gt-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="gt-bar-count">' + e[1] + '</div></div>';
    }).join('');

    return '<p class="gt-section-title">' + title + '</p><div class="gt-bar-chart">' + rows + '</div>';
  }

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
    var cols = ['date', 'hole', 'club', 'distance', 'lie', 'result', 'strike', 'shape', 'outcome', 'notes'];
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
    if (!Array.isArray(imported)) { gtNotice('Expected a JSON array of shots.', 'error'); return; }

    var existingIds = new Set(shots.map(function (s) { return s.id; }));
    var added = 0;
    imported.forEach(function (s) {
      if (!s.id || existingIds.has(s.id)) return;
      shots.push(s);
      added++;
    });
    save(shots);
    populateClubFilter();
    gtRenderHistory();
    document.getElementById('gt-import-area').value = '';
    gtNotice('Imported ' + added + ' shot' + (added !== 1 ? 's' : '') + '. ' +
      (imported.length - added) + ' duplicate(s) skipped.', 'success');
  };

  window.gtClearAll = function () {
    if (!confirm('Delete ALL ' + shots.length + ' shots? This cannot be undone.')) return;
    shots = [];
    save(shots);
    populateClubFilter();
    gtRenderHistory();
    gtNotice('All shots deleted.', 'success');
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function gtNotice(msg, type) {
    var el = document.getElementById('gt-notice');
    el.textContent = msg;
    el.className = 'gt-notice ' + type;
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.className = 'gt-notice'; }, 3500);
  }

  window.gtNotice = gtNotice;

})();
</script>
