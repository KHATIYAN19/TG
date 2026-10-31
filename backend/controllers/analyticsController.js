import * as analytics from "../services/analyticsService.js";

// POST /api/analytics/track  (public)
//
// One endpoint for everything the browser reports:
//   type = page_view | heartbeat | engagement | event |
//          page_exit | session_end
//
// Tracking must never break the website, so unexpected
// server errors are swallowed and answered with 202.
export const trackController = async (req, res, next) => {
  try {
    const data = await analytics.track(req.body, req);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.status && error.status < 500) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }

    console.error("[analytics] track failed:", error);

    return res.status(202).json({ success: false });
  }
};
