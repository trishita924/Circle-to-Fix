/**
 * Circle to Fix — Local Storage Module
 * Stores recent bug reports locally in browser localStorage.
 */
(function (global) {
  'use strict';

  const KEY = 'circle_to_fix_reports_v1';
  const MAX_REPORTS = 12;

  function getReports() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveReport(report) {
    const reports = getReports();
    const item = Object.assign({
      id: 'rep-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString()
    }, report);

    reports.unshift(item);
    const trimmed = reports.slice(0, MAX_REPORTS);
    try {
      localStorage.setItem(KEY, JSON.stringify(trimmed));
    } catch (e) {
      // If quota exceeded due to large thumbnail, retry without thumbnail
      item.thumbnailUrl = '';
      localStorage.setItem(KEY, JSON.stringify(trimmed.slice(0, 6)));
    }
    return item;
  }

  function deleteReport(id) {
    const updated = getReports().filter((r) => r.id !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  }

  function clearAllReports() {
    localStorage.setItem(KEY, JSON.stringify([]));
  }

  global.CircleToFixStorage = {
    getReports,
    saveReport,
    deleteReport,
    clearAllReports
  };
})(window);
