/*
|--------------------------------------------------------------------------
| OPENAI CLIENT (no SDK, plain fetch)
|--------------------------------------------------------------------------
|
| callModel()      – Responses API, optional web search + token streaming
| generateImage()  – Images API, returns a Buffer
|
| Env:
|   OPENAI_API_KEY        required
|   OPENAI_MODEL          default gpt-4.1
|   OPENAI_SEARCH_TOOL    default web_search (older accounts: web_search_preview)
|   OPENAI_IMAGE_MODEL    default gpt-image-1-mini (quality low)
|   OPENAI_BASE_URL       default https://api.openai.com/v1
|
*/

const baseUrl = () =>
  (
    process.env.OPENAI_BASE_URL ||
    "https://api.openai.com/v1"
  ).replace(/\/+$/, "");

/*
 * Cheap by default. Each stage can be overridden:
 *   OPENAI_MODEL_RESEARCH / _PLANNER / _WRITER / _CHECKER
 */
export const modelFor = (stage) =>
  (stage &&
    process.env[
      `OPENAI_MODEL_${String(stage).toUpperCase()}`
    ]) ||
  process.env.OPENAI_MODEL ||
  "gpt-4.1-mini";

const searchTool = () =>
  process.env.OPENAI_SEARCH_TOOL ||
  "web_search";

const sleep = (ms) =>
  new Promise((r) => setTimeout(r, ms));

export const isOpenAIConfigured = () =>
  Boolean(process.env.OPENAI_API_KEY);

/*
 * Combine the caller's abort signal with a hard timeout.
 */
const withTimeout = (
  signal,
  ms
) => {
  const controller =
    new AbortController();

  const timer = setTimeout(
    () =>
      controller.abort(
        new Error(
          "OpenAI request timed out."
        )
      ),
    ms
  );

  const onAbort = () =>
    controller.abort(signal.reason);

  if (signal) {
    if (signal.aborted) {
      onAbort();
    } else {
      signal.addEventListener(
        "abort",
        onAbort,
        { once: true }
      );
    }
  }

  return {
    signal: controller.signal,

    done: () => {
      clearTimeout(timer);

      signal?.removeEventListener(
        "abort",
        onAbort
      );
    },
  };
};

const collectCitations = (
  response,
  into
) => {
  for (const item of response?.output ||
    []) {
    if (item.type !== "message") {
      continue;
    }

    for (const part of item.content ||
      []) {
      for (const a of part.annotations ||
        []) {
        if (
          a.type === "url_citation" &&
          a.url
        ) {
          into.set(a.url, {
            url: a.url,
            title: a.title || "",
          });
        }
      }
    }
  }
};

const textFromResponse = (
  response
) =>
  (response?.output || [])
    .filter((o) => o.type === "message")
    .flatMap((o) => o.content || [])
    .filter(
      (c) => c.type === "output_text"
    )
    .map((c) => c.text)
    .join("\n")
    .trim();

/*
 * Parses a fetch() SSE body and calls onEvent(type, data).
 */
async function readSse(
  body,
  onEvent
) {
  const reader = body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";

  for (;;) {
    const { value, done } =
      await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    let index;

    while (
      (index =
        buffer.indexOf("\n\n")) !== -1
    ) {
      const block = buffer.slice(
        0,
        index
      );

      buffer = buffer.slice(index + 2);

      let type = "message";
      const dataLines = [];

      for (const line of block.split(
        "\n"
      )) {
        if (line.startsWith("event:")) {
          type = line
            .slice(6)
            .trim();
        } else if (
          line.startsWith("data:")
        ) {
          dataLines.push(
            line.slice(5).trim()
          );
        }
      }

      if (!dataLines.length) {
        continue;
      }

      const raw = dataLines.join("\n");

      if (raw === "[DONE]") {
        continue;
      }

      try {
        onEvent(type, JSON.parse(raw));
      } catch (error) {
        if (error?.name === "SyntaxError") {
          continue;
        }

        throw error;
      }
    }
  }
}

/*
|--------------------------------------------------------------------------
| callModel
|--------------------------------------------------------------------------
|
| Returns { text, citations: [{url,title}] }.
|
| onText(delta)   – called for every streamed text token (enables streaming)
| onSearch(query) – called when the model starts a web search
|
*/

