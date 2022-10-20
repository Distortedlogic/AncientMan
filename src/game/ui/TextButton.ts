import { GameObjects, Types } from "phaser";
import type { GameScene } from "../scenes/GameScene";

export class TextButton extends GameObjects.Text {
  constructor(scene: GameScene, x: number, y: number, text: string, style: Types.GameObjects.Text.TextStyle) {
    super(scene, x, y, text, style);

    this.setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.enterHoverState())
      .on("pointerout", () => this.enterRestState())
      .on("pointerdown", () => this.enterActiveState())
      .on("pointerup", () => this.enterHoverState());

    this.scene.add.existing(this);
  }

  enterHoverState() {
    this.setStyle({ fill: "#ff0" });
  }

  enterRestState() {
    this.setStyle({ fill: "#0f0" });
  }

  enterActiveState() {
    this.setStyle({ fill: "#0ff" });
  }
}
