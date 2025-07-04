/*
 * Copyright (c) 2025 Jeffrey H. Johnson
 * SPDX-License-Identifier: MIT
 */

(function () {
  const SCAN_INTERVAL_MS = 500;

  function lineAdjust_getCharacterSpans() {
    return Array.from(document.querySelectorAll("span")).filter(
      (span) =>
        span.textContent.length === 1 &&
        span.offsetParent !== null &&
        span.getBoundingClientRect().width > 0,
    );
  }

  function lineAdjust_groupByLine(spans) {
    const lines = [];
    let currentLine = [];

    for (const span of spans) {
      const rect = span.getBoundingClientRect();
      if (!rect || rect.height === 0) continue;

      if (
        currentLine.length > 0 &&
        Math.abs(rect.top - currentLine[0].rect.top) > 1
      ) {
        lines.push(currentLine);
        currentLine = [];
      }

      currentLine.push({ span, rect });
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  function lineAdjust_restoreHiddenWhitespace() {
    const hidden = document.querySelectorAll('span[data-trimmable="true"]');
    hidden.forEach((span) => {
      span.style.display = "";
      span.removeAttribute("data-trimmable");
    });
  }

  function lineAdjust_trimTrailingWhitespace() {
    const spans = lineAdjust_getCharacterSpans();
    const lines = lineAdjust_groupByLine(spans);
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1] || [];

      if (line.length === 0) continue;

      const last = line[line.length - 1];
      const secondLast = line[line.length - 2];

      if (
        last &&
        /^\s$/.test(last.span.textContent) &&
        (!secondLast || !/^\s$/.test(secondLast.span.textContent)) &&
        (nextLine.length === 0 || nextLine[0].rect.top > last.rect.top)
      ) {
        last.span.style.display = "none";
        last.span.dataset.trimmable = "true";
        modified = true;
      }
    }

    return modified;
  }

  function lineAdjust_runTrim() {
    lineAdjust_restoreHiddenWhitespace();
    lineAdjust_trimTrailingWhitespace();
  }

  function lineAdjust_startLoop() {
    setInterval(lineAdjust_runTrim, SCAN_INTERVAL_MS);
    window.addEventListener("resize", lineAdjust_runTrim);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", lineAdjust_startLoop);
  } else {
    lineAdjust_startLoop();
  }
})();
