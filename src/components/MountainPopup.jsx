import React from "react";

export default function MountainPopup({ mountain, onClose, originName = "NYC" }) {
  if (!mountain) return null;

  const passName = mountain.pass === "ikon" ? "Ikon" : mountain.pass === "epic" ? "Epic" : "Independent";
  const passColors = { ikon: "#1a1a4e", epic: "#f26522", independent: "#7a8a96" };

  return (
    <div onClick={onClose} style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", background:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"flex-end", zIndex:9999 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background:"white", borderRadius:"20px 20px 0 0", padding:"24px", width:"100%", maxWidth:"500px" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
          <div>
            <h2 style={{ margin:"0 0 8px 0", fontSize:"22px", color:"#1a1a2e" }}>{mountain.name}</h2>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ background:"#e8f4f8", color:"#2d6a7a", padding:"3px 10px", borderRadius:"10px", fontSize:"12px", fontWeight:600 }}>{mountain.state}</span>
              <span style={{ fontSize:"14px", fontWeight:700, color:passColors[mountain.pass] }}>{passName}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"#f0f0f0", border:"none", width:"32px", height:"32px", borderRadius:"50%", fontSize:"18px", cursor:"pointer" }}>✕</button>
        </div>

<div style={{ display:"flex", gap:"12px", marginBottom:"16px" }}>
  {[
    { icon:"🚗", value:mountain.driveFromNYC, label:`From ${originName.split(",")[0]}` },
    { icon:"❄️", value:mountain.snowfallPast7Days, label:"Past 7 Days" },
    { icon:"🏨", value:mountain.costPerNight, label:"Per Night" },
    { icon:"🎟️", value:mountain.liftTicket || "—", label:"Lift Ticket*" },
  ].map(({ icon, value, label }) => (
    <div key={label} style={{ flex:1, background:"#f8f9fa", borderRadius:"12px", padding:"14px", textAlign:"center" }}>
      <div style={{ fontSize:"24px", marginBottom:"6px" }}>{icon}</div>
      <div style={{ fontSize:"16px", fontWeight:700, color:"#1a1a2e", marginBottom:"2px" }}>{value}</div>
      <div style={{ fontSize:"11px", color:"#888", textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</div>
    </div>
  ))}
</div>
<div style={{ fontSize:"11px", color:"#aaa", marginBottom:"16px" }}>*Peak weekend window rate. Buy online in advance to save.</div>
        <div style={{ display:"flex", gap:"12px", marginBottom:"20px" }}>
          <div style={{ flex:1, background:"#f0f7ff", borderRadius:"12px", padding:"14px", textAlign:"center" }}>
            <div style={{ fontSize:"24px", marginBottom:"6px" }}>🏔️</div>
            <div style={{ fontSize:"18px", fontWeight:700, color:"#1a1a2e", marginBottom:"2px" }}>{mountain.seasonSnowTotal || "—"}</div>
            <div style={{ fontSize:"11px", color:"#888", textTransform:"uppercase", letterSpacing:"0.5px" }}>Season Total</div>
          </div>

          <div style={{ flex:1, background: mountain.snowVsAverage >= 100 ? "#f0fff4" : "#fff8f0", borderRadius:"12px", padding:"14px", textAlign:"center" }}>
            <div style={{ fontSize:"24px", marginBottom:"6px" }}>{mountain.snowVsAverage >= 100 ? "📈" : "📉"}</div>
            <div style={{ fontSize:"18px", fontWeight:700, color: mountain.snowVsAverage >= 100 ? "#2d7a4a" : "#c0562a", marginBottom:"2px" }}>
              {mountain.snowVsAverage != null ? `${mountain.snowVsAverage}%` : "—"}
            </div>
            <div style={{ fontSize:"11px", color:"#888", textTransform:"uppercase", letterSpacing:"0.5px" }}>vs 10yr Avg</div>
          </div>

          <div style={{ flex:1, background:"#f8f9fa", borderRadius:"12px", padding:"14px", textAlign:"center" }}>
            <div style={{ fontSize:"24px", marginBottom:"6px" }}>🎿</div>
            <div style={{ fontSize:"18px", fontWeight:700, color:"#1a1a2e", marginBottom:"2px" }}>
              {mountain.openTrails != null ? `${mountain.openTrails}/${mountain.runs}` : `—/${mountain.runs}`}
            </div>
            <div style={{ fontSize:"11px", color:"#888", textTransform:"uppercase", letterSpacing:"0.5px" }}>Trails Open</div>
          </div>
        </div>

        <button style={{ width:"100%", padding:"14px", background:"#4a90d9", color:"white", border:"none", borderRadius:"12px", fontSize:"16px", fontWeight:600, cursor:"pointer" }}>
        <div style={{ display:"flex", gap:"8px", marginBottom:"20px" }}>
  <div style={{ flex:1, background:"#f8f9fa", borderRadius:"12px", padding:"12px", textAlign:"center" }}>
    <div style={{ fontSize:"18px", marginBottom:"4px" }}>📐</div>
    <div style={{ fontSize:"16px", fontWeight:700, color:"#1a1a2e", marginBottom:"2px" }}>{mountain.verticalDrop?.toLocaleString()}'</div>
    <div style={{ fontSize:"11px", color:"#888", textTransform:"uppercase", letterSpacing:"0.5px" }}>Vertical</div>
  </div>
  <div style={{ flex:1, background:"#f8f9fa", borderRadius:"12px", padding:"12px", textAlign:"center" }}>
    <div style={{ fontSize:"18px", marginBottom:"4px" }}>🗺️</div>
    <div style={{ fontSize:"16px", fontWeight:700, color:"#1a1a2e", marginBottom:"2px" }}>{mountain.skiableAcres?.toLocaleString()}</div>
    <div style={{ fontSize:"11px", color:"#888", textTransform:"uppercase", letterSpacing:"0.5px" }}>Acres</div>
  </div>
  <div style={{ flex:2, background:"#f8f9fa", borderRadius:"12px", padding:"12px" }}>
    <div style={{ fontSize:"11px", color:"#888", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"6px", textAlign:"center" }}>Difficulty</div>
    <div style={{ display:"flex", height:"10px", borderRadius:"5px", overflow:"hidden", gap:"2px" }}>
      <div style={{ width:`${mountain.difficulty?.green}%`, background:"#4caf50", borderRadius:"5px 0 0 5px" }} />
      <div style={{ width:`${mountain.difficulty?.blue}%`, background:"#2196f3" }} />
      <div style={{ width:`${mountain.difficulty?.black}%`, background:"#333", borderRadius:"0 5px 5px 0" }} />
    </div>
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:"4px" }}>
      <span style={{ fontSize:"10px", color:"#4caf50", fontWeight:700 }}>⬤ {mountain.difficulty?.green}%</span>
      <span style={{ fontSize:"10px", color:"#2196f3", fontWeight:700 }}>⬤ {mountain.difficulty?.blue}%</span>
      <span style={{ fontSize:"10px", color:"#333", fontWeight:700 }}>⬤ {mountain.difficulty?.black}%</span>
    </div>
  </div>
</div>
          Plan This Trip 🎿
        </button>
      </div>
    </div>
  );
}