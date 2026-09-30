import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";
import axios from "axios";
import { Helmet } from "react-helmet-async";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Hash,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Star,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";

import toast, {
  Toaster,
} from "react-hot-toast";

import BASE_URL from "../utils/Url.js";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const SITE_URL =
  "https://www.targettrek.in";

const BLOG_LIST_URL =
  `${SITE_URL}/blogs`;

const THEME_KEY =
  "theme";

const THEME_EVENT =
  "targettrek-theme-change";

const BLOG_VISITOR_KEY =
  "targettrek_blog_visitor_id";

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
| VISITOR ID
|--------------------------------------------------------------------------
|
| Backend requires:
|
| x-blog-visitor-id
|
| Same browser keeps the same ID.
|
| Backend hashes this ID before storing anything
| in Redis.
|
*/

const getBlogVisitorId = () => {
  if (
    typeof window ===
    "undefined"
  ) {
    return "";
  }

  let visitorId =
    window.localStorage.getItem(
      BLOG_VISITOR_KEY
    );

  if (visitorId) {
    return visitorId;
  }

  if (
    typeof window.crypto !==
      "undefined" &&
    typeof window.crypto
      .randomUUID === "function"
  ) {
    visitorId =
      window.crypto.randomUUID();
  } else {
    visitorId = `${
      Date.now()
    }-${Math.random()
      .toString(36)
      .slice(2)}-${Math.random()
      .toString(36)
      .slice(2)}`;
  }

  window.localStorage.setItem(
    BLOG_VISITOR_KEY,
    visitorId
  );

  return visitorId;
};

/*
|--------------------------------------------------------------------------
| SAFE STRING
|--------------------------------------------------------------------------
*/

const safeString = (
  value,
  fallback = ""
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return String(value);
  }

  return fallback;
};

/*
|--------------------------------------------------------------------------
| HTML HELPERS
|--------------------------------------------------------------------------
*/

const stripHtml = (
  html = ""
) => {
  if (!html) {
    return "";
  }

  try {
    const doc =
      new DOMParser().parseFromString(
        String(html),
        "text/html"
      );

    return (
      doc.body.textContent ||
      ""
    );
  } catch {
    return String(html).replace(
      /<[^>]*>/g,
      " "
    );
  }
};

const normalizeText = (
  value = ""
) => {
  return stripHtml(value)
    .replace(/\s+/g, " ")
    .trim();
};

const truncateText = (
  value,
  maxLength = 160
) => {
  const text =
    normalizeText(value);

  if (
    text.length <=
    maxLength
  ) {
    return text;
  }

  return `${text
    .slice(0, maxLength)
    .trim()}...`;
};

/*
|--------------------------------------------------------------------------
| BLOG FIELD HELPERS
|--------------------------------------------------------------------------
*/

const getPostContent = (
  post
) => {
  return (
    post?.content ||
    post?.body ||
    post?.articleContent ||
    post?.excerpt ||
    ""
  );
};

const getPostExcerpt = (
  post
) => {
  return (
    post?.excerpt ||
    post?.shortDescription ||
    post?.description ||
    truncateText(
      getPostContent(post),
      180
    )
  );
};

const getPostImage = (
  post
) => {
  return (
    post?.imageUrl ||
    post?.featuredImage ||
    post?.coverImage ||
    ""
  );
};

const getAuthorName = (
  post
) => {
  if (
    typeof post?.author ===
    "string"
  ) {
    return post.author;
  }

  return (
    post?.author?.name ||
    post?.author?.fullName ||
    "Target Trek"
  );
};

const getCategoryName = (
  post
) => {
  if (
    typeof post?.category ===
    "string"
  ) {
    return (
      post.category.trim() ||
      "Engineering"
    );
  }

  return (
    post?.category?.name ||
    post?.category?.title ||
    "Engineering"
  );
};

const getTags = (
  post
) => {
  if (
    !Array.isArray(
      post?.tags
    )
  ) {
    return [];
  }

  return post.tags
    .map((tag) => {
      if (
        typeof tag ===
        "string"
      ) {
        return tag.trim();
      }

      return (
        tag?.name ||
        tag?.title ||
        ""
      );
    })
    .filter(Boolean);
};

const getViews = (
  post
) => {
  const value =
    post?.views ??
    post?.viewCount ??
    post?.stats?.views ??
    0;

  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
};

const getPublishedDate = (
  post
) => {
  return (
    post?.publishedAt ||
    post?.createdAt ||
    null
  );
};

const isFeaturedPost = (
  post
) => {
  return Boolean(
    post?.isFeatured ??
      post?.featured
  );
};

const isEditorChoicePost = (
  post
) => {
  return Boolean(
    post?.editorChoice ??
      post?.isEditorChoice
  );
};

const isPublishedPost = (
  post
) => {
  if (
    typeof post?.isPublished ===
    "boolean"
  ) {
    return post.isPublished;
  }

  if (
    typeof post?.published ===
    "boolean"
  ) {
    return post.published;
  }

  if (
    typeof post?.status ===
    "string"
  ) {
    return (
      post.status.toLowerCase() ===
      "published"
    );
  }

  return true;
};

/*
|--------------------------------------------------------------------------
| SEO HELPERS
|--------------------------------------------------------------------------
*/

const getSeo = (
  post
) => {
  return post?.seo &&
    typeof post.seo ===
      "object"
    ? post.seo
    : {};
};

/*
|--------------------------------------------------------------------------
| FORMATTING
|--------------------------------------------------------------------------
*/

const formatDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
};

const formatDateTime = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  ).format(date);
};

const formatViews = (
  value
) => {
  const views =
    Number(value) || 0;

  if (
    views >= 1000000
  ) {
    return `${(
      views / 1000000
    ).toFixed(
      views >= 10000000
        ? 0
        : 1
    )}M`;
  }

  if (
    views >= 1000
  ) {
    return `${(
      views / 1000
    ).toFixed(
      views >= 10000
        ? 0
        : 1
    )}K`;
  }

  return views.toLocaleString(
    "en-IN"
  );
};

const getWordCount = (
  post
) => {
  const content =
    normalizeText(
      getPostContent(post)
    );

  if (!content) {
    return 0;
  }

  return content
    .split(/\s+/)
    .filter(Boolean)
    .length;
};

const getReadingTime = (
  post
) => {
  /*
   * Prefer backend-calculated
   * readingTimeMinutes.
   */

  const backendReadingTime =
    Number(
      post?.readingTimeMinutes
    );

  if (
    Number.isFinite(
      backendReadingTime
    ) &&
    backendReadingTime > 0
  ) {
    return Math.ceil(
      backendReadingTime
    );
  }

  const words =
    getWordCount(post);

  return Math.max(
    1,
    Math.ceil(
      words / 220
    )
  );
};

/*
|--------------------------------------------------------------------------
| DELETE MODAL
|--------------------------------------------------------------------------
*/

