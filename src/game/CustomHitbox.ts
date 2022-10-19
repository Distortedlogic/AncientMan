import { GameObjects } from "phaser";
import { GameScene } from "./scenes/GameScene";

export class CustomHitbox extends GameObjects.Rectangle {
  scene: GameScene;
  body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    width: number,
    height: number,
    name: string,
    origin: { x: number; y: number } = { x: 0, y: 1 }
  ) {
    super(scene, x, y, width, height);
    this.name = name;
    this.setOrigin(origin.x, origin.y);
    if (this.scene.physics.config.debug) this.setFillStyle(0x741b47);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    scene.physics.add.existing(this);
  }
}
