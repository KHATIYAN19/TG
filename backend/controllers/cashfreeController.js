import mongoose from "mongoose";
import Book from "../models/Book.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import {
    generateCashfreeOrderId,
    createCashfreeOrderRequest,
    fetchCashfreeOrder,
    fetchCashfreePayments,
    verifyCashfreeWebhookSignature,
    getCashfreeError
} from "../utils/cashfree.js";
import {
    generateDownloadToken,
    hashDownloadToken
} from "../utils/payu.js";
import {
    validateCouponForPayment
} from "../controllers/couponController.js";
import {
    CASHFREE_ENV
} from "../config/cashfree.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://targettrek.in";
const BACKEND_URL = process.env.BACKEND_URL || "https://target-trek.onrender.com";
const ACCESS_DURATION = 24 * 60 * 60 * 1000;

const failedRedirect = (orderId = null) => {
    if (!orderId) {
        return `${FRONTEND_URL}/payment/failed`;
    }
    return `${FRONTEND_URL}/payment/failed?order=${encodeURIComponent(orderId)}`;
};

const successRedirect = (token, orderId) => {
    return `${FRONTEND_URL}/payment/success?token=${encodeURIComponent(token)}&order=${encodeURIComponent(orderId)}`;
};

const buildCouponData = (pricing) => {
    if (!pricing.couponApplied) {
        return {
            applied: false,
            couponId: null,
            code: null,
            name: null,
            description: null,
            discountType: null,
            discountValue: 0,
            maxDiscountAmount: null,
            minimumOrderAmount: null,
            originalAmount: pricing.originalAmount,
            discountAmount: 0,
            finalAmount: pricing.finalAmount,
            appliedAt: null
        };
    }

    return {
        applied: true,
        couponId: pricing.coupon.couponId,
        code: pricing.coupon.code,
        name: pricing.coupon.name,
        description: pricing.coupon.description,
        discountType: pricing.coupon.discountType,
        discountValue: pricing.coupon.discountValue,
        maxDiscountAmount: pricing.coupon.maxDiscountAmount,
        minimumOrderAmount: pricing.coupon.minimumOrderAmount,
        originalAmount: pricing.originalAmount,
        discountAmount: pricing.discountAmount,
        finalAmount: pricing.finalAmount,
        appliedAt: new Date()
    };
};

const amountMatches = (first, second) => {
    const a = Number(first);
    const b = Number(second);
    return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 0.01;
};

const getPaymentMethod = (payment) => {
    if (payment?.payment_group) {
        return String(payment.payment_group);
    }

    const method = payment?.payment_method;

    if (method && typeof method === "object") {
        const keys = Object.keys(method);
        if (keys.length) {
            return keys[0];
        }
    }

    return null;
};

const verifyCashfreePayment = async (order) => {
    const [cashfreeOrder, payments] = await Promise.all([
        fetchCashfreeOrder(order.payment.transactionId),
        fetchCashfreePayments(order.payment.transactionId)
    ]);

    const successfulPayment = payments.find(
        (payment) => String(payment?.payment_status || "").toUpperCase() === "SUCCESS"
    );

    const expectedAmount = Number(order.payment.amount);
    const orderAmount = Number(cashfreeOrder?.order_amount);
    const paymentAmount = Number(successfulPayment?.payment_amount);
    const expectedCurrency = String(order.book.currency || "INR").toUpperCase();
    const orderCurrency = String(cashfreeOrder?.order_currency || "").toUpperCase();
    const paymentCurrency = String(successfulPayment?.payment_currency || "").toUpperCase();

    const orderPaid = String(cashfreeOrder?.order_status || "").toUpperCase() === "PAID";

    const amountVerified =
        amountMatches(expectedAmount, orderAmount) &&
        amountMatches(expectedAmount, paymentAmount);

    const currencyVerified =
        orderCurrency === expectedCurrency &&
        paymentCurrency === expectedCurrency;

    return {
        verified: Boolean(
            orderPaid &&
            successfulPayment &&
            amountVerified &&
            currencyVerified
        ),
        amountVerified,
        currencyVerified,
        cashfreeOrder,
        payments,
        successfulPayment
    };
};

