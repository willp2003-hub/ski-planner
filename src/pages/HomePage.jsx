import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import SkiMap from "../components/SkiMap.jsx";
import MountainPopup from "../components/MountainPopup.jsx";
import TripForm from "../components/TripForm.jsx";
import mountains from "../data/mountains.js";
import getSnowfallData from "../services/weather.js";
import getDriveTimes from "../services/driving.js";
import { useAuth } from "../contexts/AuthContext.jsx";

function HomePage() {
  const { user } = useAuth();
  const [selectedMountain, setSelectedMountain] = useState(null);
  const [passFilter, setPassFilter] = useState("all");
  const [mountainData, setMountainData] = useState(mountains);
  const [loading, setLoading] = useState(true);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [origin, setOrigin] = useState({ name: "New York, NY", coords: [-74.006, 40.7484] });
  const [showTripForm, setShowTripForm] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const withSnow = await getSnowfallData(mountains);
        const withDrive = await getDriveTimes(withSnow, origin.coords);
        setMountainData(withDrive);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const handleLocationChange = async (newOrigin) => {
    setOrigin(newOrigin);
    setLoadingDrive(true);
    try {
      const withDrive = await getDriveTimes(mountainData, newOrigin.coords);
      setMountainData(withDrive);
    } catch (error) {
      console.error("Failed to fetch drive times:", error);
    }
    setLoadingDrive(false);
  };

  const filteredMountains =
    passFilter === "all"
      ? mountainData
      : mountainData.filter((m) => m.pass === passFilter);

  return (
    <div className="home-page">
      <div className="map-container">
        <SkiMap mountains={filteredMountains} onMountainClick={setSelectedMountain} />
        <div className="filter-bar">
          <button className={`filter-btn ikon ${passFilter === "ikon" ? "active" : ""}`} onClick={() => setPassFilter(passFilter === "ikon" ? "all" : "ikon")}>
            Ikon ({mountainData.filter((m) => m.pass === "ikon").length})
          </button>
          <button className={`filter-btn epic ${passFilter === "epic" ? "active" : ""}`} onClick={() => setPassFilter(passFilter === "epic" ? "all" : "epic")}>
            Epic ({mountainData.filter((m) => m.pass === "epic").length})
          </button>
          <button className={`filter-btn indie ${passFilter === "independent" ? "active" : ""}`} onClick={() => setPassFilter(passFilter === "independent" ? "all" : "independent")}>
            Independent ({mountainData.filter((m) => m.pass === "independent").length})
          </button>
        </div>
        <h1 className="map-title">Pray for Snow</h1>
        <button className="plan-trip-btn" onClick={() => setShowTripForm(true)}>
          Where to Shred
        </button>
        <div className="mountain-count">
          {loading ? "\u23f3 Fetching live data..." : <><strong>{filteredMountains.length}</strong> mountains \u00b7 Live data \u2713</>}
        </div>
      </div>

      <MountainPopup mountain={selectedMountain} onClose={() => setSelectedMountain(null)} originName={origin.name} />

      {showTripForm && (
        user ? (
          <TripForm
            userId={user.uid}
            onSave={() => setShowTripForm(false)}
            onClose={() => setShowTripForm(false)}
            onLocationChange={handleLocationChange}
          />
        ) : (
          <div className="modal-overlay" onClick={() => setShowTripForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Sign in required</h3>
              <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>Please log in to plan a trip.</p>
              <div className="form-actions">
                <button onClick={() => setShowTripForm(false)}>Close</button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default HomePage;
