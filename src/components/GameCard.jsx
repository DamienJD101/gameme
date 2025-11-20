// src/components/GameCard.jsx
import React from "react";
import "./GameCard.css";
import GameFrame from "./GameFrame";

export default function GameCard({
  title,
  game,
  username,
  location,
  platform,
  upvotes,
  frameVariant,
  imageUrl,
  createdAt,
  onLike,
  onImageClick,
  onDelete,
  onOpenPost,      // 👈 add this
}) {
  const dateLabel = React.useMemo(() => {
    if (!createdAt) return "";
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "";
    return d
      .toLocaleString("en-US", { month: "short", year: "numeric" })
      .toUpperCase();
  }, [createdAt]);

  const handleImageClick = () => {
    if (onImageClick && imageUrl) onImageClick(imageUrl);
  };

  const handleLikeClick = () => {
    if (onLike) onLike();
  };

  const handleDeleteClick = () => {
    if (onDelete) onDelete();
  };

  const handleOpenPost = () => {
    if (onOpenPost) onOpenPost();
  };

  return (
    <article className="game-card">
      {/* Frame + screenshot (still opens modal on click) */}
      <GameFrame
        variant={frameVariant}
        title={title}
        mediaUrl={imageUrl}
        onClick={handleImageClick}
      />

      {/* Metadata block under the frame */}
      <div className="game-card__meta">
        {/* 👇 click title to go to post page */}
        <h2
          className="game-card__title"
          onClick={handleOpenPost}
        >
          {title}
        </h2>

        {game && (
          <p className="game-card__line game-card__game">
            {game}
          </p>
        )}

        {username && (
          <p className="game-card__line game-card__user">
            @{username}
          </p>
        )}

        <div className="game-card__detail">
          {platform && (
            <span className="game-card__detail-item">
              {platform.toUpperCase()}
            </span>
          )}
          {location && (
            <>
              <span className="game-card__dot">•</span>
              <span className="game-card__detail-item">
                {location.toUpperCase()}
              </span>
            </>
          )}
        </div>

        <div className="game-card__footer">
          {platform && (
            <span className="game-card__chip">
              {platform.toUpperCase()}
            </span>
          )}

          {dateLabel && (
            <span className="game-card__date">{dateLabel}</span>
          )}

          <button
            type="button"
            className="game-card__delete"
            onClick={handleDeleteClick}
          >
            🗑 Delete
          </button>

          <button
            type="button"
            className="game-card__like"
            onClick={handleLikeClick}
          >
            <span className="game-card__heart" />
            <span className="game-card__likes">{upvotes ?? 0}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