export async function callModel({
  stage,
  system,
  user,
  search = false,
  maxTokens = 6000,
  signal,
  onText,
  onSearch,
  timeoutMs = 300_000,
}) {
  const key =
    process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not configured."
    );
  }

  const stream = Boolean(
    onText || onSearch
  );

  const body = {
    model: modelFor(stage),

    input: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: user,
      },
    ],

    max_output_tokens: maxTokens,

    ...(stream ? { stream: true } : {}),

    ...(search
      ? {
          tools: [
            { type: searchTool() },
          ],
        }
      : {}),
  };

  for (
    let attempt = 1;
    attempt <= 4;
    attempt += 1
  ) {
    const timeout = withTimeout(
      signal,
      timeoutMs
    );

    try {
      const res = await fetch(
        `${baseUrl()}/responses`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${key}`,
          },

          body: JSON.stringify(body),

          signal: timeout.signal,
        }
      );

      if (!res.ok) {
        const detail = (
          await res.text()
        ).slice(0, 400);

        if (
          (res.status === 429 ||
            res.status >= 500) &&
          attempt < 4
        ) {
          await sleep(attempt * 4000);
          continue;
        }

        throw new Error(
          `OpenAI ${res.status}: ${detail}`
        );
      }

      const citations = new Map();

      /* ------------------ non-streaming ------------------ */

      if (!stream) {
        const data = await res.json();

        collectCitations(
          data,
          citations
        );

        const text =
          textFromResponse(data);

        if (!text) {
          throw new Error(
            "OpenAI returned no text."
          );
        }

        return {
          text,
          citations: [
            ...citations.values(),
          ],
        };
      }

      /* -------------------- streaming -------------------- */

      let text = "";
      let completed = null;

      await readSse(
        res.body,
        (type, data) => {
          if (
            type ===
            "response.output_text.delta"
          ) {
            text += data.delta || "";
            onText?.(data.delta || "");
            return;
          }

          if (
            type.startsWith(
              "response.web_search_call"
            ) ||
            (type ===
              "response.output_item.added" &&
              data.item?.type ===
                "web_search_call")
          ) {
            const query =
              data.item?.action
                ?.query ||
              data.action?.query ||
              "";

            if (
              type ===
                "response.web_search_call.searching" ||
              type ===
                "response.output_item.added"
            ) {
              onSearch?.(query);
            }

            return;
          }

          if (
            type ===
            "response.output_item.done"
          ) {
            if (
              data.item?.type ===
                "web_search_call" &&
              data.item?.action?.query
            ) {
              onSearch?.(
                data.item.action.query
              );
            }

            return;
          }

          if (
            type ===
            "response.completed"
          ) {
            completed = data.response;
            return;
          }

          if (
            type === "response.failed" ||
            type === "error"
          ) {
            throw new Error(
              data.response?.error
                ?.message ||
                data.message ||
                "OpenAI stream failed."
            );
          }
        }
      );

      if (completed) {
        collectCitations(
          completed,
          citations
        );

        if (!text) {
          text =
            textFromResponse(completed);
        }
      }

      if (!text.trim()) {
        throw new Error(
          "OpenAI returned no text."
        );
      }

      return {
        text,
        citations: [
          ...citations.values(),
        ],
      };
    } finally {
      timeout.done();
    }
  }

  throw new Error(
    "OpenAI request failed after retries."
  );
}

/*
|--------------------------------------------------------------------------
| generateImage -> Buffer
|--------------------------------------------------------------------------
|
| Tries OPENAI_IMAGE_MODEL first, then OPENAI_IMAGE_FALLBACKS
| (default "dall-e-3"), moving on ONLY when the model is missing or the
| account has no access to it. The first model that works is remembered.
|
*/

let workingImageModel = "";

const imageModelChain = () => {
  const chain = [
    workingImageModel,
    process.env.OPENAI_IMAGE_MODEL ||
      "gpt-image-1-mini",
    ...(
      process.env
        .OPENAI_IMAGE_FALLBACKS ||
      "dall-e-3"
    ).split(","),
  ]
    .map((m) => m.trim())
    .filter(Boolean);

  return [...new Set(chain)];
};

/* Each model family accepts different parameters. */
const imageParams = (imageModel) => {
  if (imageModel.startsWith("gpt-image")) {
    return {
      size:
        process.env.OPENAI_IMAGE_SIZE ||
        "1536x1024",

      /* low = cheapest; fine for an abstract cover illustration */
      quality:
        process.env
          .OPENAI_IMAGE_QUALITY || "low",
    };
  }

  if (imageModel === "dall-e-3") {
    return {
      size: "1792x1024",
      quality: "standard",
      response_format: "b64_json",
    };
  }

  /* dall-e-2 and anything older */
  return {
    size: "1024x1024",
    response_format: "b64_json",
  };
};

const isModelAccessError = (
  status,
  text
) =>
  status === 403 ||
  status === 404 ||
  (status === 400 &&
    /model|does not exist|not have access|must be verified/i.test(
      text
    ));

export async function generateImage({
  prompt,
  signal,
}) {
  const key =
    process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not configured."
    );
  }

  const failures = [];

  for (const imageModel of imageModelChain()) {
    const timeout = withTimeout(
      signal,
      180_000
    );

    try {
      const res = await fetch(
        `${baseUrl()}/images/generations`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${key}`,
          },

          body: JSON.stringify({
            model: imageModel,
            prompt,
            n: 1,
            ...imageParams(imageModel),
          }),

          signal: timeout.signal,
        }
      );

      if (!res.ok) {
        const text = (
          await res.text()
        ).slice(0, 300);

        if (
          isModelAccessError(
            res.status,
            text
          )
        ) {
          failures.push(
            `${imageModel}: ${res.status}`
          );

          continue; /* try the next model */
        }

        throw new Error(
          `OpenAI image ${res.status}: ${text}`
        );
      }

      const data = await res.json();
      const item = data?.data?.[0];

      workingImageModel = imageModel;

      if (item?.b64_json) {
        return Buffer.from(
          item.b64_json,
          "base64"
        );
      }

      if (item?.url) {
        const img = await fetch(
          item.url,
          { signal: timeout.signal }
        );

        return Buffer.from(
          await img.arrayBuffer()
        );
      }

      throw new Error(
        "OpenAI returned no image."
      );
    } finally {
      timeout.done();
    }
  }

  throw new Error(
    `No image model is available for this OpenAI account (${failures.join(
      ", "
    )}). Verify your organization in OpenAI settings, or set OPENAI_IMAGE_MODEL to a model you can use.`
  );
}
