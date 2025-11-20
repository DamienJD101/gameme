// src/pages/ProfilePage.jsx
import React from "react";
import "./ProfilePage.css";
import profilePic from "../assets/profile-pixel.png"; // rename your uploaded image to this

export default function ProfilePage() {
  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* Avatar */}
        <div className="profile-avatar">
          <img src={profilePic} alt="Profile" />
        </div>

        {/* Name */}
        <h1 className="profile-name">Carl Toadstool</h1>
        <p className="profile-handle">@carltoadstool</p>

        {/* Stats / Info */}
        <div className="profile-info">
          <div className="info-row">
            <span className="info-label">DOB</span>
            <span className="info-value">Feb 5, 1989</span>
          </div>

          <div className="info-row">
            <span className="info-label">Location</span>
            <span className="info-value">El Paso, TX</span>
          </div>

          <div className="info-row">
            <span className="info-label">Platform</span>
            <span className="info-chip">Console</span>
          </div>

          <div className="info-row">
            <span className="info-label">Favorite Video Game</span>
            <span className="info-value">Legend of Zelda</span>
          </div>
        </div>

        {/* Bio */}
        <div className="profile-bio">
          <h2>Bio</h2>
          <p>
            Hey there! I’m just your average gamer who spends way too much time
            chasing high scores, laughing at cursed memes, and pretending I
            “totally meant to do that” when I fall off a map. When I’m not
            grinding through quests or collecting digital loot, I’m usually
            swapping screenshots, sharing reactions, or posting overly dramatic
            reviews of boss fights. I’m here for good vibes, funny moments, and
            the occasional rage-quit story. If it makes me laugh, I’m probably
            hitting the “Like” button. Game on! 🎮🔥
          </p>
        </div>

      </div>
    </div>
  );
}
