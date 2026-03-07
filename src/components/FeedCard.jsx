import React from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating.jsx";

function FeedCard({ post }) {
  return (
    <div className="feed-card">
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
        <span className="ski-day-date">{post.date}</span>
      </div>

      <div className="ski-day-header">
        <h4>{post.resortName}</h4>
        <StarRating value={post.rating} readOnly />
      </div>

      {post.notes && <p className="ski-day-notes">{post.notes}</p>}

      {post.photoUrls?.length > 0 && (
        <div className="ski-day-photos">
          {post.photoUrls.map((url, i) => (
            <img key={i} src={url} alt={`Ski day photo ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FeedCard;
