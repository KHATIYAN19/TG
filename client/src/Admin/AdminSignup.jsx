// import React, { useState } from "react";
// import { z } from "zod";
// import toast, { Toaster } from "react-hot-toast";
// import Base_url from "../utils/Url";
// import { useSelector } from "react-redux";

// /* ================= VALIDATION SCHEMA ================= */
// const signupSchema = z
//   .object({
//     name: z.string().min(3, "Name must be at least 3 characters"),
//     email: z.string().email("Invalid email"),
//     password: z
//       .string()
//       .min(6, "Minimum 6 characters")
//       .regex(/[A-Z]/, "Must contain uppercase letter")
//       .regex(/[a-z]/, "Must contain lowercase letter")
//       .regex(/[0-9]/, "Must contain number")
//       .regex(/[^a-zA-Z0-9]/, "Must contain special character"),
//     mobile: z
//       .string()
//       .length(10, "Mobile must be 10 digits")
//       .regex(/^\d+$/, "Only numbers allowed"),
//     role: z.enum(["admin", "Employee", "normal"], "Select a role"),
//     department: z.string().min(2, "Department is required"),
//     designation: z.string().min(2, "Designation is required"),
//     employmentType: z.string().min(2, "Employment type is required"),
//     salary: z.string().optional(),
//     commissionRate: z.string().optional(),
//     joiningDate: z.string().min(1, "Joining date is required"),
//   })
//   .refine(
//     (data) => data.employmentType !== "Permanent" || !!data.salary,
//     { message: "Salary is required for Permanent employment", path: ["salary"] }
//   )
//   .refine(
//     (data) => data.employmentType !== "Commission Based" || !!data.commissionRate,
//     { message: "Commission rate is required for Commission Based", path: ["commissionRate"] }
//   );

// /* ================= COMPONENT ================= */
// function AdminSignup() {
//   const token = useSelector((state) => state.auth.token);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     mobile: "",
//     role: "",
//     department: "",
//     designation: "",
//     employmentType: "",
//     salary: "",
//     commissionRate: "",
//     joiningDate: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});
//     setLoading(true);

//     try {
//       signupSchema.parse(formData);

//       const response = await fetch(`${Base_url}/admin/signup`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         toast.error(data.message || "Signup failed");
//       } else {
//         toast.success(
//           `User Created! ${data.employeeId ? "Employee ID: " + data.employeeId : ""}`
//         );
//         setFormData({
//           name: "",
//           email: "",
//           password: "",
//           mobile: "",
//           role: "",
//           department: "",
//           designation: "",
//           employmentType: "",
//           salary: "",
//           commissionRate: "",
//           joiningDate: "",
//         });
//       }
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         const newErrors = {};
//         error.issues.forEach((issue) => {
//           newErrors[issue.path[0]] = issue.message;
//         });
//         setErrors(newErrors);
//         toast.error("Please fix form errors");
//       } else {
//         toast.error("Something went wrong");
//       }
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-center items-start md:items-center pt-6 md:pt-20 px-2 md:px-6">
//       <Toaster position="top-center" />
//       <div className="bg-white shadow-xl rounded-3xl w-full md:w-4/5 lg:w-3/4 xl:w-2/3 p-4 md:p-10">
//         <div className="text-center mb-8">
//           <h2 className="text-4xl font-bold text-indigo-600">Create Employee Account</h2>
//           <p className="text-gray-600 mt-2">Fill in all the employee details below</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">

//           {/* BASIC INFO */}
//           <div className="grid md:grid-cols-2 gap-6">
//             <Input label="Name" name="name" value={formData.name} onChange={handleChange} error={errors.name}/>
//             <Input label="Email" name="email" value={formData.email} onChange={handleChange} error={errors.email}/>
//             <Input label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} error={errors.mobile}/>
//             <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password}/>
//           </div>

//           {/* ROLE & JOINING DATE */}
//           <div className="grid md:grid-cols-2 gap-6">
//             <Select label="Role" name="role" value={formData.role} onChange={handleChange} error={errors.role} options={["admin","Employee","normal"]}/>
//             <Input label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} error={errors.joiningDate}/>
//           </div>

