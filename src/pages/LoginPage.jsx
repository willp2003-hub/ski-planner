import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { useAuth } from "../contexts/AuthContext.jsx";

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate(`/profile/${user.uid}`, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = isSignUp ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
      const cred = await fn(auth, email, password);
      navigate(`/profile/${cred.user.uid}`);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      navigate(`/profile/${cred.user.uid}`);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>{isSignUp ? "Create Account" : "Log In"}</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div className="login-divider"><span>or</span></div>

        <button onClick={handleGoogle} className="btn-google" disabled={loading}>
          Continue with Google
        </button>

        <p className="login-toggle">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
