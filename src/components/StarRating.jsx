import React from "react";

function StarRating({ value = 0, onChange, readOnly = false }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? "filled" : ""} ${readOnly ? "" : "interactive"}`}
          onClick={() => !readOnly && onChange?.(star)}
        >
          {star <= value ? "\u2605" : "\u2606"}
        </span>
      ))}
    </div>
  );
}

export default StarRating;
