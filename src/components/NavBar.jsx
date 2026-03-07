import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function NavBar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className="nav-link">Map</Link>
        <Link to="/feed" className="nav-link">Feed</Link>
        {user ? (
          <Link to={`/profile/${user.uid}`} className="nav-link">Profile</Link>
        ) : (
          <Link to="/login" className="nav-link">Log In</Link>
        )}
        <Link to="/mountains" className="nav-link">Mountains</Link>
      </div>
    </nav>
  );
}

export default NavBar;
