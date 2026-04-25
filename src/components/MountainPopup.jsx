import React from "react";
import { Link } from "react-router-dom";

export default function MountainPopup({ mountain, onClose, originName = "NYC", onPlanTrip }) {
  if (!mountain) return null;

  const passName = mountain.pass === "ikon" ? "Ikon" : mountain.pass === "epic" ? "Epic" : "Independent";
  const passColors = { ikon: "#1a1a4e", epic: "#f26522", independent: "#7a8a96" };

  const iconSizes = {
    large: { w: 44, h: 38, body: "22,3 38,34 6,34", cap: "22,3 28,15 24,12 20,16 15,13" },
    medium: { w: 36, h: 30, body: "18,3 32,28 4,28", cap: "18,3 23,12 20,10 17,13 12,11" },
    small: { w: 28, h: 24, body: "14,3 25,22 3,22", cap: "14,3 18,10 16,8 13,11 10,9" },
  };
  const iconColors = { ikon: "#1A1A4E", epic: "#F26522", independent: "#4a6d8a" };
  const s = iconSizes[mountain.size] || iconSizes.small;
  const c = iconColors[mountain.pass] || iconColors.independent;

  const stat = (icon, value, label, bg) => (
    <div style={{ flex:1, background: bg || "#f8f9fa", borderRadius:"10px", padding:"8px 6px", textAlign:"center", minWidth:0 }}>
      <div style={{ fontSize:"16px", marginBottom:"2px" }}>{icon}</div>
      <div style={{ fontSize:"13px", fontWeight:700, color:"#1a1a2e", whiteSpace:"nowrap" }}>{value}</div>
      <div style={{ fontSize:"9px", color:"#888", textTransform:"uppercase", letterSpacing:"0.3px" }}>{label}</div>
    </div>
  );

  return (
    <div style={{ position:"fixed", bottom:0, left:0, width:"100%", zIndex:9999, pointerEvents:"none" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background:"white", borderRadius:"16px 16px 0 0", padding:"14px 16px", width:"100%", boxShadow:"0 -4px 20px rgba(0,0,0,0.15)", pointerEvents:"auto" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <svg width={s.w} height={s.h} viewBox={`0 0 ${s.w} ${s.h}`}>
              <polygon points={s.body} fill={c} stroke={`${c}4d`} strokeWidth="1" strokeLinejoin="round" />
              <polygon points={s.cap} fill="white" stroke="#c0d4e0" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 style={{ margin:0, fontSize:"18px", color:"#1a1a2e" }}>{mountain.name}</h2>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"2px" }}>
                <span style={{ background:"#e8f4f8", color:"#2d6a7a", padding:"2px 8px", borderRadius:"8px", fontSize:"11px", fontWeight:600 }}>{mountain.state}</span>
                <span style={{ fontSize:"12px", fontWeight:700, color:passColors[mountain.pass] }}>{passName}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"#f0f0f0", border:"none", width:"28px", height:"28px", borderRadius:"50%", fontSize:"14px", cursor:"pointer", flexShrink:0 }}>✕</button>
        </div>

        <div style={{ display:"flex", gap:"6px", marginBottom:"6px" }}>
          {stat("🚗", mountain.driveFromNYC, `From ${originName.split(",")[0]}`)}
          {stat("❄️", mountain.snowfallPast7Days, "7-Day Snow")}
          {stat("🏔️", mountain.currentBase || "—", "Base", "#f0f7ff")}
          {stat(mountain.snowVsAverage >= 100 ? "📈" : "📉",
            mountain.snowVsAverage != null ? `${mountain.snowVsAverage}%` : "—",
            "10yr Avg",
            mountain.snowVsAverage >= 100 ? "#f0fff4" : "#fff8f0")}
          {stat("🎿", mountain.openTrails != null ? `${mountain.openTrails}/${mountain.runs}` : `—/${mountain.runs}`, "Trails")}
        </div>

        <div style={{ display:"flex", gap:"6px", marginBottom:"8px" }}>
          {stat("🎟️", mountain.liftTicket || "—", "Lift Ticket")}
          {stat("🏨", mountain.costPerNight, "Per Night")}
          {stat("📐", `${mountain.verticalDrop?.toLocaleString()}'`, "Vertical")}
          {stat("🗺️", mountain.skiableAcres?.toLocaleString(), "Acres")}
          <div style={{ flex:2, background:"#f8f9fa", borderRadius:"10px", padding:"8px 10px", minWidth:0 }}>
            <div style={{ fontSize:"9px", color:"#888", textTransform:"uppercase", letterSpacing:"0.3px", marginBottom:"4px", textAlign:"center" }}>Difficulty</div>
            <div style={{ display:"flex", height:"8px", borderRadius:"4px", overflow:"hidden", gap:"1px" }}>
              <div style={{ width:`${mountain.difficulty?.green}%`, background:"#4caf50", borderRadius:"4px 0 0 4px" }} />
              <div style={{ width:`${mountain.difficulty?.blue}%`, background:"#2196f3" }} />
              <div style={{ width:`${mountain.difficulty?.black}%`, background:"#333", borderRadius:"0 4px 4px 0" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:"3px" }}>
              <span style={{ fontSize:"9px", color:"#4caf50", fontWeight:700 }}>⬤{mountain.difficulty?.green}%</span>
              <span style={{ fontSize:"9px", color:"#2196f3", fontWeight:700 }}>⬤{mountain.difficulty?.blue}%</span>
              <span style={{ fontSize:"9px", color:"#333", fontWeight:700 }}>⬤{mountain.difficulty?.black}%</span>
            </div>
          </div>
        </div>

        <button onClick={() => { if (onPlanTrip) onPlanTrip(); }} style={{ width:"100%", padding:"10px", background:"#1a1a2e", color:"white", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:600, cursor:"pointer" }}>
          Plan This Trip
        </button>
        <Link to="/feed" style={{ display:"block", textAlign:"center", marginTop:"8px", fontSize:"13px", color:"#1a1a2e", fontWeight:600, textDecoration:"none" }}>
          See Reviews →
        </Link>
      </div>
    </div>
  );
}
