import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getUserProfile, createPost } from "../services/firestore.js";
import { uploadPostPhoto } from "../services/storage.js";
import mountains from "../data/mountains.js";
import StarRating from "../components/StarRating.jsx";

function LogSkiDayPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [resortId, setResortId] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [ratings, setRatings] = useState({ conditions: 0, crowds: 0, terrain: 0, overall: 0 });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getUserProfile(user.uid).then(setUserProfile).catch(() => {});
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const resort = mountains.find((m) => String(m.id) === String(resortId));
      let photoUrls = [];

      if (photoFiles.length > 0) {
        photoUrls = await Promise.all(
          photoFiles.map((f) => uploadPostPhoto(user.uid, f))
        );
      }

      const data = {
        userId: user.uid,
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

      await createPost(data);
      navigate(`/profile/${user.uid}`);
    } catch (err) {
      console.error("Failed to save post:", err);
      setError(err.message || "Failed to save post");
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="log-ski-day-page">
      <div className="log-ski-day-card">
        <h2>Log a Ski Day</h2>
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
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LogSkiDayPage;
