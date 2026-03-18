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
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .gt-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .gt-field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .gt-field label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .gt-field input,
  .gt-field select,
  .gt-field textarea {
    padding: 0.6rem 0.7rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
    background: #fff;
    -webkit-appearance: none;
    appearance: none;
  }

  .gt-field textarea { resize: vertical; min-height: 60px; }

  /* Stepper for hole number */
  .gt-num-input {
    display: flex;
    align-items: stretch;
    border: 1px solid #ccc;
    border-radius: 6px;
    overflow: hidden;
  }

  .gt-num-input input {
    flex: 1;
    border: none;
    text-align: center;
    font-size: 1.2rem;
    font-weight: 700;
    padding: 0.55rem 0;
    min-width: 0;
    background: #fff;
    -moz-appearance: textfield;
  }

  .gt-num-input input::-webkit-outer-spin-button,
  .gt-num-input input::-webkit-inner-spin-button { -webkit-appearance: none; }

  .gt-num-btn {
    background: #f0f0f0;
    border: none;
    padding: 0;
    width: 48px;
    flex-shrink: 0;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: manipulation;
  }

  .gt-num-btn:active { background: #d8d8d8; }

  .gt-btn {
    padding: 0.65rem 1.2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: opacity 0.15s;
    touch-action: manipulation;
    min-height: 44px;
  }

  .gt-btn:hover { opacity: 0.85; }
  .gt-btn-primary { background: #2a7a2a; color: #fff; }
  .gt-btn-secondary { background: #555; color: #fff; }
  .gt-btn-danger { background: #c0392b; color: #fff; }
  .gt-btn-outline { background: transparent; border: 1px solid #555; color: #555; }

  .gt-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  /* Pill selects */
  .gt-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .gt-pill {
    padding: 0.55rem 0.9rem;
    border: 1px solid #ccc;
    border-radius: 22px;
    cursor: pointer;
    font-size: 0.9rem;
    background: #f9f9f9;
    transition: all 0.15s;
    user-select: none;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    touch-action: manipulation;
    box-sizing: border-box;
  }

  .gt-pill:hover { border-color: #888; background: #eee; }
  .gt-pill.selected { background: #2a7a2a; border-color: #2a7a2a; color: #fff; }

  /* Club grid */
  .gt-club-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.4rem;
  }

  .gt-club-pill {
    padding: 0.5rem 0.2rem;
    font-size: 0.88rem;
    min-height: 42px;
    border-radius: 8px;
    justify-content: center;
    text-align: center;
  }

  /* Section sub-header */
  .gt-section-sub {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #2a7a2a;
    padding: 0.4rem 0 0.1rem;
    border-top: 2px solid #d4ecd4;
    margin-top: 0.1rem;
  }

  /* "Add details" toggle */
  .gt-more-toggle {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.65rem 1rem;
    font-size: 0.88rem;
    color: #555;
    cursor: pointer;
    width: 100%;
    text-align: left;
    touch-action: manipulation;
  }

  .gt-more-toggle:active { background: #eee; }

  /* Directional result pad */
  .gt-dpad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
    max-width: 240px;
  }

  .gt-dpad-btn {
    border: 1px solid #ccc;
    border-radius: 8px;
    background: #f9f9f9;
    cursor: pointer;
    padding: 0.45rem 0.2rem;
    min-height: 52px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    touch-action: manipulation;
    user-select: none;
    transition: background 0.1s, border-color 0.1s;
  }

  .gt-dpad-btn:active { background: #e0e0e0; }
  .gt-dpad-btn.selected { background: #2a7a2a; border-color: #2a7a2a; color: #fff; }
  .gt-dpad-arrow { font-size: 1.25rem; line-height: 1; }
  .gt-dpad-label { font-size: 0.6rem; color: #888; line-height: 1.2; text-align: center; }
  .gt-dpad-btn.selected .gt-dpad-label { color: rgba(255,255,255,0.8); }
  .gt-dpad-center { background: #f0f7f0; border-color: #b6d9b6; }
  .gt-dpad-center.selected { background: #2a7a2a; border-color: #2a7a2a; }

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

  /* Rounds list */
  .gt-round-card {
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 0.85rem 1rem;
    margin-bottom: 0.65rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  .gt-round-card.active-round {
    border-color: #2a7a2a;
    background: #f0f7f0;
  }

  .gt-round-card-info { flex: 1; min-width: 0; }
  .gt-round-card-title { font-weight: 700; color: #222; }
  .gt-round-card-sub { font-size: 0.82rem; color: #777; margin-top: 0.15rem; }

  .gt-round-score {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: right;
    white-space: nowrap;
  }

  .gt-round-score-diff {
    font-size: 0.8rem;
    font-weight: 600;
    text-align: right;
  }

  .gt-round-card-actions { display: flex; gap: 0.4rem; flex-shrink: 0; }

  /* Scorecard */
  .gt-scorecard-wrap { overflow-x: auto; margin-top: 0.75rem; }

  .gt-scorecard {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
    min-width: 600px;
  }

  .gt-scorecard th, .gt-scorecard td {
    padding: 0.35rem 0.45rem;
    border: 1px solid #ddd;
    text-align: center;
    white-space: nowrap;
  }

  .gt-scorecard th {
    background: #f0f0f0;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .gt-scorecard .sc-hole-label { text-align: left; font-weight: 700; }
  .gt-scorecard .sc-par-row td { background: #f5f5f5; font-weight: 600; color: #555; }
  .gt-scorecard .sc-total { font-weight: 700; background: #eee; }

  .sc-eagle  { background: #ffd700 !important; font-weight: 700; border-radius: 50%; }
  .sc-birdie { background: #d4edda !important; font-weight: 700; }
  .sc-par    { }
  .sc-bogey  { background: #fff3cd !important; }
  .sc-double { background: #ffd7d7 !important; }
  .sc-triple { background: #f5b7b7 !important; font-weight: 700; }

  .sc-yes { color: #2a7a2a; font-weight: 700; }
  .sc-no  { color: #c0392b; }
  .sc-na  { color: #ccc; }

  .gt-scorecard-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 0.6rem;
    margin-top: 1rem;
  }

  .gt-sc-stat {
    background: #f7f7f7;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 0.6rem 0.8rem;
    text-align: center;
  }

  .gt-sc-stat-val { font-size: 1.4rem; font-weight: 700; color: #2a7a2a; }
  .gt-sc-stat-label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }

  /* Target HCP comparison */
  .gt-hcp-compare-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-top: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .gt-hcp-card {
    background: #f7f7f7;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.9rem 1rem;
  }

  .gt-hcp-card h4 {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
  }

  .gt-hcp-card-vals {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
  }

  .gt-hcp-current { font-size: 1.3rem; font-weight: 700; }
  .gt-hcp-target-val { font-size: 0.88rem; color: #888; }

  .gt-hcp-bar-wrap {
    position: relative;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    margin: 0.4rem 0;
    overflow: visible;
  }

  .gt-hcp-bar-fill {
    height: 100%;
    border-radius: 4px;
    position: absolute;
    top: 0;
    left: 0;
  }

  .gt-hcp-bar-marker {
    position: absolute;
    top: -5px;
    width: 3px;
    height: 18px;
    background: #333;
    border-radius: 2px;
    transform: translateX(-50%);
  }

  .gt-hcp-gap {
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }

  .gap-ahead { color: #2a7a2a; font-weight: 600; }
  .gap-behind { color: #c0392b; font-weight: 600; }
  .gap-close { color: #888; }

  .gt-priority-badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 0.25rem;
  }

  .priority-1 { background: #c0392b; color: #fff; }
  .priority-2 { background: #e67e22; color: #fff; }
  .priority-3 { background: #f39c12; color: #fff; }
  .priority-ok { background: #2a7a2a; color: #fff; }

  /* Courses */
  .gt-course-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.55rem 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    margin-bottom: 0.4rem;
    background: #fafafa;
  }

  .gt-par-inputs {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .gt-par-inputs input {
    text-align: center;
    padding: 0.3rem 0.1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
    width: 100%;
    box-sizing: border-box;
  }

  .gt-par-hole-labels {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.15rem;
  }

  .gt-par-hole-labels span {
    text-align: center;
    font-size: 0.7rem;
    color: #888;
  }

  .gt-new-course-form {
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
    display: none;
  }

  .gt-new-course-form.open { display: block; }

  /* Active round banner */
  .gt-active-round-bar {
    display: none;
    background: #f0f7f0;
    border: 1px solid #b6d9b6;
    border-radius: 4px;
    padding: 0.5rem 0.8rem;
    margin-bottom: 0.8rem;
    font-size: 0.85rem;
    color: #2a7a2a;
    display: none;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .gt-active-round-bar.shown { display: flex; }

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

  /* Strokes Gained */
  .sg-pos { color: #2a7a2a; font-weight: 600; }
  .sg-neg { color: #c0392b; font-weight: 600; }
  .sg-zero { color: #888; }

  .gt-sg-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .gt-sg-card {
    background: #f7f7f7;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 1rem;
  }

  .gt-sg-card h4 {
    margin: 0 0 0.4rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
  }

  .gt-sg-val {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .gt-sg-sub { font-size: 0.78rem; color: #888; margin-top: 0.2rem; }

  /* Wider bar labels for club names */
  .gt-bar-label-wide { width: 140px; flex-shrink: 0; text-align: right; color: #555; font-size: 0.85rem; }

  .gt-sg-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;
    margin-top: 0.5rem;
  }

  .gt-sg-table th {
    background: #f0f0f0;
    padding: 0.4rem 0.6rem;
    text-align: left;
    border-bottom: 2px solid #ccc;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .gt-sg-table td {
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid #eee;
  }

  .gt-sg-table tr:hover td { background: #fafafa; }

  .gt-info {
    font-size: 0.82rem;
    color: #777;
    background: #f9f9f9;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 0.6rem 0.8rem;
    margin-bottom: 1rem;
  }

  /* Club distances */
  .gt-club-dist-wrap { overflow-x: auto; margin-bottom: 0.75rem; }

  .gt-club-dist-table {
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .gt-club-dist-table th {
    background: #f0f0f0;
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
    text-align: center;
    border: 1px solid #ddd;
    white-space: nowrap;
  }

  .gt-club-dist-table td {
    padding: 0.25rem 0.3rem;
    border: 1px solid #eee;
    text-align: center;
  }

  .gt-club-dist-table input {
    width: 52px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.25rem 0.2rem;
    font-size: 0.88rem;
    box-sizing: border-box;
  }

  .gt-wedge-hdr { background: #f0f7f0 !important; color: #2a7a2a !important; font-weight: 700 !important; }

  /* Swing pills in shot form */
  .gt-swing-row { display: none; }
  .gt-swing-row.visible { display: block; }

  /* Auto-select hint */
  .gt-dist-hint {
    font-size: 0.75rem;
    color: #2a7a2a;
    margin-top: 0.2rem;
    min-height: 1em;
    font-style: italic;
  }
</style>

<div class="golf-tracker">

  <div id="gt-notice" class="gt-notice"></div>

  <div class="gt-tabs">
    <div class="gt-tab active" onclick="gtShowTab('log')">Log Shot</div>
    <div class="gt-tab" onclick="gtShowTab('rounds')">Rounds</div>
    <div class="gt-tab" onclick="gtShowTab('history')">History</div>
    <div class="gt-tab" onclick="gtShowTab('stats')">Stats</div>
    <div class="gt-tab" onclick="gtShowTab('io')">Import / Export</div>
    <div class="gt-tab" onclick="gtShowTab('settings')">Settings</div>
  </div>

  <!-- LOG SHOT -->
  <div id="gt-panel-log" class="gt-panel active">

    <!-- Course context: always visible, drives auto-round creation -->
    <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;background:#f9f9f9;border:1px solid #e4e4e4;border-radius:6px;padding:0.55rem 0.8rem;margin-bottom:0.8rem;font-size:0.88rem;">
      <span style="font-weight:700;color:#555;white-space:nowrap;">Playing at:</span>
      <select id="gt-course-ctx" onchange="gtCourseCtxChange()" style="flex:1;min-width:140px;padding:0.3rem 0.5rem;border:1px solid #ccc;border-radius:4px;font-size:0.88rem;background:#fff;">
        <option value="">Practice (no round)</option>
      </select>
      <input type="text" id="gt-new-course-inline" placeholder="New course name…" style="display:none;flex:1;min-width:140px;padding:0.3rem 0.5rem;border:1px solid #2a7a2a;border-radius:4px;font-size:0.88rem;">
      <span id="gt-round-ctx-label" style="font-size:0.8rem;color:#666;white-space:nowrap;"></span>
    </div>

    <div id="gt-shot-status" style="display:none;font-size:0.85rem;color:#444;background:#f0f7f0;border:1px solid #b6d9b6;border-radius:4px;padding:0.5rem 0.8rem;margin-bottom:0.8rem;"></div>
    <form id="gt-shot-form" onsubmit="gtSaveShot(event)">
      <div class="gt-form">

        <!-- Hole + Distance -->
        <div class="gt-row">
          <div class="gt-field">
            <label>Hole</label>
            <div class="gt-num-input">
              <button type="button" class="gt-num-btn" onclick="gtAdjNum('gt-hole',-1,1,18)">−</button>
              <input type="number" id="gt-hole" min="1" max="18" placeholder="?" inputmode="numeric">
              <button type="button" class="gt-num-btn" onclick="gtAdjNum('gt-hole',1,1,18)">+</button>
            </div>
          </div>
          <div class="gt-field">
            <label>Distance (m)</label>
            <input type="number" id="gt-distance" min="0" step="1" placeholder="e.g. 150" inputmode="decimal" oninput="gtAutoSelectClub(this.value)">
            <div class="gt-dist-hint" id="gt-dist-hint"></div>
          </div>
        </div>

        <!-- Club -->
        <div class="gt-field">
          <label>Club</label>
          <div class="gt-club-grid" id="gt-club-pills">
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">Driver</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">3W</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">5W</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">7W</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">H</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">4I</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">5I</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">6I</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">7I</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">8I</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">9I</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">PW</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">GW</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">SW</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">LW</span>
            <span class="gt-pill gt-club-pill" onclick="gtTogglePill(this,'club')">Putter</span>
          </div>
          <input type="hidden" id="gt-club">
        </div>

        <!-- Swing (wedge only) -->
        <div class="gt-field gt-swing-row" id="gt-swing-row">
          <label>Swing</label>
          <div class="gt-pills" id="gt-swing-pills">
            <span class="gt-pill" onclick="gtTogglePill(this,'swing')">¼</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'swing')">½</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'swing')">¾</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'swing')">Full</span>
          </div>
          <input type="hidden" id="gt-swing">
        </div>

        <!-- Lie -->
        <div class="gt-field">
          <label>Lie</label>
          <div class="gt-pills" id="gt-lie-pills">
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Tee</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Fairway</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Rough</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Deep Rough</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Sand</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Fringe</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Hardpan</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Divot</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'lie')">Green</span>
          </div>
          <input type="hidden" id="gt-lie">
        </div>

        <!-- Ball finish -->
        <div class="gt-section-sub">Where did it finish?</div>

        <div class="gt-field">
          <label>End distance (m)</label>
          <input type="number" id="gt-end-distance" min="0" step="0.5" placeholder="0 = holed" inputmode="decimal">
        </div>

        <div class="gt-field">
          <label>End lie</label>
          <div class="gt-pills" id="gt-end-lie-pills">
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">Fairway</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">Rough</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">Deep Rough</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">Sand</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">Fringe</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">Hardpan</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">Divot</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">Green</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">OB / Lost</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">Water</span>
            <span class="gt-pill" onclick="gtTogglePill(this,'endLie')">Holed</span>
          </div>
          <input type="hidden" id="gt-endLie">
        </div>

        <!-- Collapsible extra details -->
        <button type="button" class="gt-more-toggle" id="gt-more-btn" onclick="gtToggleMore()">▸ Add details — result, strike, shape, notes</button>
        <div id="gt-more-section" style="display:none;">
          <div class="gt-form" style="margin-top:0.75rem;">

            <div class="gt-field">
              <label>Result</label>
              <div class="gt-dpad">
                <button type="button" class="gt-dpad-btn" data-value="Long Left"  onclick="gtToggleDpad(this,'result')"><span class="gt-dpad-arrow">↖</span><span class="gt-dpad-label">Long Left</span></button>
                <button type="button" class="gt-dpad-btn" data-value="Long"       onclick="gtToggleDpad(this,'result')"><span class="gt-dpad-arrow">↑</span><span class="gt-dpad-label">Long</span></button>
                <button type="button" class="gt-dpad-btn" data-value="Long Right" onclick="gtToggleDpad(this,'result')"><span class="gt-dpad-arrow">↗</span><span class="gt-dpad-label">Long Right</span></button>
                <button type="button" class="gt-dpad-btn" data-value="Left"       onclick="gtToggleDpad(this,'result')"><span class="gt-dpad-arrow">←</span><span class="gt-dpad-label">Left</span></button>
                <button type="button" class="gt-dpad-btn gt-dpad-center" data-value="On Target" onclick="gtToggleDpad(this,'result')"><span class="gt-dpad-arrow">●</span><span class="gt-dpad-label">On Target</span></button>
                <button type="button" class="gt-dpad-btn" data-value="Right"      onclick="gtToggleDpad(this,'result')"><span class="gt-dpad-arrow">→</span><span class="gt-dpad-label">Right</span></button>
                <button type="button" class="gt-dpad-btn" data-value="Short Left" onclick="gtToggleDpad(this,'result')"><span class="gt-dpad-arrow">↙</span><span class="gt-dpad-label">Short Left</span></button>
                <button type="button" class="gt-dpad-btn" data-value="Short"      onclick="gtToggleDpad(this,'result')"><span class="gt-dpad-arrow">↓</span><span class="gt-dpad-label">Short</span></button>
                <button type="button" class="gt-dpad-btn" data-value="Short Right" onclick="gtToggleDpad(this,'result')"><span class="gt-dpad-arrow">↘</span><span class="gt-dpad-label">Short Right</span></button>
              </div>
              <input type="hidden" id="gt-result">
            </div>

            <div class="gt-field">
              <label>Strike</label>
              <div class="gt-pills" id="gt-strike-pills">
                <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Pure / Solid</span>
                <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Thin</span>
                <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Fat / Chunked</span>
                <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Shank</span>
                <span class="gt-pill" onclick="gtTogglePill(this,'strike')">Mis-hit</span>
              </div>
              <input type="hidden" id="gt-strike">
            </div>

            <div class="gt-field">
              <label>Shape</label>
              <div class="gt-pills" id="gt-shape-pills">
                <span class="gt-pill" onclick="gtTogglePill(this,'shape')">Straight</span>
                <span class="gt-pill" onclick="gtTogglePill(this,'shape')">Draw</span>
                <span class="gt-pill" onclick="gtTogglePill(this,'shape')">Fade</span>
                <span class="gt-pill" onclick="gtTogglePill(this,'shape')">Hook</span>
                <span class="gt-pill" onclick="gtTogglePill(this,'shape')">Slice</span>
                <span class="gt-pill" onclick="gtTogglePill(this,'shape')">Punch</span>
                <span class="gt-pill" onclick="gtTogglePill(this,'shape')">Flop</span>
              </div>
              <input type="hidden" id="gt-shape">
            </div>

            <div class="gt-field">
              <label>Notes</label>
              <textarea id="gt-notes" placeholder="Wind, slope, swing thoughts…"></textarea>
            </div>

            <div class="gt-field">
              <label>Date</label>
              <input type="date" id="gt-date">
            </div>

          </div>
        </div>

      </div><!-- gt-form -->

      <div class="gt-actions">
        <button type="submit" class="gt-btn gt-btn-primary" style="flex:1;">Save Shot</button>
        <button type="button" class="gt-btn gt-btn-outline" onclick="gtResetForm()">Clear</button>
      </div>

    </form>
  </div><!-- panel-log -->

  <!-- ROUNDS -->
  <div id="gt-panel-rounds" class="gt-panel">

    <!-- Rounds list -->
    <div id="gt-rounds-list-view">
      <div style="margin-bottom:0.75rem;">
        <h3 style="margin:0 0 0.25rem;font-size:1rem;">Rounds</h3>
        <p style="margin:0;font-size:0.82rem;color:#888;">Rounds start automatically when you log your first shot on hole 1. Select a course in the "Playing at" bar on the Log Shot tab first.</p>
      </div>
      <div id="gt-rounds-list">
        <p class="gt-empty">No rounds yet — log a shot on hole 1 to start one.</p>
      </div>
    </div>

    <!-- Scorecard view (shown when a round is selected) -->
    <div id="gt-scorecard-view" style="display:none;">
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
        <button class="gt-btn gt-btn-outline" style="padding:0.4rem 0.8rem;font-size:0.85rem;" onclick="gtShowRoundsList()">← Rounds</button>
        <h3 id="gt-scorecard-title" style="margin:0;font-size:1rem;"></h3>
      </div>
      <div id="gt-scorecard-content"></div>
    </div>

  </div><!-- panel-rounds -->

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
            <th>Swing</th>
            <th onclick="gtSort('distance')" id="gt-th-distance">Dist (m)</th>
            <th onclick="gtSort('lie')" id="gt-th-lie">Lie</th>
            <th onclick="gtSort('result')" id="gt-th-result">Result</th>
            <th onclick="gtSort('strike')" id="gt-th-strike">Strike</th>
            <th>Shape</th>
            <th onclick="gtSort('sg')" id="gt-th-sg">SG</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="gt-history-body">
          <tr><td colspan="12" class="gt-empty">No shots logged yet.</td></tr>
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

  <!-- SETTINGS -->
  <div id="gt-panel-settings" class="gt-panel">

    <p class="gt-section-title">Player</p>
    <div class="gt-row" style="max-width:460px;">
      <div class="gt-field">
        <label>Handicap Index</label>
        <input type="number" id="gt-hcp" min="0" max="54" step="0.1" placeholder="e.g. 18.4" inputmode="decimal">
      </div>
      <div class="gt-field">
        <label>Target HCP</label>
        <input type="number" id="gt-target-hcp" min="0" max="54" step="0.1" placeholder="e.g. 10.0" inputmode="decimal">
        <span style="font-size:0.75rem;color:#888;margin-top:0.2rem;">SG benchmarks in Stats will show what you need to reach this goal.</span>
      </div>
    </div>

    <p class="gt-section-title" style="margin-top:1.5rem;">Your Bag</p>
    <p style="font-size:0.85rem;color:#666;margin:0 0 0.75rem;">Tap to toggle clubs you carry. Only selected clubs appear in the shot logger.</p>
    <div class="gt-club-grid" id="gt-bag-pills" style="max-width:420px;">
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">Driver</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">3W</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">5W</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">7W</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">H</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">4I</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">5I</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">6I</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">7I</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">8I</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">9I</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">PW</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">GW</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">SW</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">LW</span>
      <span class="gt-pill gt-club-pill" onclick="this.classList.toggle('selected')">Putter</span>
    </div>

    <p class="gt-section-title" style="margin-top:1.5rem;">Club Distances (m)</p>
    <p style="font-size:0.85rem;color:#666;margin:0 0 0.75rem;">Enter your typical carry distances. The closest club is auto-selected when you type a distance on the Log Shot tab.</p>
    <div class="gt-club-dist-wrap">
      <table class="gt-club-dist-table" id="gt-club-dist-table">
        <!-- populated by JS -->
      </table>
    </div>

    <p class="gt-section-title" style="margin-top:1rem;">Wedge Matrix (m)</p>
    <p style="font-size:0.85rem;color:#666;margin:0 0 0.75rem;">Enter carry distances for each wedge swing length. Selecting a distance will auto-pick the closest wedge + swing combination.</p>
    <div class="gt-club-dist-wrap">
      <table class="gt-club-dist-table" id="gt-wedge-matrix-table">
        <!-- populated by JS -->
      </table>
    </div>

    <div class="gt-actions">
      <button class="gt-btn gt-btn-primary" onclick="gtSaveSettings()">Save Settings</button>
    </div>
    <p id="gt-settings-notice" style="display:none;font-size:0.85rem;color:#2a7a2a;margin-top:0.5rem;"></p>

    <!-- Courses -->
    <p class="gt-section-title" style="margin-top:2rem;">Courses</p>
    <p style="font-size:0.85rem;color:#666;margin:0 0 0.75rem;">Add courses to track scorecards with accurate par per hole.</p>

    <div id="gt-courses-list"></div>

    <div id="gt-new-course-form" class="gt-new-course-form">
      <div class="gt-field" style="margin-bottom:0.75rem;">
        <label>Course Name</label>
        <input type="text" id="gt-course-name" placeholder="e.g. Augusta National">
      </div>
      <div style="margin-bottom:0.5rem;">
        <p style="font-size:0.8rem;font-weight:700;color:#444;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 0.3rem;">Front 9 Par (holes 1–9)</p>
        <div class="gt-par-hole-labels">
          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
        </div>
        <div class="gt-par-inputs" id="gt-par-front">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
          <input type="number" min="3" max="6" value="3" class="gt-par-inp">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
          <input type="number" min="3" max="6" value="5" class="gt-par-inp">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
          <input type="number" min="3" max="6" value="3" class="gt-par-inp">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
        </div>
      </div>
      <div style="margin-bottom:0.75rem;">
        <p style="font-size:0.8rem;font-weight:700;color:#444;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 0.3rem;">Back 9 Par (holes 10–18)</p>
        <div class="gt-par-hole-labels">
          <span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span>
        </div>
        <div class="gt-par-inputs" id="gt-par-back">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
          <input type="number" min="3" max="6" value="3" class="gt-par-inp">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
          <input type="number" min="3" max="6" value="5" class="gt-par-inp">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
          <input type="number" min="3" max="6" value="3" class="gt-par-inp">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
          <input type="number" min="3" max="6" value="4" class="gt-par-inp">
        </div>
      </div>
      <div class="gt-actions">
        <button class="gt-btn gt-btn-primary" onclick="gtSaveCourse()">Save Course</button>
        <button class="gt-btn gt-btn-outline" onclick="gtCancelCourse()">Cancel</button>
      </div>
    </div>

    <button class="gt-btn gt-btn-secondary" id="gt-add-course-btn" onclick="gtShowNewCourseForm()" style="margin-top:0.5rem;">+ Add Course</button>

  </div>

</div><!-- golf-tracker -->

<script>
(function () {
  // ─── Strokes Gained baseline tables ─────────────────────────────────────────
  // Expected strokes to hole out. Based on scratch-golfer reference (Broadie).
  // Format: [distance_metres, expected_strokes]. dist=0 always → 0 strokes.
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
  // Penalty lies relative to fairway
  var SG_OFFSETS = {
    'Tee':        0,      // tee shot advantage ≈ same as fairway
    'Fairway':    0,
    'Fringe':     0.05,
    'Hardpan':    0.10,
    'Rough':      0.18,
    'Divot':      0.20,
    'Deep Rough': 0.32,
    'Sand':       0.38,
    'Uphill':     0.08,
    'Downhill':   0.08,
    'Sidehill':   0.10,
    'Green':      null,   // use SG_GREEN table
    'Holed':      null,   // always 0
    'OB / Lost':  2.0,    // stroke + distance penalty approximation
    'Water':      1.5
  };

  function lerp(table, dist) {
    if (dist <= 0) return 0;
    if (dist <= table[0][0]) return table[0][1];
    if (dist >= table[table.length - 1][0]) {
      // Extrapolate linearly beyond the last point
      var n = table.length;
      var d0 = table[n-2][0], v0 = table[n-2][1];
      var d1 = table[n-1][0], v1 = table[n-1][1];
      return v1 + (dist - d1) * (v1 - v0) / (d1 - d0);
    }
    for (var i = 1; i < table.length; i++) {
      if (dist <= table[i][0]) {
        var t = (dist - table[i-1][0]) / (table[i][0] - table[i-1][0]);
        return table[i-1][1] + t * (table[i][1] - table[i-1][1]);
      }
    }
    return table[table.length-1][1];
  }

  function sgExpected(dist, lie) {
    if (dist == null || dist < 0) return null;
    if (dist === 0 || lie === 'Holed') return 0;
    if (lie === 'Green') return lerp(SG_GREEN, dist);
    var offset = (SG_OFFSETS[lie] != null) ? SG_OFFSETS[lie] : 0.15; // unknown lie → rough approx
    if (lie === 'OB / Lost') return lerp(SG_FAIRWAY, dist) + 2.0;
    if (lie === 'Water')     return lerp(SG_FAIRWAY, dist) + 1.5;
    return lerp(SG_FAIRWAY, dist) + offset;
  }

  function calcSG(shot) {
    if (shot.distance == null || shot.end_distance == null) return null;
    var exp_start = sgExpected(shot.distance, shot.lie || 'Fairway');
    var exp_end   = sgExpected(shot.end_distance, shot.end_lie || 'Fairway');
    if (exp_start == null || exp_end == null) return null;
    return exp_start - exp_end - 1;
  }

  function sgCategory(shot) {
    var lie  = shot.lie || '';
    var dist = shot.distance;
    var club = shot.club || '';
    if (lie === 'Green' || club === 'Putter') return 'Putting';
    if (lie === 'Tee' && dist != null && dist >= 100) return 'Off the Tee';
    if (dist != null && dist < 30) return 'Around the Green';
    return 'Approach';
  }

  function fmtSG(val, decimals) {
    if (val == null) return '<span class="sg-zero">—</span>';
    var d = decimals != null ? decimals : 2;
    var s = (val >= 0 ? '+' : '') + val.toFixed(d);
    var cls = val > 0.01 ? 'sg-pos' : val < -0.01 ? 'sg-neg' : 'sg-zero';
    return '<span class="' + cls + '">' + s + '</span>';
  }

  // ─── Storage ────────────────────────────────────────────────────────────────
  var STORE_KEY    = 'gt_shots_v1';
  var SETTINGS_KEY = 'gt_settings_v1';
  var ROUNDS_KEY   = 'gt_rounds_v1';
  var COURSES_KEY  = 'gt_courses_v1';
  var ALL_CLUBS = ['Driver','3W','5W','7W','H','4I','5I','6I','7I','8I','9I','PW','GW','SW','LW','Putter'];
  var WEDGES    = ['PW','GW','SW','LW'];
  var SWINGS    = ['¼','½','¾','Full'];

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function save(shots) {
    localStorage.setItem(STORE_KEY, JSON.stringify(shots));
  }

  function loadSettings() {
    try {
      var s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
      return s || { hcp: null, targetHcp: null, bag: ALL_CLUBS.slice(), clubDistances: {} };
    }
    catch (e) { return { hcp: null, targetHcp: null, bag: ALL_CLUBS.slice(), clubDistances: {} }; }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function loadRounds() {
    try { return JSON.parse(localStorage.getItem(ROUNDS_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveRounds(r) {
    localStorage.setItem(ROUNDS_KEY, JSON.stringify(r));
  }

  function loadCourses() {
    try { return JSON.parse(localStorage.getItem(COURSES_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveCourses(c) {
    localStorage.setItem(COURSES_KEY, JSON.stringify(c));
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
    var bag = settings.bag || ALL_CLUBS;
    var cd  = settings.clubDistances || {};

    // ── Non-wedge club distances ──────────────────────────────────────────────
    var nonWedge = bag.filter(function (c) { return WEDGES.indexOf(c) === -1 && c !== 'Putter'; });
    var tbl = document.getElementById('gt-club-dist-table');
    if (tbl) {
      if (nonWedge.length === 0) {
        tbl.innerHTML = '';
      } else {
        var hdrs = nonWedge.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('');
        var inps = nonWedge.map(function (c) {
          var v = (typeof cd[c] === 'number' && cd[c] > 0) ? cd[c] : '';
          return '<td><input class="gt-cdist-inp" type="number" min="1" max="400" step="1" ' +
            'data-club="' + c + '" value="' + v + '" placeholder="—" inputmode="decimal"></td>';
        }).join('');
        tbl.innerHTML = '<thead><tr><th style="text-align:left;padding-right:0.75rem;">Club</th>' + hdrs + '</tr></thead>' +
          '<tbody><tr><td style="font-size:0.75rem;color:#888;white-space:nowrap;">Distance (m)</td>' + inps + '</tr></tbody>';
      }
    }

    // ── Wedge matrix ─────────────────────────────────────────────────────────
    var bagWedges = WEDGES.filter(function (w) { return bag.indexOf(w) !== -1; });
    var wTbl = document.getElementById('gt-wedge-matrix-table');
    if (wTbl) {
      if (bagWedges.length === 0) {
        wTbl.innerHTML = '<tr><td style="font-size:0.85rem;color:#888;padding:0.5rem;">No wedges in bag.</td></tr>';
      } else {
        var wHdr = '<thead><tr><th style="text-align:left;">Club</th>' +
          SWINGS.map(function (s) { return '<th class="gt-wedge-hdr">' + s + '</th>'; }).join('') +
          '</tr></thead>';
        var wBody = '<tbody>' + bagWedges.map(function (w) {
          var wcd = (typeof cd[w] === 'object' && cd[w] !== null) ? cd[w] : {};
          var cells = SWINGS.map(function (s) {
            var v = (wcd[s] > 0) ? wcd[s] : '';
            return '<td><input class="gt-wdist-inp" type="number" min="1" max="200" step="1" ' +
              'data-club="' + w + '" data-swing="' + s + '" value="' + v + '" placeholder="—" inputmode="decimal"></td>';
          }).join('');
          return '<tr><td style="font-weight:700;padding-right:0.5rem;">' + w + '</td>' + cells + '</tr>';
        }).join('') + '</tbody>';
        wTbl.innerHTML = wHdr + wBody;
      }
    }
  }

  window.gtSaveSettings = function () {
    var hcpVal = document.getElementById('gt-hcp').value;
    var targetHcpVal = document.getElementById('gt-target-hcp').value;
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
      hcp:           hcpVal      !== '' ? parseFloat(hcpVal)      : null,
      targetHcp:     targetHcpVal !== '' ? parseFloat(targetHcpVal) : null,
      bag:           bag,
      clubDistances: cd
    };
    saveSettings(settings);
    applyBag(bag);
    gtRenderClubDistTables(); // refresh so new bag clubs appear
    var notice = document.getElementById('gt-settings-notice');
    notice.textContent = 'Settings saved.';
    notice.style.display = 'block';
    setTimeout(function () { notice.style.display = 'none'; }, 2500);
  };

  // ─── State ───────────────────────────────────────────────────────────────────
  var shots = load();
  var rounds = loadRounds();
  var courses = loadCourses();
  var activeRoundId = null; // set when a round is started
  var sortKey = 'date';
  var sortDir = -1; // -1 = desc, 1 = asc
  var pillState = { lie: '', result: '', strike: '', endLie: '', club: '', shape: '', swing: '' };

  // ─── Init ────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('gt-date').value = today();
    populateClubFilter();
    gtRenderHistory();
    gtRenderCoursesList();
    gtRenderRoundsList();

    // Apply saved settings
    var settings = loadSettings();
    if (settings.hcp != null) document.getElementById('gt-hcp').value = settings.hcp;
    if (settings.targetHcp != null) document.getElementById('gt-target-hcp').value = settings.targetHcp;
    // Mark bag pills as selected
    document.querySelectorAll('#gt-bag-pills .gt-pill').forEach(function (p) {
      if (settings.bag.indexOf(p.textContent.trim()) !== -1) p.classList.add('selected');
    });
    applyBag(settings.bag);
    gtRenderClubDistTables();
    populateCourseCtxDropdown();
    gtUpdateRoundCtxLabel();
  });

  window.gtAdjNum = function (id, delta, min, max) {
    var el = document.getElementById(id);
    var val = parseInt(el.value) || (delta > 0 ? min - 1 : max + 1);
    el.value = Math.max(min, Math.min(max, val + delta));
  };

  window.gtToggleDpad = function (el, group) {
    el.closest('.gt-dpad').querySelectorAll('.gt-dpad-btn').forEach(function (b) { b.classList.remove('selected'); });
    var val = el.dataset.value;
    if (pillState[group] === val) {
      pillState[group] = '';
    } else {
      pillState[group] = val;
      el.classList.add('selected');
    }
    document.getElementById('gt-' + group).value = pillState[group];
  };

  window.gtToggleMore = function () {
    var sec = document.getElementById('gt-more-section');
    var btn = document.getElementById('gt-more-btn');
    var open = sec.style.display !== 'none';
    sec.style.display = open ? 'none' : 'block';
    btn.textContent = open ? '▸ Add details — result, strike, shape, notes' : '▾ Hide details';
  };

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
    if (name === 'rounds') { gtShowRoundsList(); gtRenderRoundsList(); }
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
    if (group === 'club') gtOnClubSelected(pillState[group]);
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

    bag.forEach(function (club) {
      if (club === 'Putter') return;
      var d = cd[club];
      if (!d) return;
      if (WEDGES.indexOf(club) !== -1 && typeof d === 'object') {
        SWINGS.forEach(function (swing) {
          var dv = d[swing];
          if (dv == null || dv <= 0) return;
          var diff = Math.abs(dist - dv);
          if (diff < bestDiff) { bestDiff = diff; best = { club: club, swing: swing }; }
        });
      } else if (typeof d === 'number' && d > 0) {
        var diff = Math.abs(dist - d);
        if (diff < bestDiff) { bestDiff = diff; best = { club: club, swing: null }; }
      }
    });

    if (!best) { if (hint) hint.textContent = ''; return; }

    // Only auto-select if within 20 % of club distance (avoids wild suggestions)
    var refDist = best.swing ? cd[best.club][best.swing] : cd[best.club];
    if (refDist && bestDiff / refDist > 0.25) { if (hint) hint.textContent = ''; return; }

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
        newCourseInput.style.display = 'none';
        newCourseInput.value = '';
      } else {
        // Nothing typed → fall back to Practice
        populateCourseCtxDropdown('');
        newCourseInput.style.display = 'none';
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
      } else {
        var newRound = gtAutoCreateRound(courseId, shotDate);
        gtNotice('Round started at ' + (courses.find(function(c){return c.id===courseId;})||{name:'?'}).name + '!', 'success');
      }
    } else if (holeNum === 1 && courseId === null) {
      // Hole 1, no course selected → still create a round (no course)
      var existingRound = rounds.find(function (r) { return r.date === shotDate && r.courseId === null; });
      if (!existingRound) {
        gtAutoCreateRound(null, shotDate);
      } else {
        activeRoundId = existingRound.id;
      }
    }

    var endDistRaw = v('gt-end-distance');
    var shot = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: shotDate,
      hole: holeNum,
      distance: v('gt-distance') ? parseFloat(v('gt-distance')) : null,
      club: pillState.club,
      swing: pillState.swing || null,
      lie: pillState.lie,
      result: pillState.result,
      strike: pillState.strike,
      shape: pillState.shape,
      end_distance: endDistRaw !== '' ? parseFloat(endDistRaw) : null,
      end_lie: pillState.endLie,
      notes: v('gt-notes'),
      roundId: activeRoundId || null,
    };
    shot.sg = calcSG(shot);
    shots.push(shot);
    save(shots);
    populateClubFilter();
    gtUpdateRoundCtxLabel();
    gtNotice('Shot saved!', 'success');
    gtPrefillNext(shot);
  };

  function v(id) { return document.getElementById(id).value.trim(); }

  function clearForm() {
    document.getElementById('gt-shot-form').reset();
    document.querySelectorAll('.gt-pill.selected, .gt-dpad-btn.selected').forEach(function (p) { p.classList.remove('selected'); });
    pillState = { lie: '', result: '', strike: '', endLie: '', club: '', shape: '', swing: '' };
    gtOnClubSelected(''); // hide swing row
    document.getElementById('gt-dist-hint').textContent = '';
  }

  // Called by the Clear button — wipes everything
  window.gtResetForm = function () {
    clearForm();
    document.getElementById('gt-date').value = today();
    document.getElementById('gt-shot-status').style.display = 'none';
    // Collapse "More" section
    document.getElementById('gt-more-section').style.display = 'none';
    document.getElementById('gt-more-btn').textContent = '▸ Add details — result, strike, shape, notes';
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
      }
      var holeShots = shots.filter(function (s) { return s.date === shot.date && s.hole === shot.hole; }).length;
      updateShotStatus(null, 'Hole ' + shot.hole + ' complete in ' + holeShots + ' shot' + (holeShots !== 1 ? 's' : '') +
        (shot.hole < 18 ? ' — moving to hole ' + (shot.hole + 1) : ' — round done!'));
    } else {
      // Keep same hole
      if (shot.hole != null) document.getElementById('gt-hole').value = shot.hole;

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
  }

  // Programmatically select a pill and update pillState
  function selectPill(containerId, group, value) {
    var container = document.getElementById(containerId);
    if (!container || !value) return;
    container.querySelectorAll('.gt-pill').forEach(function (p) {
      if (p.textContent.trim() === value) {
        p.classList.add('selected');
        pillState[group] = value;
      }
    });
  }

  function updateShotStatus(el, msg) {
    var bar = document.getElementById('gt-shot-status');
    if (!msg) { bar.style.display = 'none'; return; }
    bar.textContent = msg;
    bar.style.display = 'block';
  }


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
      tbody.innerHTML = '<tr><td colspan="12" class="gt-empty">No shots match the filters.</td></tr>';
      document.getElementById('gt-history-count').textContent = '';
      return;
    }

    tbody.innerHTML = filteredShots.map(function (s) {
      var sg = s.sg != null ? s.sg : calcSG(s);
      return '<tr>' +
        '<td>' + (s.date || '') + '</td>' +
        '<td>' + (s.hole != null ? s.hole : '') + '</td>' +
        '<td>' + esc(s.club) + '</td>' +
        '<td>' + esc(s.swing || '') + '</td>' +
        '<td>' + (s.distance != null ? s.distance : '') + '</td>' +
        '<td>' + esc(s.lie) + '</td>' +
        '<td>' + esc(s.result) + '</td>' +
        '<td>' + esc(s.strike) + '</td>' +
        '<td>' + esc(s.shape) + '</td>' +
        '<td style="white-space:nowrap">' + fmtSG(sg) + '</td>' +
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

    // ── Strokes Gained computation ─────────────────────────────────────────────
    var CATS = ['Off the Tee', 'Approach', 'Around the Green', 'Putting'];
    var sgByCat = {}; CATS.forEach(function(c){ sgByCat[c] = {sum:0, n:0}; });
    var sgByClub = {};
    var sgTotal = 0, sgN = 0;

    shots.forEach(function (s) {
      var sg = s.sg != null ? s.sg : calcSG(s);
      if (sg == null) return;
      sgTotal += sg; sgN++;
      var cat = sgCategory(s);
      sgByCat[cat].sum += sg; sgByCat[cat].n++;
      var club = s.club || '(no club)';
      if (!sgByClub[club]) sgByClub[club] = {sum:0, n:0};
      sgByClub[club].sum += sg; sgByClub[club].n++;
    });

    var sgCards = CATS.map(function (cat) {
      var d = sgByCat[cat];
      if (d.n === 0) return sgCard(cat, null, 0);
      return sgCard(cat, d.sum / d.n, d.n);
    }).join('');

    var sgClubRows = Object.keys(sgByClub).sort().map(function (club) {
      var d = sgByClub[club];
      var avg = d.sum / d.n;
      return '<tr><td>' + esc(club) + '</td>' +
        '<td>' + fmtSG(avg) + '</td>' +
        '<td style="color:#888">' + d.n + '</td>' +
        '<td>' + fmtSG(d.sum, 2) + '</td></tr>';
    }).join('');

    var sgSummaryCard = '<div class="gt-sg-card" style="border-color:' +
      (sgN > 0 && sgTotal/sgN >= 0 ? '#2a7a2a' : '#c0392b') + '">' +
      '<h4>Total SG (avg / shot)</h4>' +
      '<div class="gt-sg-val">' + (sgN > 0 ? fmtSG(sgTotal/sgN) : '<span class="sg-zero">—</span>') + '</div>' +
      '<div class="gt-sg-sub">' + sgN + ' shot' + (sgN !== 1 ? 's' : '') + ' with end position logged</div></div>';

    var sgSection = sgN === 0
      ? '<div class="gt-info">Strokes Gained requires <strong>End distance</strong> and <strong>End lie</strong> to be filled in when logging shots. Log a few shots with end positions to see SG stats.</div>'
      : '<div class="gt-sg-grid">' + sgSummaryCard + sgCards + '</div>' +
        '<p class="gt-section-title">SG by Club (avg per shot)</p>' +
        '<div class="gt-table-wrap"><table class="gt-sg-table">' +
        '<thead><tr><th>Club</th><th>SG avg</th><th>Shots</th><th>SG total</th></tr></thead>' +
        '<tbody>' + sgClubRows + '</tbody></table></div>' +
        '<p class="gt-info" style="margin-top:0.75rem;">Baseline: scratch golfer reference. Positive = gained strokes vs baseline; negative = lost strokes.</p>';

    var settings = loadSettings();
    var targetHcpSection = buildTargetHcpSection(sgByCat, sgN, settings);

    el.innerHTML =
      '<div class="gt-stats-grid">' +
        stat('Total shots', shots.length, '') +
        stat('Avg distance', avgDist, 'm') +
        stat('Solid strike', pureRate + '%', pure + ' shots') +
        stat('On target', onTargetRate + '%', onTarget + ' shots') +
      '</div>' +
      '<p class="gt-section-title">Strokes Gained vs Scratch</p>' +
      sgSection +
      targetHcpSection +
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

  function sgCard(label, avg, n) {
    var valHtml = avg != null
      ? fmtSG(avg)
      : '<span class="sg-zero">—</span>';
    return '<div class="gt-sg-card"><h4>' + label + '</h4>' +
      '<div class="gt-sg-val">' + valHtml + '</div>' +
      '<div class="gt-sg-sub">' + (n > 0 ? n + ' shot' + (n !== 1 ? 's' : '') : 'no data') + '</div></div>';
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
  }

  // Called when the "Playing at" dropdown changes
  window.gtCourseCtxChange = function () {
    var sel   = document.getElementById('gt-course-ctx');
    var input = document.getElementById('gt-new-course-inline');
    if (sel.value === '__new__') {
      input.style.display = '';
      input.value = '';
      input.focus();
    } else {
      input.style.display = 'none';
      // Sync active round to match the selected course for today
      gtSyncActiveRound();
      gtUpdateRoundCtxLabel();
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
    var cnt = shots.filter(function (s) { return s.roundId === activeRoundId; }).length;
    lbl.textContent = cnt + ' shot' + (cnt !== 1 ? 's' : '') + ' this round';
  }

  // Create a round immediately (used auto on hole-1 save)
  function gtAutoCreateRound(courseId, date) {
    var round = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: date,
      courseId: courseId,
      notes: ''
    };
    rounds.push(round);
    saveRounds(rounds);
    activeRoundId = round.id;
    return round;
  }

  // ─── Courses ─────────────────────────────────────────────────────────────────
  window.gtShowNewCourseForm = function () {
    document.getElementById('gt-new-course-form').classList.add('open');
    document.getElementById('gt-add-course-btn').style.display = 'none';
    document.getElementById('gt-course-name').value = '';
    var defPars = [4,4,3,4,5,4,3,4,4, 4,3,4,5,4,3,4,4,4];
    document.querySelectorAll('#gt-par-front .gt-par-inp').forEach(function (inp, i) { inp.value = defPars[i]; });
    document.querySelectorAll('#gt-par-back .gt-par-inp').forEach(function  (inp, i) { inp.value = defPars[9 + i]; });
  };

  window.gtCancelCourse = function () {
    document.getElementById('gt-new-course-form').classList.remove('open');
    document.getElementById('gt-add-course-btn').style.display = '';
  };

  window.gtSaveCourse = function () {
    var name = document.getElementById('gt-course-name').value.trim();
    if (!name) { gtNotice('Enter a course name.', 'error'); return; }
    var pars = [];
    document.querySelectorAll('#gt-par-front .gt-par-inp').forEach(function (inp) { pars.push(parseInt(inp.value) || 4); });
    document.querySelectorAll('#gt-par-back .gt-par-inp').forEach(function  (inp) { pars.push(parseInt(inp.value) || 4); });
    var c = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name, pars: pars };
    courses.push(c);
    saveCourses(courses);
    gtRenderCoursesList();
    populateCourseCtxDropdown(c.id);
    gtCancelCourse();
    gtNotice('Course saved.', 'success');
  };

  window.gtDeleteCourse = function (id) {
    if (!confirm('Delete this course?')) return;
    courses = courses.filter(function (c) { return c.id !== id; });
    saveCourses(courses);
    gtRenderCoursesList();
    populateCourseCtxDropdown();
  };

  function gtRenderCoursesList() {
    var el = document.getElementById('gt-courses-list');
    if (!el) return;
    if (courses.length === 0) {
      el.innerHTML = '<p style="font-size:0.85rem;color:#888;margin:0 0 0.5rem;">No courses added yet.</p>';
      return;
    }
    el.innerHTML = courses.map(function (c) {
      var totalPar = c.pars.reduce(function (a, b) { return a + b; }, 0);
      return '<div class="gt-course-card">' +
        '<div><strong>' + esc(c.name) + '</strong>' +
        '<span style="font-size:0.8rem;color:#888;margin-left:0.5rem;">Par ' + totalPar + '</span></div>' +
        '<button class="gt-delete-btn" onclick="gtDeleteCourse(\'' + c.id + '\')" title="Delete">✕</button>' +
        '</div>';
    }).join('');
  }

  // ─── Rounds ──────────────────────────────────────────────────────────────────
  window.gtShowRoundsList = function () {
    document.getElementById('gt-rounds-list-view').style.display = '';
    document.getElementById('gt-scorecard-view').style.display = 'none';
  };

  function gtRoundShotCount(roundId) {
    return shots.filter(function (s) { return s.roundId === roundId; }).length;
  }

  function gtRoundScore(round) {
    var rs = shots.filter(function (s) { return s.roundId === round.id; });
    if (rs.length === 0) return null;
    var holesPlayed = {};
    rs.forEach(function (s) { if (s.hole != null) holesPlayed[s.hole] = (holesPlayed[s.hole] || 0) + 1; });
    var totalStrokes = 0;
    Object.keys(holesPlayed).forEach(function (h) { totalStrokes += holesPlayed[h]; });
    var course = round.courseId ? courses.find(function (c) { return c.id === round.courseId; }) : null;
    var holesCount = Object.keys(holesPlayed).length;
    var totalPar = 0;
    if (course) {
      Object.keys(holesPlayed).forEach(function (h) { totalPar += course.pars[parseInt(h) - 1] || 4; });
    } else {
      totalPar = holesCount * 4;
    }
    return { strokes: totalStrokes, par: totalPar, holes: holesCount, diff: totalStrokes - totalPar };
  }

  function gtRenderRoundsList() {
    var el = document.getElementById('gt-rounds-list');
    if (!el) return;
    if (rounds.length === 0) {
      el.innerHTML = '<p class="gt-empty">No rounds yet — log a shot on hole 1 to start one.</p>';
      return;
    }
    var sorted = rounds.slice().sort(function (a, b) { return b.date < a.date ? -1 : 1; });
    el.innerHTML = sorted.map(function (r) {
      var course  = r.courseId ? courses.find(function (c) { return c.id === r.courseId; }) : null;
      var sc      = gtRoundScore(r);
      var isActive = r.id === activeRoundId;
      var diffStr  = '';
      var strokeStr = '—';
      if (sc) {
        strokeStr = sc.strokes;
        var sign = sc.diff >= 0 ? '+' : '';
        var diffColor = sc.diff < 0 ? '#2a7a2a' : sc.diff === 0 ? '#555' : '#c0392b';
        diffStr = '<div class="gt-round-score-diff" style="color:' + diffColor + '">' + sign + sc.diff + ' (' + sc.holes + ' holes)</div>';
      }
      var activeBadge = isActive ? ' <span style="font-size:0.72rem;background:#2a7a2a;color:#fff;padding:0.1rem 0.4rem;border-radius:3px;vertical-align:middle;">ACTIVE</span>' : '';
      return '<div class="gt-round-card' + (isActive ? ' active-round' : '') + '">' +
        '<div class="gt-round-card-info">' +
          '<div class="gt-round-card-title">' + r.date + (course ? ' · ' + esc(course.name) : '') + activeBadge + '</div>' +
          '<div class="gt-round-card-sub">' + (r.notes ? esc(r.notes) + ' · ' : '') + gtRoundShotCount(r.id) + ' shots</div>' +
        '</div>' +
        '<div>' +
          '<div class="gt-round-score">' + strokeStr + '</div>' +
          diffStr +
        '</div>' +
        '<div class="gt-round-card-actions">' +
          '<button class="gt-btn gt-btn-outline" style="padding:0.35rem 0.7rem;font-size:0.82rem;" onclick="gtViewScorecard(\'' + r.id + '\')">Scorecard</button>' +
          '<button class="gt-delete-btn" onclick="gtDeleteRound(\'' + r.id + '\')" title="Delete">✕</button>' +
        '</div>' +
        '</div>';
    }).join('');
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
    document.getElementById('gt-rounds-list-view').style.display = 'none';
    document.getElementById('gt-scorecard-view').style.display   = '';
    var title = round.date + (course ? ' — ' + course.name : '') + (round.notes ? ' (' + round.notes + ')' : '');
    document.getElementById('gt-scorecard-title').textContent = title;
    document.getElementById('gt-scorecard-content').innerHTML = buildScorecard(round, course);
  };

  function defaultPars() {
    // Typical par layout: 4,4,3,4,5,4,3,4,4, 4,3,4,5,4,3,4,4,4
    return [4,4,3,4,5,4,3,4,4, 4,3,4,5,4,3,4,4,4];
  }

  function computeHoleStats(holeShots, par) {
    if (!holeShots || holeShots.length === 0) return null;
    var score    = holeShots.length;
    var lastShot = holeShots[holeShots.length - 1];
    var holed    = lastShot.end_lie === 'Holed' || lastShot.end_distance === 0;

    // Putts: shots starting from Green or using Putter
    var putts = holeShots.filter(function (s) {
      return s.lie === 'Green' || s.club === 'Putter';
    }).length;

    // FIR: par 4/5 only — tee shot ends on Fairway
    var fir = null;
    if (par >= 4 && holeShots.length > 0 && holeShots[0].lie === 'Tee') {
      fir = holeShots[0].end_lie === 'Fairway';
    }

    // GIR: reached green in (par - 2) shots or fewer
    var girAllowed = par - 2; // 1 for par3, 2 for par4, 3 for par5
    var gir = false;
    for (var i = 0; i < Math.min(girAllowed, holeShots.length); i++) {
      var s = holeShots[i];
      if (s.end_lie === 'Green' || s.end_lie === 'Holed' || s.end_distance === 0) {
        gir = true; break;
      }
    }

    // Up & Down: missed GIR — find first "around green" shot, did player hole in ≤2?
    var updown   = null;
    var sandSave = null;
    if (!gir) {
      var hadSand = holeShots.some(function (s) { return s.lie === 'Sand'; });
      var atgIdx  = -1;
      for (var i = 0; i < holeShots.length; i++) {
        var s = holeShots[i];
        // Around green: distance ≤30m (not off tee) or sand shot
        if (s.lie !== 'Tee' && (
              (s.distance != null && s.distance <= 30) ||
              s.lie === 'Sand' || s.lie === 'Fringe' || s.lie === 'Green'
            )) {
          atgIdx = i; break;
        }
      }
      if (atgIdx >= 0) {
        if (holed) {
          updown = (holeShots.length - atgIdx) <= 2;
        } else {
          updown = false;
        }
        if (hadSand) sandSave = updown;
      }
    }

    var sg = holeShots.reduce(function (acc, s) {
      var v = s.sg != null ? s.sg : calcSG(s);
      return acc + (v != null ? v : 0);
    }, 0);

    return { score: score, par: par, diff: holed ? score - par : null,
             putts: putts, fir: fir, gir: gir, updown: updown, sandSave: sandSave,
             holed: holed, sg: sg };
  }

  function buildScorecard(round, course) {
    var pars     = course ? course.pars : defaultPars();
    var rs       = shots.filter(function (s) { return s.roundId === round.id; });
    var holeData = [];

    for (var h = 1; h <= 18; h++) {
      var hs = rs.filter(function (s) { return s.hole === h; });
      holeData.push(computeHoleStats(hs, pars[h - 1]));
    }

    // Totals
    var totals = { score:0, par:0, putts:0, firOpp:0, firHit:0, girOpp:18, girHit:0,
                   udOpp:0, udHit:0, ssOpp:0, ssHit:0, sg:0 };
    holeData.forEach(function (hd, i) {
      totals.par += pars[i];
      if (!hd) return;
      if (hd.holed) totals.score += hd.score;
      totals.putts += hd.putts;
      if (hd.fir !== null) { totals.firOpp++; if (hd.fir) totals.firHit++; }
      if (hd.gir) totals.girHit++;
      if (hd.updown !== null) { totals.udOpp++; if (hd.updown) totals.udHit++; }
      if (hd.sandSave !== null) { totals.ssOpp++; if (hd.sandSave) totals.ssHit++; }
      totals.sg += hd.sg;
    });

    function scoreClass(diff) {
      if (diff == null) return '';
      if (diff <= -2) return 'sc-eagle';
      if (diff === -1) return 'sc-birdie';
      if (diff === 0)  return 'sc-par';
      if (diff === 1)  return 'sc-bogey';
      if (diff === 2)  return 'sc-double';
      return 'sc-triple';
    }

    function ynCell(val) {
      if (val === null || val === undefined) return '<td class="sc-na">—</td>';
      return val ? '<td class="sc-yes">✓</td>' : '<td class="sc-no">✗</td>';
    }

    function hdrRow(from, to) {
      var cells = '';
      for (var i = from; i <= to; i++) cells += '<th>' + i + '</th>';
      return cells;
    }

    function buildHalf(from, to) {
      var parRow = '<tr class="sc-par-row"><td class="sc-hole-label">Par</td>';
      var scoreRow = '<tr><td class="sc-hole-label">Score</td>';
      var diffRow = '<tr><td class="sc-hole-label">+/−</td>';
      var puttsRow = '<tr><td class="sc-hole-label">Putts</td>';
      var firRow = '<tr><td class="sc-hole-label">FIR</td>';
      var girRow = '<tr><td class="sc-hole-label">GIR</td>';
      var udRow = '<tr><td class="sc-hole-label">Up&amp;Down</td>';
      var ssRow = '<tr><td class="sc-hole-label">Sand Save</td>';
      var subPar = 0, subScore = 0;

      for (var h = from; h <= to; h++) {
        var hd = holeData[h - 1];
        var par = pars[h - 1];
        parRow += '<td>' + par + '</td>';
        subPar += par;
        if (!hd) {
          scoreRow += '<td class="sc-na">—</td>';
          diffRow  += '<td class="sc-na">—</td>';
          puttsRow += '<td class="sc-na">—</td>';
          firRow   += (par >= 4 ? '<td class="sc-na">—</td>' : '<td class="sc-na">—</td>');
          girRow   += '<td class="sc-na">—</td>';
          udRow    += '<td class="sc-na">—</td>';
          ssRow    += '<td class="sc-na">—</td>';
        } else {
          subScore += hd.holed ? hd.score : 0;
          var cls = scoreClass(hd.diff);
          scoreRow += '<td class="' + cls + '">' + (hd.holed ? hd.score : '—') + '</td>';
          var dStr = hd.diff != null ? (hd.diff > 0 ? '+' + hd.diff : hd.diff === 0 ? 'E' : hd.diff) : '—';
          diffRow  += '<td class="' + cls + '">' + dStr + '</td>';
          puttsRow += '<td>' + hd.putts + '</td>';
          firRow   += (par >= 4 ? ynCell(hd.fir) : '<td class="sc-na">—</td>');
          girRow   += ynCell(hd.gir);
          udRow    += ynCell(hd.updown);
          ssRow    += ynCell(hd.sandSave);
        }
      }
      // Sub totals
      parRow   += '<td class="sc-total">' + subPar + '</td></tr>';
      scoreRow += '<td class="sc-total">' + (subScore || '—') + '</td></tr>';
      var subDiff = subScore - subPar;
      var sd = subScore ? (subDiff > 0 ? '+' + subDiff : subDiff === 0 ? 'E' : subDiff) : '—';
      diffRow  += '<td class="sc-total">' + sd + '</td></tr>';
      puttsRow += '<td class="sc-total">' + '</td></tr>';
      firRow   += '<td class="sc-total"></td></tr>';
      girRow   += '<td class="sc-total"></td></tr>';
      udRow    += '<td class="sc-total"></td></tr>';
      ssRow    += '<td class="sc-total"></td></tr>';

      return '<thead><tr><th></th>' + hdrRow(from, to) + '<th>Sub</th></tr></thead>' +
             '<tbody>' + parRow + scoreRow + diffRow + puttsRow + firRow + girRow + udRow + ssRow + '</tbody>';
    }

    var totalDiff = totals.score ? totals.score - totals.par : null;
    var totalDiffStr = totalDiff != null ? (totalDiff > 0 ? '+' + totalDiff : totalDiff === 0 ? 'E' : totalDiff) : '—';

    var summaryCards = [
      { label: 'Score', val: totals.score ? totals.score + ' (' + totalDiffStr + ')' : '—', color: totalDiff != null && totalDiff < 0 ? '#2a7a2a' : '#c0392b' },
      { label: 'Putts', val: totals.putts || '—', color: '#333' },
      { label: 'FIR', val: totals.firOpp ? totals.firHit + '/' + totals.firOpp + ' (' + Math.round(totals.firHit / totals.firOpp * 100) + '%)' : '—', color: '#333' },
      { label: 'GIR', val: totals.girHit + '/18 (' + Math.round(totals.girHit / 18 * 100) + '%)', color: '#333' },
      { label: 'Up & Down', val: totals.udOpp ? totals.udHit + '/' + totals.udOpp + ' (' + Math.round(totals.udHit / totals.udOpp * 100) + '%)' : '—', color: '#333' },
      { label: 'Sand Saves', val: totals.ssOpp ? totals.ssHit + '/' + totals.ssOpp + ' (' + Math.round(totals.ssHit / totals.ssOpp * 100) + '%)' : '—', color: '#333' },
    ].map(function (c) {
      return '<div class="gt-sc-stat"><div class="gt-sc-stat-val" style="color:' + c.color + '">' + c.val + '</div>' +
             '<div class="gt-sc-stat-label">' + c.label + '</div></div>';
    }).join('');

    return '<div class="gt-scorecard-summary">' + summaryCards + '</div>' +
      '<p class="gt-section-title" style="margin-top:1.25rem;">Front 9</p>' +
      '<div class="gt-scorecard-wrap"><table class="gt-scorecard">' + buildHalf(1, 9) + '</table></div>' +
      '<p class="gt-section-title" style="margin-top:1rem;">Back 9</p>' +
      '<div class="gt-scorecard-wrap"><table class="gt-scorecard">' + buildHalf(10, 18) + '</table></div>' +
      (totals.sg !== 0
        ? '<p class="gt-info" style="margin-top:0.75rem;">Round SG: ' + fmtSG(totals.sg, 2) + '</p>'
        : '');
  }

  // ─── SG vs Target HCP ────────────────────────────────────────────────────────
  // Distribution of HCP strokes across categories (Broadie research)
  var SG_HCP_WEIGHTS = {
    'Off the Tee':      0.22,
    'Approach':         0.35,
    'Around the Green': 0.22,
    'Putting':          0.21
  };
  // Reference shot counts per category per round (used to convert per-round → per-shot)
  var SG_HCP_REF_SHOTS = {
    'Off the Tee':      14,
    'Approach':         14,
    'Around the Green':  5,
    'Putting':          32
  };

  function sgTargetPerShot(hcp, category) {
    if (hcp == null) return null;
    return -(hcp * SG_HCP_WEIGHTS[category]) / SG_HCP_REF_SHOTS[category];
  }

  function buildTargetHcpSection(sgByCat, sgN, settings) {
    var targetHcp = settings.targetHcp;
    var currentHcp = settings.hcp;
    if (targetHcp == null) {
      return '<div class="gt-info">Set a <strong>Target HCP</strong> in Settings to see where you need to improve to reach your goal.</div>';
    }
    if (sgN === 0) {
      return '<div class="gt-info">Log shots with end positions to see your SG vs target HCP comparison.</div>';
    }

    var CATS = ['Off the Tee', 'Approach', 'Around the Green', 'Putting'];
    var gapData = CATS.map(function (cat) {
      var d = sgByCat[cat];
      if (d.n === 0) return { cat: cat, current: null, target: sgTargetPerShot(targetHcp, cat), baseline: sgTargetPerShot(currentHcp, cat), gap: null };
      var current = d.sum / d.n;
      var target  = sgTargetPerShot(targetHcp, cat);
      var gap = current - target; // positive = ahead of target, negative = needs work
      var gapPerRound = gap * SG_HCP_REF_SHOTS[cat];
      return { cat: cat, current: current, target: target, baseline: sgTargetPerShot(currentHcp, cat),
               gap: gap, gapPerRound: gapPerRound, n: d.n };
    });

    // Sort by gap ascending (most behind first) for priority badges
    var ranked = gapData.filter(function (g) { return g.gap != null; })
                        .slice().sort(function (a, b) { return a.gap - b.gap; });

    var priorityMap = {};
    ranked.forEach(function (g, i) {
      if (g.gap < -0.05)      priorityMap[g.cat] = i + 1; // 1 = worst
      else                     priorityMap[g.cat] = 0;     // 0 = on track
    });

    var cards = CATS.map(function (cat) {
      var g = gapData.find(function (x) { return x.cat === cat; });
      if (!g) return '';

      // Build gauge: range from worst HCP 36 benchmark to scratch (0)
      var worstTarget = sgTargetPerShot(36, cat);  // most negative end
      var range = 0 - worstTarget; // total range of the bar
      var currentPct = g.current != null ? Math.max(0, Math.min(100, ((g.current - worstTarget) / range) * 100)) : null;
      var targetPct  = g.target  != null ? Math.max(0, Math.min(100, ((g.target  - worstTarget) / range) * 100)) : 50;

      var barColor = g.gap == null ? '#ccc' : g.gap >= -0.01 ? '#2a7a2a' : g.gap > -0.05 ? '#f39c12' : '#c0392b';

      var currentLabel = g.current != null ? (g.current >= 0 ? '+' : '') + g.current.toFixed(3) + ' / shot' : '—';
      var targetLabel  = g.target  != null ? (g.target >= 0 ? '+' : '')  + g.target.toFixed(3)  + ' / shot' : '—';

      var gapHtml = '';
      if (g.gap != null) {
        var gprSign = g.gapPerRound >= 0 ? '+' : '';
        if (g.gap >= -0.01) {
          gapHtml = '<div class="gt-hcp-gap gap-ahead">On track (' + gprSign + g.gapPerRound.toFixed(1) + ' / round)</div>';
        } else {
          var pr = Math.abs(g.gapPerRound).toFixed(1);
          gapHtml = '<div class="gt-hcp-gap gap-behind">Need +' + pr + ' strokes/round</div>';
        }
      }

      var pr = priorityMap[cat];
      var badgeHtml = '';
      if (pr === 0) {
        badgeHtml = '<span class="gt-priority-badge priority-ok">On track</span>';
      } else if (pr === 1) {
        badgeHtml = '<span class="gt-priority-badge priority-1">#1 Priority</span>';
      } else if (pr === 2) {
        badgeHtml = '<span class="gt-priority-badge priority-2">#2 Priority</span>';
      } else if (pr === 3) {
        badgeHtml = '<span class="gt-priority-badge priority-3">#3 Priority</span>';
      }

      return '<div class="gt-hcp-card">' +
        '<h4>' + cat + '</h4>' +
        '<div class="gt-hcp-card-vals">' +
          '<div class="gt-hcp-current" style="color:' + barColor + '">' + currentLabel + '</div>' +
          '<div class="gt-hcp-target-val">Target: ' + targetLabel + '</div>' +
        '</div>' +
        '<div class="gt-hcp-bar-wrap">' +
          (currentPct != null ? '<div class="gt-hcp-bar-fill" style="width:' + currentPct + '%;background:' + barColor + '"></div>' : '') +
          '<div class="gt-hcp-bar-marker" style="left:' + targetPct + '%"></div>' +
        '</div>' +
        gapHtml +
        badgeHtml +
      '</div>';
    }).join('');

    var heading = 'SG vs Target HCP ' + targetHcp +
      (currentHcp != null ? ' (current: ' + currentHcp + ')' : '');
    var note = 'Bar shows your current SG/shot (colored) vs the target HCP benchmark (▌). ' +
      'Positive SG means ahead of baseline; negative means strokes lost vs scratch. ' +
      'Gap shown as strokes per round using reference shot counts.';

    return '<p class="gt-section-title">' + heading + '</p>' +
      '<div class="gt-hcp-compare-grid">' + cards + '</div>' +
      '<p class="gt-info">' + note + '</p>';
  }

})();
</script>
