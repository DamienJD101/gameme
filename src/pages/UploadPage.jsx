// src/pages/UploadPage.jsx
import React, { useState } from "react";
import "./UploadPage.css";
import { supabase } from "../supabaseClient";

const initialForm = {
  title: "",
  game: "",
  username: "",
  location: "",
  platform: "Console",
  frame_variant: "neon", // "neon" | "cartridge" | "screen"
  media_type: "image",   // local-only: "image" or "gif"
  image_url: "",
  gif_search: "",
  gif_url: "",
};

export default function UploadPage({ onCreatePost }) {
  const [form, setForm] = useState(initialForm);
  const [gifResults, setGifResults] = useState([]);
  const [isSearchingGifs, setIsSearchingGifs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const giphyApiKey = import.meta.env.VITE_GIPHY_API_KEY;

  // ---------- helpers ----------

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleMediaTypeChange(e) {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, media_type: value }));
  }

  async function handleSearchGifs(e) {
    e.preventDefault();
    if (!form.gif_search.trim() || !giphyApiKey) return;

    try {
      setIsSearchingGifs(true);

      const params = new URLSearchParams({
        api_key: giphyApiKey,
        q: form.gif_search,
        limit: "12",
        rating: "pg-13",
      });

      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?${params.toString()}`
      );

      if (!res.ok) {
        console.error("GIPHY error:", await res.text());
        return;
      }

      const json = await res.json();
      setGifResults(json.data || []);
    } catch (err) {
      console.error("Error fetching GIFs:", err);
    } finally {
      setIsSearchingGifs(false);
    }
  }

  function handlePickGif(url) {
    setForm((prev) => ({
      ...prev,
      gif_url: url,
      media_type: "gif",
    }));
  }

  // ---------- submit to Supabase ----------

  async function handleSubmit(e) {
    e.preventDefault();

    // basic client-side validation
    if (!form.title.trim()) {
      alert("Please add a title.");
      return;
    }
    if (!form.username.trim()) {
      alert("Please add a username.");
      return;
    }

    // Decide which URL goes into media_url
    let mediaUrl = null;
    if (form.media_type === "gif") {
      mediaUrl = (form.gif_url || "").trim();
    } else {
      mediaUrl = (form.image_url || "").trim();
    }

    if (!mediaUrl) {
      alert("Please provide an image URL or pick a GIF.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: form.title.trim(),
      game: form.game.trim() || null,
      username: form.username.trim(),
      location: form.location.trim() || null,
      platform: form.platform || null,
      frame_variant: form.frame_variant || null,
      media_url: mediaUrl, // 👈 only column used for media in Supabase
      // upvotes uses its default in the DB
    };

    console.log("UploadPage submitting payload:", payload); // 👈 DEBUG

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Error inserting post:", error);
        alert(
          "Something went wrong saving your post:\n" +
            (error.message || JSON.stringify(error))
        );
        return;
      }

      // Optional: let parent know so it can prepend the new post
      if (onCreatePost) {
        onCreatePost(data);
      }

      alert("Screenshot posted! 🎮");
      setForm(initialForm);
      setGifResults([]);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert(
        "Something went wrong saving your post:\n" +
          (err.message || String(err))
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---------- render ----------

  return (
    <section className="upload-page">
      <header className="upload-header">
        <h1 className="upload-title">Upload Screenshot</h1>
        <p className="upload-subtitle">
          Share your funniest, sweatiest, and most cursed gaming moments with
          the GameMe community.
        </p>
      </header>

      <form className="upload-form" onSubmit={handleSubmit}>
        {/* LEFT COLUMN: main fields */}
        <div className="upload-form__main">
          <label className="upload-field">
            <span className="upload-label">Title</span>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="upload-input"
              required
            />
          </label>

          <label className="upload-field">
            <span className="upload-label">Game</span>
            <input
              type="text"
              name="game"
              value={form.game}
              onChange={handleChange}
              className="upload-input"
            />
          </label>

          <label className="upload-field">
            <span className="upload-label">Username</span>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="upload-input"
              placeholder="@you"
              required
            />
          </label>

          <label className="upload-field">
            <span className="upload-label">Location</span>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="upload-input"
              placeholder="City, Country"
            />
          </label>

          <div className="upload-field upload-field--row">
            <label className="upload-field">
              <span className="upload-label">Platform</span>
              <select
                name="platform"
                value={form.platform}
                onChange={handleChange}
                className="upload-select"
              >
                <option value="Console">Console</option>
                <option value="PC">PC</option>
                <option value="Handheld">Handheld</option>
                <option value="Arcade">Arcade</option>
              </select>
            </label>

            <label className="upload-field">
              <span className="upload-label">Frame Style</span>
              <select
                name="frame_variant"
                value={form.frame_variant}
                onChange={handleChange}
                className="upload-select"
              >
                <option value="neon">Neon Frame</option>
                <option value="cartridge">Cartridge Frame</option>
                <option value="screen">Purple Screen</option>
              </select>
            </label>
          </div>

          {/* Media type toggle */}
          <div className="upload-media-toggle">
            <span className="upload-label">Media Type</span>
            <div className="upload-toggle-group">
              <label className="upload-toggle">
                <input
                  type="radio"
                  name="media_type"
                  value="image"
                  checked={form.media_type === "image"}
                  onChange={handleMediaTypeChange}
                />
                <span>Image URL</span>
              </label>
              <label className="upload-toggle">
                <input
                  type="radio"
                  name="media_type"
                  value="gif"
                  checked={form.media_type === "gif"}
                  onChange={handleMediaTypeChange}
                />
                <span>GIF Search</span>
              </label>
            </div>
          </div>

          {/* Image URL field */}
          {form.media_type === "image" && (
            <label className="upload-field">
              <span className="upload-label">Image URL</span>
              <input
                type="url"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                className="upload-input"
                placeholder="https://example.com/your-screenshot.png"
              />
            </label>
          )}

          {/* GIF search + selection */}
          {form.media_type === "gif" && (
            <>
              <label className="upload-field">
                <span className="upload-label">Search GIFs</span>
                <div className="upload-gif-search-row">
                  <input
                    type="text"
                    name="gif_search"
                    value={form.gif_search}
                    onChange={handleChange}
                    className="upload-input"
                    placeholder="e.g. mario fail, fighting game KO..."
                  />
                  <button
                    type="button"
                    className="upload-btn upload-btn--secondary"
                    onClick={handleSearchGifs}
                    disabled={isSearchingGifs || !giphyApiKey}
                  >
                    {isSearchingGifs ? "Searching..." : "Find GIFs"}
                  </button>
                </div>
              </label>

              {gifResults.length > 0 && (
                <div className="upload-gif-grid">
                  {gifResults.map((gif) => {
                    const url =
                      gif.images?.downsized_medium?.url ||
                      gif.images?.original?.url;
                    return (
                      <button
                        key={gif.id}
                        type="button"
                        className={
                          "upload-gif-thumb" +
                          (form.gif_url === url ? " upload-gif-thumb--active" : "")
                        }
                        onClick={() => handlePickGif(url)}
                      >
                        <img src={url} alt={gif.title} />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN: preview + submit */}
        <aside className="upload-form__side">
          <div className="upload-preview">
            <span className="upload-label">Preview</span>
            <div className="upload-preview__frame">
              {form.media_type === "gif" && form.gif_url && (
                <img
                  src={form.gif_url}
                  alt="GIF preview"
                  className="upload-preview__img"
                />
              )}
              {form.media_type === "image" && form.image_url && (
                <img
                  src={form.image_url}
                  alt="Image preview"
                  className="upload-preview__img"
                />
              )}
              {!form.image_url && !form.gif_url && (
                <div className="upload-preview__placeholder">
                  Your screenshot / GIF will appear here.
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="upload-btn upload-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading..." : "Post to GameMe"}
          </button>
        </aside>
      </form>
    </section>
  );
}
