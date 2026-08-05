import React, { useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating.jsx";
import PhotoLightbox from "./PhotoLightbox.jsx";
import HeicSafeImage from "./HeicSafeImage.jsx";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function FeedCard({ post }) {
  const [showSubRatings, setShowSubRatings] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const subRatings = [
    ["Conditions", post.ratings?.conditions],
    ["Crowds", post.ratings?.crowds],
    ["Terrain", post.ratings?.terrain],
  ].filter(([, val]) => val > 0);

  return (
    <div className="feed-card">
      {/* User row */}
      <div className="feed-user-row">
        <Link to={`/profile/${post.userId}`} className="feed-user-link">
          {post.userProfilePhotoUrl ? (
            <img src={post.userProfilePhotoUrl} alt="" className="feed-avatar" />
          ) : (
            <div className="feed-avatar placeholder">
              {(post.userDisplayName || "?")[0].toUpperCase()}
            </div>
          )}
          <span className="feed-username">{post.userDisplayName || "Skier"}</span>
        </Link>
        <span className="ski-day-date">{formatDate(post.date)}</span>
      </div>

      {/* Title row: resort + overall stars + dropdown toggle */}
      <div className="feed-title-row">
        <h4 className="feed-resort-name">{post.resortName}</h4>
        <div className="feed-rating-group">
          <StarRating value={post.ratings?.overall ?? post.rating} readOnly />
          {subRatings.length > 0 && (
            <button
              className={`feed-rating-toggle ${showSubRatings ? "open" : ""}`}
              onClick={() => setShowSubRatings((v) => !v)}
              title="Show detailed ratings"
            >
              ▾
            </button>
          )}
        </div>
      </div>

      {/* Dropdown sub-ratings */}
      {showSubRatings && (
        <div className="feed-subratings">
          {subRatings.map(([label, val]) => (
            <div key={label} className="rating-row-display">
              <span className="rating-label-display">{label}</span>
              <StarRating value={val} readOnly />
            </div>
          ))}
        </div>
      )}

      {/* Body: notes on left, photo on right */}
      {(post.notes || post.photoUrls?.length > 0) && (
        <div className="feed-body">
          {post.notes && <p className="ski-day-notes feed-notes">{post.notes}</p>}
          {post.photoUrls?.length > 0 && (
            <div className="feed-photo">
              <HeicSafeImage
                src={post.photoUrls[0]}
                alt="Ski day"
                className="clickable-photo"
                onClick={() => setLightboxIndex(0)}
              />
            </div>
          )}
        </div>
      )}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={post.photoUrls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={setLightboxIndex}
        />
      )}
    </div>
  );
}

export default FeedCard;
