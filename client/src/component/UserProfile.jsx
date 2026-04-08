// import React, { useState, useEffect } from 'react';
// import toast, { Toaster } from 'react-hot-toast';
//  import { useSelector } from 'react-redux';
// import { Eye, EyeOff, X, Check, Lock, User as UserIcon, Mail, Phone, Briefcase } from 'lucide-react';
// import Base_url from "../utils/Url"; 


// function UserProfile() {
//   const token = useSelector((state) => state.auth.token); // Uncomment this line in your actual project
//   const userData = useSelector((state) => state.auth.user); // Uncomment this line in your actual project



//   const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     // In a real application, if Redux 'user' state is available, use it.
//     // Otherwise, the initial dummy data will be used.
//     // if (user) {
//     //   setUserData(user);
//     // }
//     // For demonstration, simulating a fetch or direct Redux user assignment
//     // Remove this timeout and uncomment Redux lines in a real app
//     const fetchDummyUser = async () => {
//       await new Promise(resolve => setTimeout(resolve, 500));
//       // If you were to fetch from an API:
//       /*
//       try {
//         const response = await fetch(`${Base_url}/admin/profile`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         if (data.success) {
//           setUserData(data.user);
//         } else {
//           toast.error(data.message || 'Failed to fetch user profile');
//         }
//       } catch (err) {
//         toast.error(`Error fetching profile: ${err.message}`);
//       }
//       */
//     };
//     fetchDummyUser();
//   }, []); // Depend on 'user' from Redux if uncommented, otherwise empty array for initial load

//   const validatePassword = (password) => {
//     if (password.length < 6) {
//       return 'Password must be at least 6 characters long.';
//     }
//     return '';
//   };

//   const handleChangePassword = async () => {
//     toast.dismiss();
//     const currentPasswordError = validatePassword(currentPassword);
//     const newPasswordError = validatePassword(newPassword);

//     if (currentPasswordError) {
//       toast.error(`Current password: ${currentPasswordError}`);
//       return;
//     }
//     if (newPasswordError) {
//       toast.error(`New password: ${newPasswordError}`);
//       return;
//     }
//     if (newPassword !== confirmNewPassword) {
//       toast.error('New password and confirm new password do not match.');
//       return;
//     }
//     if (newPassword === currentPassword) {
//       toast.error('New password cannot be the same as the current password.');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const response = await fetch(`${Base_url}/admin/change-password`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       if (data.success) {
//         toast.success(data.message);
//         setShowChangePasswordModal(false);
//         setCurrentPassword('');
//         setNewPassword('');
//         setConfirmNewPassword('');
//       } else {
//         toast.error(data.message || 'Failed to change password');
//       }
//     } catch (err) {
//       toast.error(`Error changing password: ${err.message}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 font-sans flex flex-col items-center justify-center">
//       <Toaster position="top-center" reverseOrder={false} />

//       <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-md transform transition-all duration-300 hover:scale-[1.01]">
//         <div className="flex flex-col items-center mb-8">
//           <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-full shadow-lg mb-4">
//             <UserIcon className="w-12 h-12 text-white" />
//           </div>
//           <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">{userData.name}</h1>
//           <p className="text-gray-600 text-lg text-center">{userData.role}</p>
//         </div>

//         <div className="space-y-4 mb-8">
//           <div className="flex items-center text-gray-700">
//             <Mail className="w-5 h-5 mr-3 text-indigo-500" />
//             <span className="font-medium">Email:</span>
//             <span className="ml-2 text-gray-800 break-all">{userData.email}</span>
//           </div>
//           <div className="flex items-center text-gray-700">
//             <Phone className="w-5 h-5 mr-3 text-indigo-500" />
//             <span className="font-medium">Mobile:</span>
//             <span className="ml-2 text-gray-800">{userData.mobile}</span>
//           </div>
//         </div>

//         <button
//           onClick={() => setShowChangePasswordModal(true)}
//           className="w-full text-indigo-600 text-lg font-semibold underline hover:text-indigo-800 transition-colors duration-200 block text-center mt-6"
//         >
//           Change Password
//         </button>
//       </div>

//       {showChangePasswordModal && (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
//           <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative transform transition-all duration-300 scale-95 animate-scale-in">
//             <button
//               onClick={() => setShowChangePasswordModal(false)}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
//               aria-label="Close modal"
//             >
//               <X className="w-6 h-6" />
//             </button>
//             <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Change Your Password</h3>

//             <div className="space-y-5">
//               <div>
//                 <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="current-password">
//                   Current Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showCurrentPassword ? 'text' : 'password'}
//                     id="current-password"
//                     value={currentPassword}
//                     onChange={(e) => setCurrentPassword(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200"
//                     placeholder="Enter current password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//                     aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
//                   >
//                     {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="new-password">
//                   New Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showNewPassword ? 'text' : 'password'}
//                     id="new-password"
//                     value={newPassword}
//                     onChange={(e) => setNewPassword(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200"
//                     placeholder="Enter new password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowNewPassword(!showNewPassword)}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//                     aria-label={showNewPassword ? 'Hide password' : 'Show password'}
//                   >
//                     {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="confirm-new-password">
//                   Confirm New Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showConfirmNewPassword ? 'text' : 'password'}
//                     id="confirm-new-password"
//                     value={confirmNewPassword}
//                     onChange={(e) => setConfirmNewPassword(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200"
//                     placeholder="Confirm new password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//                     aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
//                   >
//                     {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-center space-x-4 mt-8">
//               <button
//                 onClick={() => setShowChangePasswordModal(false)}
//                 disabled={isSubmitting}
//                 className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-200 flex items-center font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <X className="w-5 h-5 mr-2" /> Cancel
//               </button>
//               <button
//                 onClick={handleChangePassword}
//                 disabled={isSubmitting}
//                 className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isSubmitting ? (
//                   <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                 ) : (
//                   <Lock className="w-5 h-5 mr-2" />
//                 )}
//                 Change Password
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default UserProfile;


