// src/components/GifPicker.jsx
import React, { useEffect, useState } from "react";
import "./GifPicker.css";

const API_KEY = import.meta.env.VITE_GIPHY_API_KEY;

export default function GifPicker({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("gaming");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    // Load default "gaming" GIFs when the picker opens
    fetchGifs("gaming");
  }, [isOpen]);

  const fetchGifs = async (searchTerm) => {
    if (!API_KEY) {
      setError("Missing GIPHY API key.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const url = new URL("https://api.giphy.com/v1/gifs/search");
      url.searchParams.set("api_key", API_KEY);
      url.searchParams.set("q", searchTerm);
      url.searchParams.set("limit", "24");
      url.searchParams.set("rating", "pg-13"); // keep it tame
      url.searchParams.set("lang", "en");

      const res = await fetch(url.toString());
      const data = await res.json();

      setResults(data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load GIFs. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchGifs(query.trim());
    }
  };

  const handleGifClick = (gif) => {
    // pick the "downsized" or "original" URL for embedding
    const url =
      gif.images?.downsized_medium?.url ||
      gif.images?.original?.url ||
      gif.url;

    if (onSelect && url) {
      onSelect(url);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="gifpicker-backdrop" onClick={onClose}>
      <div
        className="gifpicker-panel"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <header className="gifpicker-header">
          <h3 className="gifpicker-title">Search Gaming GIFs</h3>
          <button
            type="button"
            className="gifpicker-close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <form className="gifpicker-search" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: clutch, boss fight, combo, rage quit..."
          />
          <button type="submit">Search</button>
        </form>

        {error && <p className="gifpicker-error">{error}</p>}

        {isLoading ? (
          <p className="gifpicker-loading">Loading GIFs…</p>
        ) : (
          <div className="gifpicker-grid">
            {results.map((gif) => (
              <button
                type="button"
                key={gif.id}
                className="gifpicker-gif-btn"
                onClick={() => handleGifClick(gif)}
              >
                <img
                  src={gif.images?.fixed_width_small?.url}
                  alt={gif.title || "GIF"}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        <footer className="gifpicker-footer">
          <span className="gifpicker-powered">Powered by</span>
          <img
            src="https://developers.giphy.com/static/img/dev-logo-lg.7404c00322a8.gif"
            alt="GIPHY"
            className="gifpicker-giphy-logo"
          />
        </footer>
      </div>
    </div>
  );
}
