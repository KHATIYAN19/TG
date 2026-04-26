import Client from "../models/Client.js";
import fs from "fs";
import uploadFile from "../utils/document_cloudinary.js";


export const addClient = async (req, res) => {
  try {
    const { name, companyName, email, phone, address, notes } = req.body;

    if (!name || !companyName) {
      return res.status(400).json({
        message: "Name and Company Name are required",
      });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone must be 10 digits",
      });
    }

    const client = await Client.create({
      name,
      companyName,
      email,
      phone,
      address,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: client,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const addServiceToClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const {
      serviceName,
      notes,
      pricingType,
      price,
      gst,
      startDate,
      endDate,
    } = req.body;

    /* ✅ Required checks */
    if (!serviceName || !pricingType || price === undefined || startDate=== undefined) {
      return res.status(400).json({
        message: "serviceName, pricingType, price and startDate are required",
      });
    }

    if (!["ONE-TIME", "MONTHLY"].includes(pricingType)) {
      return res.status(400).json({
        message: "Invalid pricingType",
      });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        message: "Invalid price",
      });
    }

    if (gst !== undefined && (isNaN(gst) || gst < 0)) {
      return res.status(400).json({
        message: "Invalid GST",
      });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    /* ✅ Calculate */
    const totalPrice = Number(price) + Number(gst || 0);

    const newService = {
      serviceName,
      notes,
      pricingType,
      price,
      gst: gst || 0,
      totalPrice,
      remainingAmount: totalPrice,
      startDate,
      endDate,
    };

    client.services.push(newService);
    await client.save();

    res.json({
      success: true,
      message: "Service added successfully",
      data: client.services,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const addPaymentToService = async (req, res) => {
  try {
    const { clientId, serviceId } = req.params;
    const { amount, paidBy, transactionId, notes } = req.body;

    if (amount === undefined || !paidBy) {
      return res.status(400).json({
        message: "amount and paidBy are required",
      });
    }

    /* ✅ Enum validation */
    if (!["UPI", "BANK", "CARD", "CASH"].includes(paidBy)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    /* ✅ Number validation */
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
      });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const service = client.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    /* ❌ Prevent overpayment */
    if (amount > service.remainingAmount) {
      return res.status(400).json({
        message: "Payment exceeds remaining amount",
      });
    }

    /* ✅ Add payment */
    service.payments.push({
      amount,
      paidBy,
      transactionId,
      notes,
    });

    /* ✅ Update remaining */
    service.remainingAmount -= amount;

    /* ✅ Auto complete */
    if (service.remainingAmount === 0) {
      service.status = "COMPLETED";
    }

    await client.save();

    res.json({
      success: true,
      message: "Payment added successfully",
      data: service,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addDocumentToService = async (req, res) => {
  try {
    const { clientId, serviceId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Document name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const service = client.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // ✅ UPLOAD USING BUFFER (NO LOCAL FILE)
    const result = await uploadFile(req.file.buffer);

    service.documents.push({
      name,
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      publicId: result.public_id,
    });

    await client.save();

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: service.documents,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};


export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find()
      .select("name email companyName phone _id createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getClientServices = async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    return res.status(200).json({
      success: true,
      data: client,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getServiceDetails = async (req, res) => {
  try {
    const { clientId, serviceId } = req.params;

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const service = client.services.id(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= HELPERS ================= */
const fillYearlyData = (data, type = "revenue") => {
  const now = new Date();
  const currentYear = now.getFullYear();

  const map = {};
  data.forEach((item) => {
    map[item._id.year] = item;
  });

  const result = [];

  for (let year = currentYear - 4; year <= currentYear; year++) {
    if (map[year]) {
      result.push({
        year,
        ...(type === "clients"
          ? { total: map[year].total }
          : {
              totalPrice: map[year].totalPrice || 0,
              totalGST: map[year].totalGST || 0,
              remaining: map[year].remaining || 0,
            }),
      });
    } else {
      result.push({
        year,
        ...(type === "clients"
          ? { total: 0 }
          : { totalPrice: 0, totalGST: 0, remaining: 0 }),
      });
    }
  }

  return result;
};

const fillMonthlyData = (data, type = "revenue") => {
  const now = new Date();

  const map = {};
  data.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    map[key] = item;
  });

  const result = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    const key = `${year}-${month}`;

    if (map[key]) {
      result.push({
        year,
        month,
        ...(type === "clients"
          ? { total: map[key].total }
          : {
              totalPrice: map[key].totalPrice || 0,
              totalGST: map[key].totalGST || 0,
              remaining: map[key].remaining || 0,
            }),
      });
    } else {
      result.push({
        year,
        month,
        ...(type === "clients"
          ? { total: 0 }
          : { totalPrice: 0, totalGST: 0, remaining: 0 }),
      });
    }
  }

  return result;
};

/* ================= MAIN CONTROLLER ================= */
export const getFullDashboard = async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const startOf5Years = new Date(now.getFullYear() - 4, 0, 1);
    const startOf12Months = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1
    );

    const next5Days = new Date();
    next5Days.setDate(next5Days.getDate() + 5);

    const result = await Client.aggregate([
      {
        $facet: {
          /* ================= SUMMARY ================= */
          clientStats: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                today: {
                  $sum: {
                    $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0],
                  },
                },
                week: {
                  $sum: {
                    $cond: [{ $gte: ["$createdAt", startOfWeek] }, 1, 0],
                  },
                },
                month: {
                  $sum: {
                    $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0],
                  },
                },
                year: {
                  $sum: {
                    $cond: [{ $gte: ["$createdAt", startOfYear] }, 1, 0],
                  },
                },
              },
            },
          ],

          revenueSummary: [
            { $unwind: "$services" },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$services.totalPrice" },
                totalGST: { $sum: "$services.gst" },
                totalRemaining: { $sum: "$services.remainingAmount" },
              },
            },
          ],

          revenueTime: [
            { $unwind: "$services" },
            { $unwind: "$services.payments" },
            {
              $group: {
                _id: null,
                today: {
                  $sum: {
                    $cond: [
                      { $gte: ["$services.payments.createdAt", startOfToday] },
                      "$services.payments.amount",
                      0,
                    ],
                  },
                },
                week: {
                  $sum: {
                    $cond: [
                      { $gte: ["$services.payments.createdAt", startOfWeek] },
                      "$services.payments.amount",
                      0,
                    ],
                  },
                },
                month: {
                  $sum: {
                    $cond: [
                      { $gte: ["$services.payments.createdAt", startOfMonth] },
                      "$services.payments.amount",
                      0,
                    ],
                  },
                },
                year: {
                  $sum: {
                    $cond: [
                      { $gte: ["$services.payments.createdAt", startOfYear] },
                      "$services.payments.amount",
                      0,
                    ],
                  },
                },
                totalRevenue: { $sum: "$services.payments.amount" },
              },
            },
          ],

          /* ================= GRAPHS ================= */
          revenueYearly: [
            { $unwind: "$services" },
            {
              $group: {
                _id: { year: { $year: "$services.createdAt" } },
                totalPrice: { $sum: "$services.totalPrice" },
                totalGST: { $sum: "$services.gst" },
                remaining: { $sum: "$services.remainingAmount" },
              },
            },
          ],

          revenueMonthly: [
            { $unwind: "$services" },
            {
              $group: {
                _id: {
                  year: { $year: "$services.createdAt" },
                  month: { $month: "$services.createdAt" },
                },
                totalPrice: { $sum: "$services.totalPrice" },
                totalGST: { $sum: "$services.gst" },
                remaining: { $sum: "$services.remainingAmount" },
              },
            },
          ],

          clientYearly: [
            {
              $group: {
                _id: { year: { $year: "$createdAt" } },
                total: { $sum: 1 },
              },
            },
          ],

          clientMonthly: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                total: { $sum: 1 },
              },
            },
          ],

          /* ================= LAST 5 PAYMENTS ================= */
          lastPayments: [
            { $unwind: "$services" },
            { $unwind: "$services.payments" },
            {
              $project: {
                clientName: "$name",
                amount: "$services.payments.amount",
                paidBy: "$services.payments.paidBy",
                date: "$services.payments.createdAt",
              },
            },
            { $sort: { date: -1 } },
            { $limit: 5 },
          ],

          /* ================= ALERTS ================= */
          topPending: [
            { $unwind: "$services" },
            { $match: { "services.remainingAmount": { $gt: 0 } } },
            {
              $project: {
                clientName: "$name",
                email: "$email",
                phone: "$phone",
                company: "$companyName",
                serviceName: "$services.serviceName",
                remaining: "$services.remainingAmount",
              },
            },
            { $sort: { remaining: -1 } },
            { $limit: 5 },
          ],

          expiringSoon: [
            { $unwind: "$services" },
            {
              $match: {
                "services.endDate": { $gte: now, $lte: next5Days },
              },
            },
            {
              $project: {
                clientName: "$name",
                email: "$email",
                phone: "$phone",
                company: "$companyName",
                serviceName: "$services.serviceName",
                startDate: "$services.startDate",
                endDate: "$services.endDate",
                pricingType: "$services.pricingType",
              },
            },
            { $limit: 5 },
          ],

          expiredServices: [
            { $unwind: "$services" },
            {
              $match: { "services.endDate": { $lt: now } },
            },
            {
              $project: {
                clientName: "$name",
                email: "$email",
                phone: "$phone",
                company: "$companyName",
                serviceName: "$services.serviceName",
                startDate: "$services.startDate",
                endDate: "$services.endDate",
                pricingType: "$services.pricingType",
              },
            },
            { $limit: 5 },
          ],
        },
      },
    ]);

    const data = result[0];

    const summaryClients = data.clientStats[0] || {};
    const summaryRevenue = data.revenueSummary[0] || {};
    const timeRevenue = data.revenueTime[0] || {};

    const nonGST =
      (summaryRevenue.totalAmount || 0) - (summaryRevenue.totalGST || 0);

    res.json({
      summary: {
        clients: summaryClients,
        revenue: timeRevenue,
        totals: {
          totalAmount: summaryRevenue.totalAmount || 0,
          totalGST: summaryRevenue.totalGST || 0,
          totalRevenue: timeRevenue.totalRevenue || 0,
          totalRemaining: summaryRevenue.totalRemaining || 0,
          nonGST,
        },
      },

      revenue: {
        yearly: fillYearlyData(data.revenueYearly),
        monthly: fillMonthlyData(data.revenueMonthly),
      },

      clients: {
        yearly: fillYearlyData(data.clientYearly, "clients"),
        monthly: fillMonthlyData(data.clientMonthly, "clients"),
      },

      payments: {
        last5: data.lastPayments,
      },

      alerts: {
        topPending: data.topPending,
        expiringSoon: data.expiringSoon,
        expired: data.expiredServices,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};