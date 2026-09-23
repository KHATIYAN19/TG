import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import BASE_URL from "../utils/Url";

const initialFormData = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  resourceType: "ebook",
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

const resourceTypes = [
  { value: "ebook", label: "Ebook" },
  { value: "pdf", label: "PDF" },
  { value: "course", label: "Course" },
  { value: "bundle", label: "Bundle" },
  { value: "template", label: "Template" },
  { value: "notes", label: "Notes" },
  { value: "other", label: "Other" },
];

const AddBook = () => {
  const token = useSelector((state) => state.auth.token);

  const [formData, setFormData] = useState(initialFormData);
  const [coverPage, setCoverPage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const discount = useMemo(() => {
    const price = Number(formData.price);
    const mrp = Number(formData.mrp);

    if (
      !Number.isFinite(price) ||
      !Number.isFinite(mrp) ||
      mrp <= 0 ||
      price < 0 ||
      price >= mrp
    ) {
      return 0;
    }

    return Math.round(((mrp - price) / mrp) * 100);
  }, [formData.price, formData.mrp]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let nextValue = type === "checkbox" ? checked : value;

    if (name === "currency") {
      nextValue = value.toUpperCase().slice(0, 3);
    }

    if (name === "slug" || name === "pageKey") {
      nextValue = value.toLowerCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const makeKey = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const generateSlug = () => {
    if (!formData.title.trim()) {
      toast.error("Enter a product title first.");
      return;
    }

    const slug = makeKey(formData.title);

    setFormData((prev) => ({
      ...prev,
      slug,
    }));

    setErrors((prev) => ({
      ...prev,
      slug: "",
    }));
  };

  const generatePageKey = () => {
    const source = formData.slug || formData.title;

    if (!source.trim()) {
      toast.error("Enter a title or slug first.");
      return;
    }

    const pageKey = makeKey(source);

    setFormData((prev) => ({
      ...prev,
      pageKey,
    }));

    setErrors((prev) => ({
      ...prev,
      pageKey: "",
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Cover must be JPG, PNG, or WEBP.");
      e.target.value = "";
      return;
    }

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverPage(file);
    setCoverPreview(URL.createObjectURL(file));

    setErrors((prev) => ({
      ...prev,
      coverPage: "",
    }));
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const validPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!validPdf) {
      toast.error("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    setPdfFile(file);

    setFormData((prev) => ({
      ...prev,
      fileName: prev.fileName || file.name,
    }));

    setErrors((prev) => ({
      ...prev,
      pdf: "",
    }));
  };

  const removeCover = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverPage(null);
    setCoverPreview("");

    const input = document.getElementById("coverPage");

    if (input) {
      input.value = "";
    }
  };

  const removePdf = () => {
    setPdfFile(null);

    const input = document.getElementById("pdf");

    if (input) {
      input.value = "";
    }
  };

  const convertToArray = (value) => {
    if (!value?.trim()) {
      return [];
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const isValidHttpUrl = (value) => {
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

  const isValidRedirectUrl = (value) => {
    const url = value.trim();

    return (
      url.startsWith("/") &&
      url.length > 1 &&
      !url.startsWith("//")
    );
  };

  const validateForm = () => {
    const newErrors = {};

    const title = formData.title.trim();
    const slug = formData.slug.trim();
    const pageKey = formData.pageKey.trim();
    const paymentUrl = formData.paymentUrl.trim();
    const redirectUrl = formData.redirectUrl.trim();
    const currency = formData.currency.trim();

    if (!title) {
      newErrors.title = "Product title is required.";
    } else if (title.length < 3) {
      newErrors.title =
        "Title must be at least 3 characters.";
    }

    if (!slug) {
      newErrors.slug = "Slug is required.";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {
      newErrors.slug =
        "Use lowercase letters, numbers and hyphens only.";
    }

    if (!pageKey) {
      newErrors.pageKey = "Page key is required.";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageKey)
    ) {
      newErrors.pageKey =
        "Use lowercase letters, numbers and hyphens only.";
    }

    if (!formData.resourceType) {
      newErrors.resourceType =
        "Resource type is required.";
    }

    if (formData.price === "") {
      newErrors.price = "Price is required.";
    } else {
      const price = Number(formData.price);

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        newErrors.price =
          "Enter a valid non-negative price.";
      }
    }

    if (formData.mrp === "") {
      newErrors.mrp = "MRP is required.";
    } else {
      const mrp = Number(formData.mrp);

      if (
        !Number.isFinite(mrp) ||
        mrp < 0
      ) {
        newErrors.mrp =
          "Enter a valid non-negative MRP.";
      }
    }

    if (
      formData.price !== "" &&
      formData.mrp !== "" &&
      Number(formData.price) >
        Number(formData.mrp)
    ) {
      newErrors.price =
        "Price cannot be greater than MRP.";
    }

    if (!/^[A-Za-z]{3}$/.test(currency)) {
      newErrors.currency =
        "Enter a valid 3-letter currency code.";
    }

    if (!paymentUrl) {
      newErrors.paymentUrl =
        "Payment URL is required.";
    } else if (!isValidHttpUrl(paymentUrl)) {
      newErrors.paymentUrl =
        "Enter a valid HTTP/HTTPS payment URL.";
    }

    if (!redirectUrl) {
      newErrors.redirectUrl =
        "Redirect URL is required.";
    } else if (
      !isValidRedirectUrl(redirectUrl)
    ) {
      newErrors.redirectUrl =
        "Use a frontend path such as /system-design/lld.";
    }

    if (!coverPage) {
      newErrors.coverPage =
        "Cover page is required.";
    }

    if (
      ["pdf", "ebook"].includes(
        formData.resourceType
      ) &&
      !pdfFile
    ) {
      newErrors.pdf =
        "PDF is required for PDF and Ebook products.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setFormData(initialFormData);
    setCoverPage(null);
    setPdfFile(null);
    setCoverPreview("");
    setErrors({});

    const coverInput =
      document.getElementById("coverPage");

    const pdfInput =
      document.getElementById("pdf");

    if (coverInput) {
      coverInput.value = "";
    }

    if (pdfInput) {
      pdfInput.value = "";
    }
  };

  const getApiError = (error) => {
    const apiError = error.response?.data?.error;

    if (typeof apiError === "string") {
      return apiError;
    }

    if (
      apiError &&
      typeof apiError.message === "string"
    ) {
      return apiError.message;
    }

    if (
      typeof error.response?.data?.message ===
      "string"
    ) {
      return error.response.data.message;
    }

    return "Something went wrong while creating the product.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!validateForm()) {
      toast.error(
        "Please fix the highlighted fields."
      );
      return;
    }

    if (!token) {
      toast.error(
        "Authentication token not found. Please login again."
      );
      return;
    }

    const data = new FormData();

    data.append(
      "title",
      formData.title.trim()
    );

    data.append(
      "slug",
      formData.slug.trim().toLowerCase()
    );

    data.append(
      "subtitle",
      formData.subtitle.trim()
    );

    data.append(
      "description",
      formData.description.trim()
    );

    data.append(
      "resourceType",
      formData.resourceType
    );

    data.append(
      "price",
      String(Number(formData.price))
    );

    data.append(
      "mrp",
      String(Number(formData.mrp))
    );

    data.append(
      "currency",
      formData.currency.trim().toUpperCase()
    );

    data.append(
      "paymentUrl",
      formData.paymentUrl.trim()
    );

    data.append(
      "redirectUrl",
      formData.redirectUrl.trim()
    );

    data.append(
      "pageKey",
      formData.pageKey.trim().toLowerCase()
    );

    data.append(
      "fileName",
      formData.fileName.trim()
    );

    data.append(
      "tags",
      JSON.stringify(
        convertToArray(formData.tags)
      )
    );

    data.append(
      "topics",
      JSON.stringify(
        convertToArray(formData.topics)
      )
    );

    data.append(
      "category",
      formData.category.trim()
    );

    data.append(
      "highlights",
      JSON.stringify(
        convertToArray(formData.highlights)
      )
    );

    data.append(
      "badge",
      formData.badge.trim()
    );

    data.append(
      "isPublished",
      String(formData.isPublished)
    );

    data.append(
      "isActive",
      String(formData.isActive)
    );

    data.append(
      "isFeatured",
      String(formData.isFeatured)
    );

    data.append("coverPage", coverPage);

    if (pdfFile) {
      data.append("pdf", pdfFile);
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${BASE_URL}/book/admin/create`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success(
          "Product created successfully!"
        );

        resetForm();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      toast.error(
        response.data?.error?.message ||
          response.data?.message ||
          "Failed to create product."
      );
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
                TargetTrek Admin
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Create Digital Product
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Create an ebook, PDF, course,
                bundle, template, or other digital
                product and connect it to its custom
                landing page.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                label="Status"
                value={
                  formData.isPublished
                    ? "Published"
                    : "Draft"
                }
              />

              <StatCard
                label="Type"
                value={
                  resourceTypes.find(
                    (item) =>
                      item.value ===
                      formData.resourceType
                  )?.label || "Product"
                }
              />

              <StatCard
                label="Discount"
                value={`${discount}%`}
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
        >
          <div className="space-y-6">
            <Section>
              <SectionTitle
                number="01"
                title="Product Information"
                description="Core information used to identify and describe this digital product."
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input
                  label="Product Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  error={errors.title}
                  placeholder="Mastering System Design - LLD"
                />

                <div>
                  <FieldLabel
                    label="Slug"
                    required
                  />

                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="mastering-system-design-lld"
                      className={inputClass(
                        errors.slug
                      )}
                    />

                    <button
                      type="button"
                      onClick={generateSlug}
                      className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                    >
                      Generate
                    </button>
                  </div>

                  {errors.slug && (
                    <ErrorText
                      text={errors.slug}
                    />
                  )}
                </div>

                <Input
                  label="Subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="A complete practical guide to low-level design"
                />

                <Select
                  label="Resource Type"
                  name="resourceType"
                  value={formData.resourceType}
                  onChange={handleChange}
                  options={resourceTypes}
                  required
                  error={errors.resourceType}
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what this product contains, what readers will learn, and why it is useful."
                    rows={6}
                  />
                </div>
              </div>
            </Section>

            <Section>
              <SectionTitle
                number="02"
                title="Page Configuration"
                description="Connect this product with its dedicated React landing page."
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel
                    label="Page Key"
                    required
                  />

                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="pageKey"
                      value={formData.pageKey}
                      onChange={handleChange}
                      placeholder="system-design-lld"
                      className={inputClass(
                        errors.pageKey
                      )}
                    />

                    <button
                      type="button"
                      onClick={generatePageKey}
                      className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                    >
                      Generate
                    </button>
                  </div>

                  <HelperText>
                    Stable internal identifier for
                    the custom product page.
                  </HelperText>

                  {errors.pageKey && (
                    <ErrorText
                      text={errors.pageKey}
                    />
                  )}
                </div>

                <Input
                  label="Redirect URL"
                  name="redirectUrl"
                  value={formData.redirectUrl}
                  onChange={handleChange}
                  required
                  error={errors.redirectUrl}
                  placeholder="/system-design/lld"
                  helper="Frontend route only. Example: /google-adk"
                />

                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-blue-700 shadow-sm">
                        i
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Custom landing page
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          The database stores product
                          metadata. Your React route at{" "}
                          <span className="font-semibold text-blue-700">
                            {formData.redirectUrl ||
                              "/your-product-page"}
                          </span>{" "}
                          controls the actual page
                          design and content.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            <Section>
              <SectionTitle
                number="03"
                title="Pricing & Checkout"
                description="Set pricing, currency, and the checkout destination."
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="Selling Price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  error={errors.price}
                  placeholder="149"
                />

                <Input
                  label="MRP"
                  name="mrp"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.mrp}
                  onChange={handleChange}
                  required
                  error={errors.mrp}
                  placeholder="299"
                />

                <Input
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  error={errors.currency}
                  placeholder="INR"
                  maxLength={3}
                />

                <div className="sm:col-span-2 lg:col-span-3">
                  <Input
                    label="Payment URL"
                    name="paymentUrl"
                    type="url"
                    value={formData.paymentUrl}
                    onChange={handleChange}
                    required
                    error={errors.paymentUrl}
                    placeholder="https://..."
                    helper="The PayU or other checkout URL opened when the customer purchases this product."
                  />
                </div>
              </div>

              {discount > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                    {discount}% OFF
                  </span>

                  <span className="text-sm text-emerald-800">
                    Customer saves{" "}
                    <strong>
                      {formData.currency || "INR"}{" "}
                      {(
                        Number(formData.mrp) -
                        Number(formData.price)
                      ).toFixed(2)}
                    </strong>
                  </span>
                </div>
              )}
            </Section>

            <Section>
              <SectionTitle
                number="04"
                title="Discovery & Classification"
                description="Organize the product for your storefront and internal management."
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="System Design"
                />

                <Input
                  label="Badge"
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  placeholder="Bestseller"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="LLD, Java, Design Patterns, Interviews"
                    helper="Separate multiple tags with commas."
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Topics"
                    name="topics"
                    value={formData.topics}
                    onChange={handleChange}
                    placeholder="SOLID Principles, Factory Pattern, Observer Pattern"
                    helper="Separate multiple topics with commas."
                  />
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="Highlights"
                    name="highlights"
                    value={formData.highlights}
                    onChange={handleChange}
                    placeholder="15 real-world design problems, Java examples, Interview preparation"
                    helper="Separate multiple highlights with commas."
                    rows={3}
                  />
                </div>
              </div>
            </Section>

            <Section>
              <SectionTitle
                number="05"
                title="Product Files"
                description="Files are uploaded to Cloudinary. The returned secure URLs are stored automatically."
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <FieldLabel
                    label="Cover Page"
                    required
                  />

                  <label
                    className={`group relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition ${
                      errors.coverPage
                        ? "border-red-300 bg-red-50/40"
                        : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
                    }`}
                  >
                    {coverPreview ? (
                      <>
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="max-h-[245px] max-w-full rounded-xl object-contain shadow-md"
                        />

                        <div className="absolute inset-x-0 bottom-0 bg-white/95 px-4 py-3 text-xs font-semibold text-slate-700 opacity-0 backdrop-blur transition group-hover:opacity-100">
                          Click to replace cover
                        </div>
                      </>
                    ) : (
                      <>
                        <UploadIcon />

                        <p className="mt-4 text-sm font-semibold text-slate-800">
                          Upload cover page
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          JPG, PNG or WEBP
                        </p>

                        <span className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                          Choose image
                        </span>
                      </>
                    )}

                    <input
                      id="coverPage"
                      type="file"
                      name="coverPage"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>

                  {coverPage && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-xs text-slate-500">
                        {coverPage.name}
                      </p>

                      <button
                        type="button"
                        onClick={removeCover}
                        className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {errors.coverPage && (
                    <ErrorText
                      text={errors.coverPage}
                    />
                  )}
                </div>

                <div>
                  <FieldLabel
                    label="Product PDF"
                    required={[
                      "pdf",
                      "ebook",
                    ].includes(
                      formData.resourceType
                    )}
                  />

                  <label
                    className={`flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${
                      errors.pdf
                        ? "border-red-300 bg-red-50/40"
                        : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
                    }`}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-sm font-black text-red-600">
                      PDF
                    </div>

                    <p className="mt-4 max-w-full truncate px-4 text-sm font-semibold text-slate-800">
                      {pdfFile
                        ? pdfFile.name
                        : "Upload product PDF"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      PDF format · Maximum 100 MB
                    </p>

                    {pdfFile && (
                      <span className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {(
                          pdfFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB selected
                      </span>
                    )}

                    {!pdfFile && (
                      <span className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                        Choose PDF
                      </span>
                    )}

                    <input
                      id="pdf"
                      type="file"
                      name="pdf"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfChange}
                      className="hidden"
                    />
                  </label>

                  {pdfFile && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Ready to upload
                      </span>

                      <button
                        type="button"
                        onClick={removePdf}
                        className="text-xs font-semibold text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {errors.pdf && (
                    <ErrorText
                      text={errors.pdf}
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Display File Name"
                    name="fileName"
                    value={formData.fileName}
                    onChange={handleChange}
                    placeholder="mastering-system-design-lld.pdf"
                    helper="Optional. Automatically filled from the selected PDF if left empty."
                  />
                </div>
              </div>
            </Section>
          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Section>
              <SectionTitle
                title="Publishing"
                description="Control product visibility."
              />

              <div className="space-y-3">
                <Toggle
                  label="Active"
                  description="Keep this product active in the system."
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />

                <Toggle
                  label="Published"
                  description="Allow public product APIs to return this product."
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                />

                <Toggle
                  label="Featured"
                  description="Mark this as a featured product."
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
              </div>
            </Section>

            <Section>
              <SectionTitle
                title="Product Preview"
                description="Quick overview before publishing."
              />

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex min-h-[180px] items-center justify-center bg-white p-4">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Product preview"
                      className="max-h-[170px] rounded-lg object-contain shadow-sm"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                        TT
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Cover preview
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {formData.title ||
                          "Product title"}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {formData.category ||
                          "No category"}
                      </p>
                    </div>

                    {formData.badge && (
                      <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                        {formData.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-xl font-bold text-slate-950">
                      {formData.currency || "INR"}{" "}
                      {formData.price || "0"}
                    </span>

                    {formData.mrp &&
                      Number(formData.mrp) >
                        Number(
                          formData.price || 0
                        ) && (
                        <span className="pb-0.5 text-sm text-slate-400 line-through">
                          {formData.currency ||
                            "INR"}{" "}
                          {formData.mrp}
                        </span>
                      )}
                  </div>

                  {formData.redirectUrl && (
                    <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2">
                      <p className="truncate font-mono text-[11px] text-slate-500">
                        {formData.redirectUrl}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Spinner />}

                {loading
                  ? "Creating Product..."
                  : "Create Product"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Review Form
              </button>

              <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                Cover and PDF files are uploaded
                securely when you create the product.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const Section = ({ children }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {children}
    </section>
  );
};

const SectionTitle = ({
  number,
  title,
  description,
}) => {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
      {number && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
          {number}
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  className = "",
}) => {
  return (
    <div
      className={`min-w-[105px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold capitalize text-slate-800">
        {value}
      </p>
    </div>
  );
};

const Required = () => (
  <span className="ml-1 text-red-500">*</span>
);

const FieldLabel = ({
  label,
  required = false,
}) => {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required && <Required />}
    </label>
  );
};

const HelperText = ({ children }) => {
  return (
    <p className="mt-1.5 text-xs leading-5 text-slate-400">
      {children}
    </p>
  );
};

const ErrorText = ({ text }) => {
  return (
    <p className="mt-1.5 text-xs font-semibold text-red-500">
      {text}
    </p>
  );
};

const inputClass = (error) => {
  return `w-full rounded-xl border ${
    error
      ? "border-red-300 bg-red-50/20 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 bg-white focus:border-blue-400 focus:ring-blue-100"
  } px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4`;
};

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  error,
  placeholder,
  helper,
  min,
  step,
  maxLength,
}) => {
  return (
    <div>
      <FieldLabel
        label={label}
        required={required}
      />

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        maxLength={maxLength}
        className={inputClass(error)}
      />

      {helper && !error && (
        <HelperText>{helper}</HelperText>
      )}

      {error && <ErrorText text={error} />}
    </div>
  );
};

const TextArea = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  placeholder,
  helper,
  rows = 5,
}) => {
  return (
    <div>
      <FieldLabel
        label={label}
        required={required}
      />

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass(
          error
        )} resize-y`}
      />

      {helper && !error && (
        <HelperText>{helper}</HelperText>
      )}

      {error && <ErrorText text={error} />}
    </div>
  );
};

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
}) => {
  return (
    <div>
      <FieldLabel
        label={label}
        required={required}
      />

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass(error)}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && <ErrorText text={error} />}
    </div>
  );
};

const Toggle = ({
  label,
  description,
  name,
  checked,
  onChange,
}) => {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
      <span>
        <span className="block text-sm font-bold text-slate-800">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>

      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />

        <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600" />

        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
};

const UploadIcon = () => {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line
          x1="12"
          y1="3"
          x2="12"
          y2="15"
        />
      </svg>
    </div>
  );
};

const Spinner = () => {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
};

export default AddBook;