//           {/* EMPLOYMENT DETAILS */}
//           <div className="bg-indigo-50 p-6 rounded-xl space-y-4">
//             <h3 className="text-lg font-semibold text-indigo-700">Employment Details</h3>

//             <div className="grid md:grid-cols-2 gap-6">
//               <Input label="Department" name="department" value={formData.department} onChange={handleChange} error={errors.department}/>
//               <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} error={errors.designation}/>
//             </div>

//             <Select
//               label="Employment Type"
//               name="employmentType"
//               value={formData.employmentType}
//               onChange={handleChange}
//               error={errors.employmentType}
//               options={["Permanent","Commission Based"]}
//             />

//             {formData.employmentType === "Permanent" && (
//               <Input label="Salary (₹)" name="salary" value={formData.salary} onChange={handleChange} error={errors.salary}/>
//             )}
//             {formData.employmentType === "Commission Based" && (
//               <Input label="Commission Rate" name="commissionRate" value={formData.commissionRate} onChange={handleChange} error={errors.commissionRate}/>
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 md:py-4 rounded-xl font-semibold transition duration-300 text-lg"
//           >
//             {loading ? "Creating..." : "Create Account"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// /* ================= REUSABLE INPUT ================= */
// const Input = ({ label, error, ...props }) => (
//   <div className="flex flex-col">
//     <label className="font-medium mb-1 text-gray-700">{label}</label>
//     <input
//       {...props}
//       className="w-full border border-gray-300 rounded-lg p-2 md:p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
//     />
//     {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//   </div>
// );

// const Select = ({ label, name, value, onChange, error, options }) => (
//   <div className="flex flex-col">
//     <label className="font-medium mb-1 text-gray-700">{label}</label>
//     <select
//       name={name}
//       value={value}
//       onChange={onChange}
//       className="w-full border border-gray-300 rounded-lg p-2 md:p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm md:text-base"
//     >
//       <option value="">Select {label}</option>
//       {options.map((opt) => (
//         <option key={opt} value={opt}>{opt}</option>
//       ))}
//     </select>
//     {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//   </div>
// );

// export default AdminSignup;


import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import { z } from "zod";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  Handshake,
  IndianRupee,
  Loader2,
  Mail,
  Percent,
  Phone,
  RefreshCw,
  ShieldCheck,
  Tag,
  User,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import BASE_URL from "../utils/Url";

/* =====================================================
   CONFIGURATION
===================================================== */

const API_URL = `${String(BASE_URL).replace(
  /\/$/,
  ""
)}/api/admin/users`;

const ORANGE = "#F97316";

const INITIAL_FORM = {
  name: "",
  email: "",
  mobile: "",
  role: "Employee",

  // Affiliate-only configuration
  affiliateCode: "",
  commissionType: "percentage",
  commissionValue: "",
  affiliateStatus: "active",
};

const ROLE_OPTIONS = [
  {
    value: "admin",
    label: "Admin",
    description: "Full administrative access",
    icon: ShieldCheck,
  },
  {
    value: "Employee",
    label: "Employee",
    description: "Internal team access",
    icon: Users,
  },
  {
    value: "normal",
    label: "Normal User",
    description: "Standard user access",
    icon: User,
  },
  {
    value: "affiliate",
    label: "Affiliate Partner",
    description: "Referral and commission access",
    icon: Handshake,
  },
];

/* =====================================================
   VALIDATION
===================================================== */

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter at least 2 characters")
      .max(100, "Name is too long"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address"),

    mobile: z.string().trim(),

    role: z.enum([
      "admin",
      "Employee",
      "normal",
      "affiliate",
    ]),

    affiliateCode: z.string(),

    commissionType: z.enum([
      "percentage",
      "fixed",
    ]),

    commissionValue: z.string(),

    affiliateStatus: z.enum([
      "active",
      "inactive",
    ]),
  })
  .superRefine((data, ctx) => {
    if (
      (data.role !== "admin" || data.mobile) &&
      !/^[6-9]\d{9}$/.test(data.mobile)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["mobile"],
        message: "Enter a valid 10-digit mobile number",
      });
    }

    if (data.role !== "affiliate") return;

    if (
      !/^[A-Z0-9_-]{3,30}$/.test(
        data.affiliateCode
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["affiliateCode"],
        message:
          "Use 3–30 uppercase letters, numbers, - or _",
      });
    }

    const value = Number(data.commissionValue);

    if (
      data.commissionValue.trim() === "" ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["commissionValue"],
        message:
          "Enter a commission value greater than zero",
      });
    } else if (
      data.commissionType === "percentage" &&
      value > 100
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["commissionValue"],
        message: "Percentage cannot exceed 100%",
      });
    }
  });

