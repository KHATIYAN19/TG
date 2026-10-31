import * as report from "../services/analyticsReportService.js";

const handler = (fn) => async (req, res, next) => {
  try {
    const data = await fn(req);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const range = (req) => report.resolveRange(req.query);

// Common query: ?period=today|yesterday|24h|7d|30d|90d|180d|365d
//   or ?period=custom&from=2026-10-01&to=2026-10-31

export const getLive = handler(() => report.getLiveReport());

export const getLiveHistory = handler((req) =>
  report.getLiveHistory(range(req))
);

export const getDashboard = handler((req) =>
  report.getDashboard(range(req))
);

export const getOverview = handler((req) =>
  report.getOverview(range(req))
);

export const getTimeline = handler((req) =>
  report.getTrafficTimeline(range(req), req.query.page)
);

// ?sort=views|unique|scroll|engagement&limit=20
export const getPages = handler((req) =>
  report.getTopPages(range(req), {
    sort: req.query.sort,
    limit: req.query.limit,
  })
);

// ?page=/books/dsa
export const getPageDetails = handler((req) =>
  report.getPageDetails(range(req), req.query.page)
);

export const getEntryExit = handler((req) =>
  report.getEntryExitPages(range(req), req.query.limit)
);

export const getReferrals = handler((req) =>
  report.getReferralReport(range(req))
);

export const getSources = handler((req) =>
  report.getSourceReport(range(req))
);

// ?key=ref&page=/books
export const getQueryParams = handler((req) =>
  report.getQueryParams(range(req), {
    key: req.query.key,
    page: req.query.page,
  })
);

export const getDevices = handler((req) =>
  report.getDeviceReport(range(req))
);

export const getGeo = handler((req) =>
  report.getGeoReport(range(req))
);

export const getEvents = handler((req) =>
  report.getEventReport(range(req))
);

export const getHeatmap = handler((req) =>
  report.getHeatmap(range(req))
);

// ?page=1&limit=20&q=&ref=ASH&device=mobile&country=IN&returning=true
export const getVisitors = async (req, res, next) => {
  try {
    const { data, pagination } = await report.listVisitors(
      req.query,
      range(req)
    );

    return res
      .status(200)
      .json({ success: true, data, pagination });
  } catch (error) {
    next(error);
  }
};

// ?status=ACTIVE|ENDED&ref=ASH&landingPage=/books&visitorId=
export const getSessions = async (req, res, next) => {
  try {
    const { data, pagination } = await report.listSessions(
      req.query,
      range(req)
    );

    return res
      .status(200)
      .json({ success: true, data, pagination });
  } catch (error) {
    next(error);
  }
};

export const getVisitorJourney = handler((req) =>
  report.getVisitorJourney(String(req.params.visitorId).slice(0, 40))
);
