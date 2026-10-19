// Draws the chapter picker and the current chapter (picked by the #ch-N hash)
// from chapters.js, then hands the visual area to that chapter's renderer in
// visuals.js.
(function () {
    const $ = (id) => document.getElementById(id);
    const els = {
        picker: $("chapter-picker"),
        eyebrow: $("chapter-eyebrow"),
        title: $("chapter-title"),
        takeaway: $("chapter-takeaway"),
        viz: $("viz"),
        notes: $("chapter-notes"),
        prev: $("chapter-prev"),
        next: $("chapter-next"),
    };

    const byNum = (n) => CHAPTERS.find((c) => c.num === n);
    const shortTitle = (c) => c.shortTitle || c.title;

    // Scenario steps in the patterns walkthrough that cite this chapter.
    function patternLinks(num) {
        if (!window.SCENARIOS) return [];
        const links = [];
        SCENARIOS.forEach((s) => {
            s.steps.forEach((step) => {
                const match = step.book && /Ch\. (\d+)/.exec(step.book.chapter);
                if (match && Number(match[1]) === num) links.push({ scenario: s, step });
            });
        });
        return links;
    }

    function renderPicker() {
        els.picker.innerHTML = Object.entries(BOOK_PARTS).map(([part, label]) => {
            const pills = CHAPTERS.filter((c) => c.part === part).map((c) =>
                `<a class="chapter-pill" href="#ch-${c.num}" data-num="${c.num}" title="${shortTitle(c)}">
                    <span aria-hidden="true">${c.num}</span><span class="visually-hidden">Chapter ${c.num}: ${shortTitle(c)}</span>
                </a>`).join("");
            return `<div class="picker-group"><span class="picker-label">${label}</span><div class="picker-pills">${pills}</div></div>`;
        }).join("");
    }

    function renderNotes(c) {
        const idea = c.idea.map((p) => `<p>${p}</p>`).join("");
        const flags = (c.redFlags || []).length
            ? `<h3>Red flags</h3><ul class="flag-list">${c.redFlags.map((name) => {
                const flag = RED_FLAGS.find((f) => f.name === name);
                return `<li><span class="flag-name">${name}</span>${flag ? `: ${flag.text}` : ""}</li>`;
            }).join("")}</ul>`
            : "";
        const links = patternLinks(c.num);
        const patterns = links.length
            ? `<h3>Where it shows up in the patterns walkthrough</h3><ul class="pattern-links">${links.map(({ scenario, step }) =>
                `<li><a href="../software-patterns/index.html#${scenario.id}">${scenario.title}</a>: ${step.title}</li>`).join("")}</ul>`
            : "";

        els.notes.innerHTML = `
            <h3>The idea</h3>
            ${idea}
            <div class="system-note">
                <span class="system-label">At system scale</span>
                ${c.system}
            </div>
            ${flags}
            ${patterns}`;
    }

    function renderNav(c) {
        const prev = byNum(c.num - 1);
        const next = byNum(c.num + 1);
        els.prev.hidden = !prev;
        els.next.hidden = !next;
        if (prev) {
            els.prev.href = `#ch-${prev.num}`;
            els.prev.innerHTML = `<span>← Chapter ${prev.num}</span>${shortTitle(prev)}`;
        }
        if (next) {
            els.next.href = `#ch-${next.num}`;
            els.next.innerHTML = `<span>Chapter ${next.num} →</span>${shortTitle(next)}`;
        }
    }

    function show(num, { scroll } = {}) {
        const c = byNum(num) || CHAPTERS[0];
        document.title = `Ch. ${c.num} ${shortTitle(c)} | A Philosophy of Software Design, Visualized`;
        els.eyebrow.textContent = `Chapter ${c.num} · ${BOOK_PARTS[c.part]}`;
        els.title.textContent = c.title;
        els.takeaway.textContent = c.takeaway;

        els.picker.querySelectorAll(".chapter-pill").forEach((pill) => {
            if (Number(pill.dataset.num) === c.num) pill.setAttribute("aria-current", "page");
            else pill.removeAttribute("aria-current");
        });

        els.viz.innerHTML = "";
        const render = VISUALS[c.num];
        if (render) render(els.viz);

        renderNotes(c);
        renderNav(c);
        if (scroll) document.querySelector(".chapter").scrollIntoView({ block: "start" });
    }

    const hashNum = () => Number((/^#ch-(\d+)$/.exec(location.hash) || [])[1]) || 1;

    renderPicker();
    show(hashNum());
    window.addEventListener("hashchange", () => show(hashNum(), { scroll: true }));
})();
