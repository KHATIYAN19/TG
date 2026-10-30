
import * as report from "../services/analyticsReportService.js";

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

function success(res, data) {
  return res.status(200).json({
    success: true,
    data,
  });
}

// GET /overview?period=7d
export const getOverview = asyncHandler(
  async (req, res) => {
    const data = await report.getOverview(
      req.query.period || "7d"
    );

    return success(res, data);
  }
);

// GET /timeline?period=30d
export const getTimeline = asyncHandler(
  async (req, res) => {
    const data = await report.getTrafficTimeline(
      req.query.period || "7d"
    );

    return success(res, data);
  }
);

// GET /pages?period=7d&sort=views&limit=20
export const getPages = asyncHandler(
  async (req, res) => {
    const data = await report.getTopPages(
      req.query.period || "7d",
      {
        sort: req.query.sort || "views",
        limit: req.query.limit || 20,
      }
    );

    return success(res, data);
  }
);

// GET /page-details?period=7d&page=/books
export const getPageDetails = asyncHandler(
  async (req, res) => {
    const data = await report.getPageDetails(
      req.query.period || "7d",
      req.query.page
    );

    return success(res, data);
  }
);

// GET /referrals?period=30d
export const getReferrals = asyncHandler(
  async (req, res) => {
    const data = await report.getReferralReport(
      req.query.period || "7d"
    );

    return success(res, data);
  }
);

// GET /devices?period=30d
export const getDevices = asyncHandler(
  async (req, res) => {
    const data = await report.getDeviceReport(
      req.query.period || "7d"
    );

    return success(res, data);
  }
);

// GET /live
export const getLive = asyncHandler(
  async (req, res) => {
    const data = await report.getLiveReport();
    return success(res, data);
  }
);
