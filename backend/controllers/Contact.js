import Contact from '../models/Contact.js';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import User from "../models/User.js"
import fs from 'fs/promises';
import  path from 'path';
import sendMail from '../utils/MailSender.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
        'Web Development', 'Affiliate Marketing', 'Other Inquiry'
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

    // --- Send Email to Admins ---
    const adminSubject = 'New Contact Inquiry Received - Target Trek';
    const adminTemplatePath = path.resolve(__dirname, '../templates/contactNotification.html');
    let adminHtmlTemplate;

    try {
        adminHtmlTemplate = await fs.readFile(adminTemplatePath, 'utf8');
        adminHtmlTemplate = adminHtmlTemplate
            .replace('{{fullname}}', name)
            .replace('{{email}}', email)
            .replace('{{mobile}}', contactNumber)
            .replace('{{service}}', service);

        // Conditionally include the message section for admins
        if (message) {
            adminHtmlTemplate = adminHtmlTemplate.replace('{{#if message}}', '').replace('{{/if}}', '').replace('{{message}}', message);
        } else {
            // Remove the optional-message block if no message is provided
            adminHtmlTemplate = adminHtmlTemplate.replace(/\{\{#if message\}\}[\s\S]*?\{\{\/if\}\}/, '');
        }

    } catch (error) {
        console.error('Error reading admin email template or replacing placeholders:', error);
        // Continue execution, do not block response due to email error
    }

    const adminPlainText = `New contact inquiry received:\nFull Name: ${name}\nEmail: ${email}\nMobile Number: ${contactNumber}\nService: ${service}${message ? `\nMessage: ${message}` : ''}`;

    try {
        const admins = await User.find({}); // Fetch all users, filter if you have an 'isAdmin' field
        if (admins && admins.length > 0) {
            for (const admin of admins) {
                if (admin.email) { // Ensure admin has an email
                    await sendMail(admin.email, adminSubject, adminPlainText, adminHtmlTemplate);
                }
            }
            console.log(`Notification sent to ${admins.length} admin(s).`);
        } else {
            console.log('No admins found to notify.');
        }
    } catch (error) {
        console.error('Error fetching or sending email to admins:', error);
        // Continue execution, do not block response due to email error
    }

    // --- Send Confirmation Email to User ---
    const userSubject = 'Target Trek: Thank You for Your Inquiry!';
    const userTemplatePath = path.resolve(__dirname, '../templates/contactuserNotification.html');
    let userHtmlTemplate;

    try {
        userHtmlTemplate = await fs.readFile(userTemplatePath, 'utf8');
        userHtmlTemplate = userHtmlTemplate
            .replace('{{name}}', name.split(' ')[0]) // Use first name for a more personal touch
            .replace('{{service}}', service);
    } catch (error) {
        console.error('Error reading user email template or replacing placeholders:', error);
        // Continue execution, do not block response due to email error
    }

    const userPlainText = `Hi ${name.split(' ')[0]},\n\nThanks for contacting Target Trek! We've received your message regarding "${service}" and our team will get back to you as soon as possible.\n\nBest regards,\nTeam Target Trek`;

    try {
        await sendMail(email, userSubject, userPlainText, userHtmlTemplate);
        console.log(`Confirmation email sent to user: ${email}`);
    } catch (error) {
        console.error('Error sending confirmation email to user:', error);
        // Log the error but still send success response to frontend
    }

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


export const addReplyToMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replyText } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid message ID format.' });
  }
  if (!replyText || replyText.trim().length === 0) {
     return res.status(400).json({ message: 'Reply text cannot be empty.' });
  }
  const message = await Contact.findById(id);
  if (!message) {
    res.status(404);
    throw new Error('Contact message not found.');
  }

  const newReply = {
    replyText: replyText.trim(),
    replyDate: new Date(),
  };

  message.replies.push(newReply);
  message.isRead = true;
  const updatedMessage = await message.save();
  res.status(200).json({
    message: 'Reply added successfully.',
    contact: updatedMessage,
  });
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