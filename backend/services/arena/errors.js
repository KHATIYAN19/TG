export class ArenaError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.name = "ArenaError";
    this.status = status;
    this.code = code;
    this.extra = extra; // e.g. { retryAfter: 540 }
  }
}

export const sendError = (res, error, fallback = "Something went wrong") => {
  if (error instanceof ArenaError) {
    if (error.extra?.retryAfter) res.set("Retry-After", String(error.extra.retryAfter));
    return res.status(error.status).json({
      success: false,
      code: error.code,
      message: error.message,
      ...error.extra,
    });
  }

  if (error?.name === "ZodError") {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: error.issues?.[0]?.message || "Invalid request",
      issues: error.issues?.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({ success: false, code: "INVALID_ID", message: "Invalid identifier" });
  }

  console.error("[arena]", error);
  return res.status(500).json({ success: false, code: "SERVER_ERROR", message: fallback });
};

/* Wrap async handlers so every failure maps to a JSON error. */
export const handle = (fn, fallback) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    sendError(res, error, fallback);
  }
};
