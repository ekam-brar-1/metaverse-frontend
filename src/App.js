import React from "react";
import { Routes, Route } from "react-router-dom"; // No BrowserRouter here!
import LandingPage from "./LandingPage";
import MetaverseScreen from "./MetaverseScreen";
import Game from "./components/game";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/metaverse" element={<Game />} />
    </Routes>
  );
};

export default App;
