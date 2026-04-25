import React, { useMemo } from "react";

function SkiDaysCalendar({ posts }) {
  const today = new Date();
  const [year, month] = useMemo(() => [today.getFullYear(), today.getMonth()], []);

  const [viewYear, setViewYear] = React.useState(year);
  const [viewMonth, setViewMonth] = React.useState(month);

  const postsByDate = useMemo(() => {
    const map = {};
    posts.forEach((p) => {
      if (p.date) map[p.date] = p;
    });
    return map;
  }, [posts]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("default", { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="ski-calendar">
      <div className="ski-calendar-nav">
        <button type="button" onClick={prev}>&lsaquo;</button>
        <span className="ski-calendar-month">{monthLabel}</span>
        <button type="button" onClick={next}>&rsaquo;</button>
      </div>
      <div className="ski-calendar-grid">
        {dayNames.map((d) => (
          <div key={d} className="ski-calendar-dayname">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className="ski-calendar-cell empty" />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const post = postsByDate[dateStr];
          return (
            <div key={dateStr} className={`ski-calendar-cell${post ? " has-post" : ""}`}>
              <span className="ski-calendar-day">{day}</span>
              {post && (
                <div className="ski-calendar-post">
                  {post.photoUrls?.length > 0 ? (
                    <img src={post.photoUrls[0]} alt="" className="ski-calendar-photo" />
                  ) : post.userProfilePhotoUrl ? (
                    <img src={post.userProfilePhotoUrl} alt="" className="ski-calendar-photo" />
                  ) : null}
                  <span className="ski-calendar-resort">{post.resortName}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SkiDaysCalendar;
