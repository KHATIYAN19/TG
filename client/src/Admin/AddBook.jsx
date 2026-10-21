// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import BASE_URL from "../utils/Url";

// const initialFormData = {
//   title: "",
//   slug: "",
//   subtitle: "",
//   description: "",
//   resourceType: "ebook",
//   price: "",
//   mrp: "",
//   currency: "INR",
//   paymentUrl: "",
//   redirectUrl: "",
//   pageKey: "",
//   fileName: "",
//   tags: "",
//   topics: "",
//   category: "",
//   highlights: "",
//   badge: "",
//   isPublished: false,
//   isActive: true,
//   isFeatured: false,
// };

// const resourceTypes = [
//   { value: "ebook", label: "Ebook" },
//   { value: "pdf", label: "PDF" },
//   { value: "course", label: "Course" },
//   { value: "bundle", label: "Bundle" },
//   { value: "template", label: "Template" },
//   { value: "notes", label: "Notes" },
//   { value: "other", label: "Other" },
// ];

// const AddBook = () => {
//   const token = useSelector((state) => state.auth.token);

//   const [formData, setFormData] = useState(initialFormData);
//   const [coverPage, setCoverPage] = useState(null);
//   const [pdfFile, setPdfFile] = useState(null);
//   const [coverPreview, setCoverPreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (coverPreview) {
//         URL.revokeObjectURL(coverPreview);
//       }
//     };
//   }, [coverPreview]);

//   const discount = useMemo(() => {
//     const price = Number(formData.price);
//     const mrp = Number(formData.mrp);

//     if (
//       !Number.isFinite(price) ||
//       !Number.isFinite(mrp) ||
//       mrp <= 0 ||
//       price < 0 ||
//       price >= mrp
//     ) {
//       return 0;
//     }

//     return Math.round(((mrp - price) / mrp) * 100);
//   }, [formData.price, formData.mrp]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     let nextValue = type === "checkbox" ? checked : value;

//     if (name === "currency") {
//       nextValue = value.toUpperCase().slice(0, 3);
//     }

//     if (name === "slug" || name === "pageKey") {
//       nextValue = value.toLowerCase();
//     }

//     setFormData((prev) => ({
//       ...prev,
//       [name]: nextValue,
//     }));

//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const makeKey = (value) => {
//     return value
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9\s-]/g, "")
//       .replace(/\s+/g, "-")
//       .replace(/-+/g, "-")
//       .replace(/^-|-$/g, "");
//   };

//   const generateSlug = () => {
//     if (!formData.title.trim()) {
//       toast.error("Enter a product title first.");
//       return;
//     }

//     const slug = makeKey(formData.title);

//     setFormData((prev) => ({
//       ...prev,
//       slug,
//     }));

//     setErrors((prev) => ({
//       ...prev,
//       slug: "",
//     }));
//   };

//   const generatePageKey = () => {
//     const source = formData.slug || formData.title;

//     if (!source.trim()) {
//       toast.error("Enter a title or slug first.");
//       return;
//     }

//     const pageKey = makeKey(source);

//     setFormData((prev) => ({
//       ...prev,
//       pageKey,
//     }));

//     setErrors((prev) => ({
//       ...prev,
//       pageKey: "",
//     }));
//   };

//   const handleCoverChange = (e) => {
//     const file = e.target.files?.[0];

//     if (!file) return;

//     const allowedTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/webp",
//     ];

//     if (!allowedTypes.includes(file.type)) {
//       toast.error("Cover must be JPG, PNG, or WEBP.");
//       e.target.value = "";
//       return;
//     }

//     if (coverPreview) {
//       URL.revokeObjectURL(coverPreview);
//     }

//     setCoverPage(file);
//     setCoverPreview(URL.createObjectURL(file));

//     setErrors((prev) => ({
//       ...prev,
//       coverPage: "",
//     }));
//   };

//   const handlePdfChange = (e) => {
//     const file = e.target.files?.[0];

//     if (!file) return;

//     const validPdf =
//       file.type === "application/pdf" ||
//       file.name.toLowerCase().endsWith(".pdf");

//     if (!validPdf) {
//       toast.error("Only PDF files are allowed.");
//       e.target.value = "";
//       return;
//     }

//     setPdfFile(file);

//     setFormData((prev) => ({
//       ...prev,
//       fileName: prev.fileName || file.name,
//     }));

//     setErrors((prev) => ({
//       ...prev,
//       pdf: "",
//     }));
//   };

//   const removeCover = () => {
//     if (coverPreview) {
//       URL.revokeObjectURL(coverPreview);
//     }

//     setCoverPage(null);
//     setCoverPreview("");

//     const input = document.getElementById("coverPage");

//     if (input) {
//       input.value = "";
//     }
//   };

//   const removePdf = () => {
//     setPdfFile(null);

//     const input = document.getElementById("pdf");

//     if (input) {
//       input.value = "";
//     }
//   };

//   const convertToArray = (value) => {
//     if (!value?.trim()) {
//       return [];
//     }

//     return value
//       .split(",")
//       .map((item) => item.trim())
//       .filter(Boolean);
//   };

//   const isValidHttpUrl = (value) => {
//     try {
//       const url = new URL(value);

//       return (
//         url.protocol === "http:" ||
//         url.protocol === "https:"
//       );
//     } catch {
//       return false;
//     }
//   };

//   const isValidRedirectUrl = (value) => {
//     const url = value.trim();

//     return (
//       url.startsWith("/") &&
//       url.length > 1 &&
//       !url.startsWith("//")
//     );
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     const title = formData.title.trim();
//     const slug = formData.slug.trim();
//     const pageKey = formData.pageKey.trim();
//     const paymentUrl = formData.paymentUrl.trim();
//     const redirectUrl = formData.redirectUrl.trim();
//     const currency = formData.currency.trim();

//     if (!title) {
//       newErrors.title = "Product title is required.";
//     } else if (title.length < 3) {
//       newErrors.title =
//         "Title must be at least 3 characters.";
//     }

//     if (!slug) {
//       newErrors.slug = "Slug is required.";
//     } else if (
//       !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
//     ) {
//       newErrors.slug =
//         "Use lowercase letters, numbers and hyphens only.";
//     }

//     if (!pageKey) {
//       newErrors.pageKey = "Page key is required.";
//     } else if (
//       !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageKey)
//     ) {
//       newErrors.pageKey =
//         "Use lowercase letters, numbers and hyphens only.";
//     }

//     if (!formData.resourceType) {
//       newErrors.resourceType =
//         "Resource type is required.";
//     }

//     if (formData.price === "") {
//       newErrors.price = "Price is required.";
//     } else {
//       const price = Number(formData.price);

//       if (
//         !Number.isFinite(price) ||
//         price < 0
//       ) {
//         newErrors.price =
//           "Enter a valid non-negative price.";
//       }
//     }

//     if (formData.mrp === "") {
//       newErrors.mrp = "MRP is required.";
//     } else {
//       const mrp = Number(formData.mrp);

//       if (
//         !Number.isFinite(mrp) ||
//         mrp < 0
//       ) {
//         newErrors.mrp =
//           "Enter a valid non-negative MRP.";
//       }
//     }

//     if (
//       formData.price !== "" &&
//       formData.mrp !== "" &&
//       Number(formData.price) >
//         Number(formData.mrp)
//     ) {
//       newErrors.price =
//         "Price cannot be greater than MRP.";
//     }

//     if (!/^[A-Za-z]{3}$/.test(currency)) {
//       newErrors.currency =
//         "Enter a valid 3-letter currency code.";
//     }

//     if (!paymentUrl) {
//       newErrors.paymentUrl =
//         "Payment URL is required.";
//     } else if (!isValidHttpUrl(paymentUrl)) {
//       newErrors.paymentUrl =
//         "Enter a valid HTTP/HTTPS payment URL.";
//     }

//     if (!redirectUrl) {
//       newErrors.redirectUrl =
//         "Redirect URL is required.";
//     } else if (
//       !isValidRedirectUrl(redirectUrl)
//     ) {
//       newErrors.redirectUrl =
//         "Use a frontend path such as /system-design/lld.";
//     }

//     if (!coverPage) {
//       newErrors.coverPage =
//         "Cover page is required.";
//     }

//     if (
//       ["pdf", "ebook"].includes(
//         formData.resourceType
//       ) &&
//       !pdfFile
//     ) {
//       newErrors.pdf =
//         "PDF is required for PDF and Ebook products.";
//     }

//     setErrors(newErrors);

