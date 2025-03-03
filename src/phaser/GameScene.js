import Phaser from "phaser";

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // Load assets
    this.load.image("table", "/assets/table.png"); // Table image
    this.load.spritesheet("player", "assets/character.png", {
      frameWidth: 17, // Adjust according to sprite size
      frameHeight: 18,
    });
    this.load.image("background", "/assets/preview.jpg"); // Background image
  }

  create() {
    // Add background
    this.add.image(400, 300, "background").setScale(2).setDepth(-1);

    // Add table as a physics object (so it has collision)
    this.table = this.physics.add.staticImage(400, 300, "table").setScale(3);

    // Add player with physics and enable collisions
    this.player = this.physics.add
      .sprite(17, 18, "player")
      .setScale(2)
      .setCollideWorldBounds(true);

    // Enable collision between player and table
    this.physics.add.collider(this.player, this.table);

    // Set up character animations
    this.anims.create({
      key: "walk-down",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    // Keyboard input for movement
    this.cursors = this.input.keyboard.createCursorKeys();
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
  }

  enterTable() {
    console.log("Player reached the table!");
    // Trigger chat or voice features when near the table
    this.scene.scene.events.emit("playerJoinedTable");
  }
}

export default GameScene;
