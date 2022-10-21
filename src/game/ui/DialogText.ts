import { GameObjects, Scene, Types } from "phaser";

export class DialogText extends GameObjects.Text {
  constructor(scene: Scene, x: number, y: number, text: string, style: Types.GameObjects.Text.TextStyle) {
    super(scene, x, y, text, style);
    this.scene.add.existing(this);
  }
}
