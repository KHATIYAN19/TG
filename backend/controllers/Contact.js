import Contact from '../models/Contact.js';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
export const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, contactNumber, service, subject, message } = req.body;
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
  if (!subject || subject.trim().length < 5) {
    return res.status(400).json({ message: 'Subject is required and must be at least 5 characters.' });
  }
  if (!message || message.trim().length < 10) {
    return res.status(400).json({ message: 'Message is required and must be at least 10 characters.' });
  }

  const newContact = new Contact({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    contactNumber: contactNumber.trim(),
    service: service.trim(),
    subject: subject.trim(),
    message: message.trim(),
  });
  const savedContact = await newContact.save();
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