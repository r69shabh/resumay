import { type ResumeContent } from "./resume";

export type TemplateCategory = "all" | "engineering" | "business" | "product" | "student";

export type ResumeTemplate = {
  id: string;
  name: string;
  category: "engineering" | "business" | "product" | "student";
  roleTag: string;
  badge: string;
  description: string;
  highlights: string[];
  layoutInfo: {
    typography: "Serif (Computer Modern)" | "Modern Sans-Serif";
    headerStyle: "Centered Classic" | "Left-Aligned Modern" | "Split Compact";
    priority: "Experience First" | "Skills First" | "Education First" | "Balanced";
    sequence: string[];
  };
  content: ResumeContent;
};

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "swe",
    name: "Software Engineer",
    category: "engineering",
    roleTag: "SWE",
    badge: "Most Popular",
    description: "Battle-tested Silicon Valley engineering standard with centered header and experience-first flow.",
    highlights: ["Experience First", "Classic Serif", "Centered Header", "Quantified Metrics"],
    layoutInfo: {
      typography: "Serif (Computer Modern)",
      headerStyle: "Centered Classic",
      priority: "Experience First",
      sequence: ["Experience", "Projects", "Technical Skills", "Education"],
    },
    content: {
      template: "swe",
      name: "Alex Morgan",
      phone: "+1 (555) 234-5678",
      email: "alex.morgan@example.com",
      location: "San Francisco, CA",
      links: [
        { label: "GitHub", url: "https://github.com/alexmorgan" },
        { label: "LinkedIn", url: "https://linkedin.com/in/alexmorgan" },
        { label: "Portfolio", url: "https://alexmorgan.dev" },
      ],
      summary: "",
      education: [
        {
          school: "University of California, Berkeley",
          degree: "B.S. in Computer Science, Magna Cum Laude",
          location: "Berkeley, CA",
          start: "2018",
          end: "2022",
          grade: "3.85 / 4.0",
        },
      ],
      experience: [
        {
          title: "Senior Software Engineer",
          company: "CloudScale Technologies",
          location: "San Francisco, CA",
          start: "Jun 2022",
          end: "Present",
          bullets:
            "Architected distributed caching and job queue with Go and Redis, reducing p99 API response times from 320ms to 42ms across 15M daily requests.\nSpearheaded migration of legacy monolith to containerized Kubernetes services on AWS (EKS), cutting annual cloud expenditure by $180,000.\nEngineered event-driven pipeline with Apache Kafka processing 45,000 events/sec with zero data loss during peak holiday traffic.",
        },
        {
          title: "Software Engineer Intern",
          company: "Datadrive Systems",
          location: "San Jose, CA",
          start: "May 2021",
          end: "Aug 2021",
          bullets:
            "Built automated end-to-end integration test suite using Playwright and Jest, increasing core module test coverage from 68% to 91%.\nOptimized PostgreSQL database queries and indexes, decreasing slow query occurrences by 40% across analytical dashboards.",
        },
      ],
      projects: [
        {
          name: "Raft-KV Store",
          tech: "Go, Raft Protocol, gRPC, Docker",
          date: "Fall 2023",
          url: "https://github.com/alexmorgan/raft-kv",
          bullets:
            "Implemented linearizable distributed key-value storage engine using Raft consensus protocol.\nAchieved benchmark throughput of 65,000 read ops/sec with sub-millisecond lease reads under network partition tests.",
        },
        {
          name: "Realtime Collaborative Canvas",
          tech: "TypeScript, Next.js, WebSockets, Redis",
          date: "Spring 2023",
          url: "https://github.com/alexmorgan/collab-canvas",
          bullets:
            "Developed multi-user canvas editor supporting 100+ concurrent editors with conflict-free replicated data types (CRDTs).\nAttracted 1,200+ stars on GitHub and featured in daily developer roundups.",
        },
      ],
      skills: [
        { label: "Languages", items: "TypeScript, JavaScript, Go, Python, SQL, C++" },
        { label: "Frameworks & Libs", items: "React, Next.js, Node.js, Express, Tailwind CSS, GraphQL" },
        { label: "Infrastructure & Tools", items: "Docker, Kubernetes, AWS (S3, EKS, Lambda), PostgreSQL, Redis, Kafka, Git" },
      ],
      achievements: [],
      certificates: [
        { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", date: "2023" },
      ],
      extra: [
        { title: "Open Source Contributor", detail: "Merged 12 PRs to major developer tools and ecosystem libraries." },
      ],
    },
  },
  {
    id: "fullstack",
    name: "Full-Stack Developer",
    category: "engineering",
    roleTag: "Fullstack",
    badge: "Tech Minimal",
    description: "Sleek, left-aligned modern sans-serif template emphasizing web UI, APIs, and end-to-end delivery.",
    highlights: ["Modern Sans-Serif", "Left Header", "Summary + Exp", "Modern Startups"],
    layoutInfo: {
      typography: "Modern Sans-Serif",
      headerStyle: "Left-Aligned Modern",
      priority: "Experience First",
      sequence: ["Summary", "Work Experience", "Key Projects", "Technical Skills", "Education"],
    },
    content: {
      template: "fullstack",
      name: "Taylor Reed",
      phone: "+1 (555) 345-6789",
      email: "taylor.reed@example.com",
      location: "Austin, TX",
      links: [
        { label: "GitHub", url: "https://github.com/taylorreed" },
        { label: "LinkedIn", url: "https://linkedin.com/in/taylorreed" },
        { label: "Portfolio", url: "https://taylorreed.dev" },
      ],
      summary:
        "Product-focused full-stack developer with a track record of taking products from 0 to 1 with modern web technologies, delightful UX, and reliable architectures.",
      education: [
        {
          school: "University of Texas at Austin",
          degree: "B.S. in Software Engineering",
          location: "Austin, TX",
          start: "2019",
          end: "2023",
          grade: "3.8 / 4.0",
        },
      ],
      experience: [
        {
          title: "Full-Stack Software Engineer",
          company: "HyperGrowth SaaS",
          location: "Austin, TX",
          start: "Aug 2023",
          end: "Present",
          bullets:
            "Built customer analytics dashboard in Next.js 14 and Tailwind CSS used by 25,000+ business users daily.\nArchitected role-based access control (RBAC) and team billing engine via Stripe webhooks with zero billing discrepancies.\nDecreased initial page load time by 60% through aggressive Server Component optimization and database index tuning.",
        },
      ],
      projects: [
        {
          name: "SaaS Starter Kit",
          tech: "Next.js, Prisma, PostgreSQL, Stripe, Tailwind",
          date: "2024",
          url: "https://github.com/taylorreed/saas-starter",
          bullets:
            "Open-source production template with authentication, subscription tiers, and automated multi-tenant database isolation.\nAdopted by 800+ developers with 1,500 GitHub stars.",
        },
      ],
      skills: [
        { label: "Frontend", items: "React, Next.js, TypeScript, Tailwind CSS, Shadcn UI, HTML5, CSS3" },
        { label: "Backend", items: "Node.js, Express, Prisma ORM, PostgreSQL, Redis, REST APIs, GraphQL" },
        { label: "DevOps & Tools", items: "Git, Vercel, Docker, GitHub Actions CI/CD, Jest, Vitest" },
      ],
      achievements: [],
      certificates: [],
      extra: [],
    },
  },
  {
    id: "aiml",
    name: "AI & Machine Learning",
    category: "engineering",
    roleTag: "AI/ML",
    badge: "High Demand",
    description: "Skills and tooling upfront for instant keyword matching across PyTorch, LLMs, and high-performance inference.",
    highlights: ["Skills Upfront", "Research & LLMs", "Modern Sans-Serif", "High-Throughput ML"],
    layoutInfo: {
      typography: "Modern Sans-Serif",
      headerStyle: "Left-Aligned Modern",
      priority: "Skills First",
      sequence: ["Summary", "Core Technical Skills & Tooling", "Work & Research Experience", "Key Systems", "Education"],
    },
    content: {
      template: "aiml",
      name: "Dr. Jordan Chen",
      phone: "+1 (555) 987-6543",
      email: "jordan.chen@example.com",
      location: "Seattle, WA",
      links: [
        { label: "GitHub", url: "https://github.com/jordanchen" },
        { label: "Google Scholar", url: "https://scholar.google.com/citations" },
        { label: "LinkedIn", url: "https://linkedin.com/in/jordanchen" },
      ],
      summary:
        "Machine Learning Engineer specializing in Large Language Models (LLMs), RAG pipelines, and model compression for production inference at scale.",
      education: [
        {
          school: "University of Washington",
          degree: "M.S. in Computer Science & Engineering (AI Specialization)",
          location: "Seattle, WA",
          start: "2020",
          end: "2022",
          grade: "3.92 / 4.0",
        },
      ],
      experience: [
        {
          title: "Senior AI / ML Engineer",
          company: "Nexus AI Labs",
          location: "Seattle, WA",
          start: "Jul 2022",
          end: "Present",
          bullets:
            "Designed and deployed enterprise RAG pipeline indexing 4M+ documents with hybrid dense/sparse retrieval, increasing search precision by 28%.\nFine-tuned open-weight LLMs (Llama-3, Mistral) using QLoRA for legal compliance workflows, outperforming commercial baselines by 12 F1 points.\nOptimized inference serving stack using vLLM and TensorRT-LLM, reducing GPU memory footprint by 45% and slashing latency to 18ms/token.",
        },
      ],
      projects: [
        {
          name: "FastEmbeddings-VectorEngine",
          tech: "Python, PyTorch, FAISS, CUDA, FastAPI",
          date: "2024",
          url: "https://github.com/jordanchen/fast-embeddings",
          bullets:
            "Created high-throughput semantic vector search library handling 100M+ vectors with sub-10ms nearest neighbor search.\nDownloaded over 80k times on PyPI with production adoption at 3 startups.",
        },
      ],
      skills: [
        { label: "AI & ML Frameworks", items: "PyTorch, Hugging Face, vLLM, LangChain, LlamaIndex, Triton, CUDA, DeepSpeed" },
        { label: "Languages & Data", items: "Python, C++, SQL, Pandas, NumPy, Scikit-learn" },
        { label: "Cloud & MLOps", items: "AWS SageMaker, Docker, Ray, MLflow, Weights & Biases, Vector DBs (Pinecone, Qdrant)" },
      ],
      achievements: [],
      certificates: [
        { name: "Deep Learning Specialization", issuer: "DeepLearning.AI", date: "2022" },
      ],
      extra: [
        { title: "Kaggle Competitions Master", detail: "Top 1% ranking across tabular and NLP benchmark competitions." },
      ],
    },
  },
  {
    id: "pm",
    name: "Product Manager",
    category: "product",
    roleTag: "PM",
    badge: "Business & Tech",
    description: "Executive header with subtitle, highlighting revenue impact, roadmaps, and cross-functional leadership.",
    highlights: ["Executive Subhead", "ARR & Growth", "Core Competencies", "Modern Sans-Serif"],
    layoutInfo: {
      typography: "Modern Sans-Serif",
      headerStyle: "Left-Aligned Modern",
      priority: "Balanced",
      sequence: ["Executive Summary", "Core Competencies", "Professional Experience", "Strategic Initiatives", "Education"],
    },
    content: {
      template: "pm",
      name: "Marcus Vance",
      phone: "+1 (555) 456-7890",
      email: "marcus.vance@example.com",
      location: "New York, NY",
      links: [
        { label: "LinkedIn", url: "https://linkedin.com/in/marcusvance" },
        { label: "Portfolio", url: "https://marcusvance.pm" },
      ],
      summary:
        "Data-driven Technical Product Manager with 5+ years driving user engagement, revenue growth, and zero-to-one product features for B2B SaaS platforms.",
      education: [
        {
          school: "New York University, Stern School of Business",
          degree: "B.S. in Business & Computer Science",
          location: "New York, NY",
          start: "2016",
          end: "2020",
          grade: "3.75 / 4.0",
        },
      ],
      experience: [
        {
          title: "Senior Product Manager",
          company: "Elevate Commerce",
          location: "New York, NY",
          start: "Jan 2022",
          end: "Present",
          bullets:
            "Led product strategy for merchant checkout funnel, driving $14M in incremental ARR through iterative A/B testing.\nPartnered with 14 engineers and 3 designers to launch one-click checkout, boosting mobile conversion rate by 19%.\nDefined KPIs and monitored real-time cohorts in Amplitude, diagnosing drop-off bottlenecks and reducing churn by 3.5%.",
        },
      ],
      projects: [
        {
          name: "Self-Serve Enterprise Onboarding",
          tech: "Figma, Mixpanel, SQL, Jira",
          date: "2023",
          url: "https://example.com/case-study",
          bullets:
            "Re-architected enterprise tenant invitation flow, cutting average sales onboarding cycle from 18 days to 4 days.",
        },
      ],
      skills: [
        { label: "Product Leadership", items: "Product Roadmapping, Go-To-Market (GTM), User Research, OKRs, Agile / Scrum" },
        { label: "Analytics & Tools", items: "SQL, Amplitude, Mixpanel, Google Analytics, Jira, Figma, Tableau" },
      ],
      achievements: [],
      certificates: [
        { name: "Certified Scrum Product Owner (CSPO)", issuer: "Scrum Alliance", date: "2021" },
      ],
      extra: [],
    },
  },
  {
    id: "finance",
    name: "Investment Banking",
    category: "business",
    roleTag: "Finance",
    badge: "Wall Street Classic",
    description: "Ivy League & Wall Street standard. Centered serif layout with education upfront, transaction metrics, and financial modeling skills.",
    highlights: ["Education First", "Classic Serif", "Deal & M&A Bullets", "CFA / FINRA Ready"],
    layoutInfo: {
      typography: "Serif (Computer Modern)",
      headerStyle: "Centered Classic",
      priority: "Education First",
      sequence: ["Education", "Investment Banking Experience", "Financial Skills", "Licenses & Certifications"],
    },
    content: {
      template: "finance",
      name: "Jonathan Reynolds",
      phone: "+1 (212) 555-0194",
      email: "jonathan.reynolds@wharton.upenn.edu",
      location: "New York, NY",
      links: [
        { label: "LinkedIn", url: "https://linkedin.com/in/jonathanreynolds" },
      ],
      summary: "",
      education: [
        {
          school: "The Wharton School, University of Pennsylvania",
          degree: "B.S. in Economics, Concentrations in Finance and Accounting",
          location: "Philadelphia, PA",
          start: "2019",
          end: "2023",
          grade: "GPA: 3.92 / 4.0 (Summa Cum Laude)",
        },
      ],
      experience: [
        {
          title: "Investment Banking Analyst, M&A",
          company: "Goldman Sachs & Co.",
          location: "New York, NY",
          start: "Jul 2023",
          end: "Present",
          bullets:
            "Advised on 4 completed M&A and corporate divestiture transactions totaling $3.8B in aggregate deal value across enterprise software.\nBuilt dynamic 3-statement operating models, discounted cash flow (DCF), leveraged buyout (LBO), and accretion/dilution analyses for board review.\nSynthesized buyer universe into confidential information memorandums (CIM) and coordinated diligence responses across 12 strategic bidding parties.\nAuthored 25+ thematic pitch decks analyzing sector multiples, transaction comparables, and cost-of-capital estimates for Fortune 500 CFO presentations.",
        },
        {
          title: "Summer Investment Banking Analyst",
          company: "Morgan Stanley",
          location: "New York, NY",
          start: "Jun 2022",
          end: "Aug 2022",
          bullets:
            "Executed precedent transaction and comparable company valuation benchmarks for a $1.2B cross-border technology acquisition.\nConstructed pro-forma debt waterfall schedules and covenant stress tests to assess term loan and high-yield bond financing packages.",
        },
      ],
      projects: [],
      skills: [
        { label: "Financial Modeling", items: "DCF, LBO, 3-Statement Modeling, M&A Accretion/Dilution, Sensitivity Tables" },
        { label: "Tools & Terminals", items: "Bloomberg Terminal, FactSet, Capital IQ, PitchBook, Advanced Excel (VBA), Python" },
      ],
      achievements: [],
      certificates: [
        { name: "FINRA Series 79 & Series 63 Licenses", issuer: "FINRA", date: "2023" },
        { name: "CFA Program - Passed Level I Exam", issuer: "CFA Institute", date: "2024" },
      ],
      extra: [
        { title: "Wharton Undergraduate Finance Club", detail: "VP of Portfolio Research; led 14 analysts managing $150K student endowment fund." },
        { title: "Honors", detail: "Dean's List (All Semesters), Beta Gamma Sigma International Business Honor Society." },
      ],
    },
  },
  {
    id: "consulting",
    name: "Management Consultant",
    category: "business",
    roleTag: "Consulting",
    badge: "MBB Standard",
    description: "Structured strategy format. Clean sans-serif with executive summary, engagement case outcomes, cost reduction, and market entry.",
    highlights: ["Executive Summary", "Modern Sans", "Hypothesis-Driven Bullets", "Quantified ROI"],
    layoutInfo: {
      typography: "Modern Sans-Serif",
      headerStyle: "Left-Aligned Modern",
      priority: "Balanced",
      sequence: ["Executive Summary", "Consulting Experience", "Education", "Core Competencies"],
    },
    content: {
      template: "consulting",
      name: "Elena Rostova",
      phone: "+1 (312) 555-0842",
      email: "elena.rostova@kellogg.northwestern.edu",
      location: "Chicago, IL",
      links: [
        { label: "LinkedIn", url: "https://linkedin.com/in/elenarostova" },
      ],
      summary:
        "Strategy consultant with 4+ years advising Global 500 leadership on operational transformations, market entry, and post-merger integration. Proven track record unlocking over $120M in annualized EBITDA improvements across healthcare and retail supply chains.",
      education: [
        {
          school: "Northwestern University, Kellogg School of Management",
          degree: "Master of Business Administration (MBA), Strategy & Operations",
          location: "Evanston, IL",
          start: "2018",
          end: "2020",
          grade: "Dean's Distinguished Honor",
        },
      ],
      experience: [
        {
          title: "Engagement Manager / Strategy Consultant",
          company: "McKinsey & Company",
          location: "Chicago, IL",
          start: "Sep 2022",
          end: "Present",
          bullets:
            "Led cross-functional team of 5 consultants across 6-month enterprise transformation for a $4B healthcare provider, identifying $85M in cost synergies.\nRedesigned procurement operating model and vendor renegotiation strategy, reducing third-party medical supplies expenditure by 14% within 90 days.\nDelivered C-suite and Board presentations synthesizing organizational change roadmap and milestone governance for 12 hospital systems.\nFacilitated 20+ executive stakeholder alignment workshops to resolve organizational friction during post-merger organizational redesign.",
        },
        {
          title: "Senior Consultant, Strategy & Operations",
          company: "Bain & Company",
          location: "Boston, MA",
          start: "Jul 2020",
          end: "Aug 2022",
          bullets:
            "Conducted market sizing, competitive benchmarking, and customer willingness-to-pay study for leading consumer goods firm entering DTC channel.\nFormulated 5-year growth strategy forecasting $140M in new top-line revenue, which received unanimous executive steering committee sign-off.\nMentored 4 business analysts on structured problem-solving, MECE frameworks, and executive slide writing.",
        },
      ],
      projects: [],
      skills: [
        { label: "Core Competencies", items: "Hypothesis-Driven Problem Solving, Post-Merger Integration, MECE Structuring, Supply Chain Optimization" },
        { label: "Analytics & Presentation", items: "Executive Board Storyboarding, Financial Modeling, Tableau, Alteryx, Advanced Excel" },
      ],
      achievements: [],
      certificates: [],
      extra: [
        { title: "Kellogg Strategy Club", detail: "President; organized annual National Case Competition hosting 24 business schools." },
        { title: "Pro Bono Advisory", detail: "Led volunteer consulting team delivering growth roadmap for Midwest food bank serving 60k families." },
      ],
    },
  },
  {
    id: "newgrad",
    name: "Student & Entry",
    category: "student",
    roleTag: "New Grad",
    badge: "Early Career",
    description: "Education-first layout with high emphasis on academic coursework, hackathons, and clubs.",
    highlights: ["Education First", "Coursework & Honors", "Hackathons", "Classic Serif"],
    layoutInfo: {
      typography: "Serif (Computer Modern)",
      headerStyle: "Centered Classic",
      priority: "Education First",
      sequence: ["Education & Academic Honors", "Technical Projects & Hackathons", "Experience", "Skills"],
    },
    content: {
      template: "newgrad",
      name: "Samira Patel",
      phone: "+1 (555) 567-8901",
      email: "samira.patel@example.com",
      location: "Boston, MA",
      links: [
        { label: "GitHub", url: "https://github.com/samirapatel" },
        { label: "LinkedIn", url: "https://linkedin.com/in/samirapatel" },
      ],
      summary:
        "Energetic Computer Science graduate with strong foundation in data structures, algorithms, and web technologies seeking an entry-level software engineering position.",
      education: [
        {
          school: "Northeastern University",
          degree: "B.S. in Computer Science",
          location: "Boston, MA",
          start: "2021",
          end: "2025",
          grade: "3.9 / 4.0 (Dean's Honor List)",
        },
      ],
      experience: [
        {
          title: "Software Engineering Intern",
          company: "FinTech Innovations",
          location: "Boston, MA",
          start: "May 2024",
          end: "Aug 2024",
          bullets:
            "Developed customer notification service using Python and AWS SNS delivering 500,000+ daily notifications.\nCollaborated in 2-week Agile sprints with code reviews and automated CI testing via GitHub Actions.",
        },
      ],
      projects: [
        {
          name: "SmartCampus Course Planner",
          tech: "React, Node.js, MongoDB, Express",
          date: "Spring 2024",
          url: "https://github.com/samirapatel/course-planner",
          bullets:
            "Won 1st Place at Northeastern Annual Hackathon among 75 teams for building intelligent degree prerequisite planner.\nAdopted by 1,400+ undergraduate students in first semester.",
        },
      ],
      skills: [
        { label: "Languages", items: "Python, Java, C, C++, TypeScript, SQL" },
        { label: "Technologies", items: "Git, Linux, React, Node.js, REST APIs, Docker Basics" },
        { label: "Coursework", items: "Algorithms & Data Structures, Operating Systems, Database Management, Networks" },
      ],
      achievements: [],
      certificates: [],
      extra: [
        { title: "VP of Tech, Women in Computer Science", detail: "Organized technical interview workshops and mentorship for 200+ members." },
      ],
    },
  },
  {
    id: "compact",
    name: "Compact Minimalist",
    category: "engineering",
    roleTag: "Compact",
    badge: "Dense Single-Page",
    description: "High information density layout with split 2-column header and tight margins to fit maximum content on one page.",
    highlights: ["Split Header", "Tight 0.4in Margins", "Skills Top", "Dense Layout"],
    layoutInfo: {
      typography: "Modern Sans-Serif",
      headerStyle: "Split Compact",
      priority: "Skills First",
      sequence: ["Technical Skills", "Experience", "Projects", "Education"],
    },
    content: {
      template: "compact",
      name: "David Kim",
      phone: "+1 (555) 789-0123",
      email: "david.kim@example.com",
      location: "Chicago, IL",
      links: [
        { label: "GitHub", url: "https://github.com/davidkim" },
        { label: "LinkedIn", url: "https://linkedin.com/in/davidkim" },
      ],
      summary: "",
      education: [
        {
          school: "University of Illinois Urbana-Champaign",
          degree: "B.S. in Computer Engineering",
          location: "Urbana, IL",
          start: "2017",
          end: "2021",
          grade: "3.8 / 4.0",
        },
      ],
      experience: [
        {
          title: "Systems Engineer",
          company: "Apex Financial Trading",
          location: "Chicago, IL",
          start: "Jun 2021",
          end: "Present",
          bullets:
            "Maintained low-latency trading gateways written in modern C++ and Rust, achieving 15-microsecond execution loops.\nInstrumented telemetry pipelines tracking 100k market data ticks per second with Prometheus and Grafana dashboards.\nAutomated release verification with nightly integration harness reducing regressions by 85%.",
        },
      ],
      projects: [
        {
          name: "FastRing - Lock-Free Queue",
          tech: "C++20, Atomics, CMake",
          date: "2023",
          url: "https://github.com/davidkim/fastring",
          bullets:
            "Implemented cache-aligned SPMC lock-free circular ring buffer processing 30M messages/sec on modern x86 hardware.",
        },
      ],
      skills: [
        { label: "Languages", items: "C++20, Rust, Python, Go, x86 Assembly, SQL" },
        { label: "Systems & Linux", items: "Linux Kernel Tuning, eBPF, TCP/IP, Sockets, POSIX Threads, Docker" },
        { label: "Tools", items: "CMake, GDB, Valgrind, Perf, Git, CI/CD" },
      ],
      achievements: [],
      certificates: [],
      extra: [],
    },
  },
  {
    id: "blank",
    name: "Blank Canvas",
    category: "student",
    roleTag: "",
    badge: "Clean Slate",
    description: "Start completely from scratch with a clean, unpopulated layout.",
    highlights: ["Zero Defaults", "Completely Custom", "Minimal"],
    layoutInfo: {
      typography: "Serif (Computer Modern)",
      headerStyle: "Centered Classic",
      priority: "Balanced",
      sequence: ["Education", "Experience", "Projects", "Skills"],
    },
    content: {
      template: "blank",
      name: "",
      phone: "",
      email: "",
      location: "",
      links: [],
      summary: "",
      education: [{ school: "", degree: "", location: "", start: "", end: "", grade: "" }],
      experience: [{ title: "", company: "", location: "", start: "", end: "", bullets: "" }],
      projects: [{ name: "", tech: "", date: "", url: "", bullets: "" }],
      achievements: [],
      certificates: [],
      skills: [{ label: "Skills", items: "" }],
      extra: [],
    },
  },
  {
    id: "campus",
    name: "Campus Placement",
    category: "student",
    roleTag: "SDE",
    badge: "1-Page Rule",
    description:
      "Campus-hire order: Education, Internships, Projects, Achievements, Skills. Compact by default so it lands on one page.",
    highlights: [
      "1-Page Compact",
      "Dedicated Achievements",
      "CP Ratings Visible",
      "Class XII / X Rows",
    ],
    layoutInfo: {
      typography: "Serif (Computer Modern)",
      headerStyle: "Centered Classic",
      priority: "Education First",
      sequence: ["Education", "Internships", "Projects", "Achievements", "Skills"],
    },
    content: {
      template: "campus",
      templateConfig: { templateId: "campus", density: "compact" },
      name: "Arjun Mehta",
      phone: "+91 98765 43210",
      email: "arjun.mehta@college.edu",
      location: "Bengaluru, India",
      links: [
        { label: "LinkedIn", url: "https://linkedin.com/in/arjunmehta" },
        { label: "GitHub", url: "https://github.com/arjunmehta" },
        { label: "LeetCode", url: "https://leetcode.com/arjunmehta" },
      ],
      summary: "",
      education: [
        {
          school: "National Institute of Technology",
          degree: "B.Tech, Computer Science & Engineering",
          location: "Kurukshetra, India",
          start: "2023",
          end: "2027",
          grade: "CGPA 9.12/10",
        },
        {
          school: "Kendriya Vidyalaya",
          degree: "Class XII (CBSE), PCM",
          location: "",
          start: "",
          end: "2023",
          grade: "94.2%",
        },
        {
          school: "Kendriya Vidyalaya",
          degree: "Class X (CBSE)",
          location: "",
          start: "",
          end: "2021",
          grade: "92.8%",
        },
      ],
      experience: [
        {
          title: "Software Engineering Intern",
          company: "Paytm",
          location: "Noida, India",
          start: "May 2025",
          end: "July 2025",
          bullets:
            "Built a merchant dashboard in **React** and **Node.js** serving **12,000+** daily requests, cutting p95 load time from **1.9s** to **480ms**.\nAutomated reconciliation with **PostgreSQL** and **Redis**, removing **6 hours** of manual weekly effort.\nReduced payment-failure rate **38%** by tracing retry logic end to end and surfacing gateway errors in real time.\nShipped the module to production for **3 merchant teams** with **0** rollback incidents.",
        },
      ],
      projects: [
        {
          name: "Transit-Graph",
          tech: "Go, Kafka, Neo4j, Docker",
          date: "2025",
          url: "https://github.com/arjunmehta/transit-graph",
          bullets:
            "Engineered a real-time transit graph ingesting **1.2M** GTFS feeds per day, serving sub-**100ms** route queries.\nDesigned an incremental recompute strategy that cut nightly processing from **9 hours** to **41 minutes**.\nContainerised the pipeline on **Kubernetes**, handling **2.1M** events per day with **99.9%** uptime.",
        },
        {
          name: "MediScribe",
          tech: "Next.js, PostgreSQL, LangChain",
          date: "2024",
          url: "https://github.com/arjunmehta/mediscribe",
          bullets:
            "Built a clinical-notes summariser with retrieval-grounded context, reducing documentation time **45%** for **30+** beta users.\nImplemented a citation check that flags **100%** of unsupported claims, reviewed by 3 practicing physicians.",
        },
      ],
      achievements: [
        { title: "Codeforces", detail: "**1847** rating, top **4%** globally" },
        { title: "ICPC Asia Regionals", detail: "Ranked **31** among **1,200+** teams" },
        { title: "Smart India Hackathon", detail: "Winner, national grand finale, **2024**" },
        { title: "Open Source", detail: "Merged **14** PRs into **5** CNCF projects" },
      ],
      certificates: [],
      skills: [
        { label: "Languages", items: "C++, Python, JavaScript, TypeScript, Go, SQL" },
        { label: "Web / Backend", items: "React, Next.js, Node.js, Express, FastAPI" },
        { label: "Data & Infra", items: "PostgreSQL, Redis, MongoDB, Kafka, Docker, Kubernetes" },
        { label: "Tools", items: "Git, GitHub Actions, Linux, Postman" },
      ],
      extra: [
        { title: "Coding Club", detail: "Technical Lead, ran **3** internal hackathons" },
      ],
    },
  },
];

