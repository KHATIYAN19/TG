import Affiliate from "../models/Affiliate.js"
const getAllAffiliates = async (req, res) => {
    try {
      const affiliates = await Affiliate.find().sort({ createdAt: -1 });
      if (!affiliates || affiliates.length === 0) {
        return res.status(200).json({ success: true, message: 'No affiliates found.', data: [] });
      }
      res.status(200).json({ success: true, message: 'Affiliates retrieved successfully.', data: affiliates });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to retrieve affiliates.', error: error.message });
    }
  };
  
  const createAffiliate = async (req, res) => {
    try {
      const { name, email, phone, companyName, service } = req.body;
  
      if (!name || !email || !phone || !companyName || !service) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields.'
        });
      }
  
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.', errors: { email: 'Invalid email format' } });
      }
  
      const phoneRegex = /^[0-9]{10}$/;

      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format.',
          errors: { phone: 'Phone number must be exactly 10 digits.' }
        });
      }
  
  
      const newAffiliate = new Affiliate({ name, email, phone, companyName, service });
      const savedAffiliate = await newAffiliate.save();
      res.status(201).json({ success: true, message: 'Affiliate created successfully.', data: savedAffiliate });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = {};
        for (const field in error.errors) {
          errors[field] = error.errors[field].message;
        }
        return res.status(400).json({ success: false, message: 'Validation error.', errors: errors });
      }
      res.status(500).json({ success: false, message: 'Failed to create affiliate.', error: error.message });
    }
  };
  
  const deleteAffiliate = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedAffiliate = await Affiliate.findByIdAndDelete(id);
      if (!deletedAffiliate) {
        return res.status(404).json({ success: false, message: `Affiliate with ID ${id} not found.` });
      }
      res.status(200).json({ success: true, message: 'Affiliate deleted successfully.', data: deletedAffiliate });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete affiliate.', error: error.message });
    }
  };
  
  export { Affiliate, getAllAffiliates, createAffiliate, deleteAffiliate };