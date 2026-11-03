import express from "express";

import {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getAvailableCoupons,
  permanentlyDeleteCoupon,
} from "../controllers/couponController.js";

import {auth,isAdmin} from "../Middleware/auth.js";
import * as PB from "../Middleware/publicBudgets.js";


const router =
  express.Router();


router.get(
  "/available",
  PB.couponList,
  getAvailableCoupons
);


router.post(
  "/validate",
  PB.couponValidate,
  validateCoupon
);


router.post(
  "/admin",
  auth,
  isAdmin,
  createCoupon
);


router.get(
  "/admin",
  auth,
  isAdmin,
  getAllCoupons
);


router.get(
  "/admin/:id",
  auth,
  isAdmin,
  getCouponById
);


router.put(
  "/admin/:id",
  auth,
  isAdmin,
  updateCoupon
);


router.delete(
  "/admin/:id/permanent",
  auth,
  isAdmin,
  permanentlyDeleteCoupon
);


router.delete(
  "/admin/:id",
  auth,
  isAdmin,
  deleteCoupon
);


export default router;