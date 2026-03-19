(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GolfTrackerSelectors = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /*
   * Shared DOM ids/selectors for the golf tracker. This keeps the controller
   * from depending on a large number of hard-coded selector strings.
   */
  var IDS = {
    notice: 'gt-notice',
    date: 'gt-date',
    hole: 'gt-hole',
    par: 'gt-par',
    holeLength: 'gt-hole-length',
    distance: 'gt-distance',
    caddieButton: 'gt-caddie-btn',
    caddieSection: 'gt-caddie-section',
    caddieWindDir: 'gt-caddie-wind-dir',
    caddieWindStrength: 'gt-caddie-wind-strength',
    caddieSlope: 'gt-caddie-slope',
    caddieLieQuality: 'gt-caddie-lie-quality',
    caddiePlaysLike: 'gt-caddie-plays-like',
    caddieContext: 'gt-caddie-context',
    caddieApply: 'gt-caddie-apply',
    puttSection: 'gt-putt-section',
    puttSpeed: 'gt-putt-speed',
    puttSlope: 'gt-putt-slope',
    puttBreak: 'gt-putt-break',
    puttPlaysLike: 'gt-putt-plays-like',
    puttAim: 'gt-putt-aim',
    endDistance: 'gt-end-distance',
    club: 'gt-club',
    swing: 'gt-swing',
    lie: 'gt-lie',
    endLie: 'gt-endLie',
    result: 'gt-result',
    strike: 'gt-strike',
    shape: 'gt-shape',
    notes: 'gt-notes',
    proximity: 'gt-proximity',
    proximityHint: 'gt-proximity-hint',
    moreButton: 'gt-more-btn',
    moreSection: 'gt-more-section',
    shotForm: 'gt-shot-form',
    shotStatus: 'gt-shot-status',
    shotProgressMain: 'gt-shot-progress-main',
    shotProgressCard: 'gt-shot-progress-card',
    clubHint: 'gt-dist-hint',
    historyBody: 'gt-history-body',
    historyCount: 'gt-history-count',
    filterClub: 'gt-filter-club',
    filterResult: 'gt-filter-result',
    filterStrike: 'gt-filter-strike',
    filterSearch: 'gt-filter-search',
    statsContent: 'gt-stats-content',
    statsFrom: 'gt-stats-from',
    statsTo: 'gt-stats-to',
    hcp: 'gt-hcp',
    targetHcp: 'gt-target-hcp',
    hcpIndoor: 'gt-hcp-indoor',
    targetHcpIndoor: 'gt-target-hcp-indoor',
    fixedPutting: 'gt-fixed-putting',
    settingsNotice: 'gt-settings-notice',
    clubDistTable: 'gt-club-dist-table',
    wedgeMatrixTable: 'gt-wedge-matrix-table',
    coursesList: 'gt-courses-list',
    addCourseButton: 'gt-add-course-btn',
    newCourseForm: 'gt-new-course-form',
    editingCourseId: 'gt-editing-course-id',
    saveCourseButton: 'gt-save-course-btn',
    courseName: 'gt-course-name',
    parFront: 'gt-par-front',
    parBack: 'gt-par-back',
    teeRows: 'gt-tee-rows',
    courseContext: 'gt-course-ctx',
    newCourseInline: 'gt-new-course-inline',
    teeContext: 'gt-tee-ctx',
    roundContextLabel: 'gt-round-ctx-label',
    indoorToggle: 'gt-indoor-toggle',
    proximityRow: 'gt-proximity-row',
    roundsListView: 'gt-rounds-list-view',
    roundsList: 'gt-rounds-list',
    scorecardView: 'gt-scorecard-view',
    scorecardTitle: 'gt-scorecard-title',
    scorecardContent: 'gt-scorecard-content',
    importArea: 'gt-import-area',
    bagPills: 'gt-bag-pills'
  };

  var SELECTORS = {
    tabs: '.gt-tabs',
    tabButtons: '.gt-tab[data-gt-tab]',
    panels: '.gt-panel',
    pills: '.gt-pill',
    clubPills: '#gt-club-pills .gt-pill',
    swingPills: '#gt-swing-pills .gt-pill',
    liePills: '#gt-lie-pills .gt-pill',
    endLiePills: '#gt-end-lie-pills .gt-pill',
    strikePills: '#gt-strike-pills .gt-pill',
    shapePills: '#gt-shape-pills .gt-pill',
    bagPillButtons: '#gt-bag-pills .gt-pill',
    statsFilterButtons: '.gt-stats-filter-btn',
    dpadButtons: '.gt-dpad-btn',
    historyDeleteButtons: '[data-gt-action="delete-shot"]',
    coursesActionButtons: '#gt-courses-list [data-gt-action]',
    roundsActionButtons: '#gt-rounds-list [data-gt-action]',
    clubDistanceInputs: '.gt-cdist-inp',
    wedgeDistanceInputs: '.gt-wdist-inp',
    courseFrontPars: '#gt-par-front .gt-par-inp',
    courseBackPars: '#gt-par-back .gt-par-inp',
    teeRows: '#gt-tee-rows .gt-tee-row'
  };

  function byId(name) {
    return document.getElementById(IDS[name] || name);
  }

  function query(name, scope) {
    return (scope || document).querySelector(SELECTORS[name] || name);
  }

  function queryAll(name, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(SELECTORS[name] || name));
  }

  return {
    IDS: IDS,
    SELECTORS: SELECTORS,
    byId: byId,
    query: query,
    queryAll: queryAll
  };
});
