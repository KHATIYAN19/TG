import axios from "axios";
import crypto from "crypto";
import {
    CASHFREE_APP_ID,
    CASHFREE_SECRET_KEY,
    CASHFREE_API_VERSION,
    CASHFREE_BASE_URL,
    validateCashfreeConfig
} from "../config/cashfree.js";

const getHeaders = () => {
    validateCashfreeConfig();
    return {
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": CASHFREE_API_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json"
    };
};

export const generateCashfreeOrderId = () => {
    return `CF${Date.now()}${crypto.randomBytes(6).toString("hex")}`;
};

export const createCashfreeOrderRequest = async (payload) => {
    const response = await axios.post(
        `${CASHFREE_BASE_URL}/orders`,
        payload,
        {
            headers: getHeaders(),
            timeout: 15000
        }
    );
    return response.data;
};

export const fetchCashfreeOrder = async (orderId) => {
    const response = await axios.get(
        `${CASHFREE_BASE_URL}/orders/${encodeURIComponent(orderId)}`,
        {
            headers: getHeaders(),
            timeout: 15000
        }
    );
    return response.data;
};

export const fetchCashfreePayments = async (orderId) => {
    const response = await axios.get(
        `${CASHFREE_BASE_URL}/orders/${encodeURIComponent(orderId)}/payments`,
        {
            headers: getHeaders(),
            timeout: 15000
        }
    );
    return Array.isArray(response.data) ? response.data : [];
};

export const verifyCashfreeWebhookSignature = ({
    rawBody,
    signature,
    timestamp
}) => {
    if (!rawBody || !signature || !timestamp || !CASHFREE_SECRET_KEY) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", CASHFREE_SECRET_KEY)
        .update(`${timestamp}${rawBody}`)
        .digest("base64");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(String(signature));

    if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
    );
};

export const getCashfreeError = (error) => {
    return error?.response?.data || {
        message: error?.message || "Cashfree request failed."
    };
};