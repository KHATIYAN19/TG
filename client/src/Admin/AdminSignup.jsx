// import React, { useState } from 'react';
// import { z } from 'zod';
// import toast, { Toaster } from 'react-hot-toast';
// import Base_url from '../utils/Url';
// import { useSelector } from 'react-redux';

// const signupSchema = z.object({
//   name: z.string().min(3, { message: 'Name must be at least 3 characters long' }),
//   email: z.string().email({ message: 'Invalid email address' }),
//   password: z
//     .string()
//     .min(6, { message: 'Password must be at least 6 characters long' })
//     .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
//     .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
//     .regex(/[0-9]/, { message: 'Password must contain at least one number' })
//     .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' }),
//   mobile: z
//     .string()
//     .length(10, { message: 'Mobile number must be exactly 10 digits' })
//     .regex(/^\d+$/, { message: 'Mobile number must contain only digits' }),
//   role: z.enum(['admin', 'Employee'], { message: 'Please select a role' }),
// });
// function AdminSignup() {
//   const token = useSelector((state) => state.auth.token);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     mobile: '',
//     role: '',
//   });
//   const [errors, setErrors] = useState({});
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//     if (errors[name]) {
//       setErrors((prevErrors) => ({
//         ...prevErrors,
//         [name]: undefined,
//       }));
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({});

//     try {
//       signupSchema.parse(formData);

//       // Placeholder for Base_url if it's not defined in the environment
//       const baseUrl = typeof Base_url !== 'undefined' ? Base_url : 'http://localhost:3000'; 

//       const response = await fetch(`${baseUrl}/admin/signup`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,

//         },
//         body: JSON.stringify(formData),
//       });
//       console.log(response);
//       if (response.ok) {
//         toast.success('Signup successful');
//         setFormData({
//           name: '',
//           email: '',
//           password: '',
//           mobile: '',
//           role: '',
//         });
//       } else {
//         const errorData = await response.json();
//         console.log(errorData);
//         toast.error(`Signup failed: ${errorData?.errors?.message || errorData?.message || 'Something went wrong.'}`);
//       }
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         const newErrors = {};
//         for (const issue of error.issues) {
//           newErrors[issue.path[0]] = issue.message;
//         }
//         setErrors(newErrors);
//         toast.error('Please correct the form errors.');
//       } else {
//         toast.error('An unexpected error occurred. Please try again.');
//         console.error('Submission error:', error);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4 font-sans">
//       <Toaster position="top-center" reverseOrder={false} />
//       <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-lg transform transition-all duration-300 hover:scale-[1.01]">
//         <h2 className="text-3xl font-extrabold text-blue-700 text-center mb-8">Sign Up</h2>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
//               Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
//                 errors.name ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter your name"
//             />
//             {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
//           </div>

//           <div>
//             <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               type="text"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
//                 errors.email ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter your email"
//             />
//             {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 pr-10 ${
//                   errors.password ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter your password"
//               />
//               <button
//                 type="button"
//                 onClick={togglePasswordVisibility}
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-500 focus:outline-none"
//                 aria-label={showPassword ? 'Hide password' : 'Show password'}
//               >
//                 {showPassword ? (
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     strokeWidth="1.5"
//                     stroke="currentColor"
//                     className="w-5 h-5"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M3.98 8.6L.14 12l3.84 3.4M20.02 8.6L23.86 12l-3.84 3.4M12 4.5c-3.2 0-6 2.4-6 6s2.8 6 6 6 6-2.4 6-6-2.8-6-6-6z"
//                     />
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   </svg>
//                 ) : (
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     strokeWidth="1.5"
//                     stroke="currentColor"
//                     className="w-5 h-5"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                     />
//                   </svg>
//                 )}
//               </button>
//             </div>
//             {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
//           </div>

//           <div>
//             <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-1">
//               Mobile Number
//             </label>
//             <input
//               type="tel"
//               id="mobile"
//               name="mobile"
//               value={formData.mobile}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
//                 errors.mobile ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter your mobile number"
//             />
//             {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
//           </div>

