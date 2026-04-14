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