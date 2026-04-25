import React from "react";

const passColors = {
  ikon: { body: "#1A1A4E", stroke: "rgba(18,18,58,0.3)" },
  epic: { body: "#F26522", stroke: "rgba(212,85,26,0.3)" },
  independent: { body: "#4a6d8a", stroke: "rgba(58,90,115,0.3)" },
};

function MountainIcon({ pass, size = 20 }) {
  const c = passColors[pass] || passColors.independent;
  const h = Math.round(size * 0.86);
  return (
    <svg width={size} height={h} viewBox="0 0 28 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <polygon points="14,3 25,22 3,22" fill={c.body} stroke={c.stroke} strokeWidth="1" strokeLinejoin="round" />
      <polygon points="14,3 18,10 16,8 13,11 10,9" fill="white" stroke="#c0d4e0" strokeWidth="0.5" strokeLinejoin="round" />
    </svg>
  );
}

export default MountainIcon;
