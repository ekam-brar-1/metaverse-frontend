import React, { useEffect } from "react";
import Phaser from "phaser";
import GameScene from "../phaser/GameScene"; // Import your GameScene

const Game = () => {
  useEffect(() => {
    // Check if Phaser game already exists
    if (window.game) return;

    // Phaser game configuration
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "game-container", // This is where Phaser will render the game
      physics: {
        default: "arcade",
        arcade: { debug: false },
      },
      scene: [GameScene], // Load GameScene.js
    };

    // Create Phaser game
    window.game = new Phaser.Game(config);

    return () => {
      window.game.destroy(true);
      window.game = null;
    };
  }, []);

  return <div id="game-container" style={{ width: "100%", height: "100%" }} />;
};

export default Game;
