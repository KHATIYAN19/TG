import express from 'express';
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  toggleMessageReadStatus,
  addReplyToMessage,
  deleteContactMessage
} from '../controllers/Contact.js';
import {auth,isAdmin} from  "../Middleware/auth.js"
const router = express.Router();

router.post('/us', createContactMessage);

router.route('/',auth,isAdmin)
  .get(getAllContactMessages);

router.route('/:id',auth,isAdmin)
  .get(getContactMessageById)
  .delete(deleteContactMessage);

router.route('/:id/read',auth,isAdmin)
  .patch(toggleMessageReadStatus);

router.route('/:id/reply',auth,isAdmin)
  .post(addReplyToMessage);

export default router;