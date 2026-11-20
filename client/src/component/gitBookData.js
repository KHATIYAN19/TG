/*
  Content for /book/git: the two Git & GitHub PDF ebooks.
  Everything about the books comes from the book listings. Do not add chapters, sections or claims that are not in the books.
  The "quick answer" FAQs explain general Git concepts and point to where the book covers them.
*/

/* one product, two PDFs: buying it gives both books */
export const PAGE_URL = "/book/git";

export const HANDBOOK = {
  title: "Git & GitHub: The Complete Guide",
  tagline: "Beginner to advanced. Every command with real output and diagrams, from your first commit to GitHub Actions, security and open source.",
  pages: 123,
  chapters: 21,
  includes: [
    "21 chapters + a command index appendix",
    "Every command with real output and diagrams",
    "Branching diagrams: fast-forward, three-way, rebase, cherry-pick, Git Flow, GitHub Flow, trunk-based",
    "Error fixes and recovery recipes",
    "25 interview questions and a 30-day plan",
    "Table of contents and page numbers",
  ],
};

export const CHEATSHEET = {
  title: "Git & GitHub Cheat Sheet",
  tagline: "A quick reference for daily use and last-minute interview revision: “command | what it does” tables on every page.",
  pages: 19,
  sections: 18,
  includes: [
    "18 sections",
    "“Command | what it does” tables on every page",
    "Small diagrams for merge, rebase, reset and PR flow",
    "Top 40 commands for last-minute revision",
    "Cover and page numbers, no index",
  ],
};

/* Handbook: 21 chapters (title, topics) in reading order */
export const CHAPTERS_RAW = [
  { title: "Introduction to Version Control", detail: "Git vs GitHub, history, vocabulary" },
  { title: "Installing & Configuring Git", detail: "Windows/macOS/Linux, identity, SSH keys, tokens, gh login" },
  { title: "How Git Works Internally", detail: "Three areas, objects, HEAD and refs, revision names" },
  { title: "Your First Repository", detail: "init, clone, status, add, commit, .gitignore, rm, mv" },
  { title: "Exploring History", detail: "log, show, diff, blame, grep, shortlog, describe" },
  { title: "Undoing Things Safely", detail: "restore, reset soft/mixed/hard, revert, amend, clean, reflog" },
  { title: "Branching in Detail", detail: "branch, switch, detached HEAD, tracking, naming conventions" },
  { title: "Merging Branches", detail: "Fast-forward, three-way, no-ff, squash, conflict resolution" },
  { title: "Rebasing", detail: "rebase, interactive rebase, --onto, autosquash, merge vs rebase" },
  { title: "Stash, Cherry-pick, Tags & More", detail: "bisect, worktree, submodules, hooks, patches" },
  { title: "Branching Strategies & Workflows", detail: "Git Flow, GitHub Flow, trunk-based, release, forking" },
  { title: "Working with Remotes", detail: "push, fetch, pull, rejected pushes, force-with-lease" },
  { title: "GitHub Fundamentals", detail: "Repos, README, Issues, Projects, Discussions, roles" },
  { title: "Pull Requests & Code Review", detail: "PR lifecycle, merge methods, CODEOWNERS, merge queue" },
  { title: "GitHub CLI (gh)", detail: "Repos, issues, PRs, runs, releases, API" },
  { title: "Security & Branch Protection", detail: "Signed commits, rulesets, Dependabot, secret scanning, CodeQL" },
  { title: "GitHub Actions: CI/CD", detail: "Workflows, matrix, secrets, caching, reusable workflows, OIDC" },
  { title: "Releases, Pages, Packages, Codespaces & Copilot", detail: "" },
  { title: "Open Source Workflow & Conventions", detail: "Fork and sync, Conventional Commits, licences" },
  { title: "Advanced Git", detail: "LFS, sparse/partial clone, filter-repo, range-diff, Git 3.0 prep" },
  { title: "Troubleshooting, Cheat Sheet & Interview Q&A", detail: "Common errors, 25 interview questions, 30-day plan" },
];

export const APPENDIX = { title: "Appendix: Command Index", detail: "Every git and gh command with page numbers" };

export const handbookChapters = CHAPTERS_RAW.map((c, i) => ({ ...c, number: String(i + 1).padStart(2, "0") }));

/* Chapter groups for the contents view (presentation only; chapter numbers and titles are the book's) */
export const chapterGroups = [
  { label: "Git basics", range: [1, 6], copy: "What version control is, setup, how Git stores your work, first commits, history and undo." },
  { label: "Branches & collaboration", range: [7, 12], copy: "Branching, merging, rebasing, stash and cherry-pick, team workflows and remotes." },
  { label: "GitHub", range: [13, 19], copy: "Repos and Issues, pull requests and review, the gh CLI, security, Actions, releases and open source." },
  { label: "Advanced & reference", range: [20, 21], copy: "LFS, partial clone, filter-repo, troubleshooting, interview Q&A and the command index." },
].map((g) => ({ ...g, chapters: handbookChapters.slice(g.range[0] - 1, g.range[1]) }));

