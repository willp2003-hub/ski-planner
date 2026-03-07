import React, { useState } from "react";
import { saveUserProfile } from "../services/firestore.js";

const CATEGORIES = ["skis", "boots", "bindings", "poles", "helmet", "goggles", "other"];

function GearSection({ uid, gear, isOwner, onUpdate }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("skis");
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const save = async (updated) => {
    await saveUserProfile(uid, { gear: updated });
    onUpdate(updated);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await save([...gear, { name: name.trim(), category }]);
    setName("");
    setCategory("skis");
  };

  const handleDelete = async (index) => {
    await save(gear.filter((_, i) => i !== index));
  };

  const handleEditSave = async (index) => {
    const updated = gear.map((g, i) =>
      i === index ? { name: editName.trim(), category: editCategory } : g
    );
    await save(updated);
    setEditIndex(null);
  };

  return (
    <div className="gear-section">
      <h3>Gear</h3>
      {gear.length === 0 && !isOwner && <p className="empty-state">No gear listed.</p>}
      <div className="gear-list">
        {gear.map((item, i) => (
          <div key={i} className="gear-item">
            {editIndex === i ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => handleEditSave(i)}>Save</button>
                <button onClick={() => setEditIndex(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span className="gear-name">{item.name}</span>
                <span className="gear-category-badge">{item.category}</span>
                {isOwner && (
                  <span className="gear-actions">
                    <button onClick={() => { setEditIndex(i); setEditName(item.name); setEditCategory(item.category); }}>Edit</button>
                    <button onClick={() => handleDelete(i)}>Delete</button>
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      {isOwner && (
        <form className="gear-add-form" onSubmit={handleAdd}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Gear name..."
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="btn-primary">Add</button>
        </form>
      )}
    </div>
  );
}

export default GearSection;