const incrementPurchaseCounters = async (order) => {
    if (order.coupon?.applied && order.coupon?.couponId) {
        try {
            await Coupon.updateOne(
                {
                    _id: order.coupon.couponId
                },
                {
                    $inc: {
                        usedCount: 1
                    }
                }
            );
        } catch (error) {
            console.error("Unable to increment coupon usage:", error);
        }
    }

    try {
        await Book.updateOne(
            {
                _id: order.bookId
            },
            {
                $inc: {
                    "stats.purchases": 1
                }
            }
        );
    } catch (error) {
        console.error("Unable to increment book purchases:", error);
    }
};

const createAccessTokenData = () => {
    const rawToken = generateDownloadToken();
    const tokenHash = hashDownloadToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(Date.now() + ACCESS_DURATION);

    return {
        rawToken,
        tokenHash,
        now,
        expiresAt
    };
};

const issueAccessTokenForPaidOrder = async (order) => {
    const access = createAccessTokenData();

    const updatedOrder = await Order.findOneAndUpdate(
        {
            _id: order._id,
            "payment.provider": "Cashfree",
            orderStatus: "PAID",
            "payment.status": "SUCCESS",
            "verification.cashfreeVerified": true,
            "verification.amountVerified": true
        },
        {
            $set: {
                "access.tokenHash": access.tokenHash,
                "access.expiresAt": access.expiresAt,
                "access.generatedAt": access.now,
                "access.lastAccessedAt": null,
                "access.accessCount": 0,
                "access.revoked": false,
                updatedBy: "cashfree-return"
            }
        },
        {
            new: true
        }
    );

    if (!updatedOrder) {
        return null;
    }

    return {
        order: updatedOrder,
        token: access.rawToken
    };
};

const markCashfreePaymentSuccessful = async ({
    order,
    verification,
    callbackResponse = null,
    signatureVerified = false,
    issueAccessToken = false,
    updatedBy = "cashfree"
}) => {
    const now = new Date();
    const payment = verification.successfulPayment;
    const firstSet = {
        orderStatus: "PAID",
        "payment.status": "SUCCESS",
        "payment.paymentId": payment?.cf_payment_id ? String(payment.cf_payment_id) : null,
        "payment.method": getPaymentMethod(payment),
        "payment.amount": Number(order.payment.amount),
        "payment.paidAt": now,
        "payment.failedAt": null,
        "payment.verificationResponse": {
            order: verification.cashfreeOrder,
            payments: verification.payments
        },
        "verification.cashfreeVerified": true,
        "verification.amountVerified": true,
        "verification.verifiedAt": now,
        updatedBy
    };

    if (callbackResponse) {
        firstSet["payment.callbackResponse"] = callbackResponse;
    }

    if (signatureVerified) {
        firstSet["verification.callbackHashVerified"] = true;
    }

    let access = null;

    if (issueAccessToken) {
        access = createAccessTokenData();
        firstSet["access.tokenHash"] = access.tokenHash;
        firstSet["access.expiresAt"] = access.expiresAt;
        firstSet["access.generatedAt"] = access.now;
        firstSet["access.lastAccessedAt"] = null;
        firstSet["access.accessCount"] = 0;
        firstSet["access.revoked"] = false;
    }

    const updatedOrder = await Order.findOneAndUpdate(
        {
            _id: order._id,
            "payment.provider": "Cashfree",
            orderStatus: {
                $ne: "PAID"
            }
        },
        {
            $set: firstSet
        },
        {
            new: true
        }
    );

    if (updatedOrder) {
        await incrementPurchaseCounters(updatedOrder);

        return {
            order: updatedOrder,
            token: access?.rawToken || null,
            firstPayment: true
        };
    }

    const duplicateSet = {
        "payment.paymentId": payment?.cf_payment_id ? String(payment.cf_payment_id) : order.payment.paymentId,
        "payment.method": getPaymentMethod(payment) || order.payment.method,
        "payment.verificationResponse": {
            order: verification.cashfreeOrder,
            payments: verification.payments
        },
        "verification.cashfreeVerified": true,
        "verification.amountVerified": true,
        "verification.verifiedAt": now,
        updatedBy
    };

    if (callbackResponse) {
        duplicateSet["payment.callbackResponse"] = callbackResponse;
    }

    if (signatureVerified) {
        duplicateSet["verification.callbackHashVerified"] = true;
    }

    if (issueAccessToken) {
        access = createAccessTokenData();
        duplicateSet["access.tokenHash"] = access.tokenHash;
        duplicateSet["access.expiresAt"] = access.expiresAt;
        duplicateSet["access.generatedAt"] = access.now;
        duplicateSet["access.lastAccessedAt"] = null;
        duplicateSet["access.accessCount"] = 0;
        duplicateSet["access.revoked"] = false;
    }

    const paidOrder = await Order.findOneAndUpdate(
        {
            _id: order._id,
            "payment.provider": "Cashfree",
            orderStatus: "PAID",
            "payment.status": "SUCCESS",
            "verification.cashfreeVerified": true,
            "verification.amountVerified": true
        },
        {
            $set: duplicateSet
        },
        {
            new: true
        }
    );

    return {
        order: paidOrder,
        token: access?.rawToken || null,
        firstPayment: false
    };
};

