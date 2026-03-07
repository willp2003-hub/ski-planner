import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getUserProfile, getUserPosts, deletePost, getUserTrips, deleteTrip } from "../services/firestore.js";
import mountains from "../data/mountains.js";
import ProfileForm from "../components/ProfileForm.jsx";
import SkiDayForm from "../components/SkiDayForm.jsx";
import SkiDayCard from "../components/SkiDayCard.jsx";
import SeasonSelector from "../components/SeasonSelector.jsx";
import StatsSummaryBar from "../components/StatsSummaryBar.jsx";
import ProfileMiniMap from "../components/ProfileMiniMap.jsx";
import GearSection from "../components/GearSection.jsx";
import TripCard from "../components/TripCard.jsx";
import TripForm from "../components/TripForm.jsx";
import { getCurrentSeasonYear, getSeasonRange } from "../utils/seasons.js";

function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.uid === userId;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showSkiDayForm, setShowSkiDayForm] = useState(false);
  const [showTripForm, setShowTripForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeasonYear());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prof, userPosts, userTrips] = await Promise.all([
          getUserProfile(userId),
          getUserPosts(userId),
          isOwner ? getUserTrips(userId) : Promise.resolve([]),
        ]);
        setProfile(prof);
        setPosts(userPosts);
        setTrips(userTrips);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, isOwner]);

  const filteredPosts = useMemo(() => {
    const range = getSeasonRange(selectedSeason);
    return posts.filter((p) => p.date >= range.start && p.date <= range.end);
  }, [posts, selectedSeason]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this ski day?")) return;
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handlePostSave = (saved) => {
    if (editingPost) {
      setPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    } else {
      setPosts((prev) => [saved, ...prev]);
    }
    setShowSkiDayForm(false);
    setEditingPost(null);
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Delete this trip?")) return;
    await deleteTrip(tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  const handleTripSave = (saved) => {
    if (editingTrip) {
      setTrips((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    } else {
      setTrips((prev) => [saved, ...prev]);
    }
    setShowTripForm(false);
    setEditingTrip(null);
  };

  const homeResort = profile?.homeResortId
    ? mountains.find((m) => String(m.id) === String(profile.homeResortId))
    : null;

  if (loading) {
    return <div className="profile-page"><p className="loading-text">Loading profile...</p></div>;
  }

  if (error) {
    return <div className="profile-page"><p className="loading-text">Error: {error}</p></div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        {profile?.profilePhotoUrl ? (
          <img src={profile.profilePhotoUrl} alt="Profile" className="profile-photo" />
        ) : (
          <div className="profile-photo placeholder">
            {(profile?.displayName || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="profile-info">
          <h2>{profile?.displayName || "Unnamed Skier"}</h2>
          {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
          <div className="profile-meta">
            {homeResort && <span>Home: {homeResort.name}</span>}
            {profile?.passType && <span className={`pass-badge ${profile.passType}`}>{profile.passType}</span>}
            {profile?.riderType && <span className="rider-badge">{profile.riderType === "both" ? "Skier & Snowboarder" : profile.riderType === "skier" ? "Skier" : "Snowboarder"}</span>}
          </div>
        </div>
        {isOwner && (
          <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
            <button className="btn-secondary" onClick={() => setShowProfileForm(true)}>
              Edit Profile
            </button>
            <button className="btn-secondary btn-danger" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        )}
      </div>

      <StatsSummaryBar posts={filteredPosts} mountains={mountains} />

      <ProfileMiniMap posts={filteredPosts} mountains={mountains} />

      <div className="profile-posts">
        <div className="posts-header">
          <h3>Ski Days ({filteredPosts.length})</h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <SeasonSelector posts={posts} selectedSeason={selectedSeason} onSeasonChange={setSelectedSeason} />
            {isOwner && (
              <button className="btn-primary" onClick={() => { setEditingPost(null); setShowSkiDayForm(true); }}>
                + Log Ski Day
              </button>
            )}
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <p className="empty-state">
            {isOwner ? "No ski days logged this season. Hit the button above to add your first!" : "No ski days logged this season."}
          </p>
        ) : (
          filteredPosts.map((post) => (
            <SkiDayCard
              key={post.id}
              post={post}
              isOwner={isOwner}
              onEdit={(p) => { setEditingPost(p); setShowSkiDayForm(true); }}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>

      {isOwner && (
        <div className="profile-posts" style={{ marginTop: 24 }}>
          <div className="posts-header">
            <h3>Trips ({trips.length})</h3>
            <button className="btn-primary" onClick={() => { setEditingTrip(null); setShowTripForm(true); }}>
              + Plan Trip
            </button>
          </div>
          {trips.length === 0 ? (
            <p className="empty-state">No trips planned yet.</p>
          ) : (
            trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isOwner={isOwner}
                onEdit={(t) => { setEditingTrip(t); setShowTripForm(true); }}
                onDelete={handleDeleteTrip}
              />
            ))
          )}
        </div>
      )}

      <GearSection
        uid={userId}
        gear={profile?.gear || []}
        isOwner={isOwner}
        onUpdate={(gear) => setProfile((prev) => ({ ...prev, gear }))}
      />

      {showProfileForm && (
        <ProfileForm
          uid={userId}
          profile={profile}
          onSave={(updated) => { setProfile(updated); setShowProfileForm(false); }}
          onClose={() => setShowProfileForm(false)}
        />
      )}

      {showSkiDayForm && (
        <SkiDayForm
          userId={userId}
          post={editingPost}
          onSave={handlePostSave}
          onClose={() => { setShowSkiDayForm(false); setEditingPost(null); }}
          userProfile={profile}
        />
      )}

      {showTripForm && (
        <TripForm
          userId={userId}
          trip={editingTrip}
          onSave={handleTripSave}
          onClose={() => { setShowTripForm(false); setEditingTrip(null); }}
        />
      )}
    </div>
  );
}

export default ProfilePage;