//     return Object.keys(newErrors).length === 0;
//   };

//   const resetForm = () => {
//     if (coverPreview) {
//       URL.revokeObjectURL(coverPreview);
//     }

//     setFormData(initialFormData);
//     setCoverPage(null);
//     setPdfFile(null);
//     setCoverPreview("");
//     setErrors({});

//     const coverInput =
//       document.getElementById("coverPage");

//     const pdfInput =
//       document.getElementById("pdf");

//     if (coverInput) {
//       coverInput.value = "";
//     }

//     if (pdfInput) {
//       pdfInput.value = "";
//     }
//   };

//   const getApiError = (error) => {
//     const apiError = error.response?.data?.error;

//     if (typeof apiError === "string") {
//       return apiError;
//     }

//     if (
//       apiError &&
//       typeof apiError.message === "string"
//     ) {
//       return apiError.message;
//     }

//     if (
//       typeof error.response?.data?.message ===
//       "string"
//     ) {
//       return error.response.data.message;
//     }

//     return "Something went wrong while creating the product.";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (loading) return;

//     if (!validateForm()) {
//       toast.error(
//         "Please fix the highlighted fields."
//       );
//       return;
//     }

//     if (!token) {
//       toast.error(
//         "Authentication token not found. Please login again."
//       );
//       return;
//     }

//     const data = new FormData();

//     data.append(
//       "title",
//       formData.title.trim()
//     );

//     data.append(
//       "slug",
//       formData.slug.trim().toLowerCase()
//     );

//     data.append(
//       "subtitle",
//       formData.subtitle.trim()
//     );

//     data.append(
//       "description",
//       formData.description.trim()
//     );

//     data.append(
//       "resourceType",
//       formData.resourceType
//     );

//     data.append(
//       "price",
//       String(Number(formData.price))
//     );

//     data.append(
//       "mrp",
//       String(Number(formData.mrp))
//     );

//     data.append(
//       "currency",
//       formData.currency.trim().toUpperCase()
//     );

//     data.append(
//       "paymentUrl",
//       formData.paymentUrl.trim()
//     );

//     data.append(
//       "redirectUrl",
//       formData.redirectUrl.trim()
//     );

//     data.append(
//       "pageKey",
//       formData.pageKey.trim().toLowerCase()
//     );

//     data.append(
//       "fileName",
//       formData.fileName.trim()
//     );

//     data.append(
//       "tags",
//       JSON.stringify(
//         convertToArray(formData.tags)
//       )
//     );

//     data.append(
//       "topics",
//       JSON.stringify(
//         convertToArray(formData.topics)
//       )
//     );

//     data.append(
//       "category",
//       formData.category.trim()
//     );

//     data.append(
//       "highlights",
//       JSON.stringify(
//         convertToArray(formData.highlights)
//       )
//     );

//     data.append(
//       "badge",
//       formData.badge.trim()
//     );

//     data.append(
//       "isPublished",
//       String(formData.isPublished)
//     );

//     data.append(
//       "isActive",
//       String(formData.isActive)
//     );

//     data.append(
//       "isFeatured",
//       String(formData.isFeatured)
//     );

//     data.append("coverPage", coverPage);

