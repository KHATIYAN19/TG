// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Name is required']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true
//   },
//   mobile: {
//     type: String,
//     required: [true, 'Mobile number is required'],
//     unique: true,
//     match: [/^\d{10}$/, 'Mobile number must be 10 digits']
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required']
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'normal','Employee'],
//     default: 'normal'
//   },
//   otp: {
//     type: String,
//     default: null
//   },
//   otpExpiry: {
//     type: Date,
//     default: null
//   },
//   block:{
//     type:Boolean,
//     default:false
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('User', userSchema);




import mongoose from "mongoose";

/* ===== Bank Details Sub Schema ===== */
const bankSchema = new mongoose.Schema({
  bankName: String,
  accountNumber: String,
  ifsc: String,
}, { _id: false });

/* ===== Government Details Sub Schema ===== */
const governmentSchema = new mongoose.Schema({
  aadharNumber: {
    type: String,
    match: [/^\d{12}$/, "Aadhar must be 12 digits"],
  },
  panNumber: {
    type: String,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"],
  },
}, { _id: false });

/* ===== Main User Schema ===== */
const userSchema = new mongoose.Schema(
  {
    /* ===== Basic Auth Details ===== */
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      match: [/^\d{10}$/, "Mobile number must be 10 digits"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    role: {
      type: String,
      enum: ["admin", "normal", "Employee"],
      default: "normal",
    },

    /* ===== Personal Information ===== */
    dob: Date,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    address: String,
    emergencyContact: {
      type: String,
      match: [/^\d{10}$/, "Emergency contact must be 10 digits"],
    },

    /* ===== Employment Details ===== */
    employeeId: {
      type: String,
      unique: true,
      sparse: true, // Only required for employees
    },
    department: String,
    designation: String,
    joiningDate: Date,

    employmentType: {
      type: String,
      enum: ["Permanent", "Commission Based"],
    },

    salary: {
      type: Number, 
      default:0,
    },

    commissionRate: {
      type: String, 
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
    },

    /* ===== Bank Details ===== */
    bankDetails: bankSchema,

    /* ===== Government Details ===== */
    governmentDetails: governmentSchema,

    /* ===== Documents ===== */
    documents: [
      {
        name: String,
        fileUrl: String,
      },
    ],


    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },

    block: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ===== Virtual Field for Experience ===== */
userSchema.virtual("experience").get(function () {
  if (!this.joiningDate) return null;

  const now = new Date();
  const join = new Date(this.joiningDate);

  let years = now.getFullYear() - join.getFullYear();
  let months = now.getMonth() - join.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} Years ${months} Months`;
});

/* ===== Ensure Virtuals in JSON ===== */
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export default mongoose.model("User", userSchema);