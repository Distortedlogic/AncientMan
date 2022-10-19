import { GameObjects } from "phaser";
import type { GameScene } from "./scenes/GameScene";

export class CustomCollider extends GameObjects.Rectangle {
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
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }
}

export const calculateGameSize = () => {
  let width = 400;
  let height = 224; // 16 * 14 = 224
  const multiplier = Math.min(Math.floor(window.innerWidth / 400), Math.floor(window.innerHeight / 224)) || 1;
  if (multiplier > 1) {
    width += Math.floor((window.innerWidth - width * multiplier) / (16 * multiplier)) * 16;
    height += Math.floor((window.innerHeight - height * multiplier) / (16 * multiplier)) * 16;
  }
  return { width, height, multiplier };
};
