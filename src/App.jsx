import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MountainsPage from "./pages/MountainsPage.jsx";
import MountainInfoPage from "./pages/MountainInfoPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import LogSkiDayPage from "./pages/LogSkiDayPage.jsx";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/log" element={<LogSkiDayPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/mountains" element={<MountainsPage />} />
        <Route path="/mountains/:mountainId" element={<MountainInfoPage />} />
      </Routes>
      <NavBar />
    </div>
  );
}

export default App;
