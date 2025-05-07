import PortfolioItem from '../models/PortFolioItem.js';
import uploadFile from '../utils/cloudinary.js';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
const generateSlug = (title = '') => {
    if (!title) return '';
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')          
        .replace(/[^\w-]+/g, '')       
        .replace(/--+/g, '-')           
        .replace(/^-+/, '')           
        .replace(/-+$/, '');        
};

export const createPortfolioItem = async (req, res) => {
  try {
    const d=await PortfolioItem.find({});
    console.log(d);
    let { title, description, category, tags, imageUrl, altText, slug, isPublished } = req.body;
    if(imageUrl){
      imageUrl=imageUrl[0];
    }
    
    if (!title || !description || !category || !tags) {
      return res.status(400).json({
        message: "Title, Description, Category, and Tags are required fields.",
        success: false
      });
    }

    const newItemData = {
      title,
      description,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []),
      altText: altText || null,
      isPublished: isPublished === 'true'
    };

    let finalImageUrl = null;
    if (req.file) {
      try {
        const result = await uploadFile(req.file.path);
        if (result && result.secure_url) {
            finalImageUrl = result.secure_url;
        } else {
            throw new Error('Image upload succeeded but did not return a secure URL.');
        }
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.status(500).json({ message: 'Error uploading image', error: uploadError.message, success: false });
      }
    } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      finalImageUrl = imageUrl.trim();
    }

    if (!finalImageUrl) {
        return res.status(400).json({
            message: "An image is required. Please either upload a file or provide a valid image URL.",
            success: false
        });
    }
    newItemData.imageUrl = finalImageUrl;
    let finalSlug = slug ? generateSlug(slug) : '';
    if (!finalSlug && title) {
      finalSlug = generateSlug(title);
    }

    if (!finalSlug) {
      return res.status(400).json({ message: 'Slug is required and could not be generated from title.', success: false });
    }
    newItemData.slug = finalSlug;
    const newItem = new PortfolioItem(newItemData);
    await newItem.save();

    res.status(201).json({ data: newItem, success: true, message: "Portfolio item created successfully." });

  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return res.status(400).json({
        message: `Error: The slug '${error.keyValue.slug}' is already in use. Please use a different title or provide a unique custom slug.`,
        field: 'slug',
        success: false
      });
    } else if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation Error', errors: messages, success: false });
    }
    console.error('Error creating portfolio item:', error);
    res.status(500).json({ message: 'Server error while creating portfolio item', error: error.message, success: false });
  }
};

export const deletePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await PortfolioItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Portfolio item not found', success: false });
    }
    res.status(200).json({ message: 'Portfolio item deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({ message: 'Error deleting portfolio item', error: error.message, success: false });
  }
};

export const toggleIsPublished = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await PortfolioItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found', success: false });
    }
    item.isPublished = !item.isPublished;
    await item.save();
    res.status(200).json({ data: item, success: true, message: 'Portfolio item status updated successfully.' });
  } catch (error) {
    console.error('Error updating portfolio item status:', error);
    res.status(500).json({ message: 'Error updating portfolio item status', error: error.message, success: false });
  }
};

export const getAllPortfolioItems = async (req, res) => {
  try {
    const items = await PortfolioItem.find().sort({ createdAt: -1 });
    res.status(200).json({ data: items, success: true });
  } catch (error) {
    console.error('Error fetching all portfolio items:', error);
    res.status(500).json({ message: 'Error fetching portfolio items', error: error.message, success: false });
  }
};

export const getPublishedPortfolioItems = async (req, res) => {
  try {
    const items = await PortfolioItem.find({ isPublished: true }).sort({ createdAt: -1 });
    res.status(200).json({ data: items, success: true });
  } catch (error) {
    console.error('Error fetching published portfolio items:', error);
    res.status(500).json({ message: 'Error fetching published portfolio items', error: error.message, success: false });
  }
};

export const getPortfolioItemBySlug = async (req, res) => {
    try {
      const { slug } = req.params;
      if (!slug) {
        return res.status(400).json({ message: 'Slug parameter is required', success: false });
      }
      const item = await PortfolioItem.findOne({ slug: slug });
      if (!item) {
        return res.status(404).json({ message: 'Portfolio item not found', success: false });
      }
      res.status(200).json({ data: item, success: true });
    } catch (error) {
      console.error('Error fetching portfolio item by slug:', error);
      res.status(500).json({ message: 'Error fetching portfolio item', error: error.message, success: false });
    }
};