//           <div>
//             <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
//               Role
//             </label>
//             <select
//               id="role"
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 appearance-none ${
//                 errors.role ? 'border-red-500' : 'border-gray-300'
//               }`}
//             >
//               <option value="">Select a role</option>
//               <option value="admin">Admin</option>
//               <option value="Employee">Employee</option>
//             </select>
//             {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
//             disabled={loading}
//           >
//             {loading ? (
//               <svg
//                 className="animate-spin h-5 w-5 text-white mr-3"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//             ) : (
//               'Sign Up'
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default AdminSignup;



import React, { useState } from "react";
import { z } from "zod";
import toast, { Toaster } from "react-hot-toast";
import Base_url from "../utils/Url";
import { useSelector } from "react-redux";

/* ================= VALIDATION SCHEMA ================= */
const signupSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(6, "Minimum 6 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[^a-zA-Z0-9]/, "Must contain special character"),
    mobile: z
      .string()
      .length(10, "Mobile must be 10 digits")
      .regex(/^\d+$/, "Only numbers allowed"),
    role: z.enum(["admin", "Employee", "normal"], "Select a role"),
    department: z.string().min(2, "Department is required"),
    designation: z.string().min(2, "Designation is required"),
    employmentType: z.string().min(2, "Employment type is required"),
    salary: z.string().optional(),
    commissionRate: z.string().optional(),
    joiningDate: z.string().min(1, "Joining date is required"),
  })
  .refine(
    (data) => data.employmentType !== "Permanent" || !!data.salary,
    { message: "Salary is required for Permanent employment", path: ["salary"] }
  )
  .refine(
    (data) => data.employmentType !== "Commission Based" || !!data.commissionRate,
    { message: "Commission rate is required for Commission Based", path: ["commissionRate"] }
  );

/* ================= COMPONENT ================= */
function AdminSignup() {
  const token = useSelector((state) => state.auth.token);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "",
    department: "",
    designation: "",
    employmentType: "",
    salary: "",
    commissionRate: "",
    joiningDate: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      signupSchema.parse(formData);

      const response = await fetch(`${Base_url}/admin/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Signup failed");
      } else {
        toast.success(
          `User Created! ${data.employeeId ? "Employee ID: " + data.employeeId : ""}`
        );
        setFormData({
          name: "",
          email: "",
          password: "",
          mobile: "",
          role: "",
          department: "",
          designation: "",
          employmentType: "",
          salary: "",
          commissionRate: "",
          joiningDate: "",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.issues.forEach((issue) => {
          newErrors[issue.path[0]] = issue.message;
        });
        setErrors(newErrors);
        toast.error("Please fix form errors");
      } else {
        toast.error("Something went wrong");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-center items-start md:items-center pt-6 md:pt-20 px-2 md:px-6">
      <Toaster position="top-center" />
      <div className="bg-white shadow-xl rounded-3xl w-full md:w-4/5 lg:w-3/4 xl:w-2/3 p-4 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-indigo-600">Create Employee Account</h2>
          <p className="text-gray-600 mt-2">Fill in all the employee details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC INFO */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Name" name="name" value={formData.name} onChange={handleChange} error={errors.name}/>
            <Input label="Email" name="email" value={formData.email} onChange={handleChange} error={errors.email}/>
            <Input label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} error={errors.mobile}/>
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password}/>
          </div>

          {/* ROLE & JOINING DATE */}
          <div className="grid md:grid-cols-2 gap-6">
            <Select label="Role" name="role" value={formData.role} onChange={handleChange} error={errors.role} options={["admin","Employee","normal"]}/>
            <Input label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} error={errors.joiningDate}/>
          </div>

          {/* EMPLOYMENT DETAILS */}
          <div className="bg-indigo-50 p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-semibold text-indigo-700">Employment Details</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Department" name="department" value={formData.department} onChange={handleChange} error={errors.department}/>
              <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} error={errors.designation}/>
            </div>

            <Select
              label="Employment Type"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              error={errors.employmentType}
              options={["Permanent","Commission Based"]}
            />

            {formData.employmentType === "Permanent" && (
              <Input label="Salary (₹)" name="salary" value={formData.salary} onChange={handleChange} error={errors.salary}/>
            )}
            {formData.employmentType === "Commission Based" && (
              <Input label="Commission Rate" name="commissionRate" value={formData.commissionRate} onChange={handleChange} error={errors.commissionRate}/>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 md:py-4 rounded-xl font-semibold transition duration-300 text-lg"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= REUSABLE INPUT ================= */
const Input = ({ label, error, ...props }) => (
  <div className="flex flex-col">
    <label className="font-medium mb-1 text-gray-700">{label}</label>
    <input
      {...props}
      className="w-full border border-gray-300 rounded-lg p-2 md:p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const Select = ({ label, name, value, onChange, error, options }) => (
  <div className="flex flex-col">
    <label className="font-medium mb-1 text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg p-2 md:p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm md:text-base"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default AdminSignup;