/**
 * Circle to Fix — Main Application Controller
 * Coordinates Dashboard/Studio views, file upload/drop/paste,
 * annotation toolbar, prompt generation, PNG download, and recent reports.
 */
(function (global) {
  'use strict';

  const Storage = global.CircleToFixStorage;
  const Prompt = global.CircleToFixPrompt;

  let studio = null;

  function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function switchView(viewName) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    document.getElementById('view-' + viewName).classList.add('active');
    if (viewName === 'home') renderRecentReports();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showCanvasStage(hasImg) {
    document.getElementById('upload-dropzone').classList.toggle('hidden', hasImg);
    document.getElementById('annotation-canvas').classList.toggle('hidden', !hasImg);
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderRecentReports() {
    const reports = Storage.getReports();
    const grid = document.getElementById('recent-reports-grid');
    const clearBtn = document.getElementById('btn-clear-reports');
    clearBtn.classList.toggle('hidden', reports.length === 0);

    grid.innerHTML = '';
    if (reports.length === 0) {
      grid.innerHTML = '<div class="card" style="grid-column:1/-1;color:#94A3B8;text-align:center;">No saved bug reports yet. Click <strong>Start Fixing</strong> to annotate your first screenshot.</div>';
      return;
    }

    reports.forEach((rep) => {
      const card = document.createElement('article');
      card.className = 'report-card';
      const dateStr = new Date(rep.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      card.innerHTML = `
        ${rep.thumbnailUrl ? `<img src="${rep.thumbnailUrl}" alt="Annotated bug thumbnail" class="report-thumb" />` : ''}
        <div class="report-body">
          <div class="report-cat">${escapeHTML(rep.category || 'UI Bug')} • ${dateStr}</div>
          <div class="report-desc">${escapeHTML(rep.description || 'No description')}</div>
          <div class="report-actions">
            <button type="button" class="btn btn-outline btn-sm copy-rep-btn">Copy Prompt</button>
            <button type="button" class="btn btn-ghost btn-sm del-rep-btn">Delete</button>
          </div>
        </div>
      `;

      card.querySelector('.copy-rep-btn').addEventListener('click', () => {
        copyText(rep.prompt || '');
        showToast('Saved prompt copied to clipboard!');
      });

      card.querySelector('.del-rep-btn').addEventListener('click', () => {
        if (confirm('Delete this saved bug report?')) {
          Storage.deleteReport(rep.id);
          renderRecentReports();
          showToast('Report deleted.');
        }
      });

      grid.appendChild(card);
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {}
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return true;
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid PNG or JPG image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      await studio.loadImageFromSrc(ev.target.result);
      showCanvasStage(true);
      showToast('Screenshot loaded! Draw over the bug.');
    };
    reader.readAsDataURL(file);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('annotation-canvas');
    studio = global.CircleToFixCanvas.createCanvasStudio(canvas, (anns) => {
      document.getElementById('annotation-count-badge').textContent =
        `${anns.length} annotation${anns.length === 1 ? '' : 's'}`;
    });

    // Navigation
    document.getElementById('nav-brand-home').addEventListener('click', () => switchView('home'));
    document.getElementById('nav-home-btn').addEventListener('click', () => switchView('home'));
    document.getElementById('nav-studio-btn').addEventListener('click', () => switchView('studio'));
    document.getElementById('hero-start-btn').addEventListener('click', () => switchView('studio'));

    const openSampleInStudio = async () => {
      switchView('studio');
      await studio.loadSampleScreenshot();
      showCanvasStage(true);
      showToast('Sample UI bug loaded! Try circling the overflowing button.');
    };
    document.getElementById('hero-sample-btn').addEventListener('click', openSampleInStudio);
    document.getElementById('dropzone-sample-btn').addEventListener('click', openSampleInStudio);

    document.getElementById('btn-clear-reports').addEventListener('click', () => {
      if (confirm('Clear all saved bug reports?')) {
        Storage.clearAllReports();
        renderRecentReports();
        showToast('All reports cleared.');
      }
    });

    // Tool Selection
    document.querySelectorAll('.tool-btn[data-tool]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn[data-tool]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        studio.setTool(btn.dataset.tool);
      });
    });

    document.querySelectorAll('.color-dot[data-color]').forEach((dot) => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot[data-color]').forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
        studio.setColor(dot.dataset.color);
      });
    });

    document.getElementById('stroke-width-select').addEventListener('change', (e) => {
      studio.setLineWidth(e.target.value);
    });

    document.getElementById('btn-undo').addEventListener('click', () => studio.undo());
    document.getElementById('btn-clear-canvas').addEventListener('click', () => studio.clearAnnotations());

    // Upload, Drag & Drop, and Clipboard Paste
    document.getElementById('file-upload-input').addEventListener('change', (e) => {
      if (e.target.files[0]) handleImageFile(e.target.files[0]);
      e.target.value = '';
    });

    const stage = document.getElementById('canvas-stage');
    stage.addEventListener('dragover', (e) => {
      e.preventDefault();
      stage.classList.add('drag-over');
    });
    stage.addEventListener('dragleave', () => stage.classList.remove('drag-over'));
    stage.addEventListener('drop', (e) => {
      e.preventDefault();
      stage.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });

    window.addEventListener('paste', (e) => {
      if (!document.getElementById('view-studio').classList.contains('active')) return;
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          handleImageFile(item.getAsFile());
          break;
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (document.getElementById('view-studio').classList.contains('active') &&
            !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          e.preventDefault();
          studio.undo();
        }
      }
    });

    // Prompt Generation & Export
    document.getElementById('btn-generate-prompt').addEventListener('click', () => {
      const description = document.getElementById('bug-description').value.trim();
      if (!description) {
        showToast('Please enter a brief description of the bug.');
        document.getElementById('bug-description').focus();
        return;
      }

      const promptText = Prompt.buildPrompt({
        category: document.getElementById('bug-category').value,
        targetAi: document.getElementById('target-ai').value,
        description,
        code: document.getElementById('bug-code').value,
        annotations: studio.getAnnotations()
      });

      document.getElementById('generated-prompt').value = promptText;
      showToast('Bug-fixing prompt generated!');
    });

    document.getElementById('btn-copy-prompt').addEventListener('click', async () => {
      const txt = document.getElementById('generated-prompt').value.trim();
      if (!txt) {
        showToast('Generate a prompt first!');
        return;
      }
      await copyText(txt);
      showToast('Prompt copied to clipboard!');
    });

    document.getElementById('btn-download-png').addEventListener('click', async () => {
      if (!studio.hasImage()) {
        showToast('Please upload or load a screenshot first!');
        return;
      }
      const blob = await studio.exportPngBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circle-to-fix-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast('Annotated PNG downloaded!');
    });

    document.getElementById('btn-save-report').addEventListener('click', () => {
      const description = document.getElementById('bug-description').value.trim();
      const promptText = document.getElementById('generated-prompt').value.trim();
      if (!description || !promptText) {
        showToast('Enter a bug description and generate the prompt first.');
        return;
      }
      Storage.saveReport({
        category: document.getElementById('bug-category').value,
        description,
        prompt: promptText,
        thumbnailUrl: studio.exportThumbnailDataUrl()
      });
      showToast('Saved to Recent Bug Reports!');
    });

    renderRecentReports();
  });
})(window);
