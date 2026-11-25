/*
  CLAUDE CODE: THE COMPLETE HANDBOOK — book data for /book/claude-code
  All words, stats, chapters, and structure used by ClaudeCodeHandbook.jsx.
*/

export const PAGE_URL = "/book/claude-code";
export const PRODUCT_SLUG = "claude-code-handbook";

export const HANDBOOK = {
  title: "Claude Code: The Complete Handbook",
  subtitle: "The definitive guide to AI-powered development with Claude Code",
  edition: "2026 edition",
};

/* ------------------------------------------------------------------ stats */
export const STATS = [
  ["7", "parts"],
  ["30", "chapters"],
  ["100", "interview Q&A"],
  ["27", "build-along steps"],
];

/* ------------------------------------------------------------------ parts and chapters */
export const PARTS_RAW = [
  {
    number: "0",
    title: "Start Here",
    eyebrow: "Preface",
    chapters: [
      {
        slug: "start-here",
        title: "How to Use This Book",
        topics: [
          "Who this book is for",
          "How the book is organised",
          "Conventions used throughout",
          "The 30-minute fast path",
          "Check anything yourself",
        ],
      },
    ],
  },
  {
    number: "1",
    title: "Foundations",
    eyebrow: "Part 1",
    chapters: [
      {
        slug: "what-claude-code-is",
        title: "What Claude Code Is",
        topics: [
          "The idea in one paragraph",
          "The agent loop",
          "Built-in tools",
          "Where it runs",
          "What you can do with it",
          "Signing in: plans, API keys and providers",
          "Deterministic versus non-deterministic control",
        ],
      },
      {
        slug: "installation-first-session",
        title: "Installation and Your First Session",
        topics: [
          "Install",
          "Log in",
          "Your first task, step by step",
          "Health checks",
          "Multi-line input and terminal setup",
          "Update and release notes",
        ],
      },
      {
        slug: "interactive-interface",
        title: "The Interactive Interface",
        topics: [
          "The four prefixes",
          "The shortcuts that matter",
          "Steering Claude while it works",
          "Vim mode",
          "Images, transcript and screen modes",
          "Useful housekeeping commands",
        ],
      },
    ],
  },
  {
    number: "2",
    title: "Commands",
    eyebrow: "Part 2",
    chapters: [
      {
        slug: "slash-commands",
        title: "Slash Commands: The Master Reference",
        topics: [
          "How commands work",
          "A typical session, by command",
          "Session and context",
          "Planning, models and speed",
          "Review and quality",
          "Setup and configuration",
          "Parallel and background work",
          "Integrations and surfaces",
          "Account, usage and help",
          "Design, docs and data skills",
          "Removed or changed commands",
          "How the menu matches what you type",
        ],
      },
      {
        slug: "claude-command-line",
        title: "The claude Command Line",
        topics: [
          "Sub-commands",
          "Flags that matter most",
          "System prompt flags",
          "Recipes",
        ],
      },
      {
        slug: "models-effort-speed",
        title: "Models, Effort and Speed",
        topics: [
          "Choosing a model",
          "Effort levels",
          "Fast mode, advisor, fallback",
          "A practical model-by-task guide",
        ],
      },
    ],
  },
  {
    number: "3",
    title: "Context and Memory",
    eyebrow: "Part 3",
    chapters: [
      {
        slug: "context-window-mastery",
        title: "Context Window Mastery",
        topics: [
          "What lives in the window",
          "Read the gauge",
          "Your four levers",
          "Habits that save context",
          "Long-session checklist",
        ],
      },
      {
        slug: "claude-md-memory",
        title: "CLAUDE.md and Memory",
        topics: [
          "Two memory systems",
          "Where CLAUDE.md files live",
          "What makes a good CLAUDE.md",
          "A full example",
          "Imports and AGENTS.md",
          "Path-scoped rules",
          "Auto memory",
          "Quick edits with the # habit",
          "Troubleshooting instructions",
        ],
      },
      {
        slug: "sessions-checkpoints-rewind",
        title: "Sessions, Checkpoints and Rewind",
        topics: [
          "Resume where you left off",
          "Branch and fork",
          "Checkpoints and /rewind",
          "Moving work between surfaces",
          "Cleaning up",
        ],
      },
    ],
  },
  {
    number: "4",
    title: "Control and Safety",
    eyebrow: "Part 4",
    chapters: [
      {
        slug: "permissions-modes",
        title: "Permissions and Modes",
        topics: [
          "Modes",
          "How a request is decided",
          "Rule syntax",
          "Starter allowlist for most projects",
          "Auto mode in practice",
          "Managing permissions",
        ],
      },
      {
        slug: "settings",
        title: "Settings",
        topics: [
          "Files and scopes",
          "Precedence",
          "A realistic project file",
          "Keys worth knowing",
          "Environment variables",
          "Team setup pattern",
        ],
      },
      {
        slug: "security-sandbox",
        title: "Security and the Sandbox",
        topics: [
          "The threat model",
          "Layers of defence",
          "The sandbox",
          "Safe habits",
          "Pre-flight checklist for unattended runs",
        ],
      },
    ],
  },
  {
    number: "5",
    title: "Extending Claude Code",
    eyebrow: "Part 5",
    chapters: [
      {
        slug: "skills",
        title: "Skills",
        topics: [
          "Why skills",
          "Anatomy",
          "Frontmatter fields",
          "Example 1: explain code with diagrams",
          "Example 2: a fix-issue skill with arguments",
          "Example 3: inject live data and run isolated",
          "Bundled skills",
          "Tips",
        ],
      },
      {
        slug: "subagents",
        title: "Subagents",
        topics: [
          "The idea",
          "Built-in subagents",
          "Create your own",
          "Using subagents",
          "Patterns that work",
        ],
      },
      {
        slug: "hooks",
        title: "Hooks",
        topics: [
          "When to use hooks",
          "Key events",
          "Configuration",
          "How hooks talk to Claude",
          "Hook 1: block dangerous commands",
          "Hook 2: deny with structured JSON",
          "Hook 3: format after every edit",
          "Hook 4: do not stop until it typechecks",
          "Debugging",
        ],
      },
      {
        slug: "mcp",
        title: "MCP: Connecting Tools and Data",
        topics: [
          "What it gives you",
          "Add a server",
          "Scopes",
          "Shared config: .mcp.json",
          "Authenticate and manage",
          "Useful bits",
        ],
      },
      {
        slug: "plugins-marketplaces",
        title: "Plugins and Marketplaces",
        topics: [
          "What a plugin is",
          "Layout",
          "Install and manage",
          "Share with a team",
          "When to use what",
        ],
      },
    ],
  },
  {
    number: "6",
    title: "Workflows and Automation",
    eyebrow: "Part 6",
    chapters: [
      {
        slug: "prompting-best-practices",
        title: "Prompting and Best Practices",
        topics: [
          "Habit 1: say what Claude cannot see",
          "Habit 2: give Claude a way to check itself",
          "Habit 3: explore, plan, implement, commit",
          "Habit 4: keep context clean",
          "Prompt patterns",
          "Interview me, then spec",
          "Rich inputs",
          "Unattended work you can trust",
          "What you can stop doing",
        ],
      },
      {
        slug: "everyday-workflows",
        title: "Everyday Workflows",
        topics: [
          "Understand a new codebase",
          "Find the right code",
          "Fix a bug",
          "Refactor safely",
          "Tests",
          "Documentation",
          "Git with Claude",
          "Review loops",
          "Images and data",
        ],
      },
      {
        slug: "parallel-work",
        title: "Parallel Work",
        topics: [
          "Worktrees",
          "Background sessions",
          "/batch: big mechanical changes",
          "Patterns",
          "When parallelism hurts",
        ],
      },
      {
        slug: "automation-headless-ci",
        title: "Automation: Headless, CI and Scheduling",
        topics: [
          "Print mode",
          "Guardrails",
          "GitHub Actions",
          "Scheduled and recurring work",
          "/goal: work until done",
        ],
      },
      {
        slug: "claude-agent-sdk",
        title: "The Claude Agent SDK",
        topics: [
          "When to use it",
          "Install",
          "First agent: Python",
          "First agent: TypeScript",
          "Streaming and conversation state",
          "Custom tools and MCP",
          "Permissions, hooks and subagents",
          "Production checklist",
        ],
      },
      {
        slug: "ides-surfaces",
        title: "IDEs and Other Surfaces",
        topics: [
          "VS Code and Cursor",
          "JetBrains",
          "Desktop app",
          "Web and mobile",
          "Remote Control",
          "Chrome, Slack and CI",
          "Choosing",
        ],
      },
      {
        slug: "cost-efficiency",
        title: "Cost and Efficiency Playbook",
        topics: [
          "See your spend",
          "What costs the most",
          "Twelve tactics",
          "Quality versus cost",
          "For teams",
        ],
      },
      {
        slug: "troubleshooting",
        title: "Troubleshooting",
        topics: [
          "First checks",
          "Install problems",
          "Authentication and network",
          "Behaviour problems",
          "Extension problems",
          "Starting clean",
        ],
      },
      {
        slug: "cheat-sheet-recipes",
        title: "Cheat Sheet and Recipes",
        topics: [
          "Keys",
          "Slash commands",
          "Shell one-liners",
          "Prompt templates",
          "Team starter kit",
        ],
      },
      {
        slug: "build-along-todo-api",
        title: "Build-Along Project: A Todo API",
        topics: [
          "What you need",
          "Step 1: set up the folder",
          "Step 2: tell Claude the rules",
          "Step 3: plan in plan mode",
          "Step 4: implement with tests",
          "Step 5: add a formatter hook",
          "Step 6: add a skill and a subagent",
          "Step 7: review and ship",
          "What you practised",
        ],
      },
    ],
  },
  {
    number: "7",
    title: "Interview Prep",
    eyebrow: "Part 7",
    chapters: [
      {
        slug: "100-interview-questions",
        title: "100 Interview Questions and Answers",
        topics: [
          "Group 1: Fundamentals (Chapters 1 to 3)",
          "Group 2: Commands and models (Chapters 4 to 6)",
          "Group 3: Context management (Chapter 7)",
          "Group 4: CLAUDE.md and memory (Chapter 8)",
          "Group 5: Permissions and security (Chapters 10 to 12)",
          "Group 6: Skills, subagents, hooks (Chapters 13 to 15)",
          "Group 7: MCP and plugins (Chapters 16 and 17)",
          "Group 8: Workflows and prompting (Chapters 18 to 21)",
          "Group 9: Automation, CI and the SDK (Chapters 21 and 22)",
          "Group 10: Scenarios and judgement",
        ],
      },
      {
        slug: "glossary",
        title: "Glossary",
        topics: ["Terms — every Claude Code concept defined"],
      },
    ],
  },
];

