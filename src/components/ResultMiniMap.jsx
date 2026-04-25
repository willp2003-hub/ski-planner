import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const mountainIcon = L.divIcon({
  html: `<svg width="20" height="18" viewBox="0 0 20 18" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,1 19,17 1,17" fill="#1a1a2e" stroke="rgba(18,18,58,0.3)" stroke-width="1" stroke-linejoin="round"/>
    <polygon points="10,1 13,7 11,6 9,8 7,6" fill="white" stroke="#c0d4e0" stroke-width="0.5" stroke-linejoin="round"/>
  </svg>`,
  className: "mini-map-mountain",
  iconSize: [20, 18],
  iconAnchor: [10, 18],
});

const originIcon = L.divIcon({
  html: `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="5" fill="#4a90d9" stroke="white" stroke-width="2"/>
  </svg>`,
  className: "mini-map-origin",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export default function ResultMiniMap({ mountain, originCoords }) {
  // originCoords is [lon, lat], leaflet needs [lat, lon]
  const originLatLng = useMemo(() => [originCoords[1], originCoords[0]], [originCoords]);
  const mtLatLng = useMemo(() => [mountain.latitude, mountain.longitude], [mountain.latitude, mountain.longitude]);

  const bounds = useMemo(() => {
    const latPad = Math.abs(originLatLng[0] - mtLatLng[0]) * 0.2 + 0.3;
    const lngPad = Math.abs(originLatLng[1] - mtLatLng[1]) * 0.2 + 0.3;
    return [
      [Math.min(originLatLng[0], mtLatLng[0]) - latPad, Math.min(originLatLng[1], mtLatLng[1]) - lngPad],
      [Math.max(originLatLng[0], mtLatLng[0]) + latPad, Math.max(originLatLng[1], mtLatLng[1]) + lngPad],
    ];
  }, [originLatLng, mtLatLng]);

  return (
    <div className="result-mini-map">
      <MapContainer
        bounds={bounds}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        doubleClickZoom={false}
        touchZoom={false}
        style={{ width: "100%", height: "100%", borderRadius: "8px" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Marker position={originLatLng} icon={originIcon} />
        <Marker position={mtLatLng} icon={mountainIcon} />
        <Polyline
          positions={[originLatLng, mtLatLng]}
          pathOptions={{ color: "#4a90d9", weight: 2, dashArray: "6 4", opacity: 0.7 }}
        />
      </MapContainer>
    </div>
  );
}
