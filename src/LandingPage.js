import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { signInWithGoogle } from "./firebase";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      const token = await user.getIdToken();
      const response = await axios.post("http://localhost:5000/auth", {
        token,
      });

      console.log("User data:", response.data);
      navigate("/metaverse"); // Redirect to main screen
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to the 2D Metaverse</h1>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
};

export default LandingPage;
