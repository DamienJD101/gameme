// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import GameCard from "./components/GameCard";
import UploadPage from "./pages/UploadPage";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";        // 👈 make sure this import exists
import "./App.css";
import { supabase } from "./supabaseClient";

const FRAME_VARIANTS = ["neon", "cartridge", "screen"];

function randomFrame() {
  return FRAME_VARIANTS[Math.floor(Math.random() * FRAME_VARIANTS.length)];
}

/**
 * Simple fullscreen image modal.
 * Styling lives in CSS (.image-modal, .image-modal__backdrop, etc.)
 */
function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="image-modal" onClick={onClose}>
      <div className="image-modal__backdrop" />

      <div
        className="image-modal__content"
        onClick={(e) => e.stopPropagation()} // prevent close when clicking image
      >
        <button
          type="button"
          className="image-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <img
          src={imageUrl}
          alt="Screenshot preview"
          className="image-modal__img"
        />
      </div>
    </div>
  );
}

export default function App() {
  const [posts, setPosts] = useState([]);
  const [filterMode, setFilterMode] = useState("newest"); // "newest" | "top"
  const [modalImage, setModalImage] = useState(null);
  const navigate = useNavigate();

  // Initial load from Supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading posts:", error);
      } else {
        console.log("App fetched posts:", data);
        setPosts(data || []);
      }
    })();
  }, []);

  // Called when UploadPage successfully creates a post
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setFilterMode("newest");
    navigate("/"); // go back to Home
  };

  // Handle likes with optimistic UI + Supabase update
  const handleLike = async (postId) => {
    const current = posts.find((p) => p.id === postId)?.upvotes ?? 0;
    const newCount = current + 1;

    // optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: newCount } : p))
    );

    try {
      const { error } = await supabase
        .from("posts")
        .update({ upvotes: newCount })
        .eq("id", postId);

      if (error) {
        console.error("Error updating upvotes:", error);
        // rollback
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, upvotes: current } : p))
        );
      }
    } catch (err) {
      console.error("Unexpected error updating upvotes:", err);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, upvotes: current } : p))
      );
    }
  };

  // Delete handler with confirmation + optimistic UI
  const handleDelete = async (postId) => {
    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;

    const previousPosts = posts;
    // optimistic remove
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) {
        console.error("Error deleting post:", error);
        alert("Could not delete post. Restoring it.");
        setPosts(previousPosts);
      }
    } catch (err) {
      console.error("Unexpected error deleting post:", err);
      alert("Something went wrong deleting the post. Restoring it.");
      setPosts(previousPosts);
    }
  };

  // Sorting & slicing for Newest / Top Rated
  let displayPosts = [...posts];

  if (filterMode === "newest") {
    displayPosts.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    displayPosts = displayPosts.slice(0, 10); // last 10 newest
  } else if (filterMode === "top") {
    displayPosts.sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));
    displayPosts = displayPosts.slice(0, 10); // top 10
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        {/* HERO / TOP BANNER */}
        <section className="app-hero">
          <header className="app-header">
            <div className="app-header__brand">
              <div className="app-header__text">
                <h1 className="app-title">GameMe: Gaming Screenshot Forum</h1>
                <p className="app-subtitle">
                  Share your funniest, sweatiest, and most cursed gaming
                  moments.
                </p>
              </div>
            </div>
          </header>

          <section className="app-toolbar">
            <div className="toolbar-group">
              <button
                className="toolbar-btn toolbar-btn--primary"
                onClick={() => navigate("/upload")}
              >
                + Upload Screenshot
              </button>

              <button
                className={
                  "toolbar-btn toolbar-btn--filter" +
                  (filterMode === "newest"
                    ? " toolbar-btn--filter-active"
                    : "")
                }
                onClick={() => setFilterMode("newest")}
              >
                Newest
              </button>

              <button
                className={
                  "toolbar-btn toolbar-btn--filter" +
                  (filterMode === "top"
                    ? " toolbar-btn--filter-active"
                    : "")
                }
                onClick={() => setFilterMode("top")}
              >
                Top Rated
              </button>
            </div>

            <div className="toolbar-group toolbar-group--search">
              <input
                className="toolbar-search"
                type="text"
                placeholder="Search by game or title..."
              />
              <button className="toolbar-btn toolbar-btn--search">
                🔍 Search
              </button>
            </div>
          </section>
        </section>

        {/* MAIN CONTENT */}
        <section className="app-content">
          <Routes>
            {/* HOME FEED */}
            <Route
              path="/"
              element={
                <div className="card-grid">
                  {displayPosts.map((post) => (
                    <GameCard
                      key={post.id}
                      title={post.title}
                      game={post.game}
                      username={post.username}
                      location={post.location}
                      platform={post.platform}
                      upvotes={post.upvotes ?? 0}
                      frameVariant={post.frame_variant || randomFrame()}
                      imageUrl={post.media_url}
                      createdAt={post.created_at}
                      onLike={() => handleLike(post.id)}
                      onImageClick={(url) => setModalImage(url)}
                      onDelete={() => handleDelete(post.id)}
                      // 👇 NEW: open the dedicated post page
                      onOpenPost={() => navigate(`/post/${post.id}`)}
                    />
                  ))}
                </div>
              }
            />

            {/* SINGLE POST PAGE */}
            <Route path="/post/:id" element={<PostPage />} />

            {/* UPLOAD PAGE */}
            <Route
              path="/upload"
              element={<UploadPage onCreatePost={handlePostCreated} />}
            />

            {/* PROFILE PAGE */}
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </section>

        {/* FULLSCREEN IMAGE MODAL */}
        <ImageModal
          imageUrl={modalImage}
          onClose={() => setModalImage(null)}
        />
      </main>
    </div>
  );
}
