/* Development only: pays instantly. Needs MEMORY_ALLOW_MOCK_PAYMENTS=true and NODE_ENV != production. */
export default {
  id: "mock",
  label: "Test payment (development only)",
  isConfigured: () => process.env.MEMORY_ALLOW_MOCK_PAYMENTS === "true" && process.env.NODE_ENV !== "production",
  async createCheckout({ order, amountPaise }) {
    return { gatewayOrderId: `mock_${order._id}`, checkout: { type: "mock", orderId: `mock_${order._id}`, amount: amountPaise } };
  },
  verifyClient: (order, payload = {}) => ({ paid: true, paymentId: String(payload.paymentId || `mockpay_${order._id}`), amountPaise: order.amount }),
  fetchStatus: async () => ({ paid: false }),
};
