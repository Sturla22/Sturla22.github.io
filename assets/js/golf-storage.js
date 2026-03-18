(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./golf-core.js'));
  } else {
    root.GolfTrackerStorage = factory(root.GolfTrackerCore);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core) {
  'use strict';

  if (!core) throw new Error('GolfTrackerCore is required for GolfTrackerStorage');

  /*
   * Browser-local persistence for the golf tracker. This module owns storage
   * keys, parsing, and normalization so the page controller does not talk to
   * localStorage directly.
   */
  var KEYS = {
    shots: 'gt_shots_v1',
    settings: 'gt_settings_v1',
    rounds: 'gt_rounds_v1',
    courses: 'gt_courses_v1'
  };

  function parseStoredJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeImportId(rawId, index) {
    var base = String(rawId == null ? '' : rawId)
      .trim()
      .replace(/[^A-Za-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (!base) base = 'imported_shot_' + String(index + 1);
    return base;
  }

  function loadShots() {
    var shots = parseStoredJson(KEYS.shots, []);
    return Array.isArray(shots) ? shots : [];
  }

  function saveShots(shots) {
    saveJson(KEYS.shots, Array.isArray(shots) ? shots : []);
  }

  function loadSettings() {
    var raw = parseStoredJson(KEYS.settings, null);
    return core.normalizeSettings(raw);
  }

  function saveSettings(settings) {
    saveJson(KEYS.settings, core.normalizeSettings(settings));
  }

  function loadRounds() {
    var rounds = parseStoredJson(KEYS.rounds, []);
    return Array.isArray(rounds) ? rounds : [];
  }

  function saveRounds(rounds) {
    saveJson(KEYS.rounds, Array.isArray(rounds) ? rounds : []);
  }

  function loadCourses() {
    var courses = parseStoredJson(KEYS.courses, []);
    return Array.isArray(courses) ? courses : [];
  }

  function saveCourses(courses) {
    saveJson(KEYS.courses, Array.isArray(courses) ? courses : []);
  }

  function hasStoredData(snapshot) {
    var settings = snapshot && snapshot.settings ? core.normalizeSettings(snapshot.settings) : loadSettings();
    return (snapshot && snapshot.shots ? snapshot.shots.length : loadShots().length) > 0 ||
      (snapshot && snapshot.rounds ? snapshot.rounds.length : loadRounds().length) > 0 ||
      (snapshot && snapshot.courses ? snapshot.courses.length : loadCourses().length) > 0 ||
      JSON.stringify(settings) !== JSON.stringify(core.defaultSettings());
  }

  return {
    KEYS: KEYS,
    normalizeImportId: normalizeImportId,
    loadShots: loadShots,
    saveShots: saveShots,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    loadRounds: loadRounds,
    saveRounds: saveRounds,
    loadCourses: loadCourses,
    saveCourses: saveCourses,
    hasStoredData: hasStoredData
  };
});
