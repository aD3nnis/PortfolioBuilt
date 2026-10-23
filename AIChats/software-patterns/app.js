// Draws the scenario picker, brief, diagram and step-by-step walkthrough
// from the data in patterns.js and scenarios.js.
(function () {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const NODE_W = 130;
    const NODE_H = 48;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const $ = (id) => document.getElementById(id);
    const els = {
        picker: $("scenario-picker"),
        matrix: $("matrix-table"),
        scenario: document.querySelector(".scenario"),
        brief: $("brief"),
        svg: $("diagram"),
        count: $("step-count"),
        title: $("step-title"),
        text: $("step-text"),
        book: $("step-book"),
        prev: $("step-prev"),
        next: $("step-next"),
        dots: $("step-dots"),
        whyNot: $("why-not"),
        legend: $("cost-legend"),
        stackGroups: $("stack-groups"),
    };

    let scenario = null;
    let stepIndex = 0;
    let flowTweens = [];

    function svgEl(tag, attrs = {}) {
        const node = document.createElementNS(SVG_NS, tag);
        for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
        return node;
    }

    const nodeById = (id) => scenario.nodes.find((n) => n.id === id);
    const edgeKey = ([from, to]) => `${from}>${to}`;

    // Point where the line from a's center toward b's center leaves a's box.
    function boxEdge(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const scale = Math.min(
            NODE_W / 2 / Math.abs(dx || 1e-9),
            NODE_H / 2 / Math.abs(dy || 1e-9)
        );
        return [a.x + dx * scale, a.y + dy * scale];
    }

    function renderPicker() {
        SCENARIOS.forEach((s, i) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "scenario-tab";
            button.textContent = s.title;
            button.addEventListener("click", () => selectScenario(i));
            els.picker.appendChild(button);
        });
    }

    // Scenarios down the side, patterns across the top grouped by category.
    function renderMatrix() {
        const groups = Object.entries(PATTERN_CATEGORIES).map(([category, label]) => ({
            label,
            ids: Object.keys(PATTERNS).filter((id) => PATTERNS[id].category === category),
        }));

        const groupRow = groups.map((g) => `<th scope="colgroup" colspan="${g.ids.length}" class="group-start">${g.label}</th>`).join("");
        const patternRow = groups.map((g) => g.ids.map((id, j) => {
            const p = PATTERNS[id];
            return `<th scope="col"${j === 0 ? ' class="group-start"' : ""}${p.short ? ` title="${p.name}"` : ""}>${p.short || p.name}</th>`;
        }).join("")).join("");

        const rows = SCENARIOS.map((s, i) => {
            const cells = groups.map((g) => g.ids.map((id, j) => {
                const cls = j === 0 ? ' class="group-start"' : "";
                return s.patterns.includes(id)
                    ? `<td${cls}><button type="button" class="matrix-cell" aria-label="${s.title} uses ${PATTERNS[id].name}"><span aria-hidden="true">●</span></button></td>`
                    : `<td${cls}></td>`;
            }).join("")).join("");
            return `<tr data-index="${i}"><th scope="row"><button type="button" class="matrix-scenario">${s.title}</button></th>${cells}</tr>`;
        }).join("");

        els.matrix.innerHTML = `
            <thead>
                <tr><td rowspan="2"></td>${groupRow}</tr>
                <tr>${patternRow}</tr>
            </thead>
            <tbody>${rows}</tbody>`;

        els.matrix.querySelector("tbody").addEventListener("click", (event) => {
            const row = event.target.closest("tr");
            if (!row) return;
            selectScenario(Number(row.dataset.index));
            els.scenario.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        });
    }

    function costMeter(level) {
        const { mark, label } = COST_LEVELS[level];
        return `<span class="cost-meter cost-${level}" title="${label}">${mark}</span>`;
    }

    function renderCostLegend() {
        els.legend.innerHTML = COST_LEVELS.map((c, level) =>
            `<li>${costMeter(level)} <span>${c.label}</span></li>`).join("");
    }

    // One card for each pattern the current scenario uses: its usual tools and cost.
    function renderStack() {
        els.stackGroups.innerHTML = `<div class="stack-grid">${scenario.patterns.map((id) => {
            const p = PATTERNS[id];
            return `
                <article class="stack-card" id="stack-${id}">
                    <h3>${p.name}</h3>
                    <p class="pattern-category">${PATTERN_CATEGORIES[p.category]}</p>
                    <dl class="stack-rows">
                        ${p.stack.map(([term, text]) => `<dt>${term}</dt><dd>${text}</dd>`).join("")}
                    </dl>
                    <div class="stack-cost">
                        <p class="stack-cost-head">${costMeter(p.cost.level)} <strong>${p.cost.range}</strong></p>
                        <p>${p.cost.drivers}</p>
                    </div>
                </article>`;
        }).join("")}</div>`;
    }

    function renderBrief() {
        const patterns = scenario.patterns.map((id) => {
            const p = PATTERNS[id];
            return `<li>
                <span class="pattern-name">${p.name}</span>
                <span class="pattern-category">${PATTERN_CATEGORIES[p.category]}</span>
                <p>${p.summary}</p>
                <p class="pattern-cost">${costMeter(p.cost.level)} <a href="#stack-${id}">Stack and cost</a></p>
            </li>`;
        }).join("");

        els.brief.innerHTML = `
            <p class="brief-who">${scenario.requester} asks:</p>
            <blockquote class="brief-quote">“${scenario.brief}”</blockquote>
            ${scenario.project ? `<p class="brief-project"><a href="${scenario.project.href}">${scenario.project.label} →</a></p>` : ""}
            <h3>Requirements that shape the design</h3>
            <ul class="brief-reqs">${scenario.requirements.map((r) => `<li>${r}</li>`).join("")}</ul>
            <h3>${scenario.patterns.length > 1 ? "Patterns" : "Pattern"} this teaches</h3>
            <ul class="brief-patterns">${patterns}</ul>`;
    }

    function arrowMarker(id) {
        const marker = svgEl("marker", {
            id, viewBox: "0 0 10 10", refX: "9", refY: "5",
            markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse",
        });
        marker.appendChild(svgEl("path", { d: "M0,0 L10,5 L0,10 z", class: id }));
        return marker;
    }

    function renderDiagram() {
        const svg = els.svg;
        svg.innerHTML = "";
        svg.setAttribute("viewBox", scenario.viewBox);
        svg.setAttribute("aria-label", scenario.diagramLabel);

        const defs = svgEl("defs");
        defs.append(arrowMarker("arrow"), arrowMarker("arrow-active"));

        const edgeLayer = svgEl("g");
        scenario.edges.forEach((edge) => {
            const a = nodeById(edge[0]);
            const b = nodeById(edge[1]);
            const [x1, y1] = boxEdge(a, b);
            const [x2, y2] = boxEdge(b, a);
            edgeLayer.appendChild(svgEl("line", {
                x1, y1, x2, y2, class: "edge", "marker-end": "url(#arrow)", "data-edge": edgeKey(edge),
            }));
        });

        const nodeLayer = svgEl("g");
        scenario.nodes.forEach((n) => {
            const group = svgEl("g", {
                class: `node node-${n.kind}`,
                "data-node": n.id,
                transform: `translate(${n.x - NODE_W / 2}, ${n.y - NODE_H / 2})`,
            });
            group.appendChild(svgEl("rect", { width: NODE_W, height: NODE_H }));
            const label = svgEl("text", {
                x: NODE_W / 2, y: NODE_H / 2, "text-anchor": "middle", "dominant-baseline": "central",
            });
            label.textContent = n.label;
            group.appendChild(label);
            nodeLayer.appendChild(group);
        });

        svg.append(defs, edgeLayer, nodeLayer, svgEl("g", { id: "flow-layer" }));
    }

    function renderStepDots() {
        els.dots.innerHTML = "";
        scenario.steps.forEach((step, i) => {
            const li = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.className = "step-dot";
            button.setAttribute("aria-label", `Step ${i + 1}: ${step.title}`);
            button.addEventListener("click", () => showStep(i));
            li.appendChild(button);
            els.dots.appendChild(li);
        });
    }

    function renderWhyNot() {
        const w = scenario.whyNot;
        els.whyNot.innerHTML = `
            <summary>${w.title}</summary>
            <p>${w.text}</p>
            <p class="why-not-tradeoff"><strong>The trade-off:</strong> ${w.tradeoff}</p>`;
        els.whyNot.open = false;
    }

    function isVisible(nodeId, i) {
        return (nodeById(nodeId).appearsAt ?? 0) <= i;
    }

    function showStep(i) {
        stepIndex = i;
        const step = scenario.steps[i];
        const activeNodes = new Set(step.nodes);
        const activeEdges = new Set(step.edges.map(edgeKey));

        els.svg.querySelectorAll(".node").forEach((g) => {
            const id = g.dataset.node;
            g.classList.toggle("is-active", activeNodes.has(id));
            g.classList.toggle("is-hidden", !isVisible(id, i));
            g.classList.toggle("is-new", nodeById(id).appearsAt === i);
        });

        els.svg.querySelectorAll(".edge").forEach((line) => {
            const [from, to] = line.dataset.edge.split(">");
            const active = activeEdges.has(line.dataset.edge);
            line.classList.toggle("is-active", active);
            line.classList.toggle("is-hidden", !isVisible(from, i) || !isVisible(to, i));
            line.setAttribute("marker-end", active ? "url(#arrow-active)" : "url(#arrow)");
        });

        els.count.textContent = `Step ${i + 1} of ${scenario.steps.length}`;
        els.title.textContent = step.title;
        els.text.textContent = step.text;
        els.book.hidden = !step.book;
        if (step.book) {
            const num = (/Ch\. (\d+)/.exec(step.book.chapter) || [])[1];
            const label = `From the book · ${step.book.chapter}`;
            els.book.innerHTML = `<span class="book-label">${num ? `<a href="../design-philosophy/index.html#ch-${num}">${label} →</a>` : label}</span>${step.book.text}`;
        }

        els.prev.disabled = i === 0;
        els.next.disabled = i === scenario.steps.length - 1;
        [...els.dots.querySelectorAll(".step-dot")].forEach((dot, j) => {
            if (j === i) dot.setAttribute("aria-current", "step");
            else dot.removeAttribute("aria-current");
        });

        animateFlow(step.edges);
    }

    // A dot travels along each active edge to show the request or event moving.
    function animateFlow(edges) {
        flowTweens.forEach((t) => t.kill());
        flowTweens = [];
        const layer = els.svg.querySelector("#flow-layer");
        layer.innerHTML = "";
        if (reduceMotion || !window.gsap) return;

        edges.forEach((edge) => {
            const line = els.svg.querySelector(`[data-edge="${edgeKey(edge)}"]`);
            const dot = svgEl("circle", {
                r: 6, class: "flow-dot", cx: line.getAttribute("x1"), cy: line.getAttribute("y1"),
            });
            layer.appendChild(dot);
            flowTweens.push(gsap.to(dot, {
                attr: { cx: line.getAttribute("x2"), cy: line.getAttribute("y2") },
                duration: 1,
                ease: "power1.inOut",
                repeat: -1,
                repeatDelay: 0.5,
            }));
        });
    }

    function selectScenario(i) {
        scenario = SCENARIOS[i];
        [...els.picker.children].forEach((button, j) => button.setAttribute("aria-pressed", String(i === j)));
        // On narrow screens the picker scrolls sideways; keep the selected tab in view.
        const tab = els.picker.children[i];
        if (els.picker.scrollWidth > els.picker.clientWidth) {
            els.picker.scrollLeft = tab.offsetLeft - (els.picker.clientWidth - tab.offsetWidth) / 2;
        }
        els.matrix.querySelectorAll("tbody tr").forEach((row, j) => row.classList.toggle("is-current", i === j));
        renderBrief();
        renderStack();
        renderDiagram();
        renderStepDots();
        renderWhyNot();
        showStep(0);
    }

    els.prev.addEventListener("click", () => stepIndex > 0 && showStep(stepIndex - 1));
    els.next.addEventListener("click", () => stepIndex < scenario.steps.length - 1 && showStep(stepIndex + 1));
    document.addEventListener("keydown", (event) => {
        if (event.target.closest("input, textarea, select, summary")) return;
        if (event.key === "ArrowRight") els.next.click();
        if (event.key === "ArrowLeft") els.prev.click();
    });

    renderPicker();
    renderMatrix();
    renderCostLegend();
    // #scenario-id deep links come from the design-philosophy chapter pages.
    selectScenario(Math.max(0, SCENARIOS.findIndex((s) => `#${s.id}` === location.hash)));
})();
