import React from "react";

function TripCard({ trip, isOwner, onEdit, onDelete }) {
  return (
    <div className="trip-card">
      <div className="ski-day-header">
        <div>
          <h4>{trip.resortName}</h4>
          <div className="trip-dates">
            {trip.skiingDates?.start && (
              <span>Skiing: {trip.skiingDates.start} → {trip.skiingDates.end}</span>
            )}
            {trip.lodgingDates?.start && (
              <span>Lodging: {trip.lodgingDates.start} → {trip.lodgingDates.end}</span>
            )}
          </div>
        </div>
        {trip.lodgingCost > 0 && (
          <span className="info-value">${trip.lodgingCost}</span>
        )}
      </div>

      {trip.groupMembers?.length > 0 && (
        <p className="ski-day-notes">Group: {trip.groupMembers.join(", ")}</p>
      )}

      {trip.notes && <p className="ski-day-notes">{trip.notes}</p>}

      {isOwner && (
        <div className="ski-day-actions">
          <button onClick={() => onEdit(trip)}>Edit</button>
          <button onClick={() => onDelete(trip.id)} className="btn-danger">Delete</button>
        </div>
      )}
    </div>
  );
}

export default TripCard;
