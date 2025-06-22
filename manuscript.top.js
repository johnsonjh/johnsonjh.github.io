(function () {
    try {
        var theme = localStorage.getItem("theme");
        if (!theme) {
            theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }

        if (theme === "dark") {
            document.documentElement.classList.add("dark-mode");
        }

        document.documentElement.classList.add("notransition");
    } catch (e) {}
})();
