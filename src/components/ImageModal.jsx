import React from "react";
import "./ImageModal.css";

export default function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="image-modal" onClick={onClose}>
      <div className="image-modal__backdrop" />

      <div
        className="image-modal__content"
        onClick={(e) => e.stopPropagation()}
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
