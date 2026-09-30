export const SITE_URL =
  "https://www.targettrek.in";

export const formatLabel = (
  value = ""
) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
};

export const formatDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

export const getTimeAgo = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const diff = Math.max(
    0,
    Date.now() -
      date.getTime()
  );

  const seconds =
    Math.floor(
      diff / 1000
    );

  if (seconds < 10) {
    return "just now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks =
    Math.floor(
      days / 7
    );

  if (weeks < 5) {
    return `${weeks}w ago`;
  }

  const months =
    Math.floor(
      days / 30
    );

  if (months < 12) {
    return `${months}mo ago`;
  }

  return `${Math.floor(
    days / 365
  )}y ago`;
};

export const getExperienceText =
  (info = {}) => {
    const years =
      Number(
        info?.experienceYears ||
          0
      );

    const months =
      Number(
        info?.experienceMonths ||
          0
      );

    if (
      !years &&
      !months
    ) {
      return "";
    }

    const parts = [];

    if (years) {
      parts.push(
        `${years} ${
          years === 1
            ? "year"
            : "years"
        }`
      );
    }

    if (months) {
      parts.push(
        `${months} ${
          months === 1
            ? "month"
            : "months"
        }`
      );
    }

    return parts.join(" ");
  };

export const stripMarkdown = (
  value = ""
) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(
      /```[\s\S]*?```/g,
      " "
    )
    .replace(
      /`([^`]+)`/g,
      "$1"
    )
    .replace(
      /!\[([^\]]*)\]\([^)]*\)/g,
      "$1"
    )
    .replace(
      /\[([^\]]+)\]\([^)]*\)/g,
      "$1"
    )
    .replace(
      /^#{1,6}\s+/gm,
      ""
    )
    .replace(
      /^>\s?/gm,
      ""
    )
    .replace(
      /(\*\*|__|\*|_|~~)/g,
      ""
    )
    .replace(
      /^(-{3,}|\*{3,}|_{3,})$/gm,
      " "
    )
    .replace(
      /^\s*[-*+]\s+/gm,
      ""
    )
    .replace(
      /^\s*\d+\.\s+/gm,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
};

export const buildDescription = (
  interview,
  maxLength = 160
) => {
  if (!interview) {
    return "";
  }

  const source =
    interview?.seo
      ?.description ||
    interview
      ?.summaryMarkdown ||
    interview
      ?.contentMarkdown ||
    "";

  const clean =
    stripMarkdown(source);

  if (clean) {
    if (
      clean.length <=
      maxLength
    ) {
      return clean;
    }

    return `${clean
      .slice(
        0,
        maxLength - 3
      )
      .trim()}...`;
  }

  const company =
    interview?.company
      ?.name ||
    "Company";

  const role =
    interview?.role
      ?.title ||
    "Software Engineer";

  return `Read this ${company} ${role} interview experience including interview rounds, questions, difficulty and preparation strategy.`;
};

export const getResultClasses = (
  result,
  isDark = false
) => {
  switch (result) {
    case "SELECTED":
      return isDark
        ? "border-emerald-800 bg-emerald-950/50 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "REJECTED":
      return isDark
        ? "border-red-800 bg-red-950/50 text-red-300"
        : "border-red-200 bg-red-50 text-red-700";

    case "WAITING":
      return isDark
        ? "border-amber-800 bg-amber-950/50 text-amber-300"
        : "border-amber-200 bg-amber-50 text-amber-700";

    case "OFFER_DECLINED":
      return isDark
        ? "border-violet-800 bg-violet-950/50 text-violet-300"
        : "border-violet-200 bg-violet-50 text-violet-700";

    default:
      return isDark
        ? "border-slate-700 bg-slate-800 text-slate-300"
        : "border-slate-200 bg-slate-100 text-slate-600";
  }
};

export const getDifficultyClasses =
  (
    difficulty,
    isDark = false
  ) => {
    switch (difficulty) {
      case "EASY":
        return isDark
          ? "bg-emerald-950/50 text-emerald-300"
          : "bg-emerald-50 text-emerald-700";

      case "MEDIUM":
        return isDark
          ? "bg-blue-950/50 text-blue-300"
          : "bg-blue-50 text-blue-700";

      case "MEDIUM_HARD":
        return isDark
          ? "bg-amber-950/50 text-amber-300"
          : "bg-amber-50 text-amber-700";

      case "HARD":
        return isDark
          ? "bg-red-950/50 text-red-300"
          : "bg-red-50 text-red-700";

      default:
        return isDark
          ? "bg-slate-800 text-slate-300"
          : "bg-slate-100 text-slate-600";
    }
  };

const escapeHtml = (
  value = ""
) => {
  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
};

const renderInlineMarkdown = (
  value = "",
  isDark = false
) => {
  let text =
    escapeHtml(value);

  const inlineCodes = [];

  text = text.replace(
    /`([^`]+)`/g,
    (_, code) => {
      const index =
        inlineCodes.length;

      inlineCodes.push(`
        <code
          class="
            break-all
            rounded-md
            px-1.5
            py-0.5
            font-mono
            text-[0.88em]
            font-semibold
            ${
              isDark
                ? "bg-slate-800 text-pink-300"
                : "bg-slate-100 text-pink-700"
            }
          "
        >${code}</code>
      `);

      return `@@INLINE_${index}@@`;
    }
  );

  text = text.replace(
    /\*\*(.+?)\*\*/g,
    `<strong
      class="font-bold ${
        isDark
          ? "text-white"
          : "text-slate-950"
      }"
    >$1</strong>`
  );

  text = text.replace(
    /__(.+?)__/g,
    `<strong
      class="font-bold ${
        isDark
          ? "text-white"
          : "text-slate-950"
      }"
    >$1</strong>`
  );

  text = text.replace(
    /~~(.+?)~~/g,
    "<del>$1</del>"
  );

  text = text.replace(
    /(^|[^*])\*([^*\n]+)\*/g,
    "$1<em>$2</em>"
  );

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    `<a
      href="$2"
      target="_blank"
      rel="noopener noreferrer"
      class="
        font-semibold
        text-blue-500
        underline
        underline-offset-4
        hover:text-blue-600
      "
    >$1</a>`
  );

  inlineCodes.forEach(
    (html, index) => {
      text = text.replace(
        `@@INLINE_${index}@@`,
        html
      );
    }
  );

  return text;
};

