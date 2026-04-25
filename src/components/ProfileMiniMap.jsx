import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ProfileMiniMap({ posts, mountains }) {
  const visited = useMemo(() => {
    const resortIds = new Set(posts.map((p) => p.resortId));
    return mountains.filter((m) => resortIds.has(String(m.id)));
  }, [posts, mountains]);

  const validVisited = visited.filter(
    (m) => m.latitude != null && m.longitude != null && !isNaN(m.latitude) && !isNaN(m.longitude)
  );

  if (validVisited.length === 0) return null;

  const lats = validVisited.map((m) => m.latitude);
  const lngs = validVisited.map((m) => m.longitude);
  const bounds = [
    [Math.min(...lats) - 0.5, Math.min(...lngs) - 0.5],
    [Math.max(...lats) + 0.5, Math.max(...lngs) + 0.5],
  ];

  return (
    <div className="profile-mini-map">
      <MapContainer
        bounds={bounds}
        style={{ height: 200, width: "100%", borderRadius: 12 }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        {validVisited.map((m) => (
          <CircleMarker
            key={m.id}
            center={[m.latitude, m.longitude]}
            radius={6}
            pathOptions={{ color: "#1a1a2e", fillColor: "#2d3561", fillOpacity: 0.8, weight: 2 }}
          >
            <Tooltip>{m.name}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default ProfileMiniMap;
