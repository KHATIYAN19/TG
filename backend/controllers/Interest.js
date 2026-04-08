import Interest from "../models/interest.js";

const isValidPhone = (phone) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone);
};


export const addInterest = async (req, res) => {
  try {
    const { name, contactNumber, service } = req.body;
    if (!name || !contactNumber || !service) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!isValidPhone(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact number must be valid Indian number",
      });
    }

    const newInterest = await Interest.create({
      name: name.trim(),
      contactNumber: contactNumber,
      service: service,
    });

    res.status(201).json({
      success: true,
      message: "Interest added successfully",
      data: newInterest,
    });

  } catch (error) {
    console.log(error)
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



export const deleteInterest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const existing = await Interest.findById(id);

    if (!existing || existing.is_deleted) {
      return res.status(404).json({
        success: false,
        message: "Interest not found or already deleted",
      });
    }

    existing.is_deleted = true;
    await existing.save();

    res.status(200).json({
      success: true,
      message: "Interest deleted successfully",
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllInterests = async (req, res) => {
  try {
    const interests = await Interest.find({ is_deleted: false })
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: interests.length,
      data: interests,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllDeletedInterests = async (req, res) => {
  try {
    const interests = await Interest.find({ is_deleted: true })
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: interests.length,
      data: interests,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};