//     if (pdfFile) {
//       data.append("pdf", pdfFile);
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post(
//         `${BASE_URL}/book/admin/create`,
//         data,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.data?.success) {
//         toast.success(
//           "Product created successfully!"
//         );

//         resetForm();
//         window.scrollTo({
//           top: 0,
//           behavior: "smooth",
//         });

//         return;
//       }

//       toast.error(
//         response.data?.error?.message ||
//           response.data?.message ||
//           "Failed to create product."
//       );
//     } catch (error) {
//       console.error(
//         "Create product error:",
//         error
//       );

//       toast.error(getApiError(error));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#f7f9fc] px-4 py-8 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-7xl">
//         <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
//           <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
//             <div>
//               <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
//                 TargetTrek Admin
//               </div>

//               <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
//                 Create Digital Product
//               </h1>

//               <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
//                 Create an ebook, PDF, course,
//                 bundle, template, or other digital
//                 product and connect it to its custom
//                 landing page.
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
//               <StatCard
//                 label="Status"
//                 value={
//                   formData.isPublished
//                     ? "Published"
//                     : "Draft"
//                 }
//               />

//               <StatCard
//                 label="Type"
//                 value={
//                   resourceTypes.find(
//                     (item) =>
//                       item.value ===
//                       formData.resourceType
//                   )?.label || "Product"
//                 }
//               />

//               <StatCard
//                 label="Discount"
//                 value={`${discount}%`}
//                 className="col-span-2 sm:col-span-1"
//               />
//             </div>
//           </div>
//         </div>

//         <form
//           onSubmit={handleSubmit}
//           className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
//         >
//           <div className="space-y-6">
//             <Section>
//               <SectionTitle
//                 number="01"
//                 title="Product Information"
//                 description="Core information used to identify and describe this digital product."
//               />

//               <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                 <Input
//                   label="Product Title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                   error={errors.title}
//                   placeholder="Mastering System Design - LLD"
//                 />

//                 <div>
//                   <FieldLabel
//                     label="Slug"
//                     required
//                   />

//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       name="slug"
//                       value={formData.slug}
//                       onChange={handleChange}
//                       placeholder="mastering-system-design-lld"
//                       className={inputClass(
//                         errors.slug
//                       )}
//                     />

//                     <button
//                       type="button"
//                       onClick={generateSlug}
//                       className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
//                     >
//                       Generate
//                     </button>
//                   </div>

//                   {errors.slug && (
//                     <ErrorText
//                       text={errors.slug}
//                     />
//                   )}
//                 </div>

//                 <Input
//                   label="Subtitle"
//                   name="subtitle"
//                   value={formData.subtitle}
//                   onChange={handleChange}
//                   placeholder="A complete practical guide to low-level design"
//                 />

//                 <Select
//                   label="Resource Type"
//                   name="resourceType"
//                   value={formData.resourceType}
//                   onChange={handleChange}
//                   options={resourceTypes}
//                   required
//                   error={errors.resourceType}
//                 />

//                 <div className="md:col-span-2">
//                   <TextArea
//                     label="Description"
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     placeholder="Describe what this product contains, what readers will learn, and why it is useful."
//                     rows={6}
//                   />
//                 </div>
//               </div>
//             </Section>

//             <Section>
//               <SectionTitle
//                 number="02"
//                 title="Page Configuration"
//                 description="Connect this product with its dedicated React landing page."
//               />

//               <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                 <div>
//                   <FieldLabel
//                     label="Page Key"
//                     required
//                   />

//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       name="pageKey"
//                       value={formData.pageKey}
//                       onChange={handleChange}
//                       placeholder="system-design-lld"
//                       className={inputClass(
//                         errors.pageKey
//                       )}
//                     />

//                     <button
//                       type="button"
//                       onClick={generatePageKey}
//                       className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
//                     >
//                       Generate
//                     </button>
//                   </div>

//                   <HelperText>
//                     Stable internal identifier for
//                     the custom product page.
//                   </HelperText>

//                   {errors.pageKey && (
//                     <ErrorText
//                       text={errors.pageKey}
//                     />
//                   )}
//                 </div>

//                 <Input
//                   label="Redirect URL"
//                   name="redirectUrl"
//                   value={formData.redirectUrl}
//                   onChange={handleChange}
//                   required
//                   error={errors.redirectUrl}
//                   placeholder="/system-design/lld"
//                   helper="Frontend route only. Example: /google-adk"
//                 />

//                 <div className="md:col-span-2">
//                   <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
//                     <div className="flex items-start gap-3">
//                       <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-blue-700 shadow-sm">
//                         i
//                       </div>

//                       <div>
//                         <p className="text-sm font-semibold text-slate-800">
//                           Custom landing page
//                         </p>

//                         <p className="mt-1 text-xs leading-5 text-slate-600">
//                           The database stores product
//                           metadata. Your React route at{" "}
//                           <span className="font-semibold text-blue-700">
//                             {formData.redirectUrl ||
//                               "/your-product-page"}
//                           </span>{" "}
//                           controls the actual page
//                           design and content.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </Section>

//             <Section>
//               <SectionTitle
//                 number="03"
//                 title="Pricing & Checkout"
//                 description="Set pricing, currency, and the checkout destination."
//               />

//               <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
//                 <Input
//                   label="Selling Price"
//                   name="price"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={formData.price}
//                   onChange={handleChange}
//                   required
//                   error={errors.price}
//                   placeholder="149"
//                 />

//                 <Input
//                   label="MRP"
//                   name="mrp"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={formData.mrp}
//                   onChange={handleChange}
//                   required
//                   error={errors.mrp}
//                   placeholder="299"
//                 />

//                 <Input
//                   label="Currency"
//                   name="currency"
//                   value={formData.currency}
//                   onChange={handleChange}
//                   required
//                   error={errors.currency}
//                   placeholder="INR"
//                   maxLength={3}
//                 />

//                 <div className="sm:col-span-2 lg:col-span-3">
//                   <Input
//                     label="Payment URL"
//                     name="paymentUrl"
//                     type="url"
//                     value={formData.paymentUrl}
//                     onChange={handleChange}
//                     required
//                     error={errors.paymentUrl}
//                     placeholder="https://..."
//                     helper="The PayU or other checkout URL opened when the customer purchases this product."
//                   />
//                 </div>
//               </div>

//               {discount > 0 && (
//                 <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
//                   <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
//                     {discount}% OFF
//                   </span>

//                   <span className="text-sm text-emerald-800">
//                     Customer saves{" "}
//                     <strong>
//                       {formData.currency || "INR"}{" "}
//                       {(
//                         Number(formData.mrp) -
//                         Number(formData.price)
//                       ).toFixed(2)}
//                     </strong>
//                   </span>
//                 </div>
//               )}
//             </Section>

//             <Section>
//               <SectionTitle
//                 number="04"
//                 title="Discovery & Classification"
//                 description="Organize the product for your storefront and internal management."
//               />

//               <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                 <Input
//                   label="Category"
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   placeholder="System Design"
//                 />

//                 <Input
//                   label="Badge"
//                   name="badge"
//                   value={formData.badge}
//                   onChange={handleChange}
//                   placeholder="Bestseller"
//                 />

//                 <div className="md:col-span-2">
//                   <Input
//                     label="Tags"
//                     name="tags"
//                     value={formData.tags}
//                     onChange={handleChange}
//                     placeholder="LLD, Java, Design Patterns, Interviews"
//                     helper="Separate multiple tags with commas."
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <Input
//                     label="Topics"
//                     name="topics"
//                     value={formData.topics}
//                     onChange={handleChange}
//                     placeholder="SOLID Principles, Factory Pattern, Observer Pattern"
//                     helper="Separate multiple topics with commas."
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <TextArea
//                     label="Highlights"
//                     name="highlights"
//                     value={formData.highlights}
//                     onChange={handleChange}
//                     placeholder="15 real-world design problems, Java examples, Interview preparation"
//                     helper="Separate multiple highlights with commas."
//                     rows={3}
//                   />
//                 </div>
//               </div>
//             </Section>

//             <Section>
//               <SectionTitle
//                 number="05"
//                 title="Product Files"
//                 description="Files are uploaded to Cloudinary. The returned secure URLs are stored automatically."
//               />

//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div>
//                   <FieldLabel
//                     label="Cover Page"
//                     required
//                   />

//                   <label
//                     className={`group relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition ${
//                       errors.coverPage
//                         ? "border-red-300 bg-red-50/40"
//                         : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
//                     }`}
//                   >
//                     {coverPreview ? (
//                       <>
//                         <img
//                           src={coverPreview}
//                           alt="Cover preview"
//                           className="max-h-[245px] max-w-full rounded-xl object-contain shadow-md"
//                         />

//                         <div className="absolute inset-x-0 bottom-0 bg-white/95 px-4 py-3 text-xs font-semibold text-slate-700 opacity-0 backdrop-blur transition group-hover:opacity-100">
//                           Click to replace cover
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <UploadIcon />

//                         <p className="mt-4 text-sm font-semibold text-slate-800">
//                           Upload cover page
//                         </p>

//                         <p className="mt-1 text-xs text-slate-500">
//                           JPG, PNG or WEBP
//                         </p>

//                         <span className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
//                           Choose image
//                         </span>
//                       </>
//                     )}

//                     <input
//                       id="coverPage"
//                       type="file"
//                       name="coverPage"
//                       accept="image/jpeg,image/png,image/webp"
//                       onChange={handleCoverChange}
//                       className="hidden"
//                     />
//                   </label>

//                   {coverPage && (
//                     <div className="mt-3 flex items-center justify-between gap-3">
//                       <p className="min-w-0 truncate text-xs text-slate-500">
//                         {coverPage.name}
//                       </p>

//                       <button
//                         type="button"
//                         onClick={removeCover}
//                         className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-600"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   )}

//                   {errors.coverPage && (
//                     <ErrorText
//                       text={errors.coverPage}
//                     />
//                   )}
//                 </div>

//                 <div>
//                   <FieldLabel
//                     label="Product PDF"
//                     required={[
//                       "pdf",
//                       "ebook",
//                     ].includes(
//                       formData.resourceType
//                     )}
//                   />

//                   <label
//                     className={`flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${
//                       errors.pdf
//                         ? "border-red-300 bg-red-50/40"
//                         : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
//                     }`}
//                   >
//                     <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-sm font-black text-red-600">
//                       PDF
//                     </div>

//                     <p className="mt-4 max-w-full truncate px-4 text-sm font-semibold text-slate-800">
//                       {pdfFile
//                         ? pdfFile.name
//                         : "Upload product PDF"}
//                     </p>

//                     <p className="mt-1 text-xs text-slate-500">
//                       PDF format · Maximum 100 MB
//                     </p>

//                     {pdfFile && (
//                       <span className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
//                         {(
//                           pdfFile.size /
//                           1024 /
//                           1024
//                         ).toFixed(2)}{" "}
//                         MB selected
//                       </span>
//                     )}

//                     {!pdfFile && (
//                       <span className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
//                         Choose PDF
//                       </span>
//                     )}

//                     <input
//                       id="pdf"
//                       type="file"
//                       name="pdf"
//                       accept="application/pdf,.pdf"
//                       onChange={handlePdfChange}
//                       className="hidden"
//                     />
//                   </label>

//                   {pdfFile && (
//                     <div className="mt-3 flex items-center justify-between">
//                       <span className="text-xs text-slate-500">
//                         Ready to upload
//                       </span>

//                       <button
//                         type="button"
//                         onClick={removePdf}
//                         className="text-xs font-semibold text-red-500 hover:text-red-600"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   )}

//                   {errors.pdf && (
//                     <ErrorText
//                       text={errors.pdf}
//                     />
//                   )}
//                 </div>

//                 <div className="md:col-span-2">
//                   <Input
//                     label="Display File Name"
//                     name="fileName"
//                     value={formData.fileName}
//                     onChange={handleChange}
//                     placeholder="mastering-system-design-lld.pdf"
//                     helper="Optional. Automatically filled from the selected PDF if left empty."
//                   />
//                 </div>
//               </div>
//             </Section>
//           </div>

//           <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
//             <Section>
//               <SectionTitle
//                 title="Publishing"
//                 description="Control product visibility."
//               />

//               <div className="space-y-3">
//                 <Toggle
//                   label="Active"
//                   description="Keep this product active in the system."
//                   name="isActive"
//                   checked={formData.isActive}
//                   onChange={handleChange}
//                 />

//                 <Toggle
//                   label="Published"
//                   description="Allow public product APIs to return this product."
//                   name="isPublished"
//                   checked={formData.isPublished}
//                   onChange={handleChange}
//                 />

//                 <Toggle
//                   label="Featured"
//                   description="Mark this as a featured product."
//                   name="isFeatured"
//                   checked={formData.isFeatured}
//                   onChange={handleChange}
//                 />
//               </div>
//             </Section>

//             <Section>
//               <SectionTitle
//                 title="Product Preview"
//                 description="Quick overview before publishing."
//               />

//               <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
//                 <div className="flex min-h-[180px] items-center justify-center bg-white p-4">
//                   {coverPreview ? (
//                     <img
//                       src={coverPreview}
//                       alt="Product preview"
//                       className="max-h-[170px] rounded-lg object-contain shadow-sm"
//                     />
//                   ) : (
//                     <div className="text-center">
//                       <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
//                         TT
//                       </div>

//                       <p className="mt-2 text-xs text-slate-400">
//                         Cover preview
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="border-t border-slate-200 bg-white p-4">
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-bold text-slate-900">
//                         {formData.title ||
//                           "Product title"}
//                       </p>

//                       <p className="mt-1 truncate text-xs text-slate-500">
//                         {formData.category ||
//                           "No category"}
//                       </p>
//                     </div>

//                     {formData.badge && (
//                       <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
//                         {formData.badge}
//                       </span>
//                     )}
//                   </div>

//                   <div className="mt-4 flex items-end gap-2">
//                     <span className="text-xl font-bold text-slate-950">
//                       {formData.currency || "INR"}{" "}
//                       {formData.price || "0"}
//                     </span>

//                     {formData.mrp &&
//                       Number(formData.mrp) >
//                         Number(
//                           formData.price || 0
//                         ) && (
//                         <span className="pb-0.5 text-sm text-slate-400 line-through">
//                           {formData.currency ||
//                             "INR"}{" "}
//                           {formData.mrp}
//                         </span>
//                       )}
//                   </div>

//                   {formData.redirectUrl && (
//                     <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2">
//                       <p className="truncate font-mono text-[11px] text-slate-500">
//                         {formData.redirectUrl}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </Section>

//             <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {loading && <Spinner />}

//                 {loading
//                   ? "Creating Product..."
//                   : "Create Product"}
//               </button>

//               <button
//                 type="button"
//                 disabled={loading}
//                 onClick={() =>
//                   window.scrollTo({
//                     top: 0,
//                     behavior: "smooth",
//                   })
//                 }
//                 className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
//               >
//                 Review Form
//               </button>

//               <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
//                 Cover and PDF files are uploaded
//                 securely when you create the product.
//               </p>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const Section = ({ children }) => {
//   return (
//     <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
//       {children}
//     </section>
//   );
// };

// const SectionTitle = ({
//   number,
//   title,
//   description,
// }) => {
//   return (
//     <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
//       {number && (
//         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
//           {number}
//         </div>
//       )}

//       <div>
//         <h2 className="text-lg font-bold text-slate-900">
//           {title}
//         </h2>

//         {description && (
//           <p className="mt-1 text-sm leading-5 text-slate-500">
//             {description}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// const StatCard = ({
//   label,
//   value,
//   className = "",
// }) => {
//   return (
//     <div
//       className={`min-w-[105px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 ${className}`}
//     >
//       <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
//         {label}
//       </p>

//       <p className="mt-1 truncate text-sm font-bold capitalize text-slate-800">
//         {value}
//       </p>
//     </div>
//   );
// };

// const Required = () => (
//   <span className="ml-1 text-red-500">*</span>
// );

// const FieldLabel = ({
//   label,
//   required = false,
// }) => {
//   return (
//     <label className="mb-2 block text-sm font-semibold text-slate-700">
//       {label}
//       {required && <Required />}
//     </label>
//   );
// };

// const HelperText = ({ children }) => {
//   return (
//     <p className="mt-1.5 text-xs leading-5 text-slate-400">
//       {children}
//     </p>
//   );
// };

// const ErrorText = ({ text }) => {
//   return (
//     <p className="mt-1.5 text-xs font-semibold text-red-500">
//       {text}
//     </p>
//   );
// };

// const inputClass = (error) => {
//   return `w-full rounded-xl border ${
//     error
//       ? "border-red-300 bg-red-50/20 focus:border-red-400 focus:ring-red-100"
//       : "border-slate-200 bg-white focus:border-blue-400 focus:ring-blue-100"
//   } px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4`;
// };

// const Input = ({
//   label,
//   name,
//   value,
//   onChange,
//   type = "text",
//   required = false,
//   error,
//   placeholder,
//   helper,
//   min,
//   step,
//   maxLength,
// }) => {
//   return (
//     <div>
//       <FieldLabel
//         label={label}
//         required={required}
//       />

//       <input
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         min={min}
//         step={step}
//         maxLength={maxLength}
//         className={inputClass(error)}
//       />

//       {helper && !error && (
//         <HelperText>{helper}</HelperText>
//       )}

//       {error && <ErrorText text={error} />}
//     </div>
//   );
// };

// const TextArea = ({
//   label,
//   name,
//   value,
//   onChange,
//   required = false,
//   error,
//   placeholder,
//   helper,
//   rows = 5,
// }) => {
//   return (
//     <div>
//       <FieldLabel
//         label={label}
//         required={required}
//       />

//       <textarea
//         name={name}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         rows={rows}
//         className={`${inputClass(
//           error
//         )} resize-y`}
//       />

//       {helper && !error && (
//         <HelperText>{helper}</HelperText>
//       )}

//       {error && <ErrorText text={error} />}
//     </div>
//   );
// };

// const Select = ({
//   label,
//   name,
//   value,
//   onChange,
//   options,
//   required = false,
//   error,
// }) => {
//   return (
//     <div>
//       <FieldLabel
//         label={label}
//         required={required}
//       />

//       <select
//         name={name}
//         value={value}
//         onChange={onChange}
//         className={inputClass(error)}
//       >
//         {options.map((option) => (
//           <option
//             key={option.value}
//             value={option.value}
//           >
//             {option.label}
//           </option>
//         ))}
//       </select>

//       {error && <ErrorText text={error} />}
//     </div>
//   );
// };

// const Toggle = ({
//   label,
//   description,
//   name,
//   checked,
//   onChange,
// }) => {
//   return (
//     <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
//       <span>
//         <span className="block text-sm font-bold text-slate-800">
//           {label}
//         </span>

//         <span className="mt-1 block text-xs leading-5 text-slate-500">
//           {description}
//         </span>
//       </span>

//       <span className="relative mt-0.5 inline-flex shrink-0">
//         <input
//           type="checkbox"
//           name={name}
//           checked={checked}
//           onChange={onChange}
//           className="peer sr-only"
//         />

//         <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600" />

//         <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
//       </span>
//     </label>
//   );
// };

// const UploadIcon = () => {
//   return (
//     <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
//       <svg
//         width="26"
//         height="26"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//         <polyline points="17 8 12 3 7 8" />
//         <line
//           x1="12"
//           y1="3"
//           x2="12"
//           y2="15"
//         />
//       </svg>
//     </div>
//   );
// };

// const Spinner = () => {
//   return (
//     <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//   );
// };

// export default AddBook;


import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  ImagePlus,
  Layers3,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url";

// =====================================================
// API CONFIGURATION
// =====================================================

const API_BASE = String(BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

const GET_BOOKS_URL = `${API_BASE}/book`;

const CREATE_BOOK_URL =
  `${API_BASE}/book/admin/create`;

const RESOURCE_TYPES = [
  { value: "ebook", label: "eBook" },
  { value: "pdf", label: "PDF" },
  { value: "bundle", label: "Book Bundle" },
  { value: "course", label: "Course" },
  { value: "template", label: "Template" },
  { value: "notes", label: "Notes" },
  { value: "other", label: "Other" },
];

// Start as bundle so selector is immediately visible.
const INITIAL_FORM = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  resourceType: "bundle",
  price: "",
  mrp: "",
  currency: "INR",
  paymentUrl: "",
  redirectUrl: "",
  pageKey: "",
  fileName: "",
  tags: "",
  topics: "",
  category: "",
  highlights: "",
  badge: "",
  isPublished: false,
  isActive: true,
  isFeatured: false,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const commaToArray = (value = "") =>
  String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const formatMoney = (
  amount,
  currency = "INR"
) => {
  const number = Number(amount);

  if (!Number.isFinite(number)) {
    return "-";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(number);
  } catch {
    return `${currency} ${number}`;
  }
};

const getApiError = (error) => {
  const data = error?.response?.data;

  return (
    data?.error?.message ||
    data?.message ||
    error?.message ||
    "Request failed."
  );
};

const normalizeBooksResponse = (payload) => {
  // Standard controller response:
  // { success: true, count, data: [...] }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  // Compatible with nested wrappers if introduced.
  if (Array.isArray(payload?.data?.books)) {
    return payload.data.books;
  }

  if (Array.isArray(payload?.books)) {
    return payload.books;
  }

  throw new Error(
    "GET /book did not return a recognized books array."
  );
};

const normalizeBook = (record) => {
  if (!record) return null;

  const id =
    record._id ||
    record.id;

  if (!id) return null;

  return {
    id: String(id),
    title: record.title || "Untitled Book",
    subtitle: record.subtitle || "",
    slug: record.slug || "",
    category: record.category || "",
    resourceType: record.resourceType || "ebook",
    price: Number(record.price) || 0,
    mrp: Number(record.mrp) || 0,
    currency: record.currency || "INR",
    coverPageUrl: record.coverPageUrl || "",
    isPublished: record.isPublished !== false,
    isActive: record.isActive !== false,
  };
};

const validHttpUrl = (value) => {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
};

const validRedirectUrl = (value) => {
  const path = String(value || "").trim();

  return (
    path.length > 1 &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !/[\r\n\\]/.test(path)
  );
};

// =====================================================
// REUSABLE UI COMPONENTS
// =====================================================

function Panel({
  title,
  description,
  children,
  className = "",
}) {
  return (
    <section
      className={`
        rounded-2xl border border-slate-200
        bg-white p-5 shadow-sm sm:p-6
        ${className}
      `}
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  helper,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className={labelClass}
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`${inputClass} ${
          error ? "border-red-400" : ""
        }`}
        {...props}
      />

      {helper && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">
          {helper}
        </p>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  rows = 4,
  placeholder,
  helper,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className={labelClass}
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`${inputClass} resize-y`}
      />

      {helper && (
        <p className="mt-1.5 text-xs text-slate-500">
          {helper}
        </p>
      )}
    </div>
  );
}

function BookCover({
  book,
  size = "normal",
}) {
  const dimensions =
    size === "small"
      ? "h-14 w-10"
      : "h-28 w-20";

  return (
    <div
      className={`
        ${dimensions}
        shrink-0 overflow-hidden
        rounded-lg border border-slate-200
        bg-slate-100
      `}
    >
      {book.coverPageUrl ? (
        <img
          src={book.coverPageUrl}
          alt={book.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400">
          <BookOpen size={23} />
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  name,
  checked,
  onChange,
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-blue-600"
      />
    </label>
  );
}

// =====================================================
// BOOK SELECTION CARD
// =====================================================

function BookSelectionCard({
  book,
  selected,
  disabled,
  onToggle,
}) {
  return (
    <label
      className={`
        flex items-start gap-4
        rounded-2xl border-2 p-4
        transition
        ${
          disabled
            ? "cursor-default border-slate-200 opacity-60"
            : selected
              ? "cursor-pointer border-blue-500 bg-blue-50"
              : "cursor-pointer border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
        }
      `}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={() => onToggle(book.id)}
        className="sr-only"
      />

      <BookCover book={book} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
              {book.resourceType}
            </p>

            <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">
              {book.title}
            </h3>
          </div>

          <span
            className={`
              flex h-6 w-6 shrink-0
              items-center justify-center
              rounded-md border
              ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white"
              }
            `}
          >
            {selected && (
              <Check size={16} />
            )}
          </span>
        </div>

        {book.subtitle && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {book.subtitle}
          </p>
        )}

        {book.category && (
          <p className="mt-2 text-xs text-slate-500">
            {book.category}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <strong className="text-sm text-slate-950">
            {formatMoney(
              book.price,
              book.currency
            )}
          </strong>

          {book.mrp > book.price && (
            <span className="text-xs text-slate-400 line-through">
              {formatMoney(
                book.mrp,
                book.currency
              )}
            </span>
          )}
        </div>
      </div>
    </label>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AddBook() {
  const token = useSelector(
    (state) => state.auth.token
  );

  const [formData, setFormData] =
    useState({ ...INITIAL_FORM });

  const [availableBooks, setAvailableBooks] =
    useState([]);

  const [selectedBookIds, setSelectedBookIds] =
    useState([]);

  const [searchText, setSearchText] =
    useState("");

  const [fetchingBooks, setFetchingBooks] =
    useState(true);

  const [booksError, setBooksError] =
    useState("");

  const [booksHttpStatus, setBooksHttpStatus] =
    useState(null);

  const [lastFetchTime, setLastFetchTime] =
    useState(null);

  const [coverPage, setCoverPage] =
    useState(null);

  const [coverPreview, setCoverPreview] =
    useState("");

  const [pdfFile, setPdfFile] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [errors, setErrors] =
    useState({});

  const coverInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const coverObjectUrlRef = useRef("");

  const mountedRef = useRef(false);
  const fetchSequenceRef = useRef(0);

  const isBundle =
    formData.resourceType === "bundle";

  const requiresPdf =
    formData.resourceType === "ebook" ||
    formData.resourceType === "pdf";

  // ===================================================
  // FETCH ALL BOOKS
  // ===================================================

  const fetchBooks = useCallback(
    async ({ signal } = {}) => {
      const requestId =
        ++fetchSequenceRef.current;

      setFetchingBooks(true);
      setBooksError("");
      setBooksHttpStatus(null);

      console.log(
        "[AddBook] GET:",
        GET_BOOKS_URL
      );

      try {
        const response = await axios.get(
          GET_BOOKS_URL,
          {
            signal,
            timeout: 20000,
            headers: {
              Accept: "application/json",
            },
            params: {
              // Bypass browser/proxy cache.
              _t: Date.now(),
            },
          }
        );

        if (
          signal?.aborted ||
          requestId !==
            fetchSequenceRef.current
        ) {
          return;
        }

        setBooksHttpStatus(
          response.status
        );

        const payload =
          response.data;

        if (payload?.success === false) {
          throw new Error(
            payload.message ||
            "The books API returned success=false."
          );
        }

        const records =
          normalizeBooksResponse(payload);

        const normalized =
          records
            .map(normalizeBook)
            .filter(Boolean);

        // The backend's bundle validator permits
        // existing PDF/eBook products only.
        const eligibleBooks =
          normalized.filter((book) =>
            ["ebook", "pdf"].includes(
              book.resourceType
            )
          );

        setAvailableBooks(
          eligibleBooks
        );

        setLastFetchTime(
          new Date()
        );

        console.log(
          "[AddBook] Books loaded:",
          eligibleBooks.length,
          eligibleBooks
        );

      } catch (error) {
        if (
          signal?.aborted ||
          requestId !==
            fetchSequenceRef.current ||
          axios.isCancel(error)
        ) {
          return;
        }

        console.error(
          "[AddBook] GET /book failed:",
          error
        );

        setAvailableBooks([]);

        setBooksHttpStatus(
          error.response?.status ?? null
        );

        const message =
          getApiError(error);

        if (!error.response) {
          setBooksError(
            `Network or CORS error while calling ${GET_BOOKS_URL}. ${message}`
          );
        } else {
          setBooksError(
            `GET /book returned HTTP ${error.response.status}: ${message}`
          );
        }
      } finally {
        if (
          !signal?.aborted &&
          requestId ===
            fetchSequenceRef.current
        ) {
          setFetchingBooks(false);
        }
      }
    },
    []
  );

  // ===================================================
  // FETCH ON PAGE MOUNT
  // ===================================================

  useEffect(() => {
    mountedRef.current = true;

    const controller =
      new AbortController();

    // Important:
    // No condition such as if (isBundle).
    // This runs on page mount.
    fetchBooks({
      signal: controller.signal,
    });

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, [fetchBooks]);

  // ===================================================
  // COVER OBJECT URL CLEANUP
  // ===================================================

  useEffect(() => {
    return () => {
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(
          coverObjectUrlRef.current
        );
      }
    };
  }, []);

  // ===================================================
  // FILTER BOOKS
  // ===================================================

  const filteredBooks = useMemo(() => {
    const keyword =
      searchText.trim().toLowerCase();

    if (!keyword) {
      return availableBooks;
    }

    return availableBooks.filter(
      (book) =>
        book.title
          .toLowerCase()
          .includes(keyword) ||
        book.slug
          .toLowerCase()
          .includes(keyword) ||
        book.subtitle
          .toLowerCase()
          .includes(keyword) ||
        book.category
          .toLowerCase()
          .includes(keyword)
    );
  }, [
    availableBooks,
    searchText,
  ]);

  // ===================================================
  // SELECTED BOOKS
  // ===================================================

  const selectedBooks = useMemo(() => {
    const bookMap = new Map(
      availableBooks.map((book) => [
        book.id,
        book,
      ])
    );

    return selectedBookIds
      .map((id) => bookMap.get(id))
      .filter(Boolean);
  }, [
    availableBooks,
    selectedBookIds,
  ]);

  const toggleBook = (bookId) => {
    setSelectedBookIds((prev) => {
      if (prev.includes(bookId)) {
        return prev.filter(
          (id) => id !== bookId
        );
      }

      return [
        ...prev,
        bookId,
      ];
    });

    setErrors((prev) => ({
      ...prev,
      includedBooks: "",
    }));
  };

  const selectAllVisible = () => {
    setSelectedBookIds((prev) => [
      ...new Set([
        ...prev,
        ...filteredBooks.map(
          (book) => book.id
        ),
      ]),
    ]);

    setErrors((prev) => ({
      ...prev,
      includedBooks: "",
    }));
  };

  const clearSelection = () => {
    setSelectedBookIds([]);
  };

  const combinedPrice = useMemo(
    () =>
      selectedBooks.reduce(
        (sum, book) =>
          sum + book.price,
        0
      ),
    [selectedBooks]
  );

  const combinedMrp = useMemo(
    () =>
      selectedBooks.reduce(
        (sum, book) =>
          sum + (
            book.mrp > 0
              ? book.mrp
              : book.price
          ),
        0
      ),
    [selectedBooks]
  );

  const sameCurrency =
    selectedBooks.every(
      (book) =>
        book.currency ===
        formData.currency
    );

  // ===================================================
  // FORM EVENTS
  // ===================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    let nextValue =
      type === "checkbox"
        ? checked
        : value;

    if (name === "currency") {
      nextValue = String(value)
        .toUpperCase()
        .slice(0, 3);
    }

    if (
      name === "slug" ||
      name === "pageKey"
    ) {
      nextValue =
        String(value).toLowerCase();
    }

    if (
      name === "resourceType" &&
      value === "bundle"
    ) {
      setPdfFile(null);

      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
      ...(name === "resourceType" &&
      value === "bundle"
        ? { fileName: "" }
        : {}),
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const setResourceType = (value) => {
    setFormData((prev) => ({
      ...prev,
      resourceType: value,
      ...(value === "bundle"
        ? { fileName: "" }
        : {}),
    }));

    if (value === "bundle") {
      setPdfFile(null);

      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    }
  };

  const generateSlugAndKey = () => {
    const slug =
      slugify(formData.title);

    if (!slug) {
      toast.error(
        "Enter the product title first."
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      slug,
      pageKey: slug,
    }));
  };

  const generateRedirect = () => {
    const slug =
      formData.slug ||
      slugify(formData.title);

    if (!slug) {
      toast.error(
        "Enter a title or slug first."
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      redirectUrl:
        `/book/${slug}`,
    }));
  };

  const handleCoverChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const allowed = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (
      !allowed.includes(file.type)
    ) {
      toast.error(
        "Select a PNG, JPG or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      toast.error(
        "Cover must be below 10 MB."
      );

      event.target.value = "";
      return;
    }

    if (
      coverObjectUrlRef.current
    ) {
      URL.revokeObjectURL(
        coverObjectUrlRef.current
      );
    }

    const url =
      URL.createObjectURL(file);

    coverObjectUrlRef.current =
      url;

    setCoverPage(file);
    setCoverPreview(url);

    setErrors((prev) => ({
      ...prev,
      coverPage: "",
    }));
  };

  const removeCover = () => {
    if (
      coverObjectUrlRef.current
    ) {
      URL.revokeObjectURL(
        coverObjectUrlRef.current
      );

      coverObjectUrlRef.current = "";
    }

    setCoverPage(null);
    setCoverPreview("");

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const handlePdfChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const validPdf =
      file.type ===
        "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!validPdf) {
      toast.error(
        "Only PDF files are allowed."
      );
      event.target.value = "";
      return;
    }

    if (
      file.size >
      100 * 1024 * 1024
    ) {
      toast.error(
        "PDF must be below 100 MB."
      );
      event.target.value = "";
      return;
    }

    setPdfFile(file);

    setFormData((prev) => ({
      ...prev,
      fileName:
        prev.fileName ||
        file.name,
    }));

    setErrors((prev) => ({
      ...prev,
      pdf: "",
    }));
  };

  const removePdf = () => {
    setPdfFile(null);

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  // ===================================================
  // DISCOUNT
  // ===================================================

  const discount = useMemo(() => {
    if (
      formData.price === "" ||
      formData.mrp === ""
    ) {
      return 0;
    }

    const price =
      Number(formData.price);

    const mrp =
      Number(formData.mrp);

    if (
      !Number.isFinite(price) ||
      !Number.isFinite(mrp) ||
      mrp <= 0 ||
      price >= mrp
    ) {
      return 0;
    }

    return Math.round(
      ((mrp - price) / mrp) * 100
    );
  }, [
    formData.price,
    formData.mrp,
  ]);

  // ===================================================
  // VALIDATION
  // ===================================================

  const validate = () => {
    const next = {};

    if (
      formData.title.trim().length < 3
    ) {
      next.title =
        "Title must have at least 3 characters.";
    }

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        formData.slug
      )
    ) {
      next.slug =
        "Enter a valid slug.";
    }

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        formData.pageKey
      )
    ) {
      next.pageKey =
        "Enter a valid page key.";
    }

    const price =
      Number(formData.price);

    const mrp =
      Number(formData.mrp);

    if (
      formData.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      next.price =
        "Enter a valid price.";
    }

    if (
      formData.mrp === "" ||
      !Number.isFinite(mrp) ||
      mrp < 0
    ) {
      next.mrp =
        "Enter a valid MRP.";
    }

    if (
      formData.price !== "" &&
      formData.mrp !== "" &&
      price > mrp
    ) {
      next.price =
        "Price cannot exceed MRP.";
    }

    if (
      !/^[A-Z]{3}$/.test(
        formData.currency
      )
    ) {
      next.currency =
        "Use a three-letter currency code.";
    }

    if (
      !validHttpUrl(
        formData.paymentUrl
      )
    ) {
      next.paymentUrl =
        "Enter a valid payment URL.";
    }

    if (
      !validRedirectUrl(
        formData.redirectUrl
      )
    ) {
      next.redirectUrl =
        "Enter a valid frontend route.";
    }

    if (!coverPage) {
      next.coverPage =
        "Cover image is required.";
    }

    if (
      requiresPdf &&
      !pdfFile
    ) {
      next.pdf =
        "Upload the product PDF.";
    }

    if (isBundle) {
      if (
        selectedBookIds.length === 0
      ) {
        next.includedBooks =
          "Select at least one book.";
      } else if (
        selectedBooks.length !==
        selectedBookIds.length
      ) {
        next.includedBooks =
          "Some selected books are unavailable. Refresh the list and select again.";
      }

      if (fetchingBooks) {
        next.includedBooks =
          "Wait for the books API to finish.";
      }

      if (booksError) {
        next.includedBooks =
          "Resolve the books API error before creating a bundle.";
      }
    }

    setErrors(next);

    return (
      Object.keys(next).length === 0
    );
  };

  // ===================================================
  // RESET FORM
  // ===================================================

  const resetForm = () => {
    setFormData({
      ...INITIAL_FORM,
    });

    setSelectedBookIds([]);
    setSearchText("");

    removeCover();
    removePdf();

    setErrors({});
  };

  // ===================================================
  // CREATE PRODUCT
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!validate()) {
      toast.error(
        "Please fix the highlighted fields."
      );

      return;
    }

    if (!token) {
      toast.error(
        "Authentication token missing. Please log in."
      );

      return;
    }

    const payload =
      new FormData();

    const stringFields = [
      "title",
      "slug",
      "subtitle",
      "description",
      "resourceType",
      "currency",
      "paymentUrl",
      "redirectUrl",
      "pageKey",
      "fileName",
      "category",
      "badge",
    ];

    for (const field of stringFields) {
      payload.append(
        field,
        String(
          formData[field] ?? ""
        ).trim()
      );
    }

    payload.append(
      "price",
      String(
        Number(formData.price)
      )
    );

    payload.append(
      "mrp",
      String(
        Number(formData.mrp)
      )
    );

    for (const field of [
      "tags",
      "topics",
      "highlights",
    ]) {
      payload.append(
        field,
        JSON.stringify(
          commaToArray(
            formData[field]
          )
        )
      );
    }

    for (const field of [
      "isPublished",
      "isActive",
      "isFeatured",
    ]) {
      payload.append(
        field,
        String(formData[field])
      );
    }

    // CRITICAL: MULTIPLE BOOK REFERENCES
    payload.append(
      "includedBooks",
      JSON.stringify(
        isBundle
          ? selectedBookIds
          : []
      )
    );

    // Existing multer field names.
    payload.append(
      "coverPage",
      coverPage
    );

    // Bundles don't upload a new PDF.
    if (
      !isBundle &&
      pdfFile
    ) {
      payload.append(
        "pdf",
        pdfFile
      );
    }

    try {
      setSubmitting(true);

      console.log(
        "[AddBook] POST:",
        CREATE_BOOK_URL
      );

      console.log(
        "[AddBook] Bundle IDs:",
        isBundle
          ? selectedBookIds
          : []
      );

      const response =
        await axios.post(
          CREATE_BOOK_URL,
          payload,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            timeout: 120000,
          }
        );

      if (
        response.data?.success !== true
      ) {
        throw new Error(
          response.data?.message ||
          "Product creation failed."
        );
      }

      toast.success(
        isBundle
          ? "Book bundle created successfully!"
          : "Product created successfully!"
      );

      resetForm();

      // Refresh product list after create.
      fetchBooks();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {
      console.error(
        "[AddBook] POST failed:",
        error
      );

      toast.error(
        getApiError(error)
      );

    } finally {
      setSubmitting(false);
    }
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            TARGET TREK ADMIN
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Add Books & Bundles
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Create individual ebooks or combine
            existing books into one product
            with a single checkout.
          </p>
        </div>

        {/* MAIN FORM */}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_350px]"
        >
          <div className="min-w-0 space-y-6">

            {/* ===================================
                SECTION 1: PRODUCT TYPE
            =================================== */}

            <Panel
              title="01. Select Product Type"
              description="Choose whether customers will receive one uploaded book or multiple existing books."
            >
              <div className="grid gap-4 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    setResourceType("ebook")
                  }
                  className={`
                    rounded-2xl border-2 p-5
                    text-left transition
                    ${
                      !isBundle
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }
                  `}
                >
                  <BookOpen
                    size={27}
                    className="text-blue-600"
                  />

                  <h3 className="mt-3 font-bold text-slate-900">
                    Single Book
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Upload a new cover and PDF.
                  </p>

                  {!isBundle && (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                      <Check size={14} />
                      Selected
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setResourceType("bundle")
                  }
                  className={`
                    rounded-2xl border-2 p-5
                    text-left transition
                    ${
                      isBundle
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }
                  `}
                >
                  <Layers3
                    size={27}
                    className="text-blue-600"
                  />

                  <h3 className="mt-3 font-bold text-slate-900">
                    Multiple Books / Bundle
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Select existing books.
                    No separate PDF upload.
                  </p>

                  {isBundle && (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                      <Check size={14} />
                      Selected
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-5">
                <label className={labelClass}>
                  Resource Type
                </label>

                <div className="relative">
                  <select
                    name="resourceType"
                    value={formData.resourceType}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    {RESOURCE_TYPES.map(
                      (type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </Panel>

            {/* ===================================
                SECTION 2: BOOK SELECTION

                ALWAYS VISIBLE.
                GET /book runs on mount.
            =================================== */}

            <Panel
              title="02. Existing Books — Select for Bundle"
              description="All available PDF/eBook products are loaded from your backend. Tick the books you want to include."
            >
              {/* API STATUS */}

              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Books API
                </p>

                <p className="mt-1 break-all font-mono text-xs text-blue-900">
                  GET {GET_BOOKS_URL}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {fetchingBooks ? (
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-700">
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Fetching books...
                    </span>
                  ) : booksError ? (
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-red-600">
                      <AlertCircle size={14} />
                      Request failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={14} />
                      Loaded {availableBooks.length} books
                    </span>
                  )}

                  {booksHttpStatus && (
                    <span className="text-xs text-slate-600">
                      HTTP {booksHttpStatus}
                    </span>
                  )}

                  {lastFetchTime && (
                    <span className="text-xs text-slate-500">
                      Last updated{" "}
                      {lastFetchTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              {/* SEARCH + REFRESH */}

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={searchText}
                    onChange={(event) =>
                      setSearchText(
                        event.target.value
                      )
                    }
                    placeholder="Search by title, slug, subtitle, category..."
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fetchBooks()
                  }
                  disabled={fetchingBooks}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={
                      fetchingBooks
                        ? "animate-spin"
                        : ""
                    }
                  />
                  Refresh Books
                </button>
              </div>

              {/* COUNTERS */}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-slate-600">
                    Available:
                    <strong className="ml-1 text-slate-950">
                      {availableBooks.length}
                    </strong>
                  </span>

                  <span className="text-sm font-semibold text-slate-600">
                    Selected:
                    <strong className="ml-1 text-blue-600">
                      {selectedBookIds.length}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={selectAllVisible}
                    disabled={
                      !isBundle ||
                      fetchingBooks ||
                      filteredBooks.length === 0
                    }
                    className="text-xs font-bold text-blue-600 disabled:opacity-40"
                  >
                    Select Visible
                  </button>

                  <button
                    type="button"
                    onClick={clearSelection}
                    disabled={
                      !isBundle ||
                      selectedBookIds.length === 0
                    }
                    className="text-xs font-bold text-red-600 disabled:opacity-40"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* SINGLE BOOK MESSAGE */}

              {!isBundle && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  Existing books are visible, but
                  selection is disabled while
                  creating a single product.
                  Choose <strong>Multiple Books / Bundle</strong>
                  {" "}above to enable it.
                </div>
              )}

              {/* API ERROR */}

              {booksError && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <p className="text-sm font-bold text-red-700">
                    Unable to load books
                  </p>

                  <p className="mt-2 break-words text-xs leading-6 text-red-700">
                    {booksError}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      fetchBooks()
                    }
                    className="mt-3 text-sm font-bold text-red-700 underline"
                  >
                    Retry GET /book
                  </button>
                </div>
              )}

              {/* LOADING */}

              {fetchingBooks && (
                <div className="flex min-h-[190px] flex-col items-center justify-center gap-3">
                  <Loader2
                    size={28}
                    className="animate-spin text-blue-600"
                  />

                  <p className="text-sm text-slate-500">
                    Loading existing products...
                  </p>
                </div>
              )}

              {/* BOOK CARDS */}

              {!fetchingBooks &&
                !booksError &&
                filteredBooks.length > 0 && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {filteredBooks.map((book) => (
                      <BookSelectionCard
                        key={book.id}
                        book={book}
                        disabled={!isBundle}
                        selected={
                          selectedBookIds.includes(
                            book.id
                          )
                        }
                        onToggle={toggleBook}
                      />
                    ))}
                  </div>
                )}

              {/* EMPTY BOOK LIST */}

              {!fetchingBooks &&
                !booksError &&
                filteredBooks.length === 0 && (
                  <div className="mt-5 flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    <BookOpen
                      size={30}
                      className="text-slate-400"
                    />

                    <h3 className="mt-3 text-sm font-bold text-slate-700">
                      No available books found
                    </h3>

                    <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">
                      {searchText
                        ? "No books match your search. Try another keyword."
                        : "GET /book returned no eligible PDF/eBook products. Check that the books are active and published."}
                    </p>
                  </div>
                )}

              {/* SELECTED BOOKS LIST */}

              {isBundle &&
                selectedBooks.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950">
                          Books Included in Bundle
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          These IDs will be sent in includedBooks.
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                        {selectedBooks.length}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {selectedBooks.map(
                        (book, index) => (
                          <div
                            key={book.id}
                            className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3"
                          >
                            <span className="text-xs font-bold text-blue-700">
                              {index + 1}.
                            </span>

                            <BookCover
                              book={book}
                              size="small"
                            />

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900">
                                {book.title}
                              </p>

                              <p className="mt-1 break-all font-mono text-[10px] text-slate-400">
                                {book.id}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleBook(book.id)
                              }
                              title="Remove book"
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <X size={17} />
                            </button>
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs text-slate-500">
                          Combined Selling Price
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-950">
                          {sameCurrency
                            ? formatMoney(
                                combinedPrice,
                                formData.currency
                              )
                            : "Mixed currencies"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs text-slate-500">
                          Combined MRP
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-950">
                          {sameCurrency
                            ? formatMoney(
                                combinedMrp,
                                formData.currency
                              )
                            : "Mixed currencies"}
                        </p>

                        {sameCurrency && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                mrp: String(combinedMrp),
                              }))
                            }
                            className="mt-2 text-xs font-bold text-blue-600"
                          >
                            Use Combined MRP
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {errors.includedBooks && (
                <p className="mt-4 text-sm font-semibold text-red-600">
                  {errors.includedBooks}
                </p>
              )}
            </Panel>

            {/* ===================================
                SECTION 3: PRODUCT INFO
            =================================== */}

            <Panel
              title="03. Product Information"
              description="Enter the product details that will be stored in MongoDB."
            >
              <div className="grid gap-5 md:grid-cols-2">

                <InputField
                  label="Product Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  placeholder="Mastering System Design — HLD + LLD Combo"
                  required
                  className="md:col-span-2"
                />

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={generateSlugAndKey}
                    className="rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                  >
                    Generate Slug + Page Key
                  </button>
                </div>

                <InputField
                  label="Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  error={errors.slug}
                  placeholder="system-design-hld-lld-combo"
                  required
                />

                <InputField
                  label="Page Key"
                  name="pageKey"
                  value={formData.pageKey}
                  onChange={handleChange}
                  error={errors.pageKey}
                  placeholder="system-design-hld-lld-combo"
                  required
                />

                <InputField
                  label="Subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="High-Level + Low-Level Design"
                  className="md:col-span-2"
                />

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe the complete book or bundle..."
                  />
                </div>
              </div>
            </Panel>

            {/* ===================================
                SECTION 4: URL CONFIG
            =================================== */}

            <Panel
              title="04. Page & Checkout URLs"
              description="Connect your product with its frontend sales page."
            >
              <div className="space-y-5">

                <InputField
                  label="Redirect URL"
                  name="redirectUrl"
                  value={formData.redirectUrl}
                  onChange={handleChange}
                  error={errors.redirectUrl}
                  placeholder="/book/system-design/hld-lld-combo"
                  required
                />

                <button
                  type="button"
                  onClick={generateRedirect}
                  className="text-xs font-bold text-blue-600"
                >
                  Generate Redirect from Slug
                </button>

                <InputField
                  label="Payment URL"
                  name="paymentUrl"
                  type="url"
                  value={formData.paymentUrl}
                  onChange={handleChange}
                  error={errors.paymentUrl}
                  placeholder="https://www.targettrek.in/book/system-design/hld-lld-combo"
                  helper="Use the destination configured for your current checkout flow."
                  required
                />
              </div>
            </Panel>

            {/* ===================================
                SECTION 5: PRICING
            =================================== */}

            <Panel
              title="05. Pricing"
              description="Set the selling price of this product or bundle."
            >
              <div className="grid gap-5 sm:grid-cols-3">

                <InputField
                  label="Selling Price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  error={errors.price}
                  required
                />

                <InputField
                  label="MRP"
                  name="mrp"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.mrp}
                  onChange={handleChange}
                  error={errors.mrp}
                  required
                />

                <InputField
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  error={errors.currency}
                  maxLength={3}
                  required
                />
              </div>

              {discount > 0 && (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <span className="font-bold text-emerald-700">
                    {discount}% OFF
                  </span>

                  <span className="ml-3 text-sm text-emerald-800">
                    Savings:{" "}
                    {formatMoney(
                      Number(formData.mrp) -
                      Number(formData.price),
                      formData.currency
                    )}
                  </span>
                </div>
              )}
            </Panel>

            {/* ===================================
                SECTION 6: DISCOVERY
            =================================== */}

            <Panel
              title="06. Discovery & Metadata"
              description="Organize your product for the storefront."
            >
              <div className="grid gap-5 md:grid-cols-2">

                <InputField
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="System Design"
                />

                <InputField
                  label="Badge"
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  placeholder="Best Value"
                />

                <InputField
                  label="Tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="HLD, LLD, Java, Interview"
                  helper="Separate tags with commas."
                  className="md:col-span-2"
                />

                <InputField
                  label="Topics"
                  name="topics"
                  value={formData.topics}
                  onChange={handleChange}
                  placeholder="Architecture, OOP, Design Patterns"
                  helper="Separate topics with commas."
                  className="md:col-span-2"
                />

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Highlights"
                    name="highlights"
                    value={formData.highlights}
                    onChange={handleChange}
                    placeholder="HLD, LLD, Real-world examples, Java code"
                    helper="Separate highlights with commas."
                    rows={3}
                  />
                </div>
              </div>
            </Panel>

            {/* ===================================
                SECTION 7: FILES
            =================================== */}

            <Panel
              title="07. Product Files"
              description={
                isBundle
                  ? "Upload the combo cover only. PDFs will come from the selected existing books."
                  : "Upload the cover and PDF for this new product."
              }
            >
              <div className="grid gap-5 md:grid-cols-2">

                {/* COVER */}

                <div>
                  <label className={labelClass}>
                    Cover Image *
                  </label>

                  <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-blue-400">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Product cover"
                        className="max-h-[220px] max-w-full object-contain"
                      />
                    ) : (
                      <>
                        <ImagePlus
                          size={34}
                          className="text-blue-600"
                        />

                        <p className="mt-3 text-sm font-bold text-slate-800">
                          Choose Cover Image
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          PNG / JPG / WEBP
                        </p>
                      </>
                    )}

                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>

                  {coverPage && (
                    <button
                      type="button"
                      onClick={removeCover}
                      className="mt-3 flex items-center gap-1 text-xs font-bold text-red-600"
                    >
                      <Trash2 size={14} />
                      Remove Cover
                    </button>
                  )}

                  {errors.coverPage && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.coverPage}
                    </p>
                  )}
                </div>

                {/* PDF UPLOAD */}

                {!isBundle && (
                  <div>
                    <label className={labelClass}>
                      Product PDF
                      {requiresPdf ? " *" : ""}
                    </label>

                    <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-blue-400">
                      <FileText
                        size={34}
                        className="text-red-600"
                      />

                      <p className="mt-3 max-w-full break-words text-sm font-bold text-slate-800">
                        {pdfFile
                          ? pdfFile.name
                          : "Choose Product PDF"}
                      </p>

                      <input
                        ref={pdfInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handlePdfChange}
                        className="hidden"
                      />
                    </label>

                    {pdfFile && (
                      <button
                        type="button"
                        onClick={removePdf}
                        className="mt-3 text-xs font-bold text-red-600"
                      >
                        Remove PDF
                      </button>
                    )}

                    {errors.pdf && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.pdf}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {isBundle && (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <Package size={18} />
                    Bundle contains {selectedBooks.length} books
                  </div>

                  <p className="mt-2 text-xs leading-6 text-emerald-700">
                    Each selected book retains its
                    own PDF. Customers can download
                    them individually from the
                    payment success page.
                  </p>
                </div>
              )}

              {!isBundle && (
                <div className="mt-5">
                  <InputField
                    label="Display File Name"
                    name="fileName"
                    value={formData.fileName}
                    onChange={handleChange}
                    placeholder="mastering-system-design.pdf"
                  />
                </div>
              )}
            </Panel>
          </div>

          {/* =====================================
              SIDEBAR
          ===================================== */}

          <aside className="min-w-0 space-y-6 xl:sticky xl:top-8 xl:self-start">

            <Panel
              title="Publishing"
              description="Control visibility."
            >
              <div className="space-y-3">
                <Toggle
                  label="Active"
                  description="Allow this product to be used."
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />

                <Toggle
                  label="Published"
                  description="Show in public product APIs."
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                />

                <Toggle
                  label="Featured"
                  description="Highlight in storefront."
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
              </div>
            </Panel>

            <Panel
              title="Product Preview"
              description="Review before saving."
            >
              <div className="rounded-xl border border-slate-200 p-4">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="mx-auto max-h-52 object-contain"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-slate-50 text-slate-300">
                    <BookOpen size={35} />
                  </div>
                )}

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  {formData.title ||
                    "Product Title"}
                </h3>

                <p className="mt-2 text-lg font-bold text-slate-950">
                  {formatMoney(
                    formData.price || 0,
                    formData.currency
                  )}
                </p>

                {isBundle && (
                  <div className="mt-4 rounded-xl bg-blue-50 p-3">
                    <p className="text-sm font-bold text-blue-800">
                      {selectedBooks.length} Included Books
                    </p>

                    {selectedBooks.map((book) => (
                      <p
                        key={book.id}
                        className="mt-2 text-xs leading-5 text-blue-700"
                      >
                        • {book.title}
                      </p>
                    ))}
                  </div>
                )}

                {formData.redirectUrl && (
                  <p className="mt-3 break-all font-mono text-xs text-slate-500">
                    {formData.redirectUrl}
                  </p>
                )}
              </div>
            </Panel>

            {/* SUBMIT */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <button
                type="submit"
                disabled={
                  submitting ||
                  (isBundle && fetchingBooks)
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={18} />
                )}

                {submitting
                  ? "Creating Product..."
                  : isBundle
                    ? "Create Book Bundle"
                    : "Create Product"}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                {isBundle
                  ? `${selectedBooks.length} books will be included in one product.`
                  : "One PDF will be delivered after purchase."}
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
