function debounce(fn, ms = 100) {
  let tid;

  return (...args) => {
    clearTimeout(tid);
    tid = setTimeout(() => fn(...args), ms);
  };
}

function findColumnContainer(el) {
  let cur = el.parentElement;

  while (cur && cur !== document.body) {
    if (parseInt(getComputedStyle(cur).columnCount, 10) > 1) {
      return cur;
    }

    cur = cur.parentElement;
  }

  return document.body;
}

function layOutGutterQuotes() {
  document.querySelectorAll("blockquote.styled-quote").forEach((block) => {
    const container = findColumnContainer(block);
    const cols = parseInt(getComputedStyle(container).columnCount, 10) || 1;
    let align = "left";

    if (cols > 1) {
      const c = container.getBoundingClientRect();
      const b = block.getBoundingClientRect();
      const mid = c.left + c.width / 2;
      align = b.left + b.width / 2 < mid ? "left" : "right";
    }

    block.setAttribute("data-align", align);

    const span = block.querySelector(".quote-original");

    if (!span) return;
    if (!span.dataset.orig) span.dataset.orig = span.textContent.trim();

    const raw = span.dataset.orig;
    span.textContent = align === "left" ? raw + "”" : "“" + raw;

    block.querySelectorAll(".quote-mark").forEach((el) => el.remove());
    void block.offsetHeight;

    const st = getComputedStyle(block);
    const lh = parseFloat(st.lineHeight);
    const fs = parseFloat(st.fontSize);
    const shift = (lh - fs) / 2 - 0.9;
    const brect = block.getBoundingClientRect();
    const top0 = brect.top;
    const padT = parseFloat(st.paddingTop);
    const padB = parseFloat(st.paddingBottom);
    const totalH = brect.height - padT - padB;

    const range = document.createRange();
    range.selectNodeContents(span);
    const rects = Array.from(range.getClientRects());

    if (range.detach) range.detach();

    const expected = Math.floor(totalH / lh);

    if (rects.length < expected) {
      const fakeY = top0 + padT + (expected - 1) * lh + shift;
      rects.push({ top: fakeY });
    }

    const seen = new Set();

    rects.forEach((r) => {
      const y = r.top - top0 - shift;

      if (seen.has(y)) return;

      seen.add(y);

      const mark = document.createElement("span");
      mark.className = "quote-mark";
      mark.textContent = align === "left" ? "“" : "”";
      mark.style.top = `${y}px`;
      block.appendChild(mark);
    });
  });
}

function initGutterQuotes() {
  layOutGutterQuotes();

  const ro = new ResizeObserver(debounce(layOutGutterQuotes, 100));
  document
    .querySelectorAll("blockquote.styled-quote")
    .forEach((b) => ro.observe(b));

  if (window.visualViewport) {
    visualViewport.addEventListener(
      "resize",
      debounce(layOutGutterQuotes, 100),
    );
  }

  const lastHeights = new Map();
  document
    .querySelectorAll("blockquote.styled-quote")
    .forEach((b) => lastHeights.set(b, b.getBoundingClientRect().height));

  setInterval(() => {
    let dirty = false;

    lastHeights.forEach((oldH, block) => {
      const h = block.getBoundingClientRect().height;

      if (h !== oldH) {
        lastHeights.set(block, h);
        dirty = true;
      }
    });

    if (dirty) layOutGutterQuotes();
  }, 500);
}

document.addEventListener("DOMContentLoaded", initGutterQuotes);
window.addEventListener("load", initGutterQuotes);
