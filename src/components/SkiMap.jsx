import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createMountainIcon = (size, pass) => {
  const sizes = {
    large: { w: 44, h: 38, body: "22,3 38,34 6,34", cap: "22,3 28,15 24,12 20,16 15,13" },
    medium: { w: 36, h: 30, body: "18,3 32,28 4,28", cap: "18,3 23,12 20,10 17,13 12,11" },
    small: { w: 28, h: 24, body: "14,3 25,22 3,22", cap: "14,3 18,10 16,8 13,11 10,9" },
  };
  const passColors = {
    ikon: { body: "#1A1A4E", stroke: "rgba(18,18,58,0.3)" },
    epic: { body: "#F26522", stroke: "rgba(212,85,26,0.3)" },
    independent: { body: "#4a6d8a", stroke: "rgba(58,90,115,0.3)" },
  };
  const s = sizes[size] || sizes.small;
  const c = passColors[pass] || passColors.independent;
  return L.divIcon({
    html: `<svg width="${s.w}" height="${s.h}" viewBox="0 0 ${s.w} ${s.h}" xmlns="http://www.w3.org/2000/svg">
      <polygon points="${s.body}" fill="${c.body}" stroke="${c.stroke}" stroke-width="1" stroke-linejoin="round"/>
      <polygon points="${s.cap}" fill="white" stroke="#c0d4e0" stroke-width="0.5" stroke-linejoin="round"/>
    </svg>`,
    className: "mountain-marker",
    iconSize: [s.w, s.h],
    iconAnchor: [s.w / 2, s.h],
  });
};

const DEFAULT_CENTER = [43.0, -73.5];
const DEFAULT_ZOOM = 6;

function FlyToMountain({ mountain, suppressReset }) {
  const map = useMap();
  useEffect(() => {
    if (mountain) {
      const targetZoom = Math.max(map.getZoom(), 8);
      const mapSize = map.getSize();
      const targetPoint = map.project([mountain.latitude, mountain.longitude], targetZoom);
      // Shift down so the mountain appears in the upper third, above the popup
      const offsetPoint = L.point(targetPoint.x, targetPoint.y + mapSize.y * 0.15);
      const offsetLatLng = map.unproject(offsetPoint, targetZoom);
      map.flyTo(offsetLatLng, targetZoom, { duration: 0.8 });
    } else if (!suppressReset) {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
    }
  }, [mountain, suppressReset, map]);
  return null;
}

export default function SkiMap({ mountains, onMountainClick, selectedMountain, suppressReset }) {
  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FlyToMountain mountain={selectedMountain} suppressReset={suppressReset} />
      {mountains.map((mountain) => (
        <Marker
          key={mountain.id}
          position={[mountain.latitude, mountain.longitude]}
          icon={createMountainIcon(mountain.size, mountain.pass)}
          eventHandlers={{ click: () => onMountainClick(mountain) }}
        >
          <Tooltip direction="top" offset={[0, -10]}>
            <strong>{mountain.name}</strong><br />
            {mountain.state} · {mountain.pass === "ikon" ? "Ikon" : mountain.pass === "epic" ? "Epic" : "Independent"}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}