// The 8 patterns, grouped by the question each one answers.
window.PATTERN_CATEGORIES = {
    deploy: "How the system is split up and deployed",
    talk: "How the pieces talk",
    code: "How the code is organized",
};

// Rough monthly cloud bill for a small production app. Level 0 means the
// pattern only changes how code is arranged, so it adds nothing to hosting.
window.COST_LEVELS = [
    { mark: "Free", label: "Code only, no extra hosting" },
    { mark: "$", label: "Tens of dollars a month" },
    { mark: "$$", label: "Hundreds of dollars a month" },
    { mark: "$$$", label: "Thousands of dollars a month and up" },
];

// Each pattern's `stack` is a list of [label, text] rows, and `cost` places it
// on the COST_LEVELS scale with a typical range and what drives it.
window.PATTERNS = {
    "monolith": {
        name: "Monolith",
        category: "deploy",
        summary: "One codebase deployed as one unit. Simple to build, test and ship. It gets harder to change as the team and codebase grow.",
        stack: [
            ["Build with", "One full-stack framework: Rails, Django, Laravel, Spring Boot, ASP.NET or Node (Express, NestJS)."],
            ["Host on", "A platform-as-a-service such as Render, Fly.io, Railway or Heroku, or a single VM on AWS EC2 or DigitalOcean."],
            ["Store data in", "One managed Postgres or MySQL database."],
            ["Also needed", "One CI pipeline (GitHub Actions) and error tracking (Sentry)."],
        ],
        cost: {
            level: 1,
            range: "About $10–$150/month",
            drivers: "The app instance size and the managed database. To scale, you run more copies of the whole app.",
        },
    },
    "microservices": {
        name: "Microservices",
        category: "deploy",
        summary: "Many small services, each owned and deployed independently. Teams can move separately, at the cost of network calls and more infrastructure to run.",
        stack: [
            ["Build with", "Go, Java or Kotlin (Spring), Node or .NET, chosen per service, talking over REST or gRPC."],
            ["Host on", "Kubernetes (EKS, GKE, AKS), or simpler container platforms such as AWS ECS or Google Cloud Run, behind an API gateway."],
            ["Store data in", "A separate database per service, often plus Kafka or a managed queue between them."],
            ["Also needed", "A pipeline per service, distributed tracing (OpenTelemetry, Datadog, Grafana) and centralized logging."],
        ],
        cost: {
            level: 3,
            range: "About $1,000–$10,000+/month",
            drivers: "Cluster nodes, a database per service and observability tools. The platform team that runs it all usually costs more than the cloud bill.",
        },
    },
    "serverless": {
        name: "Serverless",
        category: "deploy",
        summary: "Functions run on demand by a cloud provider. You pay per use and don't manage servers, but you work within cold starts and time limits.",
        stack: [
            ["Build with", "Node, Python or Go functions, deployed with SST, the Serverless Framework or AWS SAM."],
            ["Host on", "AWS Lambda, Google Cloud Functions, Azure Functions, or edge platforms such as Netlify Functions, Vercel and Cloudflare Workers."],
            ["Store data in", "DynamoDB, Firestore or object storage (S3), or a serverless Postgres such as Neon."],
            ["Also needed", "An API gateway or function URLs, and the provider's logs (CloudWatch) for debugging."],
        ],
        cost: {
            level: 1,
            range: "About $0–$50/month at low traffic",
            drivers: "You pay per request and per second of compute, and free tiers cover most small sites. Under heavy, steady traffic a plain server can be cheaper.",
        },
    },
    "client-server": {
        name: "Client-server",
        category: "talk",
        summary: "Clients (browsers, apps) send requests to a server, which holds the data and logic and responds.",
        stack: [
            ["Clients", "Web (React, Vue, Svelte or plain HTML) and native apps (SwiftUI, Kotlin, React Native, Flutter)."],
            ["Protocol", "REST or GraphQL over HTTPS with JSON, plus token-based sign-in (OAuth, JWT) from Auth0, Clerk or Cognito."],
            ["Host on", "A CDN for static files (Cloudflare, CloudFront, Netlify) and a PaaS or VM for the server."],
            ["Store data in", "Postgres or MySQL on the server side, and a local cache on the client."],
        ],
        cost: {
            level: 1,
            range: "About $0–$100/month",
            drivers: "Server size and bandwidth. Static front ends on a CDN are often free, and auth providers charge by monthly active users once past their free tier.",
        },
    },
    "event-driven": {
        name: "Event-driven",
        category: "talk",
        summary: "Components publish facts about what happened, and other components react to them. The publisher doesn't know who's listening.",
        stack: [
            ["Broker (managed)", "AWS SNS + SQS or EventBridge, Google Pub/Sub, or Azure Service Bus."],
            ["Broker (heavier)", "Apache Kafka (Confluent Cloud, AWS MSK) for high volume and replay, or RabbitMQ."],
            ["Build with", "Producers and consumers in any language, with a shared event format such as CloudEvents or a schema registry."],
            ["Also needed", "Dead-letter queues for failed messages and tracing with correlation IDs (OpenTelemetry)."],
        ],
        cost: {
            level: 2,
            range: "About $5–$500/month",
            drivers: "Managed queues charge per million messages, which is cheap at small scale. Managed Kafka clusters are the big jump, often starting in the hundreds per month.",
        },
    },
    "three-tier": {
        name: "Three-tier",
        category: "code",
        summary: "Presentation, business logic and data are kept in separate layers that only talk to their neighbors.",
        stack: [
            ["Presentation", "React, Angular or server-rendered templates, served from a CDN or the web tier."],
            ["Logic", "An app framework such as Spring, ASP.NET, Django or NestJS, on app servers behind a load balancer."],
            ["Data", "A managed database (AWS RDS, Google Cloud SQL, Azure SQL) reached through an ORM such as Hibernate, Entity Framework or Prisma."],
        ],
        cost: {
            level: 2,
            range: "About $50–$600/month when tiers are hosted separately",
            drivers: "The load balancer and a production database with backups are fixed costs. Each tier can then be scaled on its own. As layers inside one app, it costs nothing extra.",
        },
    },
    "mvc": {
        name: "Model-View-Controller",
        short: "MVC",
        category: "code",
        summary: "Model (data and rules), View (what the user sees) and Controller (handles input) are kept apart inside an app.",
        stack: [
            ["Server frameworks", "Rails, Django (which calls it MTV), Laravel, ASP.NET MVC and Spring MVC."],
            ["Client side", "Older single-page frameworks such as Backbone and AngularJS. Apple's UIKit also follows MVC."],
            ["Host on", "Wherever the app already runs, usually a monolith on a PaaS."],
        ],
        cost: {
            level: 0,
            range: "No extra hosting cost",
            drivers: "MVC is how code is arranged inside one app, so it doesn't change the bill. The frameworks are free and open source.",
        },
    },
    "hexagonal": {
        name: "Hexagonal (Ports and Adapters)",
        short: "Hexagonal",
        category: "code",
        summary: "Core logic sits in the middle and reaches the outside world (databases, payment providers, UIs) only through interfaces called ports, so adapters can be swapped.",
        stack: [
            ["Build with", "Any language with interfaces: Java or Kotlin, C#, TypeScript, Go. Dependency-injection frameworks (Spring, NestJS, .NET) wire in the adapters."],
            ["Test with", "Fake in-memory adapters for core tests, and Testcontainers to test real adapters against real databases."],
            ["Host on", "Unchanged. The app runs wherever it already did."],
        ],
        cost: {
            level: 0,
            range: "No extra hosting cost",
            drivers: "The cost is design time for the ports. Services behind the adapters bill as usual, for example card processors charging around 3% per transaction.",
        },
    },
};