/* What makes the Handbook different (from the listing highlights) */
export const highlights = [
  { title: "Real output", copy: "Most local Git outputs were captured from a real Git session, so you see what the terminal actually prints." },
  { title: "Branching diagrams", copy: "Fast-forward, three-way merge, rebase, cherry-pick, Git Flow, GitHub Flow and trunk-based development, drawn out." },
  { title: "Easy to navigate", copy: "Table of contents, page numbers and a command index listing every git and gh command with its page number." },
  { title: "Fix and recover", copy: "Error fixes, recovery recipes and interview prep: 25 interview questions and a 30-day plan." },
];

export const DIAGRAMS = ["Fast-forward merge", "Three-way merge", "Rebase", "Cherry-pick", "Git Flow", "GitHub Flow", "Trunk-based"];

/* Cheat sheet: 18 sections */
export const cheatSheetSections = [
  { title: "The Mental Model", detail: "Working dir, staging, repo, remote" },
  { title: "Setup & Config" },
  { title: "Start & Save Work", detail: "init, add, commit, .gitignore, commit messages" },
  { title: "History", detail: "log, show, blame" },
  { title: "Undo & Recover", detail: "restore, reset, revert, reflog" },
  { title: "Branching" },
  { title: "Merging & Conflicts" },
  { title: "Rebase" },
  { title: "Stash, Cherry-pick, Tags & More" },
  { title: "Remotes & Syncing", detail: "Fork workflow" },
  { title: "Branching Strategies", detail: "Git Flow diagram" },
  { title: "GitHub: Pull Requests & Reviews" },
  { title: "GitHub CLI (gh)" },
  { title: "GitHub Actions (CI/CD)" },
  { title: "Security & Protection" },
  { title: "Fix-it Recipes & Common Errors" },
  { title: "Conventions & Pro Habits" },
  { title: "Top 40 Commands", detail: "Last-minute revision" },
].map((s, i) => ({ ...s, number: `${i < 9 ? "0" : ""}${i + 1}` }));

/* Side-by-side comparison of the two books */
export const bookComparison = [
  ["Pages", "123", "19"],
  ["Level", "Beginner to advanced", "Quick reference"],
  ["Structure", "21 chapters + command index appendix", "18 sections, “command | what it does” tables on every page"],
  ["Diagrams", "Fast-forward, three-way, rebase, cherry-pick, Git Flow, GitHub Flow, trunk-based", "Small diagrams for merge, rebase, reset and PR flow"],
  ["Command output", "Every command with real output; most local Git outputs captured from a real Git session", "Not listed"],
  ["Navigation", "Table of contents, page numbers, command index", "Cover and page numbers, no index"],
  ["Interview prep", "25 interview questions and a 30-day plan", "Top 40 commands for last-minute revision"],
  ["Use it to", "Learn Git and GitHub end to end", "Revise before interviews and in daily use"],
];

/* Where each topic lives in both books (chapter numbers match CHAPTERS_RAW, section numbers match cheatSheetSections) */
export const topicMap = [
  ["Git vs GitHub, the mental model", "Ch 01, Ch 03 (three areas, objects, HEAD and refs)", "§01 The Mental Model"],
  ["Install, config, SSH keys, tokens", "Ch 02", "§02 Setup & Config"],
  ["init, add, commit, .gitignore", "Ch 04", "§03 Start & Save Work"],
  ["log, show, diff, blame", "Ch 05", "§04 History"],
  ["restore, reset, revert, reflog", "Ch 06", "§05 Undo & Recover"],
  ["Branches and detached HEAD", "Ch 07", "§06 Branching"],
  ["Merging and conflicts", "Ch 08 fast-forward, three-way, no-ff, squash", "§07 Merging & Conflicts"],
  ["Rebase and interactive rebase", "Ch 09 incl. --onto, autosquash", "§08 Rebase"],
  ["Stash, cherry-pick, tags, bisect", "Ch 10 incl. worktree, submodules, hooks, patches", "§09"],
  ["Git Flow, GitHub Flow, trunk-based", "Ch 11", "§11 Branching Strategies"],
  ["push, fetch, pull, force-with-lease", "Ch 12", "§10 Remotes & Syncing"],
  ["Pull requests and code review", "Ch 14 incl. CODEOWNERS, merge queue", "§12"],
  ["GitHub CLI (gh)", "Ch 15", "§13"],
  ["GitHub Actions CI/CD", "Ch 17 incl. matrix, caching, reusable workflows, OIDC", "§14"],
  ["Security and branch protection", "Ch 16 incl. signed commits, rulesets, Dependabot, CodeQL", "§15"],
  ["Open source and Conventional Commits", "Ch 19", "§17 Conventions & Pro Habits, §10 fork workflow"],
  ["Advanced Git (LFS, partial clone)", "Ch 20", "Not covered"],
  ["Common errors and fixes", "Ch 21", "§16 Fix-it Recipes & Common Errors"],
  ["Interview preparation", "Ch 21: 25 questions, 30-day plan", "§18 Top 40 Commands"],
  ["Command lookup", "Appendix: Command Index", "Command tables on every page"],
];

