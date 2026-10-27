
import express from "express";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";

import {
  createFinanceRecord,
  getFinanceRecords,
  getFinanceRecordById,
  updateFinanceRecord,
  softDeleteFinanceRecord,
  restoreFinanceRecord,
  hardDeleteFinanceRecord,
  getGatewaySettings,
  getFinanceOverview,
  getFinanceTrends,
  getMonthlyFinanceReport,
  getYearlyFinanceReport,
  getFinanceFilterOptions,
  getFinanceRecordSummary,
} from "../controllers/financeController.js";

const router = express.Router();

// All routes require admin access.
router.use(auth, isAdmin);

// ========================================
// FINANCE DASHBOARD
// ========================================

router.get(
  "/overview",
  getFinanceOverview
);

router.get(
  "/trends",
  getFinanceTrends
);

router.get(
  "/monthly-report",
  getMonthlyFinanceReport
);

router.get(
  "/yearly-report",
  getYearlyFinanceReport
);

router.get(
  "/record-summary",
  getFinanceRecordSummary
);

router.get(
  "/filter-options",
  getFinanceFilterOptions
);

router.get(
  "/gateway-settings",
  getGatewaySettings
);

// ========================================
// FINANCE RECORD CRUD
// ========================================

router.post(
  "/",
  createFinanceRecord
);

router.get(
  "/",
  getFinanceRecords
);

router.get(
  "/:id",
  getFinanceRecordById
);

router.patch(
  "/:id",
  updateFinanceRecord
);

// ========================================
// SOFT DELETE / RESTORE / HARD DELETE
// ========================================

router.patch(
  "/:id/soft-delete",
  softDeleteFinanceRecord
);

router.patch(
  "/:id/restore",
  restoreFinanceRecord
);

router.delete(
  "/:id",
  hardDeleteFinanceRecord
);

export default router;
