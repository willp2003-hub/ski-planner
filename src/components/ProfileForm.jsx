import React, { useState } from "react";
import mountains from "../data/mountains.js";
import { saveUserProfile } from "../services/firestore.js";
import { uploadProfilePhoto } from "../services/storage.js";

function ProfileForm({ uid, profile, onSave, onClose }) {
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [homeResortId, setHomeResortId] = useState(profile?.homeResortId || "");
  const [passType, setPassType] = useState(profile?.passType || "");
  const [riderType, setRiderType] = useState(profile?.riderType || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let profilePhotoUrl = profile?.profilePhotoUrl || "";
      if (photoFile) {
        profilePhotoUrl = await uploadProfilePhoto(uid, photoFile);
      }
      const data = { displayName, bio, homeResortId, passType, riderType, profilePhotoUrl };
      await saveUserProfile(uid, data);
      onSave({ ...profile, ...data });
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError(err.message || "Failed to save profile");
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>&times;</button>
        <h3>Edit Profile</h3>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Display Name
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </label>
          <label>
            Bio
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </label>
          <label>
            Profile Photo
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
          </label>
          <label>
            Home Resort
            <select value={homeResortId} onChange={(e) => setHomeResortId(e.target.value)}>
              <option value="">None</option>
              {mountains.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
          <label>
            Pass Type
            <select value={passType} onChange={(e) => setPassType(e.target.value)}>
              <option value="">None</option>
              <option value="ikon">Ikon</option>
              <option value="epic">Epic</option>
              <option value="independent">Independent</option>
            </select>
          </label>
          <label>
            Rider Type
            <select value={riderType} onChange={(e) => setRiderType(e.target.value)}>
              <option value="">Not specified</option>
              <option value="skier">Skier</option>
              <option value="snowboarder">Snowboarder</option>
              <option value="both">Both</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;
