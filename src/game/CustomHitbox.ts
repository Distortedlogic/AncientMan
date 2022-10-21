import { GameObjects } from "phaser";
import { GameScene } from "./scenes/GameScene";

export class CustomHitbox extends GameObjects.Zone {
  scene: GameScene;
  body: Phaser.Physics.Arcade.Body;

  constructor(scene: GameScene, x: number, y: number, width: number, height: number, name: string) {
    super(scene, x, y, width, height);
    this.name = name;
    scene.physics.add.existing(this);
  }

  // create() {
  //   this.body.setAllowGravity(false);
  //   this.body.setImmovable(true);
  // }
}
