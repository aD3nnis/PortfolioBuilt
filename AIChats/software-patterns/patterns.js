// The 8 patterns, grouped by the question each one answers.
window.PATTERN_CATEGORIES = {
    deploy: "How the system is split up and deployed",
    talk: "How the pieces talk",
    code: "How the code is organized",
};

window.PATTERNS = {
    "monolith": {
        name: "Monolith",
        category: "deploy",
        summary: "One codebase deployed as one unit. Simple to build, test and ship. It gets harder to change as the team and codebase grow.",
    },
    "microservices": {
        name: "Microservices",
        category: "deploy",
        summary: "Many small services, each owned and deployed independently. Teams can move separately, at the cost of network calls and more infrastructure to run.",
    },
    "serverless": {
        name: "Serverless",
        category: "deploy",
        summary: "Functions run on demand by a cloud provider. You pay per use and don't manage servers, but you work within cold starts and time limits.",
    },
    "client-server": {
        name: "Client-server",
        category: "talk",
        summary: "Clients (browsers, apps) send requests to a server, which holds the data and logic and responds.",
    },
    "event-driven": {
        name: "Event-driven",
        category: "talk",
        summary: "Components publish facts about what happened, and other components react to them. The publisher doesn't know who's listening.",
    },
    "three-tier": {
        name: "Three-tier",
        category: "code",
        summary: "Presentation, business logic and data are kept in separate layers that only talk to their neighbors.",
    },
    "mvc": {
        name: "Model-View-Controller",
        short: "MVC",
        category: "code",
        summary: "Model (data and rules), View (what the user sees) and Controller (handles input) are kept apart inside an app.",
    },
    "hexagonal": {
        name: "Hexagonal (Ports and Adapters)",
        short: "Hexagonal",
        category: "code",
        summary: "Core logic sits in the middle and reaches the outside world (databases, payment providers, UIs) only through interfaces called ports, so adapters can be swapped.",
    },
};