/* ------------------------------------------------------------------ learning stages */
export const STAGES = [
  {
    parts: "Start Here + Part 1",
    title: "Get up and running",
    copy: "Install Claude Code, complete your first session, and understand the agent loop, built-in tools, and the interactive terminal interface.",
  },
  {
    parts: "Part 2",
    title: "Master the command surface",
    copy: "Learn every slash command, the claude CLI flags, and how to pick the right model and effort level for each type of task.",
  },
  {
    parts: "Part 3",
    title: "Manage context and memory",
    copy: "Control the context window, write effective CLAUDE.md files, and use sessions, checkpoints, and /rewind to work across long tasks.",
  },
  {
    parts: "Part 4",
    title: "Lock down control and safety",
    copy: "Configure permissions, modes, settings files, and the sandbox so Claude behaves exactly as you want—even in unattended runs.",
  },
  {
    parts: "Part 5",
    title: "Extend with skills, hooks and MCP",
    copy: "Build reusable skills, wire in lifecycle hooks, connect external tools via MCP, and compose subagents for complex workflows.",
  },
  {
    parts: "Part 6",
    title: "Automate everything",
    copy: "Run Claude headless in CI, schedule recurring work, use the Agent SDK, integrate IDEs, and control costs at team scale.",
  },
  {
    parts: "Part 7",
    title: "Ace the interview",
    copy: "100 curated questions with answers spanning every chapter, plus a full glossary so you can speak Claude Code fluently in any interview.",
  },
];

