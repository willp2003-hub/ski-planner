import React from "react";

function SnowChart({ data }) {
  if (!data || data.length === 0) return null;

  const width = 500;
  const height = 220;
  const padL = 45;
  const padR = 20;
  const padT = 28;
  const padB = 45;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const maxTotal = Math.max(...data.map((d) => d.total), 0.5);
  const yMax = Math.ceil(maxTotal + 0.5);

  const x = (i) => padL + (i / (data.length - 1)) * chartW;
  const y = (val) => padT + chartH - (val / yMax) * chartH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.total).toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L${x(data.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;

  // Y-axis ticks
  const yTicks = [];
  const tickStep = yMax <= 2 ? 0.5 : yMax <= 5 ? 1 : Math.ceil(yMax / 4);
  for (let v = 0; v <= yMax; v += tickStep) yTicks.push(parseFloat(v.toFixed(1)));

  return (
    <div className="snow-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="snow-chart">
        {/* Grid lines */}
        {yTicks.map((val) => (
          <g key={val}>
            <line x1={padL} y1={y(val)} x2={width - padR} y2={y(val)} stroke="#eee" strokeWidth="1" />
            <text x={padL - 8} y={y(val) + 4} textAnchor="end" fontSize="10" fill="#999">{val}"</text>
          </g>
        ))}

        {/* X-axis day labels */}
        {data.map((d, i) => {
          const dt = new Date(d.date + "T00:00:00");
          const label = dt.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
          return (
            <text key={d.date} x={x(i)} y={height - 8} textAnchor="middle" fontSize="9" fill="#999">{label}</text>
          );
        })}

        {/* Fill area */}
        <path d={fillPath} fill="rgba(91,155,213,0.15)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#5b9bd5" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Every day: dot + daily snowfall label */}
        {data.map((d, i) => (
          <g key={d.date}>
            <circle cx={x(i)} cy={y(d.total)} r="4" fill="#5b9bd5" stroke="white" strokeWidth="1.5" />
            <text
              x={x(i)}
              y={y(d.total) - 10}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill={d.daily > 0 ? "#1a1a2e" : "#bbb"}
            >
              {d.daily > 0 ? `+${d.daily}"` : "0"}
            </text>
          </g>
        ))}

        {/* Total label centered */}
        <text
          x={width / 2}
          y={padT - 6}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#1a1a2e"
        >
          7 Day Total: {data[data.length - 1].total}"
        </text>
      </svg>
    </div>
  );
}

export default SnowChart;
