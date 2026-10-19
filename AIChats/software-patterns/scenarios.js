// Each scenario is a request a client or manager might bring you, plus the
// diagram and steps that walk through the architecture that fits it.
// Node kinds: client, service, store, bus. A node with `appearsAt` stays
// hidden until that step index.
window.SCENARIOS = [
    {
        id: "order-notifications",
        title: "Shipping notifications",
        requester: "An e-commerce operations manager",
        brief: "When the warehouse marks an order as shipped, the customer should get an email and a text with the tracking number.",
        requirements: [
            "Email and SMS go out within a minute of shipping.",
            "A slow or failing SMS provider can't hold up the warehouse.",
            "Marketing has already asked about shipment reports, so more reactions are coming.",
        ],
        patterns: ["event-driven"],
        viewBox: "0 0 680 360",
        diagramLabel: "The Order Service publishes an OrderShipped event to an event bus. Email, SMS and Analytics services subscribe to it.",
        nodes: [
            { id: "warehouse", label: "Warehouse", kind: "client", x: 90, y: 180 },
            { id: "orders", label: "Order Service", kind: "service", x: 260, y: 180 },
            { id: "db", label: "Orders DB", kind: "store", x: 260, y: 300 },
            { id: "bus", label: "Event bus", kind: "bus", x: 430, y: 180 },
            { id: "email", label: "Email Service", kind: "service", x: 590, y: 80 },
            { id: "sms", label: "SMS Service", kind: "service", x: 590, y: 180 },
            { id: "analytics", label: "Analytics", kind: "service", x: 590, y: 280, appearsAt: 4 },
        ],
        edges: [
            ["warehouse", "orders"],
            ["orders", "db"],
            ["orders", "bus"],
            ["bus", "email"],
            ["bus", "sms"],
            ["bus", "analytics"],
        ],
        steps: [
            {
                title: "Start with the trigger",
                nodes: ["warehouse", "orders", "db"],
                edges: [["warehouse", "orders"], ["orders", "db"]],
                text: "A warehouse worker clicks “Mark shipped” in the admin tool. The Order Service saves the new status to its database. Up to here this is ordinary request/response: one caller, one answer.",
            },
            {
                title: "Publish, don't call",
                nodes: ["orders", "bus"],
                edges: [["orders", "bus"]],
                text: "Instead of running the email and SMS code itself, the Order Service publishes one fact, OrderShipped, with the order ID and tracking number. It goes to an event bus, a message broker such as a queue or pub/sub topic. The service replies to the warehouse right away and doesn't know who's listening.",
                book: {
                    chapter: "Ch. 5 · Information Hiding",
                    text: "The Order Service knows nothing about notification providers, templates or phone numbers. All of that stays hidden behind the event.",
                },
            },
            {
                title: "Subscribers react on their own",
                nodes: ["bus", "email", "sms"],
                edges: [["bus", "email"], ["bus", "sms"]],
                text: "The Email and SMS services each subscribe to OrderShipped and get their own copy of the event. They run independently, so the email can go out while the SMS is still waiting on its provider.",
            },
            {
                title: "Failures stay contained",
                nodes: ["bus", "sms"],
                edges: [["bus", "sms"]],
                text: "Say the SMS provider is down. The event stays in the SMS Service's queue and is retried until it's delivered. The order is still marked shipped, the email still went out, and the warehouse never saw an error.",
                book: {
                    chapter: "Ch. 8 · Pull Complexity Downwards",
                    text: "Retries and delivery guarantees live in the bus and the subscriber, so the Order Service never has to handle “SMS is down.”",
                },
            },
            {
                title: "New features without touching orders",
                nodes: ["bus", "analytics"],
                edges: [["bus", "analytics"]],
                text: "Marketing wants shipment reports. You add an Analytics service that subscribes to the same event. The Order Service isn't edited, retested or redeployed. That's the main payoff of event-driven design.",
                book: {
                    chapter: "Ch. 2 · The Nature of Complexity",
                    text: "This avoids change amplification. A new feature is one new module instead of edits spread across existing ones.",
                },
            },
        ],
        whyNot: {
            title: "Why not have the Order Service call email and SMS directly?",
            text: "With two notifications and one small team, that's simpler. You can read the whole flow in one function, and there's no broker to run. But every new reaction means editing the Order Service, and a slow provider makes “Mark shipped” slow.",
            tradeoff: "Event-driven design costs you traceability. The flow is spread across services, delivery is eventually consistent, and you need logging that can follow one event from service to service.",
        },
    },
];
