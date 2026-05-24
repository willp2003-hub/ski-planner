import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function NavBar() {
  const { user } = useAuth();

  const navClass = ({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`;

  return (
    <nav className="navbar">
      <div className="nav-links">
        <NavLink to="/" end className={navClass}>Map</NavLink>
        <NavLink to="/feed" className={navClass}>Feed</NavLink>
        <Link to={user ? "/log" : "/login"} className="nav-add-btn">
          <span className="nav-add-icon">+</span>
        </Link>
        {user ? (
          <NavLink to={`/profile/${user.uid}`} className={navClass}>Profile</NavLink>
        ) : (
          <NavLink to="/login" className={navClass}>Log In</NavLink>
        )}
        <NavLink to="/mountains" className={navClass}>Mountains</NavLink>
      </div>
    </nav>
  );
}

export default NavBar;
