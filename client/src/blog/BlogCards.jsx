/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, Sparkles, Star } from "lucide-react";
import { fmtDate, initials, isoDate, titleCase, truncate } from "./blogUtils.js";

/* Cards shared by /blogs and /blog/:slug. */


export function Media({ post, eager = false, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" }) {
  const [failed, setFailed] = useState(false);
  const src = post?.imageUrl;
  return (
    <span className="bl-media">
      {src && !failed ? (
        <img
          src={src}
          alt={post.altText || post.title || ""}
          loading={eager ? "eager" : "lazy"}
          fetchpriority={eager ? "high" : undefined}
          decoding="async"
          sizes={sizes}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="bl-media-fallback" aria-hidden="true">
          <span>{titleCase(post?.category || "Target Trek")}</span>
          <strong>{post?.title}</strong>
        </span>
      )}
    </span>
  );
}

export function PostCard({ post, as: H = "h3" }) {
  return (
    <article className="bl-card">
      <Link to={`/blog/${post.slug}`} aria-label={post.title} tabIndex={-1}>
        <Media post={post} />
      </Link>
      <div className="bl-card-body">
        <div className="bl-card-top">
          <Link to={`/blogs?category=${encodeURIComponent(post.category)}`} className="bl-kicker">
            {titleCase(post.category)}
          </Link>
          {post.editorChoice ? (
            <span className="bl-badge"><Star size={11} fill="currentColor" /> Editor&apos;s pick</span>
          ) : post.isFeatured ? (
            <span className="bl-badge"><Sparkles size={11} /> Featured</span>
          ) : null}
        </div>
        <H>
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </H>
        {post.excerpt && <p>{truncate(post.excerpt, 180)}</p>}
        <div className="bl-card-foot">
          <span className="bl-card-author">
            <span className="bl-avatar" aria-hidden="true">{initials(post.author)}</span>
            <span>{post.author}</span>
          </span>
          <span className="bl-meta">
            <span><Clock3 size={13} /> {post.readingTimeMinutes || 1} min</span>
            {post.publishedAt && <time dateTime={isoDate(post.publishedAt)}>{fmtDate(post.publishedAt, { day: "numeric", month: "short" })}</time>}
          </span>
        </div>
      </div>
    </article>
  );
}
