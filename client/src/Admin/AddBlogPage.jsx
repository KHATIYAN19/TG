import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import { z } from "zod";

import toast, {
  Toaster,
} from "react-hot-toast";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlignLeft,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  Loader2,
  Search,
  Send,
  Sparkles,
  Star,
  Tag,
  Type,
  Upload,
  User,
  X,
} from "lucide-react";

import {
  useSelector,
} from "react-redux";

import BASE_URL from "../utils/Url.js";

import RichTextEditor from "../component/RichTextEditor.jsx";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const BLOG_API =
  `${BASE_URL}/blogs`;

const THEME_KEY =
  "theme";

const THEME_EVENT =
  "targettrek-theme-change";

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/*
|--------------------------------------------------------------------------
| THEME
|--------------------------------------------------------------------------
*/

const readTheme = () => {
  if (
    typeof window ===
    "undefined"
  ) {
    return "light";
  }

  const saved =
    window.localStorage.getItem(
      THEME_KEY
    );

  return saved === "dark"
    ? "dark"
    : "light";
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const stripHtml = (
  html = ""
) => {
  return String(html)
    .replace(
      /<[^>]*>/g,
      " "
    )
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
};

const generateSlug = (
  value = ""
) => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
};

/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

const blogPostSchema =
  z
    .object({
      title:
        z
          .string()
          .trim()
          .min(
            5,
            "Title must be at least 5 characters."
          )
          .max(
            180,
            "Title cannot exceed 180 characters."
          ),

      slug:
        z
          .string()
          .trim()
          .min(
            3,
            "Slug must be at least 3 characters."
          )
          .max(
            180,
            "Slug cannot exceed 180 characters."
          )
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain lowercase letters, numbers and hyphens only."
          ),

      excerpt:
        z
          .string()
          .trim()
          .min(
            10,
            "Excerpt must be at least 10 characters."
          )
          .max(
            500,
            "Excerpt cannot exceed 500 characters."
          ),

      content:
        z
          .string()
          .refine(
            (value) =>
              stripHtml(
                value
              ).length >=
              20,
            "Blog content must contain at least 20 characters."
          ),

      author:
        z
          .string()
          .trim()
          .min(
            2,
            "Author name must be at least 2 characters."
          )
          .max(
            100,
            "Author name cannot exceed 100 characters."
          ),

      category:
        z
          .string()
          .trim()
          .min(
            2,
            "Category is required."
          )
          .max(
            80,
            "Category cannot exceed 80 characters."
          ),

      tags:
        z
          .string()
          .trim()
          .min(
            1,
            "Please enter at least one tag."
          ),

      imageUrl:
        z
          .string()
          .trim()
          .url(
            "Please enter a valid image URL."
          )
          .optional()
          .or(
            z.literal("")
          ),

      altText:
        z
          .string()
          .trim()
          .max(
            200,
            "Alt text cannot exceed 200 characters."
          ),

      metaTitle:
        z
          .string()
          .trim()
          .max(
            70,
            "SEO title cannot exceed 70 characters."
          ),

      metaDescription:
        z
          .string()
          .trim()
          .max(
            180,
            "SEO description cannot exceed 180 characters."
          ),

      seoKeywords:
        z.string(),

      canonicalUrl:
        z
          .string()
          .trim()
          .url(
            "Canonical URL must be a valid URL."
          )
          .optional()
          .or(
            z.literal("")
          ),

      ogImageUrl:
        z
          .string()
          .trim()
          .url(
            "OG image URL must be valid."
          )
          .optional()
          .or(
            z.literal("")
          ),

      isPublished:
        z.boolean(),

      isFeatured:
        z.boolean(),

      editorChoice:
        z.boolean(),

      noIndex:
        z.boolean(),
    });

/*
|--------------------------------------------------------------------------
| FIELD COMPONENT
|--------------------------------------------------------------------------
*/

