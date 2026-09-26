import express from "express";

import {
  getSalesDashboard,
  getBookSalesDashboard,
  getAffiliateSalesDashboard,
} from "../controllers/bookSales.js";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";


const router = express.Router();

router.get(
  "/sales",
  auth,
  isAdmin,
  getSalesDashboard
);

router.get(
  "/sales/books/:bookId", 
     auth,
    isAdmin,
  getBookSalesDashboard
);

router.get(
  "/sales/affiliates/:affiliateCode",
    auth,
    isAdmin,
  getAffiliateSalesDashboard
);

export default router;