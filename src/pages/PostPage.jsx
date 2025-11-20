// src/pages/PostPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import GameFrame from "../components/GameFrame";
import "./PostPage.css";

export default function PostPage() {
  const { id } = useParams();            // /post/:id
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 1) Load the post itself
  useEffect(() => {
    async function fetchPost() {
      setLoadingPost(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading post:", error);
      }
      setPost(data || null);
      setLoadingPost(false);
    }

    fetchPost();
  }, [id]);

  // 2) Load comments for this post
  useEffect(() => {
    async function fetchComments() {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading comments:", error);
        setComments([]);
      } else {
        setComments(data || []);
      }
      setLoadingComments(false);
    }

    fetchComments();
  }, [id]);

  // 3) Add a new comment
  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentBody.trim()) return;

    setAddingComment(true);

    const payload = {
      post_id: id,
      author: commentAuthor.trim() || "Anonymous",
      body: commentBody.trim(),
    };

    const { data, error } = await supabase
      .from("comments")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      alert("Could not add comment. Please try again.");
    } else if (data) {
      setComments((prev) => [...prev, data]);
      setCommentBody("");
      // keep author so they don’t need to retype it
    }

    setAddingComment(false);
  }

  // 4) Upvote from post page
  async function handleLike() {
    if (!post || liking) return;
    setLiking(true);

    const current = post.upvotes ?? 0;
    const newCount = current + 1;

    // optimistic update
    setPost((prev) => (prev ? { ...prev, upvotes: newCount } : prev));

    const { error } = await supabase
      .from("posts")
      .update({ upvotes: newCount })
      .eq("id", id);

    if (error) {
      console.error("Error updating upvotes:", error);
      alert("Could not upvote. Reverting.");
      setPost((prev) => (prev ? { ...prev, upvotes: current } : prev));
    }

    setLiking(false);
  }

  // 5) Delete from post page
  async function handleDelete() {
    if (!post || deleting) return;
    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;

    setDeleting(true);

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting post:", error);
      alert("Could not delete post.");
      setDeleting(false);
      return;
    }

    // After delete, go back to home feed
    navigate("/");
  }

  if (loadingPost) {
    return <section className="post-page"><p>Loading post...</p></section>;
  }

  if (!post) {
    return (
      <section className="post-page">
        <p>Post not found.</p>
        <button
          type="button"
          className="post-page__back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to feed
        </button>
      </section>
    );
  }

  const createdLabel = post.created_at
    ? new Date(post.created_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <section className="post-page">
      <button
        type="button"
        className="post-page__back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="post-page__layout">
        {/* LEFT: frame + image, nice and big */}
        <div className="post-page__media">
          <GameFrame
            variant={post.frame_variant || "neon"}
            title={post.title}
            mediaUrl={post.media_url}
          />
        </div>

        {/* RIGHT: details + comments */}
        <div className="post-page__content">
          <header className="post-page__header">
            <h1 className="post-page__title">{post.title}</h1>

            {post.game && (
              <p className="post-page__game">
                {post.game}
              </p>
            )}

            <p className="post-page__meta-line">
              {post.username && (
                <span className="post-page__user">@{post.username}</span>
              )}
              {post.location && (
                <>
                  <span className="post-page__dot">•</span>
                  <span className="post-page__location">
                    {post.location}
                  </span>
                </>
              )}
              {post.platform && (
                <>
                  <span className="post-page__dot">•</span>
                  <span className="post-page__platform">
                    {post.platform}
                  </span>
                </>
              )}
            </p>

            <p className="post-page__date">{createdLabel}</p>

            <div className="post-page__actions">
              <button
                type="button"
                className="post-page__like-btn"
                onClick={handleLike}
                disabled={liking}
              >
                <span className="post-page__heart" />
                <span>{post.upvotes ?? 0}</span>
              </button>

              <button
                type="button"
                className="post-page__delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                🗑 Delete Post
              </button>
            </div>
          </header>

          {/* COMMENTS */}
          <section className="post-page__comments">
            <h2 className="post-page__section-title">Comments</h2>

            {loadingComments ? (
              <p>Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="post-page__no-comments">
                No comments yet. Be the first to react!
              </p>
            ) : (
              <ul className="post-page__comment-list">
                {comments.map((c) => (
                  <li key={c.id} className="post-page__comment">
                    <div className="post-page__comment-header">
                      <span className="post-page__comment-author">
                        {c.author || "Anonymous"}
                      </span>
                      <span className="post-page__comment-date">
                        {c.created_at &&
                          new Date(c.created_at).toLocaleString("en-US", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                      </span>
                    </div>
                    <p className="post-page__comment-body">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="post-page__comment-form">
  <input
    type="text"
    className="post-page__input"
    placeholder="Your name (optional)"
    value={commentAuthor}
    onChange={(e) => setCommentAuthor(e.target.value)}
  />

  <textarea
    className="post-page__input post-page__input--body"
    placeholder="Write a comment..."
    value={commentBody}
    onChange={(e) => setCommentBody(e.target.value)}
  />

  <button type="submit" className="post-page__comment-submit">
    Post Comment
  </button>
</form>

          </section>
        </div>
      </div>
    </section>
  );
}
