import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../utils/Url";
import { X } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
const LeadPopup = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    contactNumber: "",
    service: "",
  });

  const [errors, setErrors] = useState({});

  // ✅ Show logic
  useEffect(() => {
    const submitted = localStorage.getItem("lead_form_submitted");
    const closedTime = localStorage.getItem("lead_form_closed_time");

    if (submitted === "true") return;

    if (closedTime) {
      const diff = Date.now() - Number(closedTime);
      if (diff < 20 * 60 * 60 * 1000) return;
    }

    setTimeout(() => setShow(true), 1500);
  }, []);

  // ✅ Validation
  const validateField = (name, value) => {
    let error = "";

    if (name === "name") {
      if (!value.trim()) error = "Name is required";
      else if (value.length < 2) error = "Minimum 2 characters required";
    }

    if (name === "contactNumber") {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!value) error = "Contact number is required";
      else if (!phoneRegex.test(value))
        error = "Enter valid 10-digit Indian number";
    }

    if (name === "service") {
      if (!value) error = "Please select a service";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  // ✅ Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid =
      validateField("name", form.name) &
      validateField("contactNumber", form.contactNumber) &
      validateField("service", form.service);

    if (!isValid) return;

    try {
      setLoading(true);

      await axios.post(`${BASE_URL}/interest/add`, form);

      toast.success("Submitted successfully 🚀");

      localStorage.setItem("lead_form_submitted", "true");
      setShow(false);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cancel
  const handleClose = () => {
    localStorage.setItem("lead_form_closed_time", Date.now());
    setShow(false);
  };

  if (!show) return null;

  const servicesList = [
    "Lead Generation",
    "Sales",
    "Affiliate Marketing",
    "Social Media Marketing",
    "Google/Meta Ads",
    "Email Marketing",
    "Web Development",
    "Gen AI",
    "Other Inquiry",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={20} />
        </button>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-blue-900 mb-1">
          Get Free Consultation 🚀
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Fill in your details and we’ll contact you shortly.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } focus:ring-2 ${
                errors.name ? "focus:ring-red-300" : "focus:ring-blue-500"
              } outline-none transition-all hover:border-blue-400`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
              placeholder="Enter 10-digit number"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.contactNumber ? "border-red-500" : "border-gray-300"
              } focus:ring-2 ${
                errors.contactNumber
                  ? "focus:ring-red-300"
                  : "focus:ring-blue-500"
              } outline-none transition-all hover:border-blue-400`}
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contactNumber}
              </p>
            )}
          </div>

          {/* 🔥 Premium Select */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Service
            </label>

            <div className="relative">
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border appearance-none bg-white pr-10
                  ${errors.service ? "border-red-500" : "border-gray-300"}
                  focus:ring-2 ${
                    errors.service
                      ? "focus:ring-red-300"
                      : "focus:ring-blue-500"
                  }
                  outline-none transition-all duration-200 hover:border-blue-400`}
              >
                <option value="">Choose a service</option>

                {servicesList.map((service, index) => (
                  <option key={index} value={service}>
                    {service}
                  </option>
                ))}
              </select>

              {/* Custom Arrow */}
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {errors.service && (
              <p className="text-red-500 text-xs mt-1">
                {errors.service}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition transform hover:scale-[1.02]"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeadPopup;