// src/Sidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import logo from "./assets/GAMEMELOGO.png"; // 👈 your logo path

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-inner">
          <img src={logo} alt="GameMe logo" className="sidebar__logo-img" />
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={
            "sidebar-item" + (isActive("/") ? " sidebar-item--active" : "")
          }
          onClick={() => navigate("/")}
        >
          <span className="sidebar-item__bullet">▶</span>
          <span className="sidebar-item__label">Home</span>
        </button>

        <button
          className={
            "sidebar-item" + (isActive("/upload") ? " sidebar-item--active" : "")
          }
          onClick={() => navigate("/upload")}
        >
          <span className="sidebar-item__bullet">▶</span>
          <span className="sidebar-item__label">Upload</span>
        </button>

        <button className="sidebar-item">
          <span className="sidebar-item__bullet">▶</span>
          <span className="sidebar-item__label">Gallery</span>
        </button>

        <button
          className={
            "sidebar-item" +
            (isActive("/profile") ? " sidebar-item--active" : "")
          }
          onClick={() => navigate("/profile")}
        >
          <span className="sidebar-item__bullet">▶</span>
          <span className="sidebar-item__label">My Profile</span>
        </button>

        <button className="sidebar-item">
          <span className="sidebar-item__bullet">▶</span>
          <span className="sidebar-item__label">Settings</span>
        </button>
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__footer-text">PRESS START _</span>
      </div>
    </aside>
  );
}
