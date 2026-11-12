import crypto from "crypto";

// Secure book access token (the raw token goes to the buyer, only its hash is stored).
export const generateDownloadToken = () => crypto.randomBytes(32).toString("hex");

export const hashDownloadToken = (token) => {
  if (!token) {
    throw new Error("Access token is required.");
  }

  return crypto.createHash("sha256").update(String(token)).digest("hex");
};