/* =====================================================
   THEME SYNCHRONIZATION
===================================================== */

const readTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const theme = localStorage.getItem("theme");

  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return document.documentElement.classList.contains(
    "dark"
  )
    ? "dark"
    : "light";
};

const useSyncedTheme = () => {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const sync = () => setTheme(readTheme());

    const observer = new MutationObserver(sync);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    window.addEventListener("storage", sync);
    window.addEventListener("theme-change", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", sync);
      window.removeEventListener(
        "theme-change",
        sync
      );
    };
  }, []);

  return theme;
};

/* =====================================================
   AFFILIATE CODE GENERATOR

   Generates a suggestion only.
   Backend must enforce uniqueness.
===================================================== */

const generateAffiliateCode = (name) => {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8) || "PARTNER";

  const randomBytes = new Uint8Array(3);
  crypto.getRandomValues(randomBytes);

  const suffix = Array.from(randomBytes)
    .map((byte) =>
      (byte % 36).toString(36).toUpperCase()
    )
    .join("");

  return `${prefix}${suffix}`;
};

/* =====================================================
   REUSABLE FIELD
===================================================== */

const Input = ({
  label,
  name,
  value,
  onChange,
  error,
  icon: Icon,
  placeholder,
  required = false,
  disabled = false,
  isDark,
  type = "text",
  hint,
  action,
  inputMode,
  maxLength,
}) => (
  <div className="min-w-0">
    <label
      htmlFor={name}
      className="mb-2 block text-[12px] font-semibold"
    >
      {label}

      {required && (
        <span className="ml-1 text-[#F97316]">*</span>
      )}
    </label>

    <div className="relative">
      <Icon
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]"
      />

      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-invalid={Boolean(error)}
        className={`h-12 w-full rounded-lg border pl-11 ${
          action ? "pr-14" : "pr-4"
        } text-[13px] outline-none transition-all
        focus:border-[#F97316]
        focus:ring-2 focus:ring-[#F97316]/15
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${
          error
            ? "border-red-500"
            : isDark
              ? "border-[#383838] bg-[#1D1D1D] text-white"
              : "border-[#DEDEDE] bg-white text-black"
        }`}
      />

      {action && (
        <div className="absolute inset-y-0 right-1 flex items-center">
          {action}
        </div>
      )}
    </div>

    {error && (
      <p
        role="alert"
        className="mt-1.5 text-[11px] text-red-500"
      >
        {error}
      </p>
    )}

    {!error && hint && (
      <p
        className={`mt-1.5 text-[11px] leading-5 ${
          isDark
            ? "text-[#999999]"
            : "text-[#777777]"
        }`}
      >
        {hint}
      </p>
    )}
  </div>
);

/* =====================================================
   MAIN COMPONENT
===================================================== */