/*
  FAQ (also used for FAQPage schema and server-rendered HTML).
  topic: true → general Git questions shown in the "Quick answers" section; the rest are about the books.
*/
export const FAQS = [
  { q: "What do I get when I buy the Git & GitHub ebook?",
    a: "Both books in one purchase, as PDF ebooks. Git & GitHub: The Complete Guide (123 pages, 21 chapters plus a command index) takes you from beginner to advanced with every command shown with real output and diagrams. The Git & GitHub Cheat Sheet (19 pages, 18 sections) is a quick reference with “command | what it does” tables on every page." },
  { q: "What is the difference between the Complete Guide and the Cheat Sheet?",
    a: "You get both. Use the Complete Guide to learn Git and GitHub in depth: internals, branching, merging, rebasing, remotes, pull requests, the gh CLI, security, GitHub Actions and advanced Git. Use the Cheat Sheet for quick revision before interviews and in daily use: 19 pages of command tables with small diagrams for merge, rebase, reset and PR flow." },
  { q: "Is the Git book suitable for beginners?",
    a: "Yes. It goes from beginner to advanced: it starts with what version control is, how to install and configure Git, and your first repository, then moves on to branching, rebasing, GitHub, CI/CD with GitHub Actions and advanced topics like LFS, sparse and partial clone, filter-repo and range-diff." },
  { q: "Is the command output in the Git book real?",
    a: "Every command is shown with its output. Most local Git outputs were captured from a real Git session." },
  { q: "Does the book cover GitHub, pull requests and GitHub Actions?",
    a: "Yes. Chapters 13 to 19 cover GitHub: repos, README, Issues, Projects and Discussions; pull requests and code review (PR lifecycle, merge methods, CODEOWNERS, merge queue); the GitHub CLI (gh); security and branch protection (signed commits, rulesets, Dependabot, secret scanning, CodeQL); GitHub Actions CI/CD (workflows, matrix, secrets, caching, reusable workflows, OIDC); releases, Pages, Packages, Codespaces and Copilot; and the open source workflow." },
  { q: "Does it cover branching strategies like Git Flow and trunk-based development?",
    a: "Yes. Chapter 11 covers Git Flow, GitHub Flow, trunk-based development, release branches and forking workflows, with diagrams. The Cheat Sheet has a Branching Strategies section with a Git Flow diagram." },
  { q: "Do the Git ebooks help with interview preparation?",
    a: "Yes. The last chapter of the Complete Guide covers common errors, 25 interview questions and a 30-day plan. The Cheat Sheet ends with the top 40 commands for last-minute revision." },
  { q: "What format are the Git ebooks in?",
    a: "Both are PDF ebooks by Target Trek (targettrek.in), readable on phone, tablet or laptop." },

  { topic: true, q: "What is the difference between Git and GitHub?",
    a: "Git is a distributed version control system that runs on your computer and records the history of your files. GitHub is an online platform that hosts Git repositories and adds collaboration features such as pull requests, code review, Issues and GitHub Actions. You can use Git without GitHub, but GitHub is built on Git. Covered in Chapter 1." },
  { topic: true, q: "What is the difference between git merge and git rebase?",
    a: "git merge joins two branches and keeps their history as it happened, creating a merge commit unless a fast-forward is possible. git rebase replays your commits on top of another branch, giving a straight, linear history but creating new commit IDs. Avoid rebasing commits that others have already pulled. Covered in Chapters 8 and 9." },
  { topic: true, q: "What is the difference between git reset and git revert?",
    a: "git reset moves your branch back to an earlier commit and rewrites history (--soft keeps changes staged, --mixed keeps them unstaged, --hard discards them), so use it on local work. git revert adds a new commit that undoes an earlier one without rewriting history, so it is safe on shared branches. Covered in Chapter 6." },
  { topic: true, q: "How do I recover a commit I lost after a reset?",
    a: "Run git reflog to see every position HEAD has recently been at, find the commit hash from before the reset, then run git reset --hard <hash> or create a branch at it with git branch <name> <hash>. Covered in Chapter 6." },
  { topic: true, q: "What does git push --force-with-lease do?",
    a: "It force-pushes your branch only if the remote branch is still where you last saw it. If someone else pushed in the meantime, the push is refused instead of overwriting their work, which makes it safer than --force. Covered in Chapter 12." },
  { topic: true, q: "What is the difference between git fetch and git pull?",
    a: "git fetch downloads new commits from the remote and updates remote-tracking branches without touching your work. git pull runs a fetch and then merges (or rebases) those changes into your current branch. Covered in Chapter 12." },
  { topic: true, q: "What is a detached HEAD in Git?",
    a: "HEAD normally points to a branch. In a detached HEAD state it points straight at a commit, for example after checking out a tag or a commit hash. New commits made there belong to no branch, so create one with git switch -c <name> if you want to keep them. Covered in Chapters 3 and 7." },
];
