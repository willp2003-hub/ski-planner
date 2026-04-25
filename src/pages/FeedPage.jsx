import React, { useState, useEffect, useMemo } from "react";
import { getAllRecentPosts } from "../services/firestore.js";
import FeedCard from "../components/FeedCard.jsx";
import mountains from "../data/mountains.js";
import { useAuth } from "../contexts/AuthContext.jsx";

function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mountainFilter, setMountainFilter] = useState("");
  const [userFilter, setUserFilter] = useState("all"); // "all" | "known" | "unknown"
  const [minRating, setMinRating] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getAllRecentPosts(50)
      .then(setPosts)
      .catch((err) => console.error("Failed to load feed:", err))
      .finally(() => setLoading(false));
  }, []);

  const mountainNames = useMemo(() => {
    const fromPosts = posts.map((p) => p.resortName).filter(Boolean);
    const fromData = mountains.map((m) => m.name);
    return [...new Set([...fromPosts, ...fromData])].sort();
  }, [posts]);

  const knownUserIds = useMemo(() => {
    if (!user) return new Set();
    return new Set([user.uid]);
  }, [user]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (mountainFilter && post.resortName !== mountainFilter) return false;

      if (userFilter === "known" && !knownUserIds.has(post.userId)) return false;
      if (userFilter === "unknown" && knownUserIds.has(post.userId)) return false;

      const rating = post.ratings?.overall ?? post.rating ?? 0;
      if (rating < minRating) return false;

      if (dateFrom && post.date < dateFrom) return false;
      if (dateTo && post.date > dateTo) return false;

      return true;
    });
  }, [posts, mountainFilter, userFilter, minRating, dateFrom, dateTo, knownUserIds]);

  const activeCount = [mountainFilter, userFilter !== "all", minRating > 0, dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="feed-page">
      <h1>Community Feed</h1>

      <button
        type="button"
        className="feed-filter-toggle"
        onClick={() => setShowFilters(!showFilters)}
      >
        Filters{activeCount > 0 ? ` (${activeCount})` : ""} {showFilters ? "▲" : "▼"}
      </button>

      {showFilters && (
        <div className="feed-filter-bar">
          <div className="feed-filter-row">
            <label className="feed-filter-label">
              Mountain
              <select value={mountainFilter} onChange={(e) => setMountainFilter(e.target.value)} className="feed-filter-select">
                <option value="">All Mountains</option>
                {mountainNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
            <label className="feed-filter-label">
              Posted By
              <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="feed-filter-select">
                <option value="all">Everyone</option>
                <option value="known">My Posts</option>
                <option value="unknown">Others</option>
              </select>
            </label>
          </div>
          <div className="feed-filter-row">
            <label className="feed-filter-label">
              Min Rating
              <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="feed-filter-select">
                <option value={0}>Any</option>
                <option value={1}>★+</option>
                <option value={2}>★★+</option>
                <option value={3}>★★★+</option>
                <option value={4}>★★★★+</option>
                <option value={5}>★★★★★</option>
              </select>
            </label>
            <label className="feed-filter-label">
              From
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="feed-filter-input" />
            </label>
            <label className="feed-filter-label">
              To
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="feed-filter-input" />
            </label>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              className="feed-filter-clear"
              onClick={() => { setMountainFilter(""); setUserFilter("all"); setMinRating(0); setDateFrom(""); setDateTo(""); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading feed...</p>
      ) : filteredPosts.length === 0 ? (
        <p className="empty-state">{posts.length > 0 ? "No posts match your filters." : "No ski days posted yet. Be the first!"}</p>
      ) : (
        filteredPosts.map((post) => <FeedCard key={post.id} post={post} />)
      )}
    </div>
  );
}

export default FeedPage;