/* ------------------------------------------------------------------ terminal code samples */
export const SAMPLES = [
  {
    id: "install",
    tab: "Install",
    where: "Chapter 02 · Installation",
    title: "Get Claude Code running in 60 seconds",
    intro: "Install from npm, log in with your Anthropic account or API key, and run your first task.",
    tip: "Run `claude doctor` after install to verify every dependency is in place.",
    code: `# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Log in (opens browser for OAuth)
claude login

# Or use an API key directly
export ANTHROPIC_API_KEY=sk-ant-...

# Check everything is working
claude doctor`,
    output: `✓ Node.js 20.11.0
✓ npm 10.4.0
✓ claude 1.0.0
✓ Authentication: OK
✓ Network: reachable
All checks passed. Ready to code.`,
  },
  {
    id: "session",
    tab: "First session",
    where: "Chapter 02 · First session",
    title: "Your first interactive session",
    intro: "Start an interactive session, give Claude a task, and watch the agent loop in action.",
    tip: "Press Escape while Claude is working to pause it and redirect.",
    code: `# Start an interactive session
claude

# Inside the session:
> Write a FastAPI endpoint that returns
  paginated users from a SQLite database.
  Add input validation and error handling.

# Claude will:
# 1. Read your project structure
# 2. Create the endpoint with types
# 3. Add validation and tests
# 4. Show you a diff before saving`,
    output: `◆ Reading project structure…
◆ Creating src/routes/users.py
◆ Adding Pydantic schemas
◆ Writing tests/test_users.py
✓ Done — 3 files changed, 127 insertions`,
  },
  {
    id: "claudemd",
    tab: "CLAUDE.md",
    where: "Chapter 08 · Memory",
    title: "Persistent project instructions with CLAUDE.md",
    intro: "CLAUDE.md files tell Claude about your project conventions so you never repeat yourself.",
    tip: "Use the # shortcut inside a session to quickly add a rule to CLAUDE.md.",
    code: `# CLAUDE.md — place at project root

## Project
FastAPI + SQLAlchemy 2.0 app.
Python 3.12. Never use 3.11 syntax.

## Style
- Black formatter, line length 88
- Type hints required on all functions
- Docstrings: Google style

## Testing
- pytest with fixtures in conftest.py
- Always run: pytest -x --tb=short

## Commits
feat: / fix: / docs: prefixes required`,
    output: `◆ Loaded CLAUDE.md (project root)
◆ Loaded CLAUDE.md (src/)
Memory: 2 files, 847 tokens`,
  },
  {
    id: "hooks",
    tab: "Hooks",
    where: "Chapter 15 · Hooks",
    title: "Format every file Claude edits automatically",
    intro: "Hooks fire on lifecycle events. This one runs Black after every file save.",
    tip: "Return exit code 2 from a hook to block the action and feed Claude an error message.",
    code: `# .claude/hooks/post-save.sh
#!/bin/bash
# Run Black after every Python file edit

FILE="$CLAUDE_FILE"

if [[ "$FILE" == *.py ]]; then
  black --quiet "$FILE"
  if [ $? -ne 0 ]; then
    echo "Black failed on $FILE" >&2
    exit 2   # Claude sees the error
  fi
fi

exit 0`,
    output: `◆ Hook: post-save
◆ Running black on src/routes/users.py
✓ Reformatted — 1 file`,
  },
  {
    id: "mcp",
    tab: "MCP",
    where: "Chapter 16 · MCP",
    title: "Connect Claude to any tool with MCP",
    intro: "Add an MCP server so Claude can read your database, call APIs, or run searches.",
    tip: "Put shared MCP config in .mcp.json at the repo root so the whole team inherits it.",
    code: `# .mcp.json — shared team config
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-postgres",
        "postgresql://localhost/mydb"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "/workspace/docs"
      ]
    }
  }
}`,
    output: `◆ MCP: postgres connected
◆ MCP: filesystem connected
Tools available: query_db, read_file, list_files`,
  },
  {
    id: "ci",
    tab: "CI / Headless",
    where: "Chapter 21 · Automation",
    title: "Run Claude Code in GitHub Actions",
    intro: "Use print mode for headless CI runs — no interactive prompts, structured output.",
    tip: "Set CLAUDE_MAX_TURNS to cap how long an unattended run can go.",
    code: `# .github/workflows/claude-review.yml
name: Claude Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run review
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --print "Review the diff for bugs,
          missing tests, and security issues.
          Output JSON." > review.json`,
    output: `◆ Headless mode (--print)
◆ Reading diff (234 lines)
◆ Analysis complete
✓ review.json written (1.2 KB)`,
  },
];

