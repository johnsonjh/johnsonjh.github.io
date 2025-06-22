function wrapFirstChar(paragraphs) {
    for (const p of paragraphs) {
        const nodes = Array.from(p.childNodes);

        for (const node of nodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trimStart();

                if (text.length === 0) continue;

                const index = node.textContent.indexOf(text[0]);
                const before = node.textContent.slice(0, index);
                const rest = node.textContent.slice(index + 1);

                const span = document.createElement("span");
                span.classList.add("dropcap");
                span.textContent = text[0];

                const frag = document.createDocumentFragment();

                if (before) frag.appendChild(document.createTextNode(before));

                frag.appendChild(span);

                if (rest) frag.appendChild(document.createTextNode(rest));

                p.replaceChild(frag, node);
                break;
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    await document.fonts.ready;
    const paragraphs = document.querySelectorAll("p, blockquote");
    wrapFirstChar(paragraphs);

    function wrapChars(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const frag = document.createDocumentFragment();

            for (let i = 0; i < text.length; i++) {
                const span = document.createElement("span");
                span.classList.add("char");
                span.textContent = text[i];

                if (text[i] === "s" || text[i] === "J") {
                    span.classList.add("pending-transform");
                }

                frag.appendChild(span);
            }
            node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "SCRIPT" && node.nodeName !== "STYLE") {
            Array.from(node.childNodes).forEach((child) => wrapChars(child));
        }
    }

    wrapChars(document.body);

    document.body.style.visibility = "visible";

    async function animateParagraphs(paragraphs, sConversionDelay = 40) {
        for (const p of paragraphs) {
            const charSpans = p.querySelectorAll(".char");

            for (const span of charSpans) {
                span.classList.add("visible");

                if (span.classList.contains("pending-transform")) {
                    await new Promise((resolve) => setTimeout(resolve, sConversionDelay));
                    span.classList.remove("pending-transform");
                    span.classList.add("transformed");
                }
            }
        }
    }

    await animateParagraphs(paragraphs);

    const lastPara = document.querySelector("p:last-of-type");
    if (lastPara) {
        const shim = document.createElement("span");
        shim.textContent = "\u00A0.";
        shim.style.whiteSpace = "nowrap";
        shim.style.display = "inline";
        shim.style.opacity = "0";
        shim.style.fontSize = "0.01px";
        shim.setAttribute("aria-hidden", "true");
        lastPara.appendChild(shim);
    }
});

function setTheme(dark) {
    document.documentElement.classList.toggle("dark-mode", dark);
    document.getElementById("theme-toggle").textContent = dark ? "☼" : "●";
}

function getStoredTheme() {
    return localStorage.getItem("theme");
}

function storeTheme(theme) {
    localStorage.setItem("theme", theme);
}

(function () {
    const stored = getStoredTheme();
    let dark = false;

    if (stored === "dark") dark = true;
    else if (stored === "light") dark = false;
    else dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    setTheme(dark);
})();

document.getElementById("theme-toggle").onclick = function () {
    const dark = !document.documentElement.classList.contains("dark-mode");
    setTheme(dark);
    storeTheme(dark ? "dark" : "light");
};

window.addEventListener("DOMContentLoaded", function () {
    document.documentElement.classList.remove("notransition");
});