export const createCashfreePayment = async (req, res) => {
    let createdOrder = null;

    try {
        const {
            affiliateCode,
            bookId,
            firstname,
            email,
            phone,
            couponCode,
            utmSource,
            utmMedium,
            utmCampaign
        } = req.body;

        if (!bookId || !firstname || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, email, phone and bookId are required."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID."
            });
        }

        const book = await Book.findOne({
            _id: bookId,
            isPublished: true,
            isActive: true
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found."
            });
        }

        const normalizedAffiliateCode =
            typeof affiliateCode === "string" && affiliateCode.trim()
                ? affiliateCode.trim().toLowerCase()
                : null;

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedName = String(firstname).trim();
        const normalizedPhone = String(phone).trim();

        let pricing;

        try {
            pricing = await validateCouponForPayment({
                couponCode,
                book,
                email: normalizedEmail
            });
        } catch (error) {
            return res.status(error.statusCode || 400).json({
                success: false,
                code: error.code || "COUPON_INVALID",
                message: error.message || "Invalid coupon."
            });
        }

        const finalAmount = Number(pricing.finalAmount);

        if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount."
            });
        }

        const orderId = generateCashfreeOrderId();
        const couponData = buildCouponData(pricing);

        createdOrder = await Order.create({
            orderId,
            bookId: book._id,
            book: {
                title: book.title,
                price: book.price,
                mrp: book.mrp || book.price,
                currency: book.currency || "INR"
            },
            customer: {
                name: normalizedName,
                email: normalizedEmail,
                phone: normalizedPhone
            },
            coupon: couponData,
            payment: {
                provider: "Cashfree",
                affiliateCode: normalizedAffiliateCode,
                transactionId: orderId,
                amount: finalAmount,
                status: "PENDING"
            },
            orderStatus: "PENDING",
            metadata: {
                ipAddress:
                    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
                    req.socket.remoteAddress ||
                    null,
                userAgent: req.headers["user-agent"] || null,
                referrer: req.headers.referer || null,
                utmSource: utmSource || null,
                utmMedium: utmMedium || null,
                utmCampaign: utmCampaign || null
            },
            createdBy: "customer"
        });

        const cashfreePayload = {
            order_id: orderId,
            order_amount: finalAmount,
            order_currency: String(book.currency || "INR").toUpperCase(),
            customer_details: {
                customer_id: orderId,
                customer_name: normalizedName,
                customer_email: normalizedEmail,
                customer_phone: normalizedPhone
            },
            order_meta: {
                return_url: `${BACKEND_URL}/payment/cashfree/return?order_id={order_id}`,
                notify_url: `${BACKEND_URL}/payment/cashfree/webhook`
            },
            order_note: `Purchase ${book.title}`,
            order_tags: {
                book_id: String(book._id),
                affiliate_code: normalizedAffiliateCode || "direct"
            }
        };

        const cashfreeOrder = await createCashfreeOrderRequest(cashfreePayload);

        if (!cashfreeOrder?.payment_session_id) {
            throw new Error("Cashfree did not return payment_session_id.");
        }

        await Order.updateOne(
            {
                _id: createdOrder._id
            },
            {
                $set: {
                    "payment.sessionId": cashfreeOrder.payment_session_id,
                    "payment.createResponse": cashfreeOrder,
                    updatedBy: "cashfree-create"
                }
            }
        );

        return res.status(200).json({
            success: true,
            data: {
                orderId,
                paymentSessionId: cashfreeOrder.payment_session_id,
                cashfreeOrderId: cashfreeOrder.cf_order_id || null,
                environment: CASHFREE_ENV,
                pricing: {
                    couponApplied: pricing.couponApplied,
                    couponCode: pricing.coupon?.code || null,
                    couponName: pricing.coupon?.name || null,
                    originalAmount: pricing.originalAmount,
                    discountAmount: pricing.discountAmount,
                    finalAmount: pricing.finalAmount,
                    currency: book.currency || "INR"
                }
            }
        });
    } catch (error) {
        console.error(
            "Create Cashfree payment error:",
            getCashfreeError(error)
        );

        if (createdOrder?._id) {
            try {
                await Order.updateOne(
                    {
                        _id: createdOrder._id,
                        orderStatus: {
                            $ne: "PAID"
                        }
                    },
                    {
                        $set: {
                            orderStatus: "FAILED",
                            "payment.status": "FAILED",
                            "payment.failedAt": new Date(),
                            "payment.createResponse": getCashfreeError(error),
                            updatedBy: "cashfree-create"
                        }
                    }
                );
            } catch (updateError) {
                console.error(
                    "Cashfree order failure update error:",
                    updateError
                );
            }
        }

        return res.status(502).json({
            success: false,
            message:
                error?.response?.data?.message ||
                error?.message ||
                "Unable to create Cashfree payment."
        });
    }
};

