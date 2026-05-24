import React, { useState } from "react";
import mountains from "../data/mountains.js";
import StarRating from "./StarRating.jsx";
import { createPost, updatePost } from "../services/firestore.js";
import { uploadPostPhoto } from "../services/storage.js";
import { convertIfHeic } from "../utils/convertHeic.js";

function SkiDayForm({ userId, post, onSave, onClose, userProfile }) {
  const isEdit = !!post;
  const [resortId, setResortId] = useState(post?.resortId || "");
  const [date, setDate] = useState(post?.date || "");
  const [notes, setNotes] = useState(post?.notes || "");
  const [ratings, setRatings] = useState(post?.ratings || { conditions: 0, crowds: 0, terrain: 0, overall: 0 });
  const [existingPhotos, setExistingPhotos] = useState(post?.photoUrls || []);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const resort = mountains.find((m) => String(m.id) === String(resortId));
      let photoUrls = existingPhotos;

      if (photoFiles.length > 0) {
        const converted = await Promise.all(photoFiles.map(convertIfHeic));
        const uploads = await Promise.all(converted.map((f) => uploadPostPhoto(userId, f)));
        photoUrls = [...photoUrls, ...uploads];
      }

      const data = {
        userId,
        resortId: String(resortId),
        resortName: resort?.name || "",
        date,
        notes,
        ratings,
        rating: ratings.overall,
        photoUrls,
        userDisplayName: userProfile?.displayName || "",
        userProfilePhotoUrl: userProfile?.profilePhotoUrl || "",
      };

      if (isEdit) {
        await updatePost(post.id, data);
        onSave({ ...post, ...data });
      } else {
        const id = await createPost(data);
        onSave({ id, ...data });
      }
    } catch (err) {
      console.error("Failed to save post:", err);
      setError(err.message || "Failed to save post");
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? "Edit Ski Day" : "Log a Ski Day"}</h3>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Resort
            <select value={resortId} onChange={(e) => setResortId(e.target.value)} required>
              <option value="">Select resort...</option>
              {mountains.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.state})</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <div className="ratings-group">
            <span className="ratings-group-title">Ratings</span>
            {[["conditions", "Conditions"], ["crowds", "Crowds"], ["terrain", "Terrain"], ["overall", "Overall"]].map(([key, label]) => (
              <div key={key} className="rating-row">
                <span className="rating-label">{label}</span>
                <StarRating value={ratings[key]} onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))} />
              </div>
            ))}
          </div>
          <label>
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="How was the day?" />
          </label>

          {existingPhotos.length > 0 && (
            <div className="existing-photos">
              <span className="existing-photos-label">Current Photos</span>
              <div className="existing-photos-grid">
                {existingPhotos.map((url, i) => (
                  <div key={i} className="existing-photo-thumb">
                    <img src={url} alt={`Photo ${i + 1}`} />
                    <button
                      type="button"
                      className="existing-photo-remove"
                      onClick={() => setExistingPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      title="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label>
            {existingPhotos.length > 0 ? "Add More Photos" : "Photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
            />
          </label>
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SkiDayForm;
