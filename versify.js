(function () {
  const debounceDelay = 50;
  const reentryDelay = 25;
  const bboxRetryDelay = 35;

  let resizeTextObject;
  let isProcessing = false;

  function versify(el) {
    if (isProcessing) {
      setTimeout(() => versify(el), reentryDelay);
      return;
    }

    isProcessing = true;
    try {
      const rawText = el.dataset.raw || el.textContent;

      if (!el.dataset.raw) {
        el.dataset.raw = rawText;
      }

      const tempTextNode = document.createTextNode(rawText);
      el.innerHTML = "";
      el.appendChild(tempTextNode);

      const range = document.createRange();
      const lineH = parseFloat(getComputedStyle(el).lineHeight);
      const threshold = lineH * 0.8;
      const DPR = window.devicePixelRatio || 1;

      if (!lineH || isNaN(lineH) || lineH < 1) {
        setTimeout(() => versify(el), bboxRetryDelay);
        return;
      }

      let prevTop = null;
      const breaks = [0];

      for (let i = 0; i < rawText.length; i++) {
        range.setStart(tempTextNode, i);
        range.setEnd(tempTextNode, i + 1);

        const rect = range.getBoundingClientRect();

        if (!rect.height || rect.height === 0) {
          setTimeout(() => versify(el), bboxRetryDelay);
          return;
        }

        const top = Math.round(rect.top * DPR) / DPR;

        if (prevTop === null) {
          prevTop = top;
        } else if (top - prevTop > threshold) {
          breaks.push(i);
          prevTop = top;
        }
      }

      breaks.push(rawText.length);
      el.innerHTML = "";

      for (let j = 0; j < breaks.length - 1; j++) {
        const span = document.createElement("span");
        span.className = "vline";

        const from = breaks[j],
          to = breaks[j + 1];

        const segment = rawText.slice(from, to);

        if (j === breaks.length - 2 && !/[“"”]\s*$/.test(segment)) {
          const match = segment.match(/(.*?)(\s*)$/);
          const core = match ? match[1] : segment;
          const spaces = match ? match[2] : "";

          span.textContent = core;
          const quote = document.createElement("span");
          quote.className = "closer";
          quote.textContent = "”";
          span.appendChild(quote);
          span.appendChild(document.createTextNode(spaces));
        } else {
          span.textContent = segment;
        }

        el.appendChild(span);
      }
    } finally {
      isProcessing = false;
    }
  }

  function processAllVerses() {
    document.querySelectorAll("blockquote.verse").forEach((el) => versify(el));
  }

  function redraw() {
    clearTimeout(resizeTextObject);
    resizeTextObject = setTimeout(processAllVerses, debounceDelay);
  }

  window.addEventListener("load", processAllVerses);
  window.addEventListener("resize", redraw);
  window.addEventListener("orientationchange", redraw);

  let lastScale = window.visualViewport?.scale || 1;

  setInterval(() => {
    const currentScale = window.visualViewport?.scale || 1;

    if (Math.abs(currentScale - lastScale) > 0.001) {
      lastScale = currentScale;
      redraw();
    }
  }, 50);
})();
