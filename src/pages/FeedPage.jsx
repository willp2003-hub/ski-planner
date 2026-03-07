import React, { useState, useEffect } from "react";
import { getAllRecentPosts } from "../services/firestore.js";
import FeedCard from "../components/FeedCard.jsx";

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllRecentPosts(50)
      .then(setPosts)
      .catch((err) => console.error("Failed to load feed:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="feed-page">
      <h1>Community Feed</h1>
      {loading ? (
        <p className="loading-text">Loading feed...</p>
      ) : posts.length === 0 ? (
        <p className="empty-state">No ski days posted yet. Be the first!</p>
      ) : (
        posts.map((post) => <FeedCard key={post.id} post={post} />)
      )}
    </div>
  );
}

export default FeedPage;
