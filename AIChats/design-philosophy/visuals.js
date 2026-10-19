// One interactive visual per chapter. Each entry takes the empty visual
// container and builds its own controls and SVG inside it.
(function () {
    const VISUALS = {};
    const NODE_W = 130;
    const NODE_H = 48;

    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // A row of pill buttons where exactly one is pressed.
    function toggles(host, labels, onSelect, initial = 0) {
        host.innerHTML = labels.map((label) => `<button type="button" class="viz-toggle">${label}</button>`).join("");
        const buttons = [...host.children];
        const select = (i) => {
            buttons.forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
            onSelect(i);
        };
        buttons.forEach((b, i) => b.addEventListener("click", () => select(i)));
        select(initial);
        return select;
    }

    // Point where the line from a's center toward b's center leaves a's box.
    function boxEdge(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const scale = Math.min(NODE_W / 2 / Math.abs(dx || 1e-9), NODE_H / 2 / Math.abs(dy || 1e-9));
        return [a.x + dx * scale, a.y + dy * scale];
    }

    const arrowDefs = `<defs>
        <marker id="viz-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="viz-arrow"/></marker>
        <marker id="viz-arrow-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="viz-arrow-bad"/></marker>
    </defs>`;

    function nodeSvg(n, cls = "") {
        return `<g class="vnode vnode-${n.kind || "service"} ${cls}" transform="translate(${n.x - NODE_W / 2}, ${n.y - NODE_H / 2})">
            <rect width="${NODE_W}" height="${NODE_H}"/>
            <text x="${NODE_W / 2}" y="${NODE_H / 2}" text-anchor="middle" dominant-baseline="central">${n.label}</text>
        </g>`;
    }

    function edgeSvg(a, b, cls = "") {
        const [x1, y1] = boxEdge(a, b);
        const [x2, y2] = boxEdge(b, a);
        const marker = cls.includes("is-bad") ? "viz-arrow-bad" : "viz-arrow";
        return `<line class="vedge ${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${marker})"/>`;
    }

    const badgeSvg = (n, text, cls = "") =>
        `<text class="vbadge ${cls}" x="${n.x}" y="${n.y - NODE_H / 2 - 8}" text-anchor="middle">${text}</text>`;

    // ── 1. Introduction: the complexity budget ─────────────────────────────
    VISUALS[1] = (root) => {
        const decisions = [
            { q: "A second team needs your order data.", tactical: "Let them read your tables", strategic: "Expose an orders API", debt: 3 },
            { q: "Checkout needs a holiday discount.", tactical: "Add an if for December", strategic: "Add a pricing-rules module", debt: 2 },
            { q: "Emails sometimes fail to send.", tactical: "Retry in every caller", strategic: "Retry once, in the email service", debt: 2 },
            { q: "Customers get a new loyalty tier field.", tactical: "Copy the column into 3 services", strategic: "One owner, others ask it", debt: 3 },
            { q: "A function is hard to name.", tactical: "Call it handleStuff()", strategic: "Rethink what it does", debt: 1 },
            { q: "The deploy script fails sometimes.", tactical: "Rerun until it passes", strategic: "Fix the flaky step", debt: 1 },
        ];
        const choice = decisions.map(() => 0);
        const maxDebt = decisions.reduce((sum, d) => sum + d.debt, 0);

        root.innerHTML = `
            <p class="viz-intro">Six everyday decisions. Pick a path for each one and see what it costs now and what it leaves behind.</p>
            <ol class="decision-list">${decisions.map((d) => `
                <li class="decision">
                    <p class="decision-q">${d.q}</p>
                    <div class="viz-toggles" role="group" aria-label="${d.q}"></div>
                </li>`).join("")}
            </ol>
            <div class="meters">
                <div class="meter"><span class="meter-label">Time spent now</span><div class="meter-track"><div class="meter-fill meter-time"></div></div><span class="meter-value" data-out="time"></span></div>
                <div class="meter"><span class="meter-label">Complexity left behind</span><div class="meter-track"><div class="meter-fill meter-debt"></div></div><span class="meter-value" data-out="debt"></span></div>
            </div>
            <p class="viz-caption" data-out="caption"></p>`;

        const update = () => {
            const time = choice.reduce((sum, c) => sum + (c ? 2 : 1), 0);
            const debt = choice.reduce((sum, c, i) => sum + (c ? 0 : decisions[i].debt), 0);
            root.querySelector(".meter-time").style.width = `${(time / 12) * 100}%`;
            root.querySelector(".meter-debt").style.width = `${(debt / maxDebt) * 100}%`;
            root.querySelector('[data-out="time"]').textContent = `${time} days`;
            root.querySelector('[data-out="debt"]').textContent = `${debt} / ${maxDebt}`;
            const nextFeature = (2 + debt * 0.6).toFixed(1);
            root.querySelector('[data-out="caption"]').innerHTML =
                `The next feature will take about <strong>${nextFeature} days</strong>. ` +
                (debt === 0 ? "Nothing is left behind, so every future change starts from a clean slate."
                    : debt === maxDebt ? "Each shortcut was quick on its own. Together they slow down every change that comes after them."
                        : "Some shortcuts are cheap and harmless. The ones that spread knowledge across services cost the most.");
        };

        root.querySelectorAll(".decision .viz-toggles").forEach((host, i) => {
            toggles(host, [decisions[i].tactical, decisions[i].strategic], (c) => { choice[i] = c; update(); });
        });
    };

    // ── 2. Nature of complexity: symptoms on a service map ─────────────────
    VISUALS[2] = (root) => {
        const nodes = {
            web: { x: 100, y: 60, label: "Web app" },
            checkout: { x: 300, y: 60, label: "Checkout" },
            orders: { x: 500, y: 60, label: "Orders" },
            billing: { x: 100, y: 210, label: "Billing" },
            email: { x: 300, y: 210, label: "Email" },
            analytics: { x: 500, y: 210, label: "Analytics" },
        };
        const symptoms = [
            {
                label: "Change amplification",
                cause: "Cause: dependencies",
                task: "Task: support a second currency.",
                touched: [["web", "checkout", "orders", "billing", "email", "analytics"], ["checkout"]],
                text: [
                    "Every service formats and rounds prices itself, so supporting euros means changing all six.",
                    "Checkout owns prices and currency. Everyone else gets a formatted amount from its API, so only one service changes.",
                ],
            },
            {
                label: "Cognitive load",
                cause: "Causes: dependencies and obscurity",
                task: "What you need to know before touching prices:",
                facts: [[
                    "Orders stores totals in cents and Billing stores dollars.",
                    "Email recalculates tax instead of reading it.",
                    "Analytics reads the orders table directly.",
                    "The web app rounds differently from Checkout.",
                    "Billing must run before Email, or receipts show $0.",
                    "A legacy flag on old orders changes how tax works.",
                ], [
                    "Checkout owns prices and currency.",
                    "Everyone else asks Checkout or Orders through their APIs.",
                ]],
            },
            {
                label: "Unknown unknowns",
                cause: "Cause: obscurity",
                task: "Task: rename a column in the orders table.",
                text: [
                    "Analytics was quietly reading the orders table. Nothing in the Orders code said so, and the rename broke the revenue dashboard in production.",
                    "Analytics uses the Orders API, so the table is an internal detail. The rename ships without anyone else noticing.",
                ],
            },
        ];
        let symptom = 0;
        let design = 0;
        let shipped = false;

        root.innerHTML = `
            <div class="viz-controls">
                <div class="viz-toggles" role="group" aria-label="Symptom" data-ctl="symptom"></div>
                <div class="viz-toggles viz-toggles-small" role="group" aria-label="Design" data-ctl="design"></div>
            </div>
            <div class="viz-split">
                <svg class="viz-svg" viewBox="0 0 600 270" role="img" aria-label="Six services: Web app, Checkout, Orders, Billing, Email and Analytics"></svg>
                <div class="viz-side" data-out="side"></div>
            </div>`;

        const svg = root.querySelector("svg");
        const side = root.querySelector('[data-out="side"]');

        function draw() {
            const s = symptoms[symptom];
            const tangled = design === 0;
            const edges = [["web", "checkout"], ["checkout", "orders"], ["checkout", "billing"], ["orders", "email"], ["billing", "email"]];
            let edgeMarkup = edges.map(([a, b]) => edgeSvg(nodes[a], nodes[b])).join("");
            const hiddenRead = tangled && symptom === 2;
            if (!tangled) edgeMarkup += edgeSvg(nodes.analytics, nodes.orders);
            else if (hiddenRead && shipped) edgeMarkup += edgeSvg(nodes.analytics, nodes.orders, "is-bad is-dashed");
            else if (tangled && symptom === 1) edgeMarkup += edgeSvg(nodes.analytics, nodes.orders, "is-dashed");

            const touched = new Set(s.touched ? s.touched[design] : []);
            const nodeMarkup = Object.entries(nodes).map(([id, n]) => {
                let cls = touched.has(id) ? "is-touched" : "";
                if (symptom === 2 && shipped) {
                    if (id === "orders") cls = "is-touched";
                    if (id === "analytics") cls = tangled ? "is-bad" : "is-ok";
                }
                return nodeSvg(n, cls);
            }).join("");

            svg.innerHTML = arrowDefs + edgeMarkup + nodeMarkup;

            let body = "";
            if (s.touched) {
                body = `<p class="viz-stat"><strong>${touched.size}</strong> ${touched.size === 1 ? "service" : "services"} to change</p><p>${s.text[design]}</p>`;
            } else if (s.facts) {
                body = `<p class="viz-stat"><strong>${s.facts[design].length}</strong> things to keep in your head</p>
                    <ul class="fact-list">${s.facts[design].map((f) => `<li>${f}</li>`).join("")}</ul>`;
            } else {
                body = shipped
                    ? `<p class="viz-stat ${tangled ? "is-bad" : "is-ok"}">${tangled ? "Production incident" : "Shipped safely"}</p><p>${s.text[design]}</p>`
                    : `<button type="button" class="viz-button" data-act="ship">Ship the rename</button>`;
            }
            side.innerHTML = `<p class="viz-task">${s.task}</p>${body}<p class="viz-cause">${s.cause}</p>`;
            const ship = side.querySelector('[data-act="ship"]');
            if (ship) ship.addEventListener("click", () => { shipped = true; draw(); });
        }

        toggles(root.querySelector('[data-ctl="symptom"]'), symptoms.map((s) => s.label), (i) => { symptom = i; shipped = false; draw(); });
        toggles(root.querySelector('[data-ctl="design"]'), ["Tangled", "Well designed"], (i) => { design = i; shipped = false; draw(); });
    };

    // ── 3. Working code isn't enough: tactical vs. strategic over time ────
    VISUALS[3] = (root) => {
        const SPRINTS = 24;
        const X0 = 56, X1 = 580, Y0 = 270, Y1 = 20, Y_MAX = 16;

        // Velocity falls as complexity builds up; design time slows how fast it builds.
        function cumulative(invest) {
            const decay = 0.16 * Math.max(0, 1 - invest / 0.25) + 0.01;
            const points = [0];
            for (let t = 0; t < SPRINTS; t++) points.push(points[t] + (1 - invest) / (1 + decay * t));
            return points;
        }
        const x = (t) => X0 + (t / SPRINTS) * (X1 - X0);
        const y = (v) => Y0 - (v / Y_MAX) * (Y0 - Y1);
        const path = (pts) => pts.map((v, t) => `${t ? "L" : "M"}${x(t).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

        root.innerHTML = `
            <p class="viz-intro">Features shipped over two years of sprints. Drag the slider to change how much of each sprint the strategic team spends on design.</p>
            <label class="viz-slider">Strategic team's design time: <strong data-out="pct"></strong>
                <input type="range" min="0" max="40" step="5" value="15">
            </label>
            <svg class="viz-svg" viewBox="0 0 600 310" role="img" aria-label="Line chart of total features shipped per sprint for a tactical and a strategic team"></svg>
            <p class="viz-caption" data-out="caption"></p>`;

        const svg = root.querySelector("svg");
        const input = root.querySelector("input");
        const tactical = cumulative(0);

        function draw() {
            const invest = Number(input.value) / 100;
            const strategic = cumulative(invest);
            const cross = strategic.findIndex((v, t) => t > 0 && v > tactical[t]);
            const grid = [0, 4, 8, 12, 16].map((v) =>
                `<line class="chart-grid" x1="${X0}" x2="${X1}" y1="${y(v)}" y2="${y(v)}"/><text class="chart-tick" x="${X0 - 8}" y="${y(v)}" text-anchor="end" dominant-baseline="central">${v}</text>`).join("");
            const xTicks = [0, 6, 12, 18, 24].map((t) =>
                `<text class="chart-tick" x="${x(t)}" y="${Y0 + 18}" text-anchor="middle">${t}</text>`).join("");
            const crossMark = cross > 0
                ? `<line class="chart-cross" x1="${x(cross)}" x2="${x(cross)}" y1="${Y1}" y2="${Y0}"/><text class="chart-note" x="${x(cross) + 6}" y="${Y1 + 12}">Strategic pulls ahead</text>`
                : "";

            svg.innerHTML = `
                ${grid}${xTicks}
                <text class="chart-tick" x="${(X0 + X1) / 2}" y="${Y0 + 36}" text-anchor="middle">Sprint</text>
                ${crossMark}
                <path class="chart-line chart-tactical" d="${path(tactical)}"/>
                <path class="chart-line chart-strategic" d="${path(strategic)}"/>
                <text class="chart-label chart-label-tactical" x="${X1}" y="${y(tactical[SPRINTS]) + 24}" text-anchor="end">Tactical</text>
                <text class="chart-label chart-label-strategic" x="${X1}" y="${y(strategic[SPRINTS]) - 12}" text-anchor="end">Strategic</text>`;

            root.querySelector('[data-out="pct"]').textContent = `${input.value}%`;
            const t = tactical[SPRINTS].toFixed(1);
            const s = strategic[SPRINTS].toFixed(1);
            root.querySelector('[data-out="caption"]').innerHTML = invest === 0
                ? "With no design time, both teams are tactical: fast at first, then every change gets slower as shortcuts pile up."
                : `After 24 sprints: tactical ships <strong>${t}</strong> features, strategic ships <strong>${s}</strong>. ` +
                (cross > 0 ? `Strategic catches up at sprint ${cross}. ` : "") +
                (invest > 0.25 ? "Past a point, extra design time stops paying for itself." : "Ousterhout suggests about 10–20%.");
        }
        input.addEventListener("input", draw);
        draw();
    };

    // ── 4. Modules should be deep: the rectangle ───────────────────────────
    VISUALS[4] = (root) => {
        const presets = [
            {
                label: "Object storage",
                note: "A storage service in the style of Amazon S3. Callers learn three operations, and years of distributed-systems work stay hidden.",
                exposed: ["put(key, bytes)", "get(key)", "delete(key)"],
                hidden: ["Replication across zones", "Encryption at rest", "Sharding", "Caching", "Disk-failure recovery", "Garbage collection", "Durability checks", "Capacity scaling"],
            },
            {
                label: "Unix file I/O",
                note: "The book's example of a deep module: five calls hide disk layout, caching and permissions.",
                exposed: ["open", "read", "write", "lseek", "close"],
                hidden: ["Disk block layout", "Directory lookup", "Permissions", "Buffer cache", "Disk scheduling", "Concurrent access"],
            },
            {
                label: "Table-wrapper service",
                note: "An “Orders service” that maps one endpoint to each row operation. Callers still coordinate the real work, so the interface is almost as big as the implementation.",
                exposed: ["createOrderRow", "getOrderRow", "updateOrderRow", "deleteOrderRow", "setOrderStatus", "setOrderTotal", "setShippingAddress", "listOrderRows"],
                hidden: ["SQL for one table"],
            },
        ];
        let items = [];
        let note = "";

        root.innerHTML = `
            <div class="viz-controls"><div class="viz-toggles" role="group" aria-label="Example module" data-ctl="preset"></div></div>
            <p class="viz-intro" data-out="note"></p>
            <div class="viz-split">
                <svg class="viz-svg" viewBox="0 0 560 300" role="img" aria-label="A rectangle whose top edge is the interface and whose area is the functionality"></svg>
                <div class="viz-side">
                    <p class="viz-stat" data-out="depth"></p>
                    <p class="chip-heading">Interface: what callers learn</p>
                    <div class="chip-row" data-list="exposed"></div>
                    <p class="chip-heading">Hidden inside</p>
                    <div class="chip-row" data-list="hidden"></div>
                    <p class="viz-hint">Select a chip to move it between the interface and the implementation.</p>
                </div>
            </div>`;

        const svg = root.querySelector("svg");

        function draw() {
            const exposed = items.filter((it) => it.exposed);
            const hidden = items.filter((it) => !it.exposed);
            const area = items.length * 3600;
            const width = Math.min(520, 50 + exposed.length * 40);
            const height = Math.max(24, Math.min(250, area / width));
            const left = (560 - width) / 2;
            const top = 30;
            const ratio = hidden.length / exposed.length;
            const verdict = ratio >= 2 ? "Deep" : ratio >= 1 ? "Medium" : "Shallow";

            svg.innerHTML = `
                <rect class="module-body" x="${left}" y="${top}" width="${width}" height="${height}" rx="4"/>
                <rect class="module-interface" x="${left}" y="${top - 8}" width="${width}" height="14" rx="3"/>
                <text class="module-label" x="280" y="16" text-anchor="middle">Interface: ${exposed.length} ${exposed.length === 1 ? "thing" : "things"} to learn</text>
                <text class="module-label module-label-inside" x="280" y="${top + Math.min(height / 2 + 6, height - 6)}" text-anchor="middle">${height > 30 ? `Functionality: ${items.length}` : ""}</text>`;

            root.querySelector('[data-out="depth"]').innerHTML = `<strong>${verdict}</strong> · ${hidden.length} hidden for every ${exposed.length} exposed`;
            root.querySelector('[data-out="depth"]').className = `viz-stat ${verdict === "Shallow" ? "is-bad" : verdict === "Deep" ? "is-ok" : ""}`;
            root.querySelector('[data-out="note"]').textContent = note;

            ["exposed", "hidden"].forEach((list) => {
                const host = root.querySelector(`[data-list="${list}"]`);
                host.innerHTML = items.map((it, i) => (it.exposed === (list === "exposed"))
                    ? `<button type="button" class="chip ${it.exposed ? "chip-exposed" : ""}" data-i="${i}">${esc(it.name)}</button>` : "").join("");
            });
        }

        root.querySelectorAll("[data-list]").forEach((host) => host.addEventListener("click", (event) => {
            const chip = event.target.closest(".chip");
            if (!chip) return;
            const item = items[Number(chip.dataset.i)];
            if (item.exposed && items.filter((it) => it.exposed).length === 1) return;
            item.exposed = !item.exposed;
            draw();
        }));

        toggles(root.querySelector('[data-ctl="preset"]'), presets.map((p) => p.label), (i) => {
            const p = presets[i];
            note = p.note;
            items = [...p.exposed.map((name) => ({ name, exposed: true })), ...p.hidden.map((name) => ({ name, exposed: false }))];
            draw();
        });
    };

    // ── 5. Information hiding: who knows the secret? ───────────────────────
    VISUALS[5] = (root) => {
        const setups = [
            {
                label: "Shared database",
                nodes: { orders: { x: 100, y: 60, label: "Orders" }, shipping: { x: 300, y: 60, label: "Shipping" }, reports: { x: 500, y: 60, label: "Reports" }, db: { x: 300, y: 220, label: "Orders DB", kind: "store" } },
                edges: [["orders", "db"], ["shipping", "db"], ["reports", "db"]],
                knows: ["orders", "shipping", "reports"],
                secret: "knows the schema",
                change: "Split the address column into street, city and postcode",
                after: "Three services break, owned by three teams who now have to coordinate a release. The schema was a decision every reader depended on.",
            },
            {
                label: "Split by workflow step",
                nodes: { read: { x: 100, y: 120, label: "Import reader" }, transform: { x: 300, y: 120, label: "Transformer" }, write: { x: 500, y: 120, label: "Writer" } },
                edges: [["read", "transform"], ["transform", "write"]],
                knows: ["read", "transform", "write"],
                secret: "knows the CSV layout",
                change: "The supplier switches from CSV to JSON",
                after: "This is temporal decomposition: the code is split by the order things happen, so all three steps had to understand the same file format.",
            },
            {
                label: "Hidden behind one owner",
                nodes: { shipping: { x: 100, y: 60, label: "Shipping" }, reports: { x: 500, y: 60, label: "Reports" }, orders: { x: 300, y: 140, label: "Orders API" }, db: { x: 300, y: 240, label: "Orders DB", kind: "store" } },
                edges: [["shipping", "orders"], ["reports", "orders"], ["orders", "db"]],
                knows: ["orders"],
                secret: "knows the schema",
                change: "Split the address column into street, city and postcode",
                after: "Only Orders changes. Its API still returns the same address object, so Shipping and Reports never find out.",
            },
        ];
        let setup = setups[0];
        let changed = false;

        root.innerHTML = `
            <div class="viz-controls"><div class="viz-toggles" role="group" aria-label="Design" data-ctl="setup"></div></div>
            <div class="viz-split">
                <svg class="viz-svg" viewBox="0 0 600 290" role="img" aria-label="Services and which of them know an internal design decision"></svg>
                <div class="viz-side" data-out="side"></div>
            </div>`;
        const svg = root.querySelector("svg");
        const side = root.querySelector('[data-out="side"]');

        function draw() {
            const knows = new Set(setup.knows);
            const leak = knows.size > 1;
            svg.innerHTML = arrowDefs +
                setup.edges.map(([a, b]) => edgeSvg(setup.nodes[a], setup.nodes[b])).join("") +
                Object.entries(setup.nodes).map(([id, n]) => {
                    const cls = changed && knows.has(id) ? (leak ? "is-bad" : "is-touched") : knows.has(id) ? "is-knows" : "";
                    return nodeSvg(n, cls) + (knows.has(id) ? badgeSvg(n, setup.secret, leak ? "is-bad" : "") : "");
                }).join("");

            side.innerHTML = `
                <p class="viz-stat ${leak ? "is-bad" : "is-ok"}"><strong>${knows.size}</strong> ${knows.size === 1 ? "service" : "services"} ${setup.secret.replace("knows", "know")}</p>
                <p class="viz-task">Change: ${setup.change}.</p>
                ${changed ? `<p>${setup.after}</p>` : `<button type="button" class="viz-button" data-act="change">Make the change</button>`}
                <p class="viz-cause">${leak ? "Red flag: information leakage" : "Information hiding"}</p>`;
            const button = side.querySelector('[data-act="change"]');
            if (button) button.addEventListener("click", () => { changed = true; draw(); });
        }

        toggles(root.querySelector('[data-ctl="setup"]'), setups.map((s) => s.label), (i) => { setup = setups[i]; changed = false; draw(); });
    };

    // ── 6. General-purpose modules are deeper ──────────────────────────────
    VISUALS[6] = (root) => {
        const examples = [
            {
                label: "Text editor (the book's example)",
                special: ["backspace(cursor)", "delete(cursor)", "deleteSelection(selection)", "insertChar(cursor, char)", "insertNewline(cursor)", "moveCursorLeft(cursor)", "moveCursorRight(cursor)"],
                general: ["insert(position, text)", "delete(start, end)", "changePosition(position, numChars)"],
                request: "Add “delete word” (Ctrl+Backspace).",
                specialCost: "Add another method, deleteWord(cursor), to the text class. The text class keeps learning about the UI.",
                generalCost: "Write it in the UI code using delete(start, end). The text class doesn't change at all.",
            },
            {
                label: "Notification service",
                special: ["POST /emails/welcome", "POST /emails/password-reset", "POST /emails/order-shipped", "POST /sms/order-shipped", "POST /emails/refund-issued", "POST /emails/weekly-digest"],
                general: ["POST /notifications { template, recipient, channel, data }", "GET /notifications/{id}"],
                request: "Marketing wants a push notification when an order is delivered.",
                specialCost: "A new endpoint, a new deploy of the notification service and new client code, coordinated across two teams.",
                generalCost: "Add an order-delivered template. Callers use the same endpoint with channel: \"push\". No deploy needed.",
            },
        ];
        let example = examples[0];
        let general = false;

        root.innerHTML = `
            <div class="viz-controls">
                <div class="viz-toggles" role="group" aria-label="Example" data-ctl="example"></div>
                <div class="viz-toggles viz-toggles-small" role="group" aria-label="Interface style" data-ctl="style"></div>
            </div>
            <div class="viz-split">
                <div>
                    <p class="viz-stat" data-out="count"></p>
                    <ul class="sig-list" data-out="sigs"></ul>
                </div>
                <div class="viz-side">
                    <p class="viz-task" data-out="request"></p>
                    <p data-out="cost"></p>
                </div>
            </div>`;

        function draw() {
            const sigs = general ? example.general : example.special;
            root.querySelector('[data-out="count"]').innerHTML = `<strong>${sigs.length}</strong> operations in the interface`;
            root.querySelector('[data-out="sigs"]').innerHTML = sigs.map((s) => `<li><code>${esc(s)}</code></li>`).join("");
            root.querySelector('[data-out="request"]').textContent = `Next request: ${example.request}`;
            root.querySelector('[data-out="cost"]').textContent = general ? example.generalCost : example.specialCost;
        }

        toggles(root.querySelector('[data-ctl="example"]'), examples.map((e) => e.label), (i) => { example = examples[i]; draw(); });
        toggles(root.querySelector('[data-ctl="style"]'), ["Special-purpose", "Somewhat general-purpose"], (i) => { general = i === 1; draw(); });
    };

    // ── 7. Different layer, different abstraction ──────────────────────────
    VISUALS[7] = (root) => {
        const modes = [
            {
                label: "Pass-through methods",
                layers: [
                    ["HTTP handler", "getOrder(id)", "bad"],
                    ["OrderController", "getOrder(id) → service.getOrder(id)", "bad"],
                    ["OrderService", "getOrder(id) → repo.getOrder(id)", "bad"],
                    ["OrderRepository", "getOrder(id) → SELECT * FROM orders …", ""],
                ],
                text: "Three layers share the same signature and just hand the call down. Each adds an interface to learn and a file to open, but no new abstraction.",
                flag: "Red flag: pass-through method",
            },
            {
                label: "Pass-through variable",
                layers: [
                    ["HTTP handler", "handle(request, traceId)", "var"],
                    ["OrderController", "getOrder(id, traceId)", "var"],
                    ["OrderService", "getOrder(id, traceId)", "var"],
                    ["OrderRepository", "query(sql, traceId) ← the only layer that uses it", ""],
                ],
                text: "traceId is threaded through every signature so the bottom layer can log it. Adding another value like this means editing every layer in between.",
                flag: "Fix: keep values like this in a request context",
            },
            {
                label: "Different abstractions",
                layers: [
                    ["HTTP handler", "GET /orders/42 → JSON, status codes", "ok"],
                    ["OrderController", "Authorize, parse input, map errors to responses", "ok"],
                    ["Order domain", "Order with pricing rules and status changes", "ok"],
                    ["OrderRepository", "Rows ↔ Order objects, queries, transactions", "ok"],
                ],
                text: "Each layer speaks its own vocabulary: HTTP, then requests, then the business, then storage. The trace ID lives in a request context that any layer can read.",
                flag: "Each layer earns its place",
            },
        ];

        root.innerHTML = `
            <div class="viz-controls"><div class="viz-toggles" role="group" aria-label="Layering" data-ctl="mode"></div></div>
            <div class="viz-split">
                <ol class="layer-stack" data-out="stack"></ol>
                <div class="viz-side"><p data-out="text"></p><p class="viz-cause" data-out="flag"></p></div>
            </div>`;

        toggles(root.querySelector('[data-ctl="mode"]'), modes.map((m) => m.label), (i) => {
            const m = modes[i];
            root.querySelector('[data-out="stack"]').innerHTML = m.layers.map(([name, sig, kind]) =>
                `<li class="layer ${kind ? `layer-${kind}` : ""}"><span class="layer-name">${name}</span><code>${esc(sig)}</code></li>`).join("");
            root.querySelector('[data-out="text"]').textContent = m.text;
            root.querySelector('[data-out="flag"]').textContent = m.flag;
        });
    };

    // ── 8. Pull complexity downwards ───────────────────────────────────────
    VISUALS[8] = (root) => {
        const concerns = [
            { label: "Retries with backoff", lines: 25, module: "Payments SDK" },
            { label: "Pagination", lines: 15, module: "Orders API client" },
            { label: "Auth token refresh", lines: 30, module: "Platform client" },
        ];
        let concern = concerns[0];
        let down = false;

        root.innerHTML = `
            <div class="viz-controls">
                <div class="viz-toggles" role="group" aria-label="Concern" data-ctl="concern"></div>
                <div class="viz-toggles viz-toggles-small" role="group" aria-label="Who handles it" data-ctl="where"></div>
            </div>
            <label class="viz-slider">Services that call the module: <strong data-out="n"></strong>
                <input type="range" min="1" max="30" value="12">
            </label>
            <div class="viz-split">
                <svg class="viz-svg" viewBox="0 0 600 280" role="img" aria-label="Many calling services above one shared module"></svg>
                <div class="viz-side" data-out="side"></div>
            </div>`;
        const svg = root.querySelector("svg");
        const input = root.querySelector("input");

        function draw() {
            const n = Number(input.value);
            const cols = Math.min(n, 10);
            const rows = Math.ceil(n / 10);
            const mod = { x: 300, y: 235 };
            let lines = "";
            let callers = "";
            for (let i = 0; i < n; i++) {
                const col = i % 10;
                const row = Math.floor(i / 10);
                const inRow = row === rows - 1 ? n - row * 10 : cols;
                const cx = 300 + (col - (inRow - 1) / 2) * 56;
                const cy = 26 + row * 50;
                lines += `<line class="vedge" x1="${cx}" y1="${cy + 12}" x2="${mod.x}" y2="${mod.y - 24}"/>`;
                callers += `<g class="caller ${down ? "" : "is-burdened"}"><rect x="${cx - 22}" y="${cy - 12}" width="44" height="24" rx="5"/>${down ? "" : `<circle cx="${cx + 18}" cy="${cy - 10}" r="6"/>`}</g>`;
            }
            let markup = lines + callers;
            markup +=`<g class="vnode ${down ? "is-touched" : ""}" transform="translate(${mod.x - 90}, ${mod.y - 24})"><rect width="180" height="48"/><text x="90" y="24" text-anchor="middle" dominant-baseline="central">${concern.module}</text></g>`;
            svg.innerHTML = markup;

            const copies = down ? 1 : n;
            const anyWrong = 1 - Math.pow(0.95, copies);
            root.querySelector('[data-out="n"]').textContent = n;
            root.querySelector('[data-out="side"]').innerHTML = `
                <p class="viz-stat ${down ? "is-ok" : "is-bad"}"><strong>${copies}</strong> ${copies === 1 ? "place implements" : "places implement"} ${concern.label.toLowerCase()}</p>
                <p>About <strong>${copies * concern.lines}</strong> lines of code to write, review and keep in sync.</p>
                <p>If each copy has a 5% chance of a subtle bug, there's a <strong>${Math.round(anyWrong * 100)}%</strong> chance at least one is wrong.</p>
                <p class="viz-cause">${down ? "The module's developer handles it once. Callers just call." : "Every caller pays for complexity the module could have hidden."}</p>`;
        }

        input.addEventListener("input", draw);
        toggles(root.querySelector('[data-ctl="concern"]'), concerns.map((c) => c.label), (i) => { concern = concerns[i]; draw(); });
        toggles(root.querySelector('[data-ctl="where"]'), ["Each caller handles it", "The module handles it"], (i) => { down = i === 1; draw(); });
    };

    // ── 9. Better together or better apart? ────────────────────────────────
    VISUALS[9] = (root) => {
        const cases = [
            { q: "Parsing an HTTP request's headers and reading its body. Both need to know where the headers end and how long the body is.", answer: 0, why: "They share information. Splitting them would leak the request format into two places." },
            { q: "A general undo mechanism and the text-editor actions that use it (insert, delete, format).", answer: 1, why: "Separate general-purpose code from special-purpose code. Undo only needs to know “actions that can be reversed”, not what a text insert is." },
            { q: "An Orders service and an Invoices service that always deploy together and read each other's tables.", answer: 0, why: "They change together and share data, so they're one service running in two places. Merge them, or redraw the boundary so each owns its own data." },
            { q: "A 150-line function that does one clear thing in readable steps.", answer: 0, why: "Length alone isn't a reason to split. Breaking it up would create conjoined methods you can't read on their own." },
            { q: "The same 20 lines of retry logic pasted into five services.", answer: 1, why: "Repetition is a red flag. Pull it out into one shared client or SDK so it's written and fixed once." },
        ];
        const picks = cases.map(() => null);

        root.innerHTML = `
            <p class="viz-intro">For each situation, decide whether the code belongs together or apart, then compare with the book's guidance.</p>
            <p class="viz-stat" data-out="score"></p>
            <ol class="quiz-list">${cases.map((c, i) => `
                <li class="quiz" data-i="${i}">
                    <p>${c.q}</p>
                    <div class="quiz-actions">
                        <button type="button" class="viz-toggle" data-pick="0">Keep together</button>
                        <button type="button" class="viz-toggle" data-pick="1">Split apart</button>
                    </div>
                    <p class="quiz-answer" hidden></p>
                </li>`).join("")}
            </ol>`;

        function update() {
            const answered = picks.filter((p) => p !== null).length;
            const right = picks.filter((p, i) => p === cases[i].answer).length;
            root.querySelector('[data-out="score"]').innerHTML = answered ? `<strong>${right}</strong> of ${answered} match the book` : "No answers yet";
        }

        root.querySelectorAll(".quiz").forEach((card) => {
            const i = Number(card.dataset.i);
            card.querySelectorAll("[data-pick]").forEach((button) => button.addEventListener("click", () => {
                picks[i] = Number(button.dataset.pick);
                card.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
                const answer = card.querySelector(".quiz-answer");
                const right = picks[i] === cases[i].answer;
                answer.hidden = false;
                answer.className = `quiz-answer ${right ? "is-ok" : "is-bad"}`;
                answer.innerHTML = `<strong>${cases[i].answer === 0 ? "Better together." : "Better apart."}</strong> ${cases[i].why}`;
                update();
            }));
        });
        update();
    };

    // ── 10. Define errors out of existence ─────────────────────────────────
    VISUALS[10] = (root) => {
        const examples = [
            {
                label: "Delete a missing file",
                call: "deleteFile(path)",
                errors: ["File doesn't exist → throw NotFound", "File is open somewhere → throw InUse"],
                technique: "Define the error out",
                after: "Delete means “make sure the file is gone,” so an already-missing file is a success. An open file loses its name right away and its space is freed when the last user closes it, which is how Unix does it.",
            },
            {
                label: "substring() past the end",
                call: "text.substring(start, end)",
                errors: ["start or end past the end → throw IndexOutOfBounds", "end before start → throw"],
                technique: "Define the error out",
                after: "Return the characters that overlap the range. Parts outside the string are simply empty, so callers never have to check bounds first.",
            },
            {
                label: "Double-clicked Pay",
                call: "POST /payments",
                errors: ["Same request sent twice → customer charged twice", "Timeout → did it charge? The caller can't tell"],
                technique: "Define the error out (idempotency key)",
                after: "Every checkout sends an idempotency key. The same key always returns the first result, so a retry after a timeout or a double-click is always safe.",
            },
            {
                label: "Message delivered twice",
                call: "on OrderShipped(event)",
                errors: ["Queue redelivers after a crash → second shipping label printed"],
                technique: "Mask the error at a low level",
                after: "The consumer records processed message IDs and skips repeats. The rest of the system gets to assume each event arrives once.",
            },
            {
                label: "Errors in 40 API handlers",
                call: "every route handler",
                errors: ["Each handler has its own try/catch", "Each one formats errors differently", "Forgotten catches leak stack traces"],
                technique: "Aggregate exceptions",
                after: "Handlers just throw. One error middleware turns every exception into the same response format and logs it once.",
            },
        ];
        let example = examples[0];
        let fixed = false;

        root.innerHTML = `
            <div class="viz-controls">
                <div class="viz-toggles" role="group" aria-label="Example" data-ctl="example"></div>
                <div class="viz-toggles viz-toggles-small" role="group" aria-label="Design" data-ctl="fixed"></div>
            </div>
            <div class="viz-split">
                <div class="flow" data-out="flow"></div>
                <div class="viz-side" data-out="side"></div>
            </div>`;

        function draw() {
            const errors = fixed ? [] : example.errors;
            root.querySelector('[data-out="flow"]').innerHTML = `
                <div class="flow-step"><code>${esc(example.call)}</code></div>
                ${errors.map((e) => `<div class="flow-branch">${esc(e)}<span>caller must handle</span></div>`).join("")}
                <div class="flow-step flow-ok">${fixed ? "One path. Callers just call it." : "Happy path"}</div>`;
            root.querySelector('[data-out="side"]').innerHTML = `
                <p class="viz-stat ${fixed ? "is-ok" : "is-bad"}"><strong>${errors.length}</strong> error ${errors.length === 1 ? "case" : "cases"} every caller must handle</p>
                ${fixed ? `<p class="viz-task">${example.technique}</p><p>${example.after}</p>` : "<p>Every caller writes its own handling for each case, and each one is a chance to get it wrong.</p>"}`;
        }

        toggles(root.querySelector('[data-ctl="example"]'), examples.map((e) => e.label), (i) => { example = examples[i]; draw(); });
        toggles(root.querySelector('[data-ctl="fixed"]'), ["Before", "After"], (i) => { fixed = i === 1; draw(); });
    };

    // ── 11. Design it twice ────────────────────────────────────────────────
    VISUALS[11] = (root) => {
        const criteria = [
            { name: "Quick to build today", a: 5, b: 3 },
            { name: "Checkout survives an email outage", a: 1, b: 5 },
            { name: "Easy to add SMS and push later", a: 2, b: 5 },
            { name: "Easy to trace and debug", a: 5, b: 3 },
            { name: "Little infrastructure to run", a: 5, b: 2 },
        ];
        const on = criteria.map(() => true);

        root.innerHTML = `
            <p class="viz-intro">Request: “Tell customers when their order ships.” Here are two very different designs. Turn off anything that doesn't matter for your situation and see which one wins.</p>
            <div class="twice">
                <figure class="twice-design">
                    <svg class="viz-svg twice-svg" viewBox="0 0 360 120" role="img" aria-label="Design A: Orders calls Email directly">
                        ${arrowDefs}
                        ${edgeSvg({ x: 75, y: 60 }, { x: 285, y: 60 })}
                        ${nodeSvg({ x: 75, y: 60, label: "Orders" })}${nodeSvg({ x: 285, y: 60, label: "Email" })}
                        <text class="vbadge" x="180" y="48" text-anchor="middle">HTTP call</text>
                    </svg>
                    <figcaption><strong>A · Direct call.</strong> Orders calls the Email service and waits.</figcaption>
                </figure>
                <figure class="twice-design">
                    <svg class="viz-svg twice-svg" viewBox="0 0 360 120" role="img" aria-label="Design B: Orders publishes an event that Email and SMS subscribe to">
                        ${arrowDefs}
                        <line class="vedge" x1="120" y1="60" x2="158" y2="60" marker-end="url(#viz-arrow)"/>
                        <line class="vedge" x1="242" y1="52" x2="272" y2="32" marker-end="url(#viz-arrow)"/>
                        <line class="vedge" x1="242" y1="68" x2="272" y2="88" marker-end="url(#viz-arrow)"/>
                        <g class="vnode" transform="translate(10, 36)"><rect width="110" height="48"/><text x="55" y="24" text-anchor="middle" dominant-baseline="central">Orders</text></g>
                        <g class="vnode vnode-bus" transform="translate(160, 40)"><rect width="82" height="40"/><text x="41" y="20" text-anchor="middle" dominant-baseline="central">Queue</text></g>
                        <g class="vnode" transform="translate(274, 10)"><rect width="76" height="36"/><text x="38" y="18" text-anchor="middle" dominant-baseline="central">Email</text></g>
                        <g class="vnode is-faint" transform="translate(274, 74)"><rect width="76" height="36"/><text x="38" y="18" text-anchor="middle" dominant-baseline="central">SMS</text></g>
                    </svg>
                    <figcaption><strong>B · Event.</strong> Orders publishes OrderShipped. Email (and later SMS) subscribe.</figcaption>
                </figure>
            </div>
            <table class="score-table">
                <thead><tr><th scope="col">Matters to us?</th><th scope="col">A</th><th scope="col">B</th></tr></thead>
                <tbody>${criteria.map((c, i) => `
                    <tr><th scope="row"><label><input type="checkbox" checked data-i="${i}"> ${c.name}</label></th>
                    <td>${"●".repeat(c.a)}<span class="dim">${"●".repeat(5 - c.a)}</span></td>
                    <td>${"●".repeat(c.b)}<span class="dim">${"●".repeat(5 - c.b)}</span></td></tr>`).join("")}
                </tbody>
                <tfoot><tr><th scope="row">Total</th><td data-out="a"></td><td data-out="b"></td></tr></tfoot>
            </table>
            <p class="viz-caption" data-out="verdict"></p>
            <p class="viz-hint">The <a href="../software-patterns/index.html#order-notifications">Shipping notifications</a> scenario walks through design B in detail.</p>`;

        function update() {
            const a = criteria.reduce((sum, c, i) => sum + (on[i] ? c.a : 0), 0);
            const b = criteria.reduce((sum, c, i) => sum + (on[i] ? c.b : 0), 0);
            root.querySelector('[data-out="a"]').textContent = a;
            root.querySelector('[data-out="b"]').textContent = b;
            root.querySelector('[data-out="verdict"]').innerHTML =
                a === b ? "It's a tie. That's a signal to look for a third design that combines the best of both."
                    : `<strong>Design ${a > b ? "A" : "B"} wins</strong> for what you said matters. ` +
                    (a > b ? "For a small team with one channel, the simple direct call is often right." : "Once failures and future channels matter, the event pays for its extra infrastructure.");
        }
        root.querySelectorAll('input[type="checkbox"]').forEach((box) => box.addEventListener("change", () => {
            on[Number(box.dataset.i)] = box.checked;
            update();
        }));
        update();
    };

    // ── 12. Why write comments? The four excuses ───────────────────────────
    VISUALS[12] = (root) => {
        const excuses = [
            { excuse: "Good code is self-documenting.", answer: "Names and types can't say why a decision was made, what units a value is in, or what a method promises. Without that, users have to read the implementation, which defeats the point of an abstraction." },
            { excuse: "I don't have time to write comments.", answer: "Good comments take a small slice of development time and save far more for everyone who reads the code later, including future you." },
            { excuse: "Comments get out of date.", answer: "Mostly when they're far from the code or repeat it. Keep them next to what they describe, write about what isn't obvious, and check them in code review." },
            { excuse: "All the comments I've seen are worthless.", answer: "That's a reason to write better ones, not none. The next chapter is about how." },
        ];

        root.innerHTML = `
            <p class="viz-intro">Select each excuse to flip it over.</p>
            <div class="flip-grid">${excuses.map((e) => `
                <button type="button" class="flip-card" aria-pressed="false">
                    <span class="flip-front">“${e.excuse}”</span>
                    <span class="flip-back">${e.answer}</span>
                </button>`).join("")}
            </div>
            <p class="viz-caption">At system scale, the same four excuses get used to skip API references, READMEs, runbooks and decision records.</p>`;

        root.querySelectorAll(".flip-card").forEach((card) => card.addEventListener("click", () => {
            card.setAttribute("aria-pressed", String(card.getAttribute("aria-pressed") !== "true"));
        }));
    };

    // ── 13. Comments describe what isn't obvious ───────────────────────────
    VISUALS[13] = (root) => {
        const modes = [
            { label: "No comments", c1: null, c2: null, text: "The code is clear about what it does. It says nothing about why 5, what unit the delay is in, or why there's a cap." },
            {
                label: "Repeats the code",
                c1: "// Retry limit is 5.",
                c2: "// Computes the backoff delay: min of 30000 and 2^attempt * 100.",
                text: "Every word is already in the code. Readers spend time on the comments and learn nothing.",
                flag: "Red flag: comment repeats code",
            },
            {
                label: "Adds what isn't obvious",
                c1: "// The payment provider locks our API key after 6 failed\n// calls per minute, so stay below that.",
                c2: "// Returns milliseconds. attempt starts at 0. Capped at 30s so a\n// retry never outlives the client's 60s request timeout.",
                text: "Now the comments add precision (units, where counting starts) and intuition (why the numbers are what they are). Someone changing the limit knows what will break.",
            },
        ];

        root.innerHTML = `
            <div class="viz-controls"><div class="viz-toggles" role="group" aria-label="Comment style" data-ctl="mode"></div></div>
            <pre class="viz-code" data-out="code"></pre>
            <p class="viz-caption" data-out="text"></p>
            <p class="viz-cause" data-out="flag"></p>`;

        toggles(root.querySelector('[data-ctl="mode"]'), modes.map((m) => m.label), (i) => {
            const m = modes[i];
            const comment = (c) => (c ? `<span class="code-comment">${esc(c)}</span>\n` : "");
            root.querySelector('[data-out="code"]').innerHTML =
                `${comment(m.c1)}const RETRY_LIMIT = 5;\n\n${comment(m.c2)}function backoffDelay(attempt) {\n  return Math.min(30_000, 2 ** attempt * 100);\n}`;
            root.querySelector('[data-out="text"]').textContent = m.text;
            root.querySelector('[data-out="flag"]').textContent = m.flag || "";
        }, 1);
    };

    // ── 14. Choosing names ─────────────────────────────────────────────────
    VISUALS[14] = (root) => {
        const examples = [
            {
                label: "A variable",
                meanings: ["Items in the cart", "Retries so far", "Max retries allowed", "Email retries", "Payment retries", "Seconds until the next retry"],
                names: [
                    { name: "x", keep: [0, 1, 2, 3, 4, 5] },
                    { name: "count", keep: [0, 1, 2, 3, 4] },
                    { name: "retries", keep: [1, 2, 3, 4] },
                    { name: "retryCount", keep: [1, 3, 4] },
                    { name: "paymentRetryCount", keep: [4] },
                ],
            },
            {
                label: "An event topic",
                meanings: ["Order created", "Order shipped", "Order cancelled", "Customer updated", "Stock changed", "Payment failed"],
                names: [
                    { name: "events", keep: [0, 1, 2, 3, 4, 5] },
                    { name: "updates", keep: [0, 1, 2, 3, 4] },
                    { name: "orders", keep: [0, 1, 2, 5] },
                    { name: "order-updates", keep: [0, 1, 2] },
                    { name: "order-shipped", keep: [1] },
                ],
            },
        ];
        let example = examples[0];

        root.innerHTML = `
            <div class="viz-controls"><div class="viz-toggles" role="group" aria-label="Example" data-ctl="example"></div></div>
            <label class="viz-slider">Name: <code class="name-preview" data-out="name"></code>
                <input type="range" min="0" max="4" value="0">
            </label>
            <p class="viz-stat" data-out="count"></p>
            <div class="meaning-cloud" data-out="cloud"></div>
            <p class="viz-caption" data-out="caption"></p>`;
        const input = root.querySelector("input");

        function draw() {
            const n = example.names[Number(input.value)];
            const keep = new Set(n.keep);
            root.querySelector('[data-out="name"]').textContent = n.name;
            root.querySelector('[data-out="count"]').innerHTML = `<strong>${keep.size}</strong> plausible ${keep.size === 1 ? "meaning" : "meanings"}`;
            root.querySelector('[data-out="cloud"]').innerHTML = example.meanings.map((m, i) =>
                `<span class="meaning ${keep.has(i) ? "" : "is-ruled-out"}">${m}</span>`).join("");
            root.querySelector('[data-out="caption"]').textContent = keep.size === 1
                ? "Precise enough that a reader's first guess is right, and still short."
                : keep.size >= 5 ? "Red flag: vague name. A reader has to go find out what it holds." : "Better, but a reader could still guess wrong.";
        }
        input.addEventListener("input", draw);
        toggles(root.querySelector('[data-ctl="example"]'), examples.map((e) => e.label), (i) => { example = examples[i]; input.value = 0; draw(); });
    };

    // ── 15. Write the comments first ───────────────────────────────────────
    VISUALS[15] = (root) => {
        const steps = [
            {
                title: "Write the interface comment before any code",
                code: "/**\n * POST /reports/generate\n * Generates a report. If async is true, returns a job ID, unless\n * emailTo is set, in which case it emails the file and returns\n * nothing, except when format is \"pdf\" and the report has more\n * than 10k rows, which is always async. callbackUrl is called\n * when done if async is true and pollInterval is not set …\n */",
                text: "Before building a reporting endpoint, try to describe how to use it.",
            },
            {
                title: "Red flag: hard to describe",
                code: "/**\n * POST /reports/generate\n * Generates a report. <mark>If async is true, returns a job ID, unless\n * emailTo is set</mark>, in which case it emails the file and returns\n * nothing, <mark>except when format is \"pdf\" and the report has more\n * than 10k rows</mark>, which is always async. <mark>callbackUrl is called\n * when done if async is true and pollInterval is not set</mark> …\n */",
                text: "Every “unless” and “except” is a special case callers have to learn. The comment is telling you the design is wrong, and no code exists yet.",
            },
            {
                title: "Redesign until the comment is short",
                code: "/**\n * POST /reports → { id }\n * Starts building a report. Always returns immediately.\n *\n * GET /reports/{id} → { status, downloadUrl? }\n * downloadUrl is set once status is \"ready\". Links last 24 hours.\n */",
                text: "One way in, one way to check. Email and callbacks become separate features built on top, not flags on the same call.",
            },
            {
                title: "Now write the code",
                code: "/**\n * POST /reports → { id }\n * Starts building a report. Always returns immediately.\n *\n * GET /reports/{id} → { status, downloadUrl? }\n * downloadUrl is set once status is \"ready\". Links last 24 hours.\n */\nrouter.post(\"/reports\", async (req, res) => {\n  const id = await reports.start(req.body);\n  res.status(202).json({ id });\n});",
                text: "The comment is already written, describes the design rather than reconstructing it afterward, and became the API doc. That's API-first design.",
            },
        ];
        let i = 0;

        root.innerHTML = `
            <p class="viz-step-count" data-out="count"></p>
            <h3 class="viz-step-title" data-out="title"></h3>
            <pre class="viz-code" data-out="code"></pre>
            <p class="viz-caption" data-out="text"></p>
            <div class="viz-stepper">
                <button type="button" class="viz-button" data-act="prev">← Back</button>
                <button type="button" class="viz-button" data-act="next">Next →</button>
            </div>`;

        function draw() {
            const s = steps[i];
            root.querySelector('[data-out="count"]').textContent = `Step ${i + 1} of ${steps.length}`;
            root.querySelector('[data-out="title"]').textContent = s.title;
            // Escape the code but keep the <mark> highlights.
            root.querySelector('[data-out="code"]').innerHTML = esc(s.code).replace(/&lt;(\/?)mark&gt;/g, "<$1mark>");
            root.querySelector('[data-out="text"]').textContent = s.text;
            root.querySelector('[data-act="prev"]').disabled = i === 0;
            root.querySelector('[data-act="next"]').disabled = i === steps.length - 1;
        }
        root.querySelector('[data-act="prev"]').addEventListener("click", () => { i = Math.max(0, i - 1); draw(); });
        root.querySelector('[data-act="next"]').addEventListener("click", () => { i = Math.min(steps.length - 1, i + 1); draw(); });
        draw();
    };

    // ── 16. Modifying existing code ────────────────────────────────────────
    VISUALS[16] = (root) => {
        const tactical = ["Add isLegacy flag to Order", "Copy tax logic into refunds", "Special-case customer #4512", "Add a 4th boolean parameter", "Add /v2 endpoint next to /v1", "Comment out the failing check"];
        const strategic = ["Move tax logic into one module", "Replace flags with an OrderType", "Update the interface comment", "Migrate callers and delete /v1", "Rename to match what it does", "Fold the special case into the rules"];
        let commits = [];

        root.innerHTML = `
            <p class="viz-intro">Every change is a choice: the smallest patch, or a change that leaves the design as if it had been planned this way.</p>
            <div class="viz-controls">
                <button type="button" class="viz-button" data-act="tactical">Make a tactical patch</button>
                <button type="button" class="viz-button viz-button-alt" data-act="strategic">Make a strategic change</button>
                <button type="button" class="viz-link" data-act="reset">Reset</button>
            </div>
            <div class="meters">
                <div class="meter"><span class="meter-label">Design health</span><div class="meter-track"><div class="meter-fill meter-health"></div></div><span class="meter-value" data-out="health"></span></div>
                <div class="meter"><span class="meter-label">Days spent</span><div class="meter-track"><div class="meter-fill meter-time"></div></div><span class="meter-value" data-out="days"></span></div>
            </div>
            <ol class="commit-log" data-out="log"></ol>
            <p class="viz-caption" data-out="caption"></p>`;

        function draw() {
            const health = commits.reduce((h, c) => Math.max(0, Math.min(100, h + (c.strategic ? 6 : -12))), 100);
            const days = commits.reduce((d, c) => d + (c.strategic ? 3 : 1), 0);
            const bar = root.querySelector(".meter-health");
            bar.style.width = `${health}%`;
            bar.classList.toggle("is-bad", health < 50);
            root.querySelector(".meter-time").style.width = `${Math.min(100, days * 3)}%`;
            root.querySelector('[data-out="health"]').textContent = `${health}%`;
            root.querySelector('[data-out="days"]').textContent = days;
            root.querySelector('[data-out="log"]').innerHTML = commits.slice().reverse().map((c) =>
                `<li class="commit ${c.strategic ? "commit-strategic" : "commit-tactical"}"><code>${c.sha}</code> ${c.msg}</li>`).join("");
            root.querySelector('[data-out="caption"]').textContent = !commits.length
                ? "Start making changes."
                : health < 40 ? "Each patch was the fastest option at the time. Now every change has to work around all of them."
                    : "Strategic changes cost more days each, but the code stays in shape for the next person.";
        }
        const add = (isStrategic) => {
            const pool = isStrategic ? strategic : tactical;
            const count = commits.filter((c) => c.strategic === isStrategic).length;
            commits.push({ strategic: isStrategic, msg: pool[count % pool.length], sha: Math.random().toString(16).slice(2, 9) });
            draw();
        };
        root.querySelector('[data-act="tactical"]').addEventListener("click", () => add(false));
        root.querySelector('[data-act="strategic"]').addEventListener("click", () => add(true));
        root.querySelector('[data-act="reset"]').addEventListener("click", () => { commits = []; draw(); });
        draw();
    };

    // ── 17. Consistency: spot the odd endpoint ─────────────────────────────
    VISUALS[17] = (root) => {
        const endpoints = [
            { text: "GET /orders/{id}" },
            { text: "GET /customers/{id}" },
            { text: "GET /getInvoice?id={id}", odd: "Verb in the path and the ID in a query string. Every other resource uses GET /things/{id}." },
            { text: "GET /orders/{id}/items" },
            { text: "POST /orders" },
            { text: "POST /customer/create", odd: "Singular resource name and a verb. The convention is POST /customers." },
            { text: "GET /products/{id}" },
            { text: "DELETE /orders/{id}" },
            { text: "GET /shipments/{id}" },
            { text: "GET /Products/{id}/Reviews", odd: "Capitalized path segments. Everything else is lowercase." },
        ];
        const found = new Set();
        let misses = 0;

        root.innerHTML = `
            <p class="viz-intro">Three of these endpoints break the API's conventions. Find them.</p>
            <ul class="endpoint-grid">${endpoints.map((e, i) => `<li><button type="button" class="endpoint" data-i="${i}"><code>${esc(e.text)}</code></button></li>`).join("")}</ul>
            <p class="viz-stat" data-out="score"></p>
            <ul class="fact-list" data-out="found"></ul>
            <p class="viz-caption" data-out="caption"></p>`;

        function update() {
            const total = endpoints.filter((e) => e.odd).length;
            root.querySelector('[data-out="score"]').innerHTML = `<strong>${found.size}</strong> of ${total} found${misses ? ` · ${misses} wrong ${misses === 1 ? "guess" : "guesses"}` : ""}`;
            root.querySelector('[data-out="found"]').innerHTML = [...found].map((i) => `<li><code>${esc(endpoints[i].text)}</code>: ${endpoints[i].odd}</li>`).join("");
            root.querySelector('[data-out="caption"]').textContent = found.size === total
                ? "Each one cost you a second look. In a consistent API, knowing one endpoint lets you guess the rest. Teams enforce this with API style guides and linters."
                : "";
        }
        root.querySelectorAll(".endpoint").forEach((button) => button.addEventListener("click", () => {
            const i = Number(button.dataset.i);
            if (endpoints[i].odd) { found.add(i); button.classList.add("is-bad"); }
            else if (!button.classList.contains("is-ok")) { misses++; button.classList.add("is-ok"); }
            button.disabled = true;
            update();
        }));
        update();
    };

    // ── 18. Code should be obvious ─────────────────────────────────────────
    VISUALS[18] = (root) => {
        const examples = [
            {
                label: "Generic container",
                before: "function saveDraft(doc) {\n  // ...\n  return [true, 3];\n}\n\nconst [ok, n] = saveDraft(doc);",
                after: "function saveDraft(doc) {\n  // ...\n  return { saved: true, retriesUsed: 3 };\n}\n\nconst { saved, retriesUsed } = saveDraft(doc);",
                why: "What's 3? A tuple hides meaning that a named field gives away for free.",
            },
            {
                label: "Event-driven flow",
                before: "bus.on(\"order.shipped\", sendTrackingEmail);",
                after: "// Published by Orders when the warehouse marks an order shipped\n// (see docs/events.md). Can arrive more than once; the handler\n// skips orders that already have a tracking email.\nbus.on(\"order.shipped\", sendTrackingEmail);",
                why: "With events, the reader can't follow the call. Who publishes this, and when? Say it in a comment, and keep an event catalog for the whole system.",
            },
            {
                label: "Breaks expectations",
                before: "async function getUser(id) {\n  let user = await db.users.find(id);\n  if (!user) {\n    user = await db.users.create({ id });\n    await email.sendWelcome(user);\n  }\n  return user;\n}",
                after: "async function findUser(id) {\n  return db.users.find(id);\n}\n\nasync function signUpUser(id) {\n  const user = await db.users.create({ id });\n  await email.sendWelcome(user);\n  return user;\n}",
                why: "Nobody expects a getter to create accounts and send emails. Code that does more than its name says is a trap for the next caller.",
            },
        ];
        let example = examples[0];
        let after = false;

        root.innerHTML = `
            <div class="viz-controls">
                <div class="viz-toggles" role="group" aria-label="Example" data-ctl="example"></div>
                <div class="viz-toggles viz-toggles-small" role="group" aria-label="Version" data-ctl="after"></div>
            </div>
            <pre class="viz-code" data-out="code"></pre>
            <p class="viz-caption" data-out="why"></p>`;

        function draw() {
            root.querySelector('[data-out="code"]').innerHTML = esc(after ? example.after : example.before)
                .replace(/(\/\/[^\n]*)/g, '<span class="code-comment">$1</span>');
            root.querySelector('[data-out="why"]').innerHTML = after
                ? "A reader's first guess is now the right one."
                : `<strong>Red flag: nonobvious code.</strong> ${example.why}`;
        }
        toggles(root.querySelector('[data-ctl="example"]'), examples.map((e) => e.label), (i) => { example = examples[i]; draw(); });
        toggles(root.querySelector('[data-ctl="after"]'), ["Nonobvious", "Obvious"], (i) => { after = i === 1; draw(); });
    };

    // ── 19. Software trends ────────────────────────────────────────────────
    VISUALS[19] = (root) => {
        const trends = [
            { name: "Inheritance", helps: "Interface inheritance lets one interface cover many implementations, so learning it once pays off many times.", watch: "Implementation inheritance ties parent and child classes together. Changing the parent can break children you didn't know existed." },
            { name: "Agile", helps: "Building in small increments surfaces design problems early, while they're cheap to fix.", watch: "Increments of features, not abstractions, push teams toward tactical programming. Grow abstractions, don't just stack features." },
            { name: "Unit tests", helps: "Good tests make refactoring safe, which is what lets you keep improving the design.", watch: "Tests coupled to internals make every redesign twice the work." },
            { name: "Test-driven development", helps: "Tests come first, so the code is always testable.", watch: "It focuses on making the next test pass, not on finding the best design. Ousterhout prefers designing in larger chunks." },
            { name: "Design patterns", helps: "A pattern that truly fits is a well-understood, proven solution.", watch: "Forcing a pattern where it doesn't fit adds layers and interfaces without hiding anything." },
            { name: "Getters and setters", helps: "They give you a place to add checks or logging later.", watch: "Exposing every field through accessors makes classes shallow and leaks their internals." },
            { name: "Microservices (same lens)", helps: "Teams deploy independently, and a service boundary can hide a lot behind a small API.", watch: "Shallow services just move complexity onto the network: more calls, partial failures and changes that need several teams." },
        ];

        root.innerHTML = `
            <p class="viz-intro">Every trend has a side that reduces complexity and a side that can add it. Flip between them.</p>
            <div class="viz-controls"><div class="viz-toggles viz-toggles-small" role="group" aria-label="Show" data-ctl="side"></div></div>
            <ul class="trend-grid" data-out="grid"></ul>`;

        toggles(root.querySelector('[data-ctl="side"]'), ["Where it helps", "Watch out for"], (side) => {
            root.querySelector('[data-out="grid"]').innerHTML = trends.map((t) =>
                `<li class="trend ${side ? "trend-watch" : "trend-helps"}"><span class="trend-name">${t.name}</span><p>${side ? t.watch : t.helps}</p></li>`).join("");
        });
    };

    // ── 20. Designing for performance ──────────────────────────────────────
    VISUALS[20] = (root) => {
        const segments = [
            { name: "Auth check", ms: 4 },
            { name: "Validate input", ms: 2 },
            { name: "Price calculation", ms: 3 },
            { name: "Load order items", ms: 140, fixed: 12, fixName: "Load order items (1 batched query)" },
            { name: "Serialize JSON", ms: 6 },
            { name: "Logging", ms: 2 },
        ];
        let stage = 0; // 0 guess, 1 measured, 2 fixed
        let guess = null;

        root.innerHTML = `
            <p class="viz-intro">A checkout request is slow. Before measuring, which step do you think is the problem?</p>
            <div class="guess-row" data-out="guesses"></div>
            <div class="latency" data-out="bars"></div>
            <p class="viz-stat" data-out="total"></p>
            <p class="viz-caption" data-out="caption"></p>
            <div class="viz-controls" data-out="actions"></div>`;

        function draw() {
            const total = segments.reduce((sum, s) => sum + (stage === 2 && s.fixed ? s.fixed : s.ms), 0);
            root.querySelector('[data-out="guesses"]').innerHTML = stage === 0
                ? segments.map((s, i) => `<button type="button" class="viz-toggle" data-guess="${i}" aria-pressed="${guess === i}">${s.name}</button>`).join("")
                : "";
            root.querySelector('[data-out="bars"]').innerHTML = segments.map((s, i) => {
                const ms = stage === 2 && s.fixed ? s.fixed : s.ms;
                const width = stage === 0 ? 100 / segments.length : (ms / 157) * 100;
                return `<div class="latency-row ${stage > 0 && s.fixed ? "is-hot" : ""} ${guess === i ? "is-guess" : ""}">
                    <span class="latency-name">${stage === 2 && s.fixName ? s.fixName : s.name}</span>
                    <span class="latency-track"><span class="latency-bar" style="width:${width}%"></span></span>
                    <span class="latency-ms">${stage === 0 ? "?" : `${ms} ms`}</span>
                </div>`;
            }).join("");
            root.querySelector('[data-out="total"]').innerHTML = stage === 0 ? "" : `Total: <strong>${total} ms</strong>`;
            root.querySelector('[data-out="caption"]').innerHTML =
                stage === 0 ? ""
                    : stage === 1 ? `${guess === 3 ? "Good guess." : "Intuition is often wrong, which is why you measure first."} Loading items runs one database query per item, an N+1 query. Every other step is noise.`
                        : "One batched query fixes the critical path. The rest stays clean and simple, because it was never the problem. Rewriting it for speed would only have added complexity.";
            const actions = root.querySelector('[data-out="actions"]');
            actions.innerHTML = stage === 0
                ? `<button type="button" class="viz-button" data-act="measure" ${guess === null ? "disabled" : ""}>Measure it</button>`
                : stage === 1 ? `<button type="button" class="viz-button" data-act="fix">Fix the critical path</button>`
                    : `<button type="button" class="viz-link" data-act="reset">Start over</button>`;
        }
        root.addEventListener("click", (event) => {
            const g = event.target.closest("[data-guess]");
            const act = event.target.closest("[data-act]");
            if (g) guess = Number(g.dataset.guess);
            else if (act && act.dataset.act === "measure") stage = 1;
            else if (act && act.dataset.act === "fix") stage = 2;
            else if (act && act.dataset.act === "reset") { stage = 0; guess = null; }
            else return;
            draw();
        });
        draw();
    };

    // ── 21. Decide what matters ────────────────────────────────────────────
    VISUALS[21] = (root) => {
        const items = [
            { text: "An order total is never wrong", matters: true, where: "Emphasize it: one module owns money math, it's covered by tests and named in the API." },
            { text: "Which JSON library the service uses", matters: false, where: "Hide it inside the service. Nobody outside should be able to tell." },
            { text: "What happens when a payment call times out", matters: true, where: "Emphasize it: document it in the API reference and design for it (idempotency keys)." },
            { text: "The folder layout inside one service", matters: false, where: "Follow the convention and move on. It's not worth a design review." },
            { text: "The shape of the public API", matters: true, where: "Emphasize it: it's the hardest thing to change later, so design it twice and write its docs first." },
            { text: "Variable names in a test helper", matters: false, where: "Keep them sensible, but it's not where design effort pays off." },
        ];
        const picks = items.map(() => null);

        root.innerHTML = `
            <p class="viz-intro">Sort each decision. The goal is a short list of things that matter, made prominent, with everything else hidden.</p>
            <ul class="sort-list">${items.map((it, i) => `
                <li class="sort-item" data-i="${i}">
                    <span class="sort-text">${it.text}</span>
                    <span class="quiz-actions">
                        <button type="button" class="viz-toggle" data-pick="1">Matters</button>
                        <button type="button" class="viz-toggle" data-pick="0">Doesn't</button>
                    </span>
                    <p class="quiz-answer" hidden></p>
                </li>`).join("")}
            </ul>
            <p class="viz-stat" data-out="score"></p>`;

        function update() {
            const answered = picks.filter((p) => p !== null).length;
            const right = picks.filter((p, i) => p !== null && p === items[i].matters).length;
            root.querySelector('[data-out="score"]').innerHTML = answered === items.length
                ? `<strong>${right}</strong> of ${items.length} match. ${items.filter((it) => it.matters).length} things matter here; the rest should be invisible from outside.`
                : "";
        }
        root.querySelectorAll(".sort-item").forEach((row) => {
            const i = Number(row.dataset.i);
            row.querySelectorAll("[data-pick]").forEach((button) => button.addEventListener("click", () => {
                picks[i] = button.dataset.pick === "1";
                row.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
                const answer = row.querySelector(".quiz-answer");
                answer.hidden = false;
                answer.className = `quiz-answer ${picks[i] === items[i].matters ? "is-ok" : "is-bad"}`;
                answer.textContent = items[i].where;
                update();
            }));
        });
        update();
    };

    // ── 22. Conclusion: the red-flag checklist ─────────────────────────────
    VISUALS[22] = (root) => {
        root.innerHTML = `
            <p class="viz-intro">The book's red flags, as a checklist for your next design review. Check the ones you can spot in a system you work on, and open a chapter for the fix.</p>
            <ul class="flag-checklist">${RED_FLAGS.map((f, i) => `
                <li>
                    <label><input type="checkbox" data-i="${i}"> <span class="flag-name">${f.name}</span></label>
                    <span class="flag-text">${f.text} <a href="#ch-${f.ch}">Ch. ${f.ch} →</a></span>
                </li>`).join("")}
            </ul>
            <p class="viz-stat" data-out="count"></p>`;

        const update = () => {
            const n = root.querySelectorAll("input:checked").length;
            root.querySelector('[data-out="count"]').innerHTML = n
                ? `<strong>${n}</strong> red ${n === 1 ? "flag" : "flags"} spotted. Each one is complexity you can now name and remove.`
                : "None checked yet.";
        };
        root.querySelectorAll("input").forEach((box) => box.addEventListener("change", update));
        update();
    };

    window.VISUALS = VISUALS;
})();
