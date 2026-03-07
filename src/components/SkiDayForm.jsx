import React, { useState } from "react";
import mountains from "../data/mountains.js";
import StarRating from "./StarRating.jsx";
import { createPost, updatePost } from "../services/firestore.js";
import { uploadPostPhoto } from "../services/storage.js";

function SkiDayForm({ userId, post, onSave, onClose, userProfile }) {
  const isEdit = !!post;
  const [resortId, setResortId] = useState(post?.resortId || "");
  const [date, setDate] = useState(post?.date || "");
  const [notes, setNotes] = useState(post?.notes || "");
  const [rating, setRating] = useState(post?.rating || 0);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const resort = mountains.find((m) => String(m.id) === String(resortId));
      let photoUrls = post?.photoUrls || [];

      if (photoFiles.length > 0) {
        const uploads = await Promise.all(
          photoFiles.map((f) => uploadPostPhoto(userId, f))
        );
        photoUrls = [...photoUrls, ...uploads];
      }

      const data = {
        userId,
        resortId: String(resortId),
        resortName: resort?.name || "",
        date,
        notes,
        rating,
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
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? "Edit Ski Day" : "Log a Ski Day"}</h3>
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
          <label>
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="How was the day?" />
          </label>
          <label>
            Rating
            <StarRating value={rating} onChange={setRating} />
          </label>
          <label>
            Photos
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
