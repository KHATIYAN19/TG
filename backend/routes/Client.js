import express from "express";
import upload from "../utils/mutler.js";
import {auth,isAdmin,isEmployee,isUser} from  "../Middleware/auth.js"
import {
  addClient,
  addServiceToClient,
  addPaymentToService,
  addDocumentToService,
  getAllClients,
  getClientServices,
  getServiceDetails,
} from "../controllers/Client.js";

const router = express.Router();

router.post("/", auth,isAdmin,addClient);
router.get("/", auth,isAdmin,getAllClients);
router.post("/:clientId/services",auth,isAdmin, addServiceToClient);
router.get("/:clientId/services",auth,isAdmin, getClientServices);
router.get("/:clientId/services/:serviceId",auth,isAdmin, getServiceDetails);
router.post("/:clientId/services/:serviceId/payments", auth,isAdmin,addPaymentToService);
router.post(
  "/:clientId/services/:serviceId/documents",
  upload.single("file"),
  addDocumentToService
);
export default router;