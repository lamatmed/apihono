import React from "react";

const HomePage = () => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9f9f9"
  }}>
    <div style={{
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 2px 8px #0001",
      padding: 32,
      textAlign: "center",
      maxWidth: 600
    }}>
      <h1 style={{ color: "#2d7ff9" }}>Bienvenue sur l'API Tasks</h1>
      <p style={{ color: "#333" }}>Consultez la documentation OpenAPI&nbsp;:</p>
      <a
        href="/doc"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: 24,
          padding: "10px 20px",
          background: "#2d7ff9",
          color: "#fff",
          borderRadius: 4,
          textDecoration: "none",
          transition: "background 0.2s"
        }}
        onMouseOver={e => (e.currentTarget.style.background = "#195bb5")}
        onMouseOut={e => (e.currentTarget.style.background = "#2d7ff9")}
      >
        Voir la documentation
      </a>
    </div>
  </div>
);

export default HomePage; 