/* ------------------------------------------------------------------ audience */
export const AUDIENCE = [
  {
    title: "Backend and full-stack engineers",
    copy: "Get Claude coding, refactoring, and reviewing your real production codebase—not toy examples.",
  },
  {
    title: "DevOps and platform engineers",
    copy: "Automate workflows, run Claude in CI, and wire it into your existing toolchain via hooks and MCP.",
  },
  {
    title: "Engineering managers",
    copy: "Understand Claude Code's capabilities and limits so you can set smart expectations for your team.",
  },
  {
    title: "Interview candidates",
    copy: "100 curated Q&A pairs cover every chapter so you can speak fluently about Claude Code in any interview.",
  },
  {
    title: "Open-source contributors",
    copy: "Use skills and subagents to automate repetitive contribution tasks across large codebases.",
  },
];

/* ------------------------------------------------------------------ value props */
export const VALUE = [
  {
    title: "Complete reference in one place",
    copy: "Every command, flag, setting key, and hook event documented in one searchable PDF.",
  },
  {
    title: "Real code you can run today",
    copy: "Every sample is from an actual Claude Code session—no synthetic examples that never work.",
  },
  {
    title: "Interview-ready in Part 7",
    copy: "100 questions with full answers spanning all 29 chapters, grouped by topic.",
  },
  {
    title: "Team patterns included",
    copy: "CLAUDE.md conventions, .mcp.json sharing, permission files, and cost controls for teams.",
  },
];

/* ------------------------------------------------------------------ key features */
export const FEATURES = [
  { label: "Agent loop", detail: "Understand exactly how Claude decides, acts, and self-corrects." },
  { label: "CLAUDE.md", detail: "Persistent project memory that survives every session restart." },
  { label: "Slash commands", detail: "Complete master reference for every / command." },
  { label: "Hooks", detail: "Four hook recipes you can copy and ship today." },
  { label: "MCP integration", detail: "Connect Claude to databases, APIs, and file systems." },
  { label: "CI automation", detail: "GitHub Actions workflow ready to drop into your repo." },
  { label: "100 Q&A", detail: "Interview prep covering every part of the book." },
  { label: "Build-along project", detail: "A complete Todo API from blank folder to shipped." },
];
