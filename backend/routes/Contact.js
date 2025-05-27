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
const router = express.Router();

router.post('/us', createContactMessage);

router.route('/',auth,isUser)
  .get(getAllContactMessages);

router.route('/:id',auth,isAdmin)
  .get(getContactMessageById)
  .delete(deleteContactMessage);

router.route('/:id/read',auth,isUser)
  .patch(toggleMessageReadStatus);

router.route('/:id/reply',auth,isUser)
  .post(addReplyToMessage);

export default router;