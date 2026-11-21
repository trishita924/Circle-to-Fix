/**
 * Circle to Fix — Interactive HTML5 Canvas Annotation Engine
 * Supports Circle, Rectangle, Arrow, Freehand Pen, and Text Label tools.
 */
(function (global) {
  'use strict';

  function createCanvasStudio(canvas, onAnnotationsChanged) {
    const ctx = canvas.getContext('2d');

    let baseImage = null;
    let annotations = []; // { type, color, lineWidth, startX, startY, endX, endY, points?, text? }
    let activeShape = null;
    let isDrawing = false;

    let currentTool = 'circle';
    let currentColor = '#EF4444';
    let currentWidth = 5;

    function setTool(tool) { currentTool = tool; }
    function setColor(color) { currentColor = color; }
    function setLineWidth(w) { currentWidth = Number(w) || 5; }
    function getAnnotations() { return annotations.slice(); }
    function hasImage() { return Boolean(baseImage); }

    function notifyChange() {
      if (onAnnotationsChanged) onAnnotationsChanged(annotations);
    }

    function loadImageFromSrc(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          baseImage = img;
          annotations = [];
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          redraw();
          notifyChange();
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    }

    /**
     * Generates a realistic broken-UI sample screenshot so users can test immediately.
     */
    function loadSampleScreenshot() {
      const off = document.createElement('canvas');
      off.width = 900;
      off.height = 560;
      const c = off.getContext('2d');

      c.fillStyle = '#0F172A';
      c.fillRect(0, 0, 900, 560);

      // Navbar
      c.fillStyle = '#1E293B';
      c.fillRect(0, 0, 900, 56);
      c.fillStyle = '#F8FAFC';
      c.font = '700 18px sans-serif';
      c.fillText('Acme Store — Checkout', 28, 34);

      // Card with overflowing button bug
      c.fillStyle = '#1E293B';
      c.strokeStyle = '#334155';
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(220, 120, 420, 290, 14);
      c.fill();
      c.stroke();

      c.fillStyle = '#F8FAFC';
      c.font = '700 20px sans-serif';
      c.fillText('Order Summary', 250, 165);

      c.fillStyle = '#94A3B8';
      c.font = '400 15px sans-serif';
      c.fillText('Pro Plan (Annual) — ₹1,999.00', 250, 205);
      c.fillText('Tax (18% GST) — ₹359.82', 250, 235);

      c.fillStyle = '#E2E8F0';
      c.font = '700 17px sans-serif';
      c.fillText('Total: ₹2,358.82', 250, 285);

      // Deliberate misalignment / overflow bug on the button!
      c.fillStyle = '#6366F1';
      c.beginPath();
      c.roundRect(530, 345, 220, 44, 8);
      c.fill();
      c.fillStyle = '#FFFFFF';
      c.font = '700 15px sans-serif';
      c.fillText('Complete Purchase →', 555, 373);

      return loadImageFromSrc(off.toDataURL('image/png'));
    }

    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    function drawArrow(c, x1, y1, x2, y2, width) {
      const headLen = Math.max(14, width * 3.5);
      const angle = Math.atan2(y2 - y1, x2 - x1);

      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.stroke();

      c.beginPath();
      c.moveTo(x2, y2);
      c.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
      c.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
      c.closePath();
      c.fillStyle = c.strokeStyle;
      c.fill();
    }

    function drawShape(c, shape) {
      c.save();
      c.strokeStyle = shape.color;
      c.fillStyle = shape.color;
      c.lineWidth = shape.lineWidth;
      c.lineCap = 'round';
      c.lineJoin = 'round';

      if (shape.type === 'circle') {
        const cx = (shape.startX + shape.endX) / 2;
        const cy = (shape.startY + shape.endY) / 2;
        const rx = Math.max(4, Math.abs(shape.endX - shape.startX) / 2);
        const ry = Math.max(4, Math.abs(shape.endY - shape.startY) / 2);
        c.beginPath();
        c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        c.stroke();
      } else if (shape.type === 'rect') {
        const x = Math.min(shape.startX, shape.endX);
        const y = Math.min(shape.startY, shape.endY);
        const w = Math.abs(shape.endX - shape.startX);
        const h = Math.abs(shape.endY - shape.startY);
        c.strokeRect(x, y, w, h);
      } else if (shape.type === 'arrow') {
        drawArrow(c, shape.startX, shape.startY, shape.endX, shape.endY, shape.lineWidth);
      } else if (shape.type === 'pen' && shape.points && shape.points.length > 1) {
        c.beginPath();
        c.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          c.lineTo(shape.points[i].x, shape.points[i].y);
        }
        c.stroke();
      } else if (shape.type === 'text' && shape.text) {
        const fontSize = Math.max(18, shape.lineWidth * 4.5);
        c.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        const metrics = c.measureText(shape.text);
        const pad = 6;
        c.fillStyle = 'rgba(11, 15, 25, 0.85)';
        c.fillRect(shape.startX - pad, shape.startY - fontSize, metrics.width + pad * 2, fontSize + pad * 1.5);
        c.fillStyle = shape.color;
        c.fillText(shape.text, shape.startX, shape.startY);
      }

      c.restore();
    }

    function redraw() {
      if (!baseImage) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      annotations.forEach((s) => drawShape(ctx, s));
      if (activeShape) drawShape(ctx, activeShape);
    }

    function undo() {
      if (annotations.length === 0) return;
      annotations.pop();
      redraw();
      notifyChange();
    }

    function clearAnnotations() {
      annotations = [];
      redraw();
      notifyChange();
    }

    function exportPngBlob() {
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    }

    function exportThumbnailDataUrl() {
      if (!baseImage) return '';
      const thumb = document.createElement('canvas');
      const maxW = 400;
      const scale = Math.min(1, maxW / canvas.width);
      thumb.width = Math.round(canvas.width * scale);
      thumb.height = Math.round(canvas.height * scale);
      thumb.getContext('2d').drawImage(canvas, 0, 0, thumb.width, thumb.height);
      return thumb.toDataURL('image/jpeg', 0.78);
    }

    // Pointer Events
    canvas.addEventListener('pointerdown', (e) => {
      if (!baseImage) return;
      const pt = getCanvasCoords(e);

      if (currentTool === 'text') {
        const label = prompt('Enter short annotation label:');
        if (label && label.trim()) {
          annotations.push({
            type: 'text',
            color: currentColor,
            lineWidth: currentWidth,
            startX: pt.x,
            startY: pt.y,
            text: label.trim()
          });
          redraw();
          notifyChange();
        }
        return;
      }

      isDrawing = true;
      canvas.setPointerCapture(e.pointerId);
      activeShape = {
        type: currentTool,
        color: currentColor,
        lineWidth: currentWidth,
        startX: pt.x,
        startY: pt.y,
        endX: pt.x,
        endY: pt.y,
        points: currentTool === 'pen' ? [{ x: pt.x, y: pt.y }] : undefined
      };
      redraw();
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!isDrawing || !activeShape) return;
      const pt = getCanvasCoords(e);
      if (activeShape.type === 'pen') {
        activeShape.points.push({ x: pt.x, y: pt.y });
      } else {
        activeShape.endX = pt.x;
        activeShape.endY = pt.y;
      }
      redraw();
    });

    const finishStroke = () => {
      if (!isDrawing || !activeShape) return;
      isDrawing = false;
      const dx = Math.abs((activeShape.endX || 0) - activeShape.startX);
      const dy = Math.abs((activeShape.endY || 0) - activeShape.startY);
      const validPen = activeShape.type === 'pen' && activeShape.points.length > 2;
      if (validPen || dx > 5 || dy > 5) {
        annotations.push(activeShape);
        notifyChange();
      }
      activeShape = null;
      redraw();
    };

    canvas.addEventListener('pointerup', finishStroke);
    canvas.addEventListener('pointercancel', finishStroke);

    return {
      setTool,
      setColor,
      setLineWidth,
      getAnnotations,
      hasImage,
      loadImageFromSrc,
      loadSampleScreenshot,
      undo,
      clearAnnotations,
      exportPngBlob,
      exportThumbnailDataUrl
    };
  }

  global.CircleToFixCanvas = { createCanvasStudio };
})(window);