const DeleteModal = ({
  open,
  onClose,
  onConfirm,
  deleting,
  title,
  isDark,
}) => {
  if (!open) {
    return null;
  }

  const primaryText =
    isDark
      ? "text-[#F4F7FA]"
      : "text-[#0B1524]";

  const secondaryText =
    isDark
      ? "text-[#9AA9BA]"
      : "text-[#5B6B82]";

  const borderColor =
    isDark
      ? "border-[#1E2C3D]"
      : "border-[#E1E9F1]";

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/65
        p-4
        backdrop-blur-sm
      "
      onClick={
        deleting
          ? undefined
          : onClose
      }
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className={`
          w-full
          max-w-md
          overflow-hidden
          rounded-3xl
          border
          shadow-2xl
          ${borderColor}
          ${
            isDark
              ? "bg-[#0C131D]"
              : "bg-white"
          }
        `}
      >
        <div
          className={`
            flex
            items-center
            justify-between
            border-b
            p-5
            ${borderColor}
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                ${
                  isDark
                    ? "bg-red-950/30 text-red-300"
                    : "bg-red-50 text-red-600"
                }
              `}
            >
              <AlertTriangle
                size={19}
              />
            </div>

            <div>
              <h2
                className={`
                  font-bold
                  ${primaryText}
                `}
              >
                Delete article?
              </h2>

              <p
                className={`
                  mt-0.5
                  text-xs
                  ${secondaryText}
                `}
              >
                This cannot be
                undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              transition
              ${secondaryText}
              ${
                isDark
                  ? "hover:bg-[#172333]"
                  : "hover:bg-slate-100"
              }
            `}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <p
            className={`
              text-sm
              leading-6
              ${secondaryText}
            `}
          >
            Permanently delete{" "}
            <strong
              className={
                primaryText
              }
            >
              &quot;
              {title}
              &quot;
            </strong>
            ?
          </p>
        </div>

        <div
          className={`
            flex
            flex-col-reverse
            gap-3
            border-t
            p-4
            sm:flex-row
            sm:justify-end
            ${borderColor}
          `}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className={`
              rounded-xl
              border
              px-4
              py-2.5
              text-sm
              font-semibold
              transition
              ${borderColor}
              ${
                isDark
                  ? "bg-[#101924] text-white hover:bg-[#172333]"
                  : "bg-white text-slate-800 hover:bg-slate-50"
              }
            `}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-700
              disabled:opacity-60
            "
          >
            {deleting ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={16}
              />
            )}

            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

const BlogPostDetail = () => {
  const { slug } =
    useParams();

  const navigate =
    useNavigate();

  /*
  |--------------------------------------------------------------------------
  | REDUX AUTH
  |--------------------------------------------------------------------------
  */

  const {
    user,
    token,
    isAuthenticated,
  } = useSelector(
    (state) =>
      state?.auth || {}
  );

  const isAdmin =
    Boolean(
      isAuthenticated &&
        user?.role === "admin"
    );

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [
    post,
    setPost,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    deleteModal,
    setDeleteModal,
  ] = useState(false);

  const [
    copied,
    setCopied,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | THEME
  |--------------------------------------------------------------------------
  */

  const [
    theme,
    setTheme,
  ] = useState(
    readTheme
  );

  const isDark =
    theme === "dark";

  useEffect(() => {
    setTheme(
      readTheme()
    );

    /*
    |--------------------------------------------------------------------------
    | SAME TAB
    |--------------------------------------------------------------------------
    */

    const handleThemeChange =
      (event) => {
        const newTheme =
          event?.detail
            ?.theme;

        if (
          newTheme ===
            "dark" ||
          newTheme ===
            "light"
        ) {
          setTheme(
            newTheme
          );

          return;
        }

        setTheme(
          readTheme()
        );
      };

    /*
    |--------------------------------------------------------------------------
    | DIFFERENT TAB
    |--------------------------------------------------------------------------
    */

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

  /*
  |--------------------------------------------------------------------------
  | THEME CLASSES
  |--------------------------------------------------------------------------
  */

  const pageBg =
    isDark
      ? "bg-[#080D14]"
      : "bg-[#F5F9FC]";

  const primaryBg =
    isDark
      ? "bg-[#0C131D]"
      : "bg-white";

  const cardBg =
    isDark
      ? "bg-[#101924]"
      : "bg-[#F5F9FC]";

  const borderColor =
    isDark
      ? "border-[#1E2C3D]"
      : "border-[#E1E9F1]";

  const primaryText =
    isDark
      ? "text-[#F4F7FA]"
      : "text-[#0B1524]";

  const secondaryText =
    isDark
      ? "text-[#9AA9BA]"
      : "text-[#5B6B82]";

  const mutedText =
    isDark
      ? "text-[#708196]"
      : "text-[#7C8CA3]";

  const blueText =
    isDark
      ? "text-[#66B8EA]"
      : "text-[#1D5C86]";

  /*
  |--------------------------------------------------------------------------
  | RECORD VIEW
  |--------------------------------------------------------------------------
  |
  | Backend route:
  |
  | POST /blogs/:slug/view
  |
  | Required header:
  |
  | x-blog-visitor-id
  |
  | Backend returns:
  |
  | {
  |   success: true,
  |   counted: true/false,
  |   views: number
  | }
  |
  */

  const recordBlogView =
    useCallback(
      async (
        targetSlug
      ) => {
        if (
          !targetSlug
        ) {
          return;
        }

        try {
          const visitorId =
            getBlogVisitorId();

          if (!visitorId) {
            return;
          }

          const response =
            await axios.post(
              `${BASE_URL}/blogs/${targetSlug}/view`,
              null,
              {
                headers: {
                  "x-blog-visitor-id":
                    visitorId,

                  Accept:
                    "application/json",
                },
              }
            );

          if (
            response?.data
              ?.success
          ) {
            const updatedViews =
              Number(
                response.data
                  .views
              );

            /*
             * Backend returns latest
             * number even when this
             * visitor was already
             * counted.
             */

            if (
              Number.isFinite(
                updatedViews
              )
            ) {
              setPost(
                (
                  currentPost
                ) => {
                  if (
                    !currentPost
                  ) {
                    return currentPost;
                  }

                  return {
                    ...currentPost,

                    views:
                      updatedViews,
                  };
                }
              );
            }

            console.log(
              "Blog view response:",
              {
                counted:
                  response.data
                    .counted,

                views:
                  response.data
                    .views,
              }
            );
          }
        } catch (
          viewError
        ) {
          /*
           * View analytics should
           * never break article.
           */

          console.error(
            "Failed to record blog view:",
            viewError
          );
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | FETCH POST
  |--------------------------------------------------------------------------
  */

  const fetchPost =
    useCallback(
      async () => {
        if (!slug) {
          setError(
            "No blog slug provided."
          );

          setLoading(
            false
          );

          return;
        }

        setLoading(true);
        setError("");

        try {
          /*
           * 1. FETCH BLOG
           */

          const response =
            await axios.get(
              `${BASE_URL}/blogs/${slug}`,
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          if (
            !response?.data
              ?.success
          ) {
            throw new Error(
              response?.data
                ?.error
                ?.message ||
                response?.data
                  ?.message ||
                "Blog post not found."
            );
          }

          const payload =
            response.data
              .data;

          const fetchedPost =
            payload?.post ||
            payload;

          if (
            !fetchedPost
          ) {
            throw new Error(
              "Blog post not found."
            );
          }

          /*
           * 2. DISPLAY BLOG
           */

          setPost(
            fetchedPost
          );

          /*
           * 3. RECORD VIEW
           *
           * Use actual backend slug
           * if available.
           */

          recordBlogView(
            fetchedPost.slug ||
              slug
          );
        } catch (err) {
          console.error(
            "Error loading blog:",
            err
          );

          const message =
            err?.response
              ?.status === 404
              ? "Blog post not found."
              : err?.response
                  ?.data
                  ?.error
                  ?.message ||
                err?.response
                  ?.data
                  ?.message ||
                err?.message ||
                "Unable to load blog post.";

          setError(
            message
          );

          if (
            err?.response
              ?.status !== 404
          ) {
            toast.error(
              message
            );
          }
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        slug,
        recordBlogView,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | PAGE LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });

    fetchPost();
  }, [fetchPost]);

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async () => {
      if (
        !post?._id ||
        !token ||
        deleting
      ) {
        return;
      }

      setDeleting(true);

      const toastId =
        toast.loading(
          "Deleting article..."
        );

      try {
        const response =
          await axios.delete(
            `${BASE_URL}/blogs/${post._id}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          !response?.data
            ?.success
        ) {
          throw new Error(
            response?.data
              ?.error
              ?.message ||
              "Failed to delete article."
          );
        }

        toast.success(
          "Article deleted successfully.",
          {
            id: toastId,
          }
        );

        setDeleteModal(
          false
        );

        navigate(
          "/blogs"
        );
      } catch (err) {
        console.error(
          "Delete blog error:",
          err
        );

        toast.error(
          err?.response?.data
            ?.error?.message ||
            err?.response?.data
              ?.message ||
            err?.message ||
            "Failed to delete article.",
          {
            id: toastId,
          }
        );
      } finally {
        setDeleting(
          false
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE PUBLISH
  |--------------------------------------------------------------------------
  */

  const handleTogglePublish =
    async () => {
      if (
        !post?._id ||
        !token ||
        publishing
      ) {
        return;
      }

      const currentlyPublished =
        isPublishedPost(
          post
        );

      setPublishing(
        true
      );

      const toastId =
        toast.loading(
          currentlyPublished
            ? "Unpublishing article..."
            : "Publishing article..."
        );

      try {
        const response =
          await axios.patch(
            `${BASE_URL}/blogs/${post._id}/toggle-publish`,
            null,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          !response?.data
            ?.success
        ) {
          throw new Error(
            response?.data
              ?.error
              ?.message ||
              "Failed to update publication status."
          );
        }

        const updatedPost =
          response.data
            .data?.post ||
          response.data.data;

        if (
          updatedPost
        ) {
          setPost(
            updatedPost
          );
        }

        toast.success(
          response.data
            .message ||
            "Publication status updated.",
          {
            id: toastId,
          }
        );
      } catch (err) {
        console.error(
          "Publish status error:",
          err
        );

        toast.error(
          err?.response?.data
            ?.error?.message ||
            err?.response?.data
              ?.message ||
            err?.message ||
            "Could not update article.",
          {
            id: toastId,
          }
        );
      } finally {
        setPublishing(
          false
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | COPY LINK
  |--------------------------------------------------------------------------
  */

  const copyArticleLink =
    async () => {
      try {
        await navigator.clipboard.writeText(
          window.location.href
        );

        setCopied(
          true
        );

        toast.success(
          "Article link copied."
        );

        window.setTimeout(
          () =>
            setCopied(
              false
            ),
          1500
        );
      } catch {
        toast.error(
          "Unable to copy link."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | SHARE
  |--------------------------------------------------------------------------
  */

  const shareArticle =
    async () => {
      const currentUrl =
        window.location.href;

      if (
        navigator.share
      ) {
        try {
          await navigator.share({
            title:
              post?.title ||
              "Target Trek",

            text:
              truncateText(
                getPostExcerpt(
                  post
                ),
                120
              ),

            url:
              currentUrl,
          });

          return;
        } catch (err) {
          if (
            err?.name ===
            "AbortError"
          ) {
            return;
          }
        }
      }

      copyArticleLink();
    };

  /*
  |--------------------------------------------------------------------------
  | COMPUTED VALUES
  |--------------------------------------------------------------------------
  */

  const article =
    useMemo(() => {
      if (!post) {
        return null;
      }

      const seo =
        getSeo(post);

      return {
        content:
          getPostContent(
            post
          ),

        excerpt:
          getPostExcerpt(
            post
          ),

        author:
          getAuthorName(
            post
          ),

        category:
          getCategoryName(
            post
          ),

        tags:
          getTags(post),

        views:
          getViews(post),

        image:
          getPostImage(
            post
          ),

        publishedDate:
          getPublishedDate(
            post
          ),

        readingTime:
          getReadingTime(
            post
          ),

        wordCount:
          getWordCount(
            post
          ),

        published:
          isPublishedPost(
            post
          ),

        featured:
          isFeaturedPost(
            post
          ),

        editorChoice:
          isEditorChoicePost(
            post
          ),

        seo,
      };
    }, [post]);

  /*
  |--------------------------------------------------------------------------
  | SEO STRUCTURED DATA
  |--------------------------------------------------------------------------
  */

  const structuredData =
    useMemo(() => {
      if (
        !post ||
        !article
      ) {
        return null;
      }

      const articleUrl =
        `${SITE_URL}/blog/${
          post.slug ||
          slug
        }`;

      return {
        "@context":
          "https://schema.org",

        "@type":
          "BlogPosting",

        headline:
          safeString(
            article.seo
              ?.metaTitle,
            safeString(
              post.title,
              "Target Trek Article"
            )
          ),

        name:
          safeString(
            post.title
          ),

        description:
          safeString(
            article.seo
              ?.metaDescription,
            truncateText(
              article.excerpt,
              160
            )
          ),

        url:
          articleUrl,

        mainEntityOfPage: {
          "@type":
            "WebPage",

          "@id":
            articleUrl,
        },

        ...(article.image
          ? {
              image: [
                article.image,
              ],
            }
          : {}),

        author: {
          "@type":
            "Person",

          name:
            safeString(
              article.author,
              "Target Trek"
            ),
        },

        publisher: {
          "@type":
            "Organization",

          name:
            "Target Trek",

          url:
            SITE_URL,
        },

        ...(article.publishedDate
          ? {
              datePublished:
                new Date(
                  article.publishedDate
                ).toISOString(),
            }
          : {}),

        ...(post?.updatedAt
          ? {
              dateModified:
                new Date(
                  post.updatedAt
                ).toISOString(),
            }
          : {}),

        articleSection:
          article.category,

        keywords:
          article.tags.join(
            ", "
          ),

        wordCount:
          article.wordCount,

        timeRequired:
          `PT${article.readingTime}M`,

        inLanguage:
          "en",

        interactionStatistic: {
          "@type":
            "InteractionCounter",

          interactionType: {
            "@type":
              "ViewAction",
          },

          userInteractionCount:
            article.views,
        },
      };
    }, [
      post,
      article,
      slug,
    ]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main
        className={`
          flex
          min-h-screen
          items-center
          justify-center
          transition-colors
          ${pageBg}
        `}
      >
        <Helmet>
          <title>
            Loading Article |
            Target Trek
          </title>

          <meta
            name="robots"
            content="noindex"
          />
        </Helmet>

        <div className="text-center">
          <Loader2
            size={38}
            className={`
              mx-auto
              animate-spin
              ${blueText}
            `}
          />

          <p
            className={`
              mt-4
              text-sm
              ${secondaryText}
            `}
          >
            Loading article...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (
    error ||
    !post ||
    !article
  ) {
    return (
      <main
        className={`
          flex
          min-h-screen
          items-center
          justify-center
          px-4
          py-24
          transition-colors
          ${pageBg}
        `}
      >
        <Helmet>
          <title>
            Article Not Found |
            Target Trek
          </title>

          <meta
            name="robots"
            content="noindex, nofollow"
          />
        </Helmet>

        <Toaster
          position="top-center"
        />

        <div
          className={`
            w-full
            max-w-lg
            rounded-3xl
            border
            p-8
            text-center
            ${primaryBg}
            ${borderColor}
          `}
        >
          <div
            className={`
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              ${
                isDark
                  ? "bg-red-950/30 text-red-300"
                  : "bg-red-50 text-red-600"
              }
            `}
          >
            <AlertTriangle
              size={29}
            />
          </div>

          <h1
            className={`
              mt-5
              text-2xl
              font-black
              ${primaryText}
            `}
          >
            Article not found
          </h1>

          <p
            className={`
              mt-3
              text-sm
              leading-6
              ${secondaryText}
            `}
          >
            {error}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={
                fetchPost
              }
              className={`
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-5
                py-3
                text-sm
                font-semibold
                ${borderColor}
                ${
                  isDark
                    ? "bg-[#101924] text-white"
                    : "bg-white text-slate-800"
                }
              `}
            >
              <RefreshCw
                size={16}
              />

              Try Again
            </button>

            <Link
              to="/blogs"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#1D5C86]
                px-5
                py-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-[#246F9F]
              "
            >
              <ArrowLeft
                size={16}
              />

              Blogs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SEO VALUES
  |--------------------------------------------------------------------------
  */

  const canonicalUrl =
    safeString(
      article.seo
        ?.canonicalUrl,
      `${SITE_URL}/blog/${
        post.slug ||
        slug
      }`
    );

  const seoTitle =
    safeString(
      article.seo
        ?.metaTitle,
      `${safeString(
        post.title,
        "Article"
      )} | Target Trek`
    );

  const seoDescription =
    safeString(
      article.seo
        ?.metaDescription,
      truncateText(
        article.excerpt,
        160
      )
    );

  const seoImage =
    safeString(
      article.seo
        ?.ogImageUrl,
      article.image
    );

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* ============================================================= */}
      {/* SEO */}
      {/* ============================================================= */}

      <Helmet>
        <title>
          {seoTitle}
        </title>

        <meta
          name="description"
          content={
            seoDescription
          }
        />

        <meta
          name="author"
          content={
            article.author
          }
        />

        <meta
          name="keywords"
          content={
            article.seo
              ?.keywords?.length
              ? article.seo.keywords.join(
                  ", "
                )
              : article.tags.join(
                  ", "
                )
          }
        />

        <meta
          name="robots"
          content={
            article.seo
              ?.noIndex ||
            !article.published
              ? "noindex, nofollow"
              : "index, follow, max-image-preview:large"
          }
        />

        <link
          rel="canonical"
          href={
            canonicalUrl
          }
        />

        {/* OPEN GRAPH */}

        <meta
          property="og:type"
          content="article"
        />

        <meta
          property="og:title"
          content={
            seoTitle
          }
        />

        <meta
          property="og:description"
          content={
            seoDescription
          }
        />

        <meta
          property="og:url"
          content={
            canonicalUrl
          }
        />

        <meta
          property="og:site_name"
          content="Target Trek"
        />

        <meta
          property="og:locale"
          content="en_IN"
        />

        {seoImage && (
          <>
            <meta
              property="og:image"
              content={
                seoImage
              }
            />

            <meta
              property="og:image:alt"
              content={
                post?.altText ||
                post.title
              }
            />
          </>
        )}

        {article.publishedDate && (
          <meta
            property="article:published_time"
            content={
              new Date(
                article.publishedDate
              ).toISOString()
            }
          />
        )}

        {post?.updatedAt && (
          <meta
            property="article:modified_time"
            content={
              new Date(
                post.updatedAt
              ).toISOString()
            }
          />
        )}

        <meta
          property="article:section"
          content={
            article.category
          }
        />

        {article.tags.map(
          (tag) => (
            <meta
              key={tag}
              property="article:tag"
              content={tag}
            />
          )
        )}

        {/* TWITTER */}

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={
            seoTitle
          }
        />

        <meta
          name="twitter:description"
          content={
            seoDescription
          }
        />

        {seoImage && (
          <meta
            name="twitter:image"
            content={
              seoImage
            }
          />
        )}

        <meta
          name="theme-color"
          content={
            isDark
              ? "#080D14"
              : "#F5F9FC"
          }
        />

        {structuredData && (
          <script
            type="application/ld+json"
          >
            {JSON.stringify(
              structuredData
            )}
          </script>
        )}
      </Helmet>

      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      <main
        className={`
          min-h-screen
          pb-20
          pt-20
          transition-colors
          duration-300
          ${pageBg}
          ${primaryText}
        `}
      >
        {/* ============================================================= */}
        {/* HERO */}
        {/* ============================================================= */}

        <section
          className={`
            relative
            overflow-hidden
            border-b
            ${borderColor}
            ${primaryBg}
          `}
        >
          {/* BACKGROUND */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className={`
                absolute
                -left-32
                -top-32
                h-[350px]
                w-[350px]
                rounded-full
                blur-[120px]
                ${
                  isDark
                    ? "bg-blue-900/10"
                    : "bg-[#E4F1FB]/80"
                }
              `}
            />

            <div
              className={`
                absolute
                -right-32
                top-10
                h-[360px]
                w-[360px]
                rounded-full
                blur-[120px]
                ${
                  isDark
                    ? "bg-cyan-900/10"
                    : "bg-[#EAF4FC]/80"
                }
              `}
            />

            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  isDark
                    ? "repeating-linear-gradient(90deg, rgba(110,180,220,0.025) 0px, rgba(110,180,220,0.025) 1px, transparent 1px, transparent 42px)"
                    : "repeating-linear-gradient(90deg, rgba(29,92,134,0.035) 0px, rgba(29,92,134,0.035) 1px, transparent 1px, transparent 42px)",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-6 sm:pb-12 lg:px-8">
            {/* BREADCRUMBS */}

            <nav
              aria-label="Breadcrumb"
              className={`
                flex
                flex-wrap
                items-center
                gap-2
                text-xs
                ${mutedText}
              `}
            >
              <Link
                to="/"
                className={
                  blueText
                }
              >
                Home
              </Link>

              <span>/</span>

              <Link
                to="/blogs"
                className={
                  blueText
                }
              >
                Blogs
              </Link>

              <span>/</span>

              <span className="max-w-[220px] truncate sm:max-w-md">
                {post.title}
              </span>
            </nav>

            {/* BACK */}

            <Link
              to="/blogs"
              className={`
                mt-6
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                ${blueText}
              `}
            >
              <ArrowLeft
                size={16}
              />

              Back to Blogs
            </Link>

            {/* TAGS */}

            <div className="mt-8 flex flex-wrap gap-2">
              <span
                className={`
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  ${
                    isDark
                      ? "bg-blue-950/30 text-[#66B8EA]"
                      : "bg-[#EAF4FC] text-[#1D5C86]"
                  }
                `}
              >
                <FolderOpen
                  size={13}
                />

                {
                  article.category
                }
              </span>

              {article.featured && (
                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    ${
                      isDark
                        ? "bg-amber-950/30 text-amber-300"
                        : "bg-amber-50 text-amber-700"
                    }
                  `}
                >
                  <Sparkles
                    size={13}
                  />

                  Featured
                </span>
              )}

              {article.editorChoice && (
                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    ${
                      isDark
                        ? "bg-violet-950/30 text-violet-300"
                        : "bg-violet-50 text-violet-700"
                    }
                  `}
                >
                  <Star
                    size={13}
                  />

                  Editor&apos;s
                  Choice
                </span>
              )}

              {/* DRAFT BADGE ONLY ADMIN */}

              {isAdmin &&
                !article.published && (
                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      ${
                        isDark
                          ? "bg-yellow-950/30 text-yellow-300"
                          : "bg-yellow-50 text-yellow-700"
                      }
                    `}
                  >
                    <EyeOff
                      size={13}
                    />

                    Draft
                  </span>
                )}
            </div>

            {/* TITLE */}

            <h1
              className={`
                mt-5
                max-w-5xl
                text-3xl
                font-black
                leading-tight
                tracking-tight
                sm:text-4xl
                lg:text-5xl
                ${primaryText}
              `}
            >
              {post.title}
            </h1>

            {/* EXCERPT */}

            {article.excerpt && (
              <p
                className={`
                  mt-5
                  max-w-4xl
                  text-base
                  leading-7
                  sm:text-lg
                  sm:leading-8
                  ${secondaryText}
                `}
              >
                {normalizeText(
                  article.excerpt
                )}
              </p>
            )}

            {/* PUBLIC META */}

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              {/* AUTHOR */}

              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  ${secondaryText}
                `}
              >
                <User
                  size={16}
                  className={
                    blueText
                  }
                />

                <span
                  className={
                    primaryText
                  }
                >
                  {
                    article.author
                  }
                </span>
              </div>

              {/* DATE - DATE ONLY */}

              {article.publishedDate && (
                <div
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    ${secondaryText}
                  `}
                >
                  <CalendarDays
                    size={16}
                    className={
                      blueText
                    }
                  />

                  {formatDate(
                    article.publishedDate
                  )}
                </div>
              )}

              {/* READING TIME */}

              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  ${secondaryText}
                `}
              >
                <Clock3
                  size={16}
                  className={
                    blueText
                  }
                />

                {
                  article.readingTime
                }{" "}
                min read
              </div>

              {/* VIEWS */}

              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  ${secondaryText}
                `}
              >
                <Eye
                  size={16}
                  className={
                    blueText
                  }
                />

                {formatViews(
                  article.views
                )}{" "}
                {article.views ===
                1
                  ? "view"
                  : "views"}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* COVER IMAGE */}
        {/* ============================================================= */}

        {article.image && (
          <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
            <figure
              className={`
                overflow-hidden
                rounded-2xl
                border
                sm:rounded-3xl
                ${borderColor}
                ${cardBg}
              `}
            >
              <img
                src={
                  article.image
                }
                alt={
                  post?.altText ||
                  post.title
                }
                loading="eager"
                fetchPriority="high"
                className="
                  max-h-[620px]
                  w-full
                  object-cover
                "
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            </figure>
          </section>
        )}

        {/* ============================================================= */}
        {/* MAIN CONTENT */}
        {/* ============================================================= */}

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div
            className={
              isAdmin
                ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"
                : "mx-auto max-w-4xl"
            }
          >
            {/* ========================================================= */}
            {/* ARTICLE */}
            {/* ========================================================= */}

            <article
              className={`
                min-w-0
                overflow-hidden
                rounded-3xl
                border
                ${primaryBg}
                ${borderColor}
              `}
            >
              {/* TOOLBAR */}

              <div
                className={`
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-3
                  border-b
                  px-5
                  py-4
                  sm:px-7
                  ${borderColor}
                `}
              >
                <div
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    ${secondaryText}
                  `}
                >
                  <BookOpen
                    size={17}
                    className={
                      blueText
                    }
                  />

                  Article
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={
                      copyArticleLink
                    }
                    className={`
                      inline-flex
                      h-9
                      items-center
                      gap-2
                      rounded-xl
                      border
                      px-3
                      text-xs
                      font-semibold
                      transition
                      ${borderColor}
                      ${
                        isDark
                          ? "bg-[#101924] text-[#9AA9BA] hover:bg-[#172333]"
                          : "bg-[#F8FBFD] text-[#5B6B82] hover:bg-[#EAF4FC]"
                      }
                    `}
                  >
                    {copied ? (
                      <Check
                        size={14}
                      />
                    ) : (
                      <Copy
                        size={14}
                      />
                    )}

                    <span className="hidden sm:inline">
                      {copied
                        ? "Copied"
                        : "Copy link"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={
                      shareArticle
                    }
                    className={`
                      inline-flex
                      h-9
                      items-center
                      gap-2
                      rounded-xl
                      border
                      px-3
                      text-xs
                      font-semibold
                      transition
                      ${borderColor}
                      ${
                        isDark
                          ? "bg-[#101924] text-[#9AA9BA] hover:bg-[#172333]"
                          : "bg-[#F8FBFD] text-[#5B6B82] hover:bg-[#EAF4FC]"
                      }
                    `}
                  >
                    <Share2
                      size={14}
                    />

                    <span className="hidden sm:inline">
                      Share
                    </span>
                  </button>
                </div>
              </div>

              {/* CONTENT */}

              <div className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
                <div
                  className="tt-blog-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      article.content,
                  }}
                />
              </div>

              {/* TAGS */}

              {article.tags.length >
                0 && (
                <div
                  className={`
                    border-t
                    px-5
                    py-6
                    sm:px-8
                    lg:px-10
                    ${borderColor}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Tag
                      size={16}
                      className={
                        blueText
                      }
                    />

                    <h2
                      className={`
                        text-sm
                        font-bold
                        ${primaryText}
                      `}
                    >
                      Topics covered
                    </h2>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map(
                      (tag) => (
                        <span
                          key={
                            tag
                          }
                          className={`
                            rounded-full
                            border
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            ${borderColor}
                            ${
                              isDark
                                ? "bg-[#101924] text-[#9AA9BA]"
                                : "bg-[#F5F9FC] text-[#5B6B82]"
                            }
                          `}
                        >
                          #{tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ARTICLE FOOTER */}

              <div
                className={`
                  flex
                  flex-col
                  gap-4
                  border-t
                  px-5
                  py-6
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:px-8
                  lg:px-10
                  ${borderColor}
                `}
              >
                <div>
                  <p
                    className={`
                      text-xs
                      ${mutedText}
                    `}
                  >
                    Written by
                  </p>

                  <p
                    className={`
                      mt-1
                      text-sm
                      font-bold
                      ${primaryText}
                    `}
                  >
                    {
                      article.author
                    }
                  </p>
                </div>

                <Link
                  to="/blogs"
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-bold
                    ${blueText}
                  `}
                >
                  Explore more
                  articles

                  <ArrowRight
                    size={16}
                  />
                </Link>
              </div>
            </article>

            {/* ========================================================= */}
            {/* ADMIN SIDEBAR ONLY */}
            {/* ========================================================= */}

            {isAdmin && (
              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                {/* ADMIN LABEL */}

                <div
                  className={`
                    rounded-3xl
                    border
                    p-5
                    ${primaryBg}
                    ${borderColor}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <KeyRound
                      size={16}
                      className={
                        blueText
                      }
                    />

                    <h2
                      className={`
                        text-sm
                        font-bold
                        ${primaryText}
                      `}
                    >
                      Admin Information
                    </h2>
                  </div>

                  <p
                    className={`
                      mt-2
                      text-xs
                      leading-5
                      ${mutedText}
                    `}
                  >
                    This information
                    is visible only
                    to administrators.
                  </p>
                </div>

                {/* ARTICLE STATS */}

                <div
                  className={`
                    overflow-hidden
                    rounded-3xl
                    border
                    ${primaryBg}
                    ${borderColor}
                  `}
                >
                  <div
                    className={`
                      border-b
                      px-5
                      py-4
                      ${borderColor}
                    `}
                  >
                    <h2
                      className={`
                        flex
                        items-center
                        gap-2
                        text-sm
                        font-bold
                        ${primaryText}
                      `}
                    >
                      <FileText
                        size={16}
                        className={
                          blueText
                        }
                      />

                      Article Stats
                    </h2>
                  </div>

                  <div className="p-5">
                    {/* VIEWS */}

                    <AdminRow
                      icon={Eye}
                      label="Views"
                      value={formatViews(
                        article.views
                      )}
                      primaryText={
                        primaryText
                      }
                      secondaryText={
                        secondaryText
                      }
                    />

                    {/* READING TIME */}

                    <AdminRow
                      icon={Clock3}
                      label="Read time"
                      value={`${article.readingTime} min`}
                      primaryText={
                        primaryText
                      }
                      secondaryText={
                        secondaryText
                      }
                    />

                    {/* WORDS */}

                    <AdminRow
                      icon={
                        FileText
                      }
                      label="Words"
                      value={article.wordCount.toLocaleString(
                        "en-IN"
                      )}
                      primaryText={
                        primaryText
                      }
                      secondaryText={
                        secondaryText
                      }
                    />

                    {/* CATEGORY */}

                    <AdminRow
                      icon={
                        FolderOpen
                      }
                      label="Category"
                      value={
                        article.category
                      }
                      primaryText={
                        primaryText
                      }
                      secondaryText={
                        secondaryText
                      }
                    />

                    {/* STATUS */}

                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <div
                        className={`
                          flex
                          items-center
                          gap-2
                          text-sm
                          ${secondaryText}
                        `}
                      >
                        {article.published ? (
                          <Eye
                            size={15}
                          />
                        ) : (
                          <EyeOff
                            size={15}
                          />
                        )}

                        Status
                      </div>

                      <span
                        className={`
                          rounded-full
                          px-2.5
                          py-1
                          text-[11px]
                          font-bold
                          ${
                            article.published
                              ? isDark
                                ? "bg-emerald-950/30 text-emerald-300"
                                : "bg-emerald-50 text-emerald-700"
                              : isDark
                              ? "bg-yellow-950/30 text-yellow-300"
                              : "bg-yellow-50 text-yellow-700"
                          }
                        `}
                      >
                        {article.published
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    {/* FEATURED */}

                    <AdminRow
                      icon={
                        Sparkles
                      }
                      label="Featured"
                      value={
                        article.featured
                          ? "Yes"
                          : "No"
                      }
                      primaryText={
                        primaryText
                      }
                      secondaryText={
                        secondaryText
                      }
                    />

                    {/* EDITOR CHOICE */}

                    <AdminRow
                      icon={Star}
                      label="Editor's Choice"
                      value={
                        article.editorChoice
                          ? "Yes"
                          : "No"
                      }
                      primaryText={
                        primaryText
                      }
                      secondaryText={
                        secondaryText
                      }
                    />
                  </div>
                </div>

                {/* TIMELINE - ADMIN ONLY */}

                <div
                  className={`
                    rounded-3xl
                    border
                    p-5
                    ${primaryBg}
                    ${borderColor}
                  `}
                >
                  <h2
                    className={`
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-bold
                      ${primaryText}
                    `}
                  >
                    <CalendarDays
                      size={16}
                      className={
                        blueText
                      }
                    />

                    Internal Timeline
                  </h2>

                  <p
                    className={`
                      mt-2
                      text-xs
                      ${mutedText}
                    `}
                  >
                    Exact timestamps
                    are hidden from
                    normal users.
                  </p>

                  <div className="mt-5 space-y-4">
                    {post?.createdAt && (
                      <TimelineItem
                        label="Created"
                        value={formatDateTime(
                          post.createdAt
                        )}
                        icon={
                          CalendarDays
                        }
                        blueText={
                          blueText
                        }
                        primaryText={
                          primaryText
                        }
                        mutedText={
                          mutedText
                        }
                      />
                    )}

                    {post?.publishedAt && (
                      <TimelineItem
                        label="Published"
                        value={formatDateTime(
                          post.publishedAt
                        )}
                        icon={Eye}
                        blueText={
                          blueText
                        }
                        primaryText={
                          primaryText
                        }
                        mutedText={
                          mutedText
                        }
                      />
                    )}

                    {post?.updatedAt && (
                      <TimelineItem
                        label="Last Updated"
                        value={formatDateTime(
                          post.updatedAt
                        )}
                        icon={
                          RefreshCw
                        }
                        blueText={
                          blueText
                        }
                        primaryText={
                          primaryText
                        }
                        mutedText={
                          mutedText
                        }
                      />
                    )}
                  </div>
                </div>

                {/* DATABASE INFO */}

                <div
                  className={`
                    rounded-3xl
                    border
                    p-5
                    ${primaryBg}
                    ${borderColor}
                  `}
                >
                  <h2
                    className={`
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-bold
                      ${primaryText}
                    `}
                  >
                    <Hash
                      size={16}
                      className={
                        blueText
                      }
                    />

                    Database Info
                  </h2>

                  <div className="mt-5 space-y-4">
                    {post?._id && (
                      <AdminMetadata
                        label="Mongo ID"
                        value={
                          post._id
                        }
                        primaryText={
                          primaryText
                        }
                        mutedText={
                          mutedText
                        }
                        isDark={
                          isDark
                        }
                      />
                    )}

                    {post?.slug && (
                      <AdminMetadata
                        label="Slug"
                        value={
                          post.slug
                        }
                        primaryText={
                          primaryText
                        }
                        mutedText={
                          mutedText
                        }
                        isDark={
                          isDark
                        }
                      />
                    )}

                    {post?.altText && (
                      <AdminMetadata
                        label="Image Alt Text"
                        value={
                          post.altText
                        }
                        primaryText={
                          primaryText
                        }
                        mutedText={
                          mutedText
                        }
                        isDark={
                          isDark
                        }
                      />
                    )}
                  </div>
                </div>

                {/* SEO INFO */}

                <div
                  className={`
                    rounded-3xl
                    border
                    p-5
                    ${primaryBg}
                    ${borderColor}
                  `}
                >
                  <h2
                    className={`
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-bold
                      ${primaryText}
                    `}
                  >
                    <Search
                      size={16}
                      className={
                        blueText
                      }
                    />

                    SEO
                  </h2>

                  <div className="mt-5 space-y-4">
                    <AdminMetadata
                      label="Meta Title"
                      value={
                        article.seo
                          ?.metaTitle ||
                        "Not set"
                      }
                      primaryText={
                        primaryText
                      }
                      mutedText={
                        mutedText
                      }
                      isDark={
                        isDark
                      }
                    />

                    <AdminMetadata
                      label="Meta Description"
                      value={
                        article.seo
                          ?.metaDescription ||
                        "Not set"
                      }
                      primaryText={
                        primaryText
                      }
                      mutedText={
                        mutedText
                      }
                      isDark={
                        isDark
                      }
                    />

                    <AdminMetadata
                      label="Canonical URL"
                      value={
                        article.seo
                          ?.canonicalUrl ||
                        canonicalUrl
                      }
                      primaryText={
                        primaryText
                      }
                      mutedText={
                        mutedText
                      }
                      isDark={
                        isDark
                      }
                    />

                    <AdminMetadata
                      label="No Index"
                      value={
                        article.seo
                          ?.noIndex
                          ? "Yes"
                          : "No"
                      }
                      primaryText={
                        primaryText
                      }
                      mutedText={
                        mutedText
                      }
                      isDark={
                        isDark
                      }
                    />
                  </div>
                </div>

                {/* ADMIN ACTIONS */}

                <div
                  className={`
                    rounded-3xl
                    border
                    p-5
                    ${primaryBg}
                    ${borderColor}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Edit3
                      size={16}
                      className={
                        blueText
                      }
                    />

                    <h2
                      className={`
                        text-sm
                        font-bold
                        ${primaryText}
                      `}
                    >
                      Admin Controls
                    </h2>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={
                        handleTogglePublish
                      }
                      disabled={
                        publishing
                      }
                      className={`
                        inline-flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        transition
                        disabled:opacity-60
                        ${borderColor}
                        ${
                          article.published
                            ? isDark
                              ? "bg-yellow-950/20 text-yellow-300"
                              : "bg-yellow-50 text-yellow-700"
                            : isDark
                            ? "bg-emerald-950/20 text-emerald-300"
                            : "bg-emerald-50 text-emerald-700"
                        }
                      `}
                    >
                      {publishing ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : article.published ? (
                        <EyeOff
                          size={16}
                        />
                      ) : (
                        <Eye
                          size={16}
                        />
                      )}

                      {publishing
                        ? "Updating..."
                        : article.published
                        ? "Unpublish"
                        : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteModal(
                          true
                        )
                      }
                      className={`
                        inline-flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        transition
                        ${
                          isDark
                            ? "border-red-900/40 bg-red-950/20 text-red-300"
                            : "border-red-200 bg-red-50 text-red-600"
                        }
                      `}
                    >
                      <Trash2
                        size={16}
                      />

                      Delete Article
                    </button>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>
      </main>

      {/* ============================================================= */}
      {/* DELETE MODAL */}
      {/* ============================================================= */}

      <DeleteModal
        open={
          deleteModal
        }
        onClose={() =>
          setDeleteModal(
            false
          )
        }
        onConfirm={
          handleDelete
        }
        deleting={
          deleting
        }
        title={
          post.title
        }
        isDark={
          isDark
        }
      />

      {/* ============================================================= */}
      {/* ARTICLE CONTENT CSS */}
      {/* ============================================================= */}

      <style>
        {`
          .tt-blog-content {
            color: ${
              isDark
                ? "#C4CFDA"
                : "#334155"
            };
            font-size: 16px;
            line-height: 1.85;
            overflow-wrap: anywhere;
          }

          .tt-blog-content > *:first-child {
            margin-top: 0;
          }

          .tt-blog-content > *:last-child {
            margin-bottom: 0;
          }

          .tt-blog-content p {
            margin: 0 0 1.35rem;
          }

          .tt-blog-content h1,
          .tt-blog-content h2,
          .tt-blog-content h3,
          .tt-blog-content h4,
          .tt-blog-content h5,
          .tt-blog-content h6 {
            color: ${
              isDark
                ? "#F4F7FA"
                : "#0B1524"
            };
            font-weight: 800;
            line-height: 1.3;
            letter-spacing: -0.02em;
          }

          .tt-blog-content h1 {
            font-size: clamp(
              2rem,
              5vw,
              2.6rem
            );

            margin:
              2.7rem 0
              1.25rem;
          }

          .tt-blog-content h2 {
            font-size: clamp(
              1.5rem,
              4vw,
              2rem
            );

            margin:
              2.5rem 0
              1rem;

            padding-bottom:
              0.7rem;

            border-bottom:
              1px solid ${
                isDark
                  ? "#1E2C3D"
                  : "#E1E9F1"
              };
          }

          .tt-blog-content h3 {
            font-size: clamp(
              1.25rem,
              3vw,
              1.55rem
            );

            margin:
              2rem 0
              0.9rem;
          }

          .tt-blog-content h4 {
            font-size: 1.1rem;
            margin:
              1.8rem 0
              0.8rem;
          }

          .tt-blog-content strong,
          .tt-blog-content b {
            color: ${
              isDark
                ? "#F4F7FA"
                : "#172033"
            };

            font-weight: 700;
          }

          .tt-blog-content a {
            color: ${
              isDark
                ? "#66B8EA"
                : "#1D5C86"
            };

            text-decoration:
              underline;

            text-underline-offset:
              3px;
          }

          .tt-blog-content ul,
          .tt-blog-content ol {
            margin:
              1.2rem 0
              1.5rem;

            padding-left:
              1.6rem;
          }

          .tt-blog-content ul {
            list-style: disc;
          }

          .tt-blog-content ol {
            list-style: decimal;
          }

          .tt-blog-content li {
            margin:
              0.55rem 0;
          }

          .tt-blog-content li::marker {
            color: ${
              isDark
                ? "#66B8EA"
                : "#2E86C1"
            };
          }

          .tt-blog-content blockquote {
            margin:
              1.8rem 0;

            border-left:
              4px solid ${
                isDark
                  ? "#3C8DBD"
                  : "#2E86C1"
              };

            border-radius:
              0 14px 14px 0;

            background: ${
              isDark
                ? "#101924"
                : "#F5F9FC"
            };

            padding:
              1.1rem
              1.25rem;
          }

          .tt-blog-content hr {
            border: 0;

            border-top:
              1px solid ${
                isDark
                  ? "#1E2C3D"
                  : "#E1E9F1"
              };

            margin:
              2.5rem 0;
          }

          .tt-blog-content img {
            display: block;
            max-width: 100%;
            height: auto;

            margin:
              1.8rem auto;

            border-radius:
              16px;

            border:
              1px solid ${
                isDark
                  ? "#1E2C3D"
                  : "#E1E9F1"
              };
          }

          .tt-blog-content code {
            border-radius:
              6px;

            background: ${
              isDark
                ? "#172333"
                : "#EEF3F7"
            };

            color: ${
              isDark
                ? "#8BD0F5"
                : "#174E72"
            };

            padding:
              0.15rem
              0.38rem;

            font-size:
              0.88em;

            font-family:
              ui-monospace,
              SFMono-Regular,
              Menlo,
              Monaco,
              Consolas,
              monospace;
          }

          .tt-blog-content pre {
            max-width: 100%;
            overflow-x: auto;

            margin:
              1.7rem 0;

            border:
              1px solid ${
                isDark
                  ? "#26374A"
                  : "#D9E3EA"
              };

            border-radius:
              16px;

            background:
              #0F172A;

            padding:
              1.1rem
              1.2rem;

            color:
              #E5EDF5;

            font-size:
              0.87rem;

            line-height:
              1.7;
          }

          .tt-blog-content pre code {
            background:
              transparent;

            color:
              inherit;

            padding: 0;
          }

          .tt-blog-content table {
            display:
              block;

            width:
              100%;

            max-width:
              100%;

            overflow-x:
              auto;

            border-collapse:
              collapse;

            margin:
              1.8rem 0;
          }

          .tt-blog-content th,
          .tt-blog-content td {
            min-width:
              120px;

            border:
              1px solid ${
                isDark
                  ? "#1E2C3D"
                  : "#DDE6EE"
              };

            padding:
              0.75rem
              0.85rem;

            text-align:
              left;
          }

          .tt-blog-content th {
            background: ${
              isDark
                ? "#101924"
                : "#F5F9FC"
            };

            color: ${
              isDark
                ? "#F4F7FA"
                : "#0B1524"
            };
          }

          @media (
            max-width:
              640px
          ) {
            .tt-blog-content {
              font-size:
                15px;

              line-height:
                1.8;
            }

            .tt-blog-content h2 {
              margin-top:
                2rem;
            }

            .tt-blog-content pre {
              border-radius:
                12px;

              padding:
                0.9rem;

              font-size:
                0.78rem;
            }

            .tt-blog-content ul,
            .tt-blog-content ol {
              padding-left:
                1.3rem;
            }
          }
        `}
      </style>
    </>
  );
};

/*
|--------------------------------------------------------------------------
| ADMIN ROW
|--------------------------------------------------------------------------
*/

const AdminRow = ({
  icon: Icon,
  label,
  value,
  primaryText,
  secondaryText,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div
        className={`
          flex
          items-center
          gap-2
          text-sm
          ${secondaryText}
        `}
      >
        <Icon
          size={15}
          className="mt-0.5 shrink-0"
        />

        {label}
      </div>

      <span
        className={`
          max-w-[150px]
          text-right
          text-sm
          font-bold
          ${primaryText}
        `}
      >
        {value}
      </span>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| TIMELINE ITEM
|--------------------------------------------------------------------------
*/

const TimelineItem = ({
  icon: Icon,
  label,
  value,
  blueText,
  primaryText,
  mutedText,
}) => {
  return (
    <div className="flex items-start gap-3">
      <Icon
        size={16}
        className={`
          mt-0.5
          shrink-0
          ${blueText}
        `}
      />

      <div className="min-w-0">
        <p
          className={`
            text-[11px]
            font-medium
            ${mutedText}
          `}
        >
          {label}
        </p>

        <p
          className={`
            mt-1
            text-xs
            font-semibold
            leading-5
            ${primaryText}
          `}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| ADMIN METADATA
|--------------------------------------------------------------------------
*/

const AdminMetadata = ({
  label,
  value,
  primaryText,
  mutedText,
  isDark,
}) => {
  return (
    <div>
      <p
        className={`
          text-[10px]
          font-semibold
          uppercase
          tracking-wider
          ${mutedText}
        `}
      >
        {label}
      </p>

      <div
        className={`
          mt-1.5
          break-all
          rounded-xl
          px-3
          py-2.5
          text-xs
          leading-5
          ${primaryText}
          ${
            isDark
              ? "bg-[#101924]"
              : "bg-[#F5F9FC]"
          }
        `}
      >
        {value}
      </div>
    </div>
  );
};

export default BlogPostDetail;