const Field = ({
  label,
  helper,
  error,
  required = false,
  children,
}) => {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-bold">
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        {helper && (
          <span className="text-[11px] text-slate-500">
            {helper}
          </span>
        )}
      </div>

      {children}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          {Array.isArray(
            error
          )
            ? error[0]
            : error}
        </p>
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| TOGGLE COMPONENT
|--------------------------------------------------------------------------
*/

const Toggle = ({
  checked,
  onChange,
  title,
  description,
  icon: Icon,
  isDark,
  disabled,
  activeText,
  inactiveText,
}) => {
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${
        isDark
          ? "border-slate-800 bg-[#0C131D]"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex min-w-0 gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            checked
              ? isDark
                ? "bg-blue-950/50 text-blue-300"
                : "bg-blue-100 text-blue-700"
              : isDark
              ? "bg-slate-800 text-slate-400"
              : "bg-white text-slate-500"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p
            className={`text-sm font-black ${
              isDark
                ? "text-white"
                : "text-slate-950"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-1 text-xs leading-5 ${
              isDark
                ? "text-slate-500"
                : "text-slate-500"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={
            checked
          }
          disabled={
            disabled
          }
          onClick={() =>
            onChange(
              !checked
            )
          }
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
            checked
              ? "bg-blue-600"
              : isDark
              ? "bg-slate-700"
              : "bg-slate-300"
          } ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : ""
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              checked
                ? "translate-x-6"
                : "translate-x-1"
            }`}
          />
        </button>

        <p
          className={`mt-1 text-center text-[10px] font-bold ${
            checked
              ? "text-blue-500"
              : "text-slate-500"
          }`}
        >
          {checked
            ? activeText
            : inactiveText}
        </p>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| MAIN PAGE
|--------------------------------------------------------------------------
*/

const AddBlogPage = () => {
  const navigate =
    useNavigate();

  const token =
    useSelector(
      (state) =>
        state.auth.token
    );

  const [
    theme,
    setTheme,
  ] = useState(
    readTheme
  );

  const isDark =
    theme === "dark";

  const [
    formData,
    setFormData,
  ] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",

    author: "",
    category: "",
    tags: "",

    imageUrl: "",
    altText: "",

    isPublished: false,
    isFeatured: false,
    editorChoice: false,

    metaTitle: "",
    metaDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    ogImageUrl: "",
    noIndex: false,
  });

  const [
    imageOption,
    setImageOption,
  ] = useState("url");

  const [
    imageFile,
    setImageFile,
  ] = useState(null);

  const [
    formErrors,
    setFormErrors,
  ] = useState({});

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    showSeo,
    setShowSeo,
  ] = useState(true);

  const [
    slugManuallyEdited,
    setSlugManuallyEdited,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | THEME SYNC
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setTheme(
      readTheme()
    );

    const handleThemeChange =
      (event) => {
        const nextTheme =
          event?.detail?.theme;

        if (
          nextTheme ===
            "dark" ||
          nextTheme ===
            "light"
        ) {
          setTheme(
            nextTheme
          );
        }
      };

    const handleStorageChange =
      (event) => {
        if (
          event.key !==
          THEME_KEY
        ) {
          return;
        }

        if (
          event.newValue ===
            "dark" ||
          event.newValue ===
            "light"
        ) {
          setTheme(
            event.newValue
          );
        }
      };

    window.addEventListener(
      THEME_EVENT,
      handleThemeChange
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        THEME_EVENT,
        handleThemeChange
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  useEffect(() => {
    window.scrollTo(
      0,
      0
    );
  }, []);

  /*
  |--------------------------------------------------------------------------
  | IMAGE PREVIEW
  |--------------------------------------------------------------------------
  */

  const filePreview =
    useMemo(() => {
      if (!imageFile) {
        return "";
      }

      return URL.createObjectURL(
        imageFile
      );
    }, [imageFile]);

  useEffect(() => {
    return () => {
      if (
        filePreview
      ) {
        URL.revokeObjectURL(
          filePreview
        );
      }
    };
  }, [filePreview]);

  const imagePreview =
    imageOption ===
    "file"
      ? filePreview
      : formData.imageUrl;

  /*
  |--------------------------------------------------------------------------
  | STYLE HELPERS
  |--------------------------------------------------------------------------
  */

  const pageBg =
    isDark
      ? "bg-[#080D14]"
      : "bg-slate-50";

  const card =
    isDark
      ? "border-slate-800 bg-[#101924]"
      : "border-slate-200 bg-white";

  const softCard =
    isDark
      ? "border-slate-800 bg-[#0C131D]"
      : "border-slate-200 bg-slate-50";

  const primaryText =
    isDark
      ? "text-white"
      : "text-slate-950";

  const secondaryText =
    isDark
      ? "text-slate-400"
      : "text-slate-600";

  const inputClass = (
    hasError = false
  ) =>
    `h-12 w-full rounded-xl border px-4 text-sm outline-none transition ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
        : isDark
        ? "border-slate-700 bg-[#0C131D] text-white placeholder:text-slate-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-900/30"
        : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    }`;

  /*
  |--------------------------------------------------------------------------
  | CHANGE HANDLER
  |--------------------------------------------------------------------------
  */

  const updateField = (
    name,
    value
  ) => {
    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    if (
      formErrors[name]
    ) {
      setFormErrors(
        (previous) => ({
          ...previous,
          [name]: undefined,
        })
      );
    }
  };

  const handleInputChange =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      const nextValue =
        type ===
        "checkbox"
          ? checked
          : value;

      setFormData(
        (previous) => {
          const updated = {
            ...previous,
            [name]:
              nextValue,
          };

          if (
            name ===
              "title" &&
            !slugManuallyEdited
          ) {
            updated.slug =
              generateSlug(
                value
              );
          }

          return updated;
        }
      );

      if (
        name === "slug"
      ) {
        setSlugManuallyEdited(
          true
        );
      }

      if (
        formErrors[name]
      ) {
        setFormErrors(
          (previous) => ({
            ...previous,
            [name]: undefined,
          })
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | IMAGE
  |--------------------------------------------------------------------------
  */

  const changeImageOption =
    (option) => {
      setImageOption(
        option
      );

      setImageFile(null);

      setFormData(
        (previous) => ({
          ...previous,
          imageUrl: "",
        })
      );

      setFormErrors(
        (previous) => ({
          ...previous,
          imageUrl: undefined,
          imageFile: undefined,
        })
      );
    };

  const handleImageFileChange =
    (event) => {
      const file =
        event.target
          .files?.[0] ||
        null;

      if (!file) {
        setImageFile(
          null
        );

        return;
      }

      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type
        )
      ) {
        toast.error(
          "Please upload JPG, PNG, WEBP or GIF."
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        MAX_IMAGE_SIZE
      ) {
        toast.error(
          "Image must be smaller than 5 MB."
        );

        event.target.value =
          "";

        return;
      }

      setImageFile(
        file
      );

      setFormErrors(
        (previous) => ({
          ...previous,
          imageFile: undefined,
          imageUrl: undefined,
        })
      );
    };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        isSubmitting
      ) {
        return;
      }

      setFormErrors({});

      /*
       * Backend requires cover
       * image.
       */

      if (
        imageOption ===
          "url" &&
        !formData.imageUrl.trim()
      ) {
        setFormErrors({
          imageUrl: [
            "Cover image URL is required.",
          ],
        });

        toast.error(
          "Please add a cover image."
        );

        return;
      }

      if (
        imageOption ===
          "file" &&
        !imageFile
      ) {
        setFormErrors({
          imageFile: [
            "Please choose a cover image.",
          ],
        });

        toast.error(
          "Please choose a cover image."
        );

        return;
      }

      const validation =
        blogPostSchema.safeParse(
          formData
        );

      if (
        !validation.success
      ) {
        const errors =
          validation.error.flatten()
            .fieldErrors;

        setFormErrors(
          errors
        );

        toast.error(
          "Please fix the highlighted fields."
        );

        return;
      }

      const tags =
        formData.tags
          .split(",")
          .map((tag) =>
            tag.trim()
          )
          .filter(Boolean);

      if (
        tags.length > 15
      ) {
        setFormErrors({
          tags: [
            "Maximum 15 tags are allowed.",
          ],
        });

        toast.error(
          "Maximum 15 tags are allowed."
        );

        return;
      }

      if (!token) {
        toast.error(
          "Authentication token is missing. Please login again."
        );

        return;
      }

      setIsSubmitting(
        true
      );

      const toastId =
        toast.loading(
          formData.isPublished
            ? "Publishing blog..."
            : "Saving blog..."
        );

      try {
        const postData =
          new FormData();

        postData.append(
          "title",
          validation.data.title
        );

        postData.append(
          "slug",
          validation.data.slug
        );

        postData.append(
          "excerpt",
          validation.data.excerpt
        );

        postData.append(
          "content",
          validation.data.content
        );

        postData.append(
          "author",
          validation.data.author
        );

        postData.append(
          "category",
          validation.data.category
        );

        postData.append(
          "tags",
          tags.join(",")
        );

        postData.append(
          "altText",
          validation.data.altText ||
            ""
        );

        postData.append(
          "isPublished",
          String(
            validation.data
              .isPublished
          )
        );

        postData.append(
          "isFeatured",
          String(
            validation.data
              .isFeatured
          )
        );

        postData.append(
          "editorChoice",
          String(
            validation.data
              .editorChoice
          )
        );

        /*
        |--------------------------------------------------------------------------
        | SEO
        |--------------------------------------------------------------------------
        */

        postData.append(
          "seo",
          JSON.stringify({
            metaTitle:
              validation.data
                .metaTitle,

            metaDescription:
              validation.data
                .metaDescription,

            keywords:
              validation.data
                .seoKeywords
                .split(",")
                .map(
                  (keyword) =>
                    keyword.trim()
                )
                .filter(
                  Boolean
                ),

            canonicalUrl:
              validation.data
                .canonicalUrl,

            ogImageUrl:
              validation.data
                .ogImageUrl,

            noIndex:
              validation.data
                .noIndex,
          })
        );

        /*
        |--------------------------------------------------------------------------
        | COVER IMAGE
        |--------------------------------------------------------------------------
        */

        if (
          imageOption ===
            "file" &&
          imageFile
        ) {
          postData.append(
            "imageFile",
            imageFile
          );
        }

        if (
          imageOption ===
            "url" &&
          validation.data
            .imageUrl
        ) {
          postData.append(
            "imageUrl",
            validation.data
              .imageUrl
          );
        }

        /*
        |--------------------------------------------------------------------------
        | API
        |--------------------------------------------------------------------------
        */

        const response =
          await axios.post(
            `${BLOG_API}/admin`,
            postData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          response.data
            ?.success
        ) {
          toast.success(
            response.data
              ?.message ||
              "Blog created successfully.",
            {
              id:
                toastId,
            }
          );

          navigate(
            "/blog-manage"
          );

          return;
        }

        throw new Error(
          "Unable to create blog."
        );
      } catch (error) {
        console.error(
          "Create blog error:",
          error
        );

        const message =
          error.response?.data
            ?.error
            ?.message ||
          error.response?.data
            ?.message ||
          error.message ||
          "Failed to create blog post.";

        toast.error(
          message,
          {
            id:
              toastId,
          }
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | COUNTERS
  |--------------------------------------------------------------------------
  */

  const contentWords =
    useMemo(() => {
      const plain =
        stripHtml(
          formData.content
        );

      if (!plain) {
        return 0;
      }

      return plain
        .split(/\s+/)
        .filter(Boolean)
        .length;
    }, [
      formData.content,
    ]);

  const readingTime =
    Math.max(
      1,
      Math.ceil(
        contentWords / 220
      )
    );

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden pt-16 transition-colors duration-300 ${pageBg}`}
    >
      <Toaster
        position="top-center"
        reverseOrder={
          false
        }
      />

      <div
        className={`border-b ${
          isDark
            ? "border-slate-800 bg-[#0B111A]"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/blog-manage"
              )
            }
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700 hover:text-blue-400"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">
              Manage Blogs
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </button>

          <div className="text-right">
            <p
              className={`text-xs font-bold ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              {contentWords} words
              {" · "}
              {readingTime} min read
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-blue-500">
            <BookOpen className="h-4 w-4" />

            Blog Management
          </div>

          <h1
            className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${primaryText}`}
          >
            Create a new blog post
          </h1>

          <p
            className={`mt-3 max-w-3xl text-sm leading-7 sm:text-base ${secondaryText}`}
          >
            Create rich articles
            with headings, text
            formatting, colors,
            links, images, lists,
            code blocks and complete
            SEO metadata.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* ======================================================== */}
            {/* MAIN COLUMN                                             */}
            {/* ======================================================== */}

            <div className="min-w-0 space-y-6">
              {/* BASIC INFO */}

              <section
                className={`rounded-3xl border p-5 sm:p-6 ${card}`}
              >
                <div className="mb-6 flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isDark
                        ? "bg-blue-950/40 text-blue-300"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Type className="h-5 w-5" />
                  </div>

                  <div>
                    <h2
                      className={`text-lg font-black ${primaryText}`}
                    >
                      Basic information
                    </h2>

                    <p
                      className={`mt-1 text-xs leading-5 ${secondaryText}`}
                    >
                      Main information
                      shown in blog cards
                      and the article page.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <Field
                    label="Blog title"
                    required
                    error={
                      formErrors.title
                    }
                    helper={`${formData.title.length}/180`}
                  >
                    <div className="relative">
                      <Type className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="title"
                        value={
                          formData.title
                        }
                        onChange={
                          handleInputChange
                        }
                        disabled={
                          isSubmitting
                        }
                        placeholder="e.g. API Gateway in System Design"
                        maxLength={
                          180
                        }
                        className={`${inputClass(
                          Boolean(
                            formErrors.title
                          )
                        )} pl-11`}
                      />
                    </div>
                  </Field>

                  <Field
                    label="Slug"
                    required
                    error={
                      formErrors.slug
                    }
                    helper="URL identifier"
                  >
                    <div className="relative">
                      <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="slug"
                        value={
                          formData.slug
                        }
                        onChange={
                          handleInputChange
                        }
                        disabled={
                          isSubmitting
                        }
                        placeholder="api-gateway-system-design"
                        className={`${inputClass(
                          Boolean(
                            formErrors.slug
                          )
                        )} pl-11`}
                      />
                    </div>

                    <div
                      className={`mt-2 break-all rounded-lg px-3 py-2 text-xs ${
                        isDark
                          ? "bg-slate-950 text-slate-500"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      targettrek.in/blog/
                      {formData.slug ||
                        "your-blog-slug"}
                    </div>
                  </Field>

                  <Field
                    label="Excerpt"
                    required
                    error={
                      formErrors.excerpt
                    }
                    helper={`${formData.excerpt.length}/500`}
                  >
                    <textarea
                      name="excerpt"
                      value={
                        formData.excerpt
                      }
                      onChange={
                        handleInputChange
                      }
                      disabled={
                        isSubmitting
                      }
                      maxLength={
                        500
                      }
                      rows={4}
                      placeholder="Write a short summary for blog cards, search results and social previews..."
                      className={`w-full resize-y rounded-xl border p-4 text-sm leading-7 outline-none transition ${
                        formErrors.excerpt
                          ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
                          : isDark
                          ? "border-slate-700 bg-[#0C131D] text-white placeholder:text-slate-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-900/30"
                          : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }`}
                    />
                  </Field>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Author"
                      required
                      error={
                        formErrors.author
                      }
                    >
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                        <input
                          type="text"
                          name="author"
                          value={
                            formData.author
                          }
                          onChange={
                            handleInputChange
                          }
                          disabled={
                            isSubmitting
                          }
                          placeholder="Author name"
                          className={`${inputClass(
                            Boolean(
                              formErrors.author
                            )
                          )} pl-11`}
                        />
                      </div>
                    </Field>

                    <Field
                      label="Category"
                      required
                      error={
                        formErrors.category
                      }
                    >
                      <div className="relative">
                        <FileText className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                        <input
                          type="text"
                          name="category"
                          value={
                            formData.category
                          }
                          onChange={
                            handleInputChange
                          }
                          disabled={
                            isSubmitting
                          }
                          placeholder="System Design"
                          className={`${inputClass(
                            Boolean(
                              formErrors.category
                            )
                          )} pl-11`}
                        />
                      </div>
                    </Field>
                  </div>

                  <Field
                    label="Tags"
                    required
                    error={
                      formErrors.tags
                    }
                    helper="Maximum 15"
                  >
                    <div className="relative">
                      <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="tags"
                        value={
                          formData.tags
                        }
                        onChange={
                          handleInputChange
                        }
                        disabled={
                          isSubmitting
                        }
                        placeholder="system design, api gateway, backend, microservices"
                        className={`${inputClass(
                          Boolean(
                            formErrors.tags
                          )
                        )} pl-11`}
                      />
                    </div>

                    <p
                      className={`mt-2 text-xs ${secondaryText}`}
                    >
                      Separate tags
                      with commas.
                    </p>
                  </Field>
                </div>
              </section>

              {/* CONTENT */}

              <section
                className={`rounded-3xl border p-4 sm:p-6 ${card}`}
              >
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-indigo-950/40 text-indigo-300"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      <AlignLeft className="h-5 w-5" />
                    </div>

                    <div>
                      <h2
                        className={`text-lg font-black ${primaryText}`}
                      >
                        Blog content
                      </h2>

                      <p
                        className={`mt-1 max-w-xl text-xs leading-5 ${secondaryText}`}
                      >
                        Use headings,
                        bold, italic,
                        underline,
                        colors,
                        background
                        colors, alignment,
                        lists, links,
                        images and code.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border px-3 py-2 text-xs font-bold ${softCard}`}
                  >
                    {contentWords} words
                    {" · "}
                    {readingTime} min
                  </div>
                </div>

                <RichTextEditor
                  value={
                    formData.content
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "content",
                      value
                    )
                  }
                  isDark={
                    isDark
                  }
                  disabled={
                    isSubmitting
                  }
                  placeholder="Start writing your article..."
                  minHeight={
                    500
                  }
                />

                {formErrors.content && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    {
                      formErrors
                        .content[0]
                    }
                  </p>
                )}
              </section>

              {/* IMAGE */}

              <section
                className={`rounded-3xl border p-5 sm:p-6 ${card}`}
              >
                <div className="mb-6 flex gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isDark
                        ? "bg-emerald-950/40 text-emerald-300"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <h2
                      className={`text-lg font-black ${primaryText}`}
                    >
                      Cover image
                    </h2>

                    <p
                      className={`mt-1 text-xs leading-5 ${secondaryText}`}
                    >
                      Upload an image
                      to Cloudinary or
                      provide an
                      external image
                      URL.
                    </p>
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-500/5 p-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      changeImageOption(
                        "url"
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                    className={`min-h-[44px] rounded-xl px-3 text-sm font-bold transition ${
                      imageOption ===
                      "url"
                        ? "bg-blue-600 text-white shadow"
                        : isDark
                        ? "text-slate-400 hover:bg-slate-800"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    Image URL
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeImageOption(
                        "file"
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                    className={`min-h-[44px] rounded-xl px-3 text-sm font-bold transition ${
                      imageOption ===
                      "file"
                        ? "bg-blue-600 text-white shadow"
                        : isDark
                        ? "text-slate-400 hover:bg-slate-800"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {imageOption ===
                  "url" && (
                  <Field
                    label="Image URL"
                    required
                    error={
                      formErrors.imageUrl
                    }
                  >
                    <div className="relative">
                      <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="url"
                        name="imageUrl"
                        value={
                          formData.imageUrl
                        }
                        onChange={
                          handleInputChange
                        }
                        disabled={
                          isSubmitting
                        }
                        placeholder="https://..."
                        className={`${inputClass(
                          Boolean(
                            formErrors.imageUrl
                          )
                        )} pl-11`}
                      />
                    </div>
                  </Field>
                )}

                {imageOption ===
                  "file" && (
                  <Field
                    label="Upload image"
                    required
                    error={
                      formErrors.imageFile
                    }
                    helper="Max 5 MB"
                  >
                    <label
                      className={`flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
                        isDark
                          ? "border-slate-700 bg-[#0C131D] hover:border-blue-600"
                          : "border-slate-300 bg-slate-50 hover:border-blue-400"
                      }`}
                    >
                      <Upload className="h-7 w-7 text-blue-500" />

                      <p
                        className={`mt-3 text-sm font-bold ${primaryText}`}
                      >
                        {imageFile
                          ? imageFile.name
                          : "Choose cover image"}
                      </p>

                      <p
                        className={`mt-1 text-xs ${secondaryText}`}
                      >
                        PNG, JPG, WEBP or
                        GIF
                      </p>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={
                          handleImageFileChange
                        }
                        disabled={
                          isSubmitting
                        }
                        className="hidden"
                      />
                    </label>
                  </Field>
                )}

                {imagePreview && (
                  <div
                    className={`mt-5 overflow-hidden rounded-2xl border ${softCard}`}
                  >
                    <div className="aspect-[16/8] w-full overflow-hidden">
                      <img
                        src={
                          imagePreview
                        }
                        alt="Blog cover preview"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-3">
                      <p
                        className={`text-xs font-bold ${secondaryText}`}
                      >
                        Cover preview
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <Field
                    label="Image alt text"
                    error={
                      formErrors.altText
                    }
                    helper={`${formData.altText.length}/200`}
                  >
                    <input
                      type="text"
                      name="altText"
                      value={
                        formData.altText
                      }
                      onChange={
                        handleInputChange
                      }
                      disabled={
                        isSubmitting
                      }
                      maxLength={
                        200
                      }
                      placeholder="Describe the cover image for accessibility"
                      className={inputClass(
                        Boolean(
                          formErrors.altText
                        )
                      )}
                    />
                  </Field>
                </div>
              </section>

              {/* SEO */}

              <section
                className={`rounded-3xl border ${card}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowSeo(
                      (current) =>
                        !current
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-purple-950/40 text-purple-300"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      <Search className="h-5 w-5" />
                    </div>

                    <div>
                      <h2
                        className={`text-lg font-black ${primaryText}`}
                      >
                        SEO settings
                      </h2>

                      <p
                        className={`mt-1 text-xs ${secondaryText}`}
                      >
                        Search engine and
                        social sharing
                        metadata.
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold ${secondaryText}`}
                  >
                    {showSeo
                      ? "Hide"
                      : "Show"}
                  </span>
                </button>

                {showSeo && (
                  <div
                    className={`border-t p-5 sm:p-6 ${
                      isDark
                        ? "border-slate-800"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="space-y-5">
                      <Field
                        label="SEO title"
                        helper={`${formData.metaTitle.length}/70`}
                        error={
                          formErrors.metaTitle
                        }
                      >
                        <input
                          type="text"
                          name="metaTitle"
                          value={
                            formData.metaTitle
                          }
                          onChange={
                            handleInputChange
                          }
                          disabled={
                            isSubmitting
                          }
                          maxLength={
                            70
                          }
                          placeholder="Leave empty to use blog title"
                          className={inputClass(
                            Boolean(
                              formErrors.metaTitle
                            )
                          )}
                        />
                      </Field>

                      <Field
                        label="SEO description"
                        helper={`${formData.metaDescription.length}/180`}
                        error={
                          formErrors.metaDescription
                        }
                      >
                        <textarea
                          name="metaDescription"
                          value={
                            formData.metaDescription
                          }
                          onChange={
                            handleInputChange
                          }
                          disabled={
                            isSubmitting
                          }
                          maxLength={
                            180
                          }
                          rows={3}
                          placeholder="Leave empty to use excerpt"
                          className={`w-full resize-y rounded-xl border p-4 text-sm outline-none transition ${
                            formErrors.metaDescription
                              ? "border-red-500"
                              : isDark
                              ? "border-slate-700 bg-[#0C131D] text-white placeholder:text-slate-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-900/30"
                              : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          }`}
                        />
                      </Field>

                      <Field
                        label="SEO keywords"
                        helper="Comma separated"
                      >
                        <input
                          type="text"
                          name="seoKeywords"
                          value={
                            formData.seoKeywords
                          }
                          onChange={
                            handleInputChange
                          }
                          disabled={
                            isSubmitting
                          }
                          placeholder="system design, api gateway, backend"
                          className={inputClass()}
                        />
                      </Field>

                      <Field
                        label="Canonical URL"
                        error={
                          formErrors.canonicalUrl
                        }
                      >
                        <div className="relative">
                          <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                          <input
                            type="url"
                            name="canonicalUrl"
                            value={
                              formData.canonicalUrl
                            }
                            onChange={
                              handleInputChange
                            }
                            disabled={
                              isSubmitting
                            }
                            placeholder="https://www.targettrek.in/blog/..."
                            className={`${inputClass(
                              Boolean(
                                formErrors.canonicalUrl
                              )
                            )} pl-11`}
                          />
                        </div>
                      </Field>

                      <Field
                        label="OG image URL"
                        error={
                          formErrors.ogImageUrl
                        }
                        helper="Optional"
                      >
                        <input
                          type="url"
                          name="ogImageUrl"
                          value={
                            formData.ogImageUrl
                          }
                          onChange={
                            handleInputChange
                          }
                          disabled={
                            isSubmitting
                          }
                          placeholder="Leave empty to use cover image"
                          className={inputClass(
                            Boolean(
                              formErrors.ogImageUrl
                            )
                          )}
                        />
                      </Field>

                      <Toggle
                        checked={
                          formData.noIndex
                        }
                        onChange={(
                          value
                        ) =>
                          updateField(
                            "noIndex",
                            value
                          )
                        }
                        title="No Index"
                        description="Prevent search engines from indexing this article."
                        icon={
                          EyeOff
                        }
                        isDark={
                          isDark
                        }
                        disabled={
                          isSubmitting
                        }
                        activeText="No Index"
                        inactiveText="Index"
                      />
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* ======================================================== */}
            {/* RIGHT SIDEBAR                                           */}
            {/* ======================================================== */}

            <aside className="space-y-5 xl:sticky xl:top-24">
              <section
                className={`rounded-3xl border p-5 ${card}`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-500" />

                  <h2
                    className={`font-black ${primaryText}`}
                  >
                    Publishing
                  </h2>
                </div>

                <div className="mt-5 space-y-3">
                  <Toggle
                    checked={
                      formData.isPublished
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "isPublished",
                        value
                      )
                    }
                    title="Publish Status"
                    description="Published blogs are available on public blog routes."
                    icon={
                      formData.isPublished
                        ? Eye
                        : EyeOff
                    }
                    isDark={
                      isDark
                    }
                    disabled={
                      isSubmitting
                    }
                    activeText="Published"
                    inactiveText="Draft"
                  />

                  <Toggle
                    checked={
                      formData.isFeatured
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "isFeatured",
                        value
                      )
                    }
                    title="Featured"
                    description="Highlight this article in featured sections."
                    icon={
                      Star
                    }
                    isDark={
                      isDark
                    }
                    disabled={
                      isSubmitting
                    }
                    activeText="Featured"
                    inactiveText="Normal"
                  />

                  <Toggle
                    checked={
                      formData.editorChoice
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "editorChoice",
                        value
                      )
                    }
                    title="Editor's Choice"
                    description="Mark this as a manually selected article."
                    icon={
                      CheckCircle2
                    }
                    isDark={
                      isDark
                    }
                    disabled={
                      isSubmitting
                    }
                    activeText="Selected"
                    inactiveText="Normal"
                  />
                </div>
              </section>

              <section
                className={`rounded-3xl border p-5 ${card}`}
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />

                  <p
                    className={`text-sm font-black ${primaryText}`}
                  >
                    Article summary
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    [
                      "Words",
                      contentWords,
                    ],
                    [
                      "Reading",
                      `${readingTime}m`,
                    ],
                    [
                      "Tags",
                      formData.tags
                        .split(
                          ","
                        )
                        .filter(
                          (tag) =>
                            tag.trim()
                        ).length,
                    ],
                    [
                      "Status",
                      formData.isPublished
                        ? "Live"
                        : "Draft",
                    ],
                  ].map(
                    ([
                      label,
                      value,
                    ]) => (
                      <div
                        key={
                          label
                        }
                        className={`rounded-xl border p-3 ${softCard}`}
                      >
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}
                        >
                          {label}
                        </p>

                        <p
                          className={`mt-1 text-lg font-black ${primaryText}`}
                        >
                          {value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />

                    Creating Blog...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />

                    {formData.isPublished
                      ? "Publish Blog"
                      : "Save Draft"}
                  </>
                )}
              </button>

              <p
                className={`px-2 text-center text-[11px] leading-5 ${secondaryText}`}
              >
                The backend sanitizes
                rich HTML before
                storing the article.
              </p>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddBlogPage;