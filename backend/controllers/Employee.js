import User from "../models/user.model.js";


export const updateBasicInfo = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, mobile },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updatePersonalInfo = async (req, res) => {
  try {
    const { dob, gender, address, emergencyContact } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { dob, gender, address, emergencyContact },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateEmploymentInfo = async (req, res) => {
  try {
    const {
      employeeId,
      department,
      designation,
      joiningDate,
      employmentType,
      salary,
      commissionRate,
      status,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        employeeId,
        department,
        designation,
        joiningDate,
        employmentType,
        salary,
        commissionRate,
        status,
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== Update Bank Details ===== */
export const updateBankDetails = async (req, res) => {
  try {
    const { bankName, accountNumber, ifsc } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        bankDetails: { bankName, accountNumber, ifsc },
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== Update Government Details ===== */
export const updateGovernmentDetails = async (req, res) => {
  try {
    const { aadharNumber, panNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        governmentDetails: { aadharNumber, panNumber },
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== Upload / Add Document ===== */
export const addDocument = async (req, res) => {
  try {
    const { name, fileUrl } = req.body;

    if (!name || !fileUrl) {
      return res.status(400).json({ message: "Name & fileUrl required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          documents: { name, fileUrl },
        },
      },
      { new: true }
    );

    res.json({ success: true, data: user.documents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== Delete Document ===== */
export const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          documents: { _id: docId },
        },
      },
      { new: true }
    );

    res.json({ success: true, data: user.documents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};