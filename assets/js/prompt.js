/**
 * Circle to Fix — AI Bug-Fixing Prompt Generator
 * Formats annotated UI bug context into a clean, structured prompt
 * for Gemini, Claude, or ChatGPT.
 */
(function (global) {
  'use strict';

  function summarizeAnnotations(annotations) {
    if (!Array.isArray(annotations) || annotations.length === 0) {
      return 'No visual markings drawn on the screenshot.';
    }
    const counts = {};
    annotations.forEach((a) => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    const parts = Object.entries(counts).map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`);
    return `${annotations.length} visual annotation(s) drawn on the attached screenshot: ${parts.join(', ')}.`;
  }

  function buildPrompt({ category, targetAi, description, code, annotations }) {
    const lines = [
      `# UI Bug Fix Request (${category || 'UI Bug'})`,
      '',
      `**Target Assistant:** ${targetAi || 'AI Coding Agent'}`,
      `**Visual Reference:** ${summarizeAnnotations(annotations)}`,
      '',
      '## Problem Description',
      (description || '').trim(),
      ''
    ];

    const cleanCode = (code || '').trim();
    if (cleanCode) {
      lines.push('## Relevant HTML / CSS Code', '```html', cleanCode, '```', '');
    }

    lines.push(
      '## Instructions',
      '1. Inspect the highlighted/circled area in the attached annotated screenshot.',
      '2. Identify the root cause in layout, CSS, or markup.',
      '3. Provide a clean, minimal code fix and briefly explain why the fix resolves the issue.'
    );

    return lines.join('\n');
  }

  global.CircleToFixPrompt = {
    summarizeAnnotations,
    buildPrompt
  };
})(window);
