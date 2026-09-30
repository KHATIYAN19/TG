import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  CreditCard,
  Shield,
  User,
  Clock,
  Award,
  Wallet,
} from "lucide-react";

/* ===== FUNCTION TO CALCULATE EXPERIENCE ===== */
const calculateExperience = (joiningDate) => {
  const join = new Date(joiningDate);
  const now = new Date();

  let years = now.getFullYear() - join.getFullYear();
  let months = now.getMonth() - join.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} Years ${months} Months`;
};

const UserProfile = () => {
  const employee = {
    name: "Rahul Sharma",
    employeeId: "TT-EMP-1024",
    email: "rahul.sharma@targettrek.in",
    phone: "+91 9876543210",
    dob: "1996-08-14",
    gender: "Male",
    address: "Dwarka Sector 12, New Delhi, India",
    emergencyContact: "+91 9123456789",

    joiningDate: "2022-03-12",
    employmentType: "Commission Based", // Permanent / Commission Based
    department: "Marketing",
    designation: "Digital Marketing Manager",
    status: "Active",

    salary: 45000,
    commissionRate: "20% Commission on Sales",

    aadhar: "1234-5678-9012",
    pan: "ABCDE1234F",

    bankName: "HDFC Bank",
    accountNumber: "XXXXXX4589",
    ifsc: "HDFC0001234",

    leaveBalance: 12,
    totalProjects: 34,
    performanceRating: "4.6/5",
  };

  const experience = calculateExperience(employee.joiningDate);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ===== HEADER ===== */}
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">

          <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg">
            {employee.name.charAt(0)}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">
              {employee.name}
            </h1>
            <p className="text-blue-600 font-medium mt-1">
              {employee.designation}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Employee ID: {employee.employeeId}
            </p>
            <p className="text-sm mt-2 text-green-600 font-medium">
              {employee.status}
            </p>
          </div>
        </div>

        {/* ===== PERSONAL DETAILS ===== */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Personal Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <p><User size={14} className="inline mr-2 text-blue-600"/>Gender: {employee.gender}</p>
            <p><Calendar size={14} className="inline mr-2 text-blue-600"/>DOB: {employee.dob}</p>
            <p><Mail size={14} className="inline mr-2 text-blue-600"/>Email: {employee.email}</p>
            <p><Phone size={14} className="inline mr-2 text-blue-600"/>Phone: {employee.phone}</p>
            <p><MapPin size={14} className="inline mr-2 text-blue-600"/>Address: {employee.address}</p>
            <p><Phone size={14} className="inline mr-2 text-blue-600"/>Emergency: {employee.emergencyContact}</p>
          </div>
        </div>

        {/* ===== EMPLOYMENT DETAILS ===== */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Employment Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <p><Briefcase size={14} className="inline mr-2 text-blue-600"/>Department: {employee.department}</p>
            <p><Briefcase size={14} className="inline mr-2 text-blue-600"/>Employment Type: {employee.employmentType}</p>
            <p><Calendar size={14} className="inline mr-2 text-blue-600"/>Joining Date: {employee.joiningDate}</p>
            <p><Clock size={14} className="inline mr-2 text-blue-600"/>Experience: {experience}</p>
          </div>
        </div>

        {/* ===== SALARY DETAILS ===== */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Salary Structure
          </h2>

          <div className="text-sm text-gray-600 space-y-2">
            {employee.employmentType === "Permanent" ? (
              <p>
                <Wallet size={14} className="inline mr-2 text-blue-600"/>
                Monthly Salary: ₹{employee.salary}
              </p>
            ) : (
              <p>
                <Wallet size={14} className="inline mr-2 text-blue-600"/>
                {employee.commissionRate}
              </p>
            )}
          </div>
        </div>

        {/* ===== BANK DETAILS ===== */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Bank Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <p><CreditCard size={14} className="inline mr-2 text-blue-600"/>Bank: {employee.bankName}</p>
            <p><CreditCard size={14} className="inline mr-2 text-blue-600"/>Account No: {employee.accountNumber}</p>
            <p><CreditCard size={14} className="inline mr-2 text-blue-600"/>IFSC: {employee.ifsc}</p>
          </div>
        </div>

        {/* ===== GOVERNMENT DETAILS ===== */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Government Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <p><Shield size={14} className="inline mr-2 text-blue-600"/>Aadhar: {employee.aadhar}</p>
            <p><Shield size={14} className="inline mr-2 text-blue-600"/>PAN: {employee.pan}</p>
          </div>
        </div>

        {/* ===== PERFORMANCE SUMMARY ===== */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <Award className="mx-auto text-blue-600 mb-2" size={28}/>
            <h3 className="text-2xl font-bold">{employee.totalProjects}</h3>
            <p className="text-sm text-gray-500">Projects Completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <Award className="mx-auto text-blue-600 mb-2" size={28}/>
            <h3 className="text-2xl font-bold">{employee.performanceRating}</h3>
            <p className="text-sm text-gray-500">Performance Rating</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <Clock className="mx-auto text-blue-600 mb-2" size={28}/>
            <h3 className="text-2xl font-bold">{employee.leaveBalance}</h3>
            <p className="text-sm text-gray-500">Leave Balance</p>
          </div>
        </div>

        {/* ===== DOCUMENTS ===== */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            Documents
          </h2>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2 hover:text-blue-600 cursor-pointer">
              <FileText size={14}/> Offer Letter.pdf
            </p>
            <p className="flex items-center gap-2 hover:text-blue-600 cursor-pointer">
              <FileText size={14}/> NDA Agreement.pdf
            </p>
            <p className="flex items-center gap-2 hover:text-blue-600 cursor-pointer">
              <FileText size={14}/> ID Proof.pdf
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;