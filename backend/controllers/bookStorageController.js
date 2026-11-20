import asyncHandler from "express-async-handler";

import {
  BookFileError,
  fileCounts,
  getStorageSettings,
  isTransferRunning,
  markStaleTransfer,
  providerStatus,
  setDefaultProvider,
  startTransfer,
} from "../services/books/bookFiles.js";

const adminIdOf = (req) => String(req.user?.id || req.user?._id || "");

const fail = (res, error) => {
  if (error instanceof BookFileError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  throw error;
};

const snapshot = async () => {
  // A transfer cut short by a restart would otherwise show "running" forever.
  if (!isTransferRunning()) await markStaleTransfer();

  const [settings, counts] = await Promise.all([getStorageSettings(), fileCounts()]);

  return { ...settings, providers: providerStatus(), counts };
};

export const getBookStorage = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await snapshot() });
});

export const updateBookStorage = asyncHandler(async (req, res) => {
  try {
    await setDefaultProvider(String(req.body?.provider || ""), adminIdOf(req));
  } catch (error) {
    return fail(res, error);
  }

  res.json({ success: true, data: await snapshot() });
});

export const transferBookStorage = asyncHandler(async (req, res) => {
  try {
    await startTransfer(String(req.body?.to || ""), adminIdOf(req));
  } catch (error) {
    return fail(res, error);
  }

  res.status(202).json({ success: true, data: await snapshot() });
});
