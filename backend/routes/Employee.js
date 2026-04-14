import express from 'express';
import {updateBasicInfo,
  updatePersonalInfo,
  updateEmploymentInfo,
  updateBankDetails,
  updateGovernmentDetails,
  addDocument,
  deleteDocument, } from '../controllers/User.js'; 
const router = express.Router();

import {auth,isAdmin,isEmployee,isUser} from  "../Middleware/auth.js"


/* ===== Basic Info ===== */
router.put("/:id/basic",auth,isAdmin, updateBasicInfo);

/* ===== Personal Info ===== */
router.put("/:id/personal",auth, updatePersonalInfo);

/* ===== Employment Info ===== */
router.put("/:id/employment",auth,isAdmin, updateEmploymentInfo);


router.put("/:id/bank",auth, updateBankDetails);


router.put("/:id/government",auth,isAdmin, updateGovernmentDetails);

router.post("/:id/document",auth,isAdmin, addDocument);
router.delete("/:id/document/:docId",auth,isAdmin, deleteDocument);

export default router;