import Phaser from "phaser";

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.isAtTable = false;
    this.remotePlayers = {}; // ✅ Store other players by socket ID
  }

  preload() {
    this.load.image("table", "/assets/table.png");
    this.load.spritesheet("player", "assets/character.png", {
      frameWidth: 17,
      frameHeight: 18,
    });
    this.load.image("background", "/assets/preview.jpg");
  }

create() {
  this.add.image(400, 300, "background").setScale(2).setDepth(-1);
  window.gameState = { atTable: false };

this.mySocketId = null;
this.pendingPlayers = null;

  this.table = this.physics.add.staticImage(400, 300, "table").setScale(3);

  this.player = this.physics.add
    .sprite(400, 200, "player")
    .setScale(2)
    .setCollideWorldBounds(true);

  this.physics.add.collider(this.player, this.table);

  this.anims.create({
    key: "walk-down",
    frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "walk-left",
    frames: this.anims.generateFrameNumbers("player", { start: 4, end: 7 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "walk-right",
    frames: this.anims.generateFrameNumbers("player", { start: 8, end: 11 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "walk-up",
    frames: this.anims.generateFrameNumbers("player", { start: 12, end: 15 }),
    frameRate: 10,
    repeat: -1,
  });

  this.cursors = this.input.keyboard.createCursorKeys();

  // ✅ Add this line to prevent crash
  this.remotePlayers = {};

window.socket.emit("join-room", "global");

window.socket.on("connect", () => {
  this.mySocketId = window.socket.id;

  // Process any buffered updates
  if (this.pendingPlayers) {
    this.handlePlayersUpdate(this.pendingPlayers);
    this.pendingPlayers = null;
  }
});

window.socket.on("players-update", (players) => {
  if (!this.mySocketId) {
    this.pendingPlayers = players;
    return;
  }
  this.handlePlayersUpdate(players);
});
}



  update() {
    const speed = 150;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play("walk-left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play("walk-right", true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play("walk-up", true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play("walk-down", true);
    } else {
      this.player.anims.stop();
    }

    this.checkPlayerTableCollision();

    // 🔄 Emit position when moved enough
    const { x, y } = this.player;
    if (
      !this.lastSentPosition ||
      Phaser.Math.Distance.Between(x, y, this.lastSentPosition.x, this.lastSentPosition.y) > 5
    ) {
      window.socket.emit("player-move", { x, y });
      this.lastSentPosition = { x, y };
    }
  }

  checkPlayerTableCollision() {
    const playerBounds = this.player.getBounds();
    const tableBounds = this.table.getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, tableBounds)) {
      if (!this.isAtTable) {
        this.isAtTable = true;
        this.enterTable();
      }
    } else {
      if (this.isAtTable) {
        this.isAtTable = false;
        this.leaveTable();
      }
    }
  }
handlePlayersUpdate(players) {
  console.log("📦 players-update received:", players);
  console.log("🧠 mySocketId:", this.mySocketId);

  for (const id in players) {
    const { x, y } = players[id];

    if (id === this.mySocketId) {
      console.log("🛑 Skipping my own player:", id);
      continue;
    }

    console.log("👤 Rendering other player:", id, "at", x, y);

    if (this.remotePlayers[id]) {
      this.remotePlayers[id].x = x;
      this.remotePlayers[id].y = y;
    } else {
      console.log("✨ Creating new sprite for:", id);
      const sprite = this.add.sprite(x, y, "player").setScale(2);
      this.remotePlayers[id] = sprite;
    }
  }

  for (const id in this.remotePlayers) {
    if (!players[id]) {
      this.remotePlayers[id].destroy();
      delete this.remotePlayers[id];
    }
  }
}



  enterTable() {
    window.gameState.atTable = true;
    window.dispatchEvent(new Event("tableStatusChange"));
  }

  leaveTable() {
    window.gameState.atTable = false;
    window.dispatchEvent(new Event("tableStatusChange"));
  }
}

export default GameScene;
