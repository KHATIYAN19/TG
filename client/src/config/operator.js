/*
  Operator details shown on the About and Contact pages. Set in .env (restart the dev server / redeploy):
    VITE_OPERATOR_NAME=...  VITE_OPERATOR_EMAIL=...  VITE_OPERATOR_ADDRESS=...  VITE_OPERATOR_MOBILE=... (optional)
  Anything left empty is simply not shown; if all are empty the whole block is hidden.
*/
const read = (v) => String(v || "").trim();

export const OPERATOR = {
  name: read(import.meta.env.VITE_OPERATOR_NAME),
  email: read(import.meta.env.VITE_OPERATOR_EMAIL),
  address: read(import.meta.env.VITE_OPERATOR_ADDRESS),
  mobile: read(import.meta.env.VITE_OPERATOR_MOBILE),
};

export const HAS_OPERATOR_INFO = Boolean(OPERATOR.name || OPERATOR.email || OPERATOR.address || OPERATOR.mobile);