function AdminSignup() {
  const token = useSelector(
    (state) => state.auth?.token
  );

  const theme = useSyncedTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    ...INITIAL_FORM,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] =
    useState(null);

  const isAffiliate = form.role === "affiliate";

  const pageClass = isDark
    ? "bg-black text-white"
    : "bg-white text-black";

  const cardClass = isDark
    ? "border-[#303030] bg-[#111111]"
    : "border-[#E5E5E5] bg-white";

  const subtleClass = isDark
    ? "border-[#333333] bg-[#191919]"
    : "border-[#E5E5E5] bg-[#F8F8F8]";

  const mutedClass = isDark
    ? "text-[#999999]"
    : "text-[#737373]";

  const selectedRole = useMemo(
    () =>
      ROLE_OPTIONS.find(
        (role) => role.value === form.role
      ),
    [form.role]
  );

  /* =================================================
     HANDLERS
  ================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    let next = value;

    if (name === "mobile") {
      next = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    if (name === "affiliateCode") {
      next = value
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "")
        .slice(0, 30);
    }

    if (name === "commissionValue") {
      if (
        value !== "" &&
        !/^\d*\.?\d{0,2}$/.test(value)
      ) {
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: next,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      api: "",
    }));
  };

  const changeRole = (role) => {
    if (loading) return;

    setForm((prev) => ({
      ...prev,
      role,
    }));

    setErrors({});
  };

  const resetForm = () => {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    setCreatedUser(null);
  };

  const createCode = () => {
    const code = generateAffiliateCode(
      form.name
    );

    setForm((prev) => ({
      ...prev,
      affiliateCode: code,
    }));

    setErrors((prev) => ({
      ...prev,
      affiliateCode: "",
    }));
  };

  const copyCode = async () => {
    if (!form.affiliateCode) return;

    try {
      await navigator.clipboard.writeText(
        form.affiliateCode
      );

      toast.success("Affiliate code copied");
    } catch {
      toast.error("Unable to copy code");
    }
  };

  /* =================================================
     VALIDATE AND SUBMIT
  ================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setErrors({});

    const input = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      mobile: form.mobile.trim(),
      affiliateCode:
        form.affiliateCode.trim().toUpperCase(),
    };

    const validation = schema.safeParse(
      input
    );

    if (!validation.success) {
      const fieldErrors = {};

      validation.error.issues.forEach(
        (issue) => {
          const field = issue.path[0];

          if (
            field &&
            !fieldErrors[field]
          ) {
            fieldErrors[field] =
              issue.message;
          }
        }
      );

      setErrors(fieldErrors);
      toast.error("Please check the form");
      return;
    }

    if (!token) {
      toast.error(
        "Your session has expired. Please log in."
      );
      return;
    }

    /* ===========================================
       COMMON PAYLOAD FOR ALL FOUR ROLES
    =========================================== */

    const payload = {
      name: input.name,
      email: input.email,
      role: input.role,
    };

    if (input.mobile) {
      payload.mobile = input.mobile;
    }

    /* ===========================================
       AFFILIATE EXTRA FIELDS
    =========================================== */

    if (input.role === "affiliate") {
      payload.affiliate = {
        code: input.affiliateCode,
        commissionType: input.commissionType,
        commissionValue: Number(
          input.commissionValue
        ),
        status: input.affiliateStatus,
      };
    }

    setLoading(true);

    try {
      const response = await axios.post(
        API_URL,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
          timeout: 20000,
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(
          data.message ||
            "Account creation failed"
        );
      }

      setCreatedUser({
        ...payload,
        ...(data.user || {}),
        affiliate:
          data.user?.affiliate ||
          payload.affiliate,
        emailSent: data.emailSent === true,
      });

      toast.success(
        "Account created successfully"
      );
    } catch (error) {
      console.error(
        "Create user error:",
        error
      );

      let message =
        error.response?.data?.message ||
        error.message ||
        "Unable to create account";

      if (
        error.response?.status === 409
      ) {
        message =
          "Email, mobile number, or affiliate code is already in use.";
      }

      if (
        error.response?.status === 401
      ) {
        message =
          "Session expired. Please log in again.";
      }

      if (
        error.response?.status === 403
      ) {
        message =
          "You are not authorized to create users.";
      }

      setErrors((prev) => ({
        ...prev,
        api: message,
      }));

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =================================================
     SUCCESS SCREEN
  ================================================= */

  if (createdUser) {
    const affiliate =
      createdUser.affiliate;

    return (
      <div
        className={`min-h-screen px-4 py-8 sm:px-6 ${pageClass}`}
      >
        <div className="mx-auto max-w-2xl">
          <div
            className={`rounded-xl border p-6 sm:p-8 ${cardClass}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F97316]">
              <CheckCircle2
                size={26}
                className="text-white"
              />
            </div>

            <h1 className="mt-6 text-2xl font-semibold">
              Account created
            </h1>

            <p
              className={`mt-2 text-[13px] leading-6 ${mutedClass}`}
            >
              {createdUser.emailSent
                ? "The account has been created and a password setup invitation has been sent."
                : "The account was created. Check whether a password setup invitation was sent and resend it from user management if needed."}
            </p>

            <div
              className={`mt-6 divide-y rounded-lg border ${
                isDark
                  ? "divide-[#333333] border-[#333333]"
                  : "divide-[#E5E5E5] border-[#E5E5E5]"
              }`}
            >
              {[
                ["Name", createdUser.name],
                ["Email", createdUser.email],
                [
                  "Mobile",
                  createdUser.mobile ||
                    "Not provided",
                ],
                ["Role", createdUser.role],
                ...(affiliate
                  ? [
                      [
                        "Affiliate code",
                        affiliate.code,
                      ],
                      [
                        "Commission type",
                        affiliate.commissionType,
                      ],
                      [
                        "Commission",
                        affiliate.commissionType ===
                        "percentage"
                          ? `${affiliate.commissionValue}%`
                          : `₹${affiliate.commissionValue} / sale`,
                      ],
                      [
                        "Affiliate status",
                        affiliate.status,
                      ],
                    ]
                  : []),
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 px-4 py-3 text-[12px]"
                >
                  <span className={mutedClass}>
                    {label}
                  </span>

                  <span className="break-all text-right font-semibold">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#F97316] text-[13px] font-semibold text-white hover:bg-[#EA650A]"
            >
              <UserPlus size={17} />
              Create another account
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =================================================
     FORM
  ================================================= */

  return (
    <div
      data-theme={theme}
      className={`min-h-screen px-4 py-7 sm:px-6 lg:px-8 ${pageClass}`}
    >
      <div className="mx-auto max-w-4xl">

        {/* PAGE TITLE */}

        <div className="mb-7">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F97316]" />

            <span
              className={`text-[11px] font-semibold uppercase tracking-[1.5px] ${mutedClass}`}
            >
              Administration / User management
            </span>
          </div>

          <h1 className="text-[27px] font-semibold tracking-[-0.8px] sm:text-[32px]">
            Create account
          </h1>

          <p
            className={`mt-2 text-[13px] ${mutedClass}`}
          >
            Create an admin, employee, standard
            user, or affiliate partner.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className={`overflow-hidden rounded-xl border ${cardClass}`}
        >

          {/* ===================================
              1. BASIC DETAILS
          =================================== */}

          <section className="p-5 sm:p-7">
            <div className="mb-6">
              <h2 className="text-[15px] font-semibold">
                01. Basic information
              </h2>

              <p
                className={`mt-1 text-[12px] ${mutedClass}`}
              >
                Details used to identify
                and contact the account holder.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Full name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                icon={User}
                error={errors.name}
                required
                disabled={loading}
                isDark={isDark}
              />

              <Input
                label="Email address"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                type="email"
                icon={Mail}
                error={errors.email}
                required
                disabled={loading}
                isDark={isDark}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Mobile number"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  icon={Phone}
                  error={errors.mobile}
                  required={
                    form.role !== "admin"
                  }
                  disabled={loading}
                  isDark={isDark}
                  hint={
                    form.role === "admin"
                      ? "Optional for administrator accounts."
                      : ""
                  }
                />
              </div>
            </div>
          </section>

          <div
            className={`border-t ${
              isDark
                ? "border-[#303030]"
                : "border-[#E5E5E5]"
            }`}
          />

          {/* ===================================
              2. ROLE
          =================================== */}

          <section className="p-5 sm:p-7">
            <div className="mb-5">
              <h2 className="text-[15px] font-semibold">
                02. Account role
              </h2>

              <p
                className={`mt-1 text-[12px] ${mutedClass}`}
              >
                Select the account's access level.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {ROLE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected =
                  form.role === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      changeRole(option.value)
                    }
                    aria-pressed={selected}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                      selected
                        ? "border-[#F97316]"
                        : isDark
                          ? "border-[#383838] hover:border-[#666666]"
                          : "border-[#E0E0E0] hover:border-[#BBBBBB]"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        selected
                          ? "bg-[#F97316] text-white"
                          : isDark
                            ? "bg-[#282828] text-[#AAAAAA]"
                            : "bg-[#F2F2F2] text-[#666666]"
                      }`}
                    >
                      <Icon size={18} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold">
                        {option.label}
                      </span>

                      <span
                        className={`mt-1 block text-[11px] leading-5 ${mutedClass}`}
                      >
                        {option.description}
                      </span>
                    </span>

                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-[#F97316] bg-[#F97316]"
                          : "border-[#888888]"
                      }`}
                    >
                      {selected && (
                        <Check
                          size={11}
                          className="text-white"
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ===================================
              3. AFFILIATE CONFIGURATION
          =================================== */}

          {isAffiliate && (
            <>
              <div
                className={`border-t ${
                  isDark
                    ? "border-[#303030]"
                    : "border-[#E5E5E5]"
                }`}
              />

              <section className="p-5 sm:p-7">
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F97316] text-white">
                    <Handshake size={20} />
                  </div>

                  <div>
                    <h2 className="text-[15px] font-semibold">
                      03. Affiliate configuration
                    </h2>

                    <p
                      className={`mt-1 text-[12px] leading-5 ${mutedClass}`}
                    >
                      Configure the referral code,
                      commission calculation, and
                      partner status.
                    </p>
                  </div>
                </div>

                {/* AFFILIATE CODE */}

                <Input
                  label="Unique affiliate code"
                  name="affiliateCode"
                  value={form.affiliateCode}
                  onChange={handleChange}
                  placeholder="e.g. RAHUL25"
                  icon={Tag}
                  error={errors.affiliateCode}
                  required
                  disabled={loading}
                  isDark={isDark}
                  maxLength={30}
                  hint="Used to attribute sales to this partner. The backend must enforce uniqueness."
                  action={
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={createCode}
                        disabled={loading}
                        title="Generate code"
                        aria-label="Generate affiliate code"
                        className={`flex h-9 w-9 items-center justify-center rounded-md hover:text-[#F97316] ${
                          isDark
                            ? "text-[#AAAAAA]"
                            : "text-[#666666]"
                        }`}
                      >
                        <RefreshCw size={15} />
                      </button>
                    </div>
                  }
                />

                {form.affiliateCode && (
                  <button
                    type="button"
                    onClick={copyCode}
                    className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#F97316]"
                  >
                    <Copy size={13} />
                    Copy code
                  </button>
                )}

                {/* COMMISSION TYPE */}

                <div className="mt-6">
                  <label className="mb-3 block text-[12px] font-semibold">
                    Commission type
                    <span className="ml-1 text-[#F97316]">*</span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "percentage",
                        label: "Percentage",
                        icon: Percent,
                        description: "% of each sale",
                      },
                      {
                        value: "fixed",
                        label: "Fixed amount",
                        icon: IndianRupee,
                        description: "₹ per sale",
                      },
                    ].map((option) => {
                      const Icon = option.icon;

                      const selected =
                        form.commissionType ===
                        option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={loading}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              commissionType:
                                option.value,
                              commissionValue: "",
                            }));

                            setErrors((prev) => ({
                              ...prev,
                              commissionValue: "",
                            }));
                          }}
                          aria-pressed={selected}
                          className={`rounded-lg border p-4 text-left transition-colors ${
                            selected
                              ? "border-[#F97316]"
                              : isDark
                                ? "border-[#383838]"
                                : "border-[#DEDEDE]"
                          }`}
                        >
                          <Icon
                            size={20}
                            className={
                              selected
                                ? "text-[#F97316]"
                                : mutedClass
                            }
                          />

                          <span className="mt-3 block text-[12px] font-semibold">
                            {option.label}
                          </span>

                          <span
                            className={`mt-1 block text-[11px] ${mutedClass}`}
                          >
                            {option.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COMMISSION VALUE */}

                <div className="mt-6">
                  <Input
                    label={
                      form.commissionType === "percentage"
                        ? "Commission percentage (%)"
                        : "Fixed commission per sale (₹)"
                    }
                    name="commissionValue"
                    type="text"
                    inputMode="decimal"
                    value={form.commissionValue}
                    onChange={handleChange}
                    placeholder={
                      form.commissionType === "percentage"
                        ? "e.g. 20"
                        : "e.g. 50"
                    }
                    icon={
                      form.commissionType === "percentage"
                        ? Percent
                        : IndianRupee
                    }
                    error={errors.commissionValue}
                    required
                    disabled={loading}
                    isDark={isDark}
                    hint={
                      form.commissionType === "percentage"
                        ? "The partner earns this percentage of the eligible sale amount."
                        : "The partner earns this fixed amount for every eligible sale."
                    }
                  />
                </div>

                {/* COMMISSION EXAMPLE */}

                {Number(form.commissionValue) > 0 && (
                  <div
                    className={`mt-5 rounded-lg border p-4 ${subtleClass}`}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet
                        size={16}
                        className="text-[#F97316]"
                      />

                      <p className="text-[12px] font-semibold">
                        Commission preview
                      </p>
                    </div>

                    <p
                      className={`mt-2 text-[11px] ${mutedClass}`}
                    >
                      Example eligible sale amount: ₹1,000
                    </p>

                    <p className="mt-2 text-[23px] font-bold tracking-tight">
                      ₹
                      {(
                        form.commissionType === "percentage"
                          ? (1000 *
                              Number(
                                form.commissionValue
                              )) /
                            100
                          : Number(
                              form.commissionValue
                            )
                      ).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    <p
                      className={`mt-1 text-[11px] ${mutedClass}`}
                    >
                      Estimated commission for this example
                    </p>
                  </div>
                )}

                {/* AFFILIATE STATUS */}

                <div className="mt-6">
                  <label className="mb-3 block text-[12px] font-semibold">
                    Affiliate status
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "active",
                        label: "Active",
                        description:
                          "Referral earning enabled",
                      },
                      {
                        value: "inactive",
                        label: "Inactive",
                        description:
                          "Referral earning disabled",
                      },
                    ].map((option) => {
                      const selected =
                        form.affiliateStatus ===
                        option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              affiliateStatus:
                                option.value,
                            }))
                          }
                          aria-pressed={selected}
                          className={`rounded-lg border p-3.5 text-left ${
                            selected
                              ? "border-[#F97316]"
                              : isDark
                                ? "border-[#383838]"
                                : "border-[#DEDEDE]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                option.value === "active"
                                  ? "bg-[#F97316]"
                                  : "bg-[#888888]"
                              }`}
                            />

                            <span className="text-[12px] font-semibold">
                              {option.label}
                            </span>
                          </div>

                          <p
                            className={`mt-2 text-[11px] ${mutedClass}`}
                          >
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ===================================
              ACCOUNT SETUP
          =================================== */}

          <div
            className={`border-t ${
              isDark
                ? "border-[#303030]"
                : "border-[#E5E5E5]"
            }`}
          />

          <section className="p-5 sm:p-7">
            <div
              className={`flex items-start gap-3 rounded-lg border p-4 ${subtleClass}`}
            >
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-[#F97316]"
              />

              <div>
                <p className="text-[12px] font-semibold">
                  Secure account invitation
                </p>

                <p
                  className={`mt-1 text-[11px] leading-6 ${mutedClass}`}
                >
                  The new user will set their own password
                  through a secure invitation link. No
                  password needs to be shared manually.
                </p>
              </div>
            </div>
          </section>

          {/* ===================================
              ERROR
          =================================== */}

          {errors.api && (
            <div
              role="alert"
              className="mx-5 mb-5 rounded-lg border border-red-500/40 p-3 text-[12px] text-red-500 sm:mx-7"
            >
              {errors.api}
            </div>
          )}

          {/* ===================================
              ACTIONS
          =================================== */}

          <div
            className={`flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7 ${
              isDark
                ? "border-[#303030]"
                : "border-[#E5E5E5]"
            }`}
          >
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className={`flex h-11 items-center justify-center gap-2 rounded-lg border px-5 text-[12px] font-semibold ${
                isDark
                  ? "border-[#404040] hover:bg-[#242424]"
                  : "border-[#DADADA] hover:bg-[#F5F5F5]"
              }`}
            >
              <RefreshCw size={15} />
              Reset
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 min-w-[180px] items-center justify-center gap-2 rounded-lg bg-[#F97316] px-6 text-[13px] font-bold text-white transition-colors hover:bg-[#EA650A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  Create account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminSignup;
