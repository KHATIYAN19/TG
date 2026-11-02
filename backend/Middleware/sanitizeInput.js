/*
  NoSQL-operator injection guard.

  Removes any key starting with "$" (e.g. {"$ne": null}, {"$gt": ""})
  from the parsed request body, so user input can never be interpreted
  as a MongoDB query operator when it is placed in a filter.

  Express 5's default "simple" query parser only yields strings/arrays,
  and route params are strings, so req.body is the only object-shaped
  input. Raw webhook Buffers are left untouched.
*/

const MAX_DEPTH = 10;

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;

const strip = (value, depth = 0) => {
  if (depth > MAX_DEPTH) return;

  if (Array.isArray(value)) {
    for (const item of value) strip(item, depth + 1);
    return;
  }

  if (!isPlainObject(value)) return;

  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || key === "__proto__") {
      delete value[key];
    } else {
      strip(value[key], depth + 1);
    }
  }
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) strip(req.body);
  next();
};

export default sanitizeInput;
