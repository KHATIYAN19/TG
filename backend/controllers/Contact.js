import Contact from '../models/Contact.js';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import User from "../models/User.js"
import fs from 'fs/promises';
import  path from 'path';
import sendMail from '../utils/MailSender.js';
import { fileURLToPath } from 'url';
import { buildReplyEmail, sanitizeReplyHtml, htmlToText, SUPPORT_REPLY_TO } from '../services/contactReply/replyEmail.js';
import { draftReply } from '../services/contactReply/aiReply.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
export const createContactMessage = asyncHandler(async (req, res) => {
    const { name, email, contactNumber, service, message } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: 'Name is required and must be at least 2 characters.' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        return res.status(400).json({ message: 'A valid email address is required.' });
    }
    if (!contactNumber || contactNumber.trim().length < 10) {
        return res.status(400).json({ message: 'Contact number is required and must be at least 10 digits.' });
    }
    const allowedServices = [
        'PPC Advertising', 'Social Media Marketing', 'Email Marketing',
        'Web Development', 'Affiliate Marketing', 'Other Inquiry',
        'Google/Meta Ads','Social Media Marketing','Gen AI'
    ];
    if (!service || !allowedServices.includes(service.trim())) {
        return res.status(400).json({ message: 'A valid service selection is required.' });
    }

    const newContact = new Contact({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        contactNumber: contactNumber.trim(),
        service: service.trim(),
        message: message ? message.trim() : '', // Ensure message is trimmed or empty string
    });

    const savedContact = await newContact.save();
    // --- Send Confirmation Email to User ---
    const userSubject = 'Target Trek: Thank You for Your Inquiry!';
    const userTemplatePath = path.resolve(__dirname, '../templates/contactuserNotification.html');
    let userHtmlTemplate;

    try {
        userHtmlTemplate = await fs.readFile(userTemplatePath, 'utf8');
        userHtmlTemplate = userHtmlTemplate
            .replace('{{name}}', escapeHtml(name.split(' ')[0])) // Use first name for a more personal touch
            .replace('{{service}}', escapeHtml(service));
    } catch (error) {
        console.error('Error reading user email template or replacing placeholders:', error);
        // Continue execution, do not block response due to email error
    }

    const userPlainText = `Hi ${name.split(' ')[0]},\n\nThanks for contacting Target Trek! We've received your message regarding "${service}" and our team will get back to you as soon as possible.\n\nBest regards,\nTeam Target Trek`;

    // try {
    //     await sendMail(email, userSubject, userPlainText, userHtmlTemplate);
    //     console.log(`Confirmation email sent to user: ${email}`);
    // } catch (error) {
    //     console.error('Error sending confirmation email to user:', error);
    //     // Log the error but still send success response to frontend
    // }

    res.status(201).json({
        message: 'Your message has been received successfully! We will get back to you soon.',
        contact: savedContact,
    });
});


export const getAllContactMessages = asyncHandler(async (req, res) => {
    const messages = await Contact.find({})
                                  .sort({ isRead: 1, createdAt: 1 });
    res.status(200).json({
      count: messages.length,
      messages,
    });
  });
export const getContactMessageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid message ID format.' });
  }
  const message = await Contact.findById(id);
  if (!message) {
    res.status(404);
    throw new Error('Contact message not found.');
  }
  res.status(200).json(message);
});

export const toggleMessageReadStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid message ID format.' });
    }
    const updatedMessage = await Contact.findByIdAndUpdate(
      id,
      [{ $set: { isRead: { $not: "$isRead" } } }], 
      { new: true, runValidators: true } 
    );
    if (!updatedMessage) {
      res.status(404);
      throw new Error('Contact message not found.');
    }
    res.status(200).json({
      message: `Message marked as ${updatedMessage.isRead ? 'read' : 'unread'}.`,
      contact: updatedMessage
    });
  });


const loadContact = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid message ID format.' });
    return null;
  }
  const message = await Contact.findById(id);
  if (!message) {
    res.status(404).json({ message: 'Contact message not found.' });
    return null;
  }
  return message;
};

// Renders the exact HTML the customer will receive (used by the preview).
export const previewReply = asyncHandler(async (req, res) => {
  const message = await loadContact(req, res);
  if (!message) return;
  const { subject = '', bodyHtml = '' } = req.body || {};
  res.status(200).json({
    html: buildReplyEmail({ subject, bodyHtml, name: message.name }),
    to: message.email,
    replyTo: SUPPORT_REPLY_TO,
  });
});

// Chat agent: drafts / edits subject + body from the admin's prompt.
export const generateReplyDraft = asyncHandler(async (req, res) => {
  const message = await loadContact(req, res);
  if (!message) return;
  const { prompt, history, currentDraft } = req.body || {};
  if (!prompt || !String(prompt).trim()) {
    return res.status(400).json({ message: 'Please type an instruction for the assistant.' });
  }
  try {
    const draft = await draftReply({ contact: message, prompt, history: Array.isArray(history) ? history : [], currentDraft });
    if (!draft.bodyHtml) {
      return res.status(502).json({ message: 'The assistant returned an empty draft. Please try again.' });
    }
    res.status(200).json({ ...draft, bodyHtml: sanitizeReplyHtml(draft.bodyHtml) });
  } catch (error) {
    console.error('[CONTACT AI] draft failed:', error.message);
    res.status(502).json({ message: error.message || 'AI draft failed.' });
  }
});

// Sends the reply email to the customer and records it on the query.
export const addReplyToMessage = asyncHandler(async (req, res) => {
  const message = await loadContact(req, res);
  if (!message) return;

  const { subject, bodyHtml } = req.body || {};
  const cleanSubject = String(subject || '').replace(/[\r\n]+/g, ' ').trim();
  const cleanBody = sanitizeReplyHtml(bodyHtml || '');
  const plain = htmlToText(cleanBody);

  if (!cleanSubject) return res.status(400).json({ message: 'Subject is required.' });
  if (cleanSubject.length > 200) return res.status(400).json({ message: 'Subject is too long (max 200 characters).' });
  if (!plain) return res.status(400).json({ message: 'Email body cannot be empty.' });

  const html = buildReplyEmail({ subject: cleanSubject, bodyHtml: cleanBody, name: message.name });

  try {
    await sendMail(message.email, cleanSubject, `${plain}\n\nWarm regards,\nTeam Target Trek\n${SUPPORT_REPLY_TO}`, html, {
      replyTo: SUPPORT_REPLY_TO,
      sync: true,
    });
  } catch (error) {
    console.error('[CONTACT REPLY] send failed:', error.message);
    return res.status(502).json({ message: `Email could not be sent: ${error.message}` });
  }

  message.replies.push({
    replyText: plain,
    subject: cleanSubject,
    bodyHtml: cleanBody,
    sentTo: message.email,
    replyTo: SUPPORT_REPLY_TO,
    sentBy: req.user?.email || req.user?.name || '',
    emailSent: true,
    replyDate: new Date(),
  });
  message.isRead = true;
  const updatedMessage = await message.save();
  res.status(200).json({ message: 'Reply emailed successfully.', contact: updatedMessage });
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid message ID format.' });
    }
    const deletedMessage = await Contact.findByIdAndDelete(id);
    if (!deletedMessage) {
        res.status(404);
        throw new Error('Contact message not found.');
    }
    res.status(200).json({ message: 'Contact message deleted successfully.' });
});