// import React from "react";
// import {
//   Mail,
//   Phone,
//   MapPin,
//   Calendar,
//   Briefcase,
//   Award,
//   FileText,
//   Edit,
//   CheckCircle,
//   TrendingUp,
// } from "lucide-react";

// const UserProfile = () => {
//   const employee = {
//     name: "Rahul Sharma",
//     role: "Senior MERN Stack Developer",
//     employeeId: "TT-EMP-1024",
//     email: "rahul.sharma@targettrek.in",
//     phone: "+91 9876543210",
//     location: "New Delhi, India",
//     joiningDate: "12 March 2022",
//     department: "Technology",
//     experience: "5 Years",
//     skills: [
//       "React.js",
//       "Node.js",
//       "MongoDB",
//       "Express",
//       "Redux",
//       "AWS",
//       "Docker",
//     ],
//     projectsCompleted: 28,
//     performanceRating: "4.8/5",
//     status: "Active",
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
//       <div className="max-w-6xl mx-auto space-y-8">

//         {/* ===== Profile Header Card ===== */}
//         <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center md:items-start gap-8">

//           {/* Avatar */}
//           <div className="relative">
//             <img
//               src="https://i.pravatar.cc/150?img=12"
//               alt="Profile"
//               className="w-32 h-32 rounded-full border-4 border-blue-600 shadow-md"
//             />
//             <span className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow">
//               {employee.status}
//             </span>
//           </div>

//           {/* Basic Info */}
//           <div className="flex-1 text-center md:text-left">
//             <h1 className="text-3xl font-bold text-gray-800">
//               {employee.name}
//             </h1>
//             <p className="text-blue-600 font-medium mt-1">
//               {employee.role}
//             </p>
//             <p className="text-sm text-gray-500 mt-1">
//               Employee ID: {employee.employeeId}
//             </p>

//             <button className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition">
//               <Edit size={16} />
//               Edit Profile
//             </button>
//           </div>
//         </div>

//         {/* ===== Grid Sections ===== */}
//         <div className="grid md:grid-cols-2 gap-8">

//           {/* Personal Details */}
//           <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
//             <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
//               Personal Information
//             </h2>

//             <div className="space-y-3 text-gray-600 text-sm">
//               <p className="flex items-center gap-2">
//                 <Mail size={16} className="text-blue-600" />
//                 {employee.email}
//               </p>
//               <p className="flex items-center gap-2">
//                 <Phone size={16} className="text-blue-600" />
//                 {employee.phone}
//               </p>
//               <p className="flex items-center gap-2">
//                 <MapPin size={16} className="text-blue-600" />
//                 {employee.location}
//               </p>
//               <p className="flex items-center gap-2">
//                 <Calendar size={16} className="text-blue-600" />
//                 Joined on {employee.joiningDate}
//               </p>
//             </div>
//           </div>

//           {/* Employment Details */}
//           <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
//             <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
//               Employment Details
//             </h2>

//             <div className="space-y-3 text-gray-600 text-sm">
//               <p className="flex items-center gap-2">
//                 <Briefcase size={16} className="text-blue-600" />
//                 Department: {employee.department}
//               </p>
//               <p className="flex items-center gap-2">
//                 <Award size={16} className="text-blue-600" />
//                 Experience: {employee.experience}
//               </p>
//               <p className="flex items-center gap-2">
//                 <CheckCircle size={16} className="text-blue-600" />
//                 Status: {employee.status}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* ===== Skills Section ===== */}
//         <div className="bg-white rounded-2xl shadow-md p-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">
//             Technical Skills
//           </h2>

//           <div className="flex flex-wrap gap-3">
//             {employee.skills.map((skill, index) => (
//               <span
//                 key={index}
//                 className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 hover:text-white transition"
//               >
//                 {skill}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* ===== Performance Section ===== */}
//         <div className="grid md:grid-cols-2 gap-8">

//           <div className="bg-white rounded-2xl shadow-md p-6 text-center">
//             <TrendingUp size={30} className="mx-auto text-blue-600 mb-3" />
//             <h3 className="text-2xl font-bold text-gray-800">
//               {employee.projectsCompleted}
//             </h3>
//             <p className="text-gray-500 text-sm">
//               Projects Completed
//             </p>
//           </div>

//           <div className="bg-white rounded-2xl shadow-md p-6 text-center">
//             <Award size={30} className="mx-auto text-blue-600 mb-3" />
//             <h3 className="text-2xl font-bold text-gray-800">
//               {employee.performanceRating}
//             </h3>
//             <p className="text-gray-500 text-sm">
//               Performance Rating
//             </p>
//           </div>
//         </div>

//         {/* ===== Documents Section ===== */}
//         <div className="bg-white rounded-2xl shadow-md p-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">
//             Documents
//           </h2>

//           <div className="space-y-3 text-sm text-gray-600">
//             <p className="flex items-center gap-2 hover:text-blue-600 cursor-pointer">
//               <FileText size={16} /> Offer Letter.pdf
//             </p>
//             <p className="flex items-center gap-2 hover:text-blue-600 cursor-pointer">
//               <FileText size={16} /> Experience Certificate.pdf
//             </p>
//             <p className="flex items-center gap-2 hover:text-blue-600 cursor-pointer">
//               <FileText size={16} /> NDA Agreement.pdf
//             </p>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default UserProfile;



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