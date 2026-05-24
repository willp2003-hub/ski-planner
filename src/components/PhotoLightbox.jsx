import React, { useEffect } from "react";

function PhotoLightbox({ photos, index, onClose, onNav }) {
  // Close on Escape, arrow keys to navigate
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < photos.length - 1) onNav(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, photos.length, onClose, onNav]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>

      {index > 0 && (
        <button
          className="lightbox-nav lightbox-prev"
          onClick={(e) => { e.stopPropagation(); onNav(index - 1); }}
        >
          ‹
        </button>
      )}

      <img
        src={photos[index]}
        alt={`Photo ${index + 1}`}
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />

      {index < photos.length - 1 && (
        <button
          className="lightbox-nav lightbox-next"
          onClick={(e) => { e.stopPropagation(); onNav(index + 1); }}
        >
          ›
        </button>
      )}

      {photos.length > 1 && (
        <div className="lightbox-dots">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`lightbox-dot ${i === index ? "active" : ""}`}
              onClick={(e) => { e.stopPropagation(); onNav(i); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PhotoLightbox;