export const cashfreeReturn = async (req, res) => {
    try {
        const orderId = String(req.query.order_id || "").trim();

        if (!orderId) {
            return res.redirect(failedRedirect());
        }

        const order = await Order.findOne({
            orderId,
            "payment.provider": "Cashfree"
        });

        if (!order) {
            return res.redirect(failedRedirect());
        }

        if (
            order.orderStatus === "PAID" &&
            order.payment.status === "SUCCESS" &&
            order.verification.cashfreeVerified &&
            order.verification.amountVerified
        ) {
            const access = await issueAccessTokenForPaidOrder(order);

            if (!access) {
                return res.redirect(failedRedirect(order.orderId));
            }

            return res.redirect(
                successRedirect(
                    access.token,
                    access.order.orderId
                )
            );
        }

        const verification = await verifyCashfreePayment(order);

        if (!verification.verified) {
            await Order.updateOne(
                {
                    _id: order._id,
                    orderStatus: {
                        $ne: "PAID"
                    }
                },
                {
                    $set: {
                        "payment.verificationResponse": {
                            order: verification.cashfreeOrder,
                            payments: verification.payments
                        },
                        "verification.cashfreeVerified": false,
                        "verification.amountVerified": verification.amountVerified,
                        "verification.verifiedAt": new Date(),
                        updatedBy: "cashfree-return"
                    }
                }
            );

            return res.redirect(
                failedRedirect(order.orderId)
            );
        }

        const result = await markCashfreePaymentSuccessful({
            order,
            verification,
            issueAccessToken: true,
            updatedBy: "cashfree-return"
        });

        if (!result.order || !result.token) {
            return res.redirect(
                failedRedirect(order.orderId)
            );
        }

        return res.redirect(
            successRedirect(
                result.token,
                result.order.orderId
            )
        );
    } catch (error) {
        console.error(
            "Cashfree return error:",
            getCashfreeError(error)
        );

        return res.redirect(
            failedRedirect()
        );
    }
};