export const markdownToHtml = (
  markdown = "",
  isDark = false
) => {
  if (
    !String(markdown).trim()
  ) {
    return "";
  }

  const lines =
    String(markdown).split(
      "\n"
    );

  const output = [];

  let inCodeBlock =
    false;

  let codeLines = [];

  let listType = null;

  let listItems = [];

  const normalText =
    isDark
      ? "text-slate-300"
      : "text-slate-700";

  const headingText =
    isDark
      ? "text-white"
      : "text-slate-950";

  const borderColor =
    isDark
      ? "border-slate-800"
      : "border-slate-200";

  const flushList = () => {
    if (
      !listType ||
      listItems.length ===
        0
    ) {
      listType = null;
      listItems = [];
      return;
    }

    const tag =
      listType === "ol"
        ? "ol"
        : "ul";

    const style =
      listType === "ol"
        ? "list-decimal"
        : "list-disc";

    output.push(`
      <${tag}
        class="
          ${style}
          my-5
          space-y-2
          pl-5
          text-[14px]
          leading-7
          ${normalText}
          marker:text-blue-500
          sm:pl-6
          sm:text-[15px]
        "
      >
        ${listItems
          .map(
            (item) =>
              `<li>${renderInlineMarkdown(
                item,
                isDark
              )}</li>`
          )
          .join("")}
      </${tag}>
    `);

    listType = null;
    listItems = [];
  };

  const flushCode = () => {
    if (
      !codeLines.length
    ) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | MOBILE CODE BLOCK FIX
    |--------------------------------------------------------------------------
    |
    | Mobile:
    | - width 100%
    | - never expands the page
    | - wraps very long lines
    | - max height 320px
    | - vertical scrolling only when needed
    |
    | Desktop:
    | - normal pre formatting
    | - max height 520px
    |
    */

    output.push(`
      <pre
        class="
          my-5
          block
          w-full
          max-w-full
          overflow-x-hidden
          overflow-y-auto
          rounded-xl
          border
          border-slate-800
          bg-[#07101f]
          p-3
          text-[11px]
          leading-5
          text-slate-100
          max-h-[320px]
          sm:my-6
          sm:max-h-[520px]
          sm:overflow-x-auto
          sm:p-5
          sm:text-sm
          sm:leading-6
        "
      ><code
        class="
          block
          w-full
          max-w-full
          whitespace-pre-wrap
          break-words
          font-mono
          sm:w-max
          sm:min-w-full
          sm:whitespace-pre
        "
      >${escapeHtml(
        codeLines.join("\n")
      )}</code></pre>
    `);

    codeLines = [];
  };

  lines.forEach((line) => {
    if (
      line
        .trim()
        .startsWith("```")
    ) {
      flushList();

      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }

      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (
      /^(\s*)(---|\*\*\*|___)\s*$/.test(
        line
      )
    ) {
      flushList();

      output.push(`
        <hr
          class="
            my-8
            border-0
            border-t
            ${borderColor}
          "
        />
      `);

      return;
    }

    const h1 =
      line.match(
        /^# (.+)$/
      );

    if (h1) {
      flushList();

      output.push(`
        <h2
          class="
            mb-4
            mt-8
            text-xl
            font-black
            leading-tight
            tracking-tight
            ${headingText}
            sm:mt-9
            sm:text-3xl
          "
        >
          ${renderInlineMarkdown(
            h1[1],
            isDark
          )}
        </h2>
      `);

      return;
    }

    const h2 =
      line.match(
        /^## (.+)$/
      );

    if (h2) {
      flushList();

      output.push(`
        <h2
          class="
            mb-3
            mt-8
            text-lg
            font-black
            tracking-tight
            ${headingText}
            sm:text-2xl
          "
        >
          ${renderInlineMarkdown(
            h2[1],
            isDark
          )}
        </h2>
      `);

      return;
    }

    const h3 =
      line.match(
        /^### (.+)$/
      );

    if (h3) {
      flushList();

      output.push(`
        <h3
          class="
            mb-2
            mt-6
            text-base
            font-bold
            ${headingText}
            sm:mt-7
            sm:text-xl
          "
        >
          ${renderInlineMarkdown(
            h3[1],
            isDark
          )}
        </h3>
      `);

      return;
    }

    const quote =
      line.match(
        /^>\s?(.*)$/
      );

    if (quote) {
      flushList();

      output.push(`
        <blockquote
          class="
            my-5
            rounded-r-xl
            border-l-4
            border-blue-500
            px-4
            py-3
            text-sm
            leading-7
            ${
              isDark
                ? "bg-blue-950/30 text-slate-300"
                : "bg-blue-50 text-slate-700"
            }
            sm:my-6
            sm:px-5
            sm:py-4
            sm:text-[15px]
          "
        >
          ${renderInlineMarkdown(
            quote[1],
            isDark
          )}
        </blockquote>
      `);

      return;
    }

    const bullet =
      line.match(
        /^\s*[-*]\s+(.+)$/
      );

    if (bullet) {
      if (
        listType &&
        listType !== "ul"
      ) {
        flushList();
      }

      listType = "ul";

      listItems.push(
        bullet[1]
      );

      return;
    }

    const numbered =
      line.match(
        /^\s*\d+\.\s+(.+)$/
      );

    if (numbered) {
      if (
        listType &&
        listType !== "ol"
      ) {
        flushList();
      }

      listType = "ol";

      listItems.push(
        numbered[1]
      );

      return;
    }

    flushList();

    if (!line.trim()) {
      output.push(
        '<div class="h-1"></div>'
      );

      return;
    }

    output.push(`
      <p
        class="
          my-3
          break-words
          text-sm
          leading-7
          ${normalText}
          sm:my-4
          sm:text-base
          sm:leading-8
        "
      >
        ${renderInlineMarkdown(
          line,
          isDark
        )}
      </p>
    `);
  });

  flushList();

  if (inCodeBlock) {
    flushCode();
  }

  return output.join("");
};