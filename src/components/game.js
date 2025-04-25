// Game.js
import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import GameScene from "../phaser/GameScene";
import ChatBox from "./chatbox";
import VoiceChat from "./voiceChat";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // adjust if deployed

const Game = () => {
  const [atTable, setAtTable] = useState(false);

  useEffect(() => {
    if (window.game) return;

    const config = {
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      parent: "game-container",
      physics: {
        default: "arcade",
        arcade: { debug: false },
      },
      scene: [GameScene],
    };

    // Make socket globally available to Phaser
    window.socket = socket;

    window.game = new Phaser.Game(config);

    const handleTableStatusChange = () =>
      setAtTable(window.gameState?.atTable || false);

    window.addEventListener("tableStatusChange", handleTableStatusChange);

    return () => {
      window.game.destroy(true);
      window.game = null;
      window.removeEventListener("tableStatusChange", handleTableStatusChange);
    };
  }, []);

  return (
    <div
      id="game-container"
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      {atTable && (
        <div style={{ position: "absolute", bottom: "20px", right: "20px" }}>
          <ChatBox />
          <VoiceChat />
        </div>
      )}
    </div>
  );
};

export default Game;
