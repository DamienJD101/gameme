// src/components/GameFrame.jsx
import React from "react";
import "./GameFrame.css";

import frameNeon from "../assets/frame-neon.png";
import frameCartridge from "../assets/frame-cartridge.png";
import frameScreen from "../assets/frame-screen.png";

const FRAME_SOURCES = {
  neon: frameNeon,
  cartridge: frameCartridge,
  screen: frameScreen,
};

export default function GameFrame({
  variant = "neon",
  title,
  mediaUrl,
  onClick,
}) {
  const src = FRAME_SOURCES[variant] || FRAME_SOURCES.neon;

  console.log("GameFrame mediaUrl:", mediaUrl, "variant:", variant, "title:", title);

  return (
    <div
      className={`game-frame game-frame--${variant} ${onClick ? "game-frame--clickable" : ""
        }`}
      onClick={onClick}
      aria-label={title}
    >
      <img
        src={src}
        alt={title || `GameMe ${variant} frame`}
        className="game-frame__img"
        draggable="false"
      />

      {mediaUrl && (
        <div className="game-frame__content">
          <div className="game-frame__screen">
            <img
              src={mediaUrl}
              alt={title || "Screenshot"}
              className="game-frame__media"
              draggable="false"
            />
          </div>
        </div>
      )}

    </div>
  );
}