export const cashfreeWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];
        const rawBody = req.rawBody;

        if (!rawBody) {
            return res.status(400).json({
                success: false,
                message: "Raw webhook body missing."
            });
        }

        const signatureVerified = verifyCashfreeWebhookSignature({
            rawBody,
            signature,
            timestamp
        });

        if (!signatureVerified) {
            return res.status(401).json({
                success: false,
                message: "Invalid Cashfree webhook signature."
            });
        }

        const payload = req.body;
        const orderId = payload?.data?.order?.order_id;
        const payment = payload?.data?.payment;
        const paymentStatus = String(
            payment?.payment_status || ""
        ).toUpperCase();
        const eventType = String(
            payload?.type || ""
        ).toUpperCase();

        if (!orderId) {
            return res.status(200).json({
                success: true
            });
        }

        const order = await Order.findOne({
            orderId,
            "payment.provider": "Cashfree"
        });

        if (!order) {
            return res.status(200).json({
                success: true
            });
        }

        if (
            paymentStatus === "SUCCESS" ||
            eventType === "PAYMENT_SUCCESS_WEBHOOK"
        ) {
            const verification = await verifyCashfreePayment(order);

            if (!verification.verified) {
                await Order.updateOne(
                    {
                        _id: order._id
                    },
                    {
                        $set: {
                            "payment.callbackResponse": payload,
                            "payment.verificationResponse": {
                                order: verification.cashfreeOrder,
                                payments: verification.payments
                            },
                            "verification.callbackHashVerified": true,
                            "verification.cashfreeVerified": false,
                            "verification.amountVerified": verification.amountVerified,
                            "verification.verifiedAt": new Date(),
                            updatedBy: "cashfree-webhook"
                        }
                    }
                );

                return res.status(200).json({
                    success: true
                });
            }

            await markCashfreePaymentSuccessful({
                order,
                verification,
                callbackResponse: payload,
                signatureVerified: true,
                issueAccessToken: false,
                updatedBy: "cashfree-webhook"
            });

            return res.status(200).json({
                success: true
            });
        }

        if (
            paymentStatus === "FAILED" ||
            eventType === "PAYMENT_FAILED_WEBHOOK"
        ) {
            await Order.updateOne(
                {
                    _id: order._id,
                    orderStatus: {
                        $ne: "PAID"
                    }
                },
                {
                    $set: {
                        orderStatus: "FAILED",
                        "payment.status": "FAILED",
                        "payment.paymentId": payment?.cf_payment_id
                            ? String(payment.cf_payment_id)
                            : null,
                        "payment.method": getPaymentMethod(payment),
                        "payment.failedAt": new Date(),
                        "payment.callbackResponse": payload,
                        "verification.callbackHashVerified": true,
                        updatedBy: "cashfree-webhook"
                    }
                }
            );

            return res.status(200).json({
                success: true
            });
        }

        if (
            paymentStatus === "USER_DROPPED" ||
            eventType === "PAYMENT_USER_DROPPED_WEBHOOK"
        ) {
            await Order.updateOne(
                {
                    _id: order._id,
                    orderStatus: {
                        $ne: "PAID"
                    }
                },
                {
                    $set: {
                        orderStatus: "CANCELLED",
                        "payment.status": "CANCELLED",
                        "payment.paymentId": payment?.cf_payment_id
                            ? String(payment.cf_payment_id)
                            : null,
                        "payment.method": getPaymentMethod(payment),
                        "payment.failedAt": new Date(),
                        "payment.callbackResponse": payload,
                        "verification.callbackHashVerified": true,
                        updatedBy: "cashfree-webhook"
                    }
                }
            );

            return res.status(200).json({
                success: true
            });
        }

        await Order.updateOne(
            {
                _id: order._id
            },
            {
                $set: {
                    "payment.callbackResponse": payload,
                    "verification.callbackHashVerified": true,
                    updatedBy: "cashfree-webhook"
                }
            }
        );

        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error(
            "Cashfree webhook error:",
            getCashfreeError(error)
        );

        return res.status(500).json({
            success: false,
            message: "Unable to process Cashfree webhook."
        });
    }
};

export const getCashfreePaymentStatus = async (req, res) => {
    try {
        const orderId = String(req.params.orderId || "").trim();

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required."
            });
        }

        let order = await Order.findOne({
            orderId,
            "payment.provider": "Cashfree"
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (
            order.orderStatus === "PAID" &&
            order.payment.status === "SUCCESS" &&
            order.verification.cashfreeVerified &&
            order.verification.amountVerified
        ) {
            return res.status(200).json({
                success: true,
                data: {
                    orderId: order.orderId,
                    orderStatus: order.orderStatus,
                    paymentStatus: order.payment.status,
                    paymentId: order.payment.paymentId,
                    method: order.payment.method,
                    amount: order.payment.amount,
                    verified: true
                }
            });
        }

        const verification = await verifyCashfreePayment(order);

        if (verification.verified) {
            const result = await markCashfreePaymentSuccessful({
                order,
                verification,
                issueAccessToken: false,
                updatedBy: "cashfree-status"
            });

            order = result.order || order;
        }

        return res.status(200).json({
            success: true,
            data: {
                orderId: order.orderId,
                orderStatus: verification.verified
                    ? "PAID"
                    : order.orderStatus,
                paymentStatus: verification.verified
                    ? "SUCCESS"
                    : order.payment.status,
                cashfreeOrderStatus:
                    verification.cashfreeOrder?.order_status ||
                    null,
                paymentId:
                    verification.successfulPayment?.cf_payment_id
                        ? String(
                            verification.successfulPayment.cf_payment_id
                        )
                        : order.payment.paymentId,
                amount: order.payment.amount,
                verified: verification.verified
            }
        });
    } catch (error) {
        console.error(
            "Get Cashfree payment status error:",
            getCashfreeError(error)
        );

        return res.status(500).json({
            success: false,
            message: "Unable to verify Cashfree payment."
        });
    }
};