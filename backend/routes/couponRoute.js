import express from "express";

import {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

import {auth,isAdmin} from "../Middleware/auth.js";


const router =
  express.Router();


router.post(
  "/validate",
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
  "/admin/:id",
  auth,
  isAdmin,
  deleteCoupon
);


export default router;