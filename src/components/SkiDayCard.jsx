import React from "react";
import StarRating from "./StarRating.jsx";

function SkiDayCard({ post, isOwner, onEdit, onDelete }) {
  return (
    <div className="ski-day-card">
      <div className="ski-day-header">
        <div>
          <h4>{post.resortName}</h4>
          <span className="ski-day-date">{post.date}</span>
        </div>
        <StarRating value={post.ratings?.overall ?? post.rating} readOnly />
      </div>

      {post.ratings && (
        <div className="ratings-display">
          {[["conditions", "Conditions"], ["crowds", "Crowds"], ["terrain", "Terrain"]].map(([key, label]) => (
            post.ratings[key] > 0 && (
              <div key={key} className="rating-row-display">
                <span className="rating-label-display">{label}</span>
                <StarRating value={post.ratings[key]} readOnly />
              </div>
            )
          ))}
        </div>
      )}

      {post.notes && <p className="ski-day-notes">{post.notes}</p>}

      {post.photoUrls?.length > 0 && (
        <div className="ski-day-photos">
          {post.photoUrls.map((url, i) => (
            <img key={i} src={url} alt={`Ski day photo ${i + 1}`} />
          ))}
        </div>
      )}

      {isOwner && (
        <div className="ski-day-actions">
          <button onClick={() => onEdit(post)}>Edit</button>
          <button onClick={() => onDelete(post.id)} className="btn-danger">Delete</button>
        </div>
      )}
    </div>
  );
}

export default SkiDayCard;
