import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  Flame,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
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

const BLOG_URL =
  `${SITE_URL}/blog`;

/*
|--------------------------------------------------------------------------
| SAME THEME SYSTEM USED BY YOUR WORKING PAGE
|--------------------------------------------------------------------------
*/

const THEME_KEY = "theme";

const THEME_EVENT =
  "targettrek-theme-change";

/*
|--------------------------------------------------------------------------
| READ THEME
|--------------------------------------------------------------------------
*/

const readTheme = () => {
  if (
    typeof window === "undefined"
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
| BLOG HELPERS
|--------------------------------------------------------------------------
*/

const stripHtml = (
  html = ""
) => {
  if (!html) return "";

  try {
    const doc =
      new DOMParser().parseFromString(
        html,
        "text/html"
      );

    return (
      doc.body.textContent || ""
    );
  } catch {
    return String(html).replace(
      /<[^>]*>/g,
      " "
    );
  }
};

const truncateText = (
  text = "",
  maxLength = 170
) => {
  const normalized = text
    .replace(/\s+/g, " ")
    .trim();

  if (
    normalized.length <=
    maxLength
  ) {
    return normalized;
  }

  return `${normalized
    .substring(
      0,
      maxLength
    )
    .trim()}...`;
};

const getPostExcerpt = (
  post
) => {
  return truncateText(
    stripHtml(
      post?.excerpt ||
        post?.shortDescription ||
        post?.description ||
        post?.content ||
        ""
    ),
    180
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

const getPostDate = (
  post
) => {
  return (
    post?.publishedAt ||
    post?.createdAt ||
    post?.updatedAt ||
    null
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

const isFeaturedPost = (
  post
) => {
  return Boolean(
    post?.featured ||
      post?.isFeatured
  );
};

const isEditorChoicePost = (
  post
) => {
  return Boolean(
    post?.editorChoice ||
      post?.isEditorChoice
  );
};

const isPublishedPost = (
  post
) => {
  if (
    post?.isPublished ===
    false
  ) {
    return false;
  }

  if (
    post?.published === false
  ) {
    return false;
  }

  if (
    typeof post?.status ===
      "string" &&
    [
      "draft",
      "unpublished",
    ].includes(
      post.status.toLowerCase()
    )
  ) {
    return false;
  }

  return true;
};

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
      month: "short",
      year: "numeric",
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

  if (views >= 1000) {
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

/*
|--------------------------------------------------------------------------
| BLOG IMAGE
|--------------------------------------------------------------------------
*/

const BlogImage = ({
  post,
  isDark,
  className = "",
  priority = false,
}) => {
  const image =
    getPostImage(post);

  const [
    failed,
    setFailed,
  ] = useState(false);

  if (
    !image ||
    failed
  ) {
    return (
      <div
        className={`
          flex
          h-full
          w-full
          items-center
          justify-center
          ${className}
          ${
            isDark
              ? "bg-[#101924]"
              : "bg-[#EAF4FC]"
          }
        `}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={`
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              ${
                isDark
                  ? "border-[#1E2C3D] bg-[#0C131D] text-[#66B8EA]"
                  : "border-[#D9E7F2] bg-white text-[#1D5C86]"
              }
            `}
          >
            <BookOpen
              size={27}
            />
          </div>

          <span
            className={`
              text-[10px]
              font-bold
              uppercase
              tracking-[0.2em]
              ${
                isDark
                  ? "text-[#708196]"
                  : "text-[#7C8CA3]"
              }
            `}
          >
            Target Trek
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={
        post?.altText ||
        post?.title ||
        "Target Trek blog"
      }
      loading={
        priority
          ? "eager"
          : "lazy"
      }
      fetchPriority={
        priority
          ? "high"
          : "auto"
      }
      onError={() =>
        setFailed(true)
      }
      className={`
        h-full
        w-full
        object-cover
        ${className}
      `}
    />
  );
};

/*
|--------------------------------------------------------------------------
| SKELETON
|--------------------------------------------------------------------------
*/

const BlogCardSkeleton = ({
  isDark,
}) => {
  const skeletonPrimary =
    isDark
      ? "bg-[#172333]"
      : "bg-slate-200";

  const skeletonSecondary =
    isDark
      ? "bg-[#101924]"
      : "bg-slate-100";

  return (
    <div
      className={`
        overflow-hidden
        rounded-3xl
        border
        ${
          isDark
            ? "border-[#1E2C3D] bg-[#0C131D]"
            : "border-[#E1E9F1] bg-white"
        }
      `}
    >
      <div
        className={`
          h-52
          animate-pulse
          sm:h-56
          ${skeletonPrimary}
        `}
      />

      <div className="p-5 sm:p-6">
        <div
          className={`
            mb-4
            h-5
            w-24
            animate-pulse
            rounded-full
            ${skeletonPrimary}
          `}
        />

        <div className="space-y-3">
          <div
            className={`
              h-6
              w-full
              animate-pulse
              rounded
              ${skeletonPrimary}
            `}
          />

          <div
            className={`
              h-6
              w-4/5
              animate-pulse
              rounded
              ${skeletonPrimary}
            `}
          />
        </div>

        <div className="mt-5 space-y-2">
          <div
            className={`
              h-4
              w-full
              animate-pulse
              rounded
              ${skeletonSecondary}
            `}
          />

          <div
            className={`
              h-4
              w-11/12
              animate-pulse
              rounded
              ${skeletonSecondary}
            `}
          />

          <div
            className={`
              h-4
              w-8/12
              animate-pulse
              rounded
              ${skeletonSecondary}
            `}
          />
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| BLOG CARD
|--------------------------------------------------------------------------
*/

const BlogCard = ({
  post,
  isDark,
}) => {
  const category =
    getCategoryName(post);

  const tags =
    getTags(post);

  const date =
    getPostDate(post);

  const views =
    getViews(post);

  const cardBg =
    isDark
      ? "bg-[#0C131D]"
      : "bg-white";

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

  return (
    <article
      className={`
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-3xl
        border
        transition-all
        duration-300
        hover:-translate-y-1
        ${cardBg}
        ${borderColor}
        ${
          isDark
            ? "hover:border-[#29415B] hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
            : "hover:border-[#BFDDF2] hover:shadow-[0_18px_45px_rgba(15,35,58,0.10)]"
        }
      `}
    >
      <Link
        to={`/blog/${post.slug}`}
        aria-label={`Read ${post.title}`}
        className={`
          relative
          block
          h-52
          overflow-hidden
          sm:h-56
          ${
            isDark
              ? "bg-[#101924]"
              : "bg-[#F5F9FC]"
          }
        `}
      >
        <BlogImage
          post={post}
          isDark={isDark}
          className="
            transition-transform
            duration-500
            group-hover:scale-[1.04]
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {isFeaturedPost(
            post
          ) && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
              <Sparkles
                size={12}
              />
              Featured
            </span>
          )}

          {isEditorChoicePost(
            post
          ) && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
              <Star
                size={12}
              />
              Editor&apos;s
              Choice
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              px-3
              py-1.5
              text-[11px]
              font-bold
              ${
                isDark
                  ? "bg-blue-950/30 text-[#66B8EA]"
                  : "bg-[#EAF4FC] text-[#1D5C86]"
              }
            `}
          >
            <Tag
              size={12}
            />

            {category}
          </span>

          {tags
            .slice(0, 1)
            .map(
              (tag) => (
                <span
                  key={tag}
                  className={`
                    rounded-full
                    px-3
                    py-1.5
                    text-[11px]
                    font-medium
                    ${
                      isDark
                        ? "bg-[#101924] text-[#9AA9BA]"
                        : "bg-[#F5F9FC] text-[#5B6B82]"
                    }
                  `}
                >
                  {tag}
                </span>
              )
            )}
        </div>

        <Link
          to={`/blog/${post.slug}`}
        >
          <h2
            className={`
              text-xl
              font-extrabold
              leading-snug
              tracking-tight
              transition-colors
              sm:text-[21px]
              ${primaryText}
              ${
                isDark
                  ? "group-hover:text-[#66B8EA]"
                  : "group-hover:text-[#1D5C86]"
              }
            `}
          >
            {post.title}
          </h2>
        </Link>

        <p
          className={`
            mt-3
            line-clamp-3
            text-sm
            leading-6
            ${secondaryText}
          `}
        >
          {getPostExcerpt(
            post
          )}
        </p>

        <div className="mt-auto pt-6">
          <div
            className={`
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-2
              border-t
              pt-4
              text-xs
              ${borderColor}
              ${mutedText}
            `}
          >
            <span className="inline-flex items-center gap-1.5">
              <User
                size={13}
              />

              {getAuthorName(
                post
              )}
            </span>

            {date && (
              <time
                dateTime={new Date(
                  date
                ).toISOString()}
                className="inline-flex items-center gap-1.5"
              >
                <CalendarDays
                  size={13}
                />

                {formatDate(
                  date
                )}
              </time>
            )}

            {views > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Eye
                  size={13}
                />

                {formatViews(
                  views
                )}
              </span>
            )}
          </div>

          <Link
            to={`/blog/${post.slug}`}
            className={`
              mt-4
              inline-flex
              items-center
              gap-2
              text-sm
              font-bold
              transition
              ${
                isDark
                  ? "text-[#66B8EA] hover:text-[#8ACAF0]"
                  : "text-[#1D5C86] hover:text-[#154766]"
              }
            `}
          >
            Read article

            <ArrowRight
              size={16}
              className="
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </article>
  );
};

/*
|--------------------------------------------------------------------------
| BLOG PAGE
|--------------------------------------------------------------------------
*/

const BlogPage = () => {
  /*
  |--------------------------------------------------------------------------
  | BLOG STATE
  |--------------------------------------------------------------------------
  */

  const [
    blogPosts,
    setBlogPosts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("All");

  const [
    contentFilter,
    setContentFilter,
  ] = useState("all");

  const [
    sortBy,
    setSortBy,
  ] = useState("latest");

  /*
  |--------------------------------------------------------------------------
  | THEME
  |--------------------------------------------------------------------------
  |
  | SAME PATTERN AS YOUR WORKING PAGE.
  |
  | Navbar controls theme.
  |
  | Blog page only:
  |
  | 1. reads localStorage
  | 2. listens for targettrek-theme-change
  | 3. listens for storage event
  | 4. updates its own colors
  |
  */

  const [
    theme,
    setTheme,
  ] = useState(
    readTheme
  );

  const isDark =
    theme === "dark";

  /*
  |--------------------------------------------------------------------------
  | LISTEN FOR GLOBAL THEME CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    /*
    |--------------------------------------------------------------------------
    | SYNC ON MOUNT
    |--------------------------------------------------------------------------
    */

    setTheme(
      readTheme()
    );

    /*
    |--------------------------------------------------------------------------
    | SAME TAB
    |--------------------------------------------------------------------------
    |
    | Navbar dispatches:
    |
    | targettrek-theme-change
    |
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

        /*
         * If event was dispatched
         * without detail, still
         * re-read localStorage.
         */

        setTheme(
          readTheme()
        );
      };

    /*
    |--------------------------------------------------------------------------
    | DIFFERENT TAB / WINDOW
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

        const newTheme =
          event.newValue;

        if (
          newTheme ===
            "dark" ||
          newTheme ===
            "light"
        ) {
          setTheme(
            newTheme
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
  | SCROLL TO TOP
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    window.scrollTo(
      0,
      0
    );
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FETCH BLOG POSTS
  |--------------------------------------------------------------------------
  */

  const fetchPosts =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await axios.get(
            `${BASE_URL}/blogs`,
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
              "Failed to fetch blog posts."
          );
        }

        const payload =
          response.data.data;

        let posts = [];

        /*
         * Supports your existing
         * response:
         *
         * data: [...]
         *
         * and also future:
         *
         * data: {
         *   blogs: [...]
         * }
         */

        if (
          Array.isArray(
            payload
          )
        ) {
          posts = payload;
        } else if (
          Array.isArray(
            payload?.blogs
          )
        ) {
          posts =
            payload.blogs;
        } else if (
          Array.isArray(
            payload?.posts
          )
        ) {
          posts =
            payload.posts;
        }

        setBlogPosts(
          posts
        );
      } catch (err) {
        console.error(
          "Error fetching blog posts:",
          err
        );

        const message =
          err?.response
            ?.data
            ?.error
            ?.message ||
          err?.response
            ?.data
            ?.message ||
          err?.message ||
          "Could not load blog posts.";

        setError(
          message
        );

        toast.error(
          message
        );
      } finally {
        setLoading(
          false
        );
      }
    }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /*
  |--------------------------------------------------------------------------
  | PUBLISHED POSTS
  |--------------------------------------------------------------------------
  */

  const publishedPosts =
    useMemo(() => {
      return blogPosts.filter(
        isPublishedPost
      );
    }, [blogPosts]);

  /*
  |--------------------------------------------------------------------------
  | CATEGORIES
  |--------------------------------------------------------------------------
  */

  const categories =
    useMemo(() => {
      const values =
        new Set();

      publishedPosts.forEach(
        (post) => {
          const value =
            getCategoryName(
              post
            );

          if (value) {
            values.add(
              value
            );
          }
        }
      );

      return [
        "All",
        ...Array.from(
          values
        ).sort(
          (a, b) =>
            a.localeCompare(
              b
            )
        ),
      ];
    }, [publishedPosts]);

  /*
  |--------------------------------------------------------------------------
  | TRENDING = MOST VIEWED
  |--------------------------------------------------------------------------
  */

  const trendingIds =
    useMemo(() => {
      return new Set(
        [...publishedPosts]
          .sort(
            (a, b) =>
              getViews(b) -
              getViews(a)
          )
          .slice(0, 6)
          .filter(
            (post) =>
              getViews(
                post
              ) > 0
          )
          .map(
            (post) =>
              String(
                post._id
              )
          )
      );
    }, [publishedPosts]);

  /*
  |--------------------------------------------------------------------------
  | FILTER + SEARCH + SORT
  |--------------------------------------------------------------------------
  */

  const filteredPosts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result =
        publishedPosts.filter(
          (post) => {
            /*
             * CATEGORY
             */

            if (
              category !==
                "All" &&
              getCategoryName(
                post
              ) !== category
            ) {
              return false;
            }

            /*
             * FEATURED
             */

            if (
              contentFilter ===
                "featured" &&
              !isFeaturedPost(
                post
              )
            ) {
              return false;
            }

            /*
             * EDITOR CHOICE
             */

            if (
              contentFilter ===
                "editor" &&
              !isEditorChoicePost(
                post
              )
            ) {
              return false;
            }

            /*
             * TRENDING
             */

            if (
              contentFilter ===
                "trending" &&
              !trendingIds.has(
                String(
                  post._id
                )
              )
            ) {
              return false;
            }

            /*
             * NO SEARCH
             */

            if (!query) {
              return true;
            }

            /*
             * SEARCH THROUGH
             * TITLE
             * EXCERPT
             * AUTHOR
             * CATEGORY
             * TAGS
             */

            const searchableText =
              [
                post?.title,
                getPostExcerpt(
                  post
                ),
                getAuthorName(
                  post
                ),
                getCategoryName(
                  post
                ),
                ...getTags(
                  post
                ),
              ]
                .filter(
                  Boolean
                )
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
              query
            );
          }
        );

      /*
       * SORT
       */

      result = [
        ...result,
      ].sort(
        (a, b) => {
          if (
            sortBy ===
            "popular"
          ) {
            return (
              getViews(b) -
              getViews(a)
            );
          }

          const dateA =
            new Date(
              getPostDate(
                a
              ) || 0
            ).getTime();

          const dateB =
            new Date(
              getPostDate(
                b
              ) || 0
            ).getTime();

          if (
            sortBy ===
            "oldest"
          ) {
            return (
              dateA -
              dateB
            );
          }

          return (
            dateB -
            dateA
          );
        }
      );

      return result;
    }, [
      publishedPosts,
      search,
      category,
      contentFilter,
      sortBy,
      trendingIds,
    ]);

  /*
  |--------------------------------------------------------------------------
  | FEATURED POST
  |--------------------------------------------------------------------------
  */

  const featuredPost =
    useMemo(() => {
      const featured =
        publishedPosts.find(
          isFeaturedPost
        );

      if (featured) {
        return featured;
      }

      const editorChoice =
        publishedPosts.find(
          isEditorChoicePost
        );

      if (
        editorChoice
      ) {
        return editorChoice;
      }

      return [
        ...publishedPosts,
      ].sort(
        (a, b) =>
          new Date(
            getPostDate(
              b
            ) || 0
          ).getTime() -
          new Date(
            getPostDate(
              a
            ) || 0
          ).getTime()
      )[0];
    }, [publishedPosts]);

  /*
  |--------------------------------------------------------------------------
  | TOTAL VIEWS
  |--------------------------------------------------------------------------
  */

  const totalViews =
    useMemo(() => {
      return publishedPosts.reduce(
        (
          total,
          post
        ) =>
          total +
          getViews(post),
        0
      );
    }, [publishedPosts]);

  /*
  |--------------------------------------------------------------------------
  | FILTER STATE
  |--------------------------------------------------------------------------
  */

  const activeFilterCount =
    [
      search.trim(),
      category !== "All",
      contentFilter !==
        "all",
      sortBy !== "latest",
    ].filter(Boolean)
      .length;

  const resetFilters =
    () => {
      setSearch("");
      setCategory("All");
      setContentFilter(
        "all"
      );
      setSortBy(
        "latest"
      );
    };

  /*
  |--------------------------------------------------------------------------
  | SEO STRUCTURED DATA
  |--------------------------------------------------------------------------
  */

  const structuredData =
    useMemo(() => {
      return {
        "@context":
          "https://schema.org",

        "@type":
          "CollectionPage",

        name:
          "Target Trek Engineering Blog",

        headline:
          "Software Engineering, System Design, Backend and GenAI Blog",

        description:
          "Practical software engineering articles covering system design, backend development, Java, GenAI and interview preparation.",

        url: BLOG_URL,

        isPartOf: {
          "@type":
            "WebSite",

          name:
            "Target Trek",

          url: SITE_URL,
        },

        mainEntity: {
          "@type":
            "ItemList",

          numberOfItems:
            publishedPosts.length,

          itemListElement:
            publishedPosts
              .slice(
                0,
                100
              )
              .map(
                (
                  post,
                  index
                ) => ({
                  "@type":
                    "ListItem",

                  position:
                    index + 1,

                  url: `${SITE_URL}/blog/${post.slug}`,

                  name:
                    post.title,
                })
              ),
        },
      };
    }, [publishedPosts]);

  /*
  |--------------------------------------------------------------------------
  | FILTER OPTIONS
  |--------------------------------------------------------------------------
  */

  const filterOptions = [
    {
      id: "all",
      label:
        "All Articles",
      icon: FileText,
    },
    {
      id: "featured",
      label:
        "Featured",
      icon: Sparkles,
    },
    {
      id: "editor",
      label:
        "Editor's Choice",
      icon: Star,
    },
    {
      id: "trending",
      label:
        "Trending",
      icon: Flame,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | THEME CLASSES
  |--------------------------------------------------------------------------
  |
  | NO Tailwind dark:
  |
  | Everything is controlled
  | using isDark like your
  | working Footer page.
  |
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

  const inputBg =
    isDark
      ? "bg-[#080D14]"
      : "bg-[#F8FAFC]";

  const selectedButton =
    isDark
      ? "bg-[#F4F7FA] text-[#0B1524]"
      : "bg-[#0B1524] text-white";

  const normalButton =
    isDark
      ? "border-[#1E2C3D] bg-[#080D14] text-[#9AA9BA] hover:border-[#29415B] hover:bg-[#101924] hover:text-[#66B8EA]"
      : "border-[#E1E9F1] bg-[#F5F9FC] text-[#5B6B82] hover:border-[#BFDDF2] hover:bg-[#EAF4FC] hover:text-[#1D5C86]";

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main
      className={`
        min-h-screen
        transition-colors
        duration-300
        ${pageBg}
        ${primaryText}
      `}
    >
      {/* ============================================================= */}
      {/* SEO */}
      {/* ============================================================= */}

      <Helmet>
        <title>
          Software Engineering &
          System Design Blog |
          Target Trek
        </title>

        <meta
          name="description"
          content="Explore practical software engineering articles covering system design, backend development, Java, GenAI, APIs, databases, scalability and interview preparation."
        />

        <meta
          name="keywords"
          content="software engineering blog, system design, backend development, Java, GenAI, HLD, LLD, developer interviews, APIs, databases, scalability"
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large"
        />

        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large"
        />

        <meta
          name="author"
          content="Target Trek"
        />

        <link
          rel="canonical"
          href={BLOG_URL}
        />

        <meta
          property="og:title"
          content="Software Engineering & System Design Blog | Target Trek"
        />

        <meta
          property="og:description"
          content="Practical guides on system design, backend engineering, Java, GenAI, scalability and software engineering interviews."
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:url"
          content={BLOG_URL}
        />

        <meta
          property="og:site_name"
          content="Target Trek"
        />

        <meta
          property="og:locale"
          content="en_IN"
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="Software Engineering & System Design Blog | Target Trek"
        />

        <meta
          name="twitter:description"
          content="Learn system design, backend engineering, Java, GenAI and interview preparation through practical articles."
        />

        <meta
          name="theme-color"
          content={
            isDark
              ? "#080D14"
              : "#F5F9FC"
          }
        />

        <script type="application/ld+json">
          {JSON.stringify(
            structuredData
          )}
        </script>
      </Helmet>

      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      {/* ============================================================= */}
      {/* HERO */}
      {/* ============================================================= */}

      <section
        className={`
          relative
          overflow-hidden
          border-b
          pt-24
          transition-colors
          duration-300
          sm:pt-28
          ${borderColor}
          ${primaryBg}
        `}
      >
        {/* LEFT GLOW */}

        <div
          className={`
            pointer-events-none
            absolute
            -left-40
            -top-40
            h-96
            w-96
            rounded-full
            blur-[120px]
            ${
              isDark
                ? "bg-blue-900/10"
                : "bg-[#E4F1FB]/80"
            }
          `}
        />

        {/* RIGHT GLOW */}

        <div
          className={`
            pointer-events-none
            absolute
            -right-40
            top-12
            h-96
            w-96
            rounded-full
            blur-[120px]
            ${
              isDark
                ? "bg-cyan-900/10"
                : "bg-[#EAF4FC]/80"
            }
          `}
        />

        {/* GRID */}

        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              isDark
                ? "repeating-linear-gradient(90deg, rgba(110,180,220,0.025) 0px, rgba(110,180,220,0.025) 1px, transparent 1px, transparent 42px)"
                : "repeating-linear-gradient(90deg, rgba(29,92,134,0.035) 0px, rgba(29,92,134,0.035) 1px, transparent 1px, transparent 42px)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* SMALL LABEL */}

            <div
              className={`
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                px-4
                py-2
                text-xs
                font-bold
                shadow-sm
                sm:text-sm
                ${borderColor}
                ${
                  isDark
                    ? "bg-blue-950/20 text-[#66B8EA]"
                    : "bg-[#EAF4FC] text-[#1D5C86]"
                }
              `}
            >
              <BookOpen
                size={15}
              />

              Target Trek
              Engineering Blog
            </div>

            {/* TITLE */}

            <h1
              className={`
                text-4xl
                font-black
                tracking-tight
                sm:text-5xl
                lg:text-6xl
                ${primaryText}
              `}
            >
              Learn engineering
              concepts

              <span
                className={`
                  mt-1
                  block
                  ${
                    isDark
                      ? "text-[#66B8EA]"
                      : "text-[#1D5C86]"
                  }
                `}
              >
                that actually
                matter.
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p
              className={`
                mx-auto
                mt-5
                max-w-2xl
                text-base
                leading-7
                sm:text-lg
                ${secondaryText}
              `}
            >
              Practical articles
              on system design,
              backend engineering,
              Java, GenAI,
              scalability,
              databases and
              software engineering
              interview
              preparation.
            </p>

            {/* STATS */}

            {!loading &&
              publishedPosts.length >
                0 && (
                <div
                  className={`
                    mx-auto
                    mt-9
                    grid
                    max-w-2xl
                    grid-cols-3
                    divide-x
                    rounded-2xl
                    border
                    py-4
                    shadow-sm
                    ${borderColor}
                    ${cardBg}
                    ${
                      isDark
                        ? "divide-[#1E2C3D]"
                        : "divide-[#E1E9F1]"
                    }
                  `}
                >
                  <div className="px-3">
                    <p
                      className={`
                        text-xl
                        font-black
                        sm:text-2xl
                        ${primaryText}
                      `}
                    >
                      {
                        publishedPosts.length
                      }
                    </p>

                    <p
                      className={`
                        mt-1
                        text-[11px]
                        font-medium
                        sm:text-xs
                        ${mutedText}
                      `}
                    >
                      Articles
                    </p>
                  </div>

                  <div className="px-3">
                    <p
                      className={`
                        text-xl
                        font-black
                        sm:text-2xl
                        ${primaryText}
                      `}
                    >
                      {Math.max(
                        categories.length -
                          1,
                        0
                      )}
                    </p>

                    <p
                      className={`
                        mt-1
                        text-[11px]
                        font-medium
                        sm:text-xs
                        ${mutedText}
                      `}
                    >
                      Categories
                    </p>
                  </div>

                  <div className="px-3">
                    <p
                      className={`
                        text-xl
                        font-black
                        sm:text-2xl
                        ${primaryText}
                      `}
                    >
                      {formatViews(
                        totalViews
                      )}
                    </p>

                    <p
                      className={`
                        mt-1
                        text-[11px]
                        font-medium
                        sm:text-xs
                        ${mutedText}
                      `}
                    >
                      Views
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* FEATURED ARTICLE */}
      {/* ============================================================= */}

      {!loading &&
        !error &&
        featuredPost && (
          <section
            className={`
              py-10
              transition-colors
              sm:py-12
              ${pageBg}
            `}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* SECTION TITLE */}

              <div className="mb-5 flex items-center gap-2">
                <Sparkles
                  size={20}
                  className={
                    blueText
                  }
                />

                <h2
                  className={`
                    text-lg
                    font-bold
                    ${primaryText}
                  `}
                >
                  Featured Article
                </h2>
              </div>

              {/* FEATURED CARD */}

              <article
                className={`
                  group
                  overflow-hidden
                  rounded-[28px]
                  border
                  transition-all
                  duration-300
                  ${borderColor}
                  ${primaryBg}
                  ${
                    isDark
                      ? "hover:border-[#29415B] hover:shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
                      : "hover:border-[#BFDDF2] hover:shadow-[0_20px_50px_rgba(15,35,58,0.10)]"
                  }
                `}
              >
                <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                  {/* IMAGE */}

                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className={`
                      relative
                      block
                      min-h-[260px]
                      overflow-hidden
                      sm:min-h-[340px]
                      lg:min-h-[420px]
                      ${
                        isDark
                          ? "bg-[#101924]"
                          : "bg-[#F5F9FC]"
                      }
                    `}
                  >
                    <BlogImage
                      post={
                        featuredPost
                      }
                      isDark={
                        isDark
                      }
                      priority
                      className="
                        absolute
                        inset-0
                        transition-transform
                        duration-700
                        group-hover:scale-[1.03]
                      "
                    />
                  </Link>

                  {/* CONTENT */}

                  <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">
                    {/* TAGS */}

                    <div className="mb-5 flex flex-wrap gap-2">
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
                        <Tag
                          size={13}
                        />

                        {getCategoryName(
                          featuredPost
                        )}
                      </span>

                      {isFeaturedPost(
                        featuredPost
                      ) && (
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
                                ? "bg-amber-950/25 text-amber-300"
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

                      {isEditorChoicePost(
                        featuredPost
                      ) && (
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
                                ? "bg-violet-950/25 text-violet-300"
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
                    </div>

                    {/* TITLE */}

                    <Link
                      to={`/blog/${featuredPost.slug}`}
                    >
                      <h2
                        className={`
                          text-2xl
                          font-black
                          leading-tight
                          tracking-tight
                          transition-colors
                          sm:text-3xl
                          lg:text-4xl
                          ${primaryText}
                          ${
                            isDark
                              ? "group-hover:text-[#66B8EA]"
                              : "group-hover:text-[#1D5C86]"
                          }
                        `}
                      >
                        {
                          featuredPost.title
                        }
                      </h2>
                    </Link>

                    {/* EXCERPT */}

                    <p
                      className={`
                        mt-4
                        line-clamp-4
                        text-sm
                        leading-7
                        sm:text-base
                        ${secondaryText}
                      `}
                    >
                      {getPostExcerpt(
                        featuredPost
                      )}
                    </p>

                    {/* META */}

                    <div
                      className={`
                        mt-6
                        flex
                        flex-wrap
                        gap-x-5
                        gap-y-2
                        text-xs
                        font-medium
                        ${mutedText}
                      `}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <User
                          size={14}
                        />

                        {getAuthorName(
                          featuredPost
                        )}
                      </span>

                      {getPostDate(
                        featuredPost
                      ) && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays
                            size={14}
                          />

                          {formatDate(
                            getPostDate(
                              featuredPost
                            )
                          )}
                        </span>
                      )}

                      {getViews(
                        featuredPost
                      ) > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <Eye
                            size={14}
                          />

                          {formatViews(
                            getViews(
                              featuredPost
                            )
                          )}{" "}
                          views
                        </span>
                      )}
                    </div>

                    {/* CTA */}

                    <div className="mt-7">
                      <Link
                        to={`/blog/${featuredPost.slug}`}
                        className={`
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          px-5
                          py-3
                          text-sm
                          font-bold
                          transition-all
                          ${
                            isDark
                              ? "bg-[#1D5C86] text-white hover:bg-[#246F9F]"
                              : "bg-[#0B1524] text-white hover:bg-[#1D5C86]"
                          }
                        `}
                      >
                        Read Full
                        Article

                        <ArrowRight
                          size={17}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>
        )}

      {/* ============================================================= */}
      {/* ALL BLOGS */}
      {/* ============================================================= */}

      <section
        className={`
          pb-20
          pt-8
          transition-colors
          sm:pb-24
          ${pageBg}
        `}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* HEADING */}

          <div className="mb-7">
            <p
              className={`
                text-sm
                font-bold
                uppercase
                tracking-[0.16em]
                ${blueText}
              `}
            >
              Explore
            </p>

            <h2
              className={`
                mt-2
                text-3xl
                font-black
                tracking-tight
                ${primaryText}
              `}
            >
              All Articles
            </h2>

            <p
              className={`
                mt-2
                max-w-2xl
                text-sm
                leading-6
                ${secondaryText}
              `}
            >
              Search engineering
              articles or filter
              them by category,
              popularity and
              editorial selection.
            </p>
          </div>

          {/* ========================================================= */}
          {/* SEARCH / FILTER BOX */}
          {/* ========================================================= */}

          <div
            className={`
              mb-8
              rounded-3xl
              border
              p-4
              shadow-sm
              transition-colors
              sm:p-5
              ${borderColor}
              ${primaryBg}
            `}
          >
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* SEARCH */}

              <div className="relative flex-1">
                <Search
                  size={19}
                  className={`
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    ${mutedText}
                  `}
                />

                <input
                  type="search"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search articles, topics, tags..."
                  aria-label="Search blog articles"
                  className={`
                    h-12
                    w-full
                    rounded-xl
                    border
                    pl-11
                    pr-10
                    text-sm
                    font-medium
                    outline-none
                    transition
                    focus:border-[#2E86C1]
                    focus:ring-4
                    focus:ring-[#2E86C1]/10
                    ${borderColor}
                    ${inputBg}
                    ${primaryText}
                    ${
                      isDark
                        ? "placeholder:text-[#708196]"
                        : "placeholder:text-[#94A3B8]"
                    }
                  `}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch(
                        ""
                      )
                    }
                    aria-label="Clear search"
                    className={`
                      absolute
                      right-3
                      top-1/2
                      flex
                      h-7
                      w-7
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      transition
                      ${mutedText}
                      ${
                        isDark
                          ? "hover:bg-[#172333] hover:text-white"
                          : "hover:bg-slate-200 hover:text-slate-800"
                      }
                    `}
                  >
                    <X
                      size={15}
                    />
                  </button>
                )}
              </div>

              {/* CATEGORY */}

              <div className="relative min-w-[190px]">
                <Tag
                  size={16}
                  className={`
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    ${mutedText}
                  `}
                />

                <select
                  value={category}
                  onChange={(
                    event
                  ) =>
                    setCategory(
                      event.target
                        .value
                    )
                  }
                  aria-label="Filter articles by category"
                  className={`
                    h-12
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    pl-10
                    pr-10
                    text-sm
                    font-semibold
                    outline-none
                    transition
                    focus:border-[#2E86C1]
                    focus:ring-4
                    focus:ring-[#2E86C1]/10
                    ${borderColor}
                    ${inputBg}
                    ${primaryText}
                  `}
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item ===
                        "All"
                          ? "All Categories"
                          : item}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={16}
                  className={`
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    ${mutedText}
                  `}
                />
              </div>

              {/* SORT */}

              <div className="relative min-w-[185px]">
                <SlidersHorizontal
                  size={16}
                  className={`
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    ${mutedText}
                  `}
                />

                <select
                  value={sortBy}
                  onChange={(
                    event
                  ) =>
                    setSortBy(
                      event.target
                        .value
                    )
                  }
                  aria-label="Sort blog articles"
                  className={`
                    h-12
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    pl-10
                    pr-10
                    text-sm
                    font-semibold
                    outline-none
                    transition
                    focus:border-[#2E86C1]
                    focus:ring-4
                    focus:ring-[#2E86C1]/10
                    ${borderColor}
                    ${inputBg}
                    ${primaryText}
                  `}
                >
                  <option value="latest">
                    Latest First
                  </option>

                  <option value="popular">
                    Most Viewed
                  </option>

                  <option value="oldest">
                    Oldest First
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className={`
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    ${mutedText}
                  `}
                />
              </div>
            </div>

            {/* SECONDARY FILTERS */}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {filterOptions.map(
                ({
                  id,
                  label,
                  icon: Icon,
                }) => {
                  const active =
                    contentFilter ===
                    id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        setContentFilter(
                          id
                        )
                      }
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-3.5
                        py-2
                        text-xs
                        font-bold
                        transition
                        sm:text-sm
                        ${
                          active
                            ? `${selectedButton} border-transparent`
                            : normalButton
                        }
                      `}
                    >
                      <Icon
                        size={14}
                      />

                      {label}
                    </button>
                  );
                }
              )}

              {activeFilterCount >
                0 && (
                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className={`
                    ml-auto
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    px-3
                    py-2
                    text-xs
                    font-bold
                    transition
                    ${mutedText}
                    ${
                      isDark
                        ? "hover:bg-red-950/20 hover:text-red-300"
                        : "hover:bg-red-50 hover:text-red-600"
                    }
                  `}
                >
                  <X
                    size={14}
                  />

                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RESULT COUNT */}
          {/* ========================================================= */}

          {!loading &&
            !error && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p
                  className={`
                    text-sm
                    ${mutedText}
                  `}
                >
                  Showing{" "}
                  <span
                    className={`
                      font-bold
                      ${primaryText}
                    `}
                  >
                    {
                      filteredPosts.length
                    }
                  </span>{" "}
                  {filteredPosts.length ===
                  1
                    ? "article"
                    : "articles"}
                </p>

                {sortBy ===
                  "popular" && (
                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      text-xs
                      font-semibold
                      ${mutedText}
                    `}
                  >
                    <BarChart3
                      size={14}
                    />

                    Sorted by
                    views
                  </span>
                )}
              </div>
            )}

          {/* ========================================================= */}
          {/* LOADING */}
          {/* ========================================================= */}

          {loading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: 6,
              }).map(
                (
                  _,
                  index
                ) => (
                  <BlogCardSkeleton
                    key={index}
                    isDark={
                      isDark
                    }
                  />
                )
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ERROR */}
          {/* ========================================================= */}

          {!loading &&
            error && (
              <div
                className={`
                  rounded-3xl
                  border
                  px-6
                  py-12
                  text-center
                  ${
                    isDark
                      ? "border-red-900/50 bg-red-950/15"
                      : "border-red-200 bg-red-50"
                  }
                `}
              >
                <div
                  className={`
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    ${
                      isDark
                        ? "bg-red-950/30 text-red-300"
                        : "bg-red-100 text-red-600"
                    }
                  `}
                >
                  <AlertTriangle
                    size={27}
                  />
                </div>

                <h2
                  className={`
                    mt-5
                    text-xl
                    font-bold
                    ${primaryText}
                  `}
                >
                  Unable to load
                  articles
                </h2>

                <p
                  className={`
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    leading-6
                    ${secondaryText}
                  `}
                >
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    fetchPosts
                  }
                  className={`
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    ${
                      isDark
                        ? "bg-[#1D5C86] hover:bg-[#246F9F]"
                        : "bg-[#0B1524] hover:bg-[#1D5C86]"
                    }
                  `}
                >
                  <RefreshCw
                    size={16}
                  />

                  Try Again
                </button>
              </div>
            )}

          {/* ========================================================= */}
          {/* DATABASE EMPTY */}
          {/* ========================================================= */}

          {!loading &&
            !error &&
            publishedPosts.length ===
              0 && (
              <div
                className={`
                  rounded-3xl
                  border
                  px-6
                  py-16
                  text-center
                  ${borderColor}
                  ${primaryBg}
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
                        ? "bg-blue-950/25 text-[#66B8EA]"
                        : "bg-[#EAF4FC] text-[#1D5C86]"
                    }
                  `}
                >
                  <BookOpen
                    size={30}
                  />
                </div>

                <h2
                  className={`
                    mt-5
                    text-2xl
                    font-bold
                    ${primaryText}
                  `}
                >
                  Articles are
                  coming soon
                </h2>

                <p
                  className={`
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    leading-6
                    ${secondaryText}
                  `}
                >
                  We&apos;re
                  preparing
                  practical
                  engineering
                  guides, interview
                  experiences and
                  system design
                  resources.
                </p>
              </div>
            )}

          {/* ========================================================= */}
          {/* NO FILTER RESULT */}
          {/* ========================================================= */}

          {!loading &&
            !error &&
            publishedPosts.length >
              0 &&
            filteredPosts.length ===
              0 && (
              <div
                className={`
                  rounded-3xl
                  border
                  px-6
                  py-14
                  text-center
                  ${borderColor}
                  ${primaryBg}
                `}
              >
                <div
                  className={`
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    ${cardBg}
                    ${mutedText}
                  `}
                >
                  <Search
                    size={27}
                  />
                </div>

                <h2
                  className={`
                    mt-5
                    text-xl
                    font-bold
                    ${primaryText}
                  `}
                >
                  No matching
                  articles
                </h2>

                <p
                  className={`
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    leading-6
                    ${secondaryText}
                  `}
                >
                  Try another
                  search term or
                  remove some
                  filters.
                </p>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className={`
                    mt-5
                    rounded-xl
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    ${
                      isDark
                        ? "bg-[#1D5C86] hover:bg-[#246F9F]"
                        : "bg-[#0B1524] hover:bg-[#1D5C86]"
                    }
                  `}
                >
                  Reset Filters
                </button>
              </div>
            )}

          {/* ========================================================= */}
          {/* BLOG GRID */}
          {/* ========================================================= */}

          {!loading &&
            !error &&
            filteredPosts.length >
              0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                {filteredPosts.map(
                  (post) => (
                    <BlogCard
                      key={
                        post._id
                      }
                      post={
                        post
                      }
                      isDark={
                        isDark
                      }
                    />
                  )
                )}
              </div>
            )}
        </div>
      </section>

      {/* ============================================================= */}
      {/* SEO / CONTENT FOOTER SECTION */}
      {/* ============================================================= */}

      {!loading &&
        publishedPosts.length >
          0 && (
          <section
            className={`
              border-t
              py-14
              transition-colors
              sm:py-16
              ${borderColor}
              ${primaryBg}
            `}
          >
            <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
              {/* SYSTEM DESIGN */}

              <div>
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
                        ? "bg-blue-950/25 text-[#66B8EA]"
                        : "bg-[#EAF4FC] text-[#1D5C86]"
                    }
                  `}
                >
                  <BookOpen
                    size={20}
                  />
                </div>

                <h2
                  className={`
                    mt-4
                    text-base
                    font-bold
                    ${primaryText}
                  `}
                >
                  System Design
                </h2>

                <p
                  className={`
                    mt-2
                    text-sm
                    leading-6
                    ${secondaryText}
                  `}
                >
                  Learn scalable
                  architecture,
                  HLD, LLD,
                  databases,
                  caching,
                  concurrency and
                  real-world
                  system design.
                </p>
              </div>

              {/* BACKEND */}

              <div>
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
                        ? "bg-violet-950/25 text-violet-300"
                        : "bg-violet-50 text-violet-700"
                    }
                  `}
                >
                  <Sparkles
                    size={20}
                  />
                </div>

                <h2
                  className={`
                    mt-4
                    text-base
                    font-bold
                    ${primaryText}
                  `}
                >
                  Backend &
                  GenAI
                </h2>

                <p
                  className={`
                    mt-2
                    text-sm
                    leading-6
                    ${secondaryText}
                  `}
                >
                  Explore backend
                  engineering,
                  APIs, Java,
                  GenAI, RAG,
                  MCP, agents and
                  practical
                  development
                  concepts.
                </p>
              </div>

              {/* INTERVIEW */}

              <div>
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
                        ? "bg-emerald-950/25 text-emerald-300"
                        : "bg-emerald-50 text-emerald-700"
                    }
                  `}
                >
                  <Clock3
                    size={20}
                  />
                </div>

                <h2
                  className={`
                    mt-4
                    text-base
                    font-bold
                    ${primaryText}
                  `}
                >
                  Interview
                  Preparation
                </h2>

                <p
                  className={`
                    mt-2
                    text-sm
                    leading-6
                    ${secondaryText}
                  `}
                >
                  Prepare for
                  software
                  engineering
                  interviews with
                  practical
                  explanations,
                  experiences and
                  engineering
                  resources.
                </p>
              </div>
            </div>
          </section>
        )}
    </main>
  );
};

export default BlogPage;