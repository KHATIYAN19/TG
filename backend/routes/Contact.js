import express from 'express';
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  toggleMessageReadStatus,
  addReplyToMessage,
  deleteContactMessage
} from '../controllers/Contact.js';
import {auth,isAdmin,isEmployee,isUser} from  "../Middleware/auth.js"
import { publicFormLimiter } from "../Middleware/rateLimiter.js";
import * as PB from "../Middleware/publicBudgets.js";
const router = express.Router();

router.post('/us', publicFormLimiter, PB.formDaily, createContactMessage);

/*
  SECURITY FIX: these routes used `router.route(path, auth, isUser)`, but
  Express' route() takes ONLY a path, so the login/role checks were silently
  ignored and anyone could list, read, delete and reply to contact messages.
  The middleware is now attached to each handler.
*/
router.get('/', auth, isUser, getAllContactMessages);

router.get('/:id', auth, isAdmin, getContactMessageById);
router.delete('/:id', auth, isAdmin, deleteContactMessage);

router.patch('/:id/read', auth, isUser, toggleMessageReadStatus);

router.post('/:id/reply', auth, isUser, addReplyToMessage);